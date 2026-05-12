import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getSavedTheme, applyTheme } from './design/themes'
import LandingPage from './screens/LandingPage'
import SplashScreen from './screens/SplashScreen'
import LoginScreen from './screens/LoginScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import HomeScreen from './screens/HomeScreen'
import PlanScreen from './screens/PlanScreen'
import ChatScreen from './screens/ChatScreen'
import WorkoutScreen from './screens/WorkoutScreen'
import DiaryScreen from './screens/DiaryScreen'
import ProfileScreen from './screens/ProfileScreen'
import AdminScreen from './screens/AdminScreen'
import InstallPrompt from './components/InstallPrompt'
import BottomNav from './components/ui/BottomNav'
import { useAuth } from './lib/auth'

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
}

const INSTALL_EXCLUDED = ['/', '/start', '/login', '/onboarding']

function InstallPromptWrapper() {
  const location = useLocation()
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  if (isStandalone()) return null
  if (INSTALL_EXCLUDED.includes(location.pathname)) return null
  return <InstallPrompt onDismiss={() => setDismissed(true)} />
}

const queryClient = new QueryClient()

function AppLoader() {
  return (
    <div style={{
      height: '100svh', background: '#0e1008',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 24,
    }}>
      {/* Animated logo badge */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer pulsing ring */}
        <div style={{
          position: 'absolute',
          width: 72, height: 72, borderRadius: '50%',
          border: '1.5px solid rgba(234,255,85,0.25)',
          animation: 'pulse-ring 1.8s ease-in-out infinite',
        }} />
        {/* Inner ring */}
        <div style={{
          position: 'absolute',
          width: 58, height: 58, borderRadius: '50%',
          border: '1px solid rgba(234,255,85,0.12)',
        }} />
        {/* Core badge */}
        <div style={{
          width: 46, height: 46, borderRadius: '50%',
          background: '#EAFF55',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse-badge 1.8s ease-in-out infinite',
        }}>
          <span style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 18, fontWeight: 800, color: '#0a0d00',
            lineHeight: 1,
          }}>f</span>
        </div>
      </div>
      {/* Wordmark */}
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.2px' }}>
          forma<span style={{ color: '#EAFF55' }}>.ai</span>
        </span>
      </div>
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.12); opacity: 0.15; }
        }
        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(234,255,85,0.35); }
          50% { transform: scale(0.96); box-shadow: 0 0 0 10px rgba(234,255,85,0); }
        }
      `}</style>
    </div>
  )
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <AppLoader />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

/** Layout con BottomNav fisso — usato per tutte le route autenticate che hanno la nav */
function NavLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      <BottomNav />
    </>
  )
}

export default function App() {
  // Ensure CSS vars match localStorage on React mount (covers HMR reloads)
  useEffect(() => { applyTheme(getSavedTheme()) }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <InstallPromptWrapper />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/start" element={<SplashScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/onboarding" element={<PrivateRoute><OnboardingScreen /></PrivateRoute>} />
          <Route path="/home" element={<PrivateRoute><NavLayout><HomeScreen /></NavLayout></PrivateRoute>} />
          <Route path="/piano" element={<PrivateRoute><NavLayout><PlanScreen /></NavLayout></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><NavLayout><ChatScreen /></NavLayout></PrivateRoute>} />
          <Route path="/workout" element={<PrivateRoute><NavLayout><WorkoutScreen /></NavLayout></PrivateRoute>} />
          <Route path="/diario" element={<PrivateRoute><NavLayout><DiaryScreen /></NavLayout></PrivateRoute>} />
          <Route path="/profilo" element={<PrivateRoute><NavLayout><ProfileScreen /></NavLayout></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><NavLayout><AdminScreen /></NavLayout></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
