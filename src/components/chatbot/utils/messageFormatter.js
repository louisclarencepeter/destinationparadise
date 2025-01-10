/**
 * Split text into sections based on number patterns
 * @param {string} text 
 * @returns {string[]}
 */
const splitNumberedText = (text) => {
    // Match both single and double digit numbers followed by a dot
    return text.split(/(?=\d+\.\s)/)
      .filter(section => section.trim())
      .map(section => section.trim());
  };
  
  /**
   * Format text with bold styling
   * @param {string} text 
   * @returns {string}
   */
  const formatBoldText = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };
  
  /**
   * Clean and format the message content
   * @param {string} content 
   * @returns {object}
   */
  export const formatMessageContent = (content) => {
    if (typeof content !== 'string') return { type: 'raw', content };
  
    const sections = splitNumberedText(content);
    const formattedSections = sections.map(section => ({
      text: formatBoldText(section),
      isNumbered: /^\d+\./.test(section)
    }));
  
    return {
      type: 'formatted',
      sections: formattedSections
    };
  };