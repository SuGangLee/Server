const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");

// Provider: Read 비즈니스 로직 처리

exports.retrieveUserList = async function (nickname) {
  if (!nickname) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUser(connection);
    connection.release();

    return userListResult;
  }
  else {const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUsernickname(connection, nickname);
    connection.release();

    return userListResult;

  }
};


exports.retrieveUser = async function (nickname) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userResult = await userDao.selectUsernickname(connection, nickname);

  connection.release();

  return userResult;
};

exports.retrieveUserID = async function (userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userIDResult = await userDao.selectUserID(connection,userID);

  connection.release();

  return userIDResult;
};

exports.emailCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const emailCheckResult = await userDao.selectUserEmail(connection, email);
  connection.release();

  return emailCheckResult;
};

exports.passwordCheck = async function (selectUserPasswordParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const passwordCheckResult = await userDao.selectUserPassword(
      connection,
      selectUserPasswordParams
  );

  connection.release();
  return passwordCheckResult;
};

exports.accountCheck = async function (userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectUserAccount(connection, userID);
  connection.release();

  return userAccountResult;
};

exports.accountCheckEmail = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectUserAccountEmail(connection, email);
  connection.release();

  return userAccountResult;
};

//제품명 검색
exports.retrieveProductList = async function (title) {
  if (title) {
    const connection = await pool.getConnection(async (conn) => conn);
    const ProductListByTitle = await userDao.selectProductTitle(connection,title);
    connection.release();

    return ProductListByTitle;
  }
  else {const connection = await pool.getConnection(async (conn) => conn);
    const ProductListResult = await userDao.selectProduct(connection);
    connection.release();

    return ProductListResult;

  }
};

//유저의 판매중인 상품 조회
exports.retrieveProductByID = async function (userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const sellingResult = await userDao.selectProductByID(connection, userID);

  connection.release();

  return sellingResult;
};



//공지사항 조회
exports.retrieveNotice = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  const noticeResult = await userDao.selectNotice(connection);

  connection.release();

  return noticeResult;
};

//특정유저의 채팅방 조회
exports.retrieveUserByChat = async function (userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const chatResult = await userDao.selectUserChat(connection,userID);

  connection.release();

  return chatResult;
};

exports.retrieveCategory = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  const categoryResult = await userDao.selectCategory(connection);

  connection.release();

  return categoryResult;
};

//제품 추가
exports.insertProduct = async function (insertProductParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const productResult = await userDao.insertProduct(connection,insertProductParams);
  connection.release();

  return productResult;
};

//카테고리명에 해당하는 제품리스트 조회
exports.ProductsByCategory = async function (categoryName)
{
  const connection = await pool.getConnection(async (conn) => conn);
  const productResult = await userDao.selectProductByCategory(connection, categoryName);

  connection.release();

  return productResult;
};

//동네생활게시판 조회
exports.listByBoard = async function (userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const boardResult = await userDao.selectBoard(connection,userID);
  connection.release();

  return boardResult;
}

//동네생활게시판 게시글 조회
exports.detailByBoard = async function (boardID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const detailBoardResult = await userDao.selectDetailBoard(connection,boardID);
  connection.release();

  return detailBoardResult;
}
//숨긴 상품 조회
//동네생활게시판 게시글 조회
exports.getHideProduct = async function (userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const hideProductResult = await userDao.selectHideProduct(connection,userID);
  connection.release();

  return hideProductResult;
}
// 상품명 체크
exports.productTitleCheck = async function (connection,title) {

  const productTitleCheckResult = await userDao.selectProductTitle(connection,title);
  connection.release();

  return productTitleCheckResult;
};

//관심상품조회
exports.getLikedProduct = async function (userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const likedProductResult = await userDao.selectLikedProduct(connection,userID);
  connection.release();

  return likedProductResult;
}



