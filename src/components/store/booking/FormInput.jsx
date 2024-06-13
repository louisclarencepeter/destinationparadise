import React from 'react';

const FormInput = ({ label, id, name, type = "text", value, onChange, required }) => {
  return (
    <div className="reveal form-group">
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
};

export default FormInput;
