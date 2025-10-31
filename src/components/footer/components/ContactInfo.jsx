// components/ContactInfo.jsx
import "./ContactInfo.scss";

function ContactInfo() {
  // Use the new number you just provided
  const phoneNumber = "+255768779517";
  const phoneDisplay = "+255 768 779 517";
  
  // Use the new WhatsApp link you provided
  const whatsAppLink = "https://wa.me/message/YCOQDKJSDMXFD1"; 
  const email = "info@yournexttriptoparadise.com";

  return (
    <div className="contact-info">
      <p>Destination Paradise</p>
      <p>
        Phone:{" "}
        <a href={`tel:${phoneNumber}`} aria-label={`Call us at ${phoneDisplay}`}>
          {phoneDisplay}
        </a>
        <a
          href={whatsAppLink} // <-- Updated WhatsApp link
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="contact-info__whatsapp-link"
        >
          <i className="fab fa-whatsapp contact-info__whatsapp-icon" aria-hidden="true"></i>
        </a>
      </p>
      <p>
        <a href={`mailto:${email}`} aria-label="Send us an email">
          {email}
        </a>
      </p>
      <p>Zanzibar, Tanzania</p>
    </div>
  );
}

export default ContactInfo;