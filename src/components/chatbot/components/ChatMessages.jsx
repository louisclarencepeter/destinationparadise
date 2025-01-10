import React from 'react';
import Message from './Message';
import { useChatScroll } from '../hooks/useChatScroll';

const ChatMessages = ({ messages }) => {
  const { containerRef, lastMessageRef, scrollToBottom } = useChatScroll({
    messages,
    smooth: true
  });

  return (
    <div 
      ref={containerRef}
      className="chatbot-messages" 
      aria-live="polite"
    >
      {messages.map((message, index) => (
        <div
          key={index}
          ref={index === messages.length - 1 ? lastMessageRef : null}
        >
          <Message {...message} />
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;