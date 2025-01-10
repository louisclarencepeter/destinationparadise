import React from 'react';
import { formatMessageContent } from '../utils/messageFormatter';

const TypingIndicator = () => (
  <span className="typing-indicator" role="status">
    <span className="dot"></span>
    <span className="dot"></span>
    <span className="dot"></span>
  </span>
);

const MessageContent = ({ content }) => {
  const formatted = formatMessageContent(content);
  
  if (formatted.type === 'raw') return formatted.content;
  
  return formatted.sections.map((section, index) => (
    <p 
      key={index} 
      className={section.isNumbered ? 'numbered-item' : ''}
      dangerouslySetInnerHTML={{ __html: section.text }} 
    />
  ));
};

const Message = ({ role, content, isTyping }) => {
  return (
    <div className={`message ${role}`}>
      {isTyping ? (
        <TypingIndicator />
      ) : (
        <MessageContent content={content} />
      )}
    </div>
  );
};

export default Message;