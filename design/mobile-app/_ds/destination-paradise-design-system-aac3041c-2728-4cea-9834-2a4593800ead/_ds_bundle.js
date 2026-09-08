/* @ds-bundle: {"format":4,"namespace":"DestinationParadiseDesignSystem_aac304","components":[{"name":"ArrowIcon","sourcePath":"components/ArrowIcon/ArrowIcon.jsx"},{"name":"Badge","sourcePath":"components/Badge/Badge.jsx"},{"name":"Button","sourcePath":"components/Button/Button.jsx"},{"name":"ExcursionCard","sourcePath":"components/ExcursionCard/ExcursionCard.jsx"},{"name":"SectionPanel","sourcePath":"components/SectionPanel/SectionPanel.jsx"},{"name":"TestimonialCard","sourcePath":"components/TestimonialCard/TestimonialCard.jsx"}],"sourceHashes":{"components/ArrowIcon/ArrowIcon.jsx":"543c99a67f16","components/Badge/Badge.jsx":"ed6145482b24","components/Button/Button.jsx":"12ba99c8a4ca","components/ExcursionCard/ExcursionCard.jsx":"fb87beb4de2b","components/SectionPanel/SectionPanel.jsx":"202becde851c","components/TestimonialCard/TestimonialCard.jsx":"ad6f441b85a5","ui_kits/marketing-site/Components.jsx":"3c764eea8a3f"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DestinationParadiseDesignSystem_aac304 = window.DestinationParadiseDesignSystem_aac304 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/ArrowIcon/ArrowIcon.jsx
try { (() => {
const ARROW_PATH = "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3";
function ArrowIcon({
  size = 20
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: "1.5",
    stroke: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: ARROW_PATH
  }));
}
Object.assign(__ds_scope, { ArrowIcon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ArrowIcon/ArrowIcon.jsx", error: String((e && e.message) || e) }); }

// components/Badge/Badge.jsx
try { (() => {
const TONES = {
  white: {
    background: "rgba(255,255,255,.78)",
    color: "var(--dp-secondary)",
    backdropFilter: "blur(10px)",
    boxShadow: "var(--dp-shadow-2)"
  },
  primary: {
    background: "var(--dp-primary)",
    color: "#fff"
  },
  accent: {
    background: "var(--dp-accent)",
    color: "#fff"
  },
  success: {
    background: "var(--dp-success-bg)",
    color: "var(--dp-success)"
  },
  outline: {
    background: "transparent",
    color: "var(--dp-secondary)",
    border: "1px solid var(--dp-border)"
  }
};

/** Uppercase pill label. `white` is the canonical variant for sitting on top of photography. */
function Badge({
  children,
  tone = "white"
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      fontFamily: "var(--dp-font-sans)",
      fontSize: ".72rem",
      fontWeight: 700,
      letterSpacing: ".08em",
      textTransform: "uppercase",
      padding: ".4rem .85rem",
      borderRadius: "var(--dp-radius-pill)",
      ...(TONES[tone] || TONES.white)
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Badge/Badge.jsx", error: String((e && e.message) || e) }); }

// components/Button/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Destination Paradise button. Gradient navy→coral by default; text warms to coral on hover. */
function Button({
  children,
  variant = "primary",
  compact = false,
  href,
  onClick,
  type
}) {
  const base = {
    fontFamily: "var(--dp-font-display)",
    fontWeight: 300,
    border: "none",
    borderRadius: "var(--dp-radius-sm)",
    padding: compact ? "0.5rem 1rem" : "0.65rem 1.3rem",
    fontSize: compact ? 14 : 16,
    cursor: "pointer",
    transition: "all .25s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: ".6rem",
    textDecoration: "none",
    lineHeight: 1.2
  };
  const skin = variant === "ghost" ? {
    background: "transparent",
    color: "var(--dp-secondary)",
    border: "1px solid var(--dp-border)"
  } : {
    backgroundImage: "var(--dp-gradient-button)",
    color: "var(--dp-on-primary)"
  };
  const [hover, setHover] = React.useState(false);
  const hoverSkin = hover ? variant === "ghost" ? {
    color: "var(--dp-accent)",
    background: "var(--dp-bg-2)"
  } : {
    color: "var(--dp-hover)",
    backgroundImage: "var(--dp-gradient-button-hover)"
  } : null;
  const props = {
    style: {
      ...base,
      ...skin,
      ...hoverSkin
    },
    onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  };
  if (href) return /*#__PURE__*/React.createElement("a", _extends({
    href: href
  }, props), children);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type || "button"
  }, props), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Button/Button.jsx", error: String((e && e.message) || e) }); }

// components/ExcursionCard/ExcursionCard.jsx
try { (() => {
/** The signature Destination Paradise card: 6px coral→navy top bar, frosted badge, hover lift. */
function ExcursionCard({
  title,
  description,
  image,
  linkText = "Learn more",
  duration,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("article", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      overflow: "hidden",
      cursor: onClick ? "pointer" : "default",
      background: "linear-gradient(160deg, rgba(255,255,255,.96), rgba(255,255,255,.86))," + "linear-gradient(135deg, rgba(33,90,124,.04), rgba(255,111,97,.08))",
      border: "1px solid rgba(33,90,124,.08)",
      borderRadius: "var(--dp-radius-xl)",
      boxShadow: hover ? "var(--dp-shadow-hover)" : "var(--dp-shadow-3)",
      transform: hover ? "translateY(-6px)" : "translateY(0)",
      transition: "transform .35s var(--dp-ease-out), box-shadow .35s var(--dp-ease-out)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: ".35rem",
      zIndex: 2,
      background: "var(--dp-gradient-accent-bar)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: title,
    style: {
      width: "100%",
      height: 230,
      objectFit: "cover",
      display: "block",
      transform: hover ? "scale(1.05)" : "scale(1)",
      transition: "transform .45s ease"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "var(--dp-gradient-hero-scrim)",
      pointerEvents: "none"
    }
  }), duration && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "1rem",
      right: "1rem",
      zIndex: 3,
      background: "rgba(255,255,255,.78)",
      color: "var(--dp-secondary)",
      fontFamily: "var(--dp-font-sans)",
      fontSize: ".72rem",
      fontWeight: 700,
      letterSpacing: ".08em",
      textTransform: "uppercase",
      padding: ".4rem .85rem",
      borderRadius: "var(--dp-radius-pill)",
      backdropFilter: "blur(10px)",
      boxShadow: "var(--dp-shadow-2)"
    }
  }, duration)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "clamp(1.4rem, 2vw, 1.85rem)",
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--dp-font-sans)",
      fontSize: "clamp(1.25rem, 2vw, 1.45rem)",
      fontWeight: 500,
      margin: "0 0 .85rem",
      lineHeight: 1.15,
      color: hover ? "#C14A3F" : "var(--dp-secondary)",
      transition: "color .3s ease"
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--dp-font-display)",
      fontSize: "1rem",
      color: "var(--dp-fg-1)",
      margin: "0 0 1.1rem",
      lineHeight: 1.7
    }
  }, description), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--dp-font-sans)",
      fontSize: ".95rem",
      fontWeight: 600,
      color: hover ? "var(--dp-secondary)" : "#C14A3F",
      display: "inline-flex",
      alignItems: "center",
      gap: ".5rem",
      transform: hover ? "translateX(5px)" : "translateX(0)",
      transition: "transform .3s ease, color .3s ease"
    }
  }, linkText, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: "1.5",
    stroke: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
  })))));
}
Object.assign(__ds_scope, { ExcursionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ExcursionCard/ExcursionCard.jsx", error: String((e && e.message) || e) }); }

// components/SectionPanel/SectionPanel.jsx
try { (() => {
/** Rounded section shell: 32px radius, coral→navy top bar, radial coral wash, script heading. */
function SectionPanel({
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      width: "min(95%, 1200px)",
      margin: "clamp(1.5rem, 4vw, 3rem) auto",
      padding: "clamp(2rem, 4vw, 3rem)",
      borderRadius: "var(--dp-radius-2xl)",
      overflow: "hidden",
      background: "radial-gradient(circle at top left, rgba(255,111,97,.12), transparent 28%)," + "linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.88))",
      border: "1px solid rgba(33,90,124,.08)",
      boxShadow: "var(--dp-shadow-4)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: ".4rem",
      background: "var(--dp-gradient-accent-bar)"
    }
  }), title && /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--dp-font-script)",
      fontSize: "clamp(2.2rem, 3vw, 3.25rem)",
      fontWeight: 300,
      color: "var(--dp-secondary)",
      textAlign: "center",
      margin: "0 0 clamp(1.75rem, 3vw, 2.5rem)"
    }
  }, title), children);
}
Object.assign(__ds_scope, { SectionPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/SectionPanel/SectionPanel.jsx", error: String((e && e.message) || e) }); }

// components/TestimonialCard/TestimonialCard.jsx
try { (() => {
/** Quote card with avatar and coral star rating. Thin accent bar on top. */
function TestimonialCard({
  name,
  review,
  stars = 5,
  avatar
}) {
  return /*#__PURE__*/React.createElement("figure", {
    style: {
      position: "relative",
      overflow: "hidden",
      margin: 0,
      padding: "1.5rem",
      background: "#fff",
      border: "1px solid rgba(33,90,124,.08)",
      borderRadius: "var(--dp-radius-xl)",
      boxShadow: "var(--dp-shadow-3)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: ".25rem",
      background: "var(--dp-gradient-accent-bar)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: ".85rem",
      marginBottom: ".9rem"
    }
  }, avatar && /*#__PURE__*/React.createElement("img", {
    src: avatar,
    alt: "",
    style: {
      width: 48,
      height: 48,
      borderRadius: "50%",
      objectFit: "cover"
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("figcaption", {
    style: {
      fontFamily: "var(--dp-font-sans)",
      fontWeight: 600,
      color: "var(--dp-secondary)",
      fontSize: ".95rem"
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2
    }
  }, Array.from({
    length: 5
  }).map((_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      color: i < stars ? "var(--dp-accent)" : "var(--dp-border)",
      fontSize: 18
    }
  }, "\u2605"))))), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      fontFamily: "var(--dp-font-display)",
      fontStyle: "italic",
      fontSize: "1rem",
      lineHeight: 1.65,
      color: "var(--dp-fg-1)",
      margin: 0
    }
  }, "\u201C", review, "\u201D"));
}
Object.assign(__ds_scope, { TestimonialCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/TestimonialCard/TestimonialCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/Components.jsx
try { (() => {
// Brand pieces for the marketing site. Uses global CSS vars from colors_and_type.css.

const {
  useState
} = React;
const ArrowIcon = ({
  size = 20
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: "1.5",
  stroke: "currentColor",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  d: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
}));
const MenuIcon = () => /*#__PURE__*/React.createElement("svg", {
  width: "22",
  height: "22",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: "1.5",
  stroke: "currentColor"
}, /*#__PURE__*/React.createElement("path", {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  d: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
}));
const CloseIcon = () => /*#__PURE__*/React.createElement("svg", {
  width: "22",
  height: "22",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: "1.5",
  stroke: "currentColor"
}, /*#__PURE__*/React.createElement("path", {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  d: "M6 18L18 6M6 6l12 12"
}));
const Button = ({
  children,
  onClick,
  variant = 'primary',
  compact = false,
  href
}) => {
  const klass = `dp-btn ${variant === 'ghost' ? 'dp-btn--ghost' : ''} ${compact ? 'dp-btn--compact' : ''}`;
  if (href) return /*#__PURE__*/React.createElement("a", {
    href: href,
    className: klass,
    onClick: onClick
  }, children);
  return /*#__PURE__*/React.createElement("button", {
    className: klass,
    onClick: onClick
  }, children);
};
const Nav = () => {
  const [open, setOpen] = useState(false);
  const items = [{
    id: 'hero',
    label: 'Home'
  }, {
    id: 'excursions',
    label: 'Excursions'
  }, {
    id: 'testimonials',
    label: 'Reviews'
  }, {
    id: 'about',
    label: 'About'
  }, {
    id: 'gallery',
    label: 'Gallery'
  }, {
    id: 'booking',
    label: 'Book'
  }];
  const jump = id => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };
  return /*#__PURE__*/React.createElement("nav", {
    className: "nav"
  }, /*#__PURE__*/React.createElement("a", {
    className: "nav__logo",
    href: "#hero",
    onClick: e => {
      e.preventDefault();
      jump('hero');
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-primary.png",
    alt: "Destination Paradise"
  })), /*#__PURE__*/React.createElement("ul", {
    className: `nav__menu ${open ? 'nav__menu--open' : ''}`
  }, items.map(it => /*#__PURE__*/React.createElement("li", {
    key: it.id,
    className: "nav__item"
  }, /*#__PURE__*/React.createElement("a", {
    href: `#${it.id}`,
    onClick: e => {
      e.preventDefault();
      jump(it.id);
    }
  }, it.label))), /*#__PURE__*/React.createElement("li", {
    className: "nav__item nav__item--live"
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://yournexttriptoparadise.com",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "Visit live site", /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: "2",
    stroke: "currentColor",
    style: {
      marginLeft: 6
    }
  }, /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M14 5h5v5M19 5L10 14M5 5h4M5 19h14"
  }))))), /*#__PURE__*/React.createElement("button", {
    className: "nav__burger",
    onClick: () => setOpen(o => !o),
    "aria-label": "Menu"
  }, open ? /*#__PURE__*/React.createElement(CloseIcon, null) : /*#__PURE__*/React.createElement(MenuIcon, null)));
};
const Hero = ({
  onCTA
}) => /*#__PURE__*/React.createElement("section", {
  className: "hero",
  id: "hero"
}, /*#__PURE__*/React.createElement("div", {
  className: "hero__bg"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/boat.jpg",
  alt: ""
}), /*#__PURE__*/React.createElement("div", {
  className: "hero__scrim"
})), /*#__PURE__*/React.createElement("div", {
  className: "hero__content"
}, /*#__PURE__*/React.createElement("h1", {
  className: "hero__title"
}, "Destination Paradise"), /*#__PURE__*/React.createElement("h2", {
  className: "hero__motto"
}, /*#__PURE__*/React.createElement("i", null, "your next trip to Paradise\u2026")), /*#__PURE__*/React.createElement("p", {
  className: "hero__desc"
}, "Welcome to your gateway to the enchanting Zanzibar Island! Imagine a place where each day is an adventure, and every horizon promises new discoveries."), /*#__PURE__*/React.createElement("div", {
  className: "hero__cta"
}, /*#__PURE__*/React.createElement(Button, {
  onClick: onCTA
}, "Browse excursions ", /*#__PURE__*/React.createElement(ArrowIcon, null)))));
const ExcursionCard = ({
  trip,
  onOpen
}) => /*#__PURE__*/React.createElement("article", {
  className: "ex-card",
  onClick: () => onOpen?.(trip)
}, /*#__PURE__*/React.createElement("div", {
  className: "ex-card__img"
}, /*#__PURE__*/React.createElement("img", {
  src: trip.image,
  alt: trip.title
}), trip.duration && /*#__PURE__*/React.createElement("span", {
  className: "ex-card__badge"
}, trip.duration)), /*#__PURE__*/React.createElement("div", {
  className: "ex-card__body"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ex-card__title"
}, trip.title), /*#__PURE__*/React.createElement("p", {
  className: "ex-card__text"
}, trip.description), /*#__PURE__*/React.createElement("span", {
  className: "ex-card__link"
}, trip.linkText, " ", /*#__PURE__*/React.createElement(ArrowIcon, {
  size: 16
}))));
const EXCURSIONS = [{
  id: 'stone-town-heritage-walk',
  title: 'Stone Town Heritage Walk',
  description: "A journey through the timeless Stone Town, a place where history resonates in every alley.",
  image: '../../assets/stone-town.jpg',
  linkText: 'Explore Stone Town',
  duration: 'Half Day'
}, {
  id: 'dhow-snorkeling-safari-blue',
  title: 'Dhow & Snorkeling Safari Blue',
  description: 'Experience the authentic Safari Blue — a full-day excursion aboard traditional sailing dhows.',
  image: '../../assets/boat.jpg',
  linkText: 'Discover Safari Blue',
  duration: 'Full Day'
}, {
  id: 'zanzibar-spice-culture-tour',
  title: 'Zanzibar Spice & Culture Tour',
  description: 'A half-day journey through Central Zanzibar, exploring history shaped by cloves, nutmeg, and cinnamon.',
  image: '../../assets/mizingani.jpg',
  linkText: 'Experience the Spice Tour',
  duration: 'Half Day'
}];
const Excursions = ({
  onOpen
}) => /*#__PURE__*/React.createElement("section", {
  className: "excursions",
  id: "excursions"
}, /*#__PURE__*/React.createElement("h2", {
  className: "excursions__title"
}, "Roaming Retreats"), /*#__PURE__*/React.createElement("div", {
  className: "excursions__grid"
}, EXCURSIONS.map(trip => /*#__PURE__*/React.createElement(ExcursionCard, {
  key: trip.id,
  trip: trip,
  onOpen: onOpen
}))), /*#__PURE__*/React.createElement("div", {
  className: "excursions__more"
}, /*#__PURE__*/React.createElement(Button, {
  compact: true
}, "View More Excursions ", /*#__PURE__*/React.createElement(ArrowIcon, {
  size: 18
}))));
const Star = ({
  filled
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    color: filled ? 'var(--dp-accent)' : 'var(--dp-border)',
    fontSize: 18
  }
}, "\u2605");
const TESTIMONIALS = [{
  name: 'Isa Jua',
  review: 'Mangroves trip is amazing! You can walk the mangroves and enjoy the best sunset ever. Thanks to Louis and the team.',
  stars: 5,
  img: '../../assets/gallery/1.webp'
}, {
  name: 'Arturo',
  review: 'Our tour guide was knowledgeable, upbeat and friendly. The dhow experience was amazing and the lagoon was a site to see.',
  stars: 4,
  img: '../../assets/gallery/2.webp'
}, {
  name: 'Coleman',
  review: 'We had a great time smelling all the spices and learning about their uses. Louis went above and beyond.',
  stars: 5,
  img: '../../assets/gallery/3.webp'
}];
const Testimonials = () => /*#__PURE__*/React.createElement("section", {
  className: "testimonials",
  id: "testimonials"
}, /*#__PURE__*/React.createElement("h2", {
  className: "testimonials__title"
}, "Voices from the Shore"), /*#__PURE__*/React.createElement("div", {
  className: "testimonials__grid"
}, TESTIMONIALS.map((t, i) => /*#__PURE__*/React.createElement("figure", {
  className: "tm",
  key: i
}, /*#__PURE__*/React.createElement("div", {
  className: "tm__head"
}, /*#__PURE__*/React.createElement("img", {
  className: "tm__avatar",
  src: t.img,
  alt: ""
}), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("figcaption", {
  className: "tm__name"
}, t.name), /*#__PURE__*/React.createElement("div", {
  className: "tm__stars"
}, Array.from({
  length: 5
}).map((_, j) => /*#__PURE__*/React.createElement(Star, {
  key: j,
  filled: j < t.stars
}))))), /*#__PURE__*/React.createElement("blockquote", {
  className: "tm__quote"
}, "\"", t.review, "\"")))));
const Footer = () => /*#__PURE__*/React.createElement("footer", {
  className: "footer"
}, /*#__PURE__*/React.createElement("div", {
  className: "footer__container"
}, /*#__PURE__*/React.createElement("p", {
  className: "footer__title"
}, "Stay in the loop"), /*#__PURE__*/React.createElement("form", {
  className: "footer__form",
  onSubmit: e => e.preventDefault()
}, /*#__PURE__*/React.createElement("input", {
  className: "footer__input",
  type: "email",
  placeholder: "you@example.com",
  "aria-label": "Email"
}), /*#__PURE__*/React.createElement("button", {
  className: "footer__button",
  type: "submit"
}, "Subscribe")), /*#__PURE__*/React.createElement("div", {
  className: "footer__contact"
}, /*#__PURE__*/React.createElement("a", {
  href: "mailto:hello@yournexttriptoparadise.com"
}, "hello@yournexttriptoparadise.com"), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("a", {
  href: "https://wa.me/255768779517",
  target: "_blank",
  rel: "noopener noreferrer"
}, "+255 768 779 517"), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Stone Town, Zanzibar")), /*#__PURE__*/React.createElement("div", {
  className: "footer__legal"
}, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Cookies"), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Privacy"), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Terms")), /*#__PURE__*/React.createElement("p", {
  className: "footer__copyright"
}, "\xA9 ", new Date().getFullYear(), " Destination Paradise \xB7 Zanzibar, Tanzania")));

