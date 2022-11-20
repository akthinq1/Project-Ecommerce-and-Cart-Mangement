const mongoose = require("mongoose")
const moment = require("moment")

//---------------------------------userValidation-------------------------------------//

let isEmptyObject = function (body) {
    if (!body) return true
    if (Object.keys(body).length == 0) return true;
    return false;
}

let isEmptyVar = function (value) {
    if(!value) return true
    if (typeof value === 'undefined' || value === null) return true;
    if (value.trim().length === 0) return true;
    return false;
}

let isValidPhone = function (number) {
    let phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(number);
}

let isValidEmail = function (email) {
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return emailRegex.test(email)
}

let isValidPassword = function (password) {
    let passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/
    return passwordRegex.test(password)
}

let isValidDateFormat = function (date) {
    let dateFormatRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
    return dateFormatRegex.test(date)
}

let isValidDate = function (date) {
    return moment(date).isValid()
}

let isValidObjectId = function (ObjectId) {
    return mongoose.isValidObjectId(ObjectId)
}


let isEmptyFile = (file) => {
    if (!file || file.length == 0) return true
    return false
}

const acceptFileType = (file, ...types) => {
    return types.indexOf(file.mimetype) !== -1 ? true : false    //ternary opretor [-1 used because don't resived any thing]
}

const isPincodeValid = function (value) {
    return /^[1-9]{1}[0-9]{5}$/.test(value);
}

let isValidJSONstr = (json) => {
    try {
        return JSON.parse(json)
    } catch (_) {
        return false
    }
}

let checkArrContent = (array, ...isContentArray) => {
    let count = 0
    array.forEach(e => {
        if (!isContentArray.includes(e)) count++
    });
    return count == 0 ? true : false
}

let isValidprice = (value) =>{
    return /\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})/g.test(value);
}

const numberValue = (value) => {
    if (typeof value === "undefined" || value === null || typeof value === "boolean") return false;
    if (typeof value === "number" && value.toString().trim().length === 0) return false
    return true;
};
  
const strRegex = (value) => {
    let strRegex = /^[A-Za-z\s]{0,}[\.,'-]{0,1}[A-Za-z\s]{0,}[\.,'-]{0,}[A-Za-z\s]{0,}[\.,'-]{0,}[A-Za-z\s]{0,}[\.,'-]{0,}[A-Za-z\s]{0,}[\.,'-]{0,}[A-Za-z\s]{0,}$/;
    if (strRegex.test(value))
      return true;
};

const booleanValue = (value) => {
    if (typeof value === "undefined" || value === null || typeof value === "number" || typeof value === true) return false;
    if (typeof value === false && value.toString().trim().length === 0) return false;
    return true;
  };

  const isValid = (value) => {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value === "string") { return true }
    else {
        return false
    }
}
//-----------------------------------------------------//Productvalidation//------------------------------------------------------------------------//
const isValidRequestBody = function (request) {
    return Object.keys(request).length > 0;
}
const isValidSize = (value) => {
    if (typeof value === "undefined" || typeof value === "null") return true;
    if (typeof value === "string" && value.trim().length == 0) return true;
    if (typeof value === "object" && Object.keys(value).length == 0) return true;
    return false;
}
const isValidString = (String) => {
    return /\d/.test(String)
}

const isValidPrice = (price) => {
    return /^[1-9]\d{0,7}(?:\.\d{1,2})?$/.test(price)
}

const isValidObjectsId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId);
}

const validQuantity = function isInteger(value) {
    if(value < 1) return false
     if(value % 1 == 0 ) return true
}

let IsNumeric = function (input) {
	var RE = /^-{0,1}\d*\.{0,1}\d+$/;
	return (RE.test(input));
}



module.exports = {
    isEmptyObject,
    isEmptyVar,
    isValidEmail,
    isValidPhone,
    isValidPassword,
    isValidObjectId,
    isValidDateFormat,
    isValidDate,
    isEmptyFile,
    acceptFileType,
    isValidJSONstr,
    isPincodeValid,
    checkArrContent,
    isValidprice,
    numberValue,
    strRegex,
    booleanValue,
    isValid,
    isValidRequestBody,
    isValidSize,
    isValidString,
    isValidPrice,
    isValidObjectsId,
    validQuantity,
    IsNumeric
}