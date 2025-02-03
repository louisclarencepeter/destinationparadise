// ChatMessages.jsx

import React, { useMemo } from 'react';
import Message from './Message';
import { useChatScroll } from '../hooks/useChatScroll';

const ChatMessages = ({ messages, isOpen }) => {
  const { containerRef, lastMessageRef } = useChatScroll({
    messages,
    smooth: true,
    isOpen, // Pass the isOpen state so the hook can auto-scroll on open
  });

  const renderedMessages = useMemo(() => {
    return messages.map((message, index) => {
      // Use a unique identifier if available; fallback to index.
      const key = message.id || index;
      return (
        <div
          key={key}
          ref={index === messages.length - 1 ? lastMessageRef : null}
        >
          <Message {...message} />
        </div>
      );
    });
  }, [messages, lastMessageRef]);

  return (
    <div
      ref={containerRef}
      className="chatbot-messages"
      aria-live="polite"
    >
      {renderedMessages}
    </div>
  );
};

export default React.memo(ChatMessages);
