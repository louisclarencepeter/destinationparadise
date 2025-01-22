import PropTypes from 'prop-types';
import { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { useIntersectionObserver } from '../../../hooks/useIntersectionObserver';
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

  const [ref, entries] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const isVisible = entries?.some(entry => entry.isIntersecting);

  if (state.succeeded) {
    return (
      <div className="success-message">
        <h3>Thank you for your booking request!</h3>
        <p>We'll get back to you shortly to confirm your tour details.</p>
      </div>
    );
  }

  return (
    <form 
      ref={ref}
      onSubmit={handleSubmit} 
      className={`booking-form ${isVisible ? 'visible' : ''}`}
      aria-labelledby="booking-form-title"
    >
      <h3 id="booking-form-title">Booking Request Form</h3>
      
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
        placeholder="Enter your full name"
      />
      <ValidationError 
        prefix="Name" 
        field="name" 
        errors={state.errors} 
      />

      <FormInput 
        label="Email:" 
        id="email" 
        name="email" 
        type="email"
        value={formData.email} 
        onChange={handleChange} 
        required 
        autoComplete="email"
        placeholder="Enter your email address"
      />
      <ValidationError 
        prefix="Email" 
        field="email" 
        errors={state.errors} 
      />

      <FormInput 
        label="Phone:" 
        id="phone" 
        name="phone" 
        type="tel"
        value={formData.phone} 
        onChange={handleChange} 
        required 
        autoComplete="tel"
        placeholder="Enter your phone number"
      />
      <ValidationError 
        prefix="Phone" 
        field="phone" 
        errors={state.errors} 
      />

      <FormInput 
        label="Preferred Date:" 
        id="date" 
        name="date" 
        type="date" 
        value={formData.date} 
        onChange={handleChange} 
        required 
        min={new Date().toISOString().split('T')[0]}
      />
      <ValidationError 
        prefix="Date" 
        field="date" 
        errors={state.errors} 
      />

      <FormSelect 
        label="Select Tour:" 
        id="tour" 
        name="tour" 
        value={formData.tour} 
        options={tours} 
        onChange={handleChange} 
        required 
      />
      <ValidationError 
        prefix="Tour" 
        field="tour" 
        errors={state.errors} 
      />

      <FormSelect 
        label="Pick Up Location:" 
        id="location" 
        name="location" 
        value={formData.location} 
        options={locations} 
        onChange={handleChange} 
        required 
      />
      <ValidationError 
        prefix="Location" 
        field="location" 
        errors={state.errors} 
      />

      <FormTextarea 
        label="Special Requests or Questions:" 
        id="message" 
        name="message" 
        value={formData.message} 
        onChange={handleChange} 
        placeholder="Any special requirements or questions?"
      />
      <ValidationError 
        prefix="Message" 
        field="message" 
        errors={state.errors} 
      />

      <button 
        type="submit" 
        disabled={state.submitting} 
        className="submit-button reveal"
      >
        {state.submitting ? 'Submitting...' : 'Submit Booking Request'}
      </button>

      {state.errors?.length > 0 && (
        <div className="error-summary">
          Please fix the errors above before submitting.
        </div>
      )}
    </form>
  );
};

BookingForm.propTypes = {
  tours: PropTypes.arrayOf(PropTypes.string).isRequired,
  locations: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default BookingForm;