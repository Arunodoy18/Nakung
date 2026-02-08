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

    // Build Mistral prompt from messages
    const prompt = buildMistralPromptFromMessages(messages);

    // Call Hugging Face API (updated to new router endpoint February 2026)
    const response = await fetch('https://router.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 512,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.15,
          do_sample: true,
          return_full_text: false
        },
        options: {
          use_cache: false,
          wait_for_model: true
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
    
    // Extract AI response
    let aiText = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      aiText = data[0].generated_text;
    } else if (data.generated_text) {
      aiText = data.generated_text;
    } else if (typeof data === 'string') {
      aiText = data;
    }

    // Clean response
    aiText = aiText.replace(/\[INST\]|\[\/INST\]/g, '').trim();

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

// Build Mistral instruction prompt from messages array
function buildMistralPromptFromMessages(messages) {
  // First message should be system prompt
  let conversation = '<s>[INST] ';
  
  messages.forEach((msg, index) => {
    if (msg.role === 'system') {
      conversation += `${msg.content}\n\n`;
    } else if (msg.role === 'user') {
      if (index > 0) conversation += '\n\nStudent: ';
      conversation += msg.content;
    } else if (msg.role === 'assistant') {
      conversation += ' [/INST]\n\n' + msg.content + '\n\n<s>[INST] ';
    }
  });
  
  conversation += ' [/INST]';
  
  return conversation;
}
