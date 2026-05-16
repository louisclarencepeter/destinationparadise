import { useTranslation } from 'react-i18next';

export default function AboutMission() {
  const { t } = useTranslation('about');
  const titleSuffix = t('mission.title_suffix', { defaultValue: 'truly is.' });

  return (
    <section className="ab-numbers ab-mission" id="mission">
      <div className="ab-mission__inner">
        <span className="ab-mission__eyebrow">{t('mission.eyebrow', { defaultValue: 'Our Mission' })}</span>
        <h2 className="ab-mission__statement">{t('mission.title_prefix', { defaultValue: 'To show the world how beautiful' })} <em>{t('mission.title_em', { defaultValue: 'Tanzania' })}</em>{titleSuffix === '.' ? titleSuffix : ` ${titleSuffix}`}</h2>
        <p className="ab-mission__sub">{t('mission.sub', { defaultValue: 'Simple, and the same as it was on that first piece of paper — every island, every coast, every corner of the mainland has a story worth meeting in person.' })}</p>
      </div>
    </section>
  );
}
