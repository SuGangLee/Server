const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createUser = async function (email, password, nickname, phone) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        // 이메일 중복 확인
        const emailRows = await userProvider.emailCheck(email);

        if (emailRows)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);

        // 비밀번호 암호화
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");

        const insertUserInfoParams = [email, hashedPassword, nickname , phone];



        const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams);
        console.log('추가된 회원 : ${userIdResult[0].insertId}')
        connection.commit();
        return response(baseResponse.SUCCESS);


    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        await connection.rollback();
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
};


// TODO: After 로그인 인증 방법 (JWT)
exports.postSignIn = async function (email, password) {
    try {

        // 이메일 여부 확인
        const emailRows = await userProvider.emailCheck(email);

        if (!emailRows) return errResponse(baseResponse.SIGNIN_EMAIL_WRONG);

        const selectEmail = emailRows.email;

        // 비밀번호 확인

        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");

        const selectUserPasswordParams = [selectEmail, hashedPassword];
        const [passwordRows] = await userProvider.passwordCheck(selectUserPasswordParams);


        if (passwordRows[0].password !== hashedPassword) {
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
        }

        // 계정 상태 확인
        const userInfoRows = await userProvider.accountCheckEmail(selectEmail);
        // OK
console.log(userInfoRows);

        if (userInfoRows[0].status === "INACTIVE") {
            return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        } else if (userInfoRows[0].status === "DELETED") {
            return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        }

///////OK

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userID: userInfoRows[0].userID,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "user",
            } // 유효 기간 365일
        );

        //// OK

        return response(baseResponse.SUCCESS, {'userID': userInfoRows[0].userID, 'jwt': token});
        await connection.commit();

    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);

        return errResponse(baseResponse.DB_ERROR);
    }

};

exports.editUser = async function (userID, nickname) {
    try {

        const connection = await pool.getConnection(async (conn) => conn);
        const editUserResult = await userDao.updateUserInfo(connection, userID, nickname);

        connection.release();



    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        const userInfoRows = await userProvider.accountCheck(userID);
        return response(baseResponse.SUCCESS,{'변경된 닉네임' : userInfoRows[0].nickname, 'userID' : userInfoRows[0].userID} );
    }
}

exports.addProduct = async function ( productID, userID, title, price, content,  imgURL) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {

        const insertProductParams = [productID, userID, title, price, content];
        const insertProductImagesParams = [productID, imgURL];


            const addProductResult = await userDao.insertProduct(connection, insertProductParams);
            connection.release();
        const addProductImageResult = await userDao.insertProductImages(connection,insertProductImagesParams);
        connection.release();


        } catch (err) {
            logger.error(`App - editProduct Service error\n: ${err.message}`);
            return errResponse(baseResponse.DB_ERROR);
        }
finally {
        productInfoRow =await userDao.selectProduct(connection);
        connection.release();
        return response(baseResponse.SUCCESS, { 'added product' : productInfoRow[productInfoRow.length-1]});
    }


};





//회원탈퇴
exports.deleteUser = async function (userID) {
    try {



        // 계정 상태 확인
        const userInfoRows = await userProvider.accountCheck(userID);
        // OK
console.log(userInfoRows);
        const connection = await pool.getConnection(async (conn) => conn);
        const deleteUserResult = await userDao.deleteUserInfo(connection, userID);

        connection.release();



    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        const userInfoRows = await userProvider.accountCheck(userID);
        return response(baseResponse.SUCCESS,{'status' : userInfoRows[0].status, 'userID' : userInfoRows[0].userID} );
    }
}

exports.modifyProduct = async function (userID,title,content)
{
    try {

        const connection = await pool.getConnection(async (conn) => conn);
        const updateProductResult = await userDao.updateProduct(connection, content,title,userID);

        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.pullingProduct = async function (title)
{
    try {

        const connection = await pool.getConnection(async (conn) => conn);
        const pullingProductResult = await userDao.pullingProduct(connection, title);

        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};
//게시글 작성
exports.addByBoard = async function (topic, content, userID) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {

        const insertBoardParams = [topic, content, userID];

        const addBoardResult = await userDao.insertBoard(connection, insertBoardParams);
        connection.release();

    } catch (err) {
        logger.error(`App - editProduct Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        const boardResult = await userDao.selectBoard(connection,userID);
        connection.release();

        return response(baseResponse.SUCCESS, { 'added Board' :boardResult[boardResult.length-1]});
    }
};

//게시글 댓글 작성
exports.addComment = async function (boardID, content, userID) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        const boardResult = await userDao.selectDetailBoard(connection,boardID);
        connection.release();
        const contentID = boardResult[0].topic
        const insertCommentParams = [contentID, content, userID];

        const addBoardResult = await userDao.insertComment(connection, insertCommentParams);
        connection.release();

    } catch (err) {
        logger.error(`App - editProduct Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        const boardResult = await userDao.selectDetailBoard(connection,boardID);
        connection.release();
        return response(baseResponse.SUCCESS, { 'added Comment' :boardResult[0].댓글내용});
    }
};

exports.patchProductStatus  = async function (title,userID)
{
    const connection = await pool.getConnection(async (conn) => conn);
    const titleResult = await userProvider.productTitleCheck(connection,title);

    try {

        if (titleResult.length ==0 ) return errResponse(baseResponse.PRODUCT_TITLE_WRONG);
       else {
            const patchProductStatusResult = await userDao.updateProductStatus(connection, title, userID);
            connection.release();
            return response(baseResponse.SUCCESS,{"modified Status Product" : titleResult});
        }


    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }


};