import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { SKILL_TESTS } from '../data/mockData'
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, ChevronRight, Award, RotateCcw } from 'lucide-react'

const LEVEL_COLORS = {
  Básico: 'bg-green-100 text-green-700 border-green-300',
  Intermedio: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Avanzado: 'bg-red-100 text-red-700 border-red-300',
}

const TYPE_LABELS = { mc: 'Opción múltiple', free: 'Respuesta libre', code: 'Completar código' }
const TYPE_COLORS = { mc: 'bg-blue-50 text-blue-700', free: 'bg-purple-50 text-purple-700', code: 'bg-orange-50 text-orange-700' }

export default function SkillTestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { saveTestResult } = useApp()

  const test = SKILL_TESTS.find(t => t.id === id)

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({}) // questionId -> value
  const [freeCorrect, setFreeCorrect] = useState({}) // questionId -> bool (self-assessed)
  const [showModelAnswer, setShowModelAnswer] = useState({}) // questionId -> bool
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)

  const questions = useMemo(() => test?.questions || [], [test])
  const q = questions[current]

  if (!test) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-palette-text-small text-lg">Prueba no encontrada.</p>
        <Link to="/skill-tests" className="btn-primary mt-4 inline-block">Volver a pruebas</Link>
      </div>
    )
  }

  function setAnswer(questionId, value) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  function isMCCorrect(q) {
    const ans = answers[q.id]
    return ans !== undefined && Number(ans) === q.correct
  }

  function isCodeCorrect(q) {
    const ans = (answers[q.id] || '').trim().toLowerCase()
    return q.expected.some(e => e.toLowerCase().trim() === ans)
  }

  function computeScore() {
    let score = 0
    for (const q of questions) {
      if (q.type === 'mc' && isMCCorrect(q)) score++
      else if (q.type === 'free' && freeCorrect[q.id]) score++
      else if (q.type === 'code' && isCodeCorrect(q)) score++
    }
    return score
  }

  function handleSubmit() {
    // Force reveal all model answers before computing
    const newShowModel = {}
    questions.filter(q => q.type === 'free').forEach(q => { newShowModel[q.id] = true })
    setShowModelAnswer(prev => ({ ...prev, ...newShowModel }))
    const score = computeScore()
    const saved = saveTestResult(test.id, test.skill, score, questions.length, { answers, freeCorrect })
    setResult(saved)
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleRetake() {
    setAnswers({})
    setFreeCorrect({})
    setShowModelAnswer({})
    setSubmitted(false)
    setResult(null)
    setCurrent(0)
  }

  const answeredCount = questions.filter(q => {
    if (q.type === 'mc') return answers[q.id] !== undefined
    if (q.type === 'free') return showModelAnswer[q.id] !== undefined
    if (q.type === 'code') return answers[q.id] !== undefined && answers[q.id].trim() !== ''
    return false
  }).length

  const progressPct = Math.round((answeredCount / questions.length) * 100)

  // ─── Results screen ────────────────────────────────────────────
  if (submitted && result) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 page-enter">
        <div className="card text-center mb-6">
          {/* Badge */}
          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 ${test.color} rounded-3xl flex items-center justify-center text-4xl shadow-lg`}>
              {test.icon}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-black text-palette-text-primary">{test.skill}</h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="#2563eb" />
              <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-palette-text-small mb-4 text-sm">Tu insignia verificada ha sido actualizada</p>

          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-lg border-2 mb-4 ${LEVEL_COLORS[result.level]}`}>
            <Award size={20} />
            Nivel {result.level}
          </div>

          <div className="flex justify-center gap-8 mb-6 pt-4 border-t border-slate-100">
            <div>
              <div className="text-3xl font-black text-palette-text-primary">{result.score}<span className="text-palette-text-small font-normal text-xl">/{result.total}</span></div>
              <div className="text-xs text-palette-text-small">Correctas</div>
            </div>
            <div>
              <div className="text-3xl font-black text-palette-text-primary">{result.pct}<span className="text-palette-text-small font-normal text-xl">%</span></div>
              <div className="text-xs text-palette-text-small">Puntaje</div>
            </div>
          </div>

          {/* Score bar */}
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2 mx-4">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${result.pct >= 75 ? 'bg-red-500' : result.pct >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${result.pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-palette-text-small mx-4 mb-6">
            <span>0% — Básico</span>
            <span>50% — Intermedio</span>
            <span>75% — Avanzado</span>
          </div>

          {/* Level explanation */}
          <div className={`rounded-xl p-4 text-sm text-left mb-6 ${test.bgLight} border ${test.borderColor}`}>
            <p className={`font-semibold mb-1 ${test.textColor}`}>¿Qué significa este nivel?</p>
            {result.level === 'Básico' && <p className="text-palette-text-small text-xs">Tienes conocimientos fundamentales de {test.skill}. Puedes seguir practicando y volver a tomar la prueba cuando te sientas listo para el siguiente nivel.</p>}
            {result.level === 'Intermedio' && <p className="text-palette-text-small text-xs">Dominas los conceptos más importantes de {test.skill} y puedes aplicarlos en proyectos reales. Sigue profundizando para alcanzar el nivel Avanzado.</p>}
            {result.level === 'Avanzado' && <p className="text-palette-text-small text-xs">Tienes un dominio sólido de {test.skill}. Los empleadores que buscan candidatos con esta habilidad verán tu insignia verificada en tu perfil.</p>}
          </div>

          <div className="flex gap-3">
            <button onClick={handleRetake} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <RotateCcw size={15} />
              Volver a intentar
            </button>
            <Link to="/skill-tests" className="btn-primary flex-1 flex items-center justify-center gap-2">
              Ver todas las pruebas
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {/* Review answers */}
        <div className="card">
          <h3 className="font-bold text-palette-text-primary mb-4">Revisión de respuestas</h3>
          <div className="space-y-4">
            {questions.map((q, i) => {
              let correct = null
              if (q.type === 'mc') correct = isMCCorrect(q)
              else if (q.type === 'free') correct = freeCorrect[q.id] || false
              else if (q.type === 'code') correct = isCodeCorrect(q)
              return (
                <div key={q.id} className={`p-3 rounded-xl border text-sm ${correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-2">
                    {correct ? <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-palette-text-primary text-xs mb-1">{i + 1}. {q.text}</p>
                      {q.type === 'mc' && (
                        <p className="text-xs text-palette-text-small">
                          Respuesta correcta: <span className="font-semibold">{q.options[q.correct]}</span>
                          {answers[q.id] !== undefined && !correct && (
                            <span className="text-red-600"> · Tu respuesta: {q.options[Number(answers[q.id])]}</span>
                          )}
                        </p>
                      )}
                      {q.type === 'code' && (
                        <p className="text-xs text-palette-text-small">
                          Respuesta esperada: <code className="bg-white px-1 rounded font-mono">{q.expected[0]}</code>
                          {answers[q.id] && !correct && (
                            <span className="text-red-600"> · Tu respuesta: <code className="bg-white px-1 rounded font-mono">{answers[q.id]}</code></span>
                          )}
                        </p>
                      )}
                      {q.type === 'free' && (
                        <p className="text-xs text-palette-text-small line-clamp-2">Respuesta modelo: {q.modelAnswer}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ─── Test screen ───────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 page-enter">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/skill-tests" className="p-2 rounded-lg hover:bg-palette-fonto-light transition-colors text-palette-text-small">
          <ArrowLeft size={18} />
        </Link>
        <div className={`w-9 h-9 ${test.color} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>
          {test.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-palette-text-primary text-lg leading-tight">Prueba de {test.skill}</h1>
          <p className="text-xs text-palette-text-small">{current + 1} / {questions.length} preguntas</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-palette-text-primary">{answeredCount}/{questions.length}</div>
          <div className="text-xs text-palette-text-small">respondidas</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-palette-button-primary rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Question card */}
      <div className="card mb-4">
        {/* Type + level pills */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLORS[q.type]}`}>
            {TYPE_LABELS[q.type]}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${LEVEL_COLORS[q.level]}`}>
            {q.level}
          </span>
          <span className="ml-auto text-xs text-palette-text-small">Pregunta {current + 1}</span>
        </div>

        {/* Question text */}
        <p className="font-semibold text-palette-text-primary mb-5 leading-relaxed">{q.text}</p>

        {/* ─ Multiple choice ─ */}
        {q.type === 'mc' && (
          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setAnswer(q.id, i)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  answers[q.id] === i
                    ? 'border-palette-button-primary bg-palette-fonto-light text-palette-text-primary'
                    : 'border-slate-200 hover:border-palette-button-primary hover:bg-palette-fonto-light text-palette-text-small'
                }`}
              >
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 flex-shrink-0 ${
                  answers[q.id] === i ? 'bg-palette-button-primary text-white' : 'bg-slate-200 text-palette-text-small'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* ─ Free text ─ */}
        {q.type === 'free' && (
          <div>
            <textarea
              rows={4}
              placeholder="Escribe tu respuesta aquí..."
              value={answers[q.id] || ''}
              onChange={e => setAnswer(q.id, e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-palette-fonto-light focus:border-palette-button-primary focus:ring-2 focus:ring-palette-fonto-light outline-none text-sm resize-none transition-all"
            />
            {!showModelAnswer[q.id] ? (
              <button
                onClick={() => setShowModelAnswer(prev => ({ ...prev, [q.id]: true }))}
                className="mt-3 text-sm text-palette-button-primary hover:text-palette-text-primary font-semibold transition-colors"
              >
                Ver respuesta modelo →
              </button>
            ) : (
              <div className={`mt-3 p-4 rounded-xl border ${test.borderColor} ${test.bgLight}`}>
                <p className={`text-xs font-bold mb-1.5 ${test.textColor}`}>Respuesta modelo:</p>
                <p className="text-xs text-palette-text-small leading-relaxed">{q.modelAnswer}</p>
                <p className="text-xs font-semibold text-palette-text-primary mt-3 mb-2">¿Tu respuesta fue correcta?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFreeCorrect(prev => ({ ...prev, [q.id]: true }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                      freeCorrect[q.id] === true ? 'bg-green-500 border-green-500 text-white' : 'border-green-300 text-green-700 hover:bg-green-50'
                    }`}
                  >
                    <CheckCircle size={13} /> Sí, correcta
                  </button>
                  <button
                    onClick={() => setFreeCorrect(prev => ({ ...prev, [q.id]: false }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                      freeCorrect[q.id] === false ? 'bg-red-500 border-red-500 text-white' : 'border-red-300 text-red-700 hover:bg-red-50'
                    }`}
                  >
                    <XCircle size={13} /> No, incorrecta
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─ Code completion ─ */}
        {q.type === 'code' && (
          <div>
            <div className="bg-slate-900 rounded-xl p-4 mb-3 font-mono text-sm overflow-x-auto">
              {q.code.split('\n').map((line, i) => (
                <div key={i} className="text-slate-300 leading-relaxed">
                  {line.includes('___') ? (
                    <>
                      {line.split('___')[0]}
                      <input
                        type="text"
                        value={answers[q.id] || ''}
                        onChange={e => setAnswer(q.id, e.target.value)}
                        placeholder="tu respuesta"
                        className="bg-slate-700 text-yellow-300 border-b-2 border-yellow-400 outline-none px-2 py-0.5 rounded text-sm font-mono min-w-[120px] max-w-[200px] placeholder-slate-500"
                      />
                      {line.split('___')[1]}
                    </>
                  ) : (
                    line
                  )}
                </div>
              ))}
            </div>
            {q.hint && (
              <p className="text-xs text-palette-text-small italic">
                💡 Pista: {q.hint}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-palette-text-small hover:border-palette-button-primary hover:text-palette-text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={15} /> Anterior
        </button>

        {/* Question dots */}
        <div className="flex-1 flex justify-center gap-1.5 flex-wrap">
          {questions.map((qi, i) => {
            const isDone = qi.type === 'mc' ? answers[qi.id] !== undefined
              : qi.type === 'free' ? showModelAnswer[qi.id]
              : (answers[qi.id] || '').trim() !== ''
            return (
              <button
                key={qi.id}
                onClick={() => setCurrent(i)}
                className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                  i === current ? 'bg-palette-button-primary text-white scale-110' :
                  isDone ? 'bg-green-500 text-white' : 'bg-slate-200 text-palette-text-small hover:bg-slate-300'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        {current < questions.length - 1 ? (
          <button
            onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-palette-text-small hover:border-palette-button-primary hover:text-palette-text-primary transition-all"
          >
            Siguiente <ArrowRight size={15} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2.5 btn-primary text-sm"
          >
            Terminar prueba <CheckCircle size={15} />
          </button>
        )}
      </div>

      {/* Submit from any point */}
      {current < questions.length - 1 && (
        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="text-sm text-palette-button-primary hover:text-palette-text-primary font-semibold transition-colors"
          >
            Terminar prueba ahora ({answeredCount}/{questions.length} respondidas)
          </button>
        </div>
      )}
    </div>
  )
}
