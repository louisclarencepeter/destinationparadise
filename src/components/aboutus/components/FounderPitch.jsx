import "./styles/_founderpitch.scss";

const FounderPitch = ({
  title = "Founder’s 60-Second Story",
  thanks = ["Ania my Wife", "Steven", "Ibrahim", "Tamim"],
}) => {
  return (
    <section className="founder-pitch" aria-labelledby="founder-pitch-title">
      <div className="pitch-card">
        <h2 id="founder-pitch-title">{title}</h2>

        <p>
          This all started as a dream. Years ago, while managing Evergreen
          Bungalows, I had a vision of something bigger to show the world the
          beauty of Zanzibar and beyond. At first, I was too young and afraid,
          so I just wrote it down and left it. But the dream stayed alive.
        </p>

        <p>
          I shared it with my sister we registered the company and tragically,
          she passed before we could continue. Still, I kept going, little by
          little: I learned to code in Germany, built the website, and formed a
          small team.
        </p>

        <p>
          Now, after 10 years, in collaboration with Unique Touch, we’re
          launching. We start in Unguja, then Pemba, Mafia, and mainland
          Tanzania step by step.
        </p>

        <p className="impact">
          What makes us different? We partner with local drivers, hotels, and
          service providers so the community grows with us.
        </p>

        <p className="closer">
          Destination Paradise isn’t just about travel it’s about sharing the
          beauty of the world, together.
        </p>

        {/* {thanks?.length > 0 && (
          <div className="thanks">
            <span>With gratitude to </span>
            <ul>
              {thanks.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        )} */}
      </div>
    </section>
  );
};

export default FounderPitch;