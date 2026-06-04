import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

/**
 * Lock resiliente per l'auth di Supabase.
 *
 * Di default supabase-js usa la Web Locks API (`navigator.locks`) per
 * coordinare il refresh del token. In contesti PWA standalone / browser
 * mobile capita che l'acquisizione del lock resti appesa indefinitamente,
 * bloccando `getSession()` e quindi l'intera schermata di caricamento.
 *
 * Qui mettiamo un tetto al tempo di attesa: se non riusciamo ad acquisire
 * il lock entro il timeout (o l'API non è disponibile) eseguiamo comunque
 * la callback, così l'app non resta mai bloccata sull'animazione.
 */
async function resilientLock<R>(
  name: string,
  acquireTimeout: number,
  fn: () => Promise<R>,
): Promise<R> {
  if (typeof navigator === 'undefined' || !navigator.locks) {
    return fn()
  }

  // Non aspettare mai più di 5s: oltre, procedi senza lock.
  const maxWait = acquireTimeout >= 0 ? Math.min(acquireTimeout, 5000) : 5000
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), maxWait)

  try {
    return await navigator.locks.request(
      name,
      { signal: controller.signal },
      async () => fn(),
    )
  } catch {
    // Lock non acquisito in tempo (AbortError) o errore della Web Locks API:
    // meglio eseguire senza lock che restare appesi.
    return fn()
  } finally {
    clearTimeout(timer)
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    lock: resilientLock,
  },
})
