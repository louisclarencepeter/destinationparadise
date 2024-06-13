import React, { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';

const BookingForm = ({ tours, locations }) => {
  const [state, handleSubmit] = useForm("mlekgonz");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    tour: '',
    location: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (state.succeeded) {
    return <p>Thank you for your booking request!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <input type="hidden" name="form-name" value="booking-request" />
      <input type="hidden" name="bot-field" />
      <FormInput 
        label="Name:" 
        id="name" 
        name="name" 
        value={formData.name} 
        onChange={handleChange} 
        required 
        autocomplete="name"
      />
      <ValidationError prefix="Name" field="name" errors={state.errors} />
      <FormInput 
        label="Email:" 
        id="email" 
        name="email" 
        value={formData.email} 
        onChange={handleChange} 
        required 
        autocomplete="email"
      />
      <ValidationError prefix="Email" field="email" errors={state.errors} />
      <FormInput 
        label="Phone:" 
        id="phone" 
        name="phone" 
        value={formData.phone} 
        onChange={handleChange} 
        required 
        autocomplete="tel"
      />
      <ValidationError prefix="Phone" field="phone" errors={state.errors} />
      <FormInput 
        label="Preferred Date:" 
        id="date" 
        name="date" 
        type="date" 
        value={formData.date} 
        onChange={handleChange} 
        required 
        autocomplete="bday"
      />
      <ValidationError prefix="Date" field="date" errors={state.errors} />
      <FormSelect 
        label="Select Tour:" 
        id="tour" 
        name="tour" 
        value={formData.tour} 
        options={tours} 
        onChange={handleChange} 
        required 
        autocomplete="off"
      />
      <ValidationError prefix="Tour" field="tour" errors={state.errors} />
      <FormSelect 
        label="Pick Up Location (Part of the Island):" 
        id="location" 
        name="location" 
        value={formData.location} 
        options={locations} 
        onChange={handleChange} 
        required 
        autocomplete="off"
      />
      <ValidationError prefix="Location" field="location" errors={state.errors} />
      <FormTextarea 
        label="Message:" 
        id="message" 
        name="message" 
        value={formData.message} 
        onChange={handleChange} 
        required 
        autocomplete="off"
      />
      <ValidationError prefix="Message" field="message" errors={state.errors} />
      <button type="submit" disabled={state.submitting} className="submit-button">
        Submit Booking Request
      </button>
      {state.errors && state.errors.length > 0 && <p className="error-message">Please fix the errors above.</p>}
    </form>
  );
};

export default BookingForm;
