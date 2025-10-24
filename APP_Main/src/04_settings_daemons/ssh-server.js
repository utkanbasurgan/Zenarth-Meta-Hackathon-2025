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

// Function to handle different SSH key formats
async function processSSHKey(keyContent, passphrase) {
  try {
    // Check if it's an encrypted OpenSSL key
    if (keyContent.includes('Proc-Type: 4,ENCRYPTED')) {
      console.log('Detected encrypted OpenSSL key, attempting conversion...');
      
      // Write the key to a temporary file
      const tempKeyPath = path.join(__dirname, 'temp_key.pem');
      const tempOutputPath = path.join(__dirname, 'temp_key_openssh');
      
      fs.writeFileSync(tempKeyPath, keyContent);
      
      try {
        // Convert from OpenSSL format to OpenSSH format
        const command = `echo "${passphrase}" | openssl rsa -in "${tempKeyPath}" -outform PEM -passin stdin`;
        const { stdout } = await execAsync(command);
        
        // The converted key is in stdout
        const convertedKey = stdout;
        
        // Clean up temporary files
        fs.unlinkSync(tempKeyPath);
        fs.unlinkSync(tempOutputPath);
        
        console.log('Successfully converted OpenSSL key to OpenSSH format');
        console.log('Converted key starts with:', convertedKey.substring(0, 50));
        return convertedKey;
      } catch (conversionError) {
        console.log('OpenSSL conversion failed:', conversionError.message);
        // Clean up
        if (fs.existsSync(tempKeyPath)) {
          fs.unlinkSync(tempKeyPath);
        }
        if (fs.existsSync(tempOutputPath)) {
          fs.unlinkSync(tempOutputPath);
        }
        
        // Try alternative conversion method
        try {
          const altCommand = `openssl rsa -in "${tempKeyPath}" -outform PEM -passin pass:"${passphrase}"`;
          const { stdout } = await execAsync(altCommand);
          fs.unlinkSync(tempKeyPath);
          return stdout;
        } catch (altError) {
          console.log('Alternative conversion also failed:', altError.message);
          console.log('Trying to use original key format...');
          // Try using the original key as a last resort
          return keyContent;
        }
      }
    }
    
    return keyContent;
  } catch (error) {
    console.error('Key processing error:', error);
    throw error;
  }
}

// SSH Connection endpoint
app.post('/api/ssh/connect', async (req, res) => {
  const { host, port, username, keyPath, passphrase } = req.body;
  
  try {
    // Read SSH key
    const keyPathFull = path.join(__dirname, 'ssh.txt');
    const privateKeyContent = fs.readFileSync(keyPathFull, 'utf8');
    
    // Process the SSH key (handle encrypted OpenSSL format)
    const privateKey = await processSSHKey(privateKeyContent, passphrase);
    
    const conn = new Client();
    
    // Connect to SSH server with passphrase for encrypted key
    const connectOptions = {
      host: host,
      port: port,
      username: username,
      privateKey: privateKey,
      keepaliveInterval: 10000,
      keepaliveCountMax: 3,
      readyTimeout: 20000,
      authTimeout: 20000
    };
    
    // Add passphrase if provided
    if (passphrase) {
      connectOptions.passphrase = passphrase;
    }
    
    // Set a timeout for the connection attempt
    const connectionTimeout = setTimeout(() => {
      if (!connections.has(`${host}:${port}`)) {
        conn.end();
        res.json({ 
          success: false, 
          error: 'Connection timeout. Please check the server details and try again.' 
        });
      }
    }, 30000); // 30 second timeout
    
    conn.on('ready', () => {
      clearTimeout(connectionTimeout);
      console.log('SSH connection established');
      connections.set(`${host}:${port}`, conn);
      res.json({ 
        success: true, 
        message: 'Connected successfully' 
      });
    });
    
    conn.on('error', (err) => {
      clearTimeout(connectionTimeout);
      console.error('SSH connection error:', err);
      let errorMessage = err.message;
      
      // Provide more specific error messages
      if (err.message.includes('string did not match the expected pattern')) {
        errorMessage = 'SSH key format issue. The key appears to be in OpenSSL format. Please try converting it to OpenSSH format or check the passphrase.';
      } else if (err.message.includes('Authentication failed')) {
        errorMessage = 'Authentication failed. Please check the passphrase and ensure the key is correct.';
      } else if (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to server. Please check the host (83.104.230.246) and port (31103).';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Connection timeout. The server may be unreachable or the port may be blocked.';
      }
      
      res.json({ 
        success: false, 
        error: errorMessage 
      });
    });
    
    // Try to connect
    conn.connect(connectOptions);
    
  } catch (error) {
    console.error('SSH setup error:', error);
    let errorMessage = error.message;
    
    // Provide more specific error messages for key conversion issues
    if (error.message.includes('Failed to convert OpenSSL key')) {
      errorMessage = 'SSH key conversion failed. Please check the passphrase and ensure it\'s correct for the encrypted key.';
    } else if (error.message.includes('ENOENT')) {
      errorMessage = 'SSH key file not found. Please ensure ssh.txt exists in the settings directory.';
    }
    
    res.json({ 
      success: false, 
      error: `SSH setup failed: ${errorMessage}` 
    });
  }
});

// Execute command endpoint
app.post('/api/ssh/execute', async (req, res) => {
  const { command, config } = req.body;
  const { host, port } = config;
  
  try {
    const conn = connections.get(`${host}:${port}`);
    
    if (!conn) {
      return res.json({ 
        success: false, 
        error: 'No active SSH connection found' 
      });
    }
    
    conn.exec(command, (err, stream) => {
      if (err) {
        console.error('Command execution error:', err);
        return res.json({ 
          success: false, 
          error: err.message 
        });
      }
      
      let output = '';
      
      stream.on('close', (code, signal) => {
        res.json({ 
          success: true, 
          output: output,
          exitCode: code 
        });
      });
      
      stream.on('data', (data) => {
        output += data.toString();
      });
      
      stream.stderr.on('data', (data) => {
        output += data.toString();
      });
    });
    
  } catch (error) {
    console.error('Command execution setup error:', error);
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Disconnect endpoint
app.post('/api/ssh/disconnect', async (req, res) => {
  const { host, port } = req.body;
  
  try {
    const conn = connections.get(`${host}:${port}`);
    
    if (conn) {
      conn.end();
      connections.delete(`${host}:${port}`);
      res.json({ 
        success: true, 
        message: 'Disconnected successfully' 
      });
    } else {
      res.json({ 
        success: false, 
        error: 'No active connection found' 
      });
    }
    
  } catch (error) {
    console.error('Disconnect error:', error);
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Python script execution endpoint
app.post('/api/run-python-script', async (req, res) => {
  const { scriptPath } = req.body;
  
  try {
    // Execute the Python script directly
    const command = `python3 "${scriptPath}"`;
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.error('Python script stderr:', stderr);
    }
    
    res.send(stdout || stderr || 'No output from script');
  } catch (error) {
    console.error('Python script execution error:', error);
    res.status(500).send(`Error executing script: ${error.message}`);
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
