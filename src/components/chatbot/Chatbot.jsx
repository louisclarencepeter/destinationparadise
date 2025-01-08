import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { debounce } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import config from "./chatbotConfig.json";
import "./Chatbot.scss";
import FormattedMessage from "./FormattedMessage"; // Import the FormattedMessage component

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Initial Greeting
  useEffect(() => {
    const greeting =
      config.parameters?.greeting ||
      "Welcome to Destination Paradise Zanzibar! How can I help today? :)";
    setMessages([{ content: greeting, role: "assistant" }]);
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle input change
  const handleInputChange = useCallback((event) => {
    setInput(event.target.value);
  }, []);

  // Send message
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage = { content: input, role: "user" };
    setMessages((prev) => [
      ...prev,
      userMessage,
      { content: "", role: "assistant", isTyping: true },
    ]);
    setInput("");

    try {
      const response = await axios.post("/.netlify/functions/chatbot", {
        message: input,
      });
      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          content: response.data.response,
          role: "assistant",
          isTyping: false,
        };
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          content: (
            <span role="alert">
              Service unavailable. Contact us via WhatsApp{" "}
              <a
                href={config.parameters.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="whatsapp-link"
              >
                <FontAwesomeIcon icon={faWhatsapp} size="lg" />
              </a>
            </span>
          ),
          role: "assistant",
          isTyping: false,
        };
        return updatedMessages;
      });
    }
  }, [input]);

  const debouncedHandleSend = useCallback(
    debounce(() => handleSend(), 300),
    [handleSend],
  );

  // Handle toggling chatbot visibility
  const toggleChatbot = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div className="chatbot-container" aria-live="polite">
      <button
        className={`chatbot-toggle ${isOpen ? "hidden" : ""}`}
        onClick={toggleChatbot}
        aria-label="Open chat"
        aria-expanded={isOpen}
        aria-controls="chatbot"
      >
        <FontAwesomeIcon icon={faCommentDots} />
      </button>

      {isOpen && (
        <div
          id="chatbot"
          className={`chatbot ${isOpen ? "open" : ""}`}
          role="dialog"
          aria-labelledby="chatbot-title"
        >
          <div className="chatbot-header">
            <h2 id="chatbot-title" className="sr-only">
              Chatbot
            </h2>
            <button
              className="close-button"
              onClick={toggleChatbot}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="chatbot-messages" aria-live="polite">
            {messages.map((message, index) => (
              <FormattedMessage
                key={index}
                content={message.content}
                role={message.role}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={(event) =>
                event.key === "Enter" && debouncedHandleSend()
              }
              aria-label="Type your message"
            />
            <button onClick={debouncedHandleSend} aria-label="Send message">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;