import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { ABOUT_STORY_IMAGE, aboutTimeline } from '../../data/aboutPageData.js';

export default function AboutStory() {
  const { t } = useTranslation('about');
  const lead = t('story.lead', {
    returnObjects: true,
    defaultValue: [
      'Destination Paradise began as an idea on a piece of paper — and a quiet promise to a place that had given so much. Years ago, while working in a hotel on the east coast of Zanzibar, the first vision appeared. It would take many turns, and many years, before it could become something real.',
      'What you see today is the result of patience, family, loss, learning and a refusal to let the idea go. We are a young company with a long story behind us — and we are only just getting started.',
    ],
  });
  const timeline = t('story.timeline', { returnObjects: true, defaultValue: aboutTimeline });

  return (
    <section className="ab-story reveal" id="story">
      <div className="ab-story__head">
        <div>
          <span className="ab-story__eyebrow">{t('story.eyebrow', { defaultValue: 'Our Story' })}</span>
          <h2 className="ab-story__title">{t('story.title_prefix', { defaultValue: 'It started with a' })} <em>{t('story.title_em', { defaultValue: 'dream' })}</em>, {t('story.title_suffix', { defaultValue: 'far from home.' })}</h2>
        </div>
        <div className="ab-story__lead">
          {Array.isArray(lead) && lead.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="ab-timeline">
        <div className="ab-timeline__rail">
          {Array.isArray(timeline) && timeline.map((item, index) => (
            <div className="ab-tl-item reveal" key={`timeline-${index}`} style={{ transitionDelay: `${index * 80}ms` }}>
              <div className="ab-tl-item__year">{item.year}</div>
              <h4>{item.title}</h4>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
        <div className="ab-timeline__photo-wrap">
          <div className="ab-timeline__photo">
            <ResponsiveImage src={ABOUT_STORY_IMAGE} alt={t('story.image_alt', { defaultValue: 'A traditional dhow on the Zanzibar coast' })} loading="lazy" />
            <div className="ab-timeline__caption">{t('story.caption', { defaultValue: 'From an idea on paper to a real company — Zanzibar, where it all began.' })}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
