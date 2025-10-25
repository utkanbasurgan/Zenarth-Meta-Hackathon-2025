import React, { useState, useEffect } from 'react';

const ProjectsSubPage1 = () => {
  const [scriptOutput, setScriptOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pythonPrompt, setPythonPrompt] = useState('');

  const runApiScript = async () => {
    setLoading(true);
    setScriptOutput(''); // Clear previous output
    try {
      const response = await fetch('http://localhost:3001/api/run-python-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: `python3 main_api.py "${pythonPrompt}"`
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.text();
      setScriptOutput(result);
    } catch (error) {
      console.error('Error running Python script:', error);
      setScriptOutput(`Error: Could not run the Python script - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="team-section">
      <h2>All Projects</h2>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="pythonPrompt" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Python Prompt:
        </label>
        <textarea
          id="pythonPrompt"
          value={pythonPrompt}
          onChange={(e) => setPythonPrompt(e.target.value)}
          placeholder="Enter your Python prompt here..."
          style={{
            width: '100%',
            height: '100px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'monospace'
          }}
        />
      </div>
      <button onClick={runApiScript} disabled={loading || !pythonPrompt.trim()}>
        {loading ? 'Running Python...' : 'Run Python Script'}
      </button>
      {scriptOutput && (
        <div className="script-output" style={{ marginTop: '20px' }}>
          <h3>Python Output:</h3>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '4px', 
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            {scriptOutput}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ProjectsSubPage1;
