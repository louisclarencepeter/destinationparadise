import { Link } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import PropTypes from 'prop-types';
import './Testimonials.scss';
import testimonials from '../../assets/data/testimonials-data';

const Star = () => <i className="fa-solid fa-star"></i>;

const Stars = ({ count }) => {
  const stars = Array.from({ length: count }, (_, i) => <Star key={i} />);
  return <div className="testimonial__stars">{stars}</div>;
};

Stars.propTypes = {
  count: PropTypes.number.isRequired,
};

const Testimonial = ({ imgSrc, name, review, starCount }) => {
  return (
    <div className="testimonial">
      <div className="testimonial__header">
        <img src={imgSrc} alt={`${name}'s testimonial`} className="testimonial__image" />
        <div className="testimonial__name-stars">
          <p className="testimonial__name">{name}</p>
          <Stars count={starCount} />
        </div>
      </div>
      <div className="testimonial__review">
        <span>{review}</span>
      </div>
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
    <div className="testimonials">
      <div className="testimonials__container">
        <h2 className="testimonials__title">Testimonials</h2>
        <Carousel
          showArrows={true}
          infiniteLoop={true}
          showThumbs={false}
          showStatus={false}
          showIndicators={false}
          autoPlay={true}
          interval={10000}
          className="testimonials__carousel"
        >
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </Carousel>
        <div className="testimonials__button-container">
          <Link to="/booking">
            <button className="testimonials__button">Book Now</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
