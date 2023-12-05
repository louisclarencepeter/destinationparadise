import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import PropTypes from 'prop-types';
import './Testimonials.scss';
import img1 from '../../assets/images/testimonials/DSC_0311.jpg';
import img2 from '../../assets/images/testimonials/DSC_0311.jpg';
import img3 from '../../assets/images/testimonials/DSC_0311.jpg'; 

// Star component
const Star = () => <i className="fa-solid fa-star"></i>;

// Stars component
const Stars = ({ count }) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push(<Star key={i} />);
  }
  return <>{stars}</>;
};

Stars.propTypes = {
  count: PropTypes.number.isRequired,
};

// Testimonial component
const Testimonial = ({ imgSrc, name, review, starCount }) => (
  <div className="review">
    <div className='namestars'> 
      <img src={imgSrc} alt={`${name}'s testimonial`} />
      <div><p>{name}</p><Stars count={starCount} /></div>
    </div>
    <div>
      <span>{review}</span>
    </div>
  </div>
);

Testimonial.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  review: PropTypes.string.isRequired,
  starCount: PropTypes.number.isRequired,
};

// Main Testimonials component
/**
 * Renders a component that displays testimonials.
 *
 * @returns {JSX.Element} The Testimonials component.
 */
const Testimonials = () => {
  return (
    <div className='testimonials'>
      <h2>Testimonials</h2>
      <Slide>
        <Testimonial 
          imgSrc={img1} 
          name="Isa Jua" 
          review="&ldquo;Si !!! Mangroves trip is amazing !!! Y no solo lo que disfrutas navegando en un dhow!! You can also have a walk on the mangroves and enjoy the best sunset ever. Thanks to Louis and the team and congrats!&quot;"
          starCount={5} 
        />
        <Testimonial 
          imgSrc={img2} 
          name="Isa Jua" 
          review="&ldquo;This trip was amazing our tour guide was knowledgeable, upbeat and friendly .. the dowe experience was amazing and the lagoon was a site to see. I was afraid to snorkel but my tour guide got in with me and made me feel safe. The food they provided was very delicious I did not expect a buffet style meal on the beach ! This is what added to the experience! Will definitely recommend.&quot;"
          starCount={4} 
        />
        <Testimonial 
          imgSrc={img3} 
          name="Isa Jua" 
          review="&ldquo;We had a great time and really enjoyed smelling all the spices and learning about their uses, beyond cooking. Louis was very easy to communicate with and actually went above and beyond to help us book and brainstorm to resolve a couple of challenges that we had.&quot;"
          starCount={3} 
        />
      </Slide>
      <button>Book Now</button>
    </div>
  );
};

export default Testimonials;
