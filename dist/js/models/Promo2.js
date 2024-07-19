"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Promo2Schema = new mongoose_1.Schema({
    name: { type: String },
    description: { type: String },
    offer: { type: String },
    price: { type: Number },
    image: { type: String },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Products',
    }
}, { timestamps: true });
const Promo2 = (0, mongoose_1.model)('Promo2', Promo2Schema);
exports.default = Promo2;
