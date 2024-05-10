import { useEffect } from 'react';
import Hero from './home/Hero.jsx';
import Excursions from './home//Excursions.jsx';
import Gallery from './home//Gallery.jsx';
import Testimonials from './home//Testimonials.jsx';
import MyMap from './home//MyMap.jsx';

function Home() {
    useEffect(() => {
        function reveal() {
            const reveals = document.querySelectorAll(".reveal");
            for (let i = 0; i < reveals.length; i++) {
                const windowHeight = window.innerHeight;
                const elementTop = reveals[i].getBoundingClientRect().top;
                const elementVisible = 150;
                if (elementTop < windowHeight - elementVisible) {
                    reveals[i].classList.add("active");
                } else {
                    reveals[i].classList.remove("active");
                }
            }
        }

        window.addEventListener("scroll", reveal);

        reveal();

        return () => {
            window.removeEventListener("scroll", reveal);
        };
    }, []);

    return (
        <div className='home-container'>
            <Hero />
            <Excursions />
            <Gallery />
            <Testimonials />
            <MyMap />
        </div>
    );
}

export default Home;
