import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './ToursPage.scss';
import spiceTourImage from '../../assets/images/spicetour/spice.jpg';
import historicalCityTourImage from '../../assets/images/stonetown/stonetown.jpg';
import prisonIslandImage from '../../assets/images/prisonisland/prison.jpg';
import jozaniForestImage from '../../assets/images/jozaniforest/jozani.jpg';
import dolphinTourImage from '../../assets/images/dolphintour/dolphins.jpg';
import sunsetRockImage from '../../assets/images/sunsetrock/sunsetrock.jpg';
import snorkelingImage from '../../assets/images/snorkeling/snorkel.jpg';
import villageTourImage from '../../assets/images/villagetour/village.jpg';
import motorbikeImage from '../../assets/images/motorbike/motorbike.jpg';
import mnembaImage from '../../assets/images/mnemba/mnemba.jpg';
import safariBlueImage from '../../assets/images/safariblue/safariblue.jpg';
import localFishingImage from '../../assets/images/fishing/fishing.jpg';
import swimmingCaveImage from '../../assets/images/cave/maalum.jpg';
import sailingSunsetImage from '../../assets/images/sunsetsailing/sunsetsail.jpg';
import quadTourImage from '../../assets/images/quad/quadtour.jpg';
import map from '../../assets/map/zanzibar.png';


