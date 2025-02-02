import React, { useState, useCallback } from 'react';

const ChatInput = ({ onSend }) => {
  const [input, setInput] = useState('');

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const trimmedInput = input.trim();
      if (trimmedInput) {
        onSend(trimmedInput);
        setInput('');
      }
    },
    [input, onSend]
  );

  return (
    <form className="chatbot-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        aria-label="Type your message"
        placeholder="Type your message..."
      />
      <button type="submit" aria-label="Send message" disabled={!input.trim()}>
        Send
      </button>
    </form>
  );
};

export default ChatInput;
