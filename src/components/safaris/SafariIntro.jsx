export default function SafariIntro() {
  return (
    <section className="saf-intro reveal">
      <div className="saf-intro__grid">
        <div className="saf-intro__copy">
          <span className="section-eyebrow">Our approach</span>
          <h2 className="section-title">Tanzania-bred guides who know the bush — and the islands.</h2>
          <p className="section-lead">
            We run the northern circuit — Serengeti, Ngorongoro, Tarangire — with bush flights so you spend more time on game drives and less in a Land Cruiser. Pair with a few days on Zanzibar’s coast, or stay pure bush. Every camp is hand-picked. Every guide is Silver-level certified or higher.
          </p>
        </div>
        <ul className="saf-intro__bullets">
          <li>
            <span className="saf-intro__num">01</span>
            <div>
              <strong>Small vehicles</strong>
              <p>Max 4 guests per Land Cruiser, every seat a window seat. No mini-buses.</p>
            </div>
          </li>
          <li>
            <span className="saf-intro__num">02</span>
            <div>
              <strong>Bush flights</strong>
              <p>Skip the 8-hour drive. Cessnas connect parks in under an hour.</p>
            </div>
          </li>
          <li>
            <span className="saf-intro__num">03</span>
            <div>
              <strong>Conservation fees built in</strong>
              <p>Park fees, ranger fees, community levies — never tacked on later.</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
