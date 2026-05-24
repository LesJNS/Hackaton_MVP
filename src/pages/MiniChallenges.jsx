import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { MINI_CHALLENGES } from '../data/mockData'
import { Plus, X, Github, FileText, Clock, Users, CheckCircle, Star, Filter, BookOpen, ArrowRight } from 'lucide-react'

const AREAS = ['Todos', 'Datos', 'Tecnología', 'Negocio', 'Diseño']
const DIFFICULTIES = ['Todos', 'Básico', 'Intermedio', 'Avanzado']

const DIFF_COLORS = {
  Básico: 'text-green-700 bg-green-50 border-green-300',
  Intermedio: 'text-yellow-700 bg-yellow-50 border-yellow-300',
  Avanzado: 'text-red-700 bg-red-50 border-red-300',
}

export default function MiniChallenges() {
  const { miniChallengeSubmissions, addMiniChallengeSubmission } = useApp()
  const [area, setArea] = useState('Todos')
  const [difficulty, setDifficulty] = useState('Todos')
  const [modalStep, setModalStep] = useState(null) // null | 'detail' | 'submit'
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [form, setForm] = useState({ description: '', githubLink: '' })
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState('challenges') // 'challenges' | 'mysubmissions'

  const filtered = MINI_CHALLENGES.filter(c => {
    if (area !== 'Todos' && c.area !== area) return false
    if (difficulty !== 'Todos' && c.difficulty !== difficulty) return false
    return true
  })

  const mySubmissions = miniChallengeSubmissions

  function openDetail(challenge) {
    setSelectedChallenge(challenge)
    setModalStep('detail')
    setSubmitted(false)
  }

  function openSubmitForm() {
    setForm({ description: '', githubLink: '' })
    setModalStep('submit')
  }

  function closeModal() {
    setModalStep(null)
    setSelectedChallenge(null)
  }

  function handleSubmit(e) {
    e.preventDefault()
    addMiniChallengeSubmission(selectedChallenge, form.description, form.githubLink)
    setSubmitted(true)
  }

  function isSubmitted(challengeId) {
    return mySubmissions.some(s => s.challengeId === challengeId)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-palette-text-primary">Mini retos</h1>
        <p className="text-palette-text-small mt-1 text-sm">
          Resuelve retos prácticos propuestos por Talently, sube tu solución y potencia tu perfil con evidencia real.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'challenges' ? 'bg-white text-palette-text-primary shadow-sm' : 'text-palette-text-small hover:text-palette-text-primary'}`}
        >
          Retos disponibles
          <span className="ml-2 bg-palette-button-primary text-white text-xs rounded-full px-1.5 py-0.5">{filtered.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('mysubmissions')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'mysubmissions' ? 'bg-white text-palette-text-primary shadow-sm' : 'text-palette-text-small hover:text-palette-text-primary'}`}
        >
          Mis entregas
          {mySubmissions.length > 0 && (
            <span className="ml-2 bg-palette-button-primary text-white text-xs rounded-full px-1.5 py-0.5">{mySubmissions.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'challenges' && (
        <>
          {/* Filters */}
          <div className="card mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={15} className="text-palette-text-small" />
              {[
                { label: 'Área', state: area, set: setArea, options: AREAS },
                { label: 'Dificultad', state: difficulty, set: setDifficulty, options: DIFFICULTIES },
              ].map(f => (
                <select
                  key={f.label}
                  value={f.state}
                  onChange={e => f.set(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-palette-fonto-light focus:border-palette-button-primary outline-none text-sm bg-white text-palette-text-primary font-medium"
                >
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ))}
              <span className="ml-auto text-xs text-palette-text-small">{filtered.length} reto{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Challenge grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(challenge => (
              <MiniChallengeCard
                key={challenge.id}
                challenge={challenge}
                isSubmitted={isSubmitted(challenge.id)}
                onView={() => openDetail(challenge)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-palette-text-small">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay retos con esos filtros.</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'mysubmissions' && (
        <div className="space-y-4">
          {mySubmissions.length === 0 && (
            <div className="text-center py-16 text-palette-text-small">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm mb-4">Aún no has entregado ningún mini reto.</p>
              <button onClick={() => setActiveTab('challenges')} className="btn-primary text-sm px-4 py-2">
                Ver retos disponibles
              </button>
            </div>
          )}
          {mySubmissions.map(sub => (
            <SubmissionCard key={sub.id} submission={sub} />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalStep && selectedChallenge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">

            {/* ── DETAIL VIEW ── */}
            {modalStep === 'detail' && (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-palette-button-primary flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                      T
                    </div>
                    <span className="text-xs font-semibold text-palette-button-primary">Talently</span>
                  </div>
                  <button onClick={closeModal} className="p-2 rounded-lg text-palette-text-small hover:bg-palette-fonto-light transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <h2 className="font-black text-palette-text-primary text-xl leading-tight mb-3">
                  {selectedChallenge.title}
                </h2>

                <div className="flex gap-2 mb-4 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${DIFF_COLORS[selectedChallenge.difficulty]}`}>
                    {selectedChallenge.difficulty}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-palette-text-small font-medium">
                    {selectedChallenge.area}
                  </span>
                  {selectedChallenge.reward && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-palette-fonto-light text-palette-button-primary font-medium flex items-center gap-1">
                      <Star size={10} /> {selectedChallenge.reward}
                    </span>
                  )}
                </div>

                <p className="text-sm text-palette-text-small leading-relaxed mb-4">
                  {selectedChallenge.description}
                </p>

                {selectedChallenge.resources && (
                  <div className="p-3 bg-palette-fonto-light rounded-xl border border-palette-button-primary mb-4">
                    <p className="text-xs font-semibold text-palette-text-primary mb-1">📎 Recursos</p>
                    <p className="text-xs text-palette-text-small">{selectedChallenge.resources}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedChallenge.tags.map(t => (
                    <span key={t} className="text-xs bg-palette-fonto-light text-palette-text-primary px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-palette-text-small mb-6">
                  <span className="flex items-center gap-1"><Users size={12} /> {selectedChallenge.submissions} entregas</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> Cierre: {selectedChallenge.deadline}</span>
                </div>

                {isSubmitted(selectedChallenge.id) ? (
                  <div className="flex items-center gap-2 justify-center p-3 bg-green-50 rounded-xl border border-green-200 text-green-700 text-sm font-semibold">
                    <CheckCircle size={16} /> Ya entregaste este reto
                  </div>
                ) : (
                  <button
                    onClick={openSubmitForm}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    Entregar solución <ArrowRight size={15} />
                  </button>
                )}
              </>
            )}

            {/* ── SUBMIT FORM ── */}
            {modalStep === 'submit' && !submitted && (
              <>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1 min-w-0 pr-4">
                    <button onClick={() => setModalStep('detail')} className="text-xs text-palette-text-small hover:text-palette-button-primary mb-2 flex items-center gap-1">
                      ← Volver al detalle
                    </button>
                    <h2 className="font-black text-palette-text-primary text-lg leading-tight">{selectedChallenge.title}</h2>
                  </div>
                  <button onClick={closeModal} className="p-2 rounded-lg text-palette-text-small hover:bg-palette-fonto-light transition-colors flex-shrink-0">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-palette-text-primary mb-1.5">
                      Descripción de tu solución <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.description}
                      onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Explica cómo resolviste el reto: metodología, herramientas usadas, decisiones tomadas y resultados obtenidos..."
                      className="w-full px-4 py-3 rounded-xl border border-palette-fonto-light focus:border-palette-button-primary focus:ring-2 focus:ring-palette-fonto-light outline-none text-sm resize-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-palette-text-primary mb-1.5">
                      <span className="flex items-center gap-1.5"><Github size={14} /> Link de repositorio o entregable</span>
                    </label>
                    <input
                      type="url"
                      value={form.githubLink}
                      onChange={e => setForm(p => ({ ...p, githubLink: e.target.value }))}
                      placeholder="https://github.com/tu-usuario/tu-repo (opcional)"
                      className="w-full px-4 py-3 rounded-xl border border-palette-fonto-light focus:border-palette-button-primary focus:ring-2 focus:ring-palette-fonto-light outline-none text-sm transition-all"
                    />
                    <p className="text-xs text-palette-text-small mt-1">GitHub, Google Drive, Notion, Colab u otro enlace público.</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModalStep('detail')} className="btn-secondary flex-1">
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                      <Plus size={16} />
                      Enviar solución
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ── SUCCESS ── */}
            {modalStep === 'submit' && submitted && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-black text-palette-text-primary mb-2">¡Solución enviada!</h3>
                <p className="text-palette-text-small text-sm mb-2">
                  Tu solución para <span className="font-semibold">{selectedChallenge.title}</span> fue registrada.
                </p>
                {selectedChallenge.reward && (
                  <p className="text-xs text-palette-button-primary font-semibold mb-5">
                    <Star size={12} className="inline mr-1" />
                    Progreso hacia: {selectedChallenge.reward}
                  </p>
                )}
                <p className="text-xs text-palette-text-small mb-6">
                  El equipo de Talently revisará tu entrega y te dejará feedback. Revisa la pestaña "Mis entregas" para seguir el estado.
                </p>
                <button
                  onClick={() => { closeModal(); setActiveTab('mysubmissions') }}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Ver mis entregas <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function MiniChallengeCard({ challenge, isSubmitted, onView }) {
  return (
    <div
      className={`card border-2 transition-all cursor-pointer hover:shadow-md ${isSubmitted ? 'border-green-300 bg-green-50/30' : 'border-transparent hover:border-palette-button-primary'}`}
      onClick={onView}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-palette-button-primary flex items-center justify-center text-white font-black text-xs flex-shrink-0">
            T
          </div>
          <span className="text-xs font-semibold text-palette-button-primary">Talently</span>
        </div>
        {isSubmitted && (
          <span className="flex items-center gap-1 text-xs text-green-700 font-semibold bg-green-100 px-2 py-0.5 rounded-full flex-shrink-0">
            <CheckCircle size={11} /> Entregado
          </span>
        )}
      </div>

      <h3 className="font-bold text-palette-text-primary text-sm mb-2 leading-snug">{challenge.title}</h3>

      <div className="flex gap-1.5 mb-3 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${DIFF_COLORS[challenge.difficulty]}`}>
          {challenge.difficulty}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-palette-text-small">{challenge.area}</span>
      </div>

      <p className="text-xs text-palette-text-small leading-relaxed mb-3 line-clamp-3">
        {challenge.description}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {challenge.tags.map(t => (
          <span key={t} className="text-xs bg-palette-fonto-light text-palette-text-primary px-2 py-0.5 rounded-full">{t}</span>
        ))}
      </div>

      <div className="flex items-center gap-3 text-xs text-palette-text-small mb-4">
        <span className="flex items-center gap-1"><Users size={11} />{challenge.submissions} entregas</span>
        <span className="flex items-center gap-1"><Clock size={11} />{challenge.deadline}</span>
      </div>

      {challenge.reward && (
        <p className="text-xs text-palette-button-primary font-semibold mb-3 flex items-center gap-1">
          <Star size={11} /> {challenge.reward}
        </p>
      )}

      <div
        className={`w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all ${
          isSubmitted
            ? 'bg-green-100 text-green-700'
            : 'bg-palette-fonto-light text-palette-button-primary border border-palette-button-primary hover:bg-palette-button-primary hover:text-white'
        }`}
      >
        {isSubmitted ? '✓ Entrega enviada' : 'Ver reto →'}
      </div>
    </div>
  )
}

function SubmissionCard({ submission }) {
  return (
    <div className="card border border-palette-fonto-light">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="font-bold text-palette-text-primary text-sm">{submission.challengeTitle}</h3>
          <p className="text-xs text-palette-text-small mt-0.5">
            Entregado el {new Date(submission.submittedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}
          </p>
        </div>
        {submission.feedback ? (
          <span className="flex items-center gap-1 text-xs bg-palette-fonto-light text-palette-button-primary font-semibold px-2.5 py-1 rounded-full flex-shrink-0 border border-palette-button-primary">
            <Star size={11} /> Feedback recibido
          </span>
        ) : (
          <span className="text-xs text-palette-text-small bg-slate-100 px-2.5 py-1 rounded-full flex-shrink-0">Pendiente de revisión</span>
        )}
      </div>

      <p className="text-xs text-palette-text-small leading-relaxed mb-3">{submission.description}</p>

      {submission.githubLink && (
        <a
          href={submission.githubLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-palette-button-primary font-semibold mb-3 hover:text-palette-text-primary transition-colors"
          onClick={e => e.stopPropagation()}
        >
          <Github size={13} /> Ver repositorio / entregable
        </a>
      )}

      {submission.feedback && (
        <div className="p-3 bg-palette-fonto-light rounded-xl border border-palette-button-primary">
          <p className="text-xs font-bold text-palette-text-primary mb-1 flex items-center gap-1.5">
            <Star size={12} className="text-palette-button-primary" />
            Feedback de {submission.feedback.givenBy}
          </p>
          <p className="text-xs text-palette-text-small leading-relaxed">{submission.feedback.text}</p>
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-sm ${i < submission.feedback.rating ? 'text-yellow-400' : 'text-slate-300'}`}>★</span>
            ))}
            <span className="text-xs text-palette-text-small ml-1">{submission.feedback.rating}/5</span>
          </div>
        </div>
      )}
    </div>
  )
}
