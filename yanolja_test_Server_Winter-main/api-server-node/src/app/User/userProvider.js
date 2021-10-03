const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");

// Provider: Read 비즈니스 로직 처리

exports.retrieveUserList = async function (email) {
  if (!email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUser(connection);
    connection.release();

    return userListResult;

  } else {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUserEmail(connection, email);
    connection.release();

    return userListResult;
  }
};

exports.retrieveUser = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userResult = await userDao.selectUserId(connection, userId);

  connection.release();

  return userResult[0];
};

exports.retrieveUserID = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userResult = await userDao.selectUserPage(connection, userId);

  connection.release();

  return userResult[0];
};

exports.emailCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const emailCheckResult = await userDao.selectUserEmail(connection, email);
  connection.release();

  return emailCheckResult;
};

exports.nicknameCheck = async function (nickname) {
  const connection = await pool.getConnection(async (conn) => conn);
  const nicknameCheckResult = await userDao.selectUserNickname(connection, nickname);
  connection.release();

  return nicknameCheckResult;
};

exports.passwordCheck = async function (selectUserPasswordParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const passwordCheckResult = await userDao.selectUserPassword(
      connection,
      selectUserPasswordParams
  );
  connection.release();
  return passwordCheckResult[0];
};

exports.passwordCheckAPI = async function (selectUserPasswordParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const passwordCheckResult = await userDao.selectUserPasswordCheck(connection,selectUserPasswordParams
  );
  connection.release();
  console.log(passwordCheckResult);
  return passwordCheckResult;
};

exports.accountCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectUserAccount(connection, email);
  connection.release();

  return userAccountResult;
};

exports.getPhone = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const Result = await userDao.selectUserPhone(connection, userId);
  connection.release();

  return Result;
};

//찜목록 조회
exports.LikedList = async function (userId,startDate,endDate,member) {

  const params = [startDate,endDate,startDate,endDate,startDate,startDate,startDate,startDate,startDate,startDate,member,userId]

  const connection = await pool.getConnection(async (conn) => conn);
  const likeListResult = await userDao.selectLikedList(connection, params);
  connection.release();

  return likeListResult;
};

// 내 쿠폰함 조회
exports.couponList = async function (userId) {

  const connection = await pool.getConnection(async (conn) => conn);
  let couponListResult = await userDao.couponList(connection, userId);
  connection.release();

  return couponListResult;
};

//장바구니 목록조회
exports.cartList = async function (userId) {

  const connection = await pool.getConnection(async (conn) => conn);
  const cartListResult = await userDao.selectCartList(connection, userId);
  connection.release();

  return cartListResult;
};

exports.getEmail = async function (userId) {

  const connection = await pool.getConnection(async (conn) => conn);
  const Result = await userDao.getEmail(connection, userId);
  connection.release();

  return Result;
};

