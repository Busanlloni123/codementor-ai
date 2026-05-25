import { useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";
import AnimatedPage from "../components/ui/AnimatedPage";

export default function Login() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Si el usuario ya está autenticado, lo mandamos al analizador
  if (user) {
    return <Navigate to="/analyzer" replace />;
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/analyzer",
      },
    });

    if (error) {
      setError("No se pudo iniciar sesion con Google. Intentalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <AnimatedPage>
    <div className="flex justify-center py-20">
      <div className="card w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-2">Bienvenido a CodeMentor AI</h2>
        <p className="text-slate-400 mb-8">
          Inicia sesion para analizar tu codigo y guardar tu historial
        </p>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-3"
        >
          {loading ? "Redirigiendo..." : "Continuar con Google"}
        </button>

        <p className="text-slate-500 text-xs mt-6">
          Al continuar aceptas que guardemos tu historial de analisis
        </p>
      </div>
    </div>
    </AnimatedPage>
  );
}