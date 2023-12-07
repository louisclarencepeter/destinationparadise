import './Excursions.scss';
import img from '../../assets/images/stone-town.jpeg';
import img2 from '../../assets/images/safari-blue.jpg';
import img3 from '../../assets/images/spice-tour.jpg';

const Excursions = () => {
    const trips = [
        {
            title: 'Stone Town Heritage Walk',
            text: 'Embark on a journey through the timeless Stone Town, a place where history resonates in every alley.',
            link: '/learn-more',
            discount: '10%',
            image: img
        },
        {
            title: 'Dhow & Snorkeling Safari Blue',
            text: 'Experience the authentic and unrivaled Safari Blue - a full-day excursion aboard traditional, locally-crafted sailing dhows.',
            link: '/learn-more',
            discount: '10%',
            image: img2
        },
        {
            title: 'Zanzibar Spice & Culture Tour',
            text: 'Embark on a half-day journey through Central Zanzibar, exploring the rich history shaped by cloves, nutmeg, cinnamon, and pepper.',
            link: '/learn-more',
            discount: '10%',
            image: img3
        }
    ];

    return (
        <div className='card'>
            <h2>Roaming Retreats</h2>
            {trips.map((trip, index) => (
                <div className='trips' key={index}>
                    <div className='card-hover'>
                        <div className='card-hover__content'>
                            <h4 className='card-hover__title'>
                                {trip.title}
                            </h4>
                            <p className='card-hover__text'>
                                {trip.text}
                            </p>
                            <a href={trip.link} className='card-hover__link' aria-label={`Learn more about ${trip.title}`}>
                                <span>Learn More</span>
                                <svg
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    strokeWidth='1.5'
                                    stroke='currentColor'
                                    aria-label='External Link'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        d='M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3'
                                    />
                                </svg>
                            </a>
                        </div>
                        <div className='card-hover__extra'>
                            <h5>
                                Book <span>now</span> and get <span>{trip.discount}</span> discount!
                            </h5>
                        </div>
                        <img src={trip.image} alt={trip.title} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Excursions;
