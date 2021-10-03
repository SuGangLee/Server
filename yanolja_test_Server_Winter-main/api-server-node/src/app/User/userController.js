const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const jwt = require('jsonwebtoken');
const secret_config = require('../../../config/secret');
const regexEmail = require("regex-email");
const {emit} = require("nodemon");
const { Console } = require("winston/lib/winston/transports");
const {logger} = require("../../../config/winston");
const passport = require('passport');
const axios = require('axios');
const CryptoJS = require("crypto-js");
const Cache = require('memory-cache');
/**
 * API No. 1
 * API Name : 유저 생성 (회원가입) API
 * [POST] /app/users
 */
exports.postUsers = async function (req, res) {

    /**
     * Body: email, password, nickname
     */
    const {email, password, nickname,phone} = req.body;

    // 빈 값 체크
    if (!email)
        return res.send(response(baseResponse.SIGNUP_EMAIL_EMPTY));

    // 길이 체크
    if (email.length > 30)
        return res.send(response(baseResponse.SIGNUP_EMAIL_LENGTH));

    // 형식 체크 (by 정규표현식)
    if (!regexEmail.test(email))
        return res.send(response(baseResponse.SIGNUP_EMAIL_ERROR_TYPE));

    if (!password)
        return res.send(response(baseResponse.SIGNUP_PASSWORD_EMPTY));
    if (password.length > 20 || password.length < 6)
        return res.send(response(baseResponse.SIGNUP_PASSWORD_LENGTH));
    if (!nickname)
        return res.send(response(baseResponse.SIGNUP_NICKNAME_EMPTY));
    if (nickname.length > 20 )
        return res.send(response(baseResponse.SIGNUP_NICKNAME_LENGTH));
    if (!phone)
        return res.send(response(baseResponse.SIGNUP_PHONE_EMPTY));

    // 기타 등등 - 추가하기


    const signUpResponse = await userService.createUser(
        email,
        password,
        nickname,
        phone
    );

    return res.send(signUpResponse);
};

/**
 * API No. 2
 * API Name : 유저 조회 API
 * [GET] /app/users/my-yanolja
 */
exports.getUsers = async function (req, res) {

    /**
     * header : jwt 토큰
     */

    const userIdFromJWT = req.verifiedToken.userId;

    if (!userIdFromJWT) return res.send(errResponse(baseResponse.TOKEN_EMPTY)); //2000, 토큰을 입력해주세요

    const myPage = await userProvider.retrieveUserID(userIdFromJWT);
    return res.send(response(baseResponse.SUCCESS,myPage));


    const email = req.query.email;

    if (!email) {
        // 유저 전체 조회
        const userListResult = await userProvider.retrieveUserList();
        return res.send(response(baseResponse.SUCCESS, userListResult));
    } else {
        // 유저 검색 조회
        const userListByEmail = await userProvider.retrieveUserList(email);
        return res.send(response(baseResponse.SUCCESS, userListByEmail));
    }
};
/**
 * API No. 2
 * API Name : 마이야놀자 조회 API
 * [GET] /app/users/my-yanolja
 */
exports.getMyPage = async function (req, res) {

    /**
     * header : jwt 토큰
     */

    const userIdFromJWT = req.verifiedToken.userId;

    if (!userIdFromJWT) return res.send(errResponse(baseResponse.TOKEN_EMPTY)); //2000, 토큰을 입력해주세요

    const myPage = await userProvider.retrieveUserID(userIdFromJWT);
    return res.send(response(baseResponse.SUCCESS,myPage));


};
/**
 * API No. 3
 * API Name : 특정 유저 조회 API
 * [GET] /app/users/{userId}
 */
exports.getUserById = async function (req, res) {

    /**
     * Path Variable: userId
     */
    const userId = req.params.userId;

    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    const userByUserId = await userProvider.retrieveUser(userId);
    return res.send(response(baseResponse.SUCCESS, userByUserId));
};

// TODO: After 로그인 인증 방법 (JWT)
/**
 * API No. 4
 * API Name : 로그인 API
 * [POST] /app/login
 * body : email, passsword
 */
exports.login = async function (req, res) {

    const {email, password} = req.body;

    // TODO: email, password 형식적 Validation
    if (!password)
        return res.send(response(baseResponse.SIGNIN_PASSWORD_EMPTY));
    if (!email)
        return res.send(response(baseResponse.SIGNIN_EMAIL_EMPTY));
    if (email.length >30)
        return res.send(response(baseResponse.SIGNIN_EMAIL_LENGTH));
    if (!regexEmail.test(email))
        return res.send(response(baseResponse.SIGNIN_EMAIL_ERROR_TYPE));

    const signInResponse = await userService.postSignIn(email, password);

    return res.send(signInResponse);
};


