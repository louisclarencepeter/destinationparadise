import './Hero.scss';
import backgroundVideo from '../../assets/videos/background.mp4';

function Hero() {
  return (
    <div className="hero">
      <div className="hero__background">
        <video autoPlay loop muted playsInline className="hero__video">
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      </div>
      <div className="hero__content">
        <div className="hero__heading">
          <h1>Destination Paradise</h1>
          <h3>Explore the beauty of Zanzibar</h3>
        </div>
        <p className="hero__description">
          Welcome to Destination Paradise, your gateway to the enchanting Zanzibar Island! Imagine a place where each day is an adventure, and every horizon promises new discoveries.
        </p>
      </div>
    </div>
  );
}

export default Hero;
