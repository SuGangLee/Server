const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const accusationDao = require("./accusationDao");


//신고조회
exports.accusationCheck = async function (accusationed) {
    const connection = await pool.getConnection(async (conn) => conn);
    const accusationResult = await accusationDao.selectAccusation(connection,accusationed);
    connection.release();

    return accusationResult;
};