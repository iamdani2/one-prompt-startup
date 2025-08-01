const express = require('express');
const cors = require('cors');
const path = require('path');
const RAGEngine = require('./lib/rag-engine');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize RAG Engine
const ragEngine = new RAGEngine();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for generating startup ideas
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // First, try RAG system for instant, curated responses
    const ragResponse = ragEngine.generateEnhancedResponse(prompt);
    
    if (ragResponse && ragResponse.rag_match.confidence > 0.3) {
      // High confidence RAG match - return immediately
      console.log(`RAG match found for "${prompt}" with confidence ${ragResponse.rag_match.confidence}`);
      return res.status(200).json({
        ...ragResponse,
        source: 'rag',
        response_time: 'instant'
      });
    }

    // Fallback to OpenAI for novel or complex queries
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured and no RAG match found' });
    }
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful, slightly playful assistant for indie hackers and no-code builders. 
Given a short product idea, return:
1. Suggested no-code/vibe-code stack (popular tools like Notion, Airtable, Webflow, Tally, Make, Zapier, Super.so, Softr, etc.)
2. 3–5 simple, clear steps to build it
3. Optional: known challenges, key tips
4. Optional: links to relevant docs or guides

Output JSON like:
{
  "tools": ["Notion", "Super.so", "Tally"],
  "steps": ["Create a Notion database with job listings", "Use Super.so to make it public", "Add a Tally form for submissions"],
  "notes": ["This setup won't scale past 5K items", "Consider Airtable for better filtering"],
  "links": ["https://super.so/notion-guide", "https://tally.so/help"]
}

Be fast, useful, and opinionated. If the idea makes no sense or is too vague, suggest they be more specific.
Focus on no-code tools that actually exist and work well together.
Keep steps actionable and realistic for someone building their first startup.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return res.status(response.status).json({ 
        error: 'OpenAI API error',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      result = {
        tools: ["Manual research needed"],
        steps: [content],
        notes: ["AI response wasn't in expected format"],
        links: []
      };
    }

    // Ensure all required fields exist
    result.tools = result.tools || [];
    result.steps = result.steps || [];
    result.notes = result.notes || [];
    result.links = result.links || [];

    return res.status(200).json({
      ...result,
      source: 'openai',
      response_time: 'ai_generated'
    });
    
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get category suggestions
app.get('/api/categories', (req, res) => {
  try {
    const suggestions = ragEngine.getCategorySuggestions();
    res.json(suggestions);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

// Get popular tool combinations
app.get('/api/popular-tools', (req, res) => {
  try {
    const combos = ragEngine.getPopularToolCombos();
    res.json(combos);
  } catch (error) {
    console.error('Error getting popular tools:', error);
    res.status(500).json({ error: 'Failed to load popular tools' });
  }
});

// Get tool information
app.get('/api/tools/:toolName', (req, res) => {
  try {
    const toolInfo = ragEngine.getToolInfo(req.params.toolName);
    if (toolInfo) {
      res.json(toolInfo);
    } else {
      res.status(404).json({ error: 'Tool not found' });
    }
  } catch (error) {
    console.error('Error getting tool info:', error);
    res.status(500).json({ error: 'Failed to load tool information' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    rag_loaded: !!ragEngine.knowledgeBase.categories,
    categories_count: Object.keys(ragEngine.knowledgeBase.categories || {}).length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 One Prompt Startup server running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
});