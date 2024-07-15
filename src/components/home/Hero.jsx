import './Hero.scss';
import backgroundVideo from '../../assets/videos/background.mp4';

const Hero = () => {
  return (
    <section className="hero">
      <BackgroundVideo />
      <HeroContent />
    </section>
  );
};

const BackgroundVideo = () => (
  <div className="hero__background">
    <video autoPlay loop muted playsInline className="hero__video">
      <source src={backgroundVideo} type="video/mp4" />
    </video>
  </div>
);

const HeroContent = () => (
  <div className="hero__content">
    <HeroHeading />
    <HeroDescription />
  </div>
);

const HeroHeading = () => (
  <div className="hero__heading">
    <h1>Destination Paradise</h1>
    <h3><i>your next trip to Paradise..</i></h3>
  </div>
);

const HeroDescription = () => (
  <p className="hero__description">
    Welcome to your gateway to the enchanting Zanzibar Island! Imagine a place where each day is an adventure, and every horizon promises new discoveries.
  </p>
);

export default Hero;