const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // ── Step 1 ──────────────────────────────────────────
    category: {
        type: String,
        enum: ['bug_report', 'feature_request', 'ui_ux', 'content_quality', 'appreciation'],
        default: 'appreciation'
    },
    targetAreas: {
        type: [String],
        enum: ['Dashboard', 'Kuppi Classes', 'Resource Sharing', 'Study Groups', 'Quiz Zone', 'Student Profile'],
        default: []
    },
    // ── Step 2 — Performance Matrix ──────────────────────
    ratings: {
        easeOfUse: { type: Number, min: 1, max: 5, default: null },
        informationClarity: { type: Number, min: 1, max: 5, default: null },
        loadingSpeed: { type: Number, min: 1, max: 5, default: null },
        overallSatisfaction: { type: Number, min: 1, max: 5, default: null },
    },
    // ── Step 3 — Qualitative ─────────────────────────────
    painPoints: { type: String, trim: true, default: '' },
    featureSuggestion: { type: String, trim: true, default: '' },
    contactPermission: { type: Boolean, default: false },
    isAnonymous: { type: Boolean, default: false },

    // ── Legacy / compatibility ────────────────────────────
    // `rating` mirrors overallSatisfaction for public testimonials
    rating: { type: Number, min: 1, max: 5, required: true },
    // `comment` mirrors painPoints for public display
    comment: { type: String, trim: true, default: '' },

}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
