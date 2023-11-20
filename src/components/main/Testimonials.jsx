import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css'
import './Testimonials.scss';

const Testimonials = () => {

  return (
    <>
      <h3>Testimonials</h3>
      <Slide>

        <div className="each-slide-effect">
          <div >
            <span>Si !!! Mangroves trip is amazing !!! Y no solo lo que disfrutas navegando en un dhow!! You can also have a walk on the mangroves and enjoy the best sunset ever. Thanks to Louis and the team and congrats!"</span>
          </div>
        </div>
        <div className="each-slide-effect">
          <div >
            <span>This trip was amazing our tour guide was knowledgeable, upbeat and friendly .. the dowe experience was amazing and the lagoon was a site to see. I was afraid to snorkel but my tour guide got in with me and made me feel safe. The food they provided was very delicious I did not expect a buffet style meal on the beach ! This is what added to the experience! Will definitely recommend."</span>
          </div>
        </div>
        <div className="each-slide-effect">
          <div >
            <span>"We had a great time and really enjoyed smelling all the spices and learning about their uses, beyond cooking. Louis was very easy to communicate with and actually went above and beyond to help us book and brainstorm to resolve a couple of challenges that we had."</span>
          </div>
        </div>
      </Slide>
    </>
  );
};

export default Testimonials;