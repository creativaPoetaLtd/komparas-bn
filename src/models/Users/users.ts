import { IUSer } from "../../types/hello";
import { model, Schema } from "mongoose";

const userSchema: Schema = new Schema(
    {
        first_name: {
            type: String,
            required: true
        },
        last_name: {
            type: String,
            required: false
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: false
        },
        confirm_password: {
            type: String,
            required: false
        },
        role: {
            type: String,
            required: false
        },
        status: {
            type: String,
            required: false
        }
    },
    { timestamps: true }
)

export default model<IUSer>("Users", userSchema)
