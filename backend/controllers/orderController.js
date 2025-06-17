import mongoose from 'mongoose';
import OrderDetails from '../models/OrderDetails.js';
import ExamDetails from '../models/ExamDetails.js';
import Canteen from '../models/Canteen.js';
import Menu from '../models/Menu.js';
import { v4 as uuidv4 } from 'uuid';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      email,
      orderTime,
      items,
      totalAmount,
      canteenId,
      examId,
      priority,
      priorityReason,
      priorityDetails,
      pickupTime,
      specialInstructions,
      deliveryAddress
    } = req.body;

    console.log('Order creation request received:', {
      priority,
      priorityReason,
      examId,
      user: {
        id: req.user?.id,
        role: req.user?.role,
        userRole: req.user?.userRole,
        uniId: req.user?.uniId,
        semester: req.user?.semester
      }
    });

    // Ensure user data is available for validation
    if (!req.user) {
      console.error('User data not available in request');
      return res.status(401).json({
        message: 'Authentication error: User data not available',
        errorType: 'AUTHENTICATION_ERROR'
      });
    }

    // Validate delivery address
    if (!deliveryAddress || deliveryAddress.trim() === '') {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    // Check if canteen is available
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json({ message: 'Canteen not found' });
    }

    // Check canteen availability
    if (!canteen.availability) {
      return res.status(400).json({ message: 'This canteen is currently closed. You cannot place orders at this time.' });
    }

    // Check if all menu items in the order are available
    const itemIds = items.map(item => item.itemId);
    const menuItems = await Menu.find({ _id: { $in: itemIds } });

    // Create a map of item IDs to their availability status
    const itemAvailabilityMap = {};
    menuItems.forEach(item => {
      itemAvailabilityMap[item._id.toString()] = item.availability;
    });

    // Check if any items are unavailable
    const unavailableItems = [];
    for (const item of items) {
      const itemId = item.itemId.toString();
      if (itemAvailabilityMap[itemId] === false) {
        // Find the item name
        const menuItem = menuItems.find(mi => mi._id.toString() === itemId);
        unavailableItems.push({
          itemId,
          name: menuItem ? menuItem.itemName : 'Unknown Item'
        });
      }
    }

    // If there are unavailable items, return an error
    if (unavailableItems.length > 0) {
      return res.status(400).json({
        message: 'Some items in your order are no longer available',
        unavailableItems
      });
    }

    // Calculate priority fee if applicable
    let priorityFee = 0;
    let validationPassed = true; // Flag to track if validation passed

    if (priority) {
      priorityFee = 5; // ₹5 additional charge for priority orders

      // For student users with exam reason, validate that they've selected an exam
      if (priorityReason === 'exam') {
        // Get the user from the request
        const user = req.user;

        console.log('Priority order validation - User data:', {
          id: user?.id,
          role: user?.role,
          userRole: user?.userRole,
          uniId: user?.uniId,
          semester: user?.semester
        });

        // Only validate for student users
        if (user && (user.userRole === 'student' || user.role === 'student')) {
          // Check if an exam ID was provided
          if (!examId) {
            validationPassed = false;
            return res.status(400).json({
              message: 'Priority order validation failed: No exam selected',
              details: 'You must select an exam to place a priority order with exam reason',
              errorType: 'NO_EXAM_SELECTED_ERROR'
            });
          }

          // If exam ID is provided, validate that student's semester matches exam semester
          // and university ID falls within the valid range

          // Get the exam details
          const exam = await ExamDetails.findById(examId);

          console.log('Priority order validation - Exam data:', {
            examId: exam?._id,
            examName: exam?.examName,
            startUniversityId: exam?.startUniversityId,
            endUniversityId: exam?.endUniversityId,
            semester: exam?.semester
          });

          if (!exam) {
            validationPassed = false;
            return res.status(400).json({
              message: 'Priority order validation failed: Exam not found',
              errorType: 'EXAM_NOT_FOUND_ERROR'
            });
          }

          // Check if user has a university ID
          if (!user.uniId) {
            validationPassed = false;
            return res.status(400).json({
              message: 'Priority order validation failed: Missing university ID',
              details: 'Your profile does not have a university ID. Please update your profile.',
              errorType: 'MISSING_ID_INFORMATION'
            });
          }

          // Validate semester
          if (exam.semester !== user.semester) {
            console.log('Priority order validation - Semester mismatch:', {
              userSemester: user.semester,
              examSemester: exam.semester
            });

            validationPassed = false;
            return res.status(400).json({
              message: 'Priority order validation failed: Your semester does not match the exam semester',
              details: `Your semester: ${user.semester}, Exam semester: ${exam.semester}`,
              errorType: 'SEMESTER_MISMATCH_ERROR'
            });
          }

          // Validate university ID range with improved comparison
          if (user.uniId && exam.startUniversityId && exam.endUniversityId) {
            // Convert all IDs to uppercase for case-insensitive comparison
            const userUniIdUpper = user.uniId.toUpperCase();
            const startUniversityIdUpper = exam.startUniversityId.toUpperCase();
            const endUniversityIdUpper = exam.endUniversityId.toUpperCase();

            console.log('Priority order validation - ID comparison:', {
              userUniId: userUniIdUpper,
              startUniversityId: startUniversityIdUpper,
              endUniversityId: endUniversityIdUpper,
              stringComparison: {
                userLessThanStart: userUniIdUpper < startUniversityIdUpper,
                userGreaterThanEnd: userUniIdUpper > endUniversityIdUpper
              }
            });



            // Use dynamic exam range validation instead of hardcoded ranges
            // Parse university ID format to extract components for comparison
            const universityIdPattern = /^(\d{2})([A-Z]{2})(\d{2})([A-Z]{2,3})(\d{3})$/i;
            const userIdMatch = userUniIdUpper.match(universityIdPattern);
            const startIdMatch = startUniversityIdUpper.match(universityIdPattern);
            const endIdMatch = endUniversityIdUpper.match(universityIdPattern);

            console.log('University ID validation:', {
              userUniIdUpper,
              startUniversityIdUpper,
              endUniversityIdUpper,
              userIdMatch,
              startIdMatch,
              endIdMatch
            });

            if (userIdMatch && startIdMatch && endIdMatch) {
              // Extract components: [full, year, fe, batch, dept, number]
              const [, userYear, userFE, userBatch, userDept, userNumber] = userIdMatch;
              const [, startYear, startFE, startBatch, startDept, startNumber] = startIdMatch;
              const [, endYear, endFE, endBatch, endDept, endNumber] = endIdMatch;

              // Check if the base components match (year, FE, batch, department)
              const baseComponentsMatch =
                userYear === startYear && userYear === endYear &&
                userFE === startFE && userFE === endFE &&
                userBatch === startBatch && userBatch === endBatch &&
                userDept === startDept && userDept === endDept;

              console.log('Base components validation:', {
                userComponents: { userYear, userFE, userBatch, userDept, userNumber },
                startComponents: { startYear, startFE, startBatch, startDept, startNumber },
                endComponents: { endYear, endFE, endBatch, endDept, endNumber },
                baseComponentsMatch
              });

              if (!baseComponentsMatch) {
                validationPassed = false;
                return res.status(400).json({
                  message: 'Priority order validation failed: Your university ID is not eligible for this exam',
                  details: `Your ID: ${user.uniId} has different base components than the exam range`,
                  errorType: 'UNIVERSITY_ID_RANGE_ERROR',
                  studentId: user.uniId,
                  validRange: {
                    start: exam.startUniversityId,
                    end: exam.endUniversityId
                  },
                  examName: exam.examName
                });
              }

              // Check if the numeric part is within range
              const userNumericPart = parseInt(userNumber, 10);
              const startNumericPart = parseInt(startNumber, 10);
              const endNumericPart = parseInt(endNumber, 10);

              console.log('Numeric range validation:', {
                userNumericPart,
                startNumericPart,
                endNumericPart,
                inRange: userNumericPart >= startNumericPart && userNumericPart <= endNumericPart
              });

              if (userNumericPart < startNumericPart || userNumericPart > endNumericPart) {
                validationPassed = false;
                return res.status(400).json({
                  message: 'Priority order validation failed: Your university ID is not eligible for this exam',
                  details: `Your ID: ${user.uniId} is outside the valid range (${exam.startUniversityId} - ${exam.endUniversityId})`,
                  errorType: 'UNIVERSITY_ID_RANGE_ERROR',
                  studentId: user.uniId,
                  validRange: {
                    start: exam.startUniversityId,
                    end: exam.endUniversityId
                  },
                  examName: exam.examName
                });
              }
            } else {
              // Fall back to case-insensitive string comparison if we can't parse the IDs
              console.log('Falling back to string comparison:', {
                userUniIdUpper,
                startUniversityIdUpper,
                endUniversityIdUpper,
                comparison: {
                  userLessThanStart: userUniIdUpper < startUniversityIdUpper,
                  userGreaterThanEnd: userUniIdUpper > endUniversityIdUpper
                }
              });

              if (userUniIdUpper < startUniversityIdUpper || userUniIdUpper > endUniversityIdUpper) {
                validationPassed = false;
                return res.status(400).json({
                  message: 'Priority order validation failed: Your university ID is not eligible for this exam',
                  details: `Your ID: ${user.uniId} is outside the valid range (${exam.startUniversityId} - ${exam.endUniversityId})`,
                  errorType: 'UNIVERSITY_ID_RANGE_ERROR',
                  studentId: user.uniId,
                  validRange: {
                    start: exam.startUniversityId,
                    end: exam.endUniversityId
                  },
                  examName: exam.examName
                });
              }
            }
          } else {
            // If any of the required fields are missing
            const missingFields = [];
            if (!user.uniId) missingFields.push('your university ID');
            if (!exam.startUniversityId) missingFields.push('exam start university ID');
            if (!exam.endUniversityId) missingFields.push('exam end university ID');

            validationPassed = false;
            return res.status(400).json({
              message: 'Priority order validation failed: Missing university ID or exam range information',
              details: `Missing information: ${missingFields.join(', ')}. Please contact support if this issue persists.`,
              errorType: 'MISSING_ID_INFORMATION'
            });
          }
        }
      }
    }

    // Final validation check - if priority validation failed, don't create the order
    if (priority && !validationPassed) {
      console.error('Priority order validation failed but reached order creation. This should not happen.');
      return res.status(400).json({
        message: 'Priority order validation failed',
        details: 'Your order cannot be processed because it did not pass priority validation.',
        errorType: 'VALIDATION_ERROR'
      });
    }

    // Priority validation has already been completed above
    // No need for additional hardcoded validation checks

    // Create new order with a unique orderId
    const newOrder = new OrderDetails({
      orderId: uuidv4(), // Explicitly set a unique UUID for orderId
      email,
      orderTime,
      items,
      totalAmount: totalAmount + priorityFee, // Add priority fee to total amount
      canteenId,
      examId,
      priority,
      priorityReason,
      priorityDetails,
      pickupTime,
      specialInstructions,
      deliveryAddress,
      priorityFee
    });

    // Save order to database
    await newOrder.save();

    // If it's a priority order, send notification to canteen staff (implementation would depend on notification system)
    if (priority) {
      // This would be implemented with a real-time notification system like Socket.io
      console.log(`PRIORITY ORDER ALERT: Order ${newOrder._id} is a priority order. Reason: ${priorityReason}`);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderDetails.find()
      .populate('canteenId', 'name location')
      .populate('items.itemId', 'itemName price image')
      .sort({ createdAt: -1 }); // Sort by creation date (newest first)

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error getting all orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get orders by user email
export const getOrdersByUser = async (req, res) => {
  try {
    const orders = await OrderDetails.find({ email: req.params.email })
      .populate('canteenId', 'name location')
      .populate('items.itemId', 'itemName price image')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error getting orders by user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get orders by canteen ID
export const getOrdersByCanteen = async (req, res) => {
  try {
    // First, get the orders with populated menu items
    let orders = await OrderDetails.find({ canteenId: req.params.canteenId })
      .populate('items.itemId', 'itemName price image')
      .sort({ createdAt: -1 }); // Sort by creation date (newest first)

    // Convert orders to plain JavaScript objects
    orders = orders.map(order => order.toObject());

    // For each order, find the corresponding user by email
    const User = mongoose.model('User');

    // Use Promise.all to wait for all user lookups to complete
    await Promise.all(orders.map(async (order) => {
      try {
        // Find user with matching email
        const user = await User.findOne({ email: order.email }, 'name email');

        // If user found, add user object to order
        if (user) {
          order.user = user.toObject();
        }
      } catch (err) {
        console.error(`Error finding user for email ${order.email}:`, err);
      }
    }));

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error getting orders by canteen:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get priority orders by canteen ID
export const getPriorityOrdersByCanteen = async (req, res) => {
  try {
    // First, get the priority orders with populated menu items
    let priorityOrders = await OrderDetails.find({
      canteenId: req.params.canteenId,
      priority: true,
      status: { $nin: ['delivered', 'cancelled'] } // Only get active priority orders
    })
      .populate('items.itemId', 'itemName price image')
      .sort({ createdAt: 1 }); // Oldest first to ensure they're handled in order

    // Convert orders to plain JavaScript objects
    priorityOrders = priorityOrders.map(order => order.toObject());

    // For each order, find the corresponding user by email
    const User = mongoose.model('User');

    // Use Promise.all to wait for all user lookups to complete
    await Promise.all(priorityOrders.map(async (order) => {
      try {
        // Find user with matching email
        const user = await User.findOne({ email: order.email }, 'name email');

        // If user found, add user object to order
        if (user) {
          order.user = user.toObject();
        }
      } catch (err) {
        console.error(`Error finding user for email ${order.email}:`, err);
      }
    }));

    res.status(200).json(priorityOrders);
  } catch (error) {
    console.error('Error getting priority orders by canteen:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    // Find the order and populate menu items and canteen
    let order = await OrderDetails.findById(req.params.id)
      .populate('canteenId', 'name location')
      .populate('items.itemId', 'itemName price image');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Convert to plain JavaScript object
    order = order.toObject();

    // Find the corresponding user by email
    const User = mongoose.model('User');
    try {
      const user = await User.findOne({ email: order.email }, 'name email');
      if (user) {
        order.user = user.toObject();
      }
    } catch (err) {
      console.error(`Error finding user for email ${order.email}:`, err);
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error getting order by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    let { status } = req.body;

    // Find the order first to check if it exists and get its current status
    const order = await OrderDetails.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if this is an online paid order
    const Payment = mongoose.model('Payment');
    const payment = await Payment.findOne({ orderId: req.params.id });
    const isOnlinePaid = payment &&
                         payment.paymentStatus === 'completed' &&
                         (payment.paymentMethod === 'razorpay' ||
                          payment.paymentMethod === 'card' ||
                          payment.paymentMethod === 'upi');

    // If trying to cancel an online paid order, process refund
    if (status === 'cancelled' && isOnlinePaid) {
      // Only allow cancellation if the order is in 'pending' status
      // For online paid orders, we only allow cancellation in pending status
      if (order.status !== 'pending') {
        return res.status(400).json({
          message: 'Cannot cancel this order',
          details: 'Online paid orders can only be cancelled before preparation begins'
        });
      }

      try {
        // Import Razorpay
        const Razorpay = (await import('razorpay')).default;

        // Initialize Razorpay
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        // Process refund through Razorpay
        const refund = await razorpay.payments.refund(payment.razorpayDetails.paymentId, {
          amount: payment.amount * 100 // amount in smallest currency unit (paise)
        });

        // Update payment status
        payment.paymentStatus = 'refunded';
        await payment.save();

        // Update order status to cancelled
        let cancelledOrder = await OrderDetails.findByIdAndUpdate(
          req.params.id,
          { status: 'cancelled' },
          { new: true }
        ).populate('canteenId', 'name location')
          .populate('items.itemId', 'itemName price image');

        // Convert to plain JavaScript object
        cancelledOrder = cancelledOrder.toObject();

        // Find the corresponding user by email
        const User = mongoose.model('User');
        try {
          const user = await User.findOne({ email: cancelledOrder.email }, 'name email');
          if (user) {
            cancelledOrder.user = user.toObject();
          }
        } catch (err) {
          console.error(`Error finding user for email ${cancelledOrder.email}:`, err);
        }

        return res.status(200).json({
          message: 'Order cancelled and refund processed successfully',
          order: cancelledOrder,
          refund: {
            processed: true,
            details: refund
          }
        });
      } catch (refundError) {
        console.error('Error processing refund:', refundError);
        return res.status(500).json({
          message: 'Failed to process refund',
          error: refundError.message
        });
      }
    }

    // If status is 'delivered', automatically mark it as 'completed' after a delay
    if (status === 'delivered') {
      // Update to 'delivered' status immediately
      let updatedOrder = await OrderDetails.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate('canteenId', 'name location')
        .populate('items.itemId', 'itemName price image');

      // Convert to plain JavaScript object
      updatedOrder = updatedOrder.toObject();

      // Find the corresponding user by email
      const User = mongoose.model('User');
      try {
        const user = await User.findOne({ email: updatedOrder.email }, 'name email');
        if (user) {
          updatedOrder.user = user.toObject();
        }
      } catch (err) {
        console.error(`Error finding user for email ${updatedOrder.email}:`, err);
      }

      // Schedule to mark as completed after 5 minutes (in a real app, this would use a job queue)
      setTimeout(async () => {
        try {
          await OrderDetails.findByIdAndUpdate(
            req.params.id,
            { status: 'completed' }
          );
          console.log(`Order ${req.params.id} automatically marked as completed after delivery`);
        } catch (err) {
          console.error('Error auto-completing order:', err);
        }
      }, 5 * 60 * 1000); // 5 minutes

      return res.status(200).json({
        message: `Order status updated to ${status} and will be automatically marked as completed`,
        order: updatedOrder
      });
    } else {
      // For other status updates, proceed normally
      let updatedOrder = await OrderDetails.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate('canteenId', 'name location')
        .populate('items.itemId', 'itemName price image');

      // Convert to plain JavaScript object
      updatedOrder = updatedOrder.toObject();

      // Find the corresponding user by email
      const User = mongoose.model('User');
      try {
        const user = await User.findOne({ email: updatedOrder.email }, 'name email');
        if (user) {
          updatedOrder.user = user.toObject();
        }
      } catch (err) {
        console.error(`Error finding user for email ${updatedOrder.email}:`, err);
      }

      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }

      return res.status(200).json({
        message: `Order status updated to ${status}`,
        order: updatedOrder
      });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    // First, find the order to check its current status and payment information
    const order = await OrderDetails.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order is already cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // Check if the order is in a state that can be cancelled
    const cancellableStates = ['pending', 'preparing'];
    if (!cancellableStates.includes(order.status)) {
      return res.status(400).json({
        message: 'Order cannot be cancelled',
        details: 'Orders can only be cancelled when in pending or preparing status'
      });
    }

    // Update order status to cancelled
    const cancelledOrder = await OrderDetails.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    // Check if this order was paid online and process refund if needed
    const Payment = mongoose.model('Payment');
    const payment = await Payment.findOne({ orderId: req.params.id });

    let refundProcessed = false;
    let refundDetails = null;

    if (payment && payment.paymentStatus === 'completed' &&
        (payment.paymentMethod === 'razorpay' || payment.paymentMethod === 'card' ||
         payment.paymentMethod === 'upi')) {
      try {
        // Import Razorpay
        const Razorpay = (await import('razorpay')).default;

        // Initialize Razorpay
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        // Process refund through Razorpay
        const refund = await razorpay.payments.refund(payment.razorpayDetails.paymentId, {
          amount: payment.amount * 100 // amount in smallest currency unit (paise)
        });

        // Update payment status
        payment.paymentStatus = 'refunded';
        await payment.save();

        refundProcessed = true;
        refundDetails = refund;

        console.log(`Refund processed for order ${req.params.id}:`, refund);
      } catch (refundError) {
        console.error('Error processing refund:', refundError);
        // We still want to cancel the order even if refund fails
        // But we'll include the error in the response
        return res.status(200).json({
          message: 'Order cancelled successfully, but refund processing failed',
          order: cancelledOrder,
          refundError: refundError.message
        });
      }
    }

    // Return appropriate response based on whether a refund was processed
    if (refundProcessed) {
      res.status(200).json({
        message: 'Order cancelled and refund processed successfully',
        order: cancelledOrder,
        refund: {
          processed: true,
          details: refundDetails
        }
      });
    } else {
      res.status(200).json({
        message: 'Order cancelled successfully',
        order: cancelledOrder,
        refund: {
          processed: false,
          reason: payment ? 'Payment not eligible for refund' : 'No payment record found'
        }
      });
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
