import { useState } from 'react'
import { CANDIDATES, CHALLENGES, CHALLENGE_SUBMISSIONS, MINI_CHALLENGES, SKILL_TESTS } from '../data/mockData'
import { useApp } from '../context/AppContext'
import CandidateCard from '../components/CandidateCard'
import { Search, Filter, Plus, X, CheckCircle, TrendingUp, Users, Briefcase, Star, MessageSquare, Github, FlaskConical, Video, ExternalLink, ChevronDown, ChevronUp, Award } from 'lucide-react'

const SKILLS = ['Todas', 'Análisis de Datos', 'Diseño UX', 'Estrategia de Negocio', 'Gestión de Proyectos', 'Marketing Digital']

const LEVEL_COLORS = {
  Básico: 'bg-green-100 text-green-700 border-green-300',
  Intermedio: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Avanzado: 'bg-red-100 text-red-700 border-red-300',
}

const DEMO_TEST_RESULTS = {
  'u1': [
    {
      testId: 'test-python', skill: 'Python', level: 'Avanzado', pct: 85, score: 17, total: 20,
      breakdown: { mc: { correct: 8, total: 10 }, free: { correct: 4, total: 5 }, code: { correct: 5, total: 5 } },
      highlights: [
        { q: '¿Qué es un generador en Python?', a: 'Una función que usa yield para retornar valores de forma lazy, permite iterar sin cargar todo en memoria.', ok: true },
        { q: 'Completa la función suma(a, b)', a: 'a + b', ok: true },
        { q: '¿Qué es duck typing?', a: 'Si el objeto tiene los métodos esperados, Python lo acepta sin verificar el tipo declarado.', ok: true },
      ]
    },
    {
      testId: 'test-powerbi', skill: 'Power BI', level: 'Intermedio', pct: 65, score: 13, total: 20,
      breakdown: { mc: { correct: 6, total: 10 }, free: { correct: 4, total: 5 }, code: { correct: 3, total: 5 } },
      highlights: [
        { q: '¿Qué hace CALCULATE en DAX?', a: 'Evalúa una expresión modificando el contexto de filtro.', ok: true },
        { q: 'Diferencia entre Import y DirectQuery', a: 'Import carga en memoria, DirectQuery consulta en tiempo real.', ok: true },
        { q: 'Completa medida YTD', a: 'DATESYTD', ok: false },
      ]
    },
  ],
  'u2': [
    {
      testId: 'test-excel', skill: 'Excel', level: 'Intermedio', pct: 60, score: 12, total: 20,
      breakdown: { mc: { correct: 6, total: 10 }, free: { correct: 3, total: 5 }, code: { correct: 3, total: 5 } },
      highlights: [
        { q: '¿Para qué sirve BUSCARV?', a: 'Busca un valor en la primera columna y retorna otro de la misma fila.', ok: true },
        { q: 'Completa BUSCARV para 3ra columna', a: '3', ok: true },
        { q: '¿Qué es Power Query?', a: 'Una herramienta para importar y transformar datos.', ok: false },
      ]
    },
  ],
  'u3': [
    {
      testId: 'test-excel', skill: 'Excel', level: 'Avanzado', pct: 90, score: 18, total: 20,
      breakdown: { mc: { correct: 9, total: 10 }, free: { correct: 5, total: 5 }, code: { correct: 4, total: 5 } },
      highlights: [
        { q: '¿Cuándo preferirías INDICE/COINCIDIR?', a: 'Busca en cualquier dirección, no se rompe al insertar columnas y permite búsquedas bidireccionales.', ok: true },
        { q: 'INDICE/COINCIDIR para columna B, retorna C', a: 'B:B', ok: true },
        { q: 'SUMAR.SI, tercer argumento', a: 'C:C', ok: true },
      ]
    },
    {
      testId: 'test-powerbi', skill: 'Power BI', level: 'Avanzado', pct: 80, score: 16, total: 20,
      breakdown: { mc: { correct: 8, total: 10 }, free: { correct: 4, total: 5 }, code: { correct: 4, total: 5 } },
      highlights: [
        { q: '¿Qué es un modelo estrella?', a: 'Tabla de hechos en el centro conectada a tablas de dimensiones.', ok: true },
        { q: '¿Cuándo usar SUMX vs SUM?', a: 'SUMX cuando necesito iterar fila a fila y calcular algo antes de agregar.', ok: true },
      ]
    },
  ],
  'u4': [
    {
      testId: 'test-sql', skill: 'SQL', level: 'Básico', pct: 45, score: 9, total: 20,
      breakdown: { mc: { correct: 5, total: 10 }, free: { correct: 2, total: 5 }, code: { correct: 2, total: 5 } },
      highlights: [
        { q: '¿Cuándo usar LEFT JOIN?', a: 'Cuando quiero todas las filas de la tabla izquierda aunque no coincidan con la derecha.', ok: true },
        { q: 'Completa GROUP BY', a: 'producto', ok: true },
        { q: 'Función de ventana RANK()', a: 'PARTITION', ok: false },
      ]
    },
    {
      testId: 'test-excel', skill: 'Excel', level: 'Intermedio', pct: 55, score: 11, total: 20,
      breakdown: { mc: { correct: 6, total: 10 }, free: { correct: 3, total: 5 }, code: { correct: 2, total: 5 } },
      highlights: [
        { q: '¿Qué hace el formato condicional?', a: 'Resalta visualmente datos según condiciones.', ok: true },
        { q: 'Completa SUMA(A1:A10)', a: 'A1', ok: true },
      ]
    },
  ],
}

