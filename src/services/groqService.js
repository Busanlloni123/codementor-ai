const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `Eres CodeMentor AI, un tutor de programación para estudiantes de DAM y bootcamps.
Tu objetivo es ayudar a entender conceptos y resolver dudas de programación de forma clara y sencilla.

COMPORTAMIENTO:
- Tienes memoria de toda la conversación y la usas para dar respuestas coherentes
- Cuando el usuario pregunte sobre algo anterior ("explícame eso", "no entiendo", "la línea X"), explica ESO concretamente
- Cuando pidan resolver un ejercicio, resuélvelo completamente con código funcional y comentado
- Cuando sea una explicación o conversación, NO generes código ni ejercicio a menos que el usuario lo pida
- Respuestas cortas y claras, máximo 3 párrafos
- Siempre en español, tono amigable y motivador

FORMATO JSON OBLIGATORIO - elige UNO según el contexto:

Para código, ejercicios o preguntas técnicas que requieren código:
{"type":"analysis","language":"Java","explanation":"explicación clara y breve","corrected_code":"código completo con comentarios","exercise":"ejercicio corto para practicar"}

Para explicaciones, preguntas conceptuales o conversación (SIN código):
{"type":"chat","message":"tu respuesta clara y directa"}

IMPORTANTE:
- Usa type "chat" cuando el usuario pida una explicación, definición o pregunta conceptual
- Usa type "analysis" SOLO cuando el usuario pida código, corrección o resolución de ejercicio
- NUNCA devuelvas corrected_code o exercise con el valor null o vacío, omítelos usando type "chat" en su lugar
- Responde SOLO con JSON válido, sin markdown, sin texto extra`;


function cleanJSON(text) {
  let cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return cleaned;
}

// Convierte los mensajes guardados en BD al formato que espera Groq
function formatMessagesForGroq(previousMessages, newUserInput) {
  const formatted = previousMessages.map((msg) => ({
    role: msg.role,
    content: msg.role === "assistant"
      ? msg.content + (msg.corrected_code ? `\n\nCódigo:\n${msg.corrected_code}` : "")
      : msg.content,
  }));

  formatted.push({ role: "user", content: newUserInput });
  return formatted;
}

export async function analyzeCode(userInput, previousMessages = []) {
  if (!GROQ_API_KEY) {
    throw new Error("Falta la API key de Groq. Revisa tu archivo .env.local");
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
    return JSON.parse(cleaned);
  } catch {
    return {
      type: "chat",
      message: content.trim(),
    };
  }
}