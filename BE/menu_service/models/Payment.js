const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Successful', 'Failed'], default: 'Pending' },
  reference: { type: String },
  method: { type: String, enum: ['Card', 'Bank Transfer', 'Cash'], default: 'Card' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);
