import { AnimatedText } from './AnimatedText';

export const ContentSection = () => (
    <div className="about-content">
      <div className="about-text">
        <h3 className="welcome-title">Welcome to Destination Paradise</h3>
        
        <AnimatedText delay={100}>
          <strong>Destination Paradise</strong>, your premier travel agency
          specializing in unforgettable trips and tours on the enchanting
          island of Zanzibar. Our current focus is on exploring the wonders of
          Zanzibar Island (Unguja), with ambitious plans to expand our
          offerings throughout Tanzania.
        </AnimatedText>

        <AnimatedText delay={150} className="partnership-highlight">
          We are excited to announce our strategic partnership with{' '}
          <a 
            href="https://www.uniquetouchgroup.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="partner-link"
          >
            <img 
              src="/src/assets/partners/unique-touch-logo.png" 
              alt="Unique Touch Ltd Logo" 
              className="partner-logo"
            />
            <strong>Unique Touch Ltd</strong>
          </a>, bringing together decades of 
          combined expertise to deliver exceptional travel experiences that 
          go beyond the ordinary.
        </AnimatedText>
  
        <AnimatedText delay={200} className="motto">
          for <em>your next trip to paradise...</em>
        </AnimatedText>
  
        <AnimatedText delay={300}>
          At Destination Paradise, in collaboration with Unique Touch, we 
          strive to provide an extensive array of tours that showcase the 
          most stunning locations and exciting events not only on the main 
          island of Zanzibar but across the entire country of Tanzania. Our 
          expertly crafted itineraries are designed to immerse you in the 
          rich culture, breathtaking landscapes, and thrilling adventures 
          that await you.
        </AnimatedText>

        <AnimatedText delay={350}>
          Through our partnership with Unique Touch Ltd, we've enhanced our 
          service offerings with innovative approaches to hospitality and 
          unique local experiences. This collaboration allows us to provide 
          more personalized tours, exclusive access to hidden gems, and 
          premium accommodations that reflect the authentic spirit of Zanzibar.
        </AnimatedText>
  
        <AnimatedText delay={400}>
          In addition to our exceptional island tours, we are proud to offer
          exhilarating safari experiences on the Tanzanian mainland. Join us
          on a journey of a lifetime as we guide you through the
          world-renowned Serengeti, Tarangire, and Ngorongoro, where
          you'll witness the awe-inspiring beauty of the African
          wilderness and its incredible wildlife. For those seeking a more
          compact adventure, we also arrange convenient day safaris from
          Zanzibar to the magnificent Selous and Mikumi reserves.
        </AnimatedText>

        <AnimatedText delay={450} className="partnership-benefits">
          Our partnership brings you:
          <ul className="benefits-list">
            <li>Enhanced local expertise and cultural insights</li>
            <li>Exclusive access to unique experiences and locations</li>
            <li>Premium service standards and personalized attention</li>
            <li>Innovative tour packages combining tradition with modern comfort</li>
          </ul>
        </AnimatedText>
      </div>
    </div>
  );