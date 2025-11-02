import { useAnimateOnScroll } from "../../hooks/useAnimateOnScroll";
import uniqueExperiences from "../../assets/data/uniqueData.js";
import ExperiencesGrid from "./ExperiencesGrid";
import ViewAllLink from "./ViewAllLink";
import "./UniqueExperiences.scss";

const UniqueExperiences = () => {
  const [sectionRef, isVisible] = useAnimateOnScroll({ threshold: 0.1 });

  return (
    <section
      ref={sectionRef}
      className={`unique-experiences ${isVisible ? "animate" : ""}`}
    >
      <h2 className="unique-experiences__title reveal">Unique Experiences</h2>
      <ExperiencesGrid experiences={uniqueExperiences} />
      <ViewAllLink />
    </section>
  );
};

export default UniqueExperiences;