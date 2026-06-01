const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `Eres CodeMentor AI, un tutor de programación especializado en DAM.
Tu única función es ayudar con programación y desarrollo de software.

RESPONDE SOLO A:
- Código, errores, bugs
- Lenguajes: Java, Kotlin, JavaScript, Python, SQL, HTML, CSS, XML
- Conceptos de programación, algoritmos, estructuras de datos
- Frameworks, librerías, herramientas de desarrollo
- Bases de datos, consultas SQL
- Preguntas sobre DAM

SI TE PREGUNTAN CUALQUIER OTRA COSA responde exactamente con este JSON:
{"type":"chat","message":"Solo puedo ayudarte con programación y desarrollo de software. ¿Tienes alguna duda sobre código?"}

FORMATO JSON SIN MARKDOWN:
Para código o preguntas técnicas:
{"type":"analysis","language":"lenguaje","explanation":"explicación","corrected_code":"código o null","exercise":"ejercicio"}

Para conceptos de programación o saludos:
{"type":"chat","message":"respuesta"}`;

// Lista blanca de temas permitidos
const ALLOWED_TOPICS = [
  "codigo", "código", "error", "bug", "excepcion", "excepción", "warning",
  "funcion", "función", "método", "metodo", "clase", "objeto", "instancia",
  "variable", "constante", "array", "lista", "mapa", "hashmap", "arraylist",
  "bucle", "loop", "for", "while", "if", "else", "switch", "case",
  "java", "kotlin", "javascript", "python", "sql", "html", "css", "xml",
  "react", "android", "spring", "maven", "gradle", "node", "typescript",
  "base de datos", "database", "tabla", "consulta", "query", "select",
  "insert", "update", "delete", "join", "index", "clave primaria",
  "algoritmo", "estructura de datos", "recursion", "recursividad",
  "herencia", "polimorfismo", "encapsulamiento", "abstraccion", "interfaz",
  "poo", "orientado a objetos", "programacion", "programación", "desarrollar",
  "compilar", "ejecutar", "depurar", "debug", "ide", "editor",
  "git", "github", "commit", "branch", "merge", "api", "rest", "json",
  "http", "request", "response", "servidor", "cliente", "frontend", "backend",
  "dam", "desarrollo de aplicaciones", "multiplataforma",
  "null", "void", "return", "import", "package", "extends", "implements",
  "public", "private", "protected", "static", "final", "abstract",
  "try", "catch", "throw", "throws", "finally",
  "string", "int", "float", "double", "boolean", "char", "long",
  "terminal", "consola", "comando", "linux", "windows",
  "explicame", "explica", "como se hace", "como hago", "que es",
  "diferencia entre", "cuando usar", "para que sirve",
];

// Lista negra de temas prohibidos
const BLOCKED_TOPICS = [
  "receta", "cocina", "comida", "ingrediente", "hornear", "cocinar",
  "guerra", "historia", "politica", "presidente", "gobierno", "rey", "reina",
  "futbol", "deporte", "jugador", "equipo", "liga", "champions",
  "pelicula", "serie", "musica", "cancion", "artista", "actor", "actriz",
  "tiempo", "clima", "temperatura", "grados", "lluvia",
  "pais", "ciudad", "capital", "geografia", "continente",
  "matematicas", "fisica", "quimica", "biologia",
  "filosofia", "religion", "dios", "iglesia",
  "economia", "finanzas", "bolsa", "dinero", "precio",
  "medicina", "enfermedad", "sintoma", "doctor",
  "animal", "planta", "naturaleza",
];

function classifyMessage(text) {
  const lower = text.toLowerCase();

  // Saludos básicos siempre permitidos
  const basicGreetings = ["hola", "gracias", "ok", "vale", "adios", "hasta luego", "de nada", "perfecto", "entendido"];
  if (basicGreetings.some((g) => lower.trim() === g || lower.trim() === g + "!" || lower.trim() === g + ".")) {
    return true;
  }

  // Si contiene algún tema bloqueado, rechazar directamente
  if (BLOCKED_TOPICS.some((topic) => lower.includes(topic))) {
    return false;
  }

  // Si contiene algún tema permitido, aceptar
  if (ALLOWED_TOPICS.some((topic) => lower.includes(topic))) {
    return true;
  }

  // Si no está en ninguna lista, rechazar por defecto
  return false;
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
  const formatted = previousMessages.map((msg) => ({
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

  // Clasificamos el mensaje localmente sin llamar a la API
  if (!classifyMessage(userInput)) {
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