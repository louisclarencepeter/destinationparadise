import PropTypes from "prop-types";
import { useAnimateOnScroll } from "../hooks/useDreamDhowHooks";
import ValueProp from "../components/ValueProp";

/**
 * Why Book Us Section Component with Enhanced Animations
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.promoText - Promotional text (can include HTML)
 * @param {Array} props.valueProps - Array of value proposition objects
 * @param {string} props.footerText - Footer text (can include HTML)
 * @param {string} props.whatsappLink - WhatsApp contact link
 */
const WhyBookUsSection = ({
  title,
  promoText,
  valueProps,
  footerText,
  whatsappLink,
}) => {
  const [whyBookRef, isAnimating] = useAnimateOnScroll({ threshold: 0.1 });

  return (
    <div
      ref={whyBookRef}
      className={`why-book-us-section stagger-container ${
        isAnimating ? "animate" : ""
      }`}
    >
      <h2>{title}</h2>
      <p className="promo-text" dangerouslySetInnerHTML={{ __html: promoText }} />
      <div className="value-props">
        {valueProps.map((prop, index) => (
          <ValueProp
            key={index}
            icon={prop.icon}
            title={prop.title}
            description={prop.description}
            delay={0.1 * (index + 1)}
          />
        ))}
      </div>
      <p className="slogan-footer">
        {footerText}
        <br />
        <a
          href={whatsappLink}
          className="contact-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-whatsapp"></i> DM us now to reserve your spot!
        </a>
      </p>
    </div>
  );
};

WhyBookUsSection.propTypes = {
  title: PropTypes.string.isRequired,
  promoText: PropTypes.string.isRequired,
  valueProps: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ).isRequired,
  footerText: PropTypes.string.isRequired,
  whatsappLink: PropTypes.string.isRequired,
};

export default WhyBookUsSection;