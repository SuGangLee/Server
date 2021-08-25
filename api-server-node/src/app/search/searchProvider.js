const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const searchDao = require("./searchDao");

exports.retrieveSearchListTitle = async function (title) {

        const connection = await pool.getConnection(async (conn) => conn);
        const searchListResult = await searchDao.selectSearchTitle(connection,title);
        connection.release();

        return searchListResult;
    }

exports.retrieveSearchListNickname = async function (nickname) {

    const connection = await pool.getConnection(async (conn) => conn);
    const searchListResult = await searchDao.selectSearchNickname(connection,nickname);
    connection.release();

    return searchListResult;
}

exports.retrievePopularList= async function () {

    const connection = await pool.getConnection(async (conn) => conn);
    const popularListResult = await searchDao.selectPopular(connection);
    connection.release();

    return popularListResult;
}

exports.retrieveSearchListBoard = async function (content) {

    const connection = await pool.getConnection(async (conn) => conn);
    const searchListResult = await searchDao.selectSearchBoard(connection,content);
    connection.release();

    return searchListResult;
}