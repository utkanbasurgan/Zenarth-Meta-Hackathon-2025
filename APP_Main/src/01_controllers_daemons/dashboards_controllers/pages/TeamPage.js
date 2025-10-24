import React, { useState, useEffect } from 'react';

const TeamPage = () => {
  const [scriptOutput, setScriptOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const runPythonScript = async () => {
    setLoading(true);
    setScriptOutput(''); // Clear previous output
    try {
      const response = await fetch('http://localhost:3001/api/run-python-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptPath: '/Users/utkan.basurgan/Main/1. Works Files/2. Gits Works/Zenarth-Meta-Hackathon-2025/APP_Backend/api_protocol.py'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.text();
      setScriptOutput(result);
    } catch (error) {
      console.error('Error running script:', error);
      setScriptOutput(`Error: Could not run the script - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run the script when component mounts
  useEffect(() => {
    runPythonScript();
  }, []);

  return (
    <div className="team-section">
      <h2>Team Members</h2>
      <button onClick={runPythonScript} disabled={loading}>
        {loading ? 'Running...' : 'Run Python Script'}
      </button>
      {scriptOutput && (
        <div className="script-output">
          <h3>Script Output:</h3>
          <pre>{scriptOutput}</pre>
        </div>
      )}
    </div>
  );
};

export default TeamPage;