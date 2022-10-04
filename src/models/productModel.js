const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
     {

          title: {
               type: String,
               require: true,
               unique: true,
               trim: true
          },
          description: {
               type: String,
               require: true,
               trim: true
          },
          price: {
               type: Number,
               require: true,
               trim: true
          },
          currencyId: {
               type: String,
               require: true,
               default: "INR",
               trim: true
          },
          currencyFormat: {
               type: String,
               require: true,
               default: "₹",
               trim: true
          },
          isFreeShipping: {
               type: Boolean,
               default: false
          },
          productImage: {
               type: String,
               require: true,
               trim: true
          },
          style: {
               type: String,
               trim: true
          },
          availableSizes: [{
               type: String,
               trim: true,
               enum: ["S", "XS", "M", "X", "L", "XXL", "XL"]
          }],
          installments: {
               type: Number,
               trim: true,
               default: 0
          },
          deletedAt: {
               type: Date,
               default: null
          },
          isDeleted: {
               type: Boolean,
               default: false
          }

     }, { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema)