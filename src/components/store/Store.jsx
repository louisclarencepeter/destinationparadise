import React from 'react';
import './Store.scss';
import ImageSlideshow from './ImageSlideshow';
import BookingForm from './booking/BookingForm';

const Store = () => {
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

  const handleSubmit = (formData) => {
    console.log('Form submitted:', formData);
  };

  return (
    <div className="store-container">
     <h2>Booking Request</h2>
      <ImageSlideshow images={images} />
      <div className="booking-request"> 
        <p>Welcome to the booking request page. Please fill out the form below to make a new booking.</p>
        <BookingForm tours={tours} locations={locations} handleSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default Store;
