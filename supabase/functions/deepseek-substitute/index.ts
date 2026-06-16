// deepseek-substitute — the ONLY place the DeepSeek API key is used.
// Verifies the user's JWT, enforces a server-side 5/user/day limit, validates a
// strictly non-personal input, calls DeepSeek, and returns exactly 3 alternatives.
// Never returns the key, the prompt internals, or raw model/errors.
// See /supabase/AGENTS.md §5, §9.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const DAILY_LIMIT = 5;
const ALLOWED_REASONS = ['equipment_busy', 'no_equipment', 'too_hard', 'too_easy'];

const SYSTEM_PROMPT =
  'You suggest substitute gym exercises. Given an exercise and optional available ' +
  'equipment, return exactly 3 alternatives that train the same primary movement ' +
  'pattern and the same main muscle groups. Respond with ONLY valid JSON, no ' +
  'markdown, no commentary.';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Alternative {
  name: string;
  equipment: string;
  why: string;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json(401, { error: 'Missing authorization' });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!supabaseUrl || !anonKey || !serviceKey || !deepseekKey) {
      return json(500, { error: 'Service not configured' });
    }

    // Resolve the user from their JWT.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) return json(401, { error: 'Invalid session' });

    // Validate + sanitize input. Strictly non-personal: exercise name, optional
    // equipment, and a reason from a fixed list (never free text / health data).
    const body = await req.json().catch(() => null);
    const exercise =
      typeof body?.exercise === 'string' ? body.exercise.trim().slice(0, 80) : '';
    const equipment =
      typeof body?.equipment === 'string' ? body.equipment.trim().slice(0, 60) : '';
    const reason = ALLOWED_REASONS.includes(body?.reason) ? (body.reason as string) : '';
    if (exercise.length === 0) return json(400, { error: 'Exercise is required' });

    // Server-side rate limit (service role bypasses RLS; clients can't write this).
    const admin = createClient(supabaseUrl, serviceKey);
    const today = new Date().toISOString().slice(0, 10);
    const { data: usageRow } = await admin
      .from('ai_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('usage_date', today)
      .maybeSingle();
    const used = usageRow?.count ?? 0;
    if (used >= DAILY_LIMIT) return json(429, { error: 'Daily AI limit reached' });

    const alternatives = await callDeepSeek(deepseekKey, exercise, equipment, reason);
    if (!alternatives) return json(502, { error: 'Could not get suggestions' });

    await admin
      .from('ai_usage')
      .upsert(
        { user_id: user.id, usage_date: today, count: used + 1 },
        { onConflict: 'user_id,usage_date' },
      );

    return json(200, { alternatives, remaining: Math.max(0, DAILY_LIMIT - (used + 1)) });
  } catch {
    return json(500, { error: 'Server error' });
  }
});

async function callDeepSeek(
  key: string,
  exercise: string,
  equipment: string,
  reason: string,
): Promise<Alternative[] | null> {
  const userPrompt =
    `Exercise: ${exercise}` +
    (equipment ? `\nAvailable equipment: ${equipment}` : '') +
    (reason ? `\nReason for swap: ${reason.replace('_', ' ')}` : '') +
    '\nReturn JSON exactly like {"alternatives":[{"name":"","equipment":"","why":""}]} ' +
    'with exactly 3 items.';

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          stream: false,
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      const parsed = parseAlternatives(content);
      if (parsed) return parsed;
    } catch {
      // retry once
    }
  }
  return null;
}

function parseAlternatives(content: unknown): Alternative[] | null {
  if (typeof content !== 'string') return null;
  const cleaned = content.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    const obj = JSON.parse(cleaned);
    const alts = obj?.alternatives;
    if (!Array.isArray(alts) || alts.length !== 3) return null;
    const mapped: Alternative[] = [];
    for (const a of alts) {
      if (typeof a?.name !== 'string' || a.name.trim().length === 0) return null;
      mapped.push({
        name: String(a.name).slice(0, 80),
        equipment: String(a.equipment ?? '').slice(0, 60),
        why: String(a.why ?? '').slice(0, 160),
      });
    }
    return mapped;
  } catch {
    return null;
  }
}
