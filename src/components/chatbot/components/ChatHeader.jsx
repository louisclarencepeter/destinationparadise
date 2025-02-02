import React from 'react';

const ChatHeader = React.memo(({ onClose }) => (
  <div className="chatbot-header">
    <h2 id="chatbot-title" className="sr-only">
      Chatbot
    </h2>
    <button 
      className="close-button" 
      onClick={onClose} 
      aria-label="Close chat"
    >
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
));

export default ChatHeader;
