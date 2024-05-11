import PropTypes from 'prop-types';
import "./ToursPage.scss";

const TourCard = ({ title, description, activities, duration, inclusions, image }) => (
  <div className="tour-card">
    <img src={image} alt={title} />
    <h3>{title}</h3>
    <p>{description}</p>
    <h4>Activities:</h4>
    <ul>
      {activities.map((activity, index) => (
        <li key={index}>{activity}</li>
      ))}
    </ul>
    <p>Duration: {duration}</p>
    <h4>Inclusions:</h4>
    <ul>
      {inclusions.map((inclusion, index) => (
        <li key={index}>{inclusion}</li>
      ))}
    </ul>
  </div>
);

TourCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  activities: PropTypes.arrayOf(PropTypes.string).isRequired,
  duration: PropTypes.string.isRequired,
  inclusions: PropTypes.arrayOf(PropTypes.string).isRequired,
  image: PropTypes.string.isRequired,
};

const ToursPage = () => (
  <div className="tours-page">
    <h1>Trips and Tours Zanzibar</h1>

    <TourCard
      title="Spice Tour"
      description="Explore the history and plantations of Zanzibar's spice trade. Dazzle your senses with fresh spices and learn about their uses in medicine, cosmetics, and cooking."
      activities={['Visit spice plantations', 'Learn about traditional herbal medicine', 'Taste spices and fruits', 'Opulent lunch (on request)']}
      duration="Half-day"
      inclusions={['Transport', 'Guide', 'Entrance fees', 'Lunch (on request)']}
      image="src\assets\images\spicetour\DSC_0296.jpg"
    />

    <TourCard
      title="Historical City Tour"
      description="Take a fascinating walk through Stone Town and visit historical sites like the House of Wonders, Palace Museum, Dr. Livingston's House, and Arab Fort."
      activities={['Guided walk through Stone Town', 'Visit historical sites', 'Explore markets and shops']}
      duration="Half-day"
      inclusions={['Guide', 'Entrance fees']}
      image="src/assets/images/stonetown/DSC_0431.jpeg"
    />

    <TourCard
      title="Prison Island Boat Trip"
      description="Escape to Prison Island, home to giant tortoises and a beautiful coral reef. Enjoy snorkeling, sunbathing, and a visit to the historic prison."
      activities={['Visit Prison Island', 'See giant tortoises', 'Snorkeling', 'Sunbathing']}
      duration="Half-day or Full-day"
      inclusions={['Boat ride', 'Entrance fees', 'Snorkeling equipment']}
      image="src/assets/images/prisonisland/IMG_8946.JPG"
    />

    <TourCard
      title="Jozani Forest Tour"
      description="Explore the Jozani Forest, home to the rare red colobus monkey and other wildlife. Walk through the impressive flora and fauna on a guided nature trail."
      activities={['Guided nature trail', 'See red colobus monkeys', 'Spot other wildlife']}
      duration="Half-day"
      inclusions={['Transport', 'Entrance fee', 'Guide']}
    />

    <TourCard
      title="Dolphin Tour"
      description="Visit Kizimkazi fishing village and take a boat trip to see schools of bottle-nosed and humpback dolphins. Swim close to the dolphins and visit a 12th-century mosque."
      activities={['Boat trip to see dolphins', 'Swim with dolphins', 'Visit 12th-century mosque']}
      duration="Half-day"
      inclusions={['Transport', 'Guide', 'Boat', 'Snorkeling equipment']}
    />

    <TourCard
      title="Sunset & The Rock Restaurant"
      description="Watch the breathtaking sunset at Michamvi beach on the east coast. Visit the famous Rock Restaurant, situated on a rock in the ocean."
      activities={['Watch the sunset', 'Swim', 'Visit The Rock Restaurant']}
      duration="Evening"
      inclusions={['Transport']}
    />

    <TourCard
      title="Snorkeling"
      description="Discover the rich coral reefs and abundant sea life at the Blue Lagoon on the east coast. Enjoy snorkeling in the clear waters during low tide."
      activities={['Snorkeling', 'Explore coral reefs', 'Spot various fish species']}
      duration="Half-day"
      inclusions={['Snorkeling equipment', 'Bicycles or car ride', 'Guide', 'Dhow boat trip']}
    />

    <TourCard
      title="Village Tour"
      description="Take a walking tour to the local village of Bwejuu and interact with the locals. Visit local shops, houses, and the charity school to learn about the local way of life."
      activities={['Walking tour of Bwejuu village', 'Visit local shops and houses', 'Visit charity school']}
      duration="Half-day"
      inclusions={['Local guide', 'Optional bicycle rental']}
    />

    <TourCard
      title="Motorbike Renting"
      description="Explore the island independently by renting a motorbike. Choose from Vespas, automatic scooters, or 250cc Honda motorbikes. A valid license is required."
      activities={['Rent a motorbike', 'Explore the island independently']}
      duration="Full-day"
      inclusions={['Motorbike', 'Driving permit', 'Helmets']}
    />

    <TourCard
      title="Mnemba Snorkeling & Trip to the North"
      description="Snorkel in the crystal-clear waters of Mnemba Island, a private conserved island in the northeast. Spot a variety of fish and enjoy the beautiful beach of Nungwi."
      activities={['Snorkeling at Mnemba Island', 'Relax on Nungwi beach']}
      duration="Full-day"
      inclusions={['Transport', 'Guide', 'Boat ride', 'Entrance fees', 'Snorkeling equipment']}
    />

    <TourCard
      title="Safari Blue"
      description="Embark on a full-day excursion on traditional sailing dhows. Swim, sunbathe, and explore the sandbank in Menai Bay. Enjoy traditional seafood lunch and refreshments."
      activities={['Dhow sailing', 'Swimming', 'Sunbathing', 'Sandbank exploration']}
      duration="Full-day"
      inclusions={['Food', 'Soft drinks', 'Boat trip', 'Transport']}
    />

    <TourCard
      title="Fishing in Kizimkazi"
      description="Experience deep-sea fishing in Kizimkazi, known for its abundant sea life. Catch various types of fish such as kingfish, tuna, or even dolphins."
      activities={['Deep-sea fishing']}
      duration="Half-day"
      inclusions={['Fishing equipment', 'Boat ride', 'Fishing permit', 'Transport', 'Water']}
    />

    <TourCard
      title="Local Game Fishing"
      description="Join a Zanzibarian fisherman on a traditional dhow and experience fishing for a living. Use simple fishing gear to catch kingfish, yellowfin tuna, barracuda, and grouper."
      activities={['Fishing with local fishermen', 'Traditional dhow sailing']}
      duration="Half-day or Full-day"
      inclusions={['Boat ride', 'Fishing guide', 'Local fishing gear', 'Fruits', 'Soft drinks']}
    />

    <TourCard
      title="Mangrove Tour"
      description="Explore the mangrove forest of Chwaka Bay National Reserve. Snorkel on the reef, enjoy a local lunch, and take a boat trip through the mangroves to spot sea turtles."
      activities={['Snorkeling', 'Local lunch', 'Mangrove boat trip']}
      duration="Full-day"
      inclusions={['Transport', 'Guide', 'Snorkeling equipment', 'Lunch', 'Boat ride']}
    />

    <TourCard
      title="Sandbank Picnic"
      description="Visit Prison Island, tour the historic prison, meet Aldabra Tortoises, and enjoy the view of Stone Town. Relax on the white sands of Pange Sandbank and soak up the sun."
      activities={['Prison Island visit', 'Sandbank picnic', 'Snorkeling']}
      duration="Full-day"
      inclusions={['Transport', 'Boat trip', 'Prison Island entrance fee', 'Snorkeling equipment', 'Food and drinks']}
    />

    <TourCard
      title="Swimming in the Cave"
      description="Visit Maalum, a beautiful natural water swimming cave on the East Coast of Zanzibar. Relax, swim, and enjoy the wonders of this special place."
      activities={['Swimming in the cave', 'Relaxation']}
      duration="Half-day"
      inclusions={['Transport', 'Water']}
    />

    <TourCard
      title="Sailing into the Sunset"
      description="Enjoy the sunset on a locally made dhow that sails with the wind. Start in the evening, head to Michamvi, and enjoy beautiful views of the Indian Ocean. Stop at a small private sandbank and sail back as the sun sets."
      activities={['Dhow sailing', 'Sandbank visit', 'Sunset viewing']}
      duration="3 hours"
      inclusions={['Dhow ride', 'Snacks', 'Music']}
      image="/path/to/sailing-sunset-image.jpg"
    />

    <TourCard
      title="Quad Tour"
      description="Ride an ATV quad bike and discover remote trails, unspoiled landscapes, and local villages. Guided by a professional, this recreational and scenic tour is suitable for beginners. Quads are automatic and easy to operate."
      activities={['ATV quad biking', 'Guided tour', 'Scenic trails']}
      duration="Half-day"
      inclusions={['Quad bike', 'Guide', 'Safety instructions']}
      image="/path/to/quad-tour-image.jpg"
    />

  </div>
);

export default ToursPage;