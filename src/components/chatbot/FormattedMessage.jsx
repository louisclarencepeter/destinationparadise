import React from 'react';

const FormattedMessage = ({ content, role }) => {
  // Function to format numbered lists in the content
  const formatContent = (text) => {
    if (typeof text !== 'string') return text;
    
    // Split the text by numbers followed by dots or asterisks
    const parts = text.split(/(\d+\.\s*\*\*|\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.match(/^\d+\.\s*\*\*$/)) {
        // For numbered points, add proper spacing and styling
        return (
          <div key={index} className="message-point-header">
            {part.replace(/\*\*/g, '')}
          </div>
        );
      } else if (part.trim().length > 0) {
        // For content, remove extra asterisks and add proper spacing
        return (
          <div key={index} className="message-point-content">
            {part.replace(/\*\*/g, '')}
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className={`message ${role}`}>
      {formatContent(content)}
      <style jsx>{`
        .message {
          max-width: 75%;
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 12px;
          line-height: 1.5;
          font-size: 0.95rem;
        }
        
        .message-point-header {
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .message-point-content {
          margin-bottom: 0.75rem;
          padding-left: 1rem;
        }
        
        .assistant {
          background-color: #f5f5f5;
          color: #333;
        }
        
        .user {
          background-color: #007bff;
          color: white;
          align-self: flex-end;
        }
      `}</style>
    </div>
  );
};

export default FormattedMessage;