import PhotoSlide from './PhotoSlide';
import './AboutPage.scss';

const AboutPage = () => {
  return (
    <div className="about-page">
         <h2>About Us</h2>
      
      <div className="about-content">
        <div className="about-text">
          <h3>Welcome to Destination Paradise</h3>
          <p className='reveal'>
            <strong>Destination Paradise</strong>, your premier travel agency specializing in unforgettable trips and tours on the enchanting island of Zanzibar. Our current focus is on exploring the wonders of Zanzibar Island (Unguja), with ambitious plans to expand our offerings throughout Tanzania, beginning with its captivating main islands.
          </p>
          <p className="reveal motto">
            for <em>your next trip to paradise...</em>
          </p>
          <p className='reveal'>
            At Destination Paradise, we strive to provide an extensive array of tours that showcase the most stunning locations and exciting events not only on the main island of Zanzibar but across the entire country of Tanzania. Our expertly crafted itineraries are designed to immerse you in the rich culture, breathtaking landscapes, and thrilling adventures that await you.
          </p>
          <p className='reveal'>
            In addition to our exceptional island tours, we are proud to offer exhilarating safari experiences on the Tanzanian mainland. Join us on a journey of a lifetime as we guide you through the world-renowned Serengeti, Tarangire, and Ngorongoro, where you&apos;ll witness the awe-inspiring beauty of the African wilderness and its incredible wildlife. For those seeking a more compact adventure, we also arrange convenient day safaris from Zanzibar to the magnificent Selous and Mikumi reserves.
          </p>
        </div>
      </div>
      <PhotoSlide />
    </div>
  );
};

export default AboutPage;
