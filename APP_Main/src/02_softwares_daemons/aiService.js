/**
 * AI Service - Reusable AI functions for the entire codebase
 * Provides centralized AI functionality that can be used across all components
 */

/**
 * Generic AI function that sends prompts to the Python API
 * @param {string} prompt - The prompt to send to the AI
 * @param {Object} options - Optional configuration
 * @returns {Promise<string>} - The AI response
 */
export const callAI = async (prompt, options = {}) => {
  const {
    endpoint = 'http://localhost:3001/api/run-python-command',
    timeout = 30000,
    onProgress = null
  } = options;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: `python3 main_api.py "${prompt}"`
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.text();
    return result;
  } catch (error) {
    console.error('Error calling AI:', error);
    throw new Error(`AI request failed: ${error.message}`);
  }
};

/**
 * CSV Sorter AI function - Generates Python code for CSV sorting/filtering
 * @param {Object} params - CSV sorting parameters
 * @param {string} params.columns - CSV column names (comma-separated)
 * @param {string} params.sampleRow - Sample row data (comma-separated)
 * @param {string} params.query - User query for sorting/filtering
 * @returns {Promise<string>} - Generated Python code
 */
export const generateCSVSorterCode = async ({ columns, sampleRow, query }) => {
  if (!columns?.trim() || !sampleRow?.trim() || !query?.trim()) {
    throw new Error('All CSV Sorter parameters are required');
  }

  // Try to use AI service first, fallback to JavaScript logic if it fails
  try {
    const csvPrompt = `You are a CSV data sorting expert. I need you to generate Python code that can sort and filter CSV data based on a user's natural language query.

CSV Column Names: ${columns}
Sample Row Data: ${sampleRow}
User Query: "${query}"

IMPORTANT INSTRUCTIONS:
- Only send the required Python code. Do not comment.
- The code should be complete and executable.
- Use pandas for CSV operations.
- Make the code robust with error handling.
- Handle various sorting criteria intelligently:
  * "sort by longest name" → sort by string length (descending)
  * "sort by first column" → sort by first column
  * "sort by name alphabetically" → sort alphabetically
  * "sort by date" → sort by date column
  * "sort by value" → sort by numeric value
  * "top 5" → return top 5 results
  * "latest 3" → return latest 3 results
  * "filter by status active" → filter by status column

Generate the complete Python code that implements the user's sorting request:`;

    return await callAI(csvPrompt);
  } catch (error) {
    console.warn('AI service unavailable, using JavaScript fallback:', error.message);
    return generateJavaScriptSortingCode({ columns, sampleRow, query });
  }
};

/**
 * CSV Direct Sorter AI function - Returns sorting logic for direct CSV manipulation
 * @param {Object} params - CSV sorting parameters
 * @param {string} params.columns - CSV column names (comma-separated)
 * @param {string} params.sampleRow - Sample row data (comma-separated)
 * @param {string} params.query - User query for sorting/filtering
 * @returns {Promise<Object>} - Sorting configuration object
 */
export const generateCSVDirectSort = async ({ columns, sampleRow, query }) => {
  if (!columns?.trim() || !sampleRow?.trim() || !query?.trim()) {
    throw new Error('All CSV Sorter parameters are required');
  }

  // Try to use AI service first, fallback to JavaScript logic if it fails
  try {
    const csvPrompt = `Analyze this CSV sorting request and return ONLY a JSON object:

CSV Columns: ${columns}
Sample Data: ${sampleRow}
Query: "${query}"

Return this exact JSON format:
{
  "sortColumn": 0,
  "sortDirection": "desc",
  "sortType": "number",
  "description": "Sort by salary descending"
}

Rules:
- sortColumn: column index (0, 1, 2, etc.)
- sortDirection: "asc" or "desc"
- sortType: "string", "number", "date", or "string_length"
- description: brief explanation

Examples:
- "sort by salary" → {"sortColumn": 3, "sortDirection": "desc", "sortType": "number", "description": "Sort by salary"}
- "sort by name" → {"sortColumn": 0, "sortDirection": "asc", "sortType": "string", "description": "Sort by name"}
- "top 5 by salary" → {"sortColumn": 3, "sortDirection": "desc", "sortType": "number", "limit": 5, "description": "Top 5 by salary"}

Return ONLY the JSON:`;

    const result = await callAI(csvPrompt);
    
    // Try to parse the JSON result
    try {
      // Look for JSON object in the response
      const jsonMatch = result.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Validate the parsed object has required fields
        if (parsed.sortColumn !== undefined && parsed.sortDirection && parsed.sortType) {
          return parsed;
        }
      }
    } catch (parseError) {
      console.warn('Failed to parse AI JSON response, using fallback');
    }
    
    // Fallback to JavaScript logic
    return generateJavaScriptSortingConfig({ columns, sampleRow, query });
  } catch (error) {
    console.warn('AI service unavailable, using JavaScript fallback:', error.message);
    return generateJavaScriptSortingConfig({ columns, sampleRow, query });
  }
};

