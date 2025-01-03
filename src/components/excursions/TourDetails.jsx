// TourDetails.jsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { tours } from "../../assets/data/tours";
import "./TourDetails.scss";

export default function TourDetails() {
  const { id } = useParams();
  const tour = tours.find((tour) => tour.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!tour) {
    return <div>Tour not found</div>;
  }

  return (
    <section className="tour-details">
      <div className="tour-image">
        <img src={tour.image} alt={tour.title} />
      </div>
      <article className="tour-info">
        <h3 className="tour-title">{tour.title}</h3>
        <p className="tour-details-description">{tour.description}</p>

        <h3>Itinerary:</h3> {/* Changed to Itinerary */}
        <ul>
          {tour.itinerary.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>

        <h3>Activities:</h3>
        <ul>
          {tour.activities.map((activity, index) => (
            <li key={index}>{activity}</li>
          ))}
        </ul>

        <h3>Inclusions:</h3>
        <ul>
          {tour.inclusions.map((inclusion, index) => (
            <li key={index}>{inclusion}</li>
          ))}
        </ul>

        <h3>What to Bring:</h3> {/* Added What to Bring section */}
        <ul>
          {tour.whatToBring.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h3>FAQs:</h3> {/* Added FAQs section */}
        <ul>
          {tour.FAQs.map((faq, index) => (
            <li key={index}>
              <b>Q:</b> {faq.question}
              <br />
              <b>A:</b> {faq.answer}
            </li>
          ))}
        </ul>

        <p className="tour-duration">
          <b>Duration:</b> {tour.duration}
        </p>
        <p className="tour-price">
          <b>Price:</b> From ${tour.price} / person
        </p>
      </article>
    </section>
  );
}