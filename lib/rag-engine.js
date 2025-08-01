const fs = require('fs');
const path = require('path');

class RAGEngine {
  constructor() {
    this.knowledgeBase = null;
    this.loadKnowledgeBase();
  }

  loadKnowledgeBase() {
    try {
      const kbPath = path.join(__dirname, '../data/knowledge-base.json');
      const rawData = fs.readFileSync(kbPath, 'utf8');
      this.knowledgeBase = JSON.parse(rawData);
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
      this.knowledgeBase = { categories: {}, tools_database: {} };
    }
  }

  // Simple keyword-based matching (can be upgraded to vector search later)
  findBestMatch(userPrompt) {
    const prompt = userPrompt.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    // Check each category
    for (const [categoryKey, category] of Object.entries(this.knowledgeBase.categories)) {
      let score = 0;

      // Score based on keyword matches
      for (const keyword of category.keywords) {
        if (prompt.includes(keyword.toLowerCase())) {
          score += 2; // Keyword match worth 2 points
        }
      }

      // Score based on example title matches
      for (const example of category.examples) {
        const titleWords = example.title.toLowerCase().split(' ');
        for (const word of titleWords) {
          if (prompt.includes(word) && word.length > 3) {
            score += 1; // Title word match worth 1 point
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          category: categoryKey,
          categoryData: category,
          score: score
        };
      }
    }

    return bestMatch;
  }

  // Find the most relevant example within a category
  findBestExample(category, userPrompt) {
    const prompt = userPrompt.toLowerCase();
    let bestExample = category.examples[0]; // Default to first example
    let bestScore = 0;

    for (const example of category.examples) {
      let score = 0;
      
      // Score based on title similarity
      const titleWords = example.title.toLowerCase().split(' ');
      for (const word of titleWords) {
        if (prompt.includes(word) && word.length > 2) {
          score += 2;
        }
      }

      // Score based on tool mentions
      for (const tool of example.tools) {
        if (prompt.includes(tool.toLowerCase())) {
          score += 3;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestExample = example;
      }
    }

    return bestExample;
  }

  // Enhanced response generation using RAG
  generateEnhancedResponse(userPrompt) {
    const match = this.findBestMatch(userPrompt);
    
    if (!match || match.score < 2) {
      // No good match found, return null to use OpenAI
      return null;
    }

    const bestExample = this.findBestExample(match.categoryData, userPrompt);
    
    // Create enhanced response with context
    const enhancedResponse = {
      tools: bestExample.tools,
      steps: bestExample.steps,
      notes: [
        ...bestExample.notes,
        `This is a ${match.categoryData.name.toLowerCase()} project - one of our most popular categories!`
      ],
      links: bestExample.links,
      rag_match: {
        category: match.category,
        confidence: Math.min(match.score / 10, 1), // Normalize to 0-1
        example_used: bestExample.id
      }
    };

    return enhancedResponse;
  }

  // Get category suggestions for the frontend
  getCategorySuggestions() {
    const suggestions = [];
    
    for (const [key, category] of Object.entries(this.knowledgeBase.categories)) {
      suggestions.push({
        id: key,
        name: category.name,
        keywords: category.keywords.slice(0, 5), // Top 5 keywords
        example_count: category.examples.length
      });
    }

    return suggestions;
  }

  // Get popular tool combinations
  getPopularToolCombos() {
    const combos = [];
    
    for (const category of Object.values(this.knowledgeBase.categories)) {
      for (const example of category.examples) {
        combos.push({
          title: example.title,
          tools: example.tools,
          category: category.name
        });
      }
    }

    return combos.slice(0, 10); // Return top 10
  }

  // Get detailed tool information
  getToolInfo(toolName) {
    const toolKey = toolName.toLowerCase().replace('.', '').replace(' ', '');
    return this.knowledgeBase.tools_database[toolKey] || null;
  }

  // Suggest related tools based on current selection
  suggestRelatedTools(currentTools) {
    const suggestions = new Set();
    
    for (const category of Object.values(this.knowledgeBase.categories)) {
      for (const example of category.examples) {
        // If this example contains any of the current tools
        const hasMatch = example.tools.some(tool => 
          currentTools.some(current => 
            current.toLowerCase().includes(tool.toLowerCase())
          )
        );
        
        if (hasMatch) {
          example.tools.forEach(tool => {
            if (!currentTools.includes(tool)) {
              suggestions.add(tool);
            }
          });
        }
      }
    }

    return Array.from(suggestions).slice(0, 5);
  }
}

module.exports = RAGEngine;