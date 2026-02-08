// Nakung Backend API - Serverless Function
// Handles AI chat requests securely with your API key

export default async function handler(req, res) {
  // CORS headers for Chrome extension
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid messages array' });
    }

    // Get API key from environment variable (secure!)
    const API_KEY = process.env.HUGGING_FACE_API_KEY;
    
    if (!API_KEY) {
      console.error('HUGGING_FACE_API_KEY not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Call Hugging Face Router API (new v1 OpenAI-compatible endpoint)
    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.95,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('HF API error:', error);
      return res.status(response.status).json({ 
        error: 'AI service unavailable',
        details: error 
      });
    }

    const data = await response.json();
    
    // Extract AI response (OpenAI-compatible format)
    let aiText = '';
    if (data.choices && data.choices[0]?.message?.content) {
      aiText = data.choices[0].message.content;
    } else if (data.message) {
      aiText = data.message;
    } else if (typeof data === 'string') {
      aiText = data;
    }

    return res.status(200).json({
      success: true,
      message: aiText,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Backend error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
