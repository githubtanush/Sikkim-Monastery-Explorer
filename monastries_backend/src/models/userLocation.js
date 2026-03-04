const mongoose = require("mongoose");

const userLocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 100,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Hotel', 'Restaurant', 'Shop', 'Tourist Attraction', 'Food Court', 'Cafe', 'Guesthouse', 'Other'],
        index: true
    },
    description: {
        type: String,
        required: true,
        minLength: 20,
        maxLength: 500
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    website: {
        type: String,
        default: null
    },
    hours: {
        type: String,
        default: "Not specified",
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        }
    },
    imageUrl: {
        type: String,
        required: true
    },
    imageFileName: {
        type: String,
        default: null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'expired', 'suspended', 'pending'],
        default: 'pending',
        index: true
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LocationSubscription',
        default: null
    },
    isApproved: {
        type: Boolean,
        default: false,
        index: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    approvalDate: {
        type: Date,
        default: null
    },
    expiresAt: {
        type: Date,
        default: null
    },
    views: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});

// Geospatial index for location-based queries
userLocationSchema.index({ 'location': '2dsphere' });

module.exports = mongoose.model('UserLocation', userLocationSchema);
