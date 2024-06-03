import { useState, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.scss';
import config from './chatbotConfig.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

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
      const userMessage = {
        content: input,
        role: 'user'
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');
      try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          messages: [...messages, userMessage],
          model: 'gpt-3.5-turbo',
          max_tokens: 2048,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        });
        const assistantMessage = {
          content: response.data.choices[0].message.content,
          role: 'assistant'
        };
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
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
    } else {
      console.error('Greeting description is undefined');
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-container">
      <div className={`chatbot ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-messages">
          {messages.map((message, index) => (
            <div key={index} className={`chatbot-message ${message.role}`}>
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
          <button className="send-button" onClick={handleSend}>Send</button>
          <button className="clear-button" onClick={handleClearHistory}>Clear History</button>
        </div>
      </div>
      <button className="chatbot-toggle" onClick={toggleChat} aria-label="Toggle Chatbot">
        <FontAwesomeIcon icon={faCommentDots} size="2x" />
      </button>
    </div>
  );
};

export default Chatbot;