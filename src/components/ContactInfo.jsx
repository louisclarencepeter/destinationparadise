import './ContactInfo.scss'
import { SocialIcon } from './SocialIcons'

function ContactInfo() {
  const phoneNumber = '+255768779517'
  const phoneDisplay = '+255 768 779 517'
  const whatsAppLink = 'https://wa.me/message/YCOQDKJSDMXFD1'
  const email = 'info@yournexttriptoparadise.com'
  const contactItems = [
    {
      label: 'Phone',
      icon: 'phone',
      content: <a href={`tel:${phoneNumber}`}>{phoneDisplay}</a>,
      action: (
        <a
          href={whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="contact-info__quick-action"
        >
          <SocialIcon type="whatsapp" />
        </a>
      ),
    },
    {
      label: 'Email',
      icon: 'mail',
      content: <a href={`mailto:${email}`}>{email}</a>,
    },
    {
      label: 'Location',
      icon: 'pin',
      content: <span>Zanzibar, Tanzania</span>,
    },
  ]

  return (
    <div className="contact-info">
      {contactItems.map((item) => (
        <div className="contact-info__row" key={item.label}>
          <span className="contact-info__icon" aria-hidden="true">
            <SocialIcon type={item.icon} />
          </span>
          <span className="contact-info__text">
            <span className="contact-info__label">{item.label}</span>
            {item.content}
          </span>
          {item.action}
        </div>
      ))}
    </div>
  )
}

export default ContactInfo
