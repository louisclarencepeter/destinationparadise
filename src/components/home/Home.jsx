import Hero from './Hero.jsx';
import Excursions from './Excursions.jsx';
import Images from './Images.jsx';
import Testimonials from './Testimonials.jsx';
import MyMap from './MyMap.jsx';

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
