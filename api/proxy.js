// api/proxy.js (Versión final con múltiples dominios permitidos)

export default async function handler(request, response) {
  // --- Lista de sitios web que tienen permiso para usar la IA ---
  const allowedOrigins = [
    'https://uptvallesdeltuy.com', 
    'https://tecnologiaupt.github.io'
  ];

  const origin = request.headers.origin;
  if (allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // El navegador envía una petición "previa" (OPTIONS) para verificar los permisos
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  // --- El resto del código es el mismo ---
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured on Vercel' });
  }

  try {
    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(request.body),
    });

    const data = await apiResponse.json();
    response.status(200).json(data);

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Error fetching from OpenRouter' });
  }
}
