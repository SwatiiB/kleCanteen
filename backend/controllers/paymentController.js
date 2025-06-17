import Payment from '../models/Payment.js';
import OrderDetails from '../models/OrderDetails.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay
let razorpay;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  } else {
    console.warn('Razorpay credentials not found in environment variables');
  }
} catch (error) {
  console.error('Error initializing Razorpay:', error);
}

// Create a new payment order (Razorpay)
export const createPaymentOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ message: 'Razorpay is not initialized' });
    }

    const { orderId, amount, email, name, phone } = req.body;

    // Check if order exists
    const order = await OrderDetails.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: process.env.CURRENCY || 'INR',
      receipt: orderId,
      payment_capture: 1, // auto capture
      notes: {
        email: email,
        orderId: orderId
      }
    });

    // Return order details along with key for frontend
    res.status(200).json({
      message: 'Payment order created',
      order: razorpayOrder,
      key_id: process.env.RAZORPAY_KEY_ID,
      prefill: {
        name: name || '',
        email: email || '',
        contact: phone || ''
      }
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify and save payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentTime,
      paymentMethod,
      email,
      amount
    } = req.body;

    // Validate required fields
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Missing required payment details' });
    }

    // Check if order exists
    const order = await OrderDetails.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if payment already exists to prevent duplicate entries
    const existingPayment = await Payment.findOne({
      'razorpayDetails.paymentId': razorpayPaymentId
    });

    if (existingPayment) {
      return res.status(200).json({
        message: 'Payment already processed',
        payment: existingPayment
      });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + '|' + razorpayPaymentId)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      // Log the failed verification attempt
      console.error('Payment signature verification failed', {
        provided: razorpaySignature,
        generated: generatedSignature
      });

      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Verify payment status with Razorpay
    let paymentDetails;
    try {
      paymentDetails = await razorpay.payments.fetch(razorpayPaymentId);

      // If payment is not captured or authorized, return error
      if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
        return res.status(400).json({
          message: 'Payment not completed',
          status: paymentDetails.status
        });
      }
    } catch (fetchError) {
      console.error('Error fetching payment details from Razorpay:', fetchError);
      return res.status(500).json({
        message: 'Could not verify payment with Razorpay',
        error: fetchError.message
      });
    }

    // Create new payment record
    // Ensure all Razorpay details are properly set and not null
    const razorpayDetailsObj = {
      orderId: razorpayOrderId || '',
      paymentId: razorpayPaymentId || '',  // Ensure this is never null
      signature: razorpaySignature || ''
    };

    const newPayment = new Payment({
      orderId,
      paymentTime: paymentTime || new Date().toLocaleTimeString(),
      paymentMethod: paymentMethod || 'razorpay',
      paymentStatus: 'completed',
      transactionId: razorpayPaymentId,
      email,
      amount,
      razorpayDetails: razorpayDetailsObj
    });

    try {
      // Save payment to database
      await newPayment.save();
    } catch (saveError) {
      console.error('Error saving payment:', saveError);

      // If there's a duplicate key error, try to find the existing payment
      if (saveError.code === 11000) {
        const existingPayment = await Payment.findOne({
          orderId: orderId,
          email: email
        });

        if (existingPayment) {
          // Keep order status as 'pending' - no need to update status for online paid orders
          // Online paid orders will follow the same workflow as cash orders: pending → preparing → ready → delivered → completed

          return res.status(200).json({
            message: 'Payment record already exists',
            payment: existingPayment,
            order: order
          });
        }
      }

      // If we can't handle the error, rethrow it
      throw saveError;
    }

    // Keep order status as 'pending' - no need to update status for online paid orders
    // Online paid orders will follow the same workflow as cash orders: pending → preparing → ready → delivered → completed

    res.status(200).json({
      message: 'Payment verified and saved successfully',
      payment: newPayment,
      order: order
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('orderId', 'status');

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error getting all payments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get payments by user email
export const getPaymentsByUser = async (req, res) => {
  try {
    const payments = await Payment.find({ email: req.params.email })
      .populate('orderId', 'status')
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error getting payments by user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('orderId', 'status items totalAmount');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error('Error getting payment by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get payment by order ID
export const getPaymentByOrderId = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });

    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found',
        isOnlinePaid: false
      });
    }

    // Check if this is an online payment
    const isOnlinePaid = payment.paymentStatus === 'completed' &&
                         (payment.paymentMethod === 'razorpay' ||
                          payment.paymentMethod === 'card' ||
                          payment.paymentMethod === 'upi');

    res.status(200).json({
      payment,
      isOnlinePaid,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus
    });
  } catch (error) {
    console.error('Error getting payment by order ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ message: 'Razorpay is not initialized' });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.paymentStatus === 'refunded') {
      return res.status(400).json({ message: 'Payment already refunded' });
    }

    // Process refund through Razorpay
    const refund = await razorpay.payments.refund(payment.razorpayDetails.paymentId, {
      amount: payment.amount * 100 // amount in smallest currency unit (paise)
    });

    // Update payment status
    payment.paymentStatus = 'refunded';
    await payment.save();

    res.status(200).json({
      message: 'Refund processed successfully',
      refund,
      payment
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
