const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const cartModel = require("../models/cartModel")
const vfy = require('../utility/validation')

//<<<<<<<<<<<<<==============create cart========================>>>>>>>>>>>>>>>>//

const createCart = async function (req, res) {
    try {
        const userId = req.params.userId
        let { quantity, productId, cartId } = req.body

        if (!vfy.isValidRequestBody(req.body)) return res.status(400).send({ status: false, message: "Please provide valid request body!" })

        if (!vfy.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Please provide valid User Id!" })

        if (!vfy.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please provide valid Product Id!" })

        if (!quantity) {
            quantity = 1
        } else {
            if (!vfy.validQuantity(quantity)) return res.status(400).send({ status: false, message: "Please provide valid quantity & it must be greater than zero!" })
        }
        //---------Find User by Id--------------//
        const findUser = await userModel.findById({ _id: userId })

        if (!findUser) {
            return res.status(400).send({ status: false, message: `User doesn't exist by ${userId}!` })
        }

        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false });

        if (!findProduct) {
            return res.status(400).send({ status: false, message: `Product doesn't exist by ${productId}!` })
        }
        //----------Find Cart By Id----------//
        const cartdata = await cartModel.findOne({ userId })
        if (cartdata) {
            if (vfy.isEmptyVar(cartId)) return res.status(400).send({ status: false, message: "CartId is required for existing cartId!" })
            if (!vfy.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Please provide valid cartId!" })

            if (cartdata._id != cartId) return res.status(400).send({ status: false, message: "CartId doesn't belong to this user!" })

            let flag = 0;
            if (productId && quantity) {
                for (let i = 0; i < cartdata.items.length; i++) {
                    if (cartdata.items[i].productId == productId) {
                        cartdata.items[i].quantity += quantity
                        flag = 1;
                        break;
                    }
                }

                if (flag != 1) {
                    cartdata.items.push({ productId, quantity })
                }
            }

            let totalPrice = cartdata.totalPrice + (quantity * findProduct.price)
            cartdata.totalPrice = totalPrice

            let totalQuantity = cartdata.items.length
            cartdata.totalItems = totalQuantity

            await cartdata.save()
            return res.status(201).send({ status: true, message: "Success", data: cartdata })
        }
        //------------Create New Cart------------//

        if (!cartdata) {

            let newCartData = {
                userId: userId,
                items: [
                    {
                        productId: productId,
                        quantity: quantity
                    }
                ],
                totalPrice: findProduct.price * quantity,
                totalItems: 1
            }

            const createCart = await cartModel.create(newCartData);
            return res.status(201).send({ status: true, message: `Cart created successfully`, data: createCart })
        }
    } catch (error) {
        res.status(500).send({ status: false, data: error.message })
    }
}

//<<<<<<<<<<<<<==============update cart========================>>>>>>>>>>>>>>>>//

const updateCart = async (req, res) => {
    try {
        // get body here
        const data = req.body
        const userId = req.params.userId

        // check body validation
        if (vfy.isEmptyObject(data)) return unsuccess(res, 400, ' Post Body is empty, Please add some key-value pairs')

        // destructure data here
        let { productId, cartId, removeProduct } = data

        // basic validations
        // validate products
        if (vfy.isEmptyVar(productId)) return unsuccess(res, 400, ' ProductId must be required!')
        if (!vfy.isValidObjectId(productId)) return unsuccess(res, 400, ' Invalid ProductId!')
        // validate quantity
        if (isNaN(removeProduct)) return unsuccess(res, 400, ' removeProduct must be required!')
        removeProduct = Math.floor(removeProduct)
        if (typeof removeProduct != 'number') return unsuccess(res, 400, ' removeProduct must be a number!')
        //  if you want, like removeProduct = 2 then remove quantity by 2 for that comment  line
        if (removeProduct < 0 || removeProduct > 1) return unsuccess(res, 400, ' removeProduct value is only 0 and 1 !')

        // is a valid id 
        if (!vfy.isValidObjectId(userId)) return unsuccess(res, 400, ' Invalid userId !')

        // check broduct exist or not;
        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) return unsuccess(res, 404, ' productId not found!')
        // validate cartID
        if (vfy.isEmptyVar(cartId)) return unsuccess(res, 400, ' CartId must be required!')
        if (!vfy.isValidObjectId(cartId)) return unsuccess(res, 400, ' Invalid cartId !')

        // check if the cart is already exist or not
        const cart = await cartModel.findOne({ userId })
        if (!cart) return unsuccess(res, 404, ' Cart not found!')
        // check both cartid's from req.body and db cart are match or not?
        if (cart._id != cartId) return unsuccess(res, 400, ' CartId does\'t belong to this user!')

        // we neeed to check if the item already exist in my item's list or NOT!!

        let flag = -1;

        for (let i = 0; i < cart.items.length; i++) {
            if (cart.items[i].productId == productId) {

                flag = i;
                break;
            }
            else {

                return res.status(400).send({ status: false, message: "this product'id is not available ...pls try another" })
            }
        }
        if (!cart.items[flag]) { return res.status(400).send({ status: false, message: "item is not present or already deleted" }) }

        if (flag >= 0) {
            if (cart.items[flag].quantity < removeProduct) return res.status(400).send({ status: false, message: ` Can't remove, please provide removeProduct <= ${cart.items[flag].quantity} !` })

            if (removeProduct == 0) {
                // update price
                let total = cart.totalPrice - (product.price * cart.items[flag].quantity)
                cart.totalPrice = Math.round(total * 100) / 100
                cart.items.splice(flag, 1) //remove full item
            }

            else {
                // update price
                let total = cart.totalPrice - (product.price * removeProduct)
                cart.totalPrice = Math.round(total * 100) / 100
                if (cart.items[flag].quantity == removeProduct) {
                    cart.items.splice(flag, 1) //remove full item
                }
                else {
                    cart.items[flag].quantity = cart.items[flag].quantity - removeProduct //update quantity
                }
              
            }
        }

        if (cart.items.length == 0) {
            cart.totalPrice = 0;
        }
        // update quantity
        cart.totalItems = cart.items.length
        // update cart
        await cart.save()
        return success(res, 200, cart, "Success")

    } catch (_) {
        console.log(_)
        unsuccess(res, 500, `⚠️ Error: ${_.message}`)
    }
}

