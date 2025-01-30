// components/NewsletterForm.jsx
import { useState } from "react";
import "./NewsletterForm.scss";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/.netlify/functions/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("Thank you for subscribing to our newsletter!");
        setEmail("");
      } else {
        const error = await response.json();
        setMessage(error.message || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="newsletter-form">
      <form
        onSubmit={handleSubmit}
        className="newsletter-form__form"
        aria-label="Newsletter subscription form"
        autoComplete="on"
      >
        <label htmlFor="email" className="newsletter-form__label">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          className="newsletter-form__input"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          aria-label="Email address"
        />
        <button
          type="submit"
          className="newsletter-form__button"
          aria-label="Submit email for newsletter"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : ">"}
        </button>
      </form>
      {message && <p className="newsletter-form__message">{message}</p>}
    </div>
  );
}

export default NewsletterForm;
