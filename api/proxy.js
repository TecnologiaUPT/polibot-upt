export default async function handler(request, response) {
  // --- Manejo de CORS ---
  // ✅ MEJORA: Se usan variables de entorno para mayor seguridad y flexibilidad.
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://uptvallesdeltuy.com,https://polibot-upt.vercel.app/').split(',');
  const origin = request.headers.origin;

  if (allowedOrigins.includes(origin)) {
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

  // --- Lógica del Proxy ---
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
      // Si la API de OpenRouter devuelve un error, lo pasamos al cliente.
      const errorBody = await apiResponse.json();
      return response.status(apiResponse.status).json(errorBody);
    }
    
    // Configura las cabeceras para el streaming SSE (Server-Sent Events)
    response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    // Reenvía el stream de OpenRouter al cliente
    const reader = apiResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break; // El stream ha terminado
      }
      response.write(value); // Escribe el trozo de datos en la respuesta
    }
    
    response.end(); // Finaliza la respuesta cuando el stream termina

  } catch (error) {
    console.error("Error en el proxy:", error);
    if (!response.headersSent) {
      response.status(500).json({ error: 'Internal server error in proxy' });
    } else {
      // Si ya se enviaron las cabeceras, solo podemos cerrar la conexión.
      response.end();
      }
    }
  }
