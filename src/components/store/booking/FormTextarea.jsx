import React from 'react';

const FormTextarea = ({ label, id, name, value, onChange, required }) => {
  return (
    <div className="reveal form-group">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      ></textarea>
    </div>
  );
};

export default FormTextarea;
