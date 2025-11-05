import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';
import './BookingForm.scss';

const BookingForm = ({ tours, locations, prefilledTour = '' }) => {
  const [state, handleSubmit] = useForm("mlekgonz");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    tour: prefilledTour,
    location: '',
    message: '',
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update tour field when prefilledTour changes
  useEffect(() => {
    if (prefilledTour) {
      setFormData(prevData => ({
        ...prevData,
        tour: prefilledTour
      }));
    }
  }, [prefilledTour]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (state.succeeded) {
    return (
      <div className="booking-form">
        <p className="booking-form__success-message" role="status" aria-live="polite">
          Thank you for your booking request! We will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="booking-form" aria-labelledby="booking-form-title">
      <h3 className="booking-form__title" id="booking-form-title">Request Form</h3>
      
      {prefilledTour && (
        <p className="booking-form__prefill-notice">
          ✨ Tour pre-selected: <strong>{prefilledTour}</strong>
        </p>
      )}
      
      <div className="booking-form__group">
        <FormInput 
          label="Name:" 
          id="name" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
          autoComplete="name" 
        />
        <ValidationError prefix="Name" field="name" errors={state.errors} className="booking-form__error" aria-live="polite" />
      </div>

      <div className="booking-form__group">
        <FormInput 
          label="Email:" 
          id="email" 
          name="email" 
          type="email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
          autoComplete="email" 
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} className="booking-form__error" aria-live="polite" />
      </div>

      <div className="booking-form__group">
        <FormInput 
          label="Phone:" 
          id="phone" 
          name="phone" 
          type="tel" 
          value={formData.phone} 
          onChange={handleChange} 
          required 
          autoComplete="tel" 
        />
        <ValidationError prefix="Phone" field="phone" errors={state.errors} className="booking-form__error" aria-live="polite" />
      </div>

      <div className="booking-form__group">
        {isMobile ? (
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
        ) : (
          <FormInput 
            label="Preferred Date:" 
            id="date" 
            name="date" 
            type="text" 
            value={formData.date} 
            onChange={handleChange} 
            required 
            placeholder="dd.mm.yyyy"
            pattern="\d{2}\.\d{2}\.\d{4}"
          />
        )}
        <ValidationError prefix="Date" field="date" errors={state.errors} className="booking-form__error" aria-live="polite" />
      </div>

      <div className="booking-form__group">
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
        <ValidationError prefix="Tour" field="tour" errors={state.errors} className="booking-form__error" aria-live="polite" />
      </div>

      <div className="booking-form__group">
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
        <ValidationError prefix="Location" field="location" errors={state.errors} className="booking-form__error" aria-live="polite" />
      </div>

      <div className="booking-form__group">
        <FormTextarea 
          label="Message:" 
          id="message" 
          name="message" 
          value={formData.message} 
          onChange={handleChange} 
          required 
          autoComplete="off" 
        />
        <ValidationError prefix="Message" field="message" errors={state.errors} className="booking-form__error" aria-live="polite" />
      </div>

      <button type="submit" disabled={state.submitting} className="booking-form__submit reveal">
        {state.submitting ? "Submitting..." : "Submit Booking Request"}
      </button>
      
      {state.errors && state.errors.length > 0 && (
        <p className="booking-form__error-message" role="alert">Please fix the errors above.</p>
      )}
    </form>
  );
};

BookingForm.propTypes = {
  tours: PropTypes.arrayOf(PropTypes.string).isRequired,
  locations: PropTypes.arrayOf(PropTypes.string).isRequired,
  prefilledTour: PropTypes.string,
};

export default BookingForm;