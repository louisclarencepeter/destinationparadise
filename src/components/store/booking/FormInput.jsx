// FormInput.jsx
import PropTypes from "prop-types";

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
  return (
    <div className="form-group">
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