function IconFrame({ children, viewBox = '0 0 24 24' }) {
  return (
    <svg viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  )
}

export function SocialIcon({ type }) {
  switch (type) {
    case 'facebook':
      return (
        <IconFrame>
          <path
            d="M13.2 21V12.8H15.95L16.4 9.6H13.2V7.55C13.2 6.63 13.47 6 14.78 6H16.52V3.14C16.22 3.1 15.2 3 14.02 3C11.56 3 9.88 4.45 9.88 7.14V9.6H7.2V12.8H9.88V21H13.2Z"
            fill="currentColor"
          />
        </IconFrame>
      )
    case 'instagram':
      return (
        <IconFrame>
          <rect x="4.25" y="4.25" width="15.5" height="15.5" rx="4.5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="3.65" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17.15" cy="6.85" r="1.1" fill="currentColor" />
        </IconFrame>
      )
    case 'youtube':
      return (
        <IconFrame>
          <path
            d="M20.94 8.18C20.74 7.43 20.15 6.84 19.4 6.64C18.03 6.25 12 6.25 12 6.25C12 6.25 5.97 6.25 4.6 6.64C3.85 6.84 3.26 7.43 3.06 8.18C2.67 9.55 2.67 12 2.67 12C2.67 12 2.67 14.45 3.06 15.82C3.26 16.57 3.85 17.16 4.6 17.36C5.97 17.75 12 17.75 12 17.75C12 17.75 18.03 17.75 19.4 17.36C20.15 17.16 20.74 16.57 20.94 15.82C21.33 14.45 21.33 12 21.33 12C21.33 12 21.33 9.55 20.94 8.18Z"
            fill="currentColor"
          />
          <path d="M10.2 14.9L15.3 12L10.2 9.1V14.9Z" fill="white" />
        </IconFrame>
      )
    case 'x':
      return (
        <IconFrame>
          <path
            d="M17.78 4H20.85L14.14 11.67L22 20H15.85L11.03 14.95L6.74 20H3.66L10.84 11.55L3.3 4H9.6L13.95 8.59L17.78 4ZM16.7 18.12H18.4L8.68 5.78H6.86L16.7 18.12Z"
            fill="currentColor"
          />
        </IconFrame>
      )
    case 'whatsapp':
      return (
        <IconFrame>
          <path
            d="M12 3.2C7.14 3.2 3.2 7.05 3.2 11.8C3.2 13.52 3.73 15.14 4.63 16.5L3.6 20.8L8.05 19.84C9.35 20.54 10.83 20.9 12.4 20.9C17.26 20.9 21.2 17.05 21.2 12.3C21.2 7.55 17.26 3.2 12.4 3.2H12Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M9.15 8.9C8.9 8.35 8.65 8.35 8.42 8.34C8.22 8.33 7.98 8.33 7.74 8.33C7.5 8.33 7.11 8.42 6.79 8.77C6.47 9.12 5.57 9.93 5.57 11.58C5.57 13.23 6.82 14.82 6.99 15.05C7.15 15.28 9.34 18.73 12.72 20C15.53 21.05 16.11 20.84 16.73 20.79C17.35 20.74 18.72 20 18.99 19.25C19.26 18.5 19.26 17.86 19.18 17.72C19.1 17.58 18.89 17.49 18.58 17.33C18.27 17.17 16.73 16.42 16.44 16.31C16.15 16.19 15.94 16.14 15.72 16.46C15.5 16.77 14.86 17.52 14.67 17.75C14.47 17.98 14.28 18 13.97 17.84C13.66 17.68 12.66 17.35 11.48 16.3C10.56 15.49 9.94 14.48 9.76 14.16C9.59 13.84 9.74 13.67 9.89 13.52C10.03 13.38 10.2 13.15 10.35 12.97C10.5 12.79 10.54 12.66 10.64 12.45C10.74 12.24 10.69 12.06 10.62 11.9C10.54 11.74 9.96 10.21 9.74 9.67C9.53 9.14 9.31 8.92 9.15 8.9Z"
            fill="currentColor"
          />
        </IconFrame>
      )
    case 'mail':
      return (
        <IconFrame>
          <rect
            x="3.75"
            y="5.5"
            width="16.5"
            height="13"
            rx="2.2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M5 7.15L12 12.5L19 7.15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </IconFrame>
      )
    case 'phone':
      return (
        <IconFrame>
          <path
            d="M7.1 4.75L9.45 4.2L11.15 8.4L9.45 9.45C10.36 11.4 11.86 12.91 13.8 13.82L14.9 12.13L19.05 13.85L18.5 16.2C18.3 17.05 17.55 17.66 16.67 17.66C10.96 17.66 6.34 13.04 6.34 7.33C6.34 6.45 6.95 4.95 7.1 4.75Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </IconFrame>
      )
    case 'pin':
      return (
        <IconFrame>
          <path
            d="M12 21C12 21 18.2 15.45 18.2 9.9C18.2 6.48 15.42 3.7 12 3.7C8.58 3.7 5.8 6.48 5.8 9.9C5.8 15.45 12 21 12 21Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="9.9" r="2.15" stroke="currentColor" strokeWidth="1.8" />
        </IconFrame>
      )
    case 'compass':
      return (
        <IconFrame>
          <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M14.9 8.6L13.35 13.35L8.6 14.9L10.15 10.15L14.9 8.6Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </IconFrame>
      )
    case 'suitcase':
      return (
        <IconFrame>
          <path
            d="M8.25 8V6.85C8.25 5.83 9.08 5 10.1 5H13.9C14.92 5 15.75 5.83 15.75 6.85V8"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <rect
            x="4.3"
            y="8"
            width="15.4"
            height="10.8"
            rx="2.2"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path d="M8 12H16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </IconFrame>
      )
    case 'sparkle':
      return (
        <IconFrame>
          <path
            d="M12 3.8L13.55 8.45L18.2 10L13.55 11.55L12 16.2L10.45 11.55L5.8 10L10.45 8.45L12 3.8Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M18.1 14.2L18.75 16.05L20.6 16.7L18.75 17.35L18.1 19.2L17.45 17.35L15.6 16.7L17.45 16.05L18.1 14.2Z"
            fill="currentColor"
          />
        </IconFrame>
      )
    case 'sun':
      return (
        <IconFrame>
          <circle cx="12" cy="12" r="3.85" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M12 3.5V5.5M12 18.5V20.5M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M3.5 12H5.5M18.5 12H20.5M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </IconFrame>
      )
    case 'moon':
      return (
        <IconFrame>
          <path
            d="M20.4 13.6C19.5 18.05 15.6 21.2 11.1 21C6.6 20.8 3 17 3 12.5C3 8 6.6 4.2 11.1 4C8.4 5.4 7 8 7 11C7 14.7 10 17.5 13.7 17.5C16.4 17.5 18.85 16 20.4 13.6Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </IconFrame>
      )
    default:
      return null
  }
}
