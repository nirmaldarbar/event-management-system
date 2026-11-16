const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  ticketType: {
    name: String,
    price: Number
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'credit-card', 'bank-transfer', 'cash'],
    default: 'stripe'
  },
  paymentId: String,
  attendees: [{
    name: String,
    email: String,
    phone: String
  }],
  checkInStatus: {
    type: Boolean,
    default: false
  },
  checkInTime: Date,
  ticketNumber: {
    type: String,
    unique: true
  },
  qrCode: String,
  specialRequirements: String,
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  cancelledAt: Date,
  cancellationReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate the pass number. Runs before validation so it is always present on save.
const makeTicketNumber = () => {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `EVT-${stamp}${rand}`;
};

BookingSchema.pre('validate', function() {
  if (!this.ticketNumber) {
    this.ticketNumber = makeTicketNumber();
  }
});

module.exports = mongoose.model('Booking', BookingSchema);