import React from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import safariData from "../../../../data/safarisdata/safariData";

const SafariInfo = () => {
  const { title } = useParams();
  const navigate = useNavigate();

  const safari = safariData.find((item) => item.title === title);

  if (!safari) {
    return <div>Safari not found!</div>;
  }

  return (
    <div className="safari-info">
      <img src={safari.imageUrl} alt={safari.title} />
      <h2>{safari.title}</h2>
      <p>{safari.fullDescription}</p>
      {/* ... display other details like more images, etc. */}
      <button onClick={() => navigate(-1)} className="back-button">
        Back
      </button>
    </div>
  );
};

export default SafariInfo;