export default function EmployerDashboard() {
  const { challengeSubmissions, addFeedbackToSubmission } = useApp()
  const [activeTab, setActiveTab] = useState('talent')
  const [search, setSearch] = useState('')
  const [skill, setSkill] = useState('Todas')
  const [minScore, setMinScore] = useState(0)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishedChallenge, setPublishedChallenge] = useState(false)
  const [newChallenge, setNewChallenge] = useState({ title: '', area: '', description: '' })
  const [feedbackModal, setFeedbackModal] = useState(null)
  const [feedbackForm, setFeedbackForm] = useState({ text: '', rating: 5 })
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [testDetailModal, setTestDetailModal] = useState(null) // { candidate, result }
  const [validatedTests, setValidatedTests] = useState(new Set())
  const [expandedSubmissions, setExpandedSubmissions] = useState(new Set())

  const filtered = CANDIDATES.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.career.toLowerCase().includes(search.toLowerCase())) return false
    if (skill !== 'Todas' && !c.badges.some(b => b.skill === skill)) return false
    if (c.score < minScore) return false
    return true
  }).sort((a, b) => b.score - a.score)

  function handlePublish(e) {
    e.preventDefault()
    setPublishedChallenge(true)
    setShowPublishModal(false)
    setNewChallenge({ title: '', area: '', description: '' })
  }

  function openFeedbackModal(sub) {
    setFeedbackModal(sub)
    setFeedbackForm({ text: '', rating: 5 })
    setFeedbackSent(false)
  }

  function handleSendFeedback(e) {
    e.preventDefault()
    addFeedbackToSubmission(feedbackModal.id, feedbackForm.text, feedbackForm.rating)
    setFeedbackSent(true)
  }

  function toggleExpand(id) {
    setExpandedSubmissions(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function validateTest(candidateId, testId) {
    setValidatedTests(prev => new Set([...prev, `${candidateId}-${testId}`]))
  }

  const allSubmissions = [...CHALLENGE_SUBMISSIONS, ...challengeSubmissions]
  const allVisibleSubmissions = allSubmissions

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      {/* Header */}
      <div className="card mb-6 bg-gradient-to-r from-palette-text-primary to-palette-button-primary text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-palette-button-primary rounded-2xl flex items-center justify-center text-white font-black text-xl">
                B
              </div>
              <div>
                <h1 className="text-xl font-black">BCP — Panel de Empleador</h1>
                <p className="text-white/80 text-sm">Recursos Humanos</p>
              </div>
            </div>
            <p className="text-white/80 text-sm">Descubre talento joven verificado y publica retos de reclutamiento.</p>
          </div>
          <button
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-2 bg-white text-palette-text-primary hover:opacity-90 font-bold px-5 py-3 rounded-xl transition-all shadow-md text-sm flex-shrink-0"
          >
            <Plus size={16} />
            Publicar nuevo reto
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/20">
          {[
            { label: 'Candidatos en plataforma', value: CANDIDATES.length + 2400, icon: <Users size={18} /> },
            { label: 'Retos publicados', value: publishedChallenge ? 4 : 3, icon: <Briefcase size={18} /> },
            { label: 'Entregas recibidas', value: allVisibleSubmissions.length, icon: <MessageSquare size={18} /> },
            { label: 'Score promedio del pool', value: '782', icon: <TrendingUp size={18} /> },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="flex justify-center mb-1 text-palette-fonto-light">{s.icon}</div>
              <div className="text-2xl font-black">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
              <div className="text-xs text-palette-fonto-light mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6 w-fit overflow-x-auto">
        {[
          { id: 'talent', label: 'Buscar talento', icon: <Search size={14} /> },
          { id: 'submissions', label: 'Entregas y feedback', icon: <MessageSquare size={14} /> },
          { id: 'challenges', label: 'Mis retos', icon: <Briefcase size={14} /> },
          { id: 'tests', label: 'Pruebas de nivel', icon: <FlaskConical size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-white text-palette-text-primary shadow-sm' : 'text-palette-text-small hover:text-palette-text-primary'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: TALENT SEARCH ─── */}
      {activeTab === 'talent' && (
        <div>
          <div className="card mb-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-palette-text-small" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o carrera..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-palette-fonto-light focus:border-palette-button-primary focus:ring-2 focus:ring-palette-fonto-light outline-none text-sm transition-all"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={16} className="text-palette-text-small flex-shrink-0" />
                <select value={skill} onChange={e => setSkill(e.target.value)} className="px-3 py-2 rounded-xl border border-palette-fonto-light focus:border-palette-button-primary outline-none text-sm text-palette-text-primary bg-white font-medium">
                  {SKILLS.map(s => <option key={s}>{s}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-palette-text-small whitespace-nowrap">Score mínimo:</span>
                  <input type="range" min="0" max="900" step="50" value={minScore} onChange={e => setMinScore(Number(e.target.value))} className="w-24 accent-palette-button-primary" />
                  <span className="text-sm font-bold text-palette-text-primary w-10">{minScore}</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-palette-text-small mb-4">{filtered.length} candidatos encontrados · ordenados por score</p>
          <div className="card mb-5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-palette-fonto-light text-left text-palette-text-small text-xs">
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Candidato</th>
                    <th className="px-4 py-3 font-semibold">Carrera</th>
                    <th className="px-4 py-3 font-semibold"><span className="flex items-center gap-1"><Star size={11} /> Score</span></th>
                    <th className="px-4 py-3 font-semibold">Pruebas verificadas</th>
                    <th className="px-4 py-3 font-semibold">Video</th>
                    <th className="px-4 py-3 font-semibold">Retos</th>
                    <th className="px-4 py-3 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const tests = DEMO_TEST_RESULTS[c.id] || []
                    return (
                      <tr key={c.id} className="border-t border-palette-fonto-light hover:bg-palette-fonto-light transition-colors">
                        <td className="px-4 py-3"><span className={`font-black text-lg ${i === 0 ? 'text-palette-button-primary' : 'text-palette-text-small'}`}>#{i+1}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${c.avatarColor} rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>{c.initials}</div>
                            <span className="font-semibold text-palette-text-primary">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-palette-text-small text-xs">{c.career.split('—')[0].trim()}</td>
                        <td className="px-4 py-3"><span className="font-black text-palette-text-primary">{c.score}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {tests.map(t => {
                              const meta = SKILL_TESTS.find(st => st.id === t.testId)
                              return (
                                <span key={t.testId} className="flex items-center gap-0.5 text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full border border-blue-200">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#2563eb"/><path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  {meta?.icon} {t.level}
                                </span>
                              )
                            })}
                            {tests.length === 0 && <span className="text-xs text-palette-text-small">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {c.videoUrl ? (
                            <a href={c.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-palette-button-primary font-semibold hover:text-palette-text-primary">
                              <Video size={12} /> Ver
                            </a>
                          ) : (
                            <span className="text-xs text-palette-text-small">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-palette-text-small">{c.challengesCompleted}</td>
                        <td className="px-4 py-3"><a href={`/profile/${c.id}`} className="text-xs font-semibold text-palette-button-primary hover:text-palette-text-primary whitespace-nowrap">Ver perfil →</a></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map(c => <CandidateCard key={c.id} candidate={c} />)}
          </div>
        </div>
      )}

      {/* ─── TAB: SUBMISSIONS & FEEDBACK ─── */}
      {activeTab === 'submissions' && (
        <div>
          <p className="text-sm text-palette-text-small mb-4">{allVisibleSubmissions.length} entregas recibidas · puedes ver la solución completa y dar feedback</p>
          <div className="space-y-4">
            {allVisibleSubmissions.map(sub => {
              const isExpanded = expandedSubmissions.has(sub.id)
              return (
                <div key={sub.id} className="card border border-slate-200">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 ${sub.candidateAvatarColor || 'bg-palette-button-primary'} rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {sub.candidateInitials || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-palette-text-primary text-sm">{sub.candidateName}</p>
                        <p className="text-xs text-palette-text-small truncate">{sub.challengeTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-palette-text-small">{new Date(sub.submittedAt).toLocaleDateString('es-PE')}</span>
                      {sub.feedback ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Feedback enviado</span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">Sin feedback</span>
                      )}
                    </div>
                  </div>

                  {/* Solution description — expandable */}
                  <div className="mb-3">
                    <p className={`text-xs text-palette-text-small leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
                      {sub.description}
                    </p>
                    {sub.description && sub.description.length > 200 && (
                      <button
                        onClick={() => toggleExpand(sub.id)}
                        className="flex items-center gap-1 text-xs text-palette-button-primary font-semibold mt-1 hover:text-palette-text-primary transition-colors"
                      >
                        {isExpanded ? <><ChevronUp size={12} /> Ver menos</> : <><ChevronDown size={12} /> Ver solución completa</>}
                      </button>
                    )}
                  </div>

                  {sub.githubLink && (
                    <a href={sub.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-palette-button-primary font-semibold mb-3 hover:text-palette-text-primary transition-colors">
                      <Github size={12} /> Ver repositorio / entregable
                    </a>
                  )}
                  {sub.feedback ? (
                    <div className="p-3 bg-palette-fonto-light rounded-xl border border-palette-button-primary text-xs">
                      <p className="font-bold text-palette-text-primary mb-1">Tu feedback:</p>
                      <p className="text-palette-text-small">{sub.feedback.text}</p>
                      <div className="flex gap-0.5 mt-1">{Array.from({length:5}).map((_,i)=><span key={i} className={i<sub.feedback.rating?'text-yellow-400':'text-slate-300'}>★</span>)}</div>
                    </div>
                  ) : (
                    <button
                      onClick={() => openFeedbackModal(sub)}
                      className="flex items-center gap-1.5 text-xs btn-primary py-2 px-3"
                    >
                      <MessageSquare size={13} /> Dar feedback y validar
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── TAB: MY CHALLENGES ─── */}
      {activeTab === 'challenges' && (
        <div>
          {publishedChallenge && (
            <div className="card bg-palette-fonto-light border-2 border-palette-button-primary mb-6 flex items-center gap-4">
              <CheckCircle size={24} className="text-palette-button-primary flex-shrink-0" />
              <div>
                <p className="font-bold text-palette-text-primary">¡Reto publicado exitosamente!</p>
                <p className="text-sm text-palette-text-small">Los candidatos ya pueden ver y participar en tu reto.</p>
              </div>
            </div>
          )}
          <div className="mb-4">
            <h2 className="font-bold text-palette-text-primary mb-1">Retos en la plataforma (visibles para ti)</h2>
            <p className="text-xs text-palette-text-small mb-3">Puedes ver las entregas de todos los retos y dar feedback a los candidatos.</p>
            <div className="overflow-x-auto card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-palette-text-small border-b border-palette-fonto-light text-xs">
                    <th className="pb-3 pr-4 font-semibold">Reto</th>
                    <th className="pb-3 pr-4 font-semibold">Área</th>
                    <th className="pb-3 pr-4 font-semibold">Creado por</th>
                    <th className="pb-3 pr-4 font-semibold">Entregas</th>
                    <th className="pb-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {[...CHALLENGES, ...MINI_CHALLENGES].map(c => (
                    <tr key={c.id} className="border-b border-palette-fonto-light hover:bg-palette-fonto-light transition-colors">
                      <td className="py-3 pr-4 font-medium text-palette-text-primary text-xs">{c.title}</td>
                      <td className="py-3 pr-4 text-palette-text-small text-xs">{c.area}</td>
                      <td className="py-3 pr-4">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700">
                          {c.company}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="flex items-center gap-1 text-palette-text-primary text-xs">
                          <Users size={11} />
                          {c.submissions ?? c.participants ?? 0}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-palette-fonto-light text-palette-text-primary text-xs font-semibold rounded-full border border-palette-button-primary">
                          <span className="w-1.5 h-1.5 rounded-full bg-palette-button-primary animate-pulse"></span>
                          Activo
                        </span>
                      </td>
                    </tr>
                  ))}
                  {publishedChallenge && (
                    <tr className="border-b border-palette-fonto-light">
                      <td className="py-3 pr-4 font-medium text-palette-text-primary text-xs">{newChallenge.title || 'Mi nuevo reto'}</td>
                      <td className="py-3 pr-4 text-palette-text-small text-xs">{newChallenge.area || 'General'}</td>
                      <td className="py-3 pr-4"><span className="text-xs px-2 py-0.5 rounded-full bg-palette-fonto-light text-palette-text-primary font-semibold">BCP</span></td>
                      <td className="py-3 pr-4"><span className="flex items-center gap-1 text-palette-text-primary text-xs"><Users size={11} />0</span></td>
                      <td className="py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 bg-palette-fonto-light text-palette-text-primary text-xs font-semibold rounded-full border border-palette-button-primary"><span className="w-1.5 h-1.5 rounded-full bg-palette-button-primary animate-pulse"></span>Activo</span></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: SKILL TEST RESULTS ─── */}
      {activeTab === 'tests' && (
        <div>
          <p className="text-sm text-palette-text-small mb-4">Resultados verificados de pruebas de nivel · haz clic en "Ver respuestas" para revisar las respuestas del candidato y validar su nivel</p>
          <div className="grid gap-4">
            {CANDIDATES.map(c => {
              const tests = DEMO_TEST_RESULTS[c.id] || []
              return (
                <div key={c.id} className="card border border-slate-200">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-10 h-10 ${c.avatarColor} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}>{c.initials}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-palette-text-primary text-sm">{c.name}</p>
                        {c.videoUrl && (
                          <a href={c.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-xs text-palette-button-primary font-semibold hover:text-palette-text-primary">
                            <Video size={11} /> Video
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-palette-text-small">{c.career} · Score {c.score}</p>
                    </div>
                    <a href={`/profile/${c.id}`} className="text-xs text-palette-button-primary font-semibold hover:text-palette-text-primary">Ver perfil →</a>
                  </div>
                  {tests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tests.map(t => {
                        const meta = SKILL_TESTS.find(st => st.id === t.testId)
                        const validKey = `${c.id}-${t.testId}`
                        const isValidated = validatedTests.has(validKey)
                        return (
                          <div key={t.testId} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-lg">{meta?.icon}</span>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-palette-text-primary">{t.skill}</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#2563eb"/><path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </div>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold border ${LEVEL_COLORS[t.level]}`}>{t.level} · {t.pct}%</span>
                              {isValidated && (
                                <span className="mt-1 flex items-center gap-0.5 text-xs text-green-700 font-semibold">
                                  <CheckCircle size={10} /> Validado por BCP
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 ml-1">
                              <button
                                onClick={() => setTestDetailModal({ candidate: c, result: t })}
                                className="text-xs text-palette-button-primary font-semibold hover:text-palette-text-primary whitespace-nowrap"
                              >
                                Ver respuestas →
                              </button>
                              {!isValidated && (
                                <button
                                  onClick={() => validateTest(c.id, t.testId)}
                                  className="text-xs bg-palette-fonto-light border border-palette-button-primary text-palette-button-primary font-semibold px-2 py-0.5 rounded-lg hover:bg-palette-button-primary hover:text-white transition-all"
                                >
                                  Validar nivel
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-palette-text-small italic">Sin pruebas de nivel completadas</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── Test Detail Modal ─── */}
      {testDetailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs text-palette-text-small mb-1">Respuestas de:</p>
                <h2 className="font-black text-palette-text-primary text-lg">{testDetailModal.candidate.name}</h2>
                <p className="text-xs text-palette-text-small mt-0.5">
                  Prueba de {testDetailModal.result.skill} · {testDetailModal.result.score}/{testDetailModal.result.total} · {testDetailModal.result.pct}%
                </p>
              </div>
              <button onClick={() => setTestDetailModal(null)} className="p-2 rounded-lg text-palette-text-small hover:bg-palette-fonto-light transition-colors"><X size={20} /></button>
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border mb-5 ${LEVEL_COLORS[testDetailModal.result.level]}`}>
              <Award size={15} /> Nivel {testDetailModal.result.level}
            </div>

            {/* Score breakdown */}
            {testDetailModal.result.breakdown && (
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Opción múltiple', ...testDetailModal.result.breakdown.mc, color: 'text-blue-600' },
                  { label: 'Respuesta libre', ...testDetailModal.result.breakdown.free, color: 'text-purple-600' },
                  { label: 'Completar código', ...testDetailModal.result.breakdown.code, color: 'text-orange-600' },
                ].map(b => (
                  <div key={b.label} className="p-3 bg-slate-50 rounded-xl text-center border border-slate-200">
                    <p className={`text-lg font-black ${b.color}`}>{b.correct}/{b.total}</p>
                    <p className="text-xs text-palette-text-small mt-0.5">{b.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Answer highlights */}
            {testDetailModal.result.highlights && (
              <div>
                <p className="text-xs font-bold text-palette-text-primary mb-3">Muestra de respuestas del candidato:</p>
                <div className="space-y-3">
                  {testDetailModal.result.highlights.map((h, i) => (
                    <div key={i} className={`p-3 rounded-xl border text-xs ${h.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-start gap-2">
                        {h.ok
                          ? <CheckCircle size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                          : <X size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                        }
                        <div>
                          <p className="font-semibold text-palette-text-primary mb-1">{h.q}</p>
                          <p className="text-palette-text-small">{h.a}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-5">
              {!validatedTests.has(`${testDetailModal.candidate.id}-${testDetailModal.result.testId}`) ? (
                <button
                  onClick={() => { validateTest(testDetailModal.candidate.id, testDetailModal.result.testId); setTestDetailModal(null) }}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={15} /> Validar nivel {testDetailModal.result.level}
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200 text-green-700 text-sm font-semibold">
                  <CheckCircle size={15} /> Nivel validado por BCP
                </div>
              )}
              <button onClick={() => setTestDetailModal(null)} className="btn-secondary px-5">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Publish challenge modal ─── */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-palette-text-primary">Publicar nuevo reto</h2>
              <button onClick={() => setShowPublishModal(false)} className="p-2 rounded-lg text-palette-text-small hover:bg-palette-fonto-light transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-palette-text-primary mb-1.5">Título del reto</label>
                <input required value={newChallenge.title} onChange={e => setNewChallenge(p => ({ ...p, title: e.target.value }))} placeholder="ej. Análisis de comportamiento de usuarios..." className="w-full px-4 py-3 rounded-xl border border-palette-fonto-light focus:border-palette-button-primary focus:ring-2 focus:ring-palette-fonto-light outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-palette-text-primary mb-1.5">Área</label>
                <select value={newChallenge.area} onChange={e => setNewChallenge(p => ({ ...p, area: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-palette-fonto-light focus:border-palette-button-primary outline-none text-sm bg-white">
                  <option value="">Selecciona un área...</option>
                  {['Datos', 'Negocio', 'Diseño', 'Tecnología', 'Marketing'].map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-palette-text-primary mb-1.5">Descripción del reto</label>
                <textarea required rows={4} value={newChallenge.description} onChange={e => setNewChallenge(p => ({ ...p, description: e.target.value }))} placeholder="Describe el problema, el contexto empresarial y lo que esperas como entregable..." className="w-full px-4 py-3 rounded-xl border border-palette-fonto-light focus:border-palette-button-primary focus:ring-2 focus:ring-palette-fonto-light outline-none text-sm resize-none transition-all" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPublishModal(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2"><Plus size={16} />Publicar reto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Feedback modal ─── */}
      {feedbackModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8">
            {!feedbackSent ? (
              <>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1 pr-4">
                    <p className="text-xs text-palette-text-small mb-1">Dando feedback a:</p>
                    <h2 className="font-black text-palette-text-primary text-lg">{feedbackModal.candidateName}</h2>
                    <p className="text-xs text-palette-text-small mt-0.5">{feedbackModal.challengeTitle}</p>
                  </div>
                  <button onClick={() => setFeedbackModal(null)} className="p-2 rounded-lg text-palette-text-small hover:bg-palette-fonto-light transition-colors"><X size={20} /></button>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl mb-4 text-xs text-palette-text-small leading-relaxed">
                  <p className="font-semibold text-palette-text-primary mb-1">Solución entregada:</p>
                  {feedbackModal.description}
                </div>
                {feedbackModal.githubLink && (
                  <a href={feedbackModal.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-palette-button-primary font-semibold mb-4 hover:text-palette-text-primary transition-colors">
                    <Github size={12} /> Ver repositorio / entregable
                  </a>
                )}
                <form onSubmit={handleSendFeedback} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-palette-text-primary mb-1.5">Tu feedback</label>
                    <textarea required rows={4} value={feedbackForm.text} onChange={e => setFeedbackForm(p => ({...p, text: e.target.value}))} placeholder="Sé específico: qué estuvo bien, qué mejorar, qué aprendiste de esta solución..." className="w-full px-4 py-3 rounded-xl border border-palette-fonto-light focus:border-palette-button-primary outline-none text-sm resize-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-palette-text-primary mb-2">Calificación</label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} type="button" onClick={() => setFeedbackForm(p => ({...p, rating: n}))} className={`w-9 h-9 rounded-xl text-lg transition-all ${feedbackForm.rating >= n ? 'text-yellow-400 scale-110' : 'text-slate-300 hover:text-yellow-300'}`}>★</button>
                      ))}
                      <span className="text-sm text-palette-text-small self-center ml-1">{feedbackForm.rating}/5</span>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setFeedbackModal(null)} className="btn-secondary flex-1">Cancelar</button>
                    <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2"><MessageSquare size={15} />Enviar feedback</button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-green-600" /></div>
                <h3 className="text-xl font-black text-palette-text-primary mb-2">¡Feedback enviado!</h3>
                <p className="text-palette-text-small text-sm mb-6">El candidato recibirá tu feedback en su perfil de entregas.</p>
                <button onClick={() => setFeedbackModal(null)} className="btn-primary w-full">Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
