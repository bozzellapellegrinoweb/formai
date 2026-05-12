export const mockUser = {
  id: 'mock-user-001',
  name: 'Marco',
  age: 30,
  weight_kg: 82,
  height_cm: 180,
  goal: 'massa' as const,
  workout_type: 'palestra',
  workouts_per_week: 5,
  intolerances: [] as string[],
  preferences: ['cucina italiana', 'pasti pratici'],
  streak: 7,
  avatar_initials: 'MA',
}

export const mockTodayWorkout = {
  type: 'gambe',
  label: 'Gambe — Quadricipiti + Femorali + Glutei',
  muscoli: ['Quadricipiti', 'Femorali', 'Glutei', 'Polpacci', 'Core'],
  kcal_bonus: 220,
  carb_bonus: 40,
  durata_min: 65,
  esercizi: 8,
  streak: 7,
  note: '+40g carb pre-allenamento · Cardio LISS 15min finale · Core incluso',
}

export const mockTodayMacros = {
  kcal_target: 1840,
  kcal_consumed: 0,
  proteine: 185,
  carboidrati: 220,
  grassi: 62,
  proteine_consumed: 0,
  carboidrati_consumed: 0,
  grassi_consumed: 0,
}
