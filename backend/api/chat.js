// ============================================================================
// NAKUNG BACKEND API - GROQ AI INTEGRATION
// Powered by Llama 3.3 70B Versatile - Lightning Fast AI
// ============================================================================

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
      return res.status(400).json({ 
        error: 'Missing or invalid messages array',
        success: false 
      });
    }

    // Get Groq API key from environment
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not configured in environment');
      return res.status(500).json({ 
        error: 'API key not configured',
        success: false 
      });
    }

    console.log(`[Nakung Backend] 🚀 Processing ${messages.length} messages with Groq AI`);

    // Call Groq API (OpenAI-compatible endpoint)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9,
        stream: false
      })
    });

    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error:', response.status, errorText);
      
      return res.status(response.status).json({ 
        error: 'AI service temporarily unavailable',
        details: errorText,
        success: false
      });
    }

    // Parse response
    const data = await response.json();
    
    // Extract AI message (OpenAI format)
    const aiMessage = data.choices?.[0]?.message?.content;
    
    if (!aiMessage) {
      console.error('❌ No message in Groq response:', JSON.stringify(data));
      return res.status(500).json({ 
        error: 'No response from AI',
        success: false
      });
    }

    console.log(`[Nakung Backend] ✅ Response generated (${aiMessage.length} chars)`);

    // Return in format expected by extension
    return res.status(200).json({
      success: true,
      message: aiMessage,
      timestamp: Date.now(),
      model: 'llama-3.3-70b-versatile'
    });

  } catch (error) {
    console.error('❌ Backend error:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      success: false
    });
  }
}
