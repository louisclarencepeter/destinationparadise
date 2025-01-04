import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { tours } from "../../assets/data/tours";
import "./TourDetails.scss";

// --- Smaller Components ---

// Displays the tour image
function TourImage({ imageKey, title }) {
  return (
    <div className="tour-image">
      <img src={imageKey} alt={title} />
    </div>
  );
}

// Displays the tour header (title and description)
function TourHeader({ title, description }) {
  return (
    <div className="tour-header">
      <h3 className="tour-title">{title}</h3>
      <p className="tour-details-description">{description}</p>
    </div>
  );
}

// Displays a generic list (used for itinerary, activities, inclusions, etc.)
function ListSection({ title, items }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div>
      <h3>{title}:</h3>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// Displays a single FAQ item
function FaqItem({ faq }) {
  return (
    <li>
      <div>
        <b>Q:</b> {faq.question}
        <br />
        <b>A:</b> {faq.answer}
      </div>
    </li>
  );
}

// Displays the list of FAQs
function FaqList({ faqs }) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <div>
      <h3>FAQs:</h3>
      <ul>
        {faqs.map((faq, index) => (
          <FaqItem key={index} faq={faq} />
        ))}
      </ul>
    </div>
  );
}

// Displays the "Book Now" button
function BookNowButton({ onBookNow }) {
  return (
    <button className="book-now-button" onClick={onBookNow}>
      Book Now
    </button>
  );
}

// --- Main TourDetails Component ---

export default function TourDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Loading state (add logic if using API)
  const [error, setError] = useState(null); // Error state

  // Simulate API call (replace with actual data fetching if needed)
  const tour = tours.find((tour) => tour.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Example of how you would fetch data from an API:
    // setLoading(true);
    // setError(null);
    // fetch(`/api/tours/${id}`) // Replace with your API endpoint
    //   .then(res => {
    //     if (!res.ok) {
    //       throw new Error('Tour not found');
    //     }
    //     return res.json();
    //   })
    //   .then(data => {
    //     setTour(data);
    //   })
    //   .catch(err => {
    //     setError(err.message);
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
  }, [id]);

  const handleBookNowClick = () => {
    navigate("/booking#top", { replace: true });
  };

  if (loading) {
    return <div className="loading">Loading...</div>; // Display loading indicator
  }

  if (error || !tour) {
    return (
      <div className="tour-not-found">
        <h2>Tour not found</h2>
        <p>
          We couldn't find a tour with the ID: {id}. Please check the URL or
          browse our other exciting tours below:
        </p>
        <ul>
          {tours.slice(0, 3).map((otherTour) => (
            <li key={otherTour.id}>
              <Link to={`/tours/${otherTour.id}`}>{otherTour.title}</Link>
            </li>
          ))}
        </ul>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <section className="tour-details">
      <TourImage imageKey={tour.imageKey} title={tour.title} />
      <article className="tour-info">
        <TourHeader title={tour.title} description={tour.description} />

        <ListSection title="Itinerary" items={tour.itinerary} />
        <ListSection title="Activities" items={tour.activities} />
        <ListSection title="Inclusions" items={tour.inclusions} />
        <ListSection title="What to Bring" items={tour.whatToBring} />
        <FaqList faqs={tour.FAQs} />

        <p className="tour-duration">
          <b>Duration:</b> {tour.duration}
        </p>
        <p className="tour-price">
          <b>Price:</b> From ${tour.price} / person
        </p>

        <BookNowButton onBookNow={handleBookNowClick} />
      </article>
    </section>
  );
}