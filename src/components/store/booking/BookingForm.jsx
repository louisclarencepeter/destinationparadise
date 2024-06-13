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

  const [formStatus, setFormStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const data = new FormData(form);

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      });

      if (response.ok) {
        setFormStatus('Booking request submitted successfully.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          date: '',
          tour: '',
          location: '',
          message: '',
        });
      } else {
        setFormStatus('Failed to submit booking request.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormStatus('Error submitting booking request.');
    }
  };

  return (
    <form 
      name="booking-request" 
      method="POST" 
      data-netlify="true" 
      data-netlify-honeypot="bot-field" 
      className="booking-form"
      onSubmit={handleSubmit}
      netlify
    >
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
      <FormInput 
        label="Email:" 
        id="email" 
        name="email" 
        value={formData.email} 
        onChange={handleChange} 
        required 
        autocomplete="email"
      />
      <FormInput 
        label="Phone:" 
        id="phone" 
        name="phone" 
        value={formData.phone} 
        onChange={handleChange} 
        required 
        autocomplete="tel"
      />
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
      <FormTextarea 
        label="Message:" 
        id="message" 
        name="message" 
        value={formData.message} 
        onChange={handleChange} 
        required 
        autocomplete="off"
      />
      <button type="submit" className="submit-button">Submit Booking Request</button>
      {formStatus && <p>{formStatus}</p>}
    </form>
  );
};

export default BookingForm;