/**
 * API No. 5
 * API Name : 회원 정보 수정 API + JWT + Validation
 * [PATCH] /app/users/modify
 * path variable : userId
 * body : nickname
 */
exports.patchUsers = async function (req, res) {

    // jwt - userId, path variable :userId

    const userIdFromJWT = req.verifiedToken.userId

    const userId = req.params.userId;
    const nickname = req.body.nickname;
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    const checkPassword = req.body.checkPassword;
    const phone = req.body.phone;

    if (!userIdFromJWT) {return res.send(errResponse(baseResponse.TOKEN_EMPTY)); }


    if (nickname) {
        if (nickname.length < 2 || nickname.length >8 )
            return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_LENGTH));
        const editNickname = await userService.editNickname(userIdFromJWT,nickname);
    }
    if ((newPassword && !checkPassword) || (newPassword && !checkPassword))
        return res.send(errResponse(baseResponse.CHECK_PASSWORD_EMPTY)); //1007, 비밀번호확인을 진행해주세요

    if(newPassword && checkPassword) {
        if (newPassword.length <8 || newPassword.length >20 || checkPassword.length <8 || checkPassword.length >20)
            return res.send(errResponse(baseResponse.SIGNUP_PASSWORD_LENGTH));
        const editPassword =
            await userService.editPassword(userIdFromJWT,password,newPassword,checkPassword);
    }
    if (phone) {const editPhone = await userService.editPhone(userIdFromJWT,phone);}

    return res.send(response(baseResponse.PATCH_SUCCESS));

};


/**

 * API Name : 찜목록 조회
 * [GET] /app/users/liked-list
 */
exports.getLikedList = async function (req, res) {

    /**
     * header : x-access-token
     */
    const userIdFromJWT = req.verifiedToken.userId
    const startDate=req.query.startDate;
    const endDate=req.query.endDate;
    const member=req.query.member;

    if (!startDate) return res.send(errResponse(baseResponse.PRODUCT_START_DATE_EMPTY)); //6003, 날짜입력
    if (!endDate) return res.send(errResponse(baseResponse.PRODUCT_END_DATE_EMPTY)); //6004, 날짜입력
    if (!member) return res.send(errResponse(baseResponse.PRODUCT_MEMBER_EMPTY)); //6005, 기준인원입력
    if (!userIdFromJWT) return res.send(errResponse(baseResponse.TOKEN_EMPTY)); //2000, 토큰을 입력해주세요

    const likeList = await userProvider.LikedList(userIdFromJWT,startDate, endDate, member);
    return res.send(response(baseResponse.SUCCESS, likeList));
};

/**
 * API Name : 장바구니조회
 * [GET] /app/users/my-cart
 */
exports.getCart = async function (req, res) {

    /**
     * header : x-access-token
     */
    const userIdFromJWT = req.verifiedToken.userId

    if (!userIdFromJWT) return res.send(errResponse(baseResponse.TOKEN_EMPTY)); //2000, 토큰을 입력해주세요
    const cartLists = await userProvider.cartList(userIdFromJWT);

    return res.send(response(baseResponse.SUCCESS, cartLists));
};


/**
 * API Name : 쿠폰목록조회
 * [GET] /app/coupons
 */
exports.getCoupon = async function (req, res) {

    /**
     * header : x-access-token
     */
    const userIdFromJWT = req.verifiedToken.userId
    if (!userIdFromJWT) return res.send(errResponse(baseResponse.TOKEN_EMPTY)); //2000, 토큰을 입력해주세요
    const couponList = await userProvider.couponList(userIdFromJWT);

    return res.send(response(baseResponse.SUCCESS,couponList));
};

/**
 * API Name : 찜하기
 * [POST] /app/into-liked
 */
exports.postLiked = async function (req, res) {

    /**
     * header : x-access-token
     */
    const userIdFromJWT = req.verifiedToken.userId
    const brandID = req.query.brandID

    if(!brandID)  return res.send(errResponse(baseResponse.PRODUCT_ID_EMPTY)); // 6001 숙소 ID 입력필요
    if (!userIdFromJWT) return res.send(errResponse(baseResponse.TOKEN_EMPTY)); //2000, 토큰을 입력해주세요
    const insertLiked = await userService.insertLiked(userIdFromJWT,brandID);

    return res.send(response(baseResponse.SUCCESS));
};

