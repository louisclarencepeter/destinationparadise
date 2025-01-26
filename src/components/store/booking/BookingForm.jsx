import PropTypes from 'prop-types';
import { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';
import './BookingForm.scss';

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
    return (
      <div className="booking-form">
        <p className="success-message" role="status" aria-live="polite">
          Thank you for your booking request! We will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="booking-form" aria-labelledby="booking-form-title">
      <h3 id="booking-form-title" className="booking-form-title">Booking Request Form</h3>
      <input type="hidden" name="form-name" value="booking-request" />
      <input type="hidden" name="bot-field" />
      <FormInput 
        label="Name:" 
        id="name" 
        name="name" 
        value={formData.name} 
        onChange={handleChange} 
        required 
        autoComplete="name"
      />
      <ValidationError prefix="Name" field="name" errors={state.errors} className="error-message" aria-live="polite" />
      <FormInput 
        label="Email:" 
        id="email" 
        name="email" 
        value={formData.email} 
        onChange={handleChange} 
        required 
        autoComplete="email"
      />
      <ValidationError prefix="Email" field="email" errors={state.errors} className="error-message" aria-live="polite" />
      <FormInput 
        label="Phone:" 
        id="phone" 
        name="phone" 
        value={formData.phone} 
        onChange={handleChange} 
        required 
        autoComplete="tel"
      />
      <ValidationError prefix="Phone" field="phone" errors={state.errors} className="error-message" aria-live="polite" />
      <FormInput 
        label="Preferred Date:" 
        id="date" 
        name="date" 
        type="date" 
        value={formData.date} 
        onChange={handleChange} 
        required 
        autoComplete="bday"
      />
      <ValidationError prefix="Date" field="date" errors={state.errors} className="error-message" aria-live="polite" />
      <FormSelect 
        label="Select Tour:" 
        id="tour" 
        name="tour" 
        value={formData.tour} 
        options={tours} 
        onChange={handleChange} 
        required 
        autoComplete="off"
      />
      <ValidationError prefix="Tour" field="tour" errors={state.errors} className="error-message" aria-live="polite" />
      <FormSelect 
        label="Pick Up Location (Part of the Island):" 
        id="location" 
        name="location" 
        value={formData.location} 
        options={locations} 
        onChange={handleChange} 
        required 
        autoComplete="off"
      />
      <ValidationError prefix="Location" field="location" errors={state.errors} className="error-message" aria-live="polite" />
      <FormTextarea 
        label="Message:" 
        id="message" 
        name="message" 
        value={formData.message} 
        onChange={handleChange} 
        required 
        autoComplete="off"
      />
      <ValidationError prefix="Message" field="message" errors={state.errors} className="error-message" aria-live="polite" />
      <button type="submit" disabled={state.submitting} className="submit-button">
        {state.submitting ? "Submitting..." : "Submit Booking Request"}
      </button>
      {state.errors && state.errors.length > 0 && (
        <p className="error-message" role="alert">Please fix the errors above.</p>
      )}
    </form>
  );
};

BookingForm.propTypes = {
  tours: PropTypes.arrayOf(PropTypes.string).isRequired,
  locations: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default BookingForm;
