import React, { useState, useRef, useEffect } from 'react';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/run-python-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: `python3 main_api.py "${userMessage.content}"`
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.text();
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: result,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error running Python script:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Error: Could not run the Python script - ${error.message}`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <i className="fas fa-robot"></i>
          <span>AI Chat Assistant</span>
        </div>
        <div className="chat-actions">
          <button className="clear-chat-btn" onClick={clearChat} title="Clear Chat">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-icon">
              <i className="fas fa-robot"></i>
            </div>
            <h3>Welcome to AI Chat Assistant</h3>
            <p>Ask me anything! I can help you with Python programming, data analysis, and more.</p>
            <div className="example-prompts">
              <div className="example-prompt" onClick={() => setInputMessage("Create a simple Python function to calculate fibonacci numbers")}>
                "Create a simple Python function to calculate fibonacci numbers"
              </div>
              <div className="example-prompt" onClick={() => setInputMessage("Write a Python script to analyze CSV data")}>
                "Write a Python script to analyze CSV data"
              </div>
              <div className="example-prompt" onClick={() => setInputMessage("Help me create a data visualization with matplotlib")}>
                "Help me create a data visualization with matplotlib"
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'user' ? (
                <i className="fas fa-user"></i>
              ) : (
                <i className="fas fa-robot"></i>
              )}
            </div>
            <div className="message-content">
              <div className="message-text">
                {message.type === 'ai' && message.content.includes('```') ? (
                  <div className="code-block">
                    <pre><code>{message.content}</code></pre>
                  </div>
                ) : (
                  <div className="message-text-content">
                    {message.content.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message ai">
            <div className="message-avatar">
              <i className="fas fa-robot"></i>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
            className="chat-input"
            rows="1"
            disabled={loading}
          />
      <button 
            onClick={handleSendMessage}
            disabled={loading || !inputMessage.trim()}
            className="send-button"
          >
            <i className="fas fa-paper-plane"></i>
      </button>
        </div>
      </div>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-height: 100vh;
          background: #f7f9fc;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #1f1e7a 0%, #2a2885 100%);
          color: white;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chat-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .chat-title i {
          font-size: 1.2rem;
        }

        .chat-actions {
          display: flex;
          gap: 0.5rem;
        }

        .clear-chat-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
        }

        .clear-chat-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .welcome-message {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .welcome-icon {
          font-size: 3rem;
          color: #1f1e7a;
          margin-bottom: 1rem;
        }

        .welcome-message h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .welcome-message p {
          margin: 0 0 1.5rem 0;
          font-size: 1rem;
          line-height: 1.5;
        }

        .example-prompts {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-width: 500px;
          margin: 0 auto;
        }

        .example-prompt {
          background: white;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          text-align: left;
        }

        .example-prompt:hover {
          border-color: #1f1e7a;
          background: #f8f9ff;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(31, 30, 122, 0.1);
        }

        .message {
          display: flex;
          gap: 0.75rem;
          max-width: 100%;
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message.user .message-content {
          background: #1f1e7a;
          color: white;
          border-radius: 18px 18px 4px 18px;
        }

        .message.ai .message-content {
          background: white;
          color: #333;
          border: 1px solid #e1e5e9;
          border-radius: 18px 18px 18px 4px;
        }

        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .message.user .message-avatar {
          background: #1f1e7a;
          color: white;
        }

        .message.ai .message-avatar {
          background: #f0f0f0;
          color: #666;
        }

        .message-content {
          max-width: 70%;
          padding: 0.75rem 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .message-text-content {
          line-height: 1.5;
        }

        .message-text-content p {
          margin: 0 0 0.5rem 0;
        }

        .message-text-content p:last-child {
          margin-bottom: 0;
        }

        .code-block {
          background: #2d3748;
          color: #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          margin: 0.5rem 0;
        }

        .code-block pre {
          margin: 0;
          padding: 1rem;
          overflow-x: auto;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .message-timestamp {
          font-size: 0.75rem;
          color: #999;
          margin-top: 0.5rem;
          text-align: right;
        }

        .message.user .message-timestamp {
          text-align: left;
        }

        .typing-indicator {
          display: flex;
          gap: 0.25rem;
          padding: 0.5rem 0;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background: #999;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .chat-input-container {
          padding: 1rem;
          background: white;
          border-top: 1px solid #e1e5e9;
        }

        .chat-input-wrapper {
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
          background: #f8f9fa;
          border: 2px solid #e1e5e9;
          border-radius: 24px;
          padding: 0.75rem 1rem;
          transition: all 0.2s ease;
        }

        .chat-input-wrapper:focus-within {
          border-color: #1f1e7a;
          box-shadow: 0 0 0 3px rgba(31, 30, 122, 0.1);
        }

        .chat-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          resize: none;
          font-size: 0.95rem;
          line-height: 1.5;
          max-height: 120px;
          min-height: 24px;
          font-family: inherit;
        }

        .chat-input::placeholder {
          color: #999;
        }

        .send-button {
          background: #1f1e7a;
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          background: #16155a;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(31, 30, 122, 0.3);
        }

        .send-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .chat-container {
            height: 100vh;
            border-radius: 0;
          }

          .chat-header {
            padding: 0.75rem 1rem;
          }

          .chat-messages {
            padding: 0.75rem;
          }

          .message-content {
            max-width: 85%;
          }

          .chat-input-container {
            padding: 0.75rem;
          }

          .example-prompts {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
