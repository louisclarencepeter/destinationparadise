import ResponsiveImage from '../ResponsiveImage.jsx';
import { ABOUT_STORY_IMAGE, aboutTimeline } from '../../data/aboutPageData.js';

export default function AboutStory() {
  return (
    <section className="ab-story reveal" id="story">
      <div className="ab-story__head">
        <div>
          <span className="ab-story__eyebrow">Our Story</span>
          <h2 className="ab-story__title">It started with a <em>dream</em>, far from home.</h2>
        </div>
        <div className="ab-story__lead">
          <p>Destination Paradise began as an idea on a piece of paper — and a quiet promise to a place that had given so much. Years ago, while working in a hotel on the east coast of Zanzibar, the first vision appeared. It would take many turns, and many years, before it could become something real.</p>
          <p>What you see today is the result of patience, family, loss, learning and a refusal to let the idea go. We are a young company with a long story behind us — and we are only just getting started.</p>
        </div>
      </div>

      <div className="ab-timeline">
        <div className="ab-timeline__rail">
          {aboutTimeline.map((item, index) => (
            <div className="ab-tl-item reveal" key={item.year} style={{ transitionDelay: `${index * 80}ms` }}>
              <div className="ab-tl-item__year">{item.year}</div>
              <h4>{item.title}</h4>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
        <div className="ab-timeline__photo-wrap">
          <div className="ab-timeline__photo">
            <ResponsiveImage src={ABOUT_STORY_IMAGE} alt="A traditional dhow on the Zanzibar coast" loading="lazy" />
            <div className="ab-timeline__caption">From an idea on paper to a real company — Zanzibar, where it all began.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
