const jwtMiddleware = require("../../../config/jwtMiddleware");
const bookingProvider = require("../../app/Booking/bookingProvider");
const bookingService = require("../../app/Booking/bookingService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");


/**
 * API Name : 예약하기
 * [GET] /app/users/liked-list
 */
exports.postAccBooking = async function (req, res) {

    /**
     * header : x-access-token
     */
    const userIdFromJWT = req.verifiedToken.userId
    const startDate=req.body.startDate;
    const endDate=req.body.endDate;
    const brandName=req.body.brandName;
    const roomType=req.body.roomType;
    const isWalk=req.body.isWalk;
    const memName =req.body.memName;
    const userName = req.body.userName;
    const userPhone = req.body.userPhone;
    const payKind = req.body.payKind;


    if (!startDate) return res.send(errResponse(baseResponse.PRODUCT_START_DATE_EMPTY)); //6003, 날짜입력
    if (!endDate) return res.send(errResponse(baseResponse.PRODUCT_END_DATE_EMPTY)); //6004, 날짜입력
    if (!userIdFromJWT) return res.send(errResponse(baseResponse.TOKEN_EMPTY)); //2000, 토큰을 입력해주세요
    if (!brandName) return res.send(errResponse(baseResponse.BOOK_BRAND_NAME_EMPTY)); //7001 , 숙소명을 입력하세요
    if (!roomType) return res.send(errResponse(baseResponse.BOOK_ROOMTYPE_EMPTY)); //7002 , 방 타입을 입력하세요
    if (!isWalk) return res.send(errResponse(baseResponse.BOOK_VISIT_EMPTY)); //7003 , 숙소방문수단을 입력하세요 (도보 or 차량)
    if (!memName) return res.send(errResponse(baseResponse.BOOK_MEMBER_NAME_EMPTY)); //7004 ,  예약자 이름을 입력하세요
    if (!userName) return res.send(errResponse(baseResponse.BOOK_USER_NAME_EMPTY)); //7005 , 이용자 이름을 입력하세요
    if (!userPhone) return res.send(errResponse(baseResponse.BOOK_USER_PHONE_EMPTY)); //7006 , 이용자 번호를 입력하세요
    if (!payKind) return res.send(errResponse(baseResponse.BOOK_PAY_KIND_EMPTY)); //7007 , 결제수단을 입력하세요


    const booking = await bookingService.AccBooking(userIdFromJWT,startDate, endDate, brandName,roomType,isWalk,memName,userName,userPhone,payKind );
    return res.send(booking);
};

exports.postPayment =async function (req, res)
{
   const bookedNum = req.query.bookedNum;
   let point= req.query.point ;
    const userIdFromJWT = req.verifiedToken.userId;

    if (!userIdFromJWT) return res.send(errResponse(baseResponse.TOKEN_EMPTY)); //2000, 토큰을 입력해주세요
    if (!bookedNum)  return res.send(errResponse(baseResponse.BOOK_ID_EMPTY)); //7008 예약번호를 입력하세요
    if (!point) point=0;

    const pay= await bookingService.payment(bookedNum,point,userIdFromJWT);
    return res.send(pay);

};

exports.getBookInfo =async function (req, res)
{
    const bookedNum = req.query.bookedNum;
    const userIdFromJWT = req.verifiedToken.userId;

    if (!userIdFromJWT) return res.send(errResponse(baseResponse.TOKEN_EMPTY)); //2000, 토큰을 입력해주세요
    if (!bookedNum)  return res.send(errResponse(baseResponse.BOOK_ID_EMPTY)); //7008 예약번호를 입력하세요

    const bookInfo= await bookingProvider.bookInfo(bookedNum,userIdFromJWT);
    return res.send(response(baseResponse.SUCCESS,bookInfo));

};

exports.getReceipt =async function (req, res)
{
    const bookedNum = req.query.bookedNum;
    const userIdFromJWT = req.verifiedToken.userId;

    if (!userIdFromJWT) return res.send(errResponse(baseResponse.TOKEN_EMPTY)); //2000, 토큰을 입력해주세요
    if (!bookedNum)  return res.send(errResponse(baseResponse.BOOK_ID_EMPTY)); //7008 예약번호를 입력하세요

    const receiptResult= await bookingProvider.selectReceipt(bookedNum,userIdFromJWT);
    return res.send(response(baseResponse.SUCCESS,receiptResult));

};

exports.postCancel =async function (req, res)
{
    const bookedNum = req.query.bookedNum;
    const userIdFromJWT = req.verifiedToken.userId;
    const reason = req.body.reason ;

    if (!userIdFromJWT) return res.send(errResponse(baseResponse.TOKEN_EMPTY)); //2000, 토큰을 입력해주세요
    if (!bookedNum)  return res.send(errResponse(baseResponse.BOOK_ID_EMPTY)); //7008 예약번호를 입력하세요
    if(!reason)  return res.send(errResponse(baseResponse.BOOK_CANCEL_EMPTY)); //7009 취소사유를 입력하세요

    const cancelResult= await bookingService.cancelResult(userIdFromJWT, bookedNum, reason);
    return res.send(cancelResult);

};