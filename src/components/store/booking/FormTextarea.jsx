import PropTypes from 'prop-types';

const FormTextarea = ({ label, id, name, value, onChange, required = false, autoComplete = 'off' }) => {
  return (
    <div className="reveal form-group">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        aria-required={required}
      ></textarea>
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
};

export default FormTextarea;
