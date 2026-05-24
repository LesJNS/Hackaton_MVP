import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { SKILL_TESTS } from '../data/mockData'
import { CheckCircle, Clock, ChevronRight, Award, RotateCcw } from 'lucide-react'

const LEVEL_COLORS = {
  Básico: 'bg-green-100 text-green-700 border-green-300',
  Intermedio: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Avanzado: 'bg-red-100 text-red-700 border-red-300',
}

export default function SkillTests() {
  const { testResults } = useApp()

  function getResult(testId) {
    return testResults.find(r => r.testId === testId) || null
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-palette-text-primary">Pruebas de nivel</h1>
        <p className="text-palette-text-small mt-2">
          Completa las pruebas para obtener tu insignia verificada{' '}
          <span className="inline-flex items-center gap-1 text-palette-button-primary font-semibold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="inline">
              <circle cx="12" cy="12" r="11" fill="#2563eb" />
              <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            verificado
          </span>{' '}
          en cada habilidad. El nivel asignado (Básico, Intermedio o Avanzado) refleja tu desempeño real.
        </p>
      </div>

      {/* Stats if any tests done */}
      {testResults.length > 0 && (
        <div className="card mb-8 bg-gradient-to-r from-palette-text-primary to-palette-button-primary text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Award size={28} className="text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Tienes</p>
              <p className="text-3xl font-black">{testResults.length} <span className="text-xl font-semibold">insignia{testResults.length !== 1 ? 's' : ''} verificada{testResults.length !== 1 ? 's' : ''}</span></p>
            </div>
            <div className="ml-auto flex gap-3">
              {testResults.map(r => (
                <div key={r.testId} className="text-center">
                  <div className="text-2xl mb-1">{SKILL_TESTS.find(t => t.id === r.testId)?.icon}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${LEVEL_COLORS[r.level]}`}>{r.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Test cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        {SKILL_TESTS.map(test => {
          const result = getResult(test.id)
          return (
            <div key={test.id} className={`card border-2 ${result ? 'border-palette-button-primary' : 'border-transparent'} hover:border-palette-button-primary transition-all`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${test.color} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow`}>
                    {test.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-lg font-black text-palette-text-primary">{test.skill}</h2>
                      {result && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" title="Verificado">
                          <circle cx="12" cy="12" r="11" fill="#2563eb" />
                          <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {result ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${LEVEL_COLORS[result.level]}`}>
                        Nivel: {result.level}
                      </span>
                    ) : (
                      <span className="text-xs text-palette-text-small">Sin completar</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-palette-text-small mb-4 leading-relaxed">{test.description}</p>

              {/* Info pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-palette-text-small px-2.5 py-1 rounded-full">
                  <Clock size={11} />
                  20 preguntas · ~20 min
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Básico · Intermedio · Avanzado
                </span>
              </div>

              {/* Question types */}
              <div className="flex gap-2 mb-5">
                {[
                  { label: '10 opción múltiple', color: 'bg-blue-50 text-blue-700' },
                  { label: '5 respuesta libre', color: 'bg-purple-50 text-purple-700' },
                  { label: '5 código', color: 'bg-orange-50 text-orange-700' },
                ].map(t => (
                  <span key={t.label} className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.color}`}>{t.label}</span>
                ))}
              </div>

              {/* Result bar */}
              {result && (
                <div className="mb-4 p-3 rounded-xl bg-palette-fonto-light border border-palette-button-primary">
                  <div className="flex justify-between text-xs font-semibold text-palette-text-primary mb-1.5">
                    <span>Último resultado</span>
                    <span>{result.score}/{result.total} correctas · {result.pct}%</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${result.pct >= 75 ? 'bg-red-500' : result.pct >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${result.pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-palette-text-small mt-1.5">
                    {new Date(result.completedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}

              {/* Action */}
              <Link
                to={`/skill-tests/${test.id}`}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                  result
                    ? 'bg-palette-fonto-light text-palette-text-primary hover:bg-slate-200 border border-slate-200'
                    : 'btn-primary'
                }`}
              >
                {result ? (
                  <>
                    <RotateCcw size={15} />
                    Volver a tomar la prueba
                  </>
                ) : (
                  <>
                    Iniciar prueba
                    <ChevronRight size={15} />
                  </>
                )}
              </Link>
            </div>
          )
        })}
      </div>

      {/* Info box */}
      <div className="mt-8 card bg-palette-fonto-light border border-palette-button-primary">
        <div className="flex items-start gap-3">
          <CheckCircle size={20} className="text-palette-button-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-palette-text-primary text-sm mb-1">¿Cómo funciona el sistema de niveles?</p>
            <p className="text-xs text-palette-text-small leading-relaxed">
              Cada prueba tiene 20 preguntas distribuidas en tres niveles de dificultad.
              Tu resultado determina el nivel de tu insignia verificada:{' '}
              <span className="font-semibold text-green-700">Básico</span> (0-49%),{' '}
              <span className="font-semibold text-yellow-700">Intermedio</span> (50-74%) o{' '}
              <span className="font-semibold text-red-700">Avanzado</span> (75-100%).
              Puedes repetir la prueba en cualquier momento para actualizar tu nivel. Las insignias verificadas
              aparecen en tu perfil público con el checkmark azul y son visibles para los empleadores.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
