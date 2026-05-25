import { useState, useEffect } from "react";
import { getUserAnalyses, deleteAnalysis } from "../services/analysisService";
import AnimatedPage from "../components/ui/AnimatedPage";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AnalysisCard({ analysis, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Seguro que quieres borrar este analisis?")) return;
    setDeleting(true);
    try {
      await deleteAnalysis(analysis.id);
      onDelete(analysis.id);
    } catch (error) {
      alert("No se pudo borrar el analisis. Intentalo de nuevo.");
      setDeleting(false);
    }
  }

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <span className="inline-block bg-primary-600/20 text-primary-400 text-xs font-medium px-2 py-1 rounded mb-2">
            {analysis.language}
          </span>
          <p className="text-slate-300 text-sm line-clamp-2 font-mono">
            {analysis.code_input}
          </p>
        </div>
        <span className="text-slate-500 text-xs whitespace-nowrap">
          {formatDate(analysis.created_at)}
        </span>
      </div>

      {analysis.explanation && (
        <p className="text-slate-400 text-sm line-clamp-2">
          {analysis.explanation}
        </p>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-400 hover:text-red-300 text-sm transition-colors disabled:opacity-50"
        >
          {deleting ? "Borrando..." : "Borrar"}
        </button>
      </div>
    </div>
  );
}

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAnalyses() {
      try {
        const data = await getUserAnalyses();
        setAnalyses(data);
      } catch (err) {
        setError("No se pudo cargar el historial. Intentalo de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalyses();
  }, []);

  function handleDelete(deletedId) {
    setAnalyses((prev) => prev.filter((a) => a.id !== deletedId));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-surface-border border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <AnimatedPage>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Mi historial</h1>
          <span className="text-slate-400 text-sm">
            {analyses.length} {analyses.length === 1 ? "analisis" : "analisis"}
          </span>
        </div>

        {analyses.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-400 mb-2">No tienes analisis guardados todavia</p>
            <p className="text-slate-500 text-sm">
              Analiza tu primer fragmento de codigo para verlo aqui
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {analyses.map((analysis) => (
              <AnalysisCard
                key={analysis.id}
                analysis={analysis}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}