/**
 * API Name : 장바구니담기
 * [POST] /app/into-cart
 */
exports.postCart = async function (req, res) {

    /**
     * header : x-access-token
     */
    const userIdFromJWT = req.verifiedToken.userId
    const brandName =req.body.brandName;
    const roomType =req.body.roomType;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    if (!userIdFromJWT) return res.send(errResponse(baseResponse.TOKEN_EMPTY)); //2000, 토큰을 입력해주세요
    if (!brandName) return res.send(errResponse(baseResponse.BOOK_BRAND_NAME_EMPTY)); //7001 , 숙소명을 입력하세요
    if (!roomType) return res.send(errResponse(baseResponse.BOOK_ROOMTYPE_EMPTY)); //7002 , 방 타입을 입력하세요
    if (!startDate) return res.send(errResponse(baseResponse.PRODUCT_START_DATE_EMPTY)); //6003, 날짜입력
    if (!endDate) return res.send(errResponse(baseResponse.PRODUCT_END_DATE_EMPTY)); //6004, 날짜입력

    const insertCart = await userService.insertCart( userIdFromJWT,brandName,roomType,startDate, endDate);

    return res.send(response(baseResponse.SUCCESS,insertCart ));
};

//비밀번호검증
exports.postPassword = async function (req, res) {
    const userIdFromJWT = req.verifiedToken.userId;
    const password = req.body.password;

    if (!userIdFromJWT) return res.send(errResponse(baseResponse.TOKEN_EMPTY)); //2000, 토큰을 입력해주세요
    if (!password)  return res.send(errResponse(baseResponse.SIGNIN_PASSWORD_EMPTY));//2011 비밀번호를 입력해주세요
    const passwordCheck =await userService.passwordCheck(userIdFromJWT,password);
    return res.send(passwordCheck); //1001 비밀번호인증성공
};

/** 회원탈퇴
 * [PATCH] /app/users/sign-out
 */
exports.outUser = async function (req, res) {
    const userIdFromJWT = req.verifiedToken.userId;
    const reason = req.body.reason ;
    if (!reason)  return res.send(errResponse(baseResponse.SIGNOUT_REASON_EMPTY)); //2500 탈퇴사유를 선택하세요
    if (!userIdFromJWT) return res.send(errResponse(baseResponse.TOKEN_EMPTY)); //2000, 토큰을 입력해주세요

    const result =await userService.outUser(userIdFromJWT,reason);
    return res.send(result); //1001 비밀번호인증성공
};

exports.emailCheck = async function (req, res) {
   const email=req.body.email;

    if(!email)  return res.send(errResponse(baseResponse.SIGNUP_EMAIL_EMPTY)); //2001 이메일을 입력해주세요.
   const checkResult = await userService.emailCheck(email);

    return res.send(checkResult);
};

exports.getPhone = async function (req, res) {

    const userIdFromJWT = req.verifiedToken.userId;
    if (!userIdFromJWT)  return res.send(errResponse(baseResponse.TOKEN_EMPTY));

    const result = await userProvider.getPhone(userIdFromJWT);
    return  res.send(response(baseResponse.SUCCESS,result ));

};


/** JWT 토큰 검증 API
 * [GET] /app/auto-login
 */
exports.check = async function (req, res) {
    const userIdResult = req.verifiedToken.userId;
    console.log(userIdResult);
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};

/**
 * API No. 23
 * API Name : 카카오 로그인 API
 * [POST] /app/users/kakao-login
 */
