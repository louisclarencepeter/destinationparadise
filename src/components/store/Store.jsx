import { useState } from 'react';
import './Store.scss';
import ImageSlideshow from './ImageSlideshow';

const Store = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    tour: '',
    location: '',
    message: '',
  });

  const tours = [
    'Spice Tour',
    'Historical City Tour',
    'Prison Island Boat Trip',
    'Jozani Forest Tour',
    'Dolphin Tour',
    'Sunset & The Rock Restaurant',
    'Snorkeling',
    'Village Tour',
    'Motorbike Renting',
    'Mnemba Snorkeling & Trip to the North',
    'Safari Blue',
    'Local Game Fishing',
    'Swimming in the Cave',
    'Sailing into the Sunset',
    'Quad Tour'
  ];

  const locations = [
    'Stone Town',
    'Nungwi',
    'Kendwa',
    'Matemwe',
    'Pongwe',
    'Kiwengwa',
    'Uroa',
    'Chwaka',
    'Michamvi',
    'Bwejuu',
    'Pingwe',
    'Kizimkazi',
    'Fumba',
    'Paje',
    'Jambiani',
    'Makunduchi'
  ];

  const images = [
    '/gallery/1.jpg',
    '/gallery/2.jpg',
    '/gallery/3.jpg',
    '/gallery/4.jpg',
    '/gallery/5.jpg',
    '/gallery/6.jpg',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormData({
      name: '',
      email: '',
      phone: '',
      date: '',
      tour: '',
      location: '',
      message: '',
    });
  };

  return (
    <div className="store-container">
      <ImageSlideshow images={images} />
      <div className="booking-request">
        <h2>Booking Request</h2>
        <p>Welcome to the booking request page. Please fill out the form below to make a new booking.</p>
        <form onSubmit={handleSubmit} className="booking-form">
          <div className=" reveal form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className=" reveal form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className=" reveal form-group">
            <label htmlFor="phone">Phone:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className=" reveal form-group">
            <label htmlFor="date">Preferred Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="reveal form-group">
            <label htmlFor="tour">Select Tour:</label>
            <select
              id="tour"
              name="tour"
              value={formData.tour}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select a tour</option>
              {tours.map((tour, index) => (
                <option key={index} value={tour}>{tour}</option>
              ))}
            </select>
          </div>
          <div className=" reveal form-group">
            <label htmlFor="location">Pick Up Location (Part of the Island):</label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select a location</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>
          <div className="reveal form-group">
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <button type="submit" className="submit-button">
            Submit Booking Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default Store;
