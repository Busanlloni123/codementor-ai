import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { isTeacher, getStudents, getStudentConversations, getStudentMessages, getStudentUsage } from "../services/teacherService";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StudentCard({ student, isSelected, onClick, theme }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-colors ${
        isSelected
          ? "border-primary-500 bg-primary-600/10"
          : theme === "dark"
            ? "border-surface-border bg-surface-card hover:border-primary-600/50"
            : "border-slate-200 bg-white hover:border-primary-300"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {student.user_id.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className={`text-sm font-medium ${
            theme === "dark" ? "text-slate-200" : "text-slate-800"
          }`}>
            Estudiante
          </p>
          <p className={`text-xs ${
            theme === "dark" ? "text-slate-500" : "text-slate-400"
          }`}>
            Registrado {formatDate(student.created_at)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ConversationPanel({ student, theme }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    loadStudentData();
  }, [student]);

  async function loadStudentData() {
    setLoading(true);
    try {
      const [convData, usageData] = await Promise.all([
        getStudentConversations(student.user_id),
        getStudentUsage(student.user_id),
      ]);
      setConversations(convData);
      setUsage(usageData);
      setSelectedConv(null);
      setMessages([]);
    } catch (error) {
      console.error("Error cargando datos del estudiante:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectConversation(conv) {
    setSelectedConv(conv);
    try {
      const msgs = await getStudentMessages(conv.id);
      setMessages(msgs);
    } catch (error) {
      console.error("Error cargando mensajes:", error);
    }
  }

  const totalMessages = usage.reduce((sum, u) => sum + u.message_count, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-surface-border border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`rounded-xl p-4 border ${
          theme === "dark" ? "bg-surface-card border-surface-border" : "bg-white border-slate-200"
        }`}>
          <p className={`text-xs mb-1 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
            Conversaciones
          </p>
          <p className="text-2xl font-bold text-primary-400">{conversations.length}</p>
        </div>
        <div className={`rounded-xl p-4 border ${
          theme === "dark" ? "bg-surface-card border-surface-border" : "bg-white border-slate-200"
        }`}>
          <p className={`text-xs mb-1 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
            Mensajes totales
          </p>
          <p className="text-2xl font-bold text-primary-400">{totalMessages}</p>
        </div>
        <div className={`rounded-xl p-4 border ${
          theme === "dark" ? "bg-surface-card border-surface-border" : "bg-white border-slate-200"
        }`}>
          <p className={`text-xs mb-1 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
            Dias activo
          </p>
          <p className="text-2xl font-bold text-primary-400">{usage.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Lista de conversaciones */}
        <div>
          <h3 className={`text-sm font-medium mb-3 ${
            theme === "dark" ? "text-slate-300" : "text-slate-700"
          }`}>
            Conversaciones ({conversations.length})
          </h3>
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className={`text-sm ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                Sin conversaciones todavia
              </p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedConv?.id === conv.id
                      ? "border-primary-500 bg-primary-600/10"
                      : theme === "dark"
                        ? "border-surface-border hover:border-primary-600/50"
                        : "border-slate-200 hover:border-primary-300"
                  }`}
                >
                  <p className={`text-sm font-medium truncate ${
                    theme === "dark" ? "text-slate-200" : "text-slate-800"
                  }`}>
                    {conv.title}
                  </p>
                  <p className={`text-xs mt-1 ${
                    theme === "dark" ? "text-slate-500" : "text-slate-400"
                  }`}>
                    {formatDate(conv.updated_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mensajes de la conversación seleccionada */}
        <div>
          <h3 className={`text-sm font-medium mb-3 ${
            theme === "dark" ? "text-slate-300" : "text-slate-700"
          }`}>
            {selectedConv ? `Mensajes de "${selectedConv.title}"` : "Selecciona una conversacion"}
          </h3>
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className={`text-sm ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                {selectedConv ? "Sin mensajes" : "Haz clic en una conversacion"}
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg border text-xs ${
                    msg.role === "user"
                      ? theme === "dark"
                        ? "border-primary-600/30 bg-primary-600/10"
                        : "border-primary-200 bg-primary-50"
                      : theme === "dark"
                        ? "border-surface-border bg-surface-card"
                        : "border-slate-200 bg-white"
                  }`}
                >
                  <p className={`font-medium mb-1 ${
                    msg.role === "user" ? "text-primary-400" : theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}>
                    {msg.role === "user" ? "Estudiante" : "CodeMentor AI"}
                  </p>
                  <p className={theme === "dark" ? "text-slate-300" : "text-slate-700"}>
                    {msg.content}
                  </p>
                  {msg.corrected_code && (
                    <div className="mt-2 rounded overflow-hidden">
                      <SyntaxHighlighter
                        language={msg.language?.toLowerCase() || "java"}
                        style={theme === "dark" ? atomOneDark : atomOneLight}
                        customStyle={{ fontSize: "11px", margin: 0 }}
                      >
                        {msg.corrected_code}
                      </SyntaxHighlighter>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Teacher() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    try {
      const teacher = await isTeacher();
      if (!teacher) {
        navigate("/chat");
        return;
      }
      setAuthorized(true);
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      console.error("Error verificando acceso:", error);
      navigate("/chat");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-surface-border border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`h-full overflow-y-auto p-6 ${
        theme === "dark" ? "bg-surface" : "bg-slate-100"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Panel del Profesor</h1>
            <p className={`text-sm mt-1 ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}>
              {students.length} estudiantes registrados
            </p>
          </div>
        </div>

        {students.length === 0 ? (
          <div className={`rounded-xl border p-12 text-center ${
            theme === "dark" ? "border-surface-border bg-surface-card" : "border-slate-200 bg-white"
          }`}>
            <p className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>
              No hay estudiantes registrados todavia
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {/* Lista de estudiantes */}
            <div className="col-span-1">
              <h2 className={`text-sm font-medium mb-3 ${
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              }`}>
                Estudiantes
              </h2>
              <div className="flex flex-col gap-2">
                {students.map((student) => (
                  <StudentCard
                    key={student.user_id}
                    student={student}
                    isSelected={selectedStudent?.user_id === student.user_id}
                    onClick={() => setSelectedStudent(student)}
                    theme={theme}
                  />
                ))}
              </div>
            </div>

            {/* Panel de conversaciones */}
            <div className="col-span-3">
              {selectedStudent ? (
                <ConversationPanel student={selectedStudent} theme={theme} />
              ) : (
                <div className={`rounded-xl border p-12 text-center ${
                  theme === "dark" ? "border-surface-border bg-surface-card" : "border-slate-200 bg-white"
                }`}>
                  <p className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>
                    Selecciona un estudiante para ver sus conversaciones
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}