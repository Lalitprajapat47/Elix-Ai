import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },

        image: {
            type: String,
            required: false,
        },

        fileName: {
            type: String,
            required: false,
        },
        fileText: {
            type: String,
            required: false,
        },

        sources: [
            {
                title: { type: String },
                url: { type: String },
                _id: false,
            }
        ],

        role: {
            type: String,
            enum: ['user', 'ai'],
            required: true,
        },
    },
    { timestamps: true }
);

const messageModel = mongoose.model('Message', messageSchema);

export default messageModel;