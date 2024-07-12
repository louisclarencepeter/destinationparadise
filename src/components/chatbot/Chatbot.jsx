import { useState, useEffect, useRef } from 'react';
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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const greeting = config.parameters?.greeting || "Welcome to Destination Paradise Zanzibar! How can I help today? :)";
    setMessages([{ content: greeting, role: 'assistant' }]);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { content: input, role: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');

    setMessages(prevMessages => [...prevMessages, { content: '', role: 'assistant', isTyping: true }]);

    try {
      const response = await axios.post('/.netlify/functions/chatbot', { message: input });

      setTimeout(() => {
        setMessages(prevMessages => {
          const newMessages = prevMessages.slice();
          newMessages[newMessages.length - 1] = { content: response.data.response, role: 'assistant', isTyping: false };
          return newMessages;
        });
      }, 2000); // Adjust delay as needed
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        content: (
          <span>
            Currently, this service is unavailable. Please contact us directly via WhatsApp
            <a
              href={config.parameters.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="whatsapp-link"
            >
              <FontAwesomeIcon icon={faWhatsapp} size="lg" />
            </a>
            for assistance.
          </span>
        ),
        role: 'assistant',
        isTyping: false
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  return (
    <div className="chatbot-container">
      <button className={`chatbot-toggle ${isOpen ? 'hidden' : ''}`} onClick={toggleChatbot}>
        <FontAwesomeIcon icon={faCommentDots} />
      </button>
      {isOpen && (
        <div className={`chatbot ${isOpen ? 'open' : ''}`}>
          <div className="chatbot-header">
            <button className="close-button" onClick={toggleChatbot}>×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                {message.isTyping ? (
                  <span className="typing-indicator">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </span>
                ) : (
                  message.content
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={event => event.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
