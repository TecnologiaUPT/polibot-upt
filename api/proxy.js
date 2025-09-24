export default async function handler(request, response) {
  // --- Manejo de CORS (Versión Mejorada) ---
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://uptvallesdeltuy.com,https://polibot-upt.vercel.app/').split(',');
  const origin = request.headers.origin;

  // ✨ MEJORA: Normalizamos los orígenes para evitar problemas con la barra final ("/")
  // Esto asegura que "dominio.com" y "dominio.com/" se traten como iguales.
  const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '';
  const isAllowed = allowedOrigins.some(allowed => allowed.replace(/\/$/, '') === normalizedOrigin);

  if (isAllowed) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  // --- Lógica del Proxy (sin cambios) ---
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured' });
  }

  try {
    const requestBody = { ...request.body, stream: true };

    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.json();
      return response.status(apiResponse.status).json(errorBody);
    }
    
    response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    const reader = apiResponse.body.getReader();
    const readableStream = new ReadableStream({
      start(controller) {
        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(value);
            push();
          });
        }
        push();
      }
    });

    // En lugar de response.write/end, usamos el API de streams de Vercel/Next.js
    return new Response(readableStream, {
      status: 200,
      headers: response.getHeaders()
    });

  } catch (error) {
    console.error("Error en el proxy:", error);
    // Aseguramos que la respuesta sea un objeto Response válido
    return new Response(JSON.stringify({ error: 'Internal server error in proxy' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
