import React, { useState } from 'react';
import { geminiApi } from '../../02_softwares_daemons/geminis_softwares';

const CreatePage = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canvasContent, setCanvasContent] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt first!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const generatedCode = await geminiApi.generateCode(prompt);
      setCanvasContent(generatedCode);
    } catch (error) {
      console.error('Code generation error:', error);
      setError(`Failed to generate code: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleGenerate();
    }
  };

  return (
    <div className="create-page">
      <div className="create-header">
        <h2>
          <i className="fas fa-code"></i>
          AI Code Generator
        </h2>
        <p>Describe what you want to create and AI will generate the code for you</p>
      </div>

      <div className="create-content">
        {/* Prompt Area */}
        <div className="prompt-section">
          <div className="prompt-container">
            <label htmlFor="prompt-input" className="prompt-label">
              <i className="fas fa-edit"></i>
              What would you like to create?
            </label>
            <div className="prompt-input-container">
              <textarea
                id="prompt-input"
                className="prompt-input"
                placeholder="e.g., add a button with blue background and white text..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                rows={3}
              />
              <button
                className="generate-btn"
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic"></i>
                    Generate Code
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="canvas-section">
          <div className="canvas-header">
            <h3>
              <i className="fas fa-paint-brush"></i>
              Generated Code Preview
            </h3>
            {canvasContent && (
              <button
                className="clear-btn"
                onClick={() => setCanvasContent('')}
                title="Clear canvas"
              >
                <i className="fas fa-trash"></i>
                Clear
              </button>
            )}
          </div>
          
          <div className="canvas-container">
            {canvasContent ? (
              <div 
                className="canvas-content"
                dangerouslySetInnerHTML={{ __html: canvasContent }}
              />
            ) : (
              <div className="canvas-placeholder">
                <i className="fas fa-code"></i>
                <p>Generated code will appear here</p>
                <small>Type a prompt above and click "Generate Code"</small>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .create-page {
          background: white;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .create-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          text-align: center;
        }

        .create-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .create-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 1.1rem;
        }

        .create-content {
          padding: 2rem;
        }

        .prompt-section {
          margin-bottom: 2rem;
        }

        .prompt-container {
          background-color: #f8f9fa;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .prompt-label {
          display: block;
          margin-bottom: 1rem;
          font-weight: 600;
          color: #333;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .prompt-label i {
          color: #667eea;
        }

        .prompt-input-container {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
        }

        .prompt-input {
          flex: 1;
          padding: 1rem;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
          min-height: 80px;
          outline: none;
          transition: border-color 0.2s;
        }

        .prompt-input:focus {
          border-color: #667eea;
        }

        .prompt-input:disabled {
          background-color: #f8f9fa;
          opacity: 0.7;
        }

        .generate-btn {
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }

        .generate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .generate-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          margin-top: 1rem;
          padding: 0.75rem 1rem;
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          border-radius: 6px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .canvas-section {
          border: 1px solid #dee2e6;
          border-radius: 12px;
          overflow: hidden;
        }

        .canvas-header {
          background-color: #f8f9fa;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #dee2e6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .canvas-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .canvas-header h3 i {
          color: #667eea;
        }

        .clear-btn {
          padding: 0.5rem 1rem;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          transition: background-color 0.2s;
        }

        .clear-btn:hover {
          background-color: #c82333;
        }

        .canvas-container {
          min-height: 400px;
          background-color: white;
        }

        .canvas-content {
          padding: 1.5rem;
          min-height: 400px;
        }

        .canvas-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #999;
          text-align: center;
        }

        .canvas-placeholder i {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #dee2e6;
        }

        .canvas-placeholder p {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 500;
        }

        .canvas-placeholder small {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .prompt-input-container {
            flex-direction: column;
            align-items: stretch;
          }

          .generate-btn {
            justify-content: center;
          }

          .create-header h2 {
            font-size: 1.5rem;
          }

          .create-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CreatePage;
