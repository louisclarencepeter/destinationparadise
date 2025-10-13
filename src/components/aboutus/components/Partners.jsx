import PropTypes from 'prop-types';
import { AnimatedText } from './AnimatedText';
import uniqueTouchLogo from '../../../assets/partners/unique-touch-logo.png';
import './styles/_partners.scss';

// Partners data - easily expandable
const partnersData = {
  official: [
    {
      id: 1,
      name: "Unique Touch Ltd",
      logo: uniqueTouchLogo,
      url: "https://www.uniquetouchgroup.com/",
      description: "Strategic partnership bringing enhanced hospitality services and exclusive local experiences",
      type: "Official Partner"
    }
  ],
  collaborators: [
    // Add other partners here as they come
    // {
    //   id: 2,
    //   name: "Partner Name",
    //   logo: "/src/assets/partners/partner-logo.png",
    //   url: "https://example.com",
    //   description: "Brief description of collaboration",
    //   type: "Collaborator"
    // }
  ]
};

const PartnerCard = ({ partner, delay = 0 }) => (
  <AnimatedText delay={delay} className="partner-card">
    <div className="partner-header">
      <img 
        src={partner.logo} 
        alt={`${partner.name} Logo`} 
        className="partner-logo"
      />
      <div className="partner-info">
        <a 
          href={partner.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="partner-name"
        >
          {partner.name}
        </a>
        <span className="partner-type">{partner.type}</span>
      </div>
    </div>
    <p className="partner-description">{partner.description}</p>
  </AnimatedText>
);

PartnerCard.propTypes = {
  partner: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    logo: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  delay: PropTypes.number,
};

export const Partners = () => {
  const hasOfficialPartners = partnersData.official.length > 0;
  const hasCollaborators = partnersData.collaborators.length > 0;
  
  if (!hasOfficialPartners && !hasCollaborators) {
    return null; // Don't render if no partners
  }

  return (
    <div className="partners-section">
      <AnimatedText delay={100} className="partners-title">
        <h3>Our Partners</h3>
      </AnimatedText>

      {hasOfficialPartners && (
        <div className="official-partners">
          <AnimatedText delay={200} className="section-subtitle">
            <h4>Official Partnership</h4>
          </AnimatedText>
          <div className="partners-grid">
            {partnersData.official.map((partner, index) => (
              <PartnerCard 
                key={partner.id} 
                partner={partner} 
                delay={300 + (index * 100)} 
              />
            ))}
          </div>
        </div>
      )}

      {hasCollaborators && (
        <div className="collaborators">
          <AnimatedText delay={400} className="section-subtitle">
            <h4>Collaborators & Associates</h4>
          </AnimatedText>
          <div className="partners-grid">
            {partnersData.collaborators.map((partner, index) => (
              <PartnerCard 
                key={partner.id} 
                partner={partner} 
                delay={500 + (index * 100)} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;