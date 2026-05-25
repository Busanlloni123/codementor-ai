import { useState } from "react";
import { analyzeCode } from "../services/groqService";
import { saveAnalysis } from "../services/analysisService";
import { useAuth } from "../context/AuthContext";
import AnimatedPage from "../components/ui/AnimatedPage";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

function AnalysisResult({ result, onSave, saving, saved }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!result.corrected_code) return;
    await navigator.clipboard.writeText(result.corrected_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6 mt-8">
      <div className="card">
        <h2 className="text-lg font-semibold mb-3 text-primary-400">
          Explicacion
        </h2>
        <p className="text-slate-300 leading-relaxed">{result.explanation}</p>
      </div>

      {result.corrected_code && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-primary-400">
              Codigo corregido
            </h2>
            <button
              onClick={handleCopy}
              className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1 border border-surface-border rounded-lg"
            >
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <div className="rounded-lg overflow-hidden text-sm">
            <SyntaxHighlighter
              language={result.language?.toLowerCase() || "javascript"}
              style={atomOneDark}
              showLineNumbers
            >
              {result.corrected_code}
            </SyntaxHighlighter>
          </div>
        </div>
      )}

      {result.exercise && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-3 text-primary-400">
            Ejercicio practico
          </h2>
          <p className="text-slate-300 leading-relaxed">{result.exercise}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving || saved}
          className="btn-primary"
        >
          {saved ? "Guardado en historial" : saving ? "Guardando..." : "Guardar en historial"}
        </button>
      </div>
    </div>
  );
}

const LANGUAGES = [
  "Auto-detectar", "Java", "Kotlin", "JavaScript",
  "Python", "SQL", "XML", "HTML", "CSS"
];

export default function Analyzer() {
  const { user } = useAuth();
  const [codeInput, setCodeInput] = useState("");
  const [language, setLanguage] = useState("Auto-detectar");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleAnalyze() {
    if (!codeInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);

    const input = language !== "Auto-detectar"
      ? `Lenguaje: ${language}\n\n${codeInput}`
      : codeInput;

    try {
      const analysis = await analyzeCode(input);
      setResult(analysis);
    } catch (err) {
      setError(err.message || "No se pudo analizar el codigo. Intentalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result || !user) return;

    setSaving(true);
    try {
      await saveAnalysis({
        user_id: user.id,
        code_input: codeInput,
        language: result.language || language || "unknown",
        explanation: result.explanation,
        corrected_code: result.corrected_code,
        exercise: result.exercise,
      });
      setSaved(true);
    } catch (err) {
      setError("No se pudo guardar el analisis. Intentalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatedPage>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Analizar codigo</h1>
        <p className="text-slate-400 mb-6">
          Pega tu codigo o mensaje de error y recibe una explicacion pedagogica
        </p>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="code-input"
              className="block text-sm font-medium text-slate-300"
            >
              Tu codigo o mensaje de error
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-surface border border-surface-border text-slate-300 text-sm rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <textarea
            id="code-input"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Pega aqui tu codigo o el mensaje de error..."
            rows={10}
            className="input-base font-mono text-sm resize-none"
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-slate-500 text-xs">
              {codeInput.length} caracteres
            </span>
            <button
              onClick={handleAnalyze}
              disabled={loading || !codeInput.trim()}
              className="btn-primary"
            >
              {loading ? "Analizando..." : "Analizar"}
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 mt-8 text-slate-400">
            <div className="w-5 h-5 border-2 border-surface-border border-t-primary-500 rounded-full animate-spin" />
            <span>La IA esta analizando tu codigo...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg px-4 py-3 mt-6 text-sm">
            {error}
          </div>
        )}

        {result && (
          <AnalysisResult
            result={result}
            onSave={handleSave}
            saving={saving}
            saved={saved}
          />
        )}
      </div>
    </AnimatedPage>
  );
}