// Simple sub-pages
const ExcursionDetail = ({
  trip,
  onBack,
  onBook
}) => /*#__PURE__*/React.createElement("section", {
  className: "detail"
}, /*#__PURE__*/React.createElement("button", {
  className: "detail__back",
  onClick: onBack
}, "\u2190 Back"), /*#__PURE__*/React.createElement("div", {
  className: "detail__hero"
}, /*#__PURE__*/React.createElement("img", {
  src: trip.image,
  alt: ""
}), /*#__PURE__*/React.createElement("div", {
  className: "detail__hero-scrim"
}), /*#__PURE__*/React.createElement("div", {
  className: "detail__hero-text"
}, /*#__PURE__*/React.createElement("span", {
  className: "detail__badge"
}, trip.duration), /*#__PURE__*/React.createElement("h1", {
  className: "detail__title"
}, trip.title))), /*#__PURE__*/React.createElement("div", {
  className: "detail__body"
}, /*#__PURE__*/React.createElement("p", {
  className: "detail__lead"
}, trip.description), /*#__PURE__*/React.createElement("div", {
  className: "detail__meta"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
  className: "detail__k"
}, "Duration"), /*#__PURE__*/React.createElement("span", {
  className: "detail__v"
}, trip.duration)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
  className: "detail__k"
}, "Group"), /*#__PURE__*/React.createElement("span", {
  className: "detail__v"
}, "Up to 6 guests")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
  className: "detail__k"
}, "From"), /*#__PURE__*/React.createElement("span", {
  className: "detail__v"
}, "$85 pp"))), /*#__PURE__*/React.createElement(Button, {
  onClick: onBook
}, "Book this excursion ", /*#__PURE__*/React.createElement(ArrowIcon, null))));
const BookingPage = ({
  trip,
  onDone
}) => {
  const [sent, setSent] = useState(false);
  return /*#__PURE__*/React.createElement("section", {
    className: "booking"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "dp-h2",
    style: {
      fontFamily: 'var(--dp-font-script)'
    }
  }, "Reserve your spot"), !sent ? /*#__PURE__*/React.createElement("form", {
    className: "booking__form",
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "booking__field"
  }, /*#__PURE__*/React.createElement("label", null, "Excursion"), /*#__PURE__*/React.createElement("select", {
    defaultValue: trip?.id || EXCURSIONS[0].id
  }, EXCURSIONS.map(e => /*#__PURE__*/React.createElement("option", {
    key: e.id,
    value: e.id
  }, e.title)))), /*#__PURE__*/React.createElement("div", {
    className: "booking__row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "booking__field"
  }, /*#__PURE__*/React.createElement("label", null, "Your name"), /*#__PURE__*/React.createElement("input", {
    placeholder: "Jane Traveller",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "booking__field"
  }, /*#__PURE__*/React.createElement("label", null, "Email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    placeholder: "you@example.com",
    required: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "booking__row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "booking__field"
  }, /*#__PURE__*/React.createElement("label", null, "Date"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "booking__field"
  }, /*#__PURE__*/React.createElement("label", null, "Guests"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    max: "8",
    defaultValue: "2"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "booking__field"
  }, /*#__PURE__*/React.createElement("label", null, "Notes"), /*#__PURE__*/React.createElement("textarea", {
    rows: "3",
    placeholder: "Dietary requirements, pickup point\u2026"
  })), /*#__PURE__*/React.createElement(Button, null, "Request booking ", /*#__PURE__*/React.createElement(ArrowIcon, null))) : /*#__PURE__*/React.createElement("div", {
    className: "booking__ok"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "dp-h3"
  }, "Thank you \u2014 booking requested."), /*#__PURE__*/React.createElement("p", {
    className: "dp-body"
  }, "We'll email you a confirmation within one working day."), /*#__PURE__*/React.createElement(Button, {
    onClick: onDone,
    variant: "ghost"
  }, "Back to home")));
};
const GalleryPage = () => /*#__PURE__*/React.createElement("section", {
  className: "gallery",
  id: "gallery"
}, /*#__PURE__*/React.createElement("h2", {
  className: "dp-h2"
}, "A Glimpse of Zanzibar"), /*#__PURE__*/React.createElement("div", {
  className: "gallery__grid"
}, ['1', '2', '3', '4'].map(n => /*#__PURE__*/React.createElement("img", {
  key: n,
  src: `../../assets/gallery/${n}.webp`,
  alt: ""
})), /*#__PURE__*/React.createElement("img", {
  src: "../../assets/stone-town.jpg",
  alt: ""
}), /*#__PURE__*/React.createElement("img", {
  src: "../../assets/boat.jpg",
  alt: ""
})));
const AboutPage = () => /*#__PURE__*/React.createElement("section", {
  className: "about",
  id: "about"
}, /*#__PURE__*/React.createElement("h2", {
  className: "dp-h2"
}, "Our story"), /*#__PURE__*/React.createElement("div", {
  className: "about__grid"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/mizingani.jpg",
  alt: ""
}), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
  className: "dp-body"
}, "Destination Paradise is a local travel company born on the shores of Zanzibar. We design unhurried days \u2014 a dhow at dawn, a spice garden at noon, Stone Town alleys at golden hour \u2014 all led by guides who grew up here."), /*#__PURE__*/React.createElement("p", {
  className: "dp-body"
}, "Every itinerary is handmade. We keep group sizes small, our partners local, and our boats traditional. Your next trip to Paradise is personal, not packaged."))));

// Export to window so siblings can pick them up
Object.assign(window, {
  Nav,
  Hero,
  Excursions,
  Testimonials,
  Footer,
  ExcursionDetail,
  BookingPage,
  GalleryPage,
  AboutPage,
  Button,
  ArrowIcon,
  ExcursionCard,
  EXCURSIONS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/Components.jsx", error: String((e && e.message) || e) }); }

__ds_ns.ArrowIcon = __ds_scope.ArrowIcon;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.ExcursionCard = __ds_scope.ExcursionCard;

__ds_ns.SectionPanel = __ds_scope.SectionPanel;

__ds_ns.TestimonialCard = __ds_scope.TestimonialCard;

})();
