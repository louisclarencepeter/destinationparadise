// hooks/useChatScroll.js

import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage chat scroll behavior.
 * @param {Object} params
 * @param {Array} params.messages - Array of chat messages.
 * @param {boolean} params.smooth - Whether to use smooth scrolling.
 * @param {boolean} params.isOpen - Whether the chat window is open.
 * @returns {{
 *   containerRef: React.RefObject,
 *   lastMessageRef: React.RefObject,
 *   scrollToBottom: Function
 * }}
 */
export const useChatScroll = ({ messages, smooth = true, isOpen }) => {
  const containerRef = useRef(null);
  const lastMessageRef = useRef(null);
  
  // Track if user has manually scrolled up.
  const userScrolledRef = useRef(false);
  
  // Track last message count to detect new messages.
  const messageCountRef = useRef(messages.length);

  const scrollToBottom = (force = false) => {
    if (!containerRef.current || (!force && userScrolledRef.current)) return;

    lastMessageRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end'
    });
  };

  // Listen for manual scrolling to update the userScrolled flag.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Consider user has scrolled up if not at the bottom (with a small threshold).
      userScrolledRef.current = Math.abs(scrollHeight - clientHeight - scrollTop) > 50;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll when new messages arrive or when chat opens.
  useEffect(() => {
    if (isOpen) {
      // Reset the user scrolled flag when the chat is opened.
      userScrolledRef.current = false;
    }
    
    if (messages.length > messageCountRef.current || isOpen) {
      messageCountRef.current = messages.length;
      scrollToBottom();
    }
  }, [messages, isOpen]);

  return {
    containerRef,
    lastMessageRef,
    scrollToBottom
  };
};
