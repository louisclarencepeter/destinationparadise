import PropTypes from "prop-types";
import "./Card.scss";

/**
 * Reusable Card Component
 * ---------------------------------
 * Accepts children (content inside the card),
 * optional title, subtitle, and className for custom styling.
 *
 * Usage Example:
 * <Card title="Founder’s Story">
 *   <p>This all started as a dream...</p>
 * </Card>
 */

export const Card = ({ title, subtitle, children, className = "" }) => {
  return (
    <div className={`dp-card-wrapper ${className}`}>
      {title && <h2 className="dp-card-title">{title}</h2>}
      {subtitle && <h4 className="dp-card-subtitle">{subtitle}</h4>}
      <div className="dp-card-content">{children}</div>
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Card;