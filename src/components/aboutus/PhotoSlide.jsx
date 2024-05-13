import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
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

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    cssEase: 'ease-in-out',
  };

  return (
    <div className="photo-slide">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index}>
            <img src={image} alt={`Slide ${index + 1}`} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default PhotoSlide;