import './Footer.scss'

function Footer() {
    return (
        <div className='footer-container reveal'>
            <h5>Subscribe to our newsletter! 🚀💬💌</h5>
            <form action="/submit-email" method="post" className="emailContainer">
                <input type="email" className="emailInput" placeholder="E-Mail" name="email" required />
                <button type="submit" className="sendButton">&gt;</button>
            </form>
            <p>Destination Paradise</p>
            <p>Phone: +255 777 777 777</p>
            <p>Zanzibar, Tanzania</p>

            <div className='contact'>
                <p>info@yournexttriptoparadise.com</p>
                <div>
                    <a href=""><i className="fa-brands fa-facebook"></i></a>
                    <a href=""><i className="fa-brands fa-instagram"></i></a>
                    <a href=""><i className="fa-brands fa-twitter"></i></a>
                    <a href=""><i className="fa-brands fa-youtube"></i></a>
                </div>
            </div>
            <p className='copyright'>© 2023 Destination Paradise. All rights reserved.</p>
        </div>
    )
}

export default Footer