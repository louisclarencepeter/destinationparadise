import Hero from './home/Hero.jsx';
import Excursions from './home/Excursions.jsx';
import Images from './home/Images.jsx';
import Testimonials from './home/Testimonials.jsx';
import MyMap from './home/MyMap.jsx';

function Home() {
    return (
        <div className='home-container'>
            <Hero />
            <Excursions />
            <Images/>
            <Testimonials />
            <MyMap />
        </div>
    );
}

export default Home;
