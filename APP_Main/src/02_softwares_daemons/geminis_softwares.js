import { API_CONFIG } from '../settings';

export class GeminiApiService {
  constructor() {
    this.apiKey = API_CONFIG.GEMINI_API_KEY;
    this.apiUrl = API_CONFIG.GEMINI_API_URL;
  }

  async generateFilterCode(userQuery, csvHeaders, sampleData) {
    try {
      if (!this.apiKey || this.apiKey === 'your-gemini-api-key-here') {
        throw new Error('Gemini API key not configured');
      }

      const prompt = this.buildPrompt(userQuery, csvHeaders, sampleData);
      
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Gemini API');
      }

      const generatedCode = data.candidates[0].content.parts[0].text;
      return this.parseGeneratedCode(generatedCode);
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  buildPrompt(userQuery, csvHeaders, sampleData) {
    return `You are a data analysis assistant. Given a user query and CSV data structure, generate JavaScript filter/sort code.

CSV Headers: ${JSON.stringify(csvHeaders)}
Sample Data (first 3 rows): ${JSON.stringify(sampleData.slice(0, 3))}

User Query: "${userQuery}"

Generate JavaScript code that:
1. Filters or sorts the CSV data based on the user query
2. Returns the filtered/sorted data
3. Uses the variable names: csvData (array of arrays), headers (array of strings)
4. Only return the JavaScript code, no explanations
5. Handle edge cases like empty data, missing columns, etc.

Example for "give me the longest email":
\`\`\`javascript
// Find the row with the longest email
const emailColumnIndex = headers.findIndex(header => 
  header.toLowerCase().includes('email')
);

if (emailColumnIndex === -1) {
  return { error: 'No email column found' };
}

let longestEmailRow = null;
let maxLength = 0;

csvData.forEach((row, index) => {
  if (row[emailColumnIndex] && row[emailColumnIndex].length > maxLength) {
    maxLength = row[emailColumnIndex].length;
    longestEmailRow = { row, index };
  }
});

return longestEmailRow ? [longestEmailRow.row] : [];
\`\`\`

Now generate code for: "${userQuery}"`;
  }

  parseGeneratedCode(code) {
    // Extract JavaScript code from the response
    const codeMatch = code.match(/```javascript\n([\s\S]*?)\n```/);
    if (codeMatch) {
      return codeMatch[1];
    }
    
    // If no code blocks found, return the raw response
    return code;
  }

  async generateQuickActions(csvHeaders, sampleData) {
    try {
      if (!this.apiKey || this.apiKey === 'your-gemini-api-key-here') {
        throw new Error('Gemini API key not configured');
      }

      const prompt = this.buildQuickActionsPrompt(csvHeaders, sampleData);
      
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Quick Actions API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Quick Actions API Response:', data);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Gemini API');
      }

      const responseText = data.candidates[0].content.parts[0].text;
      return this.parseQuickActions(responseText);
      
    } catch (error) {
      console.error('Quick Actions Generation Error:', error);
      throw error;
    }
  }

  buildQuickActionsPrompt(csvHeaders, sampleData) {
    return `Based on the CSV data structure below, generate 8-12 relevant quick action buttons for data analysis.

CSV Headers: ${JSON.stringify(csvHeaders)}
Sample Data (first 3 rows): ${JSON.stringify(sampleData.slice(0, 3))}

Generate a JSON array of quick action objects. Each object should have:
- "label": A short, clear button text (max 20 characters)
- "action": A unique action identifier
- "description": A brief description of what it does
- "icon": A FontAwesome icon class (like "fas fa-sort", "fas fa-filter", etc.)

Focus on actions that make sense for this specific data structure. Consider:
- Data types (text, numbers, dates, emails, etc.)
- Column names and their likely purposes
- Common data analysis operations
- Sorting, filtering, and aggregation operations

Return ONLY a valid JSON array, no other text.

Example format:
[
  {
    "label": "Sort A-Z",
    "action": "sort_asc",
    "description": "Sort data alphabetically",
    "icon": "fas fa-sort-alpha-down"
  },
  {
    "label": "Top 10",
    "action": "top_10",
    "description": "Show first 10 rows",
    "icon": "fas fa-list-ol"
  }
]`;
  }

  parseQuickActions(responseText) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON found, return default actions
      return this.getDefaultQuickActions();
    } catch (error) {
      console.error('Error parsing quick actions:', error);
      return this.getDefaultQuickActions();
    }
  }

  async generateCode(userPrompt) {
    try {
      if (!this.apiKey || this.apiKey === 'your-gemini-api-key-here') {
        throw new Error('Gemini API key not configured');
      }

      const prompt = this.buildCodeGenerationPrompt(userPrompt);
      
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Code Generation API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
      }

      const data = await response.json();
      console.log('Code Generation API Response:', data);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Gemini API');
      }

      const generatedCode = data.candidates[0].content.parts[0].text;
      return this.parseGeneratedCode(generatedCode);
      
    } catch (error) {
      console.error('Code Generation Error:', error);
      throw error;
    }
  }

  buildCodeGenerationPrompt(userPrompt) {
    return `You are a code generation assistant. Your task is to generate ONLY HTML/CSS/JavaScript code based on user prompts.

IMPORTANT INSTRUCTIONS:
- Return ONLY the code, no explanations, no markdown formatting, no code blocks
- Generate clean, modern, and functional code
- Use semantic HTML structure
- Include inline CSS for styling
- Add JavaScript for interactivity if needed
- Make the code ready to be inserted directly into a div element
- Use modern CSS features like flexbox, grid, and CSS variables
- Ensure the code is responsive and accessible

User Prompt: "${userPrompt}"

Generate the code now:`;
  }

  async generateContent(requestData) {
    try {
      if (!this.apiKey || this.apiKey === 'your-gemini-api-key-here') {
        throw new Error('Gemini API key not configured');
      }

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestData,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('General AI API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
      }

      const data = await response.json();
      console.log('General AI API Response:', data);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Gemini API');
      }

      const responseText = data.candidates[0].content.parts[0].text;
      return {
        response: {
          text: responseText
        }
      };
      
    } catch (error) {
      console.error('General AI Search Error:', error);
      throw error;
    }
  }

  getDefaultQuickActions() {
    return [
      { label: "Sort A-Z", action: "sort_asc", description: "Sort alphabetically", icon: "fas fa-sort-alpha-down" },
      { label: "Sort Z-A", action: "sort_desc", description: "Sort reverse alphabetically", icon: "fas fa-sort-alpha-up" },
      { label: "Top 10", action: "top_10", description: "Show first 10 rows", icon: "fas fa-list-ol" },
      { label: "Bottom 10", action: "bottom_10", description: "Show last 10 rows", icon: "fas fa-list-ol" },
      { label: "Remove Empty", action: "remove_empty", description: "Remove empty rows", icon: "fas fa-trash" },
      { label: "Find Duplicates", action: "find_duplicates", description: "Find duplicate rows", icon: "fas fa-copy" },
      { label: "Export CSV", action: "export_csv", description: "Download as CSV", icon: "fas fa-download" },
      { label: "Reset View", action: "reset_view", description: "Reset to original data", icon: "fas fa-undo" }
    ];
  }
}

export const geminiApi = new GeminiApiService();
