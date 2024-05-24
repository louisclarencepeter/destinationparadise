// Testimonials.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import PropTypes from 'prop-types';
import './Testimonials.scss';
import img1 from '../../assets/images/testimonials/isa.png';
import img2 from '../../assets/images/testimonials/arturo.png';
import img3 from '../../assets/images/testimonials/coleman.jpg';

const Star = () => <i className="fa-solid fa-star"></i>;

const Stars = ({ count }) => {
  const stars = Array.from({ length: count }, (_, i) => <Star key={i} />);
  return <div className="testimonial__stars">{stars}</div>;
};

Stars.propTypes = {
  count: PropTypes.number.isRequired,
};

const Testimonial = ({ imgSrc, name, review, starCount }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="testimonial">
      <div className="testimonial__header">
        <img src={imgSrc} alt={`${name}'s testimonial`} className="testimonial__image" />
        <div className="testimonial__name-stars">
          <p className="testimonial__name">{name}</p>
          <Stars count={starCount} />
        </div>
      </div>
      <div className={`testimonial__review ${isExpanded ? 'expanded' : ''}`}>
        <span>{review}</span>
      </div>
      {review.length > 200 && (
        <button className="testimonial__expand-btn" onClick={toggleExpand}>
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  );
};

Testimonial.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  review: PropTypes.string.isRequired,
  starCount: PropTypes.number.isRequired,
};

const Testimonials = () => {
  return (
    <div className="testimonials reveal">
      <h2 className="testimonials__title">Testimonials</h2>
      <Slide>
        <Testimonial
          imgSrc={img1}
          name="Isa Jua"
          review="Si !!! Mangroves trip is amazing !!! Y no solo lo que disfrutas navegando en un dhow!! You can also have a walk on the mangroves and enjoy the best sunset ever. Thanks to Louis and the team and congrats!"
          starCount={5}
        />
        <Testimonial
          imgSrc={img2}
          name="Arturo"
          review="This trip was amazing our tour guide was knowledgeable, upbeat and friendly .. the dowe experience was amazing and the lagoon was a site to see. I was afraid to snorkel but my tour guide got in with me and made me feel safe. The food they provided was very delicious I did not expect a buffet style meal on the beach ! This is what added to the experience! Will definitely recommend."
          starCount={4}
        />
        <Testimonial
          imgSrc={img3}
          name="Coleman"
          review="We had a great time and really enjoyed smelling all the spices and learning about their uses, beyond cooking. Louis was very easy to communicate with and actually went above and beyond to help us book and brainstorm to resolve a couple of challenges that we had."
          starCount={5}
        />
      </Slide>
      <Link to="/booking">
        <button className="testimonials__button">Book Now</button>
      </Link>
    </div>
  );
};

export default Testimonials;