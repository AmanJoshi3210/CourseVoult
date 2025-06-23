const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    type: { type: String, required: true, enum: ["Notes", "Videos", "Quizzes", "Assignments","Articles","Books"] },
    image: { type: String, required: true ,default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFD7ZMfgNMJ19tB66Kiacx8N4L08ynbJuVVw&s"},
    link: { type: String, required: true }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
