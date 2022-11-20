const vfy = require('../utility/validation')
const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')

const authentication = (req, res, next) => {
    try {
        let token = req.headers.authorization
        if (vfy.isEmptyVar(token)) return res.status(400).send({ status: false, message: " The token must be required in 'Bearer'" })

        token = token.split(' ')[1] // get the 1 index value
        
        jwt.verify(token, 'project/productManagementGroup60', function (err, decode) {
            if (err) {
                return res.status(401).send({ status: false, message: err.message })
            } else {
                req.tokenData = decode;
                next()
            }
        })
    } catch (_) {
        res.status(500).send({ status: false, message: _.message })
    }
}

const authorization_user = async (req, res, next) => {
    const userId = req.params.userId      // get user id fron params
    if (!userId) return res.status(400).send({ status: false, message: "UserId is required!" })
    if (!vfy.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid user ID!" })   //  check valid object id

    const checkuser=await userModel.findById({_id:userId})
    if(!checkuser) return res.status(404).send({status:false,message:"userId does not exist!"})
    const token = req.tokenData          //  get user id from token

    if (userId !== token.userId) return res.status(401).send({ status: false, message: " Unauthorized user!" })    //   authorisation check

    next()
}

module.exports = { authentication, authorization_user }