/**
 * JavaScript-based sorting code generator (fallback when AI service iYs unavailable)
 */
const generateJavaScriptSortingCode = ({ columns, sampleRow, query }) => {
  const columnList = columns.split(',').map(col => col.trim());
  const sampleData = sampleRow.split(',').map(val => val.trim());
  
  const queryLower = query.toLowerCase();
  
  // Determine sorting logic based on query
  let sortLogic = '';
  let filterLogic = '';
  let limitLogic = '';
  
  // Check for specific patterns
  if (queryLower.includes('longest name') || queryLower.includes('longest')) {
    const nameColumn = columnList.findIndex(col => 
      col.toLowerCase().includes('name') || col.toLowerCase().includes('title')
    );
    if (nameColumn !== -1) {
      sortLogic = `// Sort by longest name (string length)
const sortedData = data.sort((a, b) => {
  const lengthA = (a[${nameColumn}] || '').toString().length;
  const lengthB = (b[${nameColumn}] || '').toString().length;
  return lengthB - lengthA; // Descending order
});`;
    }
  } else if (queryLower.includes('first column')) {
    sortLogic = `// Sort by first column
const sortedData = data.sort((a, b) => {
  const valA = a[0] || '';
  const valB = b[0] || '';
  return valB.toString().localeCompare(valA.toString());
});`;
  } else if (queryLower.includes('alphabetically') || queryLower.includes('alphabetical')) {
    const nameColumn = columnList.findIndex(col => 
      col.toLowerCase().includes('name') || col.toLowerCase().includes('title')
    );
    if (nameColumn !== -1) {
      sortLogic = `// Sort alphabetically
const sortedData = data.sort((a, b) => {
  const valA = (a[${nameColumn}] || '').toString();
  const valB = (b[${nameColumn}] || '').toString();
  return valA.localeCompare(valB);
});`;
    }
  } else if (queryLower.includes('date')) {
    const dateColumn = columnList.findIndex(col => 
      col.toLowerCase().includes('date') || col.toLowerCase().includes('time')
    );
    if (dateColumn !== -1) {
      sortLogic = `// Sort by date
const sortedData = data.sort((a, b) => {
  const dateA = new Date(a[${dateColumn}] || '');
  const dateB = new Date(b[${dateColumn}] || '');
  return dateB - dateA; // Latest first
});`;
    }
  } else if (queryLower.includes('value') || queryLower.includes('amount') || queryLower.includes('price')) {
    const valueColumn = columnList.findIndex(col => 
      col.toLowerCase().includes('value') || col.toLowerCase().includes('amount') || 
      col.toLowerCase().includes('price') || col.toLowerCase().includes('salary')
    );
    if (valueColumn !== -1) {
      sortLogic = `// Sort by numeric value
const sortedData = data.sort((a, b) => {
  const valA = parseFloat(a[${valueColumn}]) || 0;
  const valB = parseFloat(b[${valueColumn}]) || 0;
  return valB - valA; // Descending order
});`;
    }
  } else {
    // Default: sort by first column
    sortLogic = `// Default sort by first column
const sortedData = data.sort((a, b) => {
  const valA = a[0] || '';
  const valB = b[0] || '';
  return valB.toString().localeCompare(valA.toString());
});`;
  }
  
  // Check for "top N" or "latest N" patterns
  const topMatch = queryLower.match(/top\s+(\d+)/);
  const latestMatch = queryLower.match(/latest\s+(\d+)/);
  const limitMatch = queryLower.match(/(\d+)\s+results/);
  
  if (topMatch || latestMatch || limitMatch) {
    const limit = topMatch ? topMatch[1] : latestMatch ? latestMatch[1] : limitMatch[1];
    limitLogic = `
// Limit results
const limitedData = sortedData.slice(0, ${limit});`;
  }
  
  // Check for filter patterns
  if (queryLower.includes('filter by') || queryLower.includes('where')) {
    const statusColumn = columnList.findIndex(col => 
      col.toLowerCase().includes('status') || col.toLowerCase().includes('state')
    );
    if (statusColumn !== -1) {
      const filterValue = queryLower.includes('active') ? 'active' : 
                         queryLower.includes('inactive') ? 'inactive' : 'active';
      filterLogic = `
// Filter by status
const filteredData = sortedData.filter(row => 
  (row[${statusColumn}] || '').toString().toLowerCase() === '${filterValue}'
);`;
    }
  }
  
  const code = `// JavaScript CSV Sorting Code
// Generated for query: "${query}"
// Columns: ${columns}

function sortCSVData(data) {
  if (!data || data.length === 0) return [];
  
  ${sortLogic}
  
  ${filterLogic}
  
  ${limitLogic}
  
  return ${filterLogic ? 'filteredData' : limitLogic ? 'limitedData' : 'sortedData'};
}

// Usage example:
// const sortedResults = sortCSVData(yourCSVData);
// console.log(sortedResults);

export default sortCSVData;`;

  return code;
};

