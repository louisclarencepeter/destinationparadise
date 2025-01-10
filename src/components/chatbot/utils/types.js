/**
 * @typedef {Object} Message
 * @property {string} content - The message content
 * @property {'user' | 'assistant'} role - The role of the message sender
 * @property {boolean} [isTyping] - Whether the message is currently being typed
 * @property {boolean} [error] - Whether the message is an error message
 */

/**
 * @typedef {Object} FormattedSection
 * @property {string} text - The formatted text content
 * @property {boolean} isNumbered - Whether this section starts with a number
 */

/**
 * @typedef {Object} FormattedContent
 * @property {'raw' | 'formatted'} type - The type of content
 * @property {FormattedSection[] | React.ReactNode} content - The formatted content
 */