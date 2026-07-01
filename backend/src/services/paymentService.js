const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayInstance = null;

// Initialize Razorpay only if key-pair is provided
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  } catch (err) {
    console.error('Razorpay SDK initialization failed:', err.message);
  }
}

/**
 * Creates a payment order with Razorpay
 * @param {number} amountInPaisa - Ticket amount in smallest currency unit (paise)
 * @param {string} receiptId - Unique booking receipt identifier
 * @returns {Promise<object>} - Order details
 */
const createOrder = async (amountInPaisa, receiptId) => {
  if (!razorpayInstance) {
    console.warn('Razorpay SDK is not configured. Falling back to a mock transaction.');
    return {
      id: `mock_order_${crypto.randomBytes(8).toString('hex')}`,
      amount: amountInPaisa,
      currency: 'INR',
      receipt: receiptId,
      status: 'created',
      isMock: true
    };
  }

  const options = {
    amount: amountInPaisa,
    currency: 'INR',
    receipt: receiptId
  };

  return await razorpayInstance.orders.create(options);
};

/**
 * Cryptographically verifies Razorpay payment signatures
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment transaction ID
 * @param {string} signature - HMAC SHA256 signature received from client
 * @returns {boolean} - True if signature is authentic
 */
const verifySignature = (orderId, paymentId, signature) => {
  if (!razorpayInstance) {
    // Permit mock orders to bypass signature validation during development
    return orderId.startsWith('mock_order_');
  }

  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
};

module.exports = {
  createOrder,
  verifySignature
};
