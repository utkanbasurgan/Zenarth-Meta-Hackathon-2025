const express = require('express');
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store active SSH connections
const connections = new Map();

app.post('/api/run-python-with-prompt', async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt || !prompt.trim()) {
    return res.status(400).send('Error: No prompt provided');
  }
  
  try {
    // Set the API directory path
    const apiPath = '/Users/utkan.basurgan/Main/1. Works Files/2. Gits Works/Zenarth-Meta-Hackathon-2025/APP_Api';
    
    // Create a temporary Python script with the user's prompt in the API directory
    const tempScriptPath = path.join(apiPath, 'temp_python_script.py');
    const pythonCode = prompt.trim();
    
    // Write the user's code to a temporary file in the API directory
    fs.writeFileSync(tempScriptPath, pythonCode);
    
    // Execute the Python script from the API directory with virtual environment
    const command = `cd "${apiPath}" && source venv/bin/activate && python3 temp_python_script.py`;
    const { stdout, stderr } = await execAsync(command, { shell: '/bin/bash' });
    
    // Clean up the temporary file
    if (fs.existsSync(tempScriptPath)) {
      fs.unlinkSync(tempScriptPath);
    }
    
    if (stderr) {
      console.error('Python script stderr:', stderr);
    }
    
    const output = stdout || stderr || 'No output from Python script';
    res.send(output);
  } catch (error) {
    console.error('Python script execution error:', error);
    
    // Clean up temporary file if it exists
    const apiPath = '/Users/utkan.basurgan/Main/1. Works Files/2. Gits Works/Zenarth-Meta-Hackathon-2025/APP_Api';
    const tempScriptPath = path.join(apiPath, 'temp_python_script.py');
    if (fs.existsSync(tempScriptPath)) {
      fs.unlinkSync(tempScriptPath);
    }
    
    res.status(500).send(`Error executing Python script: ${error.message}`);
  }
});

// Python command execution endpoint for Project1
app.post('/api/run-python-command', async (req, res) => {
  const { command } = req.body;
  
  if (!command || !command.trim()) {
    return res.status(400).send('Error: No command provided');
  }
  
  try {
    // Set the API directory path
    const apiPath = '/Users/utkan.basurgan/Main/1. Works Files/2. Gits Works/Zenarth-Meta-Hackathon-2025/APP_Api';
    
    // Check if this is a main_api.py command with complex prompts
    if (command.includes('main_api.py') && command.includes('"')) {
      // Extract the prompt from the command
      const promptMatch = command.match(/main_api\.py\s+"([^"]+)"/);
      if (promptMatch) {
        const prompt = promptMatch[1];
        
        // Create a temporary file for the prompt
        const tempPromptFile = path.join(apiPath, 'temp_prompt.txt');
        fs.writeFileSync(tempPromptFile, prompt);
        
        // Execute with the prompt file
        const fullCommand = `cd "${apiPath}" && source venv/bin/activate && python3 main_api.py "$(cat temp_prompt.txt)"`;
        console.log('Executing command with prompt file:', fullCommand);
        
        const { stdout, stderr } = await execAsync(fullCommand, { 
          shell: '/bin/bash',
          timeout: 30000
        });
        
        // Clean up the temporary file
        if (fs.existsSync(tempPromptFile)) {
          fs.unlinkSync(tempPromptFile);
        }
        
        if (stderr) {
          console.error('Python command stderr:', stderr);
        }
        
        const output = stdout || stderr || 'No output from command';
        res.send(output);
        return;
      }
    }
    
    // For other commands, execute directly
    const fullCommand = `cd "${apiPath}" && source venv/bin/activate && ${command}`;
    console.log('Executing command:', fullCommand);
    
    const { stdout, stderr } = await execAsync(fullCommand, { 
      shell: '/bin/bash',
      timeout: 30000 // 30 second timeout
    });
    
    if (stderr) {
      console.error('Python command stderr:', stderr);
    }
    
    const output = stdout || stderr || 'No output from command';
    res.send(output);
  } catch (error) {
    console.error('Python command execution error:', error);
    res.status(500).send(`Error executing command: ${error.message}`);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    activeConnections: connections.size 
  });
});

app.listen(PORT, () => {
  console.log(`SSH API server running on port ${PORT}`);
});

module.exports = app;
