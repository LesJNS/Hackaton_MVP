import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Landing from './pages/Landing'
import Login from './pages/Login'
import CandidateDashboard from './pages/CandidateDashboard'
import CandidateProfile from './pages/CandidateProfile'
import ChallengesFeed from './pages/ChallengesFeed'
import ChallengeDetail from './pages/ChallengeDetail'
import PeerValidation from './pages/PeerValidation'
import EmployerDashboard from './pages/EmployerDashboard'
import SkillTests from './pages/SkillTests'
import SkillTestDetail from './pages/SkillTestDetail'
import MiniChallenges from './pages/MiniChallenges'

function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, role } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'employer' ? '/employer' : '/dashboard'} replace />
  }
  return children
}

function AppShell() {
  const { currentUser } = useApp()

  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        {/* Public pages with no persistent navbar */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Public profile — minimal navbar */}
        <Route path="/profile/:id" element={
          <>
            {currentUser && <Navbar />}
            <div className="flex-1">
              <CandidateProfile />
            </div>
            <Footer />
          </>
        } />

        {/* Candidate routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="candidate">
            <Navbar />
            <div className="flex-1"><CandidateDashboard /></div>
            <Footer />
          </ProtectedRoute>
        } />
        <Route path="/challenges" element={
          <ProtectedRoute requiredRole="candidate">
            <Navbar />
            <div className="flex-1"><ChallengesFeed /></div>
            <Footer />
          </ProtectedRoute>
        } />
        <Route path="/challenges/:id" element={
          <ProtectedRoute requiredRole="candidate">
            <Navbar />
            <div className="flex-1"><ChallengeDetail /></div>
            <Footer />
          </ProtectedRoute>
        } />
        <Route path="/validate" element={
          <ProtectedRoute requiredRole="candidate">
            <Navbar />
            <div className="flex-1"><PeerValidation /></div>
            <Footer />
          </ProtectedRoute>
        } />
        <Route path="/skill-tests" element={
          <ProtectedRoute requiredRole="candidate">
            <Navbar />
            <div className="flex-1"><SkillTests /></div>
            <Footer />
          </ProtectedRoute>
        } />
        <Route path="/skill-tests/:id" element={
          <ProtectedRoute requiredRole="candidate">
            <Navbar />
            <div className="flex-1"><SkillTestDetail /></div>
            <Footer />
          </ProtectedRoute>
        } />
        <Route path="/mini-challenges" element={
          <ProtectedRoute requiredRole="candidate">
            <Navbar />
            <div className="flex-1"><MiniChallenges /></div>
            <Footer />
          </ProtectedRoute>
        } />

        {/* Employer routes */}
        <Route path="/employer" element={
          <ProtectedRoute requiredRole="employer">
            <Navbar />
            <div className="flex-1"><EmployerDashboard /></div>
            <Footer />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  )
}
