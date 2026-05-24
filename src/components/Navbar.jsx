import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, User, BookOpen, Briefcase, Zap, FlaskConical } from 'lucide-react'
import { useApp } from '../context/AppContext'
import logo from '../../assets/Logo.svg'

export default function Navbar() {
  const { currentUser, role, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to={currentUser ? (role === 'employer' ? '/employer' : '/dashboard') : '/'} className="flex items-center gap-2">
          <img src={logo} alt="Talently" className="w-9 h-9 object-contain" />
          <span className="flex flex-col leading-none font-black text-xl text-palette-text-primary">
            <span>Talently</span>
          </span>
        </Link>

        {currentUser && (
          <div className="flex items-center gap-1 sm:gap-2">
            {role === 'candidate' && (
              <>
                <NavLink to="/dashboard" icon={<User size={16} />} label="Mi Perfil" active={isActive('/dashboard')} />
                <NavLink to="/challenges" icon={<BookOpen size={16} />} label="Retos" active={isActive('/challenges')} />
                <NavLink to="/mini-challenges" icon={<Zap size={16} />} label="Mini Retos" active={isActive('/mini-challenges')} />
                <NavLink to="/skill-tests" icon={<FlaskConical size={16} />} label="Pruebas" active={isActive('/skill-tests')} />
              </>
            )}
            {role === 'employer' && (
              <NavLink to="/employer" icon={<Briefcase size={16} />} label="Buscar Talento" active={isActive('/employer')} />
            )}

            <div className="flex items-center gap-2 ml-3 pl-3 border-l border-slate-200">
              <div className={`w-8 h-8 rounded-lg ${currentUser.avatarColor || 'bg-palette-text-primary'} flex items-center justify-center text-white font-bold text-xs`}>
                {currentUser.initials || (currentUser.name && currentUser.name[0]) || 'U'}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-palette-text-small hover:text-palette-text-primary hover:bg-palette-fonto-light transition-colors"
                title="Cerrar sesion"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}

        {!currentUser && (
          <Link to="/login" className="btn-primary py-2 px-4 text-sm">
            Ingresar
          </Link>
        )}
      </div>
    </nav>
  )
}

function NavLink({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-palette-fonto-light text-palette-text-primary' : 'text-palette-text-small hover:bg-palette-fonto-light hover:text-palette-text-primary'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  )
}
