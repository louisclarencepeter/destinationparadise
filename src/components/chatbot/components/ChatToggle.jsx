import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';

const ChatToggle = memo(({ isOpen, onClick }) => {
  return (
    <button
      className={`chatbot-toggle ${isOpen ? 'hidden' : ''}`}
      onClick={onClick}
      aria-label="Open chat"
      aria-expanded={isOpen}
      aria-controls="chatbot"
    >
      <FontAwesomeIcon icon={faCommentDots} />
    </button>
  );
});

export default ChatToggle;
