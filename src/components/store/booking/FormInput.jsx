// FormInput.jsx
import PropTypes from "prop-types";
import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";

const FormInput = ({ 
  label, 
  id, 
  name, 
  type = "text", 
  value, 
  onChange, 
  required = false, 
  autoComplete = "off",
  placeholder = "" 
}) => {
  const [ref, entries] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px"
  });

  const isVisible = entries?.some((entry) => entry.isIntersecting);

  return (
    <div 
      ref={ref} 
      className={`form-group ${isVisible ? "visible" : ""}`}
    >
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-required={required.toString()}
        className="form-control reveal"
      />
    </div>
  );
};

FormInput.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  autoComplete: PropTypes.string,
  placeholder: PropTypes.string
};

export default FormInput;