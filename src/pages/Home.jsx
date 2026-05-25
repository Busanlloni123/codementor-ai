import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AnimatedPage from "../components/ui/AnimatedPage";

function FeatureCard({ title, description }) {
  return (
    <div className="card flex flex-col gap-2">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-white mb-1">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();

  return (
    <AnimatedPage>
      <div className="max-w-4xl mx-auto">

        {/* Hero */}
        <div className="text-center py-16">
          <span className="inline-block bg-primary-600/20 text-primary-400 text-sm font-medium px-3 py-1 rounded-full mb-6">
            Herramienta educativa para DAM y bootcamps
          </span>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Aprende de tus{" "}
            <span className="text-primary-500">errores de codigo</span>
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Pega tu codigo o mensaje de error y recibe una explicacion pedagogica
            en español, el codigo corregido y un ejercicio practico para reforzar
            el concepto.
          </p>
          <div className="flex justify-center">
            {user ? (
              <Link to="/chat" className="btn-primary text-base px-8 py-3">
                Ir al chat
              </Link>
            ) : (
              <Link to="/login" className="btn-primary text-base px-8 py-3">
                Iniciar sesion con Google
              </Link>
            )}
          </div>
        </div>

        {/* Caracteristicas */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Todo lo que necesitas para aprender
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              title="Explicacion pedagogica"
              description="No solo te dice que esta mal, te explica el por que en español claro y con contexto educativo."
            />
            <FeatureCard
              title="Codigo corregido y comentado"
              description="Recibe el codigo corregido con comentarios que explican cada cambio realizado."
            />
            <FeatureCard
              title="Ejercicio practico"
              description="Refuerza el concepto aprendido con un ejercicio diseñado especificamente para tu error."
            />
            <FeatureCard
              title="Historial personal"
              description="Guarda tus analisis y revisa tu progreso. Aprende de los errores que ya cometiste."
            />
          </div>
        </div>

        {/* Como funciona */}
        <div className="card mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Como funciona</h2>
          <div className="flex flex-col gap-6">
            <StepCard
              number="1"
              title="Pega tu codigo o error"
              description="Copia el fragmento de codigo que falla o el mensaje de error que no entiendes."
            />
            <StepCard
              number="2"
              title="La IA lo analiza"
              description="Nuestro modelo de inteligencia artificial analiza el codigo y detecta el problema."
            />
            <StepCard
              number="3"
              title="Recibe una explicacion completa"
              description="Obtienes la explicacion del error, el codigo corregido y un ejercicio para practicar."
            />
            <StepCard
              number="4"
              title="Guarda y repasa"
              description="Guarda el analisis en tu historial para consultarlo cuando lo necesites."
            />
          </div>
        </div>

        {/* Lenguajes soportados */}
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold mb-4">Lenguajes soportados</h2>
          <p className="text-slate-400 mb-6">
            Especializado en el curriculum de DAM pero compatible con cualquier lenguaje
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Java", "Kotlin", "JavaScript", "Python", "SQL", "XML", "HTML", "CSS"].map((lang) => (
              <span
                key={lang}
                className="bg-surface-card border border-surface-border text-slate-300 px-4 py-2 rounded-lg text-sm"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        {/* CTA final */}
        {!user && (
          <div className="card text-center py-12 mb-8">
            <h2 className="text-2xl font-bold mb-3">Listo para empezar?</h2>
            <p className="text-slate-400 mb-6">
              Inicia sesion con Google y analiza tu primer fragmento de codigo gratis
            </p>
            <Link to="/login" className="btn-primary text-base px-8 py-3">
              Iniciar sesion con Google
            </Link>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}