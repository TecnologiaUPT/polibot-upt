// api/proxy.js

export default async function handler(request, response) {
  // Solo permite peticiones POST
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  // Obtiene la clave secreta de las variables de entorno de Vercel (es seguro)
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Envía la petición desde nuestro servidor a OpenRouter
    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(request.body), // Reenvía el cuerpo de la petición original
    });

    // Devuelve la respuesta de OpenRouter al chatbot
    const data = await apiResponse.json();
    response.status(200).json(data);

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Error fetching from OpenRouter' });
  }
}
