import PropTypes from "prop-types";
import "./SectionHeader.scss";

const SectionHeader = ({ eyebrow, title, subtitle, align = "center", as: Tag = "h2" }) => (
  <div className={`section-header section-header--${align}`}>
    {eyebrow && <span className="section-header__eyebrow">{eyebrow}</span>}
    <Tag className="section-header__title">{title}</Tag>
    {subtitle && <p className="section-header__subtitle">{subtitle}</p>}
  </div>
);

SectionHeader.propTypes = {
  eyebrow: PropTypes.node,
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  align: PropTypes.oneOf(["center", "left"]),
  as: PropTypes.elementType,
};

export default SectionHeader;
