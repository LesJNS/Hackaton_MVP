import { createContext, useContext, useState } from 'react'
import { CANDIDATES } from '../data/mockData'

const AppContext = createContext(null)

const INITIAL_TEST_RESULTS = {
  'u1': [
    { id: 'tr-u1-excel', userId: 'u1', testId: 'test-excel', skill: 'Excel', level: 'Avanzado', score: 18, total: 20, pct: 92, completedAt: '2024-03-15T10:00:00.000Z' },
    { id: 'tr-u1-python', userId: 'u1', testId: 'test-python', skill: 'Python', level: 'Avanzado', score: 17, total: 20, pct: 85, completedAt: '2024-03-10T10:00:00.000Z' },
  ],
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [role, setRole] = useState(null)
  const [completedChallenges, setCompletedChallenges] = useState([])
  const [earnedBadges, setEarnedBadges] = useState([])
  const [testResults, setTestResults] = useState([])
  const [testFeedbacks, setTestFeedbacks] = useState({})
  const [miniChallengeSubmissions, setMiniChallengeSubmissions] = useState([])
  const [challengeSubmissions, setChallengeSubmissions] = useState([])
  const [videoUrl, setVideoUrl] = useState(null)

  function loginAsCandidate(userId = 'u1') {
    const user = CANDIDATES.find(c => c.id === userId) || CANDIDATES[0]
    setCurrentUser(user)
    setRole('candidate')
    setTestResults(INITIAL_TEST_RESULTS[user.id] || [])
  }

  function loginAsEmployer() {
    setCurrentUser({ id: 'emp1', name: 'Recursos Humanos BCP', company: 'BCP', initials: 'BC' })
    setRole('employer')
  }

  function logout() {
    setCurrentUser(null)
    setRole(null)
    setTestResults([])
    setTestFeedbacks({})
  }

  function addCompletedChallenge(challenge, result) {
    setCompletedChallenges(prev => [{ ...challenge, result, completedAt: new Date().toISOString() }, ...prev])
    if (result.badge) {
      setEarnedBadges(prev => [result.badge, ...prev])
    }
  }

  function addPeerValidation() {}

  function saveTestResult(testId, skill, score, totalQuestions, answerData = null) {
    const pct = Math.round((score / totalQuestions) * 100)
    const level = pct >= 75 ? 'Avanzado' : pct >= 50 ? 'Intermedio' : 'Basico'
    const result = { testId, skill, level, score, total: totalQuestions, pct, completedAt: new Date().toISOString(), answerData }
    setTestResults(prev => {
      const filtered = prev.filter(r => r.testId !== testId)
      return [result, ...filtered]
    })
    return result
  }

  function addTestFeedback(testId, feedbackText) {
    setTestFeedbacks(prev => ({
      ...prev,
      [testId]: { text: feedbackText, givedBy: 'Recursos Humanos BCP', givenAt: new Date().toISOString() }
    }))
  }

  function saveVideoUrl(url) {
    setVideoUrl(url || null)
  }

  function addMiniChallengeSubmission(challenge, description, githubLink) {
    const submission = {
      id: 'sub-user-' + Date.now(),
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      description,
      githubLink,
      submittedAt: new Date().toISOString(),
      feedback: null,
    }
    setMiniChallengeSubmissions(prev => [submission, ...prev])
    return submission
  }

  function addChallengeSubmission(challenge, description, githubLink) {
    const submission = {
      id: 'sub-main-' + Date.now(),
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      candidateName: currentUser?.name,
      candidateInitials: currentUser?.initials,
      candidateAvatarColor: currentUser?.avatarColor,
      candidateScore: currentUser?.score,
      description,
      githubLink,
      submittedAt: new Date().toISOString(),
      feedback: null,
    }
    setChallengeSubmissions(prev => [submission, ...prev])
    return submission
  }

  function addFeedbackToSubmission(submissionId, feedbackText, rating) {
    const update = (prev) => prev.map(s =>
      s.id === submissionId
        ? { ...s, feedback: { text: feedbackText, rating, givenBy: currentUser?.name || 'BCP - RRHH', givenAt: new Date().toISOString() } }
        : s
    )
    setChallengeSubmissions(update)
    setMiniChallengeSubmissions(update)
  }

  return (
    <AppContext.Provider value={{
      currentUser, role,
      completedChallenges, earnedBadges,
      testResults, testFeedbacks,
      miniChallengeSubmissions, challengeSubmissions,
      videoUrl,
      loginAsCandidate, loginAsEmployer, logout,
      addCompletedChallenge, addPeerValidation,
      saveTestResult, addTestFeedback,
      addMiniChallengeSubmission, addChallengeSubmission, addFeedbackToSubmission,
      saveVideoUrl,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
