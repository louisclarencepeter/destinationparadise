/**
 * Split text into sections, including:
 *  - Text before the first "digit-dot-space" pattern
 *  - Each "digit-dot-space" section
 *  - Text after the last "digit-dot-space" pattern
 *
 * @param {string} text 
 * @returns {string[]}
 */
const splitNumberedText = (text) => {
  // Pattern explanation:
  //   (\d+\.\s+[\s\S]*?) : capture "digit(s)-dot-whitespace" plus everything
  //                        until the next digit-dot-whitespace OR the end
  //   (?=\d+\.\s+|$)     : lookahead to see if there's another digit-dot-whitespace
  //                        OR the end of the string
  const pattern = /(\d+\.\s+[\s\S]*?)(?=\d+\.\s+|$)/g;
  
  let sections = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // If there's text *before* this match, capture it as a separate section
    if (match.index > lastIndex) {
      const chunkBefore = text.slice(lastIndex, match.index).trim();
      if (chunkBefore) {
        sections.push(chunkBefore);
      }
    }
    
    // Add the actual numbered section
    sections.push(match[1].trim());
    lastIndex = pattern.lastIndex;
  }

  // If there's leftover text *after* the last match, capture it too
  if (lastIndex < text.length) {
    const chunkAfter = text.slice(lastIndex).trim();
    if (chunkAfter) {
      sections.push(chunkAfter);
    }
  }

  return sections;
};

/**
 * Format text with bold styling
 * @param {string} text 
 * @returns {string}
 */
const formatBoldText = (text) => {
  // Replace **bold** with <strong>bold</strong>
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

/**
 * Clean and format the message content
 * @param {string} content 
 * @returns {object}
 */
export const formatMessageContent = (content) => {
  // If content is not a string, return it as raw
  if (typeof content !== 'string') {
    return { type: 'raw', content };
  }

  // Get *all* sections (including initial or trailing text)
  const sections = splitNumberedText(content);

  // Convert each section to { text: "...", isNumbered: true/false }
  const formattedSections = sections.map(section => ({
    text: formatBoldText(section),
    isNumbered: /^\d+\./.test(section)  // Check if it begins with digits + dot
  }));

  // Return a structured format, preserving all content
  return {
    type: 'formatted',
    sections: formattedSections
  };
};
