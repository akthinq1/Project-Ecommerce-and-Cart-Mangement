const orderModel = require('../models/orderModel')
const cartModel = require('../models/cartModel')
const vfy = require('../utility/validation')

const createOrder = async function (req, res) {

    try {
        let requestBody = req.body;
        const userId = req.params.userId

        const { cartId, cancellable } = requestBody
        if (vfy.isEmptyObject(requestBody)) return res.status(400).send({ status: false, message: ' Please provide data in requestBody' });

        if (vfy.isEmptyVar(cartId)) return res.status(400).send({ status: false, message: ' Please provide cartId' })
        if (!vfy.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: ' Please provide a valid cartId' })

        if (cancellable) {
            if (typeof cancellable != "boolean") { return res.status(400).send({ status: false, message: "Cancellable must be boolean" }) }
        }

        const cart = await cartModel.findOne({ userId })
        if (!cart) return res.status(404).send({ status: false, message: "user's cart unavailable" })
        if (cart._id != cartId) return res.status(403).send({ status: false, message: "Cart id doesn't belong to this user" })

        // get cart info like items, totalPrice, totalItems and totalQuantity
        let { items, totalPrice, totalItems } = cart
        let totalQuantity = 0;
        items.forEach(each => totalQuantity += each.quantity);

        // object that use to create order
        const Obj = { userId, items, totalPrice, totalItems, totalQuantity, cancellable }

        const createProduct = await orderModel.create(Obj);

        res.status(200).send({ status: true, message: ' Success', data: createProduct })

    } catch (error) { res.status(500).send({ status: false, message: error.message }) }
}


const updateOrder = async function (req, res) {
    const userId = req.params.userId
    const requestBody = req.body

    let { orderId, status } = requestBody
    if (vfy.isEmptyObject(requestBody)) return res.status(400).send({ status: false, message: ' Invalid request Body' })
    if (vfy.isEmptyVar(orderId)) return res.status(400).send({ status: false, message: ' Please provide orderId' })
    if (!vfy.isValidObjectId(orderId)) return res.status(400).send({ status: false, message: ' Please provide valid orderId' })
    const checkOrderId = await orderModel.findById({ _id: orderId })
    if (!checkOrderId) return res.status(404).send({ status: false, message: `Order does not exist for ${orderId}` }) 
    if (!vfy.isValid(status)) return res.status(400).send({ status: false, message: ' Status is required' })
    if (typeof status != "string") return res.status(400).send({ status: false, message: "status should be in string" })

    if (!["pending", "completed", "cancled"].includes(status)) { return res.status(400).send({ status: false, message: ' Status should be only ["pending", "completed", "cancled"]' }) }

    const userByOrder = await orderModel.findOne({ _id: orderId, userId: userId })
    if (!userByOrder) { return res.status(400).send({ status: false, message: `Order does not exist for ${userId}` }) }

    if (status == "cancled") {
        if (!userByOrder.cancellable) { return res.status(400).send({ status: false, message: "This order can't be cancelled because it is not allowed(cancellable=false)" }) }
    }

    const updateOrder = await orderModel.findOneAndUpdate({ _id: orderId, userId }, { $set: { status } }, { new: true })
    return res.status(200).send({ status: true, message: "Success", data: updateOrder })
}
module.exports = { createOrder, updateOrder }