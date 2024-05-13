import { useEffect } from 'react';
import './AboutPage.scss';

const AboutPage = () => {
  useEffect(() => {
    function reveal() {
      const reveals = document.querySelectorAll('.reveal');
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
          reveals[i].classList.add('active');
        } else {
          reveals[i].classList.remove('active');
        }
      }
    }

    window.addEventListener('scroll', reveal);
    reveal();

    return () => {
      window.removeEventListener('scroll', reveal);
    };
  }, []);

  return (
    <div className="about-page">
      <h1 className="reveal">About Us</h1>
      <div className="about-content">
        <div className="ptext reveal">
          <h3>Destination Paradise Zanzibar: Dive Into the Heartbeat of Tanzania&apos;s Mystical Isles</h3>
          <p>
            Unearth the mystique of Zanzibar and Tanzania with <strong>Destination Paradise Zanzibar</strong>, your passport to spellbinding adventures. Fueled by wanderlust and a thirst for the unexplored, our tapestry of journeys plunges you into the heart of a land where stories whisper in the winds and secrets are cradled in its golden sands.
          </p>
          <h4>At Destination Paradise, we don&apos;t merely guide; we mesmerize:</h4>
          <ul>
            <li>
              <strong>Vivid Panoramas &amp; Pulse-Quickening Tours</strong>: Wander through the veiled alleyways of Stone Town, dance to the ancient beats of tribal drums, or gaze upon the vastness of the Tanzanian plains. Our curated blend of tours, both iconic and offbeat, promises to etch memories that linger long after the trip.
            </li>
            <li>
              <strong>Welcoming Every Soulful Seeker</strong>: Whether you&apos;re an intrepid solo traveler or soaking up Zanzibar&apos;s magic for the hundredth time, our doors and hearts are wide open, awaiting your tales and footprints.
            </li>
            <li>
              <strong>Unrivaled Collaborative Excellence</strong>: We believe in unity. Our handpicked partnerships with local experts guarantee an immersive experience, ensuring no stone remains unturned and no story remains untold.
            </li>
            <li>
              <strong>An Odyssey Born of Passion</strong>: Our love for travel isn&apos;t just a trait – it&apos;s our essence. Every curve, coastline, and cultural dive has been meticulously designed to awaken your senses and rekindle your spirit of discovery.
            </li>
          </ul>
          <p>
            Join us at <strong>Destination Paradise Zanzibar</strong>. Here, every journey is a canvas, and every traveler is an artist, painting their epic of dreams, wonder, and enchantment.
          </p>
        </div>
  {/*       <div className="profiles">
          <div className="one-half first reveal">
            <div className="pdetails">
              <h4>Louis Peter</h4>
              <p>Founder and Managing Director</p>
              <p id="profile-mail">
                <a href="mailto:yournexttriptoparadise@gmail.com">yournexttriptoparadise@gmail.com</a>
              </p>
            </div>
          </div>
          <div className="one-half reveal">
            <div className="pdetails">
              <h4>Melchzedek Peter</h4>
              <p>Manager</p>
              <p id="profile-mail">
                <a href="mailto:manager@yournexttriptoparadise.com">manager@yournexttriptoparadise.com</a>
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default AboutPage;