const TourCard = ({ id, title, description, activities, duration, inclusions, image }) => (
  <div id={id} className="tour-card reveal">
    <img src={image} alt={title} />
    <h3 className='reveal'>{title}</h3>
    <p>{description}</p>
    <h4 className='reveal'>Activities:</h4>
    <ul>
      {activities.map((activity, index) => (
        <li key={index}>{activity}</li>
      ))}
    </ul>
    <p>Duration: {duration}</p>
    <h4 className='reveal'>Inclusions:</h4>
    <ul>
      {inclusions.map((inclusion, index) => (
        <li key={index}>{inclusion}</li>
      ))}
    </ul>
    <Link to="/booking" className="learn-more-link">
      <button className="learn-more-btn">
        Book Now
        <i className="fas fa-arrow-right"></i>
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

const ToursPage = () => {
  useEffect(() => {
    function reveal() {
      const reveals = document.querySelectorAll('.reveal');
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
          reveals[i].classList.add('active');
        } else {
          reveals[i].classList.remove('active');
        }
      }
    }

    window.addEventListener('scroll', reveal);
    reveal();

    return () => {
      window.removeEventListener('scroll', reveal);
    };
  }, []);

  return (
    <div className="tours-page">
      <h2 className="reveal">Trips and Tours Zanzibar</h2>
      <div className="tour-card-container">
        <TourCard
          id="zanzibar-spice-culture-tour"
          title="Spice Tour"
          description="Explore the history and plantations of Zanzibar's spice trade. Dazzle your senses with fresh spices and learn about their uses in medicine, cosmetics, and cooking."
          activities={['Visit spice plantations', 'Learn about traditional herbal medicine', 'Taste spices and fruits', 'Opulent lunch (on request)']}
          duration="Half-day"
          inclusions={['Transport', 'Guide', 'Entrance fees', 'Lunch (on request)']}
          image={spiceTourImage}
        />

        <TourCard
          id="stone-town-heritage-walk"
          title="Historical City Tour"
          description="Take a fascinating walk through Stone Town and visit historical sites like the House of Wonders, Palace Museum, Dr. Livingston's House, and Arab Fort."
          activities={['Guided walk through Stone Town', 'Visit historical sites', 'Explore markets and shops']}
          duration="Half-day"
          inclusions={['Guide', 'Entrance fees']}
          image={historicalCityTourImage}
        />

        <TourCard
          title="Prison Island Boat Trip"
          description="Escape to Prison Island, home to giant tortoises and a beautiful coral reef. Enjoy snorkeling, sunbathing, and a visit to the historic prison."
          activities={['Visit Prison Island', 'See giant tortoises', 'Snorkeling', 'Sunbathing']}
          duration="Half-day or Full-day"
          inclusions={['Boat ride', 'Entrance fees', 'Snorkeling equipment']}
          image={prisonIslandImage}
        />

        <TourCard
          title="Jozani Forest Tour"
          description="Explore the Jozani Forest, home to the rare red colobus monkey and other wildlife. Walk through the impressive flora and fauna on a guided nature trail."
          activities={['Guided nature trail', 'See red colobus monkeys', 'Spot other wildlife']}
          duration="Half-day"
          inclusions={['Transport', 'Entrance fee', 'Guide']}
          image={jozaniForestImage}
        />

        <TourCard
          title="Dolphin Tour"
          description="Visit Kizimkazi fishing village and take a boat trip to see schools of bottle-nosed and humpback dolphins. Swim close to the dolphins and visit a 12th-century mosque."
          activities={['Boat trip to see dolphins', 'Swim with dolphins', 'Visit 12th-century mosque']}
          duration="Half-day"
          inclusions={['Transport', 'Guide', 'Boat', 'Snorkeling equipment']}
          image={dolphinTourImage}
        />

        <TourCard
          title="Sunset & The Rock Restaurant"
          description="Watch the breathtaking sunset at Michamvi beach on the east coast. Visit the famous Rock Restaurant, situated on a rock in the ocean."
          activities={['Watch the sunset', 'Swim', 'Visit The Rock Restaurant']}
          duration="Evening"
          inclusions={['Transport']}
          image={sunsetRockImage}
        />

        <TourCard
          title="Snorkeling"
          description="Discover the rich coral reefs and abundant sea life at the Blue Lagoon on the east coast. Enjoy snorkeling in the clear waters during low tide."
          activities={['Snorkeling', 'Explore coral reefs', 'Spot various fish species']}
          duration="Half-day"
          inclusions={['Snorkeling equipment', 'Bicycles or car ride', 'Guide', 'Dhow boat trip']}
          image={snorkelingImage}
        />

        <TourCard
          title="Village Tour"
          description="Take a walking tour to the local village of Bwejuu and interact with the locals. Visit local shops, houses, and the charity school to learn about the local way of life."
          activities={['Walking tour of Bwejuu village', 'Visit local shops and houses', 'Visit charity school']}
          duration="Half-day"
          inclusions={['Local guide', 'Optional bicycle rental']}
          image={villageTourImage}
        />

        <TourCard
          title="Motorbike Renting"
          description="Explore the island independently by renting a motorbike. Choose from Vespas, automatic scooters, or 250cc Honda motorbikes. A valid license is required."
          activities={['Rent a motorbike', 'Explore the island independently']}
          duration="Full-day"
          inclusions={['Motorbike', 'Driving permit', 'Helmets']}
          image={motorbikeImage}
        />
      </div>

      <div className='map'>
        <h4 className="reveal">Map of Zanzibar</h4>
        <img src={map} alt="Zanzibar map" className="map reveal" />
      </div>

      <div className="tour-card-container">
        <TourCard
          title="Mnemba Snorkeling & Trip to the North"
          description="Snorkel in the crystal-clear waters of Mnemba Island, a private conserved island in the northeast. Spot a variety of fish and enjoy the beautiful beach of Nungwi."
          activities={['Snorkeling at Mnemba Island', 'Relax on Nungwi beach']}
          duration="Full-day"
          inclusions={['Transport', 'Guide', 'Boat ride', 'Entrance fees', 'Snorkeling equipment']}
          image={mnembaImage}
        />

        <TourCard
          id="dhow-snorkeling-safari-blue"
          title="Safari Blue"
          description="Embark on a full-day excursion on traditional sailing dhows. Swim, sunbathe, and explore the sandbank in Menai Bay. Enjoy traditional seafood lunch and refreshments."
          activities={['Dhow sailing', 'Swimming', 'Sunbathing', 'Sandbank exploration']}
          duration="Full-day"
          inclusions={['Food', 'Soft drinks', 'Boat trip', 'Transport']}
          image={safariBlueImage}
        />

        <TourCard
          title="Local Game Fishing"
          description="Join a Zanzibarian fisherman on a traditional dhow and experience fishing for a living. Use simple fishing gear to catch kingfish, yellowfin tuna, barracuda, and grouper."
          activities={['Fishing with local fishermen', 'Traditional dhow sailing']}
          duration="Half-day or Full-day"
          inclusions={['Boat ride', 'Fishing guide', 'Local fishing gear', 'Fruits', 'Soft drinks']}
          image={localFishingImage}
        />

        <TourCard
          title="Swimming in the Cave"
          description="Visit Maalum, a beautiful natural water swimming cave on the East Coast of Zanzibar. Relax, swim, and enjoy the wonders of this special place."
          activities={['Swimming in the cave', 'Relaxation']}
          duration="Half-day"
          inclusions={['Transport', 'Water']}
          image={swimmingCaveImage}
        />

        <TourCard
          title="Sailing into the Sunset"
          description="Enjoy the sunset on a locally made dhow that sails with the wind. Start in the evening, head to Michamvi, and enjoy beautiful views of the Indian Ocean. Stop at a small private sandbank and sail back as the sun sets."
          activities={['Dhow sailing', 'Sandbank visit', 'Sunset viewing']}
          duration="3 hours"
          inclusions={['Dhow ride', 'Snacks', 'Music']}
          image={sailingSunsetImage}
        />

        <TourCard
          title="Quad Tour"
          description="Ride an ATV quad bike and discover remote trails, unspoiled landscapes, and local villages. Guided by a professional, this recreational and scenic tour is suitable for beginners. Quads are automatic and easy to operate."
          activities={['ATV quad biking', 'Guided tour', 'Scenic trails']}
          duration="Half-day"
          inclusions={['Quad bike', 'Guide', 'Safety instructions']}
          image={quadTourImage}
        />
      </div>
    </div>
  );
};

export default ToursPage;