import { Link } from "react-router-dom";
import ArrowIcon from "./ArrowIcon";
import "./ViewAllLink.scss";

const ViewAllLink = ({ to = "/excursions", text = "View All Experiences" }) => {
  return (
    <div className="view-all-link reveal">
      <Link to={to} className="view-all-link__button">
        <span>{text}</span>
        <ArrowIcon />
        <span className="sr-only">View all available excursions</span>
      </Link>
    </div>
  );
};

export default ViewAllLink;