// FormTextarea.jsx
import PropTypes from "prop-types";

const FormTextarea = ({ label, id, ...props }) => {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-group__label">{label}</label>
      <textarea
        id={id}
        {...props}
        className="form-group__input reveal"
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