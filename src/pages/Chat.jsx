import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { analyzeCode } from "../services/groqService";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMessages,
  saveMessage,
  createConversation,
  updateConversationTitle,
} from "../services/conversationService";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

function CopyButton({ code }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleCopy}
      className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 border border-surface-border rounded"
    >
      {copied ? "Copiado!" : "Copiar"}
    </motion.button>
  );
}

function UserMessage({ content, theme, user }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-end items-end gap-2 mb-6"
    >
      <div className={`rounded-2xl rounded-tr-sm px-4 py-3 max-w-2xl border ${
        theme === "dark"
          ? "bg-primary-600/20 border-primary-600/30"
          : "bg-primary-50 border-primary-200"
      }`}>
        <pre className={`text-sm whitespace-pre-wrap font-mono ${
          theme === "dark" ? "text-slate-200" : "text-slate-800"
        }`}>
          {content}
        </pre>
      </div>
      {user?.user_metadata?.avatar_url ? (
        <img
          src={user.user_metadata.avatar_url}
          alt="avatar"
          className="w-8 h-8 rounded-full shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center shrink-0 text-white text-xs font-bold">
          {user?.email?.[0]?.toUpperCase() || "U"}
        </div>
      )}
    </motion.div>
  );
}

function AssistantMessage({ message, theme }) {
  if (message.role === "assistant" && !message.corrected_code && !message.exercise) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-3 mb-6"
      >
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center shrink-0 mt-1">
          <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
            <path d="M10 12L6 16L10 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 12L26 16L22 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 10L14 22" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1 max-w-2xl">
          <p className={`leading-relaxed text-sm ${
            theme === "dark" ? "text-slate-300" : "text-slate-700"
          }`}>
            {message.content}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 mb-6"
    >
      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center shrink-0 mt-1">
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
          <path d="M10 12L6 16L10 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 12L26 16L22 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 10L14 22" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex-1 flex flex-col gap-4 max-w-2xl">
        {message.content && (
          <p className={`leading-relaxed text-sm ${
            theme === "dark" ? "text-slate-300" : "text-slate-700"
          }`}>
            {message.content}
          </p>
        )}
        {message.corrected_code && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium uppercase tracking-wide ${
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              }`}>
                Codigo corregido
              </span>
              <CopyButton code={message.corrected_code} />
            </div>
            <div className="rounded-lg overflow-hidden text-sm">
              <SyntaxHighlighter
                language={message.language?.toLowerCase() || "javascript"}
                style={theme === "dark" ? atomOneDark : atomOneLight}
                showLineNumbers
              >
                {message.corrected_code}
              </SyntaxHighlighter>
            </div>
          </div>
        )}
        {message.exercise && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={`rounded-lg px-4 py-3 border ${
              theme === "dark"
                ? "bg-primary-600/10 border-primary-600/20"
                : "bg-primary-50 border-primary-200"
            }`}
          >
            <p className="text-xs font-medium text-primary-400 uppercase tracking-wide mb-2">
              Ejercicio practico
            </p>
            <p className={`text-sm leading-relaxed ${
              theme === "dark" ? "text-slate-300" : "text-slate-700"
            }`}>
              {message.exercise}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyChat({ theme }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center h-full text-center px-4"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mb-6"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M10 12L6 16L10 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 12L26 16L22 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 10L14 22" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </motion.div>
      <h2 className="text-2xl font-bold mb-3">Como puedo ayudarte?</h2>
      <p className={`max-w-md ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
        Pega tu codigo o mensaje de error y te explico que esta pasando,
        te doy el codigo corregido y un ejercicio para practicar.
      </p>
    </motion.div>
  );
}

const LANGUAGES = [
  "Auto-detectar", "Java", "Kotlin", "JavaScript",
  "Python", "SQL", "XML", "HTML", "CSS"
];

