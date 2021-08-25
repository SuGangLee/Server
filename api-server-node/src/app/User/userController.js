const jwtMiddleware = require("../../../config/jwtMiddleware");
const jwt = require('jsonwebtoken');
const secret_config = require('../../../config/secret');
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");

const {emit} = require("nodemon");
const { Console } = require("winston/lib/winston/transports");
const {logger} = require("../../../config/winston");
const passport = require('passport');
const axios = require('axios');

/**
 * API No. 0
 * API Name : 테스트 API
 * [GET] /app/test
 */
 exports.getTest = async function (req, res) {
     return res.send(response(baseResponse.SUCCESS))
 }

/**
 * API No. 1
 * API Name : 유저 생성 (회원가입) API
 * [POST] /app/users
 */
exports.postUsers = async function (req, res) {

    /**
     * Body: email, password, nickname, phone
     */
    const {email, password, nickname,phone} = req.body;

    // 빈 값 체크
    if (!email)
        return res.send(response(baseResponse.SIGNUP_EMAIL_EMPTY));

    // 길이 체크
    if (email.length > 30)
        return res.send(response(baseResponse.SIGNUP_EMAIL_LENGTH));

    // 형식 체크 (by 정규표현식) , 중복체크같은건 service에 들어가있음
    if (!regexEmail.test(email))
        return res.send(response(baseResponse.SIGNUP_EMAIL_ERROR_TYPE));

    // password 길이 체크,빈값체크,향식체크-추가
    if (!password)
        return res.send(response(baseResponse.SIGNUP_PASSWORD_EMPTY));
    if(password.length > 20 || password.length < 6)
         return res.send(response(baseResponse.SIGNUP_PASSWORD_LENGTH));

    //nickname  빈값체크, 길이체크
    if (!nickname)
        return res.send(response(baseResponse.SIGNUP_NICKNAME_EMPTY));
    if(nickname.length > 20 )
        return res.send(response(baseResponse.SIGNUP_NICKNAME_LENGTH));


    const signUpResponse = await userService.createUser(
        email,
        password,
        nickname,
        phone
    );

    return res.send(signUpResponse);
};




/**
 * API No. 3
 * API Name : 특정 유저 조회 API
 * [GET] /app/users/{userID}
 */
exports.getUserByID= async function (req, res) {

    /**
     * Path Variable: userID
     */
    const userIdFromJWT = req.verifiedToken.userID;

    if (!userIdFromJWT) return res.send(errResponse(baseResponse.USER_ID_EMPTY));

    const userListByID = await userProvider.retrieveUserID(userIdFromJWT);
    return res.send(response(baseResponse.SUCCESS, userListByID));
};

// TODO: After 로그인 인증 방법 (JWT)
/**
 * API No. 4
 * API Name : 로그인 API
 * [POST] /app/login
 * body : email, passsword
 */
exports.login = async function (req, res) {

    const email = req.body.email;
    const password = req.body.password;

    // TODO: email - 이메일 빈 값, 길이, 형식/ password 길이 형식적 Validation
    if (!email)
        return res.send(response(baseResponse.SIGNIN_EMAIL_EMPTY));

    if (!regexEmail.test(email))
        return res.send(response(baseResponse.SIGNIN_EMAIL_ERROR_TYPE));
    if (password.length > 20 ||password.length < 6 )
        return res.send(response(baseResponse.SIGNIN_PASSWORD_LENGTH));


    const signInResponse = await userService.postSignIn(email, password);
    return res.send(signInResponse);

};


/**
 * API No. 5
 * API Name : 회원 정보 수정 API + JWT + Validation
 * [PATCH] /app/users/:userID
 * path variable : userId
 * body : nickname
 */
exports.patchUsers = async function (req, res) {

    // jwt - userId, path variable :userId

    const userIdFromJWT = req.verifiedToken.userID;


    const nickname = req.body.nickname;

    if (!userIdFromJWT ) {
        res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));
    } else {
        if (!nickname) return res.send(errResponse(baseResponse.USER_NICKNAME_EMPTY));

        const editUserInfo = await userService.editUser(userIdFromJWT, nickname);
        return res.send(editUserInfo);
    }
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
 * API No. 8
 * API Name : 탈퇴하기
 * [delete] /app/users/sign-out
 * path variable : password도전
 * body : email
 */
exports.patchUserSignout = async function (req, res) {


    const userIdFromJWT = req.verifiedToken.userID;
    //토큰검증실패 3000
    if (!userIdFromJWT) {return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));}
    const email = req.body.email;

        const deleteUserInfo = await userService.deleteUser(userIdFromJWT,email);
        return res.send(deleteUserInfo);

};



