/**
 * Built-in starter routines so a new user can hit Play in seconds instead of facing
 * an empty app. Static data — adding one clones it into the user's own routines.
 * Bodyweight / no-equipment circuits, tuned for the guided runner.
 */
export interface RoutineTemplate {
  id: string;
  name: string;
  description: string;
  workSeconds: number;
  restSeconds: number;
  rounds: number;
  exercises: string[];
}

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: 'full-body-express',
    name: 'Full Body Express',
    description: 'Quick total-body sweat, no equipment.',
    workSeconds: 40,
    restSeconds: 20,
    rounds: 3,
    exercises: ['Jumping jacks', 'Push-ups', 'Squats', 'Plank', 'Mountain climbers'],
  },
  {
    id: 'core-crusher',
    name: 'Core Crusher',
    description: 'Abs and core focus.',
    workSeconds: 30,
    restSeconds: 15,
    rounds: 3,
    exercises: ['Crunches', 'Plank', 'Leg raises', 'Russian twists', 'Bicycle crunches'],
  },
  {
    id: 'quick-cardio',
    name: 'Quick Cardio',
    description: 'Get the heart rate up fast.',
    workSeconds: 45,
    restSeconds: 15,
    rounds: 4,
    exercises: ['High knees', 'Burpees', 'Jumping jacks', 'Squat jumps'],
  },
  {
    id: 'no-equipment-strength',
    name: 'No-Equipment Strength',
    description: 'Build strength with bodyweight only.',
    workSeconds: 40,
    restSeconds: 25,
    rounds: 3,
    exercises: ['Push-ups', 'Lunges', 'Pike push-ups', 'Glute bridges', 'Superman'],
  },
];
