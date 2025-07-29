// Application constants
export const APP_CONFIG = {
  name: 'RFID Attendance',
  description: 'Real-time attendance monitoring system',
  logo: {
    // Update this URL with your actual Cloudinary logo URL
    cloudinary: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/logo.png',
    local: '/logo.png',
    alt: 'ISD Lab Logo'
  }
};

// Use Cloudinary URL if available, otherwise fallback to local
export const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || APP_CONFIG.logo.local;