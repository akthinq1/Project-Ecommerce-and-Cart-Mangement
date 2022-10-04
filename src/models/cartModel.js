const mongoose = require("mongoose")
const objectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema(
     {
          userId: {
               type: objectId,
               ref: "User",
               required: true,
               trim: true,
               unique: true
          },
          items: [{
               productId: {
                    type: objectId,
                    ref: "Product",
                    required: true,
                    trim: true,
               },
               quantity: {
                    type: Number,
                    required: true,
                    default: 1
               }
          }],
          totalPrice: {
               type: Number,
               required: true,
               trim: true,
          },
          totalItems: {
               type: Number,
               required: true,
               trim: true,
          }
     }, { timestamps: true }
)

module.exports = mongoose.model("Cart", cartSchema)
