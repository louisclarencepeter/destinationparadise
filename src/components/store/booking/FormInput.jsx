// FormInput.jsx
import PropTypes from "prop-types";

const FormInput = ({ label, id, ...props }) => {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-group__label">{label}</label>
      <input
        id={id}
        {...props}
        className="form-group__input"
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