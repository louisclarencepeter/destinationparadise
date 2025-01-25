// FormTextarea.jsx
import PropTypes from "prop-types";

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
  return (
    <div className="form-group">
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

export default FormTextarea;