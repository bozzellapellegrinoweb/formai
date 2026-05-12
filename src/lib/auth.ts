import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'https://forma-ai-e33e5.web.app/home',
    },
  })
  return { data, error }
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/home`,
    },
  })
  return { data, error }
}

export async function getProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

export async function saveOnboarding(userId: string, payload: {
  sesso: string
  obiettivo: string
  peso_kg: number | null
  peso_target_kg: number | null
  altezza_cm: number | null
  eta: number | null
  livello_attivita: string
  luogo_allenamento: string
  frequenza_allenamento: number
  obiettivo_workout: string
  pasti_al_giorno: number
  ore_sonno: number
  livello_stress: string
  preferenze_alimentari: string[]
  intolleranze: string[]
  cibi_non_graditi: string
}) {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    ...payload,
    onboarding_done: true,
    updated_at: new Date().toISOString(),
  })
  return { error }
}

export async function savePianoAI(userId: string, piano: object[], macros_target: object) {
  const { error } = await supabase.from('profiles').update({
    piano_ai: piano,
    macros_target,
    updated_at: new Date().toISOString(),
  }).eq('id', userId)
  return { error }
}
