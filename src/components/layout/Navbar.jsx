import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" fill="#2563eb" />
        <path
          d="M10 12L6 16L10 20"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 12L26 16L22 20"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 10L14 22"
          stroke="#93c5fd"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xl font-bold text-white">
        Code<span className="text-primary-400">Mentor</span>
        <span className="text-slate-400 font-normal"> AI</span>
      </span>
    </div>
  );
}

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <nav className="border-b border-surface-border bg-surface-card">
      <div className="container mx-auto px-4 max-w-5xl h-16 flex items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/analyzer"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Analizar
              </Link>
              <Link
                to="/history"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Historial
              </Link>
              <button
                onClick={handleLogout}
                className="btn-primary text-sm"
              >
                Cerrar sesion
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary text-sm">
              Iniciar sesion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}