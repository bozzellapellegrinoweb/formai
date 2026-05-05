import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SplashScreen from './screens/SplashScreen'
import LoginScreen from './screens/LoginScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import HomeScreen from './screens/HomeScreen'
import PlanScreen from './screens/PlanScreen'
import ChatScreen from './screens/ChatScreen'
import WorkoutScreen from './screens/WorkoutScreen'
import DiaryScreen from './screens/DiaryScreen'
import ProfileScreen from './screens/ProfileScreen'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/piano" element={<PlanScreen />} />
          <Route path="/chat" element={<ChatScreen />} />
          <Route path="/workout" element={<WorkoutScreen />} />
          <Route path="/diario" element={<DiaryScreen />} />
          <Route path="/profilo" element={<ProfileScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
