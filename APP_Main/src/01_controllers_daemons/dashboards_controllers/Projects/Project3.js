import React from 'react';
import { callAI } from '../../../02_softwares_daemons/aiService';


const Project3 = () => 
  {
    const [errorFixed, setErrorFixed] = React.useState(false);
    const [aiLoading, setAiLoading] = React.useState(false);
    const [aiFixedCode, setAiFixedCode] = React.useState('');
    const [aiExplanation, setAiExplanation] = React.useState('');
    const [showAiFix, setShowAiFix] = React.useState(false);
    const [originalOutput, setOriginalOutput] = React.useState('');
    const [fixedOutput, setFixedOutput] = React.useState('');
    const [runningOriginal, setRunningOriginal] = React.useState(false);
    const [runningFixed, setRunningFixed] = React.useState(false);
  
    const buggyCode = `function calculateTotal(items) 
  {
    let total = 0;
    let discount = 0.1;
    let taxRate = 0.08;
    
    for(let i = 0; i <= items.length; i++) 
    {
      if(items[i].price > 0) 
      {
        total += items[i].price;
      }
    }
    
    let discountedTotal = total - (total * discount);
    let finalTotal = discountedTotal + (discountedTotal * taxRate);
    
    return finalTotal.toFixed(2);
  }
  
  const cart = [
    { name: 'Laptop', price: 999.99 },
    { name: 'Mouse', price: 29.99 },
    { name: 'Keyboard', price: 79.99 }
  ];
  
  console.log('Total:', calculateTotal(cart));`;
  
    const errorLog = `Uncaught TypeError: Cannot read properties of undefined (reading 'price')
      at calculateTotal (line 8)
      at <anonymous> (line 25)
      
  Error Details:
  - Array index out of bounds
  - Loop condition uses <= instead of <
  - Attempting to access items[3] when array has only 3 items (index 0-2)`;
  
    const handleQuickFix = async () => 
    {
      setAiLoading(true);
      setShowAiFix(false);
      
      try {
        const prompt = `You are a JavaScript debugging expert. I have a buggy JavaScript function that has an array index out of bounds error. Please analyze the code and provide ONLY the fixed version.

Buggy Code:
${buggyCode}

Error Details:
${errorLog}

Return ONLY the corrected JavaScript code. Do not include any explanations, comments, or additional text. Just the fixed code.`;

        const aiResponse = await callAI(prompt);
        
        // AI now returns just the code, so use the entire response
        const fixedCode = aiResponse.trim();
        const explanation = 'AI has automatically fixed the array index out of bounds error by changing the loop condition from i <= items.length to i < items.length.';
        
        setAiFixedCode(fixedCode);
        setAiExplanation(explanation);
        setShowAiFix(true);
        setErrorFixed(true);
      } catch (error) {
        console.error('AI fix failed:', error);
        // Fallback to simple fix
        setAiFixedCode(`function calculateTotal(items) {
  let total = 0;
  let discount = 0.1;
  let taxRate = 0.08;
  
  for(let i = 0; i < items.length; i++) {
    if(items[i].price > 0) {
      total += items[i].price;
    }
  }
  
  let discountedTotal = total - (total * discount);
  let finalTotal = discountedTotal + (discountedTotal * taxRate);
  
  return finalTotal.toFixed(2);
}`);
        setAiExplanation('Fixed: Changed loop condition from i <= items.length to i < items.length to prevent array index out of bounds error.');
        setShowAiFix(true);
        setErrorFixed(true);
      } finally {
        setAiLoading(false);
      }
    };

    const runOriginalCode = () => {
      setRunningOriginal(true);
      setOriginalOutput('');
      
      try {
        // Create a safe execution environment
        const originalFunction = new Function(`
          function calculateTotal(items) {
            let total = 0;
            let discount = 0.1;
            let taxRate = 0.08;
            
            for(let i = 0; i <= items.length; i++) {
              if(items[i].price > 0) {
                total += items[i].price;
              }
            }
            
            let discountedTotal = total - (total * discount);
            let finalTotal = discountedTotal + (discountedTotal * taxRate);
            
            return finalTotal.toFixed(2);
          }
          
          const cart = [
            { name: 'Laptop', price: 999.99 },
            { name: 'Mouse', price: 29.99 },
            { name: 'Keyboard', price: 79.99 }
          ];
          
          return calculateTotal(cart);
        `);
        
        const result = originalFunction();
        setOriginalOutput(`Total: ${result}`);
      } catch (error) {
        setOriginalOutput(`Error: ${error.message}`);
      } finally {
        setRunningOriginal(false);
      }
    };

    const runFixedCode = () => {
      setRunningFixed(true);
      setFixedOutput('');
      
      try {
        // Create a safe execution environment
        const fixedFunction = new Function(`
          function calculateTotal(items) {
            let total = 0;
            let discount = 0.1;
            let taxRate = 0.08;
            
            for(let i = 0; i < items.length; i++) {
              if(items[i].price > 0) {
                total += items[i].price;
              }
            }
            
            let discountedTotal = total - (total * discount);
            let finalTotal = discountedTotal + (discountedTotal * taxRate);
            
            return finalTotal.toFixed(2);
          }
          
          const cart = [
            { name: 'Laptop', price: 999.99 },
            { name: 'Mouse', price: 29.99 },
            { name: 'Keyboard', price: 79.99 }
          ];
          
          return calculateTotal(cart);
        `);
        
        const result = fixedFunction();
        setFixedOutput(`Total: ${result}`);
      } catch (error) {
        setFixedOutput(`Error: ${error.message}`);
      } finally {
        setRunningFixed(false);
      }
    };
  
    return (
      <div className="projects-completed">
        <div className="section-header">
          <h2>Interactive Code Debug Challenge</h2>
          <p>Test the buggy code, use AI to fix it, then test the fixed version</p>
        </div>
  
        <div className="code-container">
          <div className="code-header">
            <span className="code-label">Buggy Code</span>
            <div className="code-actions">
              <span className="error-badge">Error Detected</span>
              <button 
                className="run-btn"
                onClick={runOriginalCode}
                disabled={runningOriginal}
              >
                {runningOriginal ? (
                  <>
                    <div className="spinner"></div>
                    Running...
                  </>
                ) : (
                  <>
                    <i className="fas fa-play"></i>
                    Run Code
                  </>
                )}
              </button>
            </div>
          </div>
          <pre className="code-block">{buggyCode}</pre>
          {originalOutput && (
            <div className="output-container">
              <div className="output-header">
                <i className="fas fa-terminal"></i>
                <span>Output</span>
              </div>
              <pre className="output-text">{originalOutput}</pre>
            </div>
          )}
        </div>
  
        <div className="error-container">
          <div className="error-header">
            <i className="fas fa-exclamation-triangle"></i>
            <span>Console Error Log</span>
          </div>
          <pre className="error-log">{errorLog}</pre>
        </div>
  
        <div className="action-container">
          <button 
            className={`quick-fix-btn ${errorFixed ? 'fixed' : ''} ${aiLoading ? 'loading' : ''}`}
            onClick={handleQuickFix}
            disabled={errorFixed || aiLoading}
          >
            {aiLoading ? (
              <>
                <div className="spinner"></div>
                AI Analyzing...
              </>
            ) : errorFixed ? (
              <>
                <i className="fas fa-check-circle"></i>
                AI Fixed!
              </>
            ) : (
              <>
                <i className="fas fa-robot"></i>
                AI Quick Fix
              </>
            )}
          </button>
          
          {showAiFix && aiFixedCode && (
            <div className="ai-fix-container">
              <div className="ai-fix-header">
                <i className="fas fa-robot"></i>
                <span>AI-Generated Fix</span>
              </div>
              <div className="ai-fixed-code-container">
                <div className="code-header">
                  <span className="code-label">Fixed Code</span>
                  <div className="code-actions">
                    <span className="ai-badge">AI Generated</span>
                    <button 
                      className="run-btn fixed-run-btn"
                      onClick={runFixedCode}
                      disabled={runningFixed}
                    >
                      {runningFixed ? (
                        <>
                          <div className="spinner"></div>
                          Running...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-play"></i>
                          Run Fixed Code
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <pre className="code-block ai-fixed-code">{aiFixedCode}</pre>
                {fixedOutput && (
                  <div className="output-container fixed-output">
                    <div className="output-header">
                      <i className="fas fa-check-circle"></i>
                      <span>Fixed Code Output</span>
                    </div>
                    <pre className="output-text">{fixedOutput}</pre>
                  </div>
                )}
              </div>
              <div className="ai-explanation">
                <strong>AI Explanation:</strong> {aiExplanation}
              </div>
            </div>
          )}
        </div>
  
        <style jsx>{`
          .projects-completed 
          {
            padding: 2rem;
            max-width: 1000px;
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
          }
  
          .section-header 
          {
            margin-bottom: 2rem;
          }
  
          .section-header h2 
          {
            margin: 0 0 0.5rem 0;
            color: #333;
            font-size: 1.75rem;
            font-weight: 700;
          }
  
          .section-header p 
          {
            margin: 0;
            color: #666;
            font-size: 1rem;
          }
  
          .code-container 
          {
            margin-bottom: 1.5rem;
            background: #1e1e1e;
            border-radius: 8px;
            overflow: hidden;
          }
  
          .code-header 
          {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 1rem;
            background: #2d2d2d;
            border-bottom: 1px solid #3d3d3d;
          }
  
          .code-label 
          {
            color: #fff;
            font-weight: 600;
            font-size: 0.875rem;
          }
  
          .error-badge 
          {
            background: #ff4444;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
          }
  
          .code-block 
          {
            margin: 0;
            padding: 1.5rem;
            color: #d4d4d4;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.875rem;
            line-height: 1.6;
            overflow-x: auto;
          }
  
          .error-container 
          {
            margin-bottom: 1.5rem;
            background: #fff5f5;
            border: 2px solid #ff4444;
            border-radius: 8px;
            overflow: hidden;
          }
  
          .error-header 
          {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            background: #ffe5e5;
            color: #c00;
            font-weight: 600;
            font-size: 0.875rem;
          }
  
          .error-log 
          {
            margin: 0;
            padding: 1.5rem;
            color: #c00;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.875rem;
            line-height: 1.6;
            white-space: pre-wrap;
          }
  
          .action-container 
          {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
  
          .quick-fix-btn 
          {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 2rem;
            background: #1f1e7a;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
  
          .quick-fix-btn:hover:not(:disabled) 
          {
            background: #16155a;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(31, 30, 122, 0.3);
          }
  
          .quick-fix-btn:disabled 
          {
            cursor: not-allowed;
            opacity: 0.7;
          }
  
          .quick-fix-btn.fixed 
          {
            background: #22c55e;
          }
  
          .fix-explanation 
          {
            padding: 1rem;
            background: #f0fdf4;
            border: 1px solid #22c55e;
            border-radius: 8px;
            color: #166534;
            text-align: center;
            max-width: 600px;
          }
  
          .fix-explanation code 
          {
            background: #dcfce7;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.875rem;
          }

          .quick-fix-btn.loading 
          {
            background: #6b7280;
            cursor: not-allowed;
          }

          .spinner 
          {
            width: 16px;
            height: 16px;
            border: 2px solid #ffffff;
            border-top: 2px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin 
          {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .ai-fix-container 
          {
            margin-top: 2rem;
            background: #f8fafc;
            border: 2px solid #1f1e7a;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(31, 30, 122, 0.1);
            width: 100%;
            max-width: 100%;
          }

          .ai-fix-header 
          {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 1.5rem;
            background: linear-gradient(135deg, #1f1e7a 0%, #3b82f6 100%);
            color: white;
            font-weight: 600;
            font-size: 1rem;
          }

          .ai-fixed-code-container 
          {
            background: #1e1e1e;
            border-radius: 0;
            overflow: hidden;
            width: 100%;
            max-width: 100%;
          }

          .ai-badge 
          {
            background: linear-gradient(135deg, #1f1e7a 0%, #3b82f6 100%);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .ai-fixed-code 
          {
            margin: 0;
            padding: 1.5rem;
            color: #d4d4d4;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.875rem;
            line-height: 1.6;
            overflow-x: auto;
            background: #1e1e1e;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-width: 100%;
          }

          .ai-explanation 
          {
            padding: 1.5rem;
            background: #f0f9ff;
            border-top: 1px solid #e0f2fe;
            color: #0c4a6e;
            line-height: 1.6;
          }

          .ai-explanation strong 
          {
            color: #1f1e7a;
            font-weight: 600;
          }

          .code-actions 
          {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .run-btn 
          {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: #22c55e;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .run-btn:hover:not(:disabled) 
          {
            background: #16a34a;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
          }

          .run-btn:disabled 
          {
            cursor: not-allowed;
            opacity: 0.7;
            background: #6b7280;
          }

          .fixed-run-btn 
          {
            background: #3b82f6;
          }

          .fixed-run-btn:hover:not(:disabled) 
          {
            background: #2563eb;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          }

          .output-container 
          {
            margin-top: 1rem;
            background: #1e1e1e;
            border-radius: 0 0 8px 8px;
            overflow: hidden;
          }

          .output-header 
          {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            background: #2d2d2d;
            color: #fff;
            font-weight: 600;
            font-size: 0.875rem;
          }

          .output-text 
          {
            margin: 0;
            padding: 1rem 1.5rem;
            color: #d4d4d4;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.875rem;
            line-height: 1.6;
            white-space: pre-wrap;
          }

          .fixed-output 
          {
            background: #f0f9ff;
            border: 1px solid #e0f2fe;
          }

          .fixed-output .output-header 
          {
            background: #0ea5e9;
            color: white;
          }

          .fixed-output .output-text 
          {
            color: #0c4a6e;
            background: #f0f9ff;
          }

          @media (max-width: 768px) 
          {
            .projects-completed 
            {
              padding: 1rem;
            }
            
            .ai-fix-container 
            {
              margin-top: 1rem;
            }
            
            .ai-fixed-code 
            {
              font-size: 0.75rem;
              padding: 1rem;
            }
            
            .code-actions 
            {
              flex-direction: column;
              gap: 0.5rem;
              align-items: stretch;
            }
            
            .run-btn 
            {
              width: 100%;
              justify-content: center;
            }
          }
        `}</style>
      </div>
    );
  };
  

export default Project3;
