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
          model: 'gpt-3.5-turbo', // Use a valid model name, e.g., 'gpt-3.5-turbo' or 'gpt-4'
          max_tokens: 8192,
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
        if (error.response && error.response.status === 400) {
          const errorMessage = {
            content: 'Sorry, the service is not available at the moment. Please contact us directly at +255 748 352 657 or via WhatsApp with this number for assistance.',
            role: 'assistant'
          };
          setMessages(prevMessages => [...prevMessages, errorMessage]);
        } else {
          // Handle other errors
          const errorMessage = {
            content: 'An error occurred while processing your request. Please try again later.',
            role: 'assistant'
          };
          setMessages(prevMessages => [...prevMessages, errorMessage]);
        }
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

  const truncateMessages = (messages) => {
    const maxTokens = 8192;
    let tokenCount = 0;
    const truncatedMessages = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const messageTokens = messages[i].content.split(' ').length;
      if (tokenCount + messageTokens <= maxTokens) {
        truncatedMessages.unshift(messages[i]);
        tokenCount += messageTokens;
      } else {
        break;
      }
    }

    return truncatedMessages;
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-container">
      <div className={`chatbot ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          {isOpen && <button className="close-button" onClick={toggleChat}>×</button>}
        </div>
        <div className="chatbot-messages">
          {truncateMessages(messages).map((message, index) => (
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
      {!isOpen && (
        <button className="chatbot-toggle" onClick={toggleChat} aria-label="Toggle Chatbot">
          <FontAwesomeIcon icon={faCommentDots} size="2x" />
        </button>
      )}
    </div>
  );
};

export default Chatbot;