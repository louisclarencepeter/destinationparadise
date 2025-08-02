import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { tours } from "../../assets/data/tours";
import { Clock, MapPin, ChevronRight } from 'lucide-react';
import "./TourDetails.scss";
import SEO from '../SEO.jsx';

// --- Smaller Components ---
function TourImage({ imageKey, title }) {
  return (
    <div className="tour-image">
      <img src={imageKey} alt={title} />
    </div>
  );
}

function TourHeader({ title, description }) {
  return (
    <div className="tour-header reveal">
      <h3 className="tour-title">{title}</h3>
      <p className="tour-details-description">{description}</p>
    </div>
  );
}

function ListSection({ title, items }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="reveal">
      <h3>{title}:</h3>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

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

function FaqList({ faqs }) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <div className="reveal">
      <h3>FAQs:</h3>
      <ul>
        {faqs.map((faq, index) => (
          <FaqItem key={index} faq={faq} />
        ))}
      </ul>
    </div>
  );
}

// Tour Cards Component
function TourCards({ tours, onTourClick }) {
  return (
    <div className="random-tours">
      <h2>Other Tours You Might Like</h2>
      <div className="tour-cards">
        {tours.map((tour) => (
          <div
            key={tour.id}
            className="tour-card"
            onClick={() => onTourClick(tour.id)}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                onTourClick(tour.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="card-image">
              <img src={tour.imageKey} alt={tour.title} />
              <div className="price-badge">
                From ${tour.price}
              </div>
            </div>
            
            <div className="card-content">
              <h3>{tour.title}</h3>
              <p>{tour.description}</p>
              
              <div className="tour-details">
                <div className="detail-item">
                  <Clock size={16} />
                  <span>{tour.duration}</span>
                </div>
                {tour.location && (
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{tour.location}</span>
                  </div>
                )}
              </div>
              
              <button className="cta-button">
                View Details
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main TourDetails Component ---
export default function TourDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tour = tours.find((tour) => tour.id === id);

  useEffect(() => {
    const reveal = () => {
      const reveals = document.querySelectorAll(".reveal");
      const windowHeight = window.innerHeight;
      const elementVisible = 150;

      reveals.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
          element.classList.add("active");
        } else {
          element.classList.remove("active");
        }
      });
    };

    window.addEventListener("scroll", reveal);
    reveal();

    return () => {
      window.removeEventListener("scroll", reveal);
    };
  }, []);

  const getRandomTours = (currentTourId) => {
    const otherTours = tours.filter((tour) => tour.id !== currentTourId);
    const shuffledTours = [...otherTours].sort(() => 0.5 - Math.random());
    return shuffledTours.slice(0, 2);
  };

  const randomTours = getRandomTours(id);

  const handleTourCardClick = (tourId) => {
    navigate(`/excursions/${tourId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!tour) {
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
      <SEO title={`${tour.title} | Destination Paradise Zanzibar`} description={tour.description} />
      <TourImage imageKey={tour.imageKey} title={tour.title} />
      <article className="tour-info">
        <TourHeader title={tour.title} description={tour.description} />

        <ListSection title="Itinerary" items={tour.itinerary} />
        <ListSection title="Activities" items={tour.activities} />
        <ListSection title="Inclusions" items={tour.inclusions} />
        <ListSection title="What to Bring" items={tour.whatToBring} />
        <FaqList faqs={tour.FAQs} />

        <p className="tour-duration reveal">
          <b>Duration:</b> {tour.duration}
        </p>
        <p className="tour-price reveal">
          <b>Price:</b> From ${tour.price} / person
        </p>

        <div className="book-now-button reveal">
          <Link to="/booking">Book Now</Link>
        </div>
      </article>

      <TourCards 
        tours={randomTours}
        onTourClick={handleTourCardClick}
      />
    </section>
  );
}