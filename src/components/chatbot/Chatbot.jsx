import React, { useState } from 'react';
import './Chatbot.scss';
import { useChatMessages } from './hooks/useChatMessages';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import ChatHeader from './components/ChatHeader';
import ChatToggle from './components/ChatToggle';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage } = useChatMessages();

  const toggleChat = () => setIsOpen(prev => !prev);

  return (
    <div className="chatbot-container" aria-live="polite">
      <ChatToggle 
        isOpen={isOpen} 
        onClick={toggleChat} 
      />
      
      {isOpen && (
        <div 
          id="chatbot" 
          className={`chatbot ${isOpen ? 'open' : ''}`} 
          role="dialog" 
          aria-labelledby="chatbot-title"
        >
          <ChatHeader onClose={toggleChat} />
          <ChatMessages messages={messages} />
          <ChatInput onSend={sendMessage} />
        </div>
      )}
    </div>
  );
};

export default Chatbot;