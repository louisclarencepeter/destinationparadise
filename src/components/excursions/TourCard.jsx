import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const TourCard = ({
  id,
  title,
  description,
  activities,
  duration,
  inclusions,
  image,
}) => (
  <div id={id} className="tour-card reveal">
    <img src={image} alt={`Image of ${title}`} className="tour-card__image" />
    <h3 className="reveal">{title}</h3>
    <p>{description}</p>
    <h4 className="reveal">Activities:</h4>
    <ul>
      {activities.map((activity, index) => (
        <li key={index}>{activity}</li>
      ))}
    </ul>
    <p>Duration: {duration}</p>
    <h4 className="reveal">Inclusions:</h4>
    <ul>
      {inclusions.map((inclusion, index) => (
        <li key={index}>{inclusion}</li>
      ))}
    </ul>
    <Link to="/booking" className="learn-more-link">
      <button className="learn-more-btn" aria-label={`Book the ${title} tour`}>
        Book Now
        <i className="fas fa-arrow-right" aria-hidden="true"></i>
      </button>
    </Link>
  </div>
);

TourCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  activities: PropTypes.arrayOf(PropTypes.string).isRequired,
  duration: PropTypes.string.isRequired,
  inclusions: PropTypes.arrayOf(PropTypes.string).isRequired,
  image: PropTypes.string.isRequired,
};

export default TourCard;
