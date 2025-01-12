import { useState, useCallback } from 'react';
import axios from 'axios';
import config from '../chatbotConfig.json';

export const useChatMessages = () => {
  const [messages, setMessages] = useState([]);
  
  // Initialize chat with greeting
  useState(() => {
    const greeting = config.parameters?.greeting || 
      "Welcome to Destination Paradise Zanzibar! How can I help today? :)";
    setMessages([{ content: greeting, role: 'assistant' }]);
  }, []);

  const sendMessage = useCallback(async (input) => {
    if (!input.trim()) return;

    // Add user message and typing indicator
    const userMessage = { content: input, role: 'user' };
    setMessages(prev => [
      ...prev,
      userMessage,
      { content: '', role: 'assistant', isTyping: true }
    ]);

    try {
      const response = await axios.post('/.netlify/functions/chatbot', { 
        message: input 
      });
      
      // Update with bot response
      setMessages(prev => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          content: response.data.response,
          role: 'assistant',
          isTyping: false
        };
        return updatedMessages;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          content: "I apologize, but I'm having trouble connecting right now. Please try again later.",
          role: 'assistant',
          isTyping: false,
          error: true
        };
        return updatedMessages;
      });
    }
  }, []);

  return {
    messages,
    sendMessage
  };
};