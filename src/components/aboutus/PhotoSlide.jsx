import { useState, useEffect } from 'react';
import ImageFadeIn from 'react-image-fade-in';
import './PhotoSlide.scss';
import caveImage from '../../assets/images/cave/maalum.jpg';
import dolphinTourImage from '../../assets/images/dolphintour/dolphins.jpg';
import fishingImage from '../../assets/images/fishing/fishing.jpg';
import jozaniForestImage from '../../assets/images/jozaniforest/jozani.jpg';
import mnembaImage from '../../assets/images/mnemba/mnemba.jpg';
import motorbikeImage from '../../assets/images/motorbike/motorbike.jpg';
import prisonIslandImage from '../../assets/images/prisonisland/prison.jpg';
import quadTourImage from '../../assets/images/quad/quadtour.jpg';
import safariBlueImage from '../../assets/images/safariblue/safariblue.jpg';
import snorkelingImage from '../../assets/images/snorkeling/snorkel.jpg';
import spiceTourImage from '../../assets/images/spicetour/spice.jpg';
import stoneTownImage from '../../assets/images/stonetown/stonetown.jpg';
import sunsetRockImage from '../../assets/images/sunsetrock/sunsetrock.jpg';
import sunsetSailingImage from '../../assets/images/sunsetsailing/sunsetsail.jpg';

const PhotoSlide = () => {
    const images = [
        caveImage,
        dolphinTourImage,
        fishingImage,
        jozaniForestImage,
        mnembaImage,
        motorbikeImage,
        prisonIslandImage,
        quadTourImage,
        safariBlueImage,
        snorkelingImage,
        spiceTourImage,
        stoneTownImage,
        sunsetRockImage,
        sunsetSailingImage,
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 7000);

        return () => {
            clearInterval(interval);
        };
    }, [images.length]);

    return (
        <div className="photo-slide">
            <ImageFadeIn
                src={images[currentImageIndex]}
                opacityTransition="1s"
                className="image-fade-in"
            />
        </div>
    );
};

export default PhotoSlide;