//<<<<<<<<<<<<<=========== get cart ==============>>>>>>>>>>>>>>>>>>>>>>>>//

const getCart = async function (req, res) {
    try {
        let userId = req.params.userId;

        //checking if the cart exist with this userId or not

        if (!vfy.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "please provide valid userId" })
        }
        let findCart = await cartModel.findOne({ userId: userId }).populate('items.productId').select({ __v: 0 });
        if (!findCart) return res.status(404).send({ status: false, message: `No cart found with this "${userId}" userId` });

        res.status(200).send({ status: true, message: "Cart Details", data: findCart })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

//<<<<<<<<<<<<<<<<<============== delete cart ===================>>>>>>>>>>>>>>>>>>>>>//

const deleteCart = async function (req, res) {
    try {

        const userId = req.params.userId

        const userByuserId = await userModel.findById(userId);

        if (!userByuserId) {
            return res.status(404).send({ status: false, message: 'user not found.' });
        }

        const isCartIdPresent = await cartModel.findOne({ userId: userId });

        if (!isCartIdPresent) {
            return res.status(404).send({ status: false, message: 'cart not found.' });
        }

        const delCart = await cartModel.findOneAndUpdate(
            { userId: userId },
            {
                $set: { totalPrice: 0, items: [], totalItems: 0 }
            },
            { new: true }
        );

        return res.status(204).send({ status: true, message: "Item and Products delete in cart", data: delCart });

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

const success = (res, statusCode, Data, message) => {
    return res.status(statusCode).send({ status: true, message: message, data: Data })
}

const unsuccess = (res, statusCode, message) => {
    return res.status(statusCode).send({ status: !true, message: message })
}
module.exports = { createCart, getCart, deleteCart, updateCart }
