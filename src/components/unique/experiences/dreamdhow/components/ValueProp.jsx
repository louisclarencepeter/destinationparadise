import PropTypes from "prop-types";

/**
 * Value Proposition Item Component
 * @param {Object} props
 * @param {string} props.icon - FontAwesome icon class
 * @param {string} props.title - Value prop title
 * @param {string} props.description - Value prop description
 * @param {number} props.delay - Animation delay in seconds
 */
const ValueProp = ({ icon, title, description, delay = 0 }) => {
  return (
    <div
      className="value-prop-item stagger-item"
      style={{ animationDelay: `${delay}s` }}
    >
      <i className={icon}></i>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

ValueProp.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  delay: PropTypes.number,
};

export default ValueProp;