/**
 * API No.9
 * API Name : 제품리스트 조회 + 제품명으로 검색 조회
 * [GET] /app/products
 */

exports.getProducts = async function(req,res) {
    const title = req.query.title;
    /**
     * Query String: title
     */
    // 제품먕 검색 조회
    if (title){
        const ProductListByTitle = await userProvider.retrieveProductList(title);
        return res.send(response(baseResponse.SUCCESS, ProductListByTitle));
    }
    // 제품 전체 조회
    else {
        const ProductListResult = await userProvider.retrieveProductList();
        return res.send(response(baseResponse.SUCCESS, ProductListResult));
    }
};

/**
 * API No.10
 * API Name : 유저의 판매중인 상품 조회
 * [GET] /app/products/on-sale
 */
exports.getProductsById= async function (req, res) {

    /**
     * Path Variable: nickname
     */
    const userIdFromJWT = req.verifiedToken.userID;

    if (!userIdFromJWT) return res.send(errResponse(baseResponse.SEARCH_NICKNAME_WRONG));
    if (!userIdFromJWT)
        return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));

    const productsByID = await userProvider.retrieveProductByID(userIdFromJWT);
    return res.send(response(baseResponse.SUCCESS, productsByID));
};

/**
 * API No.12
 * API Name : 공지사항 조회
 * [GET] /app/notice
 */
exports.getNotice = async function (req, res) {

    /**
     * Path Variable:
     */

    const notice = await userProvider.retrieveNotice();
    return res.send(response(baseResponse.SUCCESS, notice));
};

/**
 * API No. 13
 * API Name : 제품정보 생성
 * [POST] /app/products
 */
exports.postProducts = async function (req, res) {

    /**
     * Body: productID, userID, title, price, content, categoryName
     */
    const userIdFromJWT = req.verifiedToken.userID;
    const {productID,  title, price, content,imgURL} = req.body;
     //     userID가 user.userID에 있는지 체크, productID 중복체크
    // 빈 값 체크
    if (!userIdFromJWT)
        return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));
    if (!productID)
        return res.send(response(baseResponse.PRODUCT_PRODUCTID_EMPTY));
    if (!title)
        return res.send(response(baseResponse.PRODUCT_TITLE_EMPTY));
    if (!content)
        return res.send(response(baseResponse.PRODUCT_CONTENT_EMPTY));
    if(!price)
        return res.send(response(baseResponse.PRODUCT_PRICE_EMPTY));

    if (!imgURL)
        return res.send(response(baseResponse.PRODUCT_IMAGE_EMPTY));


    const productUpResponse = await userService.addProduct(
        productID, userIdFromJWT, title, price, content, imgURL
    );

    return res.send(productUpResponse);
};

/**
 * API No. 13
 * API Name : 특정 유저의 채팅방 조회 -success , 룸아이디로 채팅내역 조회하기
 *
 * [GET] /app/chat
 */
exports.getChat = async function (req, res) {

    const userIDFromJWT = req.verifiedToken.userID;
    if (!userIDFromJWT) { return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));}
    const IdByChat = await userProvider.retrieveUserByChat(userIDFromJWT);
    return res.send(response(baseResponse.SUCCESS, IdByChat));
}





/**
 * API No. 15
 * API Name :
 * [GET] /app/:category/products
 */
exports.getProductsByCategory= async function (req, res)
{
    /**
     * Path Variable: categoryName
     */
    const categoryName = req.params.categoryName;

    if (!categoryName) return res.send(errResponse(baseResponse.CATEGORY_NAME_EMPTY));

    const productsByCategory = await userProvider.ProductsByCategory(categoryName);
    return res.send(response(baseResponse.SUCCESS, productsByCategory));
}

/**
 * API No. 19
 * API Name : 제품정보수정 닉네임과 타이틀 체크하는 코드 추가
 * [PATCH] /app/products
 */
exports.patchProduct= async function (req, res)
{
    const userIDFromJWT = req.verifiedToken.userID;

    const content = req.body.content;

        const title = req.query.title;

         if (!title)
             return res.send(errResponse(baseResponse.PRODUCT_TITLE_EMPTY));
        if(!content)
            return res.send(errResponse(baseResponse.PRODUCT_CONTENT_EMPTY));
    if (!userIDFromJWT) { return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));}
        const modifyProductResult = await userService.modifyProduct(userIDFromJWT, title,content);

        return res.send(modifyProductResult);
}

