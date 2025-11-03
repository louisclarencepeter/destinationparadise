import PropTypes from "prop-types";
import ExperienceCard from "../components/ExperienceCard";
import "./ExperiencesGrid.scss";

const ExperiencesGrid = ({ experiences }) => {
  return (
    <div className="experiences-grid">
      {experiences.map((trip, index) => (
        <ExperienceCard key={trip.id} trip={trip} index={index} />
      ))}
    </div>
  );
};

ExperiencesGrid.propTypes = {
  experiences: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      image: PropTypes.string,
      images: PropTypes.arrayOf(PropTypes.string),
      linkText: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ExperiencesGrid;