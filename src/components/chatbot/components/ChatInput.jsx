import React, { useState, useCallback } from 'react';

const ChatInput = ({ onSend }) => {
  const [input, setInput] = useState('');

  const handleSend = useCallback(() => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  }, [input, onSend]);

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="chatbot-input">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        aria-label="Type your message"
        placeholder="Type your message..."
      />
      <button 
        onClick={handleSend} 
        aria-label="Send message"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;