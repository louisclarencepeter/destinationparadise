import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { tours } from "../../assets/data/tours";
import "./TourDetails.scss";

export default function TourDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tour = tours.find((tour) => tour.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!tour) {
    return (
      <div className="tour-not-found">
        <h2>Tour not found</h2>
        <p>
          We couldn't find a tour with that ID. Please check the URL or browse
          our other exciting tours below:
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

  const handleBookNowClick = () => {
    navigate('/booking#top'); 
  };

  return (
    <section className="tour-details">
      <div className="tour-image">
        <img src={tour.imageKey} alt={tour.title} />
      </div>
      <article className="tour-info">
        <div className="tour-header">
          <h3 className="tour-title">{tour.title}</h3>
          <p className="tour-details-description">{tour.description}</p>
        </div>

        {tour.itinerary?.length > 0 && (
          <div>
            <h3>Itinerary:</h3>
            <ul>
              {tour.itinerary.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        )}

        {tour.activities?.length > 0 && (
          <div>
            <h3>Activities:</h3>
            <ul>
              {tour.activities.map((activity, index) => (
                <li key={index}>{activity}</li>
              ))}
            </ul>
          </div>
        )}

        {tour.inclusions?.length > 0 && (
          <div>
            <h3>Inclusions:</h3>
            <ul>
              {tour.inclusions.map((inclusion, index) => (
                <li key={index}>{inclusion}</li>
              ))}
            </ul>
          </div>
        )}

        {tour.whatToBring?.length > 0 && (
          <div>
            <h3>What to Bring:</h3>
            <ul>
              {tour.whatToBring.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {tour.FAQs?.length > 0 && (
          <div>
            <h3>FAQs:</h3>
            <ul>
              {tour.FAQs.map((faq, index) => (
                <li key={index}>
                  <div>
                    <b>Q:</b> {faq.question}
                    <br />
                    <b>A:</b> {faq.answer}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="tour-duration">
          <b>Duration:</b> {tour.duration}
        </p>
        <p className="tour-price">
          <b>Price:</b> From ${tour.price} / person
        </p>

        <button className="book-now-button" onClick={handleBookNowClick}>
          Book Now
        </button>
      </article>
    </section>
  );
}
