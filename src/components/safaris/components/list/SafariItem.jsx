import React from "react";
import { Link } from "react-router-dom";
import "./SafariItem.scss";

const SafariItem = ({ title, imageUrl, shortDescription, fullDetails }) => (
  <div className="safari-item">
    <img src={imageUrl} alt={title} />
    <h3>{title}</h3>
    <p>{shortDescription}</p>
    <Link to={`/safarisinfo/${encodeURIComponent(title)}`}>
      <button className="learn-more">Learn More</button>
    </Link>
  </div>
);

export default SafariItem;