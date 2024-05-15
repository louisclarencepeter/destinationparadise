// Footer.jsx
import './Footer.scss';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <h5 className="footer__title">Subscribe to our newsletter! 🚀💬💌</h5>
        <form action="/submit-email" method="post" className="footer__form">
          <input type="email" className="footer__input" placeholder="E-Mail" name="email" required />
          <button type="submit" className="footer__button">&gt;</button>
        </form>
        <div className="footer__info">
          <p>Destination Paradise</p>
          <p>Phone: +255 777 777 777</p>
          <p>Zanzibar, Tanzania</p>
        </div>
        <div className="footer__contact">
          <p>info@yournexttriptoparadise.com</p>
          <div className="footer__social">
            <a href=""><i className="fab fa-facebook"></i></a>
            <a href=""><i className="fab fa-instagram"></i></a>
            <a href=""><i className="fab fa-twitter"></i></a>
            <a href=""><i className="fab fa-youtube"></i></a>
          </div>
        </div>
        <p className="footer__copyright">© 2023 Destination Paradise. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;