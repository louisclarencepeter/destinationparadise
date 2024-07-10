import { useMemo } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './PhotoSlide.scss';
import { images } from './PhotoSlideImages';

export function PhotoSlide() {
  const settings = useMemo(() => ({
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    cssEase: 'ease-in-out',
  }), []);

  return (
    <div className="photo-slide">
      <Slider {...settings}>
        {images.map(({ src, alt }, index) => (
          <div key={index}>
            <img src={src} alt={alt} />
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default PhotoSlide;