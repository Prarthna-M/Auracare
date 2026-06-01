import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SkincareChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Check if user is logged in (optional)
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: "Hi! I'm your Skincare Assistant. 👋\n\nI can help you with:\n• Product recommendations\n• Skincare routine advice\n• Ingredient information\n• Skin concerns\n\nWhat skincare question do you have today?",
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to chat
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    }]);
    
    setIsLoading(true);

    try {
      // Send to backend - no token required for chatbot
      const response = await axios.post(
        'http://localhost:5000/api/chatbot/skincare-query',
        { 
          message: userMessage,
          isLoggedIn: isLoggedIn // Let backend know if user is logged in
        },
        { 
          timeout: 30000
        }
      );

      if (response.data.success) {
        // Add bot response
        let responseText = response.data.response;
        
        // Add login prompt if user is not logged in and response contains recommendations
        if (!isLoggedIn && response.data.suggestedLogin) {
          responseText += "\n\n💡 Want personalized recommendations? Log in to save your preferences and get better suggestions!";
        }
        
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: responseText,
          sender: 'bot',
          timestamp: new Date(),
          products: response.data.products || null,
          routine: response.data.routine || null
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: response.data.message || "I'm sorry, I couldn't process that. Please try again!",
          sender: 'bot',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Please try again later. 😊",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render product recommendations
  const renderProductRecommendations = (products) => {
    if (!products || products.length === 0) return null;
    
    return (
      <div className="product-suggestions">
        <div className="product-title">✨ Recommended Products:</div>
        {products.map((product, idx) => (
          <div key={idx} className="product-item">
            <strong>{product.name}</strong> - ${product.price}
            <br />
            <span className="product-desc">{product.description}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Chat Button - Always visible */}
      <button 
        className={`chatbot-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="header-content">
              <span className="bot-icon">🧴</span>
              <div>
                <h3>Skincare Assistant</h3>
                <p>Powered by AI • Ask me anything about skincare!</p>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-content">
                  <div className="message-text">{msg.text}</div>
                  {msg.products && renderProductRecommendations(msg.products)}
                  {msg.routine && (
                    <div className="routine-preview">
                      <div className="routine-title">📋 Quick Routine:</div>
                      <div>🌅 Morning: {msg.routine.morning?.length || 0} steps</div>
                      <div>🌙 Night: {msg.routine.night?.length || 0} steps</div>
                    </div>
                  )}
                  <div className="message-time">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about skincare, products, routines, ingredients..."
              rows="2"
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage} 
              disabled={isLoading || !inputMessage.trim()}
              className="send-btn"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>

          {!isLoggedIn && (
            <div className="login-prompt">
              <span>💡 For personalized recommendations, </span>
              <button onClick={() => navigate('/login')} className="login-link">
                Login
              </button>
              <span> or </span>
              <button onClick={() => navigate('/signup')} className="signup-link">
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .chatbot-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          cursor: pointer;
          font-size: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chatbot-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }

        .chatbot-button.open {
          background: #f44336;
        }

        .chatbot-window {
          position: fixed;
          bottom: 100px;
          right: 20px;
          width: 380px;
          height: 550px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          animation: slideUp 0.3s ease;
          overflow: hidden;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chatbot-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bot-icon {
          font-size: 28px;
        }

        .chatbot-header h3 {
          margin: 0;
          font-size: 16px;
        }

        .chatbot-header p {
          margin: 2px 0 0;
          font-size: 11px;
          opacity: 0.9;
        }

        .close-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          background: #f8f9fa;
        }

        .message {
          margin-bottom: 15px;
          display: flex;
        }

        .message.user {
          justify-content: flex-end;
        }

        .message-content {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          word-wrap: break-word;
        }

        .message.user .message-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message.bot .message-content {
          background: white;
          color: #333;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .message-text {
          white-space: pre-wrap;
          line-height: 1.4;
        }

        .message-time {
          font-size: 10px;
          margin-top: 5px;
          opacity: 0.7;
        }

        .message.user .message-time {
          text-align: right;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 0;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #999;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }

        .product-suggestions {
          margin-top: 10px;
          padding: 8px;
          background: #f0f0f0;
          border-radius: 8px;
        }

        .product-title {
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 12px;
        }

        .product-item {
          font-size: 11px;
          margin-bottom: 6px;
          padding: 4px;
          background: white;
          border-radius: 4px;
        }

        .product-desc {
          font-size: 10px;
          color: #666;
        }

        .routine-preview {
          margin-top: 10px;
          padding: 8px;
          background: #e8f5e9;
          border-radius: 8px;
          font-size: 11px;
        }

        .routine-title {
          font-weight: bold;
          margin-bottom: 4px;
        }

        .chatbot-input {
          padding: 15px;
          background: white;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 10px;
        }

        .chatbot-input textarea {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 20px;
          resize: none;
          font-family: inherit;
          font-size: 14px;
          outline: none;
        }

        .chatbot-input textarea:focus {
          border-color: #667eea;
        }

        .send-btn {
          padding: 0 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-prompt {
          padding: 12px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
          background: #f8f9fa;
          font-size: 12px;
        }

        .login-link, .signup-link {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-weight: bold;
          text-decoration: underline;
          padding: 0;
          margin: 0 2px;
        }

        .login-link:hover, .signup-link:hover {
          color: #764ba2;
        }

        @media (max-width: 480px) {
          .chatbot-window {
            width: calc(100vw - 40px);
            right: 20px;
            height: 500px;
          }
        }
      `}</style>
    </>
  );
};

export default SkincareChatbot;