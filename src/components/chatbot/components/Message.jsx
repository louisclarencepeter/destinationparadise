import React, { memo } from 'react';
import { formatMessageContent } from '../utils/messageFormatter';

const TypingIndicator = memo(() => (
  <span className="typing-indicator" role="status">
    <span className="dot" />
    <span className="dot" />
    <span className="dot" />
  </span>
));

const MessageContent = memo(({ content }) => {
  const formatted = formatMessageContent(content);

  if (formatted.type === 'raw') {
    return <>{formatted.content}</>;
  }

  return formatted.sections.map((section, index) => (
    <p
      key={index}
      className={section.isNumbered ? 'numbered-item' : ''}
      dangerouslySetInnerHTML={{ __html: section.text }}
    />
  ));
});

const Message = memo(({ role, content, isTyping }) => (
  <div className={`message ${role}`}>
    {isTyping ? <TypingIndicator /> : <MessageContent content={content} />}
  </div>
));

export default Message;
