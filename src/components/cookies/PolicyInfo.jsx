import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "./PolicyInfo.scss";
import SEO from '../SEO.jsx';

const PolicyInfo = () => {
  const location = useLocation();
  const cookiesRef = useRef(null);
  const privacyRef = useRef(null);
  const termsRef = useRef(null);
  const contactRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    alert("Form submitted! We will get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  useEffect(() => {
    const scrollToSection = () => {
      switch (location.pathname) {
        case "/cookies-policy":
          cookiesRef.current?.scrollIntoView({ behavior: "smooth" });
          break;
        case "/privacy-policy":
          privacyRef.current?.scrollIntoView({ behavior: "smooth" });
          break;
        case "/terms-of-service":
          termsRef.current?.scrollIntoView({ behavior: "smooth" });
          break;
        default:
          window.scrollTo(0, 0);
      }
    };

    scrollToSection();
  }, [location.pathname]);

  useEffect(() => {
    const revealSections = () => {
      const sections = document.querySelectorAll(".policy-info section");
      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (sectionTop < windowHeight * 0.75) {
          section.classList.add("active");
        }
      });
    };

    window.addEventListener("scroll", revealSections);
    revealSections();

    return () => window.removeEventListener("scroll", revealSections);
  }, []);

  return (
    <div className="policy-info">
      <SEO
        title="Policies | Destination Paradise Zanzibar"
        description="Read about our cookies policy, privacy policy, and terms of service."/>
      <h2>Our Policies</h2>

      <section ref={cookiesRef} id="cookies-policy" className="reveal">
        <h4>Cookies Policy</h4>
        <p>
          Our Cookies Policy outlines the types of cookies we use, the purposes
          for which they are used, and the information they collect. It provides
          detailed information about our cookie practices, including:
        </p>
        <ul>
          <li>Types of cookies used (e.g., essential, performance, functionality, and targeting cookies)</li>
          <li>Duration each type of cookie is stored</li>
          <li>Third-party services that use cookies on our website</li>
          <li>How to manage or disable cookies through browser settings</li>
        </ul>
        <p>
          We use cookies to improve your experience, personalize content, and analyze website traffic.
        </p>
      </section>

      <section ref={privacyRef} id="privacy-policy" className="reveal">
        <h4>Privacy Policy</h4>
        <p>
          Our Privacy Policy describes how we collect, use, and protect your personal information when you visit our website or use our services. It covers:
        </p>
        <ul>
          <li>Types of personal information collected (e.g., name, email, IP address)</li>
          <li>Purpose of data collection</li>
          <li>Data retention periods</li>
          <li>Sharing data with third parties</li>
          <li>User rights regarding their data (e.g., access, rectification, deletion)</li>
          <li>Data security measures</li>
        </ul>
        <p>
          We take various measures to safeguard your privacy and ensure the security of your data.
        </p>
      </section>

      <section ref={termsRef} id="terms-of-service" className="reveal">
        <h4>Terms of Service</h4>
        <p>
          Our Terms of Service outlines the rules and regulations governing your use of our website and services. It includes:
        </p>
        <ul>
          <li>User obligations and prohibited activities</li>
          <li>Account suspension or termination policies</li>
          <li>Limitations of liability</li>
          <li>Dispute resolution process</li>
          <li>Modifications to the terms and conditions</li>
          <li>Governing law and jurisdiction</li>
        </ul>
        <p>
          By using our website, you agree to abide by these terms and conditions.
        </p>
      </section>

      <section ref={contactRef} id="contact-information" className="reveal">
        <h4>Contact Information</h4>
        <p>
          For any inquiries regarding our policies, you can reach us at:
        </p>
        <ul>
          <li>Phone: <a href="tel:+255748352657">+255 748 352 657</a></li>
          <li>Email: <a href="mailto:info@yournexttriptoparadise.com">info@yournexttriptoparadise.com</a></li>
        </ul>
        <p>
          Our office is located in Zanzibar, Tanzania.
        </p>
        <p>
          You can also use our contact form below for privacy and policy-related inquiries.
        </p>
        <form onSubmit={handleSubmit} className="contact-form" aria-labelledby="contact-form-title">
          <h3 id="contact-form-title">Contact Us</h3>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              aria-required="true"
              aria-describedby="name-desc"
            />
            <small id="name-desc">Please enter your full name</small>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              aria-required="true"
              aria-describedby="email-desc"
            />
            <small id="email-desc">Please enter a valid email address</small>
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea 
              id="message" 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              required 
              aria-required="true"
              aria-describedby="message-desc"
            ></textarea>
            <small id="message-desc">Please enter your message</small>
          </div>
          <button type="submit">Submit</button>
        </form>
      </section>

      <section id="faqs" className="reveal">
        <h4>Frequently Asked Questions</h4>
        <p>
          Here are some common questions about our policies:
        </p>
        <ul>
          <li><strong>How can I manage cookies?</strong> You can manage cookies through your browser settings.</li>
          <li><strong>What personal data do you collect?</strong> We collect data such as your name, email, and IP address.</li>
          <li><strong>How can I request my data to be deleted?</strong> You can contact us to request the deletion of your data.</li>
        </ul>
      </section>
    </div>
  );
};

export default PolicyInfo;
