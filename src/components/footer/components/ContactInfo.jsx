// components/ContactInfo.jsx
import "./ContactInfo.scss";

function ContactInfo() {
  return (
    <div className="contact-info">
      <p>Destination Paradise</p>
      <p>
        Phone:{" "}
        <a href="tel:+255748352657" aria-label="Call us at +255 748 352 657">
          +255 748 352 657
        </a>
        <a
          href="https://wa.me/255748352657"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="contact-info__whatsapp-link"
        >
          <i className="fab fa-whatsapp contact-info__whatsapp-icon" aria-hidden="true"></i>
        </a>
      </p>
      <p>
        <a href="mailto:info@yournexttriptoparadise.com" aria-label="Send us an email">
          info@yournexttriptoparadise.com
        </a>
      </p>
      <p>Zanzibar, Tanzania</p>
    </div>
  );
}

export default ContactInfo;