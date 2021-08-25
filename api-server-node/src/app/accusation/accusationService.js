const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const accusationProvider = require("./accusationProvider");
const accusationDao = require("./accusationDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

exports.accusationProduct = async function (productTitle,title, content) {
    const connection = await pool.getConnection(async (conn) => conn);
    connection.beginTransaction();

        try {

            const accusationProductResult = await accusationDao.insertAccusationProduct(connection, productTitle, title, content);
            connection.commit();





        } catch (err) {
            logger.error(`App - accusationProduct Service error, rollback\n: ${err.message}`);
            connection.rollback();
            return errResponse(baseResponse.DB_ERROR);
        }
        finally {
            const accusationInfoRows = await accusationProvider.accusationCheck(productTitle);
            connection.release();
            return response(baseResponse.SUCCESS, accusationInfoRows);
        }

};

exports.accusationUser = async function (userID,title, content) {
    const connection = await pool.getConnection(async (conn) => conn);
    connection.beginTransaction();
    {
        try {
            const accusationProductResult = await accusationDao.insertAccusationUser(connection, userID, title, content);
            connection.commit();


        } catch (err) {
            logger.error(`App - accusationProduct Service error, rollback\n: ${err.message}`);
            connection.rollback();
            return errResponse(baseResponse.DB_ERROR);
        }
        finally {
            const accusationInfoRows = await accusationProvider.accusationCheck(userID);
            connection.release();
            return response(baseResponse.SUCCESS, accusationInfoRows);
        }
    };
};