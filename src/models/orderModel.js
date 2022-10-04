const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId

const orderSchema = new mongoose.Schema(
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
          },
          totalQuantity: {
               type: Number,
               required: true,
               trim: true,
          },
          cancellable: {
               type: Boolean,
               default: true
          },
          status: {
               type: String,
               default: "pending",
               enum: ["pending", "completed", "cancled"]
          },
          deletedAt: {
               type: Date,
               default: null
          },
          isDeleted: {
               type: Boolean,
               default: false
          },
     }, { timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema)