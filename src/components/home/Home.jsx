import Hero from './Hero.jsx';
import Excursions from './Excursions.jsx';
import Images from './Images.jsx';
import Testimonials from './Testimonials.jsx';
import MyMap from './MyMap.jsx';
import SEO from '../SEO.jsx';

function Home() {
    return (
        <div className='home-container'>
            <SEO
              title="Destination Paradise Zanzibar - Excursions and Tours"
              description="Explore unforgettable excursions and tours with Destination Paradise Zanzibar. Experience the beauty of Zanzibar's heritage and culture."/>
            <Hero />
            <Excursions />
            <Images/>
            <Testimonials />
            <MyMap />
        </div>
    );
}

export default Home;
