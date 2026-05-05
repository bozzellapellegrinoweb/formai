import {
  Coffee, Utensils, Apple, Moon,
  Dumbbell, Activity, Bed, ArrowUp, ArrowDown,
  RotateCcw, Bike, PersonStanding, Layers,
  Camera, Bot, Flame, Target, Ruler, Zap,
  Bell, Settings, Globe, Users, Star, MessageSquare,
  Sparkles, ChevronRight, Check, X,
  Pencil, Share2, Trophy,
} from 'lucide-react'

export {
  Coffee, Utensils, Apple, Moon,
  Dumbbell, Activity, Bed,
  Camera, Bot, Flame, Target, Ruler, Zap,
  Bell, Settings, Globe, Users, Star, MessageSquare,
  Sparkles, ChevronRight, Check, X,
  Pencil, Share2, Trophy,
}

type MealType = 'colazione' | 'pranzo' | 'spuntino' | 'cena'
export type WorkoutType =
  | 'push' | 'pull' | 'gambe' | 'full_body' | 'upper' | 'lower'
  | 'cardio' | 'riposo' | 'riposo_attivo' | string

export function MealIcon({ type, size = 18, color = 'currentColor' }: { type: MealType; size?: number; color?: string }) {
  const props = { size, color, strokeWidth: 1.6 }
  if (type === 'colazione') return <Coffee {...props} />
  if (type === 'pranzo')    return <Utensils {...props} />
  if (type === 'spuntino')  return <Apple {...props} />
  return <Moon {...props} />
}

export function WorkoutIcon({ type, size = 18, color = 'currentColor' }: { type: WorkoutType; size?: number; color?: string }) {
  const props = { size, color, strokeWidth: 1.6 }
  if (type === 'push')          return <ArrowUp {...props} />
  if (type === 'pull')          return <ArrowDown {...props} />
  if (type === 'gambe' || type === 'lower') return <PersonStanding {...props} />
  if (type === 'full_body')     return <Layers {...props} />
  if (type === 'upper')         return <Dumbbell {...props} />
  if (type === 'cardio')        return <Activity {...props} />
  if (type === 'riposo_attivo') return <Bike {...props} />
  if (type === 'riposo')        return <Bed {...props} />
  return <RotateCcw {...props} />
}
