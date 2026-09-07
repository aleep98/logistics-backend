import { Schema, model } from "mongoose";
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "dispatcher", "driver"],
        required: true,
    },
}, {
    timestamps: true,
});
export default model("User", userSchema);
//# sourceMappingURL=User.js.map