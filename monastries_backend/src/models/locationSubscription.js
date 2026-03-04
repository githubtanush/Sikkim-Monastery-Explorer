const mongoose = require("mongoose");

const locationSubscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserLocation',
        required: true,
        index: true
    },
    planType: {
        type: String,
        enum: ['monthly', 'quarterly', 'annual'],
        default: 'monthly'
    },
    monthlyAmount: {
        type: Number,
        required: true,
        default: 99 // $99/month or your preferred currency
    },
    autopayEnabled: {
        type: Boolean,
        default: true
    },
    autopayDate: {
        type: Number, // day of month (1-31)
        required: true,
        min: 1,
        max: 31
    },
    nextRenewalDate: {
        type: Date,
        required: true
    },
    lastPaymentDate: {
        type: Date,
        default: null
    },
    lastPaymentAttemptDate: {
        type: Date,
        default: null
    },
    lastPaymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed', 'none'],
        default: 'none'
    },
    failedAttempts: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    suspendReason: {
        type: String,
        enum: ['payment_failed', 'user_cancelled', 'admin_suspended', 'none'],
        default: 'none'
    },
    suspendedAt: {
        type: Date,
        default: null
    },
    paymentMethodId: {
        type: String,
        default: null // placeholder for payment gateway integration
    },
    termsAccepted: {
        type: Boolean,
        required: true
    },
    termsAcceptedAt: {
        type: Date,
        required: true
    },
    notes: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

// Index for finding active subscriptions
locationSubscriptionSchema.index({ isActive: 1, nextRenewalDate: 1 });
locationSubscriptionSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('LocationSubscription', locationSubscriptionSchema);
