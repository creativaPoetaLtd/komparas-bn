import { IHello } from "../types/hello"
import { model, Schema } from "mongoose"

const helloSchema: Schema = new Schema(
  {
    hello: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

export default model<IHello>("Hello", helloSchema)