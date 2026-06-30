import mongoose, { Schema } from "mongoose";



const userSchema = new Schema({
    name: {
        type: String,
        requird: true
    },

    userName: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String
    },

    token: {
        type: String
    }
}, { timestamps: true });

const user = mongoose.model("user", userSchema);

export { user };