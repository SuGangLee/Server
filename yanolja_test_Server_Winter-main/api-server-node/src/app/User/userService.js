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

exports.createUser = async function (email, password, nickname,phone) {
    try {
        // 이메일 중복 확인
        const emailRows = await userProvider.emailCheck(email);

        if (emailRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);

        //닉네임 중복확인
        const nicknameRows = await userProvider.nicknameCheck(nickname);

        if (nicknameRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);

        // 비밀번호 암호화
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");

        const insertUserInfoParams = [email, hashedPassword, nickname,phone];

        const connection = await pool.getConnection(async (conn) => conn);

        const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams);

        console.log(`추가된 회원 : ${userIdResult[0].insertId}`)
        connection.release();

        const insertedUser = await userDao.selectUser(connection);
        connection.release();

        let token = await jwt.sign(
            {
                userId: insertedUser[insertedUser.length -1].idx,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, {"추가된 회원": insertedUser[insertedUser.length -1].email, "닉네임" : insertedUser[insertedUser.length -1].nickname,
            'jwt': token });


    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


// TODO: After 로그인 인증 방법 (JWT)
exports.postSignIn = async function (email, password) {
    try {
        // 이메일 여부 확인
        const emailRows = await userProvider.emailCheck(email);
        if (emailRows.length < 1) return errResponse(baseResponse.SIGNIN_EMAIL_WRONG);

        const selectEmail = emailRows[0].email

        // 비밀번호 확인
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");

        const selectUserPasswordParams = [selectEmail, hashedPassword];
        const passwordRows = await userProvider.passwordCheck(selectUserPasswordParams);

        if (passwordRows[0].password !== hashedPassword) {
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
        }

        // 계정 상태 확인
        const userInfoRows = await userProvider.accountCheck(email);

        if (userInfoRows[0].status === "INACTIVE") {
            return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        } else if (userInfoRows[0].status === "DELETED") {
            return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        }

        console.log(userInfoRows[0].idx) // DB의 userId

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userId: userInfoRows[0].idx,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, {'userId': userInfoRows[0].email, 'jwt': token});

    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editUser = async function (id, nickname) {
    try {
        console.log(id)
        const connection = await pool.getConnection(async (conn) => conn);
        const editUserResult = await userDao.updateUserInfo(connection, id, nickname)
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


exports.insertLiked = async function (userId, brandID) {
    try {

        const connection = await pool.getConnection(async (conn) => conn);
        const insertLikedResult = await userDao.insertLiked(connection, userId, brandID)
        connection.release();

        return response(baseResponse.SUCCESS,{'찜하기 성공':insertLikedResult[0]});

    } catch (err) {
        logger.error(`App - insertLiked Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.insertCart = async function (userId,brandName,roomType,startDate, endDate) {
    try {

        const connection = await pool.getConnection(async (conn) => conn);
        params = [userId,brandName,roomType,startDate, endDate];
        const insertCartResult = await userDao.insertCart(connection, params)
        connection.release();

        return response(baseResponse.SUCCESS,insertCartResult[0]);

    } catch (err) {
        logger.error(`App - insertCart Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.passwordCheck = async function (userId, password) {
    try {


        // 비밀번호 확인
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");

        const selectUserPasswordParams = [userId, hashedPassword];
        const passwordRows = await userProvider.passwordCheckAPI(selectUserPasswordParams);

       if  (passwordRows.length==0 )  return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);


        return response(baseResponse.PASSWORD_CHECK_SUCCESS);//비밀번호인증성공

    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editNickname = async function (userId, nickname) {
    try {
        //닉네임 중복확인
        const nicknameRows = await userProvider.nicknameCheck(nickname);

        if (nicknameRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);

        const connection = await pool.getConnection(async (conn) => conn);
        const editNicknameResult = await userDao.updateNickname(connection, nickname, userId)
        connection.release();

        return response(baseResponse.NICKNAME_CHANGE_SUCCESS,{'변경된닉네임:':editNicknameResult});

    } catch (err) {
        logger.error(`App - editNickname Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editPassword= async function (userId, password,checkPassword1,checkPassword2) {
    try {
        // 비밀번호 확인
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");

        const selectUserPasswordParams = [userId, hashedPassword];
        const passwordRows = await userProvider.passwordCheckAPI(selectUserPasswordParams);

        if (passwordRows[0].password !== hashedPassword) {
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG); //3004 비밀번호가잘못되었습니다.
        }

        if (checkPassword1 != checkPassword2)
            return errResponse(baseResponse.CHANGE_PASSWORD_WRONG); // 1006, 새 비밀번호가 맞지 않습니다.

        const hashedNewPassword = await crypto
            .createHash("sha512")
            .update(checkPassword2)
            .digest("hex");

        const connection = await pool.getConnection(async (conn) => conn);
        const editPasswordResult = await userDao.updatePassword(connection, hashedNewPassword,userId)
        connection.release();

        return response(baseResponse.PASSWORD_CHANGE_SUCCESS);

    } catch (err) {
        logger.error(`App - editPasword Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};
exports.editPhone = async function (userId, phone) {
    try {


        const connection = await pool.getConnection(async (conn) => conn);
        const editPhoneResult = await userDao.updatePhone(connection, phone,userId)
        connection.release();

        return response(baseResponse.PHONE_CHANGE_SUCCESS,{'변경된 번호:':editPhoneResult});

    } catch (err) {
        logger.error(`App - editPHONE Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 회원 탈퇴
exports.outUser= async function (userId,reason) {
    try {


        const connection = await pool.getConnection(async (conn) => conn);
        const outResult = await userDao.outUser(connection,userId,reason);
        connection.release();

        return response(baseResponse.USER_SING_OUT_SUCCESS);

    } catch (err) {
        logger.error(`App - editPHONE Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 이메일 체크
// 회원 탈퇴
exports.emailCheck= async function (email) {
    try {
        // 이메일 여부 확인

        const emailRows = await userProvider.emailCheck(email);
        if (emailRows.length > 0  )
            return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);//3001 중복된이메일


        return response(baseResponse.SIGNIN_EMAIL_POSSIBLE); //2100 사용가능한 이메일

    } catch (err) {
        logger.error(`App - emailCheck Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};