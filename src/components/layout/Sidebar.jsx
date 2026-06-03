import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getConversations, createConversation, deleteConversation } from "../../services/conversationService";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#2563eb" />
        <path d="M10 12L6 16L10 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 12L26 16L22 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 10L14 22" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="font-bold text-white">
        Code<span className="text-primary-400">Mentor</span>
        <span className="text-slate-400 font-normal text-sm"> AI</span>
      </span>
    </div>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  async function loadConversations() {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Error cargando conversaciones:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleNewChat() {
    try {
      const conversation = await createConversation();
      setConversations((prev) => [conversation, ...prev]);
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      console.error("Error creando conversacion:", error);
    }
  }

  async function handleDeleteConversation(id) {
    if (!confirm("¿Seguro que quieres borrar esta conversacion?")) return;
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (conversationId === id) {
        navigate("/chat");
      }
    } catch (error) {
      console.error("Error borrando conversacion:", error);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`w-64 h-full flex flex-col shrink-0 border-r transition-colors duration-300 ${
        theme === "dark"
          ? "bg-surface-card border-surface-border"
          : "bg-white border-slate-200"
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${
        theme === "dark" ? "border-surface-border" : "border-slate-200"
      }`}>
        <Link to="/">
          <Logo />
        </Link>
      </div>

      {/* Botón nuevo chat */}
      <div className="p-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNewChat}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
            theme === "dark"
              ? "border-surface-border text-slate-300 hover:bg-surface hover:text-white"
              : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo chat
        </motion.button>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-surface-border border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-xs text-center py-4 ${
              theme === "dark" ? "text-slate-500" : "text-slate-400"
            }`}
          >
            No hay conversaciones todavia
          </motion.p>
        ) : (
          <div className="flex flex-col gap-1">
            <AnimatePresence>
              {conversations.map((conv, index) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="group relative"
                >
                  <Link
                    to={`/chat/${conv.id}`}
                    className={`block px-3 py-2 rounded-lg text-sm truncate transition-colors pr-8 ${
                      conversationId === conv.id
                        ? "bg-primary-600/20 text-primary-400"
                        : theme === "dark"
                          ? "text-slate-400 hover:bg-surface hover:text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {conv.title}
                  </Link>
                  <button
                    onClick={() => handleDeleteConversation(conv.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer con usuario */}
      {user && (
        <div className={`p-3 border-t ${
          theme === "dark" ? "border-surface-border" : "border-slate-200"
        }`}>
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="avatar"
                className="w-7 h-7 rounded-full"
              />
            )}
            <span className={`text-xs truncate flex-1 ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}>
              {user.email}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors shrink-0 ${
                theme === "dark"
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleLogout}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
              theme === "dark"
                ? "text-slate-400 hover:bg-surface hover:text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            Cerrar sesion
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}