/**
 * JavaScript-based sorting configuration generator (fallback when AI service is unavailable)
 */
const generateJavaScriptSortingConfig = ({ columns, sampleRow, query }) => {
  const columnList = columns.split(',').map(col => col.trim());
  const sampleData = sampleRow.split(',').map(val => val.trim());
  
  const queryLower = query.toLowerCase();
  
  // Determine sorting logic based on query
  let sortColumn = 0; // Default to first column
  let sortDirection = 'desc';
  let sortType = 'string';
  let filterColumn = null;
  let filterValue = null;
  let limit = null;
  let description = '';
  
  // Check for specific patterns
  if (queryLower.includes('longest name') || queryLower.includes('longest')) {
    const nameColumn = columnList.findIndex(col => 
      col.toLowerCase().includes('name') || col.toLowerCase().includes('title')
    );
    if (nameColumn !== -1) {
      sortColumn = nameColumn;
      sortType = 'string_length';
      description = 'Sort by longest name (string length)';
    }
  } else if (queryLower.includes('first column')) {
    sortColumn = 0;
    description = 'Sort by first column';
  } else if (queryLower.includes('alphabetically') || queryLower.includes('alphabetical')) {
    const nameColumn = columnList.findIndex(col => 
      col.toLowerCase().includes('name') || col.toLowerCase().includes('title')
    );
    if (nameColumn !== -1) {
      sortColumn = nameColumn;
      sortDirection = 'asc';
      description = 'Sort alphabetically by name';
    }
  } else if (queryLower.includes('date')) {
    const dateColumn = columnList.findIndex(col => 
      col.toLowerCase().includes('date') || col.toLowerCase().includes('time')
    );
    if (dateColumn !== -1) {
      sortColumn = dateColumn;
      sortType = 'date';
      description = 'Sort by date';
    }
  } else if (queryLower.includes('value') || queryLower.includes('amount') || queryLower.includes('price')) {
    const valueColumn = columnList.findIndex(col => 
      col.toLowerCase().includes('value') || col.toLowerCase().includes('amount') || 
      col.toLowerCase().includes('price') || col.toLowerCase().includes('salary')
    );
    if (valueColumn !== -1) {
      sortColumn = valueColumn;
      sortType = 'number';
      description = 'Sort by numeric value';
    }
  } else {
    // Default: sort by first column
    sortColumn = 0;
    description = 'Sort by first column';
  }
  
  // Check for "top N" or "latest N" patterns
  const topMatch = queryLower.match(/top\s+(\d+)/);
  const latestMatch = queryLower.match(/latest\s+(\d+)/);
  const limitMatch = queryLower.match(/(\d+)\s+results/);
  
  if (topMatch || latestMatch || limitMatch) {
    limit = parseInt(topMatch ? topMatch[1] : latestMatch ? latestMatch[1] : limitMatch[1]);
    if (latestMatch) {
      sortType = 'date';
      sortDirection = 'desc';
    }
  }
  
  // Check for filter patterns
  if (queryLower.includes('filter by') || queryLower.includes('where')) {
    const statusColumn = columnList.findIndex(col => 
      col.toLowerCase().includes('status') || col.toLowerCase().includes('state')
    );
    if (statusColumn !== -1) {
      filterColumn = statusColumn;
      filterValue = queryLower.includes('active') ? 'active' : 
                   queryLower.includes('inactive') ? 'inactive' : 'active';
    }
  }
  
  return {
    sortColumn: sortColumn,
    sortDirection: sortDirection,
    sortType: sortType,
    filterColumn: filterColumn,
    filterValue: filterValue,
    limit: limit,
    description: description
  };
};

/**
 * Generic Python code generator
 * @param {string} task - Description of the task
 * @param {Object} context - Additional context for the task
 * @returns {Promise<string>} - Generated Python code
 */
export const generatePythonCode = async (task, context = {}) => {
  const contextString = Object.keys(context).length > 0 
    ? `\n\nAdditional Context:\n${JSON.stringify(context, null, 2)}`
    : '';

  const prompt = `Generate Python code for the following task: ${task}${contextString}

Requirements:
- The code should be complete and executable
- Include proper error handling
- Use appropriate libraries (pandas, numpy, etc.)
- Make the code robust and well-documented
- Return the complete Python code:`;

  return await callAI(prompt);
};

