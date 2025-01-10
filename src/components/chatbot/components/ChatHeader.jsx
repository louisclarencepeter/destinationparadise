import React from 'react';

const ChatHeader = ({ onClose }) => {
  return (
    <div className="chatbot-header">
      <h2 id="chatbot-title" className="sr-only">
        Chatbot
      </h2>
      <button 
        className="close-button" 
        onClick={onClose} 
        aria-label="Close chat"
      >
        ×
      </button>
    </div>
  );
};

export default ChatHeader;