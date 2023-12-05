import './Excursions.scss'
import img from '../../assets/images/stone-town.jpeg';
import img2 from '../../assets/images/safari-blue.jpg';
import img3 from '../../assets/images/spice-tour.jpg';

function Excursions() {
    return (
        <div className='card'>
            <h3>Roaming Retreats</h3>
            <div className='trips'>
                <div className="card-hover">
                    <div className="card-hover__content">
                        <h3 className="card-hover__title">
                            Stone Town <span>Heritage</span> Walk
                        </h3>
                        <p className="card-hover__text">
                            Embark on a journey through the timeless Stone Town, a place where history resonates in every alley.
                        </p>
                        <a href="/learn-more" className="card-hover__link" aria-label="Learn more about Stone Town Heritage Walk">
                            <span>Learn More</span>
                            <svg
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-label="External Link"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                />
                            </svg>
                        </a>
                    </div>
                    <div className="card-hover__extra">
                        <h4>
                            Book <span>now</span> and get <span>10%</span> discount!
                        </h4>
                    </div>
                    <img
                        src={img}
                        alt="Stone Town"
                    />
                </div>
            </div>

            <div className='trips'>
                <div className="card-hover">
                    <div className="card-hover__content">
                        <h3 className="card-hover__title">
                            Dhow & Snorkeling  <span>Safari</span> Blue
                        </h3>
                        <p className="card-hover__text">
                            Experience the authentic and unrivaled Safari Blue - a full-day excursion aboard traditional, locally-crafted sailing dhows.
                        </p>
                        <a href="/learn-more" className="card-hover__link" aria-label="Learn more about Stone Town Heritage Walk">
                            <span>Learn More</span>
                            <svg
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-label="External Link"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                />
                            </svg>
                        </a>
                    </div>
                    <div className="card-hover__extra">
                        <h4>
                            Book <span>now</span> and get <span>10%</span> discount!
                        </h4>
                    </div>
                    <img
                        src={img2}
                        alt="Stone Town"
                    />
                </div>
            </div>

            <div className='trips'>
                <div className="card-hover">
                    <div className="card-hover__content">
                        <h3 className="card-hover__title">
                            Zanzibar Spice & <span>Culture</span> Tour
                        </h3>
                        <p className="card-hover__text">
                            Embark on a half-day journey through Central Zanzibar, exploring the rich history shaped by cloves, nutmeg, cinnamon, and pepper.
                        </p>
                        <a href="/learn-more" className="card-hover__link" aria-label="Learn more about Stone Town Heritage Walk">
                            <span>Learn More</span>
                            <svg
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-label="External Link"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                />
                            </svg>
                        </a>
                    </div>
                    <div className="card-hover__extra">
                        <h4>
                            Book <span>now</span> and get <span>10%</span> discount!
                        </h4>
                    </div>
                    <img
                        src={img3}
                        alt="Stone Town"
                    />
                </div>
            </div>

        </div>
    );
}

export default Excursions