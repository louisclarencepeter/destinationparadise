import React, { useEffect } from "react";
import useScrollToTop from "@/hooks/scrollToTop";
import "./UniqueExperiences.scss";


const partnerExperiences = [
  {
    id: 1,
    name: "Dream Dhow",
    image: "/experiences/dreamdhow.jpg",
    description:
      "Zanzibar's most iconic dhow experience offering sunset cruises, romantic dinners, and private events.",
  },
  {
    id: 2,
    name: "The Cave Zanzibar",
    image: "/experiences/thecave.jpg",
    description:
      "Dine inside a stunning natural cave – an unforgettable culinary experience under the stars.",
  },
];

const UniqueExperiences = () => {
  useScrollToTop();

  useEffect(() => {
    window.addEventListener("scroll", revealElements);
    return () => window.removeEventListener("scroll", revealElements);
  }, []);

  return (
    <div className="unique-experiences-page">
      <section className="hero-section reveal">
        <h1>Unique Partnered Experiences</h1>
        <p>
          Discover handpicked experiences powered by our trusted partners. We work with
          Zanzibar’s best to bring you unforgettable moments.
        </p>
      </section>

      <section className="partner-cards reveal">
        {partnerExperiences.map((partner) => (
          <div className="partner-card" key={partner.id}>
            <img src={partner.image} alt={partner.name} />
            <div className="card-content">
              <h2>{partner.name}</h2>
              <p>{partner.description}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="cta-section reveal">
        <h3>Ready to add these to your trip?</h3>
        <p>Message us to include Dream Dhow or The Cave in your itinerary.</p>
        <a href="https://wa.me/255744744744" className="cta-button" target="_blank" rel="noopener noreferrer">
          Contact us via WhatsApp
        </a>
      </section>
    </div>
  );
};

export default UniqueExperiences;