const productModel = require("../models/productModel")
const vfy = require('../utility/validation')
const { uploadFile } = require('../aws.config.js')
const mongoose = require("mongoose")

//-----------------------------------------------[createproduct]-----------------------------------------------------//

const createProduct = async (req, res) => {
    try {
        const requestBody = req.body
        if (vfy.isEmptyObject(requestBody)) return res.status(400).send({ status: false, message: "Invalid request parameters, Please provide Product details" })
        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, isDeleted } = requestBody

        const files = req.files
        if (vfy.isEmptyFile(files)) return res.status(400).send({ status: false, message: "Please provide product's Image" });

        if (vfy.isEmptyFile(title)) return res.status(400).send({ status: false, message: "Please provide product's title" });

        const duplicate = await productModel.findOne({ title })
        if (duplicate) return res.status(400).send({ status: false, message: `${title} product already exists` })

        if (vfy.isEmptyFile(description)) return res.status(400).send({ status: false, message: "Please provide product's description" });
        if (vfy.isEmptyFile(price)) return res.status(400).send({ status: false, message: "Please provide product's price" });
        if (!vfy.numberValue(price)) return res.status(400).send({ status: false, message: "Please enter price!" });

        if (vfy.isEmptyFile(currencyId)) return res.status(400).send({ status: false, message: "Please provide product's currencyId" });
        if (currencyId !== "INR") return res.status(400).send({ status: false, message: "Please enter currencyId in INR format" })
        if (vfy.isEmptyFile(currencyFormat)) return res.status(400).send({ status: false, message: "Please provide product's currency Format" });
        if (currencyFormat !== "₹") return res.status(400).send({ status: false, message: "Please enter currencyFormat in correct format" })
        if (vfy.isEmptyFile(isFreeShipping)) return res.status(400).send({ status: false, message: "Please provide product's shipping is free" });
        if (!vfy.booleanValue(isFreeShipping)) return res.status(400).send({ status: false, message: "Please enter isFreeShipping!" })

        if (vfy.isEmptyFile(style)) return res.status(400).send({ status: false, message: "Please provide product's style " });
        if (vfy.isEmptyFile(availableSizes)) return res.status(400).send({ status: false, message: "Please provide product's available Sizes" });
        let availableSize

        if (availableSizes) {
            availableSize = availableSizes.toUpperCase().split(",")
            for (let i = 0; i < availableSize.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"]).includes(availableSize[i])) {
                    return res.status(400).send({ status: false, message: `Sizes should be ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
                }
            }
        }
        if (vfy.isEmptyFile(installments)) return res.status(400).send({ status: false, message: "Please provide product's available in installments " });
        if (!vfy.numberValue(installments)) return res.status(400).send({ status: false, message: "Please enter installments!" })
        if (isDeleted === true || isDeleted === "") return res.status(400).send({ status: false, message: "isDeleted must be false!" })
        if (!vfy.acceptFileType(files[0], 'image/jpeg', 'image/jpg', 'image/png')) return res.status(400).send({ status: false, message: "we accept jpg, jpeg or png as profile picture only" });

        let productImage = await uploadFile(files[0])

        const productrequestbody = { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes: availableSize, installments, isDeleted }

        const product = await productModel.create(productrequestbody)

        return res.status(201).send({ status: true, message: "Success", data: product })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

//<<<<<<<<<<<<<=============Get Products By Product Id===============>>>>>>>>>>>>>>>>>>>>>//

const getProductsById = async function (req, res) {
    try {
        let productId = req.params.productId
        if (mongoose.Types.ObjectId.isValid(productId)) {
            const product = await productModel.findOne({ _id: productId, isDeleted: false })
            if (product) {
                return res.status(200).send({ status: true, message: "Success", data: product })
            } else {
                return res.status(404).send({ status: false, message: "Product not found" })
            }
        } else {
            return res.status(400).send({ status: !true, message: "Product Id is invalid" })
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//-----------------------------------------[getByQuery]-----------------------------------

const getProduct = async function (req, res) {
    let { name, size, priceGreaterThan, priceLessThan, priceSort } = req.query
    let filters = { isDeleted: false }

    if (name) {
        if (!vfy.isValid(name)) { res.status(400).send({ status: false, message: "please provide valid name" }) }
        let findTitle = await productModel.find({ title: name })
        let fTitle = findTitle.map(x => x.title).filter(x => x.includes(name))

        filters.title = { $in: fTitle }
    }

    if (size) {
        let size1 = size.split(",").map(x => x.trim().toUpperCase())

        let correctSize = ["S", "XS", "M", "X", "L", "XXL", "XL"]

        if (size1.map(x => correctSize.includes(x)).filter(x => x === false).length !== 0) return res.status(400).send({ status: false, message: "Size Should be among  S,XS,M,X,L,XXL,XL" })
        filters.availableSizes = { $in: size1 }
    }

    if (priceGreaterThan) {
        if (!vfy.IsNumeric(priceGreaterThan)) { return res.status(400).send({ status: false, message: "price must be number" }) }
        filters.price = { $gt: priceGreaterThan }
    }

    if (priceLessThan) {
        if (!vfy.IsNumeric(priceLessThan)) { return res.status(400).send({ status: false, message: "price must be number" }) }
        filters.price = { $lt: priceLessThan }
    }

    if (priceGreaterThan && priceLessThan) {
        if (!vfy.IsNumeric(priceLessThan) || !vfy.IsNumeric(priceGreaterThan)) { return res.status(400).send({ status: false, message: "price must be number" }) }
        filters.price = { $gt: priceGreaterThan, $lt: priceLessThan }
    }

    if (!priceSort) {
        let arr = ["1", "-1"]
        if (!arr.includes(priceSort)) return res.status(400).send({ status: false, message: "priceSort value can only be 1 or -1" }) 
    }

    let getData = await productModel.find(filters).sort({ price: priceSort })
    if (!getData) return res.status(404).send({ status: false, message: "product not found or may be deleted" }) 
    return res.status(200).send({ status: true, count: getData.length, message: "products details", data: getData })
}


//-----------------------------------------------[updateProduct]---------------------------------------------------------

const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        let data = req.body
        let files = req.files
        if (!productId) return res.status(400).send({ status: false, message: "provide productId" })
        if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "invalid productId" })
        let checkId = await productModel.findById({ _id: productId })
        if (!checkId) return res.status(404).send({ status: false, message: "no such product" })
        if (checkId.isDeleted == true) return res.status(404).send({ status: false, message: "product is already deleted" })

        if (!(Object.keys(data).length || files)) return res.status(400).send({ status: false, message: "please provide data to update" })

        let { title, description, price, isFreeShipping, currencyId, currencyFormat, style, availableSizes, installments } = data
        let updatedata = {};


        if (title || title == '') {
            if (!vfy.isValid(title)) return res.status(400).send({ status: false, message: "Title is required." });

            let checkTitle = await productModel.findOne({ title: data.title });            //checking for duplicate title
            if (checkTitle) return res.status(400).send({ status: false, message: "Title already exist" });

            updatedata.title = title
        }

        if (description || typeof description == 'string') {

            if (!(vfy.isValid(description) || vfy.isValidString(description))) return res.status(400).send({ status: false, message: "description is required." });

            updatedata.description = description
        }

        if (price || price == "") {
            if (!(vfy.isValid(price) || vfy.isValidPrice(price))) return res.status(400).send({ status: false, message: "price Should be in number only...!" });

            updatedata.price = price
        }

        if (currencyId || typeof currencyId == "string") {
            if (!(/INR/.test(currencyId))) return res.status(400).send({ status: false, message: "Currency Id of product should be in uppercase 'INR' format" });

            updatedata.currencyId = currencyId
        }

        if (currencyFormat || typeof currencyFormat == "string") {
            if (!(/₹/.test(currencyFormat))) return res.status(400).send({ status: false, message: "Currency format/symbol of product should be in '₹' " });

            updatedata.currencyFormat = currencyFormat
        }

        if (style || typeof style == "string") {
            if (!vfy.isValid(style)) return res.status(400).send({ status: false, message: "Style should be present" });

            updatedata.style = style
        }

        if (installments || typeof installments == "string") {
            if (!vfy.isValidString(installments)) return res.status(400).send({ status: false, message: "Installments should be in numbers" });
            if (!vfy.isValidPrice(installments)) return res.status(400).send({ status: false, message: "Installments should be valid" });

            updatedata.installments = installments
        }

        if (availableSizes || typeof availableSizes == "string") {
            let size1 = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            let size2 = availableSizes.toUpperCase().split(",").map((x) => x.trim())
            for (let i = 0; i < size2.length; i++) {
                if (!(size1.includes(size2[i]))) {
                    return res.status(400).send({ status: false, message: "Sizes should one of these - 'S', 'XS', 'M', 'X', 'L', 'XXL' and 'XL'" })
                }
                availableSizes = size2
            } 
            updatedata.availableSizes = availableSizes
        }

        if (isFreeShipping || isFreeShipping == "") {

            isFreeShipping = isFreeShipping.toLowerCase();
            if (isFreeShipping == 'true' || isFreeShipping == 'false') {
                isFreeShipping = JSON.parse(isFreeShipping);     //convert from string to boolean
            } else {
                return res.status(400).send({ status: false, message: "Enter a valid boolean value for isFreeShipping" })
            }

            updatedata.isFreeShipping = isFreeShipping
        }

        if (files == []) return res.status(400).send({ status: false, message: "provide image in files" })
        if (files && files.length > 0) {

            let uploadedFileURL = await uploadFile(files[0])
            productImage = uploadedFileURL
            if (productImage == checkId.productImage) return res.status(400).send({ status: false, message: "This url is Already available" })
            updatedata.productImage=productImage
        }

        let updateData = await productModel.findOneAndUpdate(
            { _id: productId, isDeleted: false },
            { $set:  updatedata  },
            { new: true })
        res.status(200).send({ status: true, message: "Success", data: updateData })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

// -----------------------------------------------[deleteProduct]----------------------------------------------------------
const deleteProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!productId) return res.status(400).send({ status: false, message: "provide productId" })
        if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "invalid productId" })

        let checkId = await productModel.findById({ _id: productId })
        if (!checkId) return res.status(404).send({ status: false, message: "no such product" })
        if (checkId.isDeleted == true) return res.status(404).send({ status: false, message: "product is already deleted" })

        let deletedDoc = await productModel.findOneAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: Date.now() }, { new: true })
        res.status(200).send({ status: true, message: "Success", data: deletedDoc })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createProduct, getProduct, getProductsById, updateProduct, deleteProduct }
