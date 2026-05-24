import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CANDIDATES } from '../data/mockData'
import ScoreRing from '../components/ScoreRing'
import SkillBadge from '../components/SkillBadge'
import { MapPin, GraduationCap, Star, Users, CheckCircle, Share2, ExternalLink, MessageSquare, Send, ChevronDown, ChevronUp, Video, FlaskConical } from 'lucide-react'
import { useApp } from '../context/AppContext'

const LEVEL_COLORS = {
  Avanzado: 'text-red-700 bg-red-50 border-red-300',
  Intermedio: 'text-yellow-700 bg-yellow-50 border-yellow-300',
  Básico: 'text-green-700 bg-green-50 border-green-300',
}

export default function CandidateProfile() {
  const { id } = useParams()
  const candidate = CANDIDATES.find(c => c.id === id) || CANDIDATES[0]
  const { role, testFeedbacks, addTestFeedback } = useApp()

  const [feedbackDrafts, setFeedbackDrafts] = useState({})
  const [expandedFeedback, setExpandedFeedback] = useState({})
  const [submittedFeedback, setSubmittedFeedback] = useState({})

  const candidateTestResults = candidate.testResults || []

  function copyLink() {
    navigator.clipboard?.writeText(window.location.href)
      .then(() => alert('Enlace copiado'))
  }

  function toggleFeedbackPanel(key) {
    setExpandedFeedback(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleDraftChange(key, text) {
    setFeedbackDrafts(prev => ({ ...prev, [key]: text }))
  }

  function handleSubmitFeedback(key) {
    const text = feedbackDrafts[key]?.trim()
    if (!text) return
    addTestFeedback(key, text)
    setSubmittedFeedback(prev => ({ ...prev, [key]: true }))
    setFeedbackDrafts(prev => ({ ...prev, [key]: '' }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 page-enter">
      {/* Header card */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className={`w-20 h-20 ${candidate.avatarColor} rounded-3xl flex items-center justify-center text-white font-black text-3xl flex-shrink-0 shadow-md`}>
            {candidate.initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-palette-text-primary">{candidate.name}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-palette-text-small">
              <span className="flex items-center gap-1.5"><GraduationCap size={14} /> {candidate.career}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {candidate.location}</span>
              <span className="text-palette-button-primary font-medium">{candidate.year}</span>
            </div>
            {candidateTestResults.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {candidateTestResults.map(r => (
                  <span key={r.testId} className="inline-flex items-center gap-1 text-xs bg-palette-fonto-light border border-palette-button-primary text-palette-text-primary px-2.5 py-1 rounded-full font-semibold">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="11" fill="#2563eb" />
                      <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {r.skill} — {r.level}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-3 text-sm text-palette-text-small leading-relaxed max-w-lg">{candidate.bio}</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <ScoreRing score={candidate.score} size="md" />
            <button
              onClick={copyLink}
              className="flex items-center gap-2 text-xs text-palette-text-small hover:text-palette-button-primary transition-colors"
            >
              <Share2 size={13} /> Compartir perfil
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Retos completados', value: candidate.challengesCompleted, icon: <CheckCircle size={16} className="text-palette-button-primary" /> },
            { label: 'Validaciones recibidas', value: candidate.validationsReceived, icon: <Users size={16} className="text-palette-wt-accent" /> },
            { label: 'Sellos de habilidad', value: candidate.badges.length, icon: <Star size={16} className="text-palette-button-primary" /> },
          ].map((s, i) => (
            <div key={i}>
              <div className="flex justify-center mb-1">{s.icon}</div>
              <div className="text-xl font-black text-palette-text-primary">{s.value}</div>
              <div className="text-xs text-palette-text-small">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Video presentation */}
      {candidate.videoUrl && (
        <div className="card mb-6 border border-palette-button-primary">
          <h2 className="font-bold text-palette-text-primary mb-3 flex items-center gap-2">
            <Video size={18} className="text-palette-button-primary" />
            Video de presentación
          </h2>
          <div className="p-3 bg-palette-fonto-light rounded-xl">
            <p className="text-sm text-palette-text-small mb-3">
              {candidate.name.split(' ')[0]} compartió un video de presentación personal.
            </p>
            <a
              href={candidate.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-palette-button-primary font-semibold text-sm hover:text-palette-text-primary transition-colors"
            >
              <ExternalLink size={14} /> Ver video de presentación →
            </a>
          </div>
        </div>
      )}

      {/* Score breakdown */}
      <div className="card mb-6">
        <h2 className="font-bold text-palette-text-primary mb-4">Composición del Score de Reputación</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Evaluación de IA', pct: candidate.scoreBreakdown.ai, color: 'bg-palette-text-primary', textColor: 'text-palette-text-primary', desc: 'Calidad de soluciones a retos empresariales' },
            { label: 'Validación entre pares', pct: candidate.scoreBreakdown.peers, color: 'bg-palette-button-primary', textColor: 'text-palette-button-primary', desc: 'Avales ponderados por reputación del validador' },
            { label: 'Portafolio', pct: candidate.scoreBreakdown.portfolio, color: 'bg-palette-wt-accent', textColor: 'text-palette-wt-accent', desc: 'Variedad y consistencia de proyectos' },
          ].map((item, i) => (
            <div key={i} className="bg-palette-fonto-light rounded-xl p-4">
              <div className={`text-3xl font-black ${item.textColor} mb-1`}>{item.pct}%</div>
              <div className="font-semibold text-palette-text-primary text-sm mb-1">{item.label}</div>
              <div className="text-xs text-palette-text-small">{item.desc}</div>
              <div className="mt-3 h-2 bg-slate-200 rounded-full">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test results */}
      {candidateTestResults.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-palette-text-primary mb-4 flex items-center gap-2">
            <FlaskConical size={18} className="text-blue-600" />
            Pruebas de Nivel Verificadas
          </h2>
          <div className="space-y-3">
            {candidateTestResults.map(r => {
              const existingFeedback = testFeedbacks[r.testId]
              const isExpanded = expandedFeedback[r.testId]
              const draft = feedbackDrafts[r.testId] || ''
              const wasJustSubmitted = submittedFeedback[r.testId]

              return (
                <div key={r.testId} className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between gap-3 p-4 bg-palette-fonto-light">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{r.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-palette-text-primary">{r.skill}</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="11" fill="#2563eb" />
                            <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${LEVEL_COLORS[r.level] || 'text-slate-700 bg-slate-50 border-slate-300'}`}>
                            {r.level}
                          </span>
                        </div>
                        <div className="text-xs text-palette-text-small mt-0.5">
                          {r.score}/{r.total} correctas · {r.pct}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:block w-24">
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${r.pct >= 75 ? 'bg-red-500' : r.pct >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${r.pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-palette-text-small mt-1 text-right">{r.pct}%</p>
                      </div>
                      {role === 'employer' && (
                        <button
                          onClick={() => toggleFeedbackPanel(r.testId)}
                          className="flex items-center gap-1 text-xs text-palette-button-primary hover:opacity-75 transition-opacity font-medium"
                        >
                          <MessageSquare size={13} />
                          Feedback
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {role === 'employer' && isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                      {existingFeedback && (
                        <div className="mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-xs font-semibold text-blue-700 mb-1">
                            Feedback de {existingFeedback.givedBy}
                          </div>
                          <p className="text-sm text-blue-900">{existingFeedback.text}</p>
                          <div className="text-xs text-blue-500 mt-1">
                            {new Date(existingFeedback.givenAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      )}
                      {wasJustSubmitted && !existingFeedback && (
                        <div className="mb-3 p-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
                          Feedback enviado correctamente.
                        </div>
                      )}
                      <textarea
                        rows={3}
                        value={draft}
                        onChange={e => handleDraftChange(r.testId, e.target.value)}
                        placeholder={existingFeedback ? 'Actualizar feedback...' : 'Escribe tu comentario sobre esta prueba de nivel...'}
                        className="w-full text-sm border border-slate-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-palette-button-primary/40 placeholder:text-slate-400"
                      />
                      <button
                        onClick={() => handleSubmitFeedback(r.testId)}
                        disabled={!draft.trim()}
                        className="mt-2 flex items-center gap-1.5 bg-palette-button-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                      >
                        <Send size={12} />
                        {existingFeedback ? 'Actualizar' : 'Enviar feedback'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Skill badges */}
      <div className="card mb-6">
        <h2 className="font-bold text-palette-text-primary mb-4">Sellos de Habilidad Verificados</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {candidate.badges.map(b => (
            <div key={b.id} className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 p-3 bg-palette-fonto-light">
                <CheckCircle size={15} className="text-palette-button-primary flex-shrink-0" />
                <span className="text-sm font-semibold text-palette-text-primary">
                  {b.skill} — {b.level}
                </span>
              </div>
              <div className="p-2">
                <SkillBadge skill={b.skill} level={b.level} icon={b.icon} source={b.source} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio */}
      <div className="card mb-6">
        <h2 className="font-bold text-palette-text-primary mb-4">Proyectos en Portafolio</h2>
        <div className="space-y-4">
          {candidate.projects.map(p => (
            <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-palette-button-primary transition-colors">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-palette-text-primary">{p.title}</h3>
                <div className="flex items-center gap-1 text-palette-button-primary text-xs font-semibold flex-shrink-0">
                  <Star size={12} fill="currentColor" />
                  {p.stars}
                </div>
              </div>
              <p className="text-sm text-palette-text-small mt-2 leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.tags.map(t => (
                  <span key={t} className="text-xs bg-palette-fonto-light border border-palette-button-primary text-palette-text-primary px-2.5 py-1 rounded-full font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA for employer */}
      <div className="card bg-gradient-to-r from-palette-text-primary to-palette-button-primary text-white text-center">
        <h3 className="font-bold text-lg mb-2">¿Este candidato te interesa?</h3>
        <p className="text-white/80 text-sm mb-4">Contáctalo directamente o descubre más talentos verificados.</p>
        <div className="flex justify-center gap-3 flex-wrap">
          <button className="bg-white text-palette-text-primary hover:opacity-90 font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md">
            Contactar candidato
          </button>
          <Link to="/employer" className="bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
            <ExternalLink size={14} />
            Ver más candidatos
          </Link>
        </div>
      </div>
    </div>
  )
}
