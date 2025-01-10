import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage chat scroll behavior
 * @param {Object} params
 * @param {Array} params.messages - Array of chat messages
 * @param {boolean} params.smooth - Whether to use smooth scrolling
 * @returns {{ containerRef: React.RefObject, scrollToBottom: Function }}
 */
export const useChatScroll = ({ messages, smooth = true }) => {
  const containerRef = useRef(null);
  const lastMessageRef = useRef(null);
  
  // Track if user has manually scrolled up
  const userScrolledRef = useRef(false);
  
  // Track last message count to detect new messages
  const messageCountRef = useRef(messages.length);

  const scrollToBottom = (force = false) => {
    if (!containerRef.current || (!force && userScrolledRef.current)) return;

    lastMessageRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end'
    });
  };

  // Handle scroll events to detect when user manually scrolls up
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Consider user has scrolled up if not at bottom (with small threshold)
      userScrolledRef.current = Math.abs(scrollHeight - clientHeight - scrollTop) > 50;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > messageCountRef.current) {
      messageCountRef.current = messages.length;
      scrollToBottom();
    }
  }, [messages]);

  return {
    containerRef,
    lastMessageRef,
    scrollToBottom
  };
};