exports.kakaoLogin = async function (req, res){

    const {accessToken} = req.body; //값 확인을 위해 body로 token 값을 받아준다.
    if(!accessToken)
        return res.send(errResponse(baseResponse.ACCESS_TOKEN_EMPTY));

    try{
        let kakaoProfile; //값을 수정해주어야 하므로 const가 아닌 let 사용

        try{ //axios 모듈을 이용하여 Profile 정보를 가져온다.
            kakaoProfile = await axios.get('https://kapi.kakao.com/v2/user/me', {
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                }
            })
        } catch (err) {
            return res.send(errResponse(baseResponse.ACCESS_TOKEN_VERIFICATION_FAILURE));
        }
        const data = kakaoProfile.data.kakao_account;

        const name = data.profile.nickname;

        const email = data.email;

        const emailResult = await userProvider.emailCheck(email);

        if(emailResult){ //유저를 확인 후 알림메시지와 함께 jwt token을 생성하여 client에게 전송

            let token = await jwt.sign ({
                    userIdx : emailResult.userID
                },
                secret_config.jwtsecret,
                {
                    expiresIn : "365d",
                    subject : "userInfo",
                }
            );
            return res.send(response(baseResponse.SUCCESS, {'userIdx' : emailResult.userID, 'jwt' : token, 'message' : '소셜로그인 성공.'}));
        }
        else{
            const result = {
                name : name,
                email : email
            }
            return res.send(response(baseResponse.SUCCESS, {message : '회원가입이 가능 Email.', result}));
        }} catch (err){
        logger.error(`App - socialLogin Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

/**
 * API No. 49
 * API Name : 휴대폰 인증 번호 발송 API
 * Body : phoneNumber
 */
const NCP_serviceID = 'ncp:sms:kr:271232563809:winter';
const NCP_accessKey = '9WddEvPfh2JPBmJLFH6L';
const NCP_secretKey = 'IdjI3jtg3Hp8856nH9zByB4taX0DtfJFCYQqSqL4';
const date = Date.now().toString();
const uri = NCP_serviceID;
const secretKey = NCP_secretKey;
const accessKey = NCP_accessKey;
const method = 'POST';
const space = " ";
const newLine = "\n";
const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
const url2 = `/sms/v2/services/${uri}/messages`;

const  hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);

hmac.update(method);
hmac.update(space);
hmac.update(url2);
hmac.update(newLine);
hmac.update(date);
hmac.update(newLine);
hmac.update(accessKey);

const hash = hmac.finalize();
const signature = hash.toString(CryptoJS.enc.Base64);

exports.send = async function (req, res) {
    const phoneNumber = req.body.phoneNumber;

    if (!phoneNumber) return res.send(response(baseResponse.PHONE_NUMBER_EMPTY));

    Cache.del(phoneNumber);

    //인증번호 생성
    const verifyCode = Math.floor(Math.random() * (999999 - 100000)) + 100000;

    Cache.put(phoneNumber, verifyCode.toString());

    axios({
        method: method,
        json: true,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'x-ncp-iam-access-key': accessKey,
            'x-ncp-apigw-timestamp': date,
            'x-ncp-apigw-signature-v2': signature,
        },
        data: {
            type: 'SMS',
            contentType: 'COMM',
            countryCode: '82',
            from: '01024622806',
            content: `[본인 확인] 야놀자 인증번호 [${verifyCode}]를 입력해주세요.`,
            messages: [
                {
                    to: `${phoneNumber}`,
                },
            ],
        },
        // function(err, res, html) {
        // if(err) console.log(err);
        // else {
        // resultCode = 200;
        // console.log(html);
        // }
    })
        .then(function (res) {
            console.log('response',res.data, res['data']);
            return res.send(response(baseResponse.PHONE_SEND_SUCCESS))

            //res.json({isSuccess: true, code: 202, message: "본인인증 문자 발송 성공", result: res.data });
        })
        .catch((err) => {
            console.log(err.res);
            if(err.res == undefined){
                return res.send(response(baseResponse.PHONE_SEND_SUCCESS))
                //res.json({isSuccess: true, code: 200, message: "본인인증 문자 발송 성공", result: res.data });
            }
            else {
                return res.send(response(baseResponse.PHONE_SEND_FAIL))
                //res.json({isSuccess: true, code: 204, message: "본인인증 문자 발송에 문제가 있습니다.", result: err.res });
            }
        });
};

/**
 * API No. 49
 * API Name : 휴대폰 인증 확인 API
 * Body : phoneNumber, ver
 */
exports.verify = async function (req, res) {
    const phoneNumber = req.body.phoneNumber;
    const verifyCode = req.body.verifyCode;

    if (!phoneNumber) return res.send(response(baseResponse.PHONE_NUMBER_EMPTY));
    if (!verifyCode) return res.send(response(baseResponse.VERIFY_CODE_EMPTY));

    const CacheData = Cache.get(phoneNumber);

    if (!CacheData) {
        return res.send(response(baseResponse.PHONE_VERIFY_FAIL));
        //return res.send('fail');
    } else if (CacheData !== verifyCode) {
        return res.send(response(baseResponse.PHONE_VERIFY_FAIL));
        //return res.send('fail');
    } else {
        Cache.del(phoneNumber);
        return res.send(response(baseResponse.PHONE_VERIFY_SUCCESS));
        //return res.send('success');
    }
};

exports.getEmail = async function (req,res) {
  const userId =  req.verifiedToken.userId;
    if (!userId)  return res.send(errResponse(baseResponse.TOKEN_EMPTY));

    const getEmail = await userProvider.getEmail(userId);
    return res.send(response(baseResponse.SUCCESS,getEmail));

};