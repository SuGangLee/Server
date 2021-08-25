const jwtMiddleware = require("../../../config/jwtMiddleware");
const accusationProvider = require("../../app/accusation/accusationProvider");
const accusationService = require("../../app/accusation/accusationService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");

const {emit} = require("nodemon");

/**
 * API No.17
 * API Name : 상품 신고하기
 * [POST] /app/accusation/product
 */
exports.postAccusationProduct  = async function (req, res) {

    /**
     * query String : productTitle  // body :  , accusation.Title, content
     */

    const productTitle= req.query.productTitle;
    const title =req.body.title;
    const content = req.body.content;

    if (!productTitle) {return res.send(errResponse(baseResponse.ACCUSATION_PRODUCTTITLE));}
    else if (!title)  {return res.send(errResponse(baseResponse.ACCUSATION_EMPTY_TITLE));}
    else if(!content) {return res.send(errResponse(baseResponse.ACCUSATION_EMPTY_CONTENT));}

    else {
        const productAccusation = await accusationService.accusationProduct(productTitle, title, content);
        return res.send(productAccusation);
    }
};

/**
 * API No.18
 * API Name : 상품 판매자 신고하기
 * [POST] /app/accusation/user
 */
exports.postAccusationUser  = async function (req, res) {

    /**
     * query String : userID
     */

    /**
     * body :   accusation.Title, content
     */
    const userID= req.query.userID;
    const {title,content}=req.body;

    if (!userID) {return res.send(errResponse(baseResponse.ACCUSATION_USER));}
    else if (!title)  {return res.send(errResponse(baseResponse.ACCUSATION_EMPTY_TITLE));}
    else if(!content) {return res.send(errResponse(baseResponse.ACCUSATION_EMPTY_CONTENT));}

    else {
            const userAccusation = await accusationService.accusationUser(userID, title, content);
            return res.send(userAccusation);
    }
};