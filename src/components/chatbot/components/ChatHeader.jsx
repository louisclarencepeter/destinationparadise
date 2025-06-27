import React from 'react';

const ChatHeader = React.memo(({ onClose }) => (
  <div className="chatbot-header">
    <h2 id="chatbot-title" className="sr-only">
      Chatbot
    </h2>
    <button
      className="close-button"
      onClick={onClose}
      aria-label="Close chatbot dialog"
      type="button"
    >
      <svg
        aria-hidden="true"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
      </svg>
    </button>
  </div>
));

export default ChatHeader;