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

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        <FontAwesomeIcon icon={faCommentDots} />
      </button>
      {isOpen && (
        <div className={`chatbot ${isOpen ? 'open' : ''}`}>
          <div className="chatbot-header">
            <button className="close-button" onClick={() => setIsOpen(false)}>
              &times;
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                {message.content}
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
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