/**
 * API No. 20
 * API Name : 제품글 끌어올리기 -실패 삭제하던지
 * [PATCH] /app/products/:userID/pulling
 */
exports.pullingProduct= async function (req, res)
{
    const title = req.query.title;

    if (!title)
        return res.send(errResponse(baseResponse.PRODUCT_TITLE_EMPTY));

    const pullingProductResult = await userService.pullingProduct(title);
    return res.send(pullingProductResult);
}

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
//제품 상세 조회
exports.getProductInfo= async function (req, res)
{
    /**
     * Path Variable: title
     */
    const title = req.query.title;
    /**
     * Query String: title
     */
    // 제품먕 검색 조회
    if (title){
        const ProductListByTitle = await userProvider.retrieveProductList(title);
        return res.send(response(baseResponse.SUCCESS, ProductListByTitle));
    }
    else return res.send(errResponse(baseResponse.PRODUCT_TITLE_EMPTY)); //6002 상품명을 입력하세요
}

/**
 * 동네생활게시판조회
 */
exports.getBoard = async function (req, res) {

        const userIDFromJWT = req.verifiedToken.userID;
    if (!userIDFromJWT) { return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));}
        const listByBoard = await userProvider.listByBoard(userIDFromJWT);
        return res.send(response(baseResponse.SUCCESS, listByBoard));

}

/**
* 동네생활게시판조회 세부
*/
exports.getBoardContent = async function (req, res) {
    /**
     * params:  boardID
     */
    const userIDFromJWT = req.verifiedToken.userID;
    const boardID =req.params.boardID;
    if(!boardID) { return res.send(errResponse(baseResponse.BOARD_ID_EMPTY)); }//700 게시글의 id를 입력하세요
    if (!userIDFromJWT) { return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));}
    const detailByBoard = await userProvider.detailByBoard(boardID);
    return res.send(response(baseResponse.SUCCESS, detailByBoard));

}

/**
    * 동네생활게시판 작성
*/
exports.postBoard = async function (req, res) {
    /**
     * body: topic, content
     */
    const userIDFromJWT = req.verifiedToken.userID;
    const {topic, content } = req.body;

    if(!topic) { return res.send(errResponse(baseResponse.BOARD_TOPIC_EMPTY)); }//703 게시글의 주제를 입력하세요
    if (!userIDFromJWT) { return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));}
    if (!content) {return res.send(errResponse(baseResponse.BOARD_CONTENT_EMPTY)); }

    const addByBoard = await userService.addByBoard(topic,content,userIDFromJWT);
    return res.send( addByBoard);

}
/**
 * 동네생활게시판 댓글작성
 */
exports.postComment = async function (req, res) {
    /**
     * body: userID,content
     */
    const userIDFromJWT = req.verifiedToken.userID;
    const content = req.body.content;
    const boardID =req.params.boardID;

    if (!userIDFromJWT) { return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));}
    if (!content) {return res.send(errResponse(baseResponse.BOARD_CONTENT_EMPTY)); }
    if(!boardID) { return res.send(errResponse(baseResponse.BOARD_ID_EMPTY)); }//700 게시글의 id를 입력하세요

    const addComment = await userService.addComment(boardID,content,userIDFromJWT);
    return res.send( addComment);

}

/**
 * 나의 판매중인 상품 숨기기
 */
exports.patchHide = async function (req, res) {
    /**
     * queryString : title
     */
    const userIDFromJWT = req.verifiedToken.userID;
    const title=req.query.title;

    if (!userIDFromJWT) { return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));}
    if(!title) {return res.send(response(baseResponse.PRODUCT_TITLE_EMPTY));} //6002 상품명을 입력하세요

    const patchProductStatus = await userService.patchProductStatus (title,userIDFromJWT);
    return res.send( patchProductStatus );

}

/**
 * 숨긴 상품 조회
 */
exports.getHide = async function (req, res) {

    const userIDFromJWT = req.verifiedToken.userID;

    if (!userIDFromJWT) { return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));}

    const getHideProduct = await userProvider.getHideProduct (userIDFromJWT);
    return res.send(response(baseResponse.SUCCESS, getHideProduct));

};

/**
 * 관심 상품 조회
 */
exports.getLiked = async function (req, res) {

    const userIDFromJWT = req.verifiedToken.userID;

    if (!userIDFromJWT) { return res.send(response(baseResponse.TOKEN_VERIFICATION_FAILURE));}

    const getLikedProduct = await userProvider.getLikedProduct(userIDFromJWT);
    return res.send(response(baseResponse.SUCCESS, getLikedProduct));
}