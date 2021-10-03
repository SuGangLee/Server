const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const bookingDao = require("./bookingDao");

exports.bookInfo = async function (bookedNum,userId)
{
    try{
        const connection = await pool.getConnection(async (conn) => conn);

        const productInfo = await bookingDao.productInfo(connection,bookedNum,userId);
        connection.release();

        const memInfo = await bookingDao.memInfo(connection,bookedNum,userId);
        connection.release();

        const userInfo = await bookingDao.userInfo(connection,bookedNum,userId);
        connection.release();

        const costInfo = await bookingDao.costInfo(connection,bookedNum,userId);
        connection.release();

        return {'예약번호': bookedNum,'상품 및 이용정보:':productInfo[0],'예약자 정보':memInfo[0],
            '이용자 정보' : userInfo[0], '금액 및 할인 정보': costInfo[0]};
    }
    catch (err) {
        logger.error(`App - bookInfo Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}


exports.selectReceipt = async function (bookedNum,userIdFromJWT)
{
    try{
        const connection = await pool.getConnection(async (conn) => conn);

        const getReceiptResult = await bookingDao.selectReceipt(connection,bookedNum,userIdFromJWT);
        connection.release();

        return getReceiptResult;
    }
    catch (err) {
        logger.error(`App - bookInfo Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}
