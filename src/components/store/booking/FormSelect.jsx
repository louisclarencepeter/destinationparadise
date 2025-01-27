// FormSelect.jsx
import PropTypes from "prop-types";

const FormSelect = ({ label, id, options, ...props }) => {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-group__label">{label}</label>
      <select
        id={id}
        {...props}
        className="form-group__input"
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map((option, index) => (
          <option key={`${option}-${index}`} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

FormSelect.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  autoComplete: PropTypes.string
};

export default FormSelect;