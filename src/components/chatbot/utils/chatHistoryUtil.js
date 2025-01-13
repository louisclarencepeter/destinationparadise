export const saveChatHistory = (userId, messages) => {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || {};
    chatHistory[userId] = messages;
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  };
  
  export const getChatHistory = (userId) => {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || {};
    return chatHistory[userId] || [];
  };
  