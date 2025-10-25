const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Store running processes
const runningProcesses = new Map();

// Read console log file
app.get('/api/console-log', (req, res) => {
  try {
    const logPath = req.query.path;
    if (!logPath) {
      return res.status(400).json({ error: 'Log path is required' });
    }

    if (!fs.existsSync(logPath)) {
      return res.status(404).json({ error: 'Log file not found' });
    }

    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    res.json({ lines });
  } catch (error) {
    console.error('Error reading console log:', error);
    res.status(500).json({ error: 'Failed to read console log' });
  }
});

// Check process status
app.get('/api/process-status', (req, res) => {
  try {
    // Check if we have a running process
    const processInfo = Array.from(runningProcesses.values())[0];
    
    if (processInfo) {
      const spawnedProcess = processInfo.process;
      
      // Check if the spawned process is still running
      if (spawnedProcess && !spawnedProcess.killed && spawnedProcess.exitCode === null) {
        res.json({ isRunning: true, pid: processInfo.pid });
      } else {
        // Process is dead, remove from our tracking
        runningProcesses.delete(processInfo.pid);
        res.json({ isRunning: false, pid: null });
      }
    } else {
      res.json({ isRunning: false, pid: null });
    }
  } catch (error) {
    console.error('Error checking process status:', error);
    res.status(500).json({ error: 'Failed to check process status' });
  }
});

// Start process
app.post('/api/start-process', (req, res) => {
  try {
    const { scriptPath } = req.body;
    
    if (!scriptPath) {
      return res.status(400).json({ error: 'Script path is required' });
    }

    // Check if process is already running
    const existingProcess = Array.from(runningProcesses.values())[0];
    if (existingProcess) {
      const spawnedProcess = existingProcess.process;
      if (spawnedProcess && !spawnedProcess.killed && spawnedProcess.exitCode === null) {
        return res.status(400).json({ error: 'Process is already running' });
      } else {
        // Process is dead, remove from tracking
        runningProcesses.delete(existingProcess.pid);
      }
    }

    // Start new process using virtual environment
    // Check if script is in APP_Api directory and use its venv, otherwise use APP_Backend venv
    const scriptDir = path.dirname(scriptPath);
    const isAppApi = scriptDir.includes('APP_Api');
    const venvPython = isAppApi 
      ? path.join(scriptDir, 'venv', 'bin', 'python')
      : path.join(scriptDir, 'venv', 'bin', 'python');
    
    console.log('Script execution debug:');
    console.log('  scriptPath:', scriptPath);
    console.log('  scriptDir:', scriptDir);
    console.log('  isAppApi:', isAppApi);
    console.log('  venvPython:', venvPython);
    console.log('  venvPython exists:', require('fs').existsSync(venvPython));
    
    const pythonProcess = spawn(venvPython, [scriptPath], {
      cwd: path.dirname(scriptPath),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const processInfo = {
      pid: pythonProcess.pid,
      process: pythonProcess,
      startTime: new Date()
    };

    runningProcesses.set(pythonProcess.pid, processInfo);

    // Handle process events
    pythonProcess.on('error', (error) => {
      console.error('Process error:', error);
      runningProcesses.delete(pythonProcess.pid);
    });

    pythonProcess.on('exit', (code, signal) => {
      console.log(`Process exited with code ${code} and signal ${signal}`);
      runningProcesses.delete(pythonProcess.pid);
    });

    // Capture stdout and stderr
    pythonProcess.stdout.on('data', (data) => {
      console.log('Process stdout:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Process stderr:', data.toString());
    });

    res.json({ 
      success: true, 
      pid: pythonProcess.pid,
      message: 'Process started successfully'
    });

  } catch (error) {
    console.error('Error starting process:', error);
    res.status(500).json({ error: 'Failed to start process' });
  }
});

// Stop process
app.post('/api/stop-process', (req, res) => {
  try {
    const { pid } = req.body;
    
    if (!pid) {
      return res.status(400).json({ error: 'PID is required' });
    }

    const processInfo = runningProcesses.get(pid);
    if (!processInfo) {
      return res.status(404).json({ error: 'Process not found' });
    }

    // Kill the process using the actual spawned process object
    try {
      const spawnedProcess = processInfo.process;
      
      // First try graceful termination
      spawnedProcess.kill('SIGTERM');
      
      // Set up a timeout to force kill if process doesn't exit gracefully
      const forceKillTimeout = setTimeout(() => {
        try {
          if (!spawnedProcess.killed) {
            console.log(`Force killing process ${pid} with SIGKILL`);
            spawnedProcess.kill('SIGKILL');
          }
        } catch (error) {
          console.log('Process already terminated or error during force kill:', error.message);
        }
      }, 3000); // 3 second timeout for graceful termination

      // Listen for process exit to clean up
      const onExit = () => {
        clearTimeout(forceKillTimeout);
        runningProcesses.delete(pid);
        console.log(`Process ${pid} terminated successfully`);
      };

      spawnedProcess.once('exit', onExit);
      spawnedProcess.once('error', onExit);

      res.json({ 
        success: true, 
        message: 'Process stop signal sent successfully'
      });
    } catch (error) {
      console.error('Error stopping process:', error);
      // Even if there's an error, try to clean up
      runningProcesses.delete(pid);
      res.status(500).json({ error: 'Failed to stop process' });
    }

  } catch (error) {
    console.error('Error stopping process:', error);
    res.status(500).json({ error: 'Failed to stop process' });
  }
});

// Python command execution endpoint
app.post('/api/run-python-command', async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command || !command.trim()) {
      return res.status(400).send('Error: No command provided');
    }

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
        
        // Execute with the prompt file using virtual environment
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
    
    // For other commands, execute directly with virtual environment
    const fullCommand = `cd "${apiPath}" && source venv/bin/activate && ${command}`;
    console.log('Executing command:', fullCommand);
    
    const { stdout, stderr } = await execAsync(fullCommand, { 
      shell: '/bin/bash',
      timeout: 30000
    });
    
    if (stderr) {
      console.error('Python command stderr:', stderr);
    }
    
    const output = stdout || stderr || 'No output from command';
    res.send(output);
  } catch (error) {
    console.error('Python command execution error:', error);
    res.status(500).send(`Error executing Python command: ${error.message}`);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Console API server running on port ${PORT}`);
});

module.exports = app;
