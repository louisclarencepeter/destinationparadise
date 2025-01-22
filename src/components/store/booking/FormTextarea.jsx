// FormTextarea.jsx
import PropTypes from "prop-types";
import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";

const FormTextarea = ({ 
  label, 
  id, 
  name, 
  value, 
  onChange, 
  required = false, 
  autoComplete = 'off',
  placeholder = '' 
}) => {
  const [ref, entries] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  const isVisible = entries?.some(entry => entry.isIntersecting);

  return (
    <div 
      ref={ref} 
      className={`form-group ${isVisible ? 'visible' : ''}`}
    >
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-required={required === true ? "true" : "false"}
        className="form-control"
      />
    </div>
  );
};

FormTextarea.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  autoComplete: PropTypes.string,
  placeholder: PropTypes.string
};

// Only export FormTextarea
export default FormTextarea;