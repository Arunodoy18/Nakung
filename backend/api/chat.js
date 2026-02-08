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

    // Use HuggingFace Inference API with a working free model
    // Convert messages to simple prompt format
    const prompt = messages.map(m => {
      if (m.role === 'system') return `System: ${m.content}`;
      if (m.role === 'user') return `User: ${m.content}`;
      if (m.role === 'assistant') return `Assistant: ${m.content}`;
      return m.content;
    }).join('\n\n') + '\n\nAssistant:';

    const response = await fetch('https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
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
    
    // Extract AI response from Inference API format
    let aiText = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      aiText = data[0].generated_text;
    } else if (data.generated_text) {
      aiText = data.generated_text;
    } else if (data.error) {
      throw new Error(data.error);
    } else if (typeof data === 'string') {
      aiText = data;
    }

    // Clean up the response
    aiText = aiText.trim();

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
