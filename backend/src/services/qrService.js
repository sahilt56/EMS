const QRCode = require('qrcode');

/**
 * Generates a QR Code as a base64 Data URI string
 * @param {string} payload - Text payload to embed (e.g. JSON metadata or check-in verification URL)
 * @returns {Promise<string>} - Base64 Data URI string representing the image
 */
const generateQRCode = async (payload) => {
  try {
    return await QRCode.toDataURL(payload, {
      color: {
        dark: '#0f172a', // Sleek dark slate color for premium look
        light: '#ffffff'
      },
      width: 300,
      margin: 2
    });
  } catch (error) {
    console.error('Failed to generate QR Code:', error);
    throw error;
  }
};

module.exports = {
  generateQRCode
};
