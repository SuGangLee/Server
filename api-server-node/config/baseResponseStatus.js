module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },

    // Common
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 1001, "message":"JWT 토큰 검증 성공" }, // ?

    //Request error
    SIGNUP_EMAIL_EMPTY : { "isSuccess": false, "code": 2001, "message":"이메일을 입력해주세요" },
    SIGNUP_EMAIL_LENGTH : { "isSuccess": false, "code": 2002, "message":"이메일은 30자리 미만으로 입력해주세요." },
    SIGNUP_EMAIL_ERROR_TYPE : { "isSuccess": false, "code": 2003, "message":"이메일을 형식을 정확하게 입력해주세요." },
    SIGNUP_PASSWORD_EMPTY : { "isSuccess": false, "code": 2004, "message": "비밀번호를 입력 해주세요." },
    SIGNUP_PASSWORD_LENGTH : { "isSuccess": false, "code": 2005, "message":"비밀번호는 6~20자리를 입력해주세요." },
    SIGNUP_NICKNAME_EMPTY : { "isSuccess": false, "code": 2006, "message":"닉네임을 입력 해주세요." },
    SIGNUP_NICKNAME_LENGTH : { "isSuccess": false,"code": 2007,"message":"닉네임은 최대 15자리를 입력해주세요." },
    SIGNUP_PASSWORD_ERROR_TYPE : { "isSuccess": false, "code": 2008, "message":"비밀번호는 영문자소문자 조합해주세요." },


    SIGNIN_EMAIL_EMPTY : { "isSuccess": false, "code": 2008, "message":"이메일을 입력해주세요" },
    SIGNIN_EMAIL_LENGTH : { "isSuccess": false, "code": 2009, "message":"이메일은 30자리 미만으로 입력해주세요." },
    SIGNIN_EMAIL_ERROR_TYPE : { "isSuccess": false, "code": 2010, "message":"이메일을 형식을 정확하게 입력해주세요." },
    SIGNIN_PASSWORD_EMPTY : { "isSuccess": false, "code": 2011, "message": "비밀번호를 입력 해주세요." },

    USER_USERID_EMPTY : { "isSuccess": false, "code": 2012, "message": "userId를 입력해주세요." },
    USER_USERID_NOT_EXIST : { "isSuccess": false, "code": 2013, "message": "해당 회원이 존재하지 않습니다." },

    USER_USEREMAIL_EMPTY : { "isSuccess": false, "code": 2014, "message": "이메일을 입력해주세요." },
    USER_USEREMAIL_NOT_EXIST : { "isSuccess": false, "code": 2015, "message": "해당 이메일을 가진 회원이 존재하지 않습니다." },
    USER_EMAILID_NOT_MATCH : { "isSuccess": false, "code": 2016, "message": "유저 아이디 값을 확인해주세요" },
    USER_NICKNAME_EMPTY : { "isSuccess": false, "code": 2017, "message": "변경할 닉네임 값을 입력해주세요" },
    USER_STATUS_EMPTY : { "isSuccess": false, "code": 2018, "message": "회원 상태값을 입력해주세요" },
    USER_PHONE_EMPTY :  { "isSuccess": false, "code": 2019, "message": "변경할 번호를 입력해주세요" },

    // Response error
    SIGNUP_REDUNDANT_EMAIL : { "isSuccess": false, "code": 3001, "message":"중복된 이메일입니다." },
    SIGNUP_REDUNDANT_NICKNAME : { "isSuccess": false, "code": 3002, "message":"중복된 닉네임입니다." },

    SIGNIN_EMAIL_WRONG : { "isSuccess": false, "code": 3003, "message": "아이디가 잘못 되었습니다." },
    SIGNIN_PASSWORD_WRONG : { "isSuccess": false, "code": 3004, "message": "비밀번호가 잘못 되었습니다." },
    SIGNIN_INACTIVE_ACCOUNT : { "isSuccess": false, "code": 3005, "message": "비활성화 된 계정입니다. 고객센터에 문의해주세요." },
    SIGNIN_WITHDRAWAL_ACCOUNT : { "isSuccess": false, "code": 3006, "message": "탈퇴 된 계정입니다. 고객센터에 문의해주세요." },

    LOGOUT_EMAIL_WRONG : { "isSuccess": false, "code": 3500, "message": "이메일이 다릅니다. 확인해주세요" },
    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},

    SEARCH_NICKNAME_WRONG  : { "isSuccess": false, "code": 5001, "message": "해당 유저는 없습니다. 닉네임을 다시 확인해주세요." },

    PRODUCT_NOT_EXISTS : { "isSuccess": false, "code": 6000, "message": "해당 상품은 없습니다." },
    PRODUCT_PRODUCTID_EMPTY : { "isSuccess": false, "code": 6001, "message": "상품코드을 입력하세요" },
    PRODUCT_TITLE_EMPTY : { "isSuccess": false, "code": 6002, "message": "상품명을 입력하세요" },
    PRODUCT_CONTENT_EMPTY : { "isSuccess": false, "code": 6003, "message": "내용을 입력하세요" },
    PRODUCT_PRICE_EMPTY : { "isSuccess": false, "code": 6004, "message": "가격을 입력하세요" },
    PRODUCT_CATEGORYNAME_EMPTY : { "isSuccess": false, "code": 6005, "message": "카테고리를 입력하세요" },
    PRODUCT_IMAGE_EMPTY : { "isSuccess": false, "code": 6005, "message": "이미지를 입력하세요" },
    PRODUCT_STATUS_EMPTY: { "isSuccess": false, "code": 6006, "message": "바꿀 상태를 입력하세요" },
    PRODUCT_TITLE_WRONG: { "isSuccess": false, "code": 6007, "message": "해당하는 상품이 없습니다. 상품명을 올바르게 입력하세요" },

    CATEGORY_NAME_EMPTY : { "isSuccess": false, "code": 7000, "message": "카테고리를 입력하세요." },
    CATEGORY_REDUNDANT_NAME :  { "isSuccess": false, "code": 7001, "message": "이미 존재하는 카테고리입니다." },

    NOTICE_CONTENT_EMPTY :  { "isSuccess": false, "code": 8000, "message": "공지내용을 입력하세요" },
    NOTICE_TITLE_EMPTY : { "isSuccess": false, "code": 8001, "message": "공지제목을 입력하세요" },

    SEARCH_EMPTY: { "isSuccess": false, "code": 9000, "message": "검색어를 입력하세요" },

    ACCUSATION_PRODUCTTITLE : {"isSuccess": false, "code": 100, "message": "신고할 제품명을 올바르게 입력하세요"},
    ACCUSATION_USER :{"isSuccess": false, "code": 101, "message": "신고할 판매자 아이디를 올바르게 입력하세요"},
    ACCUSATION_EMPTY_TITLE: {"isSuccess": false, "code": 101, "message": "신고할 타이틀을 입력하세요"},
    ACCUSATION_EMPTY_CONTENT: {"isSuccess": false, "code": 101, "message": "자세한 내용을 입력하세요"},

    BOARD_ID_EMPTY : {"isSuccess": false, "code": 700, "message": "게시글의 id를 입력하세요"},
    BOARD_CONTENT_EMPTY : {"isSuccess": false, "code": 701, "message": "게시글의 내용 입력하세요"},
    BOARD_TOPIC_EMPTY : {"isSuccess": false, "code": 701, "message": "게시글의 주제를 입력하세요"},
}
