import mongoose from 'mongoose';

const legalPageSchema = new mongoose.Schema({
    panel: {
        type: String,
        required: true,
        enum: ['customer', 'seller', 'delivery']
    },
    type: {
        type: String,
        required: true,
        enum: ['privacy', 'support']
    },
    title: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

legalPageSchema.index({ panel: 1, type: 1 }, { unique: true });

const LegalPage = mongoose.model('LegalPage', legalPageSchema);

export default LegalPage;
