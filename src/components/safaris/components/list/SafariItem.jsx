import React from "react";
import { Link } from "react-router-dom";

const SafariItem = ({ title, imageUrl, shortDescription, fullDetails }) => (
  <div className="safari-item">
    <img src={imageUrl} alt={title} />
    <h3>{title}</h3>
    <p>{shortDescription}</p>
    <Link to={`/safarisinfo/${title}`}>
      <button className="learn-more">Learn More</button>
    </Link>
  </div>
);

export default SafariItem;