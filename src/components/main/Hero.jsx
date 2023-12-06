import './Hero.scss';
import backgroundVideo from '../../assets/videos/background.mp4'; // Import your video file here

function Hero() {
    return (
        <div className='hero-container'>
            <video autoPlay loop muted className='video-background'>
                <source src={backgroundVideo} type="video/mp4" />
            </video>

            <div className='name-motto'>
                <h1>Destination Paradise</h1>
                <h3>Explore the beauty of Zanzibar</h3>
            </div>

            <p>Welcome to Destination Paradise, your gateway to the enchanting Zanzibar Island! Imagine a place where each day is an adventure, and every horizon promises new discoveries.</p>
        </div>
    );
}

export default Hero;