/**
 * Data analysis AI function
 * @param {Object} params - Analysis parameters
 * @param {string} params.dataType - Type of data (csv, json, etc.)
 * @param {string} params.analysisType - Type of analysis requested
 * @param {Object} params.dataStructure - Structure of the data
 * @returns {Promise<string>} - Analysis code
 */
export const generateDataAnalysisCode = async ({ dataType, analysisType, dataStructure }) => {
  const prompt = `Generate Python code for ${analysisType} analysis on ${dataType} data.

Data Structure: ${JSON.stringify(dataStructure, null, 2)}

Requirements:
- Use appropriate data analysis libraries (pandas, matplotlib, seaborn, etc.)
- Include data visualization if applicable
- Provide statistical insights
- Make the code modular and reusable
- Include proper error handling

Generate the complete Python code:`;

  return await callAI(prompt);
};

/**
 * File processing AI function
 * @param {Object} params - File processing parameters
 * @param {string} params.fileType - Type of file to process
 * @param {string} params.operation - Operation to perform
 * @param {Object} params.options - Additional options
 * @returns {Promise<string>} - File processing code
 */
export const generateFileProcessingCode = async ({ fileType, operation, options = {} }) => {
  const prompt = `Generate Python code for ${operation} on ${fileType} files.

Options: ${JSON.stringify(options, null, 2)}

Requirements:
- Handle file I/O operations safely
- Include proper error handling for file operations
- Make the code efficient and memory-friendly
- Support batch processing if applicable
- Include progress tracking

Generate the complete Python code:`;

  return await callAI(prompt);
};

/**
 * AI function with custom prompt template
 * @param {string} template - Prompt template with placeholders
 * @param {Object} variables - Variables to replace in template
 * @returns {Promise<string>} - AI response
 */
export const callAIWithTemplate = async (template, variables = {}) => {
  let prompt = template;
  
  // Replace variables in template
  Object.keys(variables).forEach(key => {
    const placeholder = `{{${key}}}`;
    prompt = prompt.replace(new RegExp(placeholder, 'g'), variables[key]);
  });

  return await callAI(prompt);
};

/**
 * Simple Chart Generator - Creates basic chart configurations
 * @param {Object} params - Chart parameters
 * @param {Array} params.data - CSV data array
 * @param {Array} params.headers - Column headers
 * @param {string} params.chartType - Type of chart (scatter, line, bar)
 * @param {string} params.xColumn - X-axis column name
 * @param {string} params.yColumn - Y-axis column name
 * @returns {Promise<Object>} - Chart configuration object
 */
export const generateSimpleChart = async ({ data, headers, chartType, xColumn, yColumn }) => {
  if (!data || data.length === 0) {
    throw new Error('No data provided for chart generation');
  }

  try {
    // Try AI service first
    const prompt = `Generate a simple chart configuration for this data:

Data: ${JSON.stringify(data.slice(0, 5))} (showing first 5 rows)
Headers: ${headers.join(', ')}
Chart Type: ${chartType}
X Column: ${xColumn}
Y Column: ${yColumn}

Return ONLY a JSON object with this structure:
{
  "title": "Chart Title",
  "xLabel": "X Axis Label",
  "yLabel": "Y Axis Label",
  "dataPoints": [{"x": value, "y": value}],
  "chartType": "${chartType}",
  "color": "#1f1e7a"
}

Return ONLY the JSON:`;

    const result = await callAI(prompt);
    
    // Try to parse JSON from AI response
    try {
      const jsonMatch = result.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Failed to parse AI chart response, using fallback');
    }
  } catch (error) {
    console.warn('AI service unavailable for chart generation, using fallback');
  }

  // Fallback: Generate chart configuration using JavaScript
  return generateJavaScriptChart({ data, headers, chartType, xColumn, yColumn });
};

/**
 * JavaScript-based chart configuration generator (fallback)
 */
const generateJavaScriptChart = ({ data, headers, chartType, xColumn, yColumn }) => {
  const xIndex = headers.findIndex(h => h.toLowerCase().includes(xColumn.toLowerCase()));
  const yIndex = headers.findIndex(h => h.toLowerCase().includes(yColumn.toLowerCase()));
  
  if (xIndex === -1 || yIndex === -1) {
    throw new Error('Could not find specified columns for chart');
  }

  const dataPoints = data.map(row => ({
    x: parseFloat(row[xIndex]) || 0,
    y: parseFloat(row[yIndex]) || 0,
    label: `${row[xIndex]}`
  }));

  return {
    title: `${yColumn} vs ${xColumn}`,
    xLabel: xColumn,
    yLabel: yColumn,
    dataPoints: dataPoints,
    chartType: chartType,
    color: "#1f1e7a"
  };
};

export default {
  callAI,
  generateSimpleChart,
  generatePythonCode,
  generateDataAnalysisCode,
  generateFileProcessingCode,
  callAIWithTemplate
};