export default function Chat() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("Auto-detectar");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    setLoadingMessages(true);
    try {
      const data = await getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error("Error cargando mensajes:", error);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userInput = input.trim();
    setInput("");
    setLoading(true);
    setError(null);

    try {
      let currentConversationId = conversationId;

      if (!currentConversationId) {
        const conversation = await createConversation();
        currentConversationId = conversation.id;
        navigate(`/chat/${currentConversationId}`, { replace: true });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const userMessage = await saveMessage({
        conversation_id: currentConversationId,
        role: "user",
        content: userInput,
      });

      setMessages((prev) => [...prev, userMessage]);

      const prompt = language !== "Auto-detectar"
        ? `Lenguaje: ${language}\n\n${userInput}`
        : userInput;

      const analysis = await analyzeCode(prompt, messages);

      const assistantMessage = await saveMessage({
        conversation_id: currentConversationId,
        role: "assistant",
        content: analysis.type === "chat" ? analysis.message : analysis.explanation,
        language: analysis.language || null,
        corrected_code: analysis.corrected_code || null,
        exercise: analysis.exercise || null,
      });

      setMessages((prev) => [...prev, assistantMessage]);

      const title = userInput.slice(0, 40) + (userInput.length > 40 ? "..." : "");
      await updateConversationTitle(currentConversationId, title);

    } catch (err) {
      setError(err.message || "No se pudo obtener respuesta. Intentalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={`flex flex-col h-full transition-colors duration-300 ${
      theme === "dark" ? "bg-surface" : "bg-slate-100"
    }`}>

      {/* Area de mensajes */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loadingMessages ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-surface-border border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyChat theme={theme} />
        ) : (
          <div className="max-w-3xl mx-auto">
            <AnimatePresence>
              {messages.map((message) =>
                message.role === "user" ? (
                  <UserMessage key={message.id} content={message.content} theme={theme} user={user} />
                ) : (
                  <AssistantMessage key={message.id} message={message} theme={theme} />
                )
              )}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-3 mb-6"
              >
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                    <path d="M10 12L6 16L10 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 12L26 16L22 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18 10L14 22" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className={`rounded-2xl rounded-tl-sm px-4 py-3 border ${
                  theme === "dark"
                    ? "bg-surface-card border-surface-border"
                    : "bg-white border-slate-200"
                }`}>
                  <div className="flex items-center gap-1 h-5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-primary-400 rounded-full"
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mb-6"
              >
                <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className={`rounded-2xl rounded-tl-sm px-4 py-3 border flex items-center gap-3 ${
                  theme === "dark"
                    ? "bg-red-900/20 border-red-500/30"
                    : "bg-red-50 border-red-200"
                }`}>
                  <p className="text-red-400 text-sm">{error}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setError(null);
                      setInput(messages[messages.length - 1]?.content || "");
                    }}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-2 py-1 rounded shrink-0"
                  >
                    Reintentar
                  </motion.button>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`border-t p-4 transition-colors duration-300 ${
          theme === "dark"
            ? "border-surface-border"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <div className={`rounded-2xl overflow-hidden border transition-colors duration-300 ${
            theme === "dark"
              ? "bg-surface-card border-surface-border"
              : "bg-white border-slate-200"
          }`}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pega tu codigo o mensaje de error... (Enter para enviar, Shift+Enter para nueva linea)"
              rows={4}
              className={`w-full bg-transparent px-4 pt-4 pb-2 focus:outline-none resize-none text-sm font-mono ${
                theme === "dark"
                  ? "text-slate-100 placeholder-slate-500"
                  : "text-slate-900 placeholder-slate-400"
              }`}
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 border ${
                  theme === "dark"
                    ? "bg-surface border-surface-border text-slate-400"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="btn-primary text-sm px-4 py-2"
              >
                {loading ? "Analizando..." : "Enviar"}
              </motion.button>
            </div>
          </div>
          <p className={`text-xs text-center mt-2 ${
            theme === "dark" ? "text-slate-600" : "text-slate-400"
          }`}>
            Enter para enviar, Shift+Enter para nueva linea
          </p>
        </div>
      </motion.div>
    </div>
  );
}