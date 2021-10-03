const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const bookingProvider = require("./bookingProvider");
const bookingDao = require("./bookingDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");
//숙박 예약하기
exports.AccBooking = async function (userId,startDate, endDate, brandName,roomType,isWalk,memName,userName,userPhone,payKind) {
    try {
        params = [userId, brandName, roomType, startDate, endDate, isWalk, memName, userName, userPhone, payKind]

        const connection = await pool.getConnection(async (conn) => conn);
        const booking = await bookingDao.AccBooking(connection, params);
        connection.release();
        //const cost = await
        // userDao.selectCost(connection)

        if (! booking[0][0].notice ) return response(baseResponse.SUCCESS,booking[0]);
        else  return  errResponse(baseResponse.BOOKING_END); //7099
    }   catch (err){
        logger.error(`App - booking Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.payment = async function (bookedNum,point,userIdFromJWT)
{
    try{
        const connection = await pool.getConnection(async (conn) => conn);

        const payment= await bookingDao.payment(connection, bookedNum,point,userIdFromJWT);
        connection.release();


        const productInfo = await bookingDao.productInfo(connection,bookedNum,userIdFromJWT);
        connection.release();


        const memInfo = await bookingDao.memInfo(connection,bookedNum);
        connection.release();

        const userInfo = await bookingDao.userInfo(connection,bookedNum);
        connection.release();

        const costInfo = await bookingDao.costInfo(connection,bookedNum,userIdFromJWT);
        connection.release();
console.log(payment[0][0].공지)
        if (!payment[0][0].공지  )  return response(baseResponse.SUCCESS,{'결과':payment[0], '상품 및 이용정보:':productInfo[0],'예약자 정보':memInfo[0],
            '이용자 정보' : userInfo[0], '금액 및 할인 정보': costInfo[0]});


        else  return  errResponse(baseResponse.PAY_ERROR); //7100
    }
    catch (err) {
        logger.error(`App - payment Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}


exports.cancelResult = async function (userId, bookedNum, reason)
{
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        await connection.beginTransaction();

        const payment= await bookingDao.cancelPayment(connection, bookedNum,userId);
        connection.release();

        const cancelProcedure = await bookingDao.cancelProcedure(connection,userId, bookedNum, reason);
        connection.release();
        await connection.commit();
        return response(baseResponse.SUCCESS,{'취소완료':payment});
    }
    catch (err) {
        logger.error(`App -cancelResult Service error\n: ${err.message}`);
        await connection.rollback();
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
}
