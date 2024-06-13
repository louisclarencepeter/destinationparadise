import React, { useState } from 'react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';

const BookingForm = ({ tours, locations }) => {
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

  return (
    <form 
      name="booking-request" 
      method="POST" 
      data-netlify="true" 
      data-netlify-honeypot="bot-field" 
      className="booking-form"
    >
      <input type="hidden" name="form-name" value="booking-request" />
      <input type="hidden" name="bot-field" />
      <FormInput label="Name:" id="name" name="name" value={formData.name} onChange={handleChange} required />
      <FormInput label="Email:" id="email" name="email" value={formData.email} onChange={handleChange} required />
      <FormInput label="Phone:" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
      <FormInput label="Preferred Date:" id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
      <FormSelect label="Select Tour:" id="tour" name="tour" value={formData.tour} options={tours} onChange={handleChange} required />
      <FormSelect label="Pick Up Location (Part of the Island):" id="location" name="location" value={formData.location} options={locations} onChange={handleChange} required />
      <FormTextarea label="Message:" id="message" name="message" value={formData.message} onChange={handleChange} required />
      <button type="submit" className="submit-button">Submit Booking Request</button>
    </form>
  );
};

export default BookingForm;
