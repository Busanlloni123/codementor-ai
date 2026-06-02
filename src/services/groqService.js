const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `Eres CodeMentor AI, un tutor de programación especializado en DAM (Desarrollo de Aplicaciones Multiplataforma).
Ayudas exclusivamente con programación, código y desarrollo de software.
Tienes memoria de la conversación y la usas para dar respuestas coherentes.
Habla siempre en español con un tono cercano y pedagógico.
Respuestas claras y concisas, máximo 3 párrafos.

FORMATO DE RESPUESTA - SOLO JSON VÁLIDO SIN MARKDOWN:

Para código, errores o preguntas técnicas con código:
{"type":"analysis","language":"lenguaje","explanation":"explicación clara","corrected_code":"código completo con comentarios o null","exercise":"ejercicio práctico"}

Para preguntas conceptuales, saludos o conversación sobre programación:
{"type":"chat","message":"respuesta clara y amigable"}

Si te preguntan algo que no es programación responde:
{"type":"chat","message":"Solo puedo ayudarte con programación y desarrollo de software. ¿Tienes alguna duda sobre código?"}`;

const BLOCKED_TOPICS = [
  "receta", "cocina", "comida", "ingrediente", "hornear", "cocinar",
  "guerra mundial", "historia de", "politica", "presidente de",
  "quien es messi", "quien es ronaldo", "quien es trump", "quien es",
  "futbol", "deporte", "jugador de", "pelicula", "serie de tv",
  "cancion de", "artista musical", "tiempo meteorologico", "clima de",
  "capital de", "geografia", "medicina", "enfermedad",
];

function isBlocked(text) {
  const lower = text.toLowerCase();
  return BLOCKED_TOPICS.some((topic) => lower.includes(topic));
}

function cleanJSON(text) {
  let cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return cleaned;
}

function formatMessagesForGroq(previousMessages, newUserInput) {
  // Solo mandamos los últimos 6 mensajes para no sobrecargar el contexto
  const recentMessages = previousMessages.slice(-6);
  const formatted = recentMessages.map((msg) => ({
    role: msg.role,
    content: msg.role === "assistant"
      ? msg.content + (msg.corrected_code ? `\n\nCódigo:\n${msg.corrected_code}` : "")
      : msg.content,
  }));
  formatted.push({ role: "user", content: newUserInput });
  return formatted;
}

function sanitizeResponse(obj) {
  return {
    ...obj,
    corrected_code: obj.corrected_code === "null" || obj.corrected_code === ""
      ? null : obj.corrected_code,
    exercise: obj.exercise === "null" || obj.exercise === ""
      ? null : obj.exercise,
  };
}

export async function analyzeCode(userInput, previousMessages = []) {
  if (!GROQ_API_KEY) {
    throw new Error("Falta la API key de Groq. Revisa tu archivo .env.local");
  }

  // Filtro simple y directo
  if (isBlocked(userInput)) {
    return {
      type: "chat",
      message: "Solo puedo ayudarte con programación y desarrollo de software. ¿Tienes alguna duda sobre código, errores o conceptos de programación?",
    };
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...formatMessagesForGroq(previousMessages, userInput),
  ];

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.3,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Error de Groq: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    const cleaned = cleanJSON(content);
    const parsed = JSON.parse(cleaned);
    return sanitizeResponse(parsed);
  } catch {
    return {
      type: "chat",
      message: content.trim(),
    };
  }
}