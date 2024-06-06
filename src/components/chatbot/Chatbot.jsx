import { useState, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.scss';
import config from './chatbotConfig.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const greetingDescription = config.parameters?.properties?.greeting?.description;

    if (greetingDescription) {
      const greetingMessage = {
        content: greetingDescription,
        role: 'assistant'
      };
      setMessages([greetingMessage]);
    } else {
      console.error('Greeting description is undefined');
    }
  }, []);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { content: input, role: 'user' };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');
      
      try {
        const response = await axios.post('/.netlify/functions/chatbot', {
          message: input
        });

        const assistantMessage = {
          content: response.data.response,
          role: 'assistant'
        };
        setMessages(prevMessages => [...prevMessages, assistantMessage]);

      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = {
          content: (
            <span>
              Currently, this service is unavailable. Please contact us directly via WhatsApp
              <a href="https://wa.me/message/EM3ESMRKYXLVK1" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="whatsapp-link">
                <FontAwesomeIcon icon={faWhatsapp} size="lg" />
              </a>
              for assistance.
            </span>
          ),
          role: 'assistant'
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
    }
  };

  const handleClearHistory = () => {
    const greetingDescription = config.parameters?.properties?.greeting?.description;
    if (greetingDescription) {
      const greetingMessage = {
        content: greetingDescription,
        role: 'assistant'
      };
      setMessages([greetingMessage]);
      setInput('');
    } else {
      console.error('Greeting description is undefined');
    }
  };

  const truncateMessages = (messages) => {
    const maxTokens = 8192;
    let tokenCount = 0;
    const truncatedMessages = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const messageTokens = estimateTokenCount(messages[i].content);
      if (tokenCount + messageTokens <= maxTokens) {
        truncatedMessages.unshift(messages[i]);
        tokenCount += messageTokens;
      } else {
        break;
      }
    }

    return truncatedMessages;
  };

  const estimateTokenCount = (content) => {
    if (typeof content === 'string') {
      return content.split(' ').length + 4;
    } else {
      return 50;
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-container">
      <div className={`chatbot ${isOpen ? 'open' : ''}`} aria-live="polite" aria-atomic="false">
        <div className="chatbot-header">
          {isOpen && <button className="close-button" onClick={toggleChat}>×</button>}
        </div>
        <div className="chatbot-messages">
          {truncateMessages(messages).map((message, index) => (
            <div key={index} className={`chatbot-message ${message.role}`}>
              {typeof message.content === 'string' ? message.content : message.content}
            </div>
          ))}
        </div>
        <div className="chatbot-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="send-button" onClick={handleSend}>Send</button>
          <button className="clear-button" onClick={handleClearHistory}>Clear History</button>
        </div>
      </div>
      {!isOpen && (
        <button className="chatbot-toggle" onClick={toggleChat} aria-label={`${isOpen ? 'Close' : 'Open'} Chatbot`}>
          <FontAwesomeIcon icon={faCommentDots} size="2x" />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
