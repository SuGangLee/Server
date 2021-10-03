module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },
    PASSWORD_CHECK_SUCCESS : { "isSuccess": true, "code": 1001, "message":"비밀번호 인증 성공" },
    NICKNAME_CHANGE_SUCCESS: { "isSuccess": true, "code": 1002, "message":"닉네임 변경 성공" },
    PASSWORD_CHANGE_SUCCESS: { "isSuccess": true, "code": 1003, "message":"비밀번호 변경 성공" },
    PHONE_CHANGE_SUCCESS: { "isSuccess": true, "code": 1004, "message":"휴대폰 번호 변경 성공" },
    PATCH_SUCCESS : { "isSuccess": true, "code": 1005, "message":"정보 변경 성공" },
    CHANGE_PASSWORD_WRONG : { "isSuccess": true, "code": 1006, "message":"새비밀번호가 맞지 않습니다." },
    CHECK_PASSWORD_EMPTY : { "isSuccess": true, "code": 1007, "message":"비밀번호 확인을 진행해주세요." },
    USER_SING_OUT_SUCCESS: { "isSuccess": true, "code": 1008, "message":"탈퇴되었습니다." },
    // Common
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 1001, "message":"JWT 토큰 검증 성공" }, // ?
    SIGNIN_EMAIL_POSSIBLE: { "isSuccess": true,"code": 2100,"message":"사용가능한 이메일입니다" },
    //Request error
    SIGNUP_PHONE_EMPTY :  { "isSuccess": false, "code": 2020, "message":"핸드폰번호를 입력해주세요" },
    SIGNUP_EMAIL_EMPTY : { "isSuccess": false, "code": 2001, "message":"이메일을 입력해주세요" },
    SIGNUP_EMAIL_LENGTH : { "isSuccess": false, "code": 2002, "message":"이메일은 30자리 미만으로 입력해주세요." },
    SIGNUP_EMAIL_ERROR_TYPE : { "isSuccess": false, "code": 2003, "message":"이메일을 형식을 정확하게 입력해주세요." },
    SIGNUP_PASSWORD_EMPTY : { "isSuccess": false, "code": 2004, "message": "비밀번호를 입력 해주세요." },
    SIGNUP_PASSWORD_LENGTH : { "isSuccess": false, "code": 2005, "message":"비밀번호는 8~20자리를 입력해주세요." },
    SIGNUP_NICKNAME_EMPTY : { "isSuccess": false, "code": 2006, "message":"닉네임을 입력 해주세요." },
    SIGNUP_NICKNAME_LENGTH : { "isSuccess": false,"code": 2007,"message":"닉네임은 2~8자리를 입력해주세요." },


    SIGNIN_EMAIL_EMPTY : { "isSuccess": false, "code": 2008, "message":"이메일을 입력해주세요" },
    SIGNIN_EMAIL_LENGTH : { "isSuccess": false, "code": 2009, "message":"이메일은 30자리 미만으로 입력해주세요." },
    SIGNIN_EMAIL_ERROR_TYPE : { "isSuccess": false, "code": 2010, "message":"이메일을 형식을 정확하게 입력해주세요." },
    SIGNIN_PASSWORD_EMPTY : { "isSuccess": false, "code": 2011, "message": "비밀번호를 입력 해주세요." },

    SIGNOUT_REASON_EMPTY :  { "isSuccess": false, "code": 2500, "message": "탈퇴사유를 선택하세요." },

    USER_USERID_EMPTY : { "isSuccess": false, "code": 2012, "message": "userId를 입력해주세요." },
    USER_USERID_NOT_EXIST : { "isSuccess": false, "code": 2013, "message": "해당 회원이 존재하지 않습니다." },

    USER_USEREMAIL_EMPTY : { "isSuccess": false, "code": 2014, "message": "이메일을 입력해주세요." },
    USER_USEREMAIL_NOT_EXIST : { "isSuccess": false, "code": 2015, "message": "해당 이메일을 가진 회원이 존재하지 않습니다." },
    USER_ID_NOT_MATCH : { "isSuccess": false, "code": 2016, "message": "유저 아이디 값을 확인해주세요" },
    USER_NICKNAME_EMPTY : { "isSuccess": false, "code": 2017, "message": "변경할 닉네임 값을 입력해주세요" },

    USER_STATUS_EMPTY : { "isSuccess": false, "code": 2018, "message": "회원 상태값을 입력해주세요" },

    // Response error
    SIGNUP_REDUNDANT_EMAIL : { "isSuccess": false, "code": 3001, "message":"중복된 이메일입니다." },
    SIGNUP_REDUNDANT_NICKNAME : { "isSuccess": false, "code": 3002, "message":"중복된 닉네임입니다." },

    SIGNIN_EMAIL_WRONG : { "isSuccess": false, "code": 3003, "message": "아이디가 잘못 되었습니다." },
    SIGNIN_PASSWORD_WRONG : { "isSuccess": false, "code": 3004, "message": "비밀번호가 잘못 되었습니다." },
    SIGNIN_INACTIVE_ACCOUNT : { "isSuccess": false, "code": 3005, "message": "비활성화 된 계정입니다. 고객센터에 문의해주세요." },
    SIGNIN_WITHDRAWAL_ACCOUNT : { "isSuccess": false, "code": 3006, "message": "탈퇴 된 계정입니다. 고객센터에 문의해주세요." },


    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},

    PRODUCT_NAME_EMPTY: { "isSuccess": false, "code": 6000, "message": "숙박업소명 입력 필요"},
    PRODUCT_ID_EMPTY: { "isSuccess": false, "code": 6001, "message": "숙박업소 아이디 입력 필요"},
    PRODUCT_REGION_EMPTY :  { "isSuccess": false, "code": 6002, "message": "지역아이디 입력 필요"},
    PRODUCT_START_DATE_EMPTY :  { "isSuccess": false, "code": 6003, "message": "시작날짜 입력 필요"},
    PRODUCT_END_DATE_EMPTY :  { "isSuccess": false, "code": 6004, "message": "마지막날짜 입력 필요"},
    PRODUCT_MEMBER_EMPTY :  { "isSuccess": false, "code": 6005, "message": "기준인원 입력 필요"},
    PRODUCT_ROOM_TYPE_EMPTY  :  { "isSuccess": false, "code": 6006, "message": "방타입 입력 필요"},
    PRODUCT_SEARCH_EMPTY : {"isSuccess": false, "code": 6007, "message": "검색어 입력 필요"},

    BOOK_BRAND_NAME_EMPTY : { "isSuccess": false, "code": 7001, "message": "숙소명을 입력하세요"} ,
    BOOK_ROOMTYPE_EMPTY : { "isSuccess": false, "code": 7002, "message": "방 타입을 입력하세요"} ,
    BOOK_VISIT_EMPTY : { "isSuccess": false, "code": 7003, "message": "숙소방문수단을 입력하세요 (도보 or 차량)"} ,
    BOOK_MEMBER_NAME_EMPTY : { "isSuccess": false, "code": 7004, "message": "예약자 이름을 입력하세요"} ,
    BOOK_USER_NAME_EMPTY : { "isSuccess": false, "code": 7005, "message": "이용자 이름을 입력하세요"} ,
    BOOK_USER_PHONE_EMPTY : { "isSuccess": false, "code": 7006, "message": "이용자 번호를 입력하세요ㅋ"} ,
    BOOK_PAY_KIND_EMPTY : { "isSuccess": false, "code": 7007, "message": "결제수단을 입력하세요"} ,
    BOOK_ID_EMPTY : { "isSuccess": false, "code": 7008, "message": "예약번호를 입력하세요"} ,
    BOOK_CANCEL_EMPTY : { "isSuccess": false, "code": 7098, "message": "취소사유를 입력하세요"} ,
    BOOKING_END: { "isSuccess": false, "code": 7099, "message": "해당날짜는 예약이 마감되었습니다."} ,
    PAY_ERROR: { "isSuccess": false, "code": 7100, "message": "에러 - 결제할 정보가 없습니다 (취소 or 이미결제)"} ,

    PHONE_NUMBER_EMPTY: { "isSuccess": false, "code": 8000, "message": "핸드폰번호를 입력하세요"},
    VERIFY_CODE_EMPTY: { "isSuccess": false, "code": 8001, "message": "인증번호를 입력하세요"},
    PHONE_SEND_FAIL:{ "isSuccess": false, "code": 8002, "message": "인증번호 전송 실패"},
    PHONE_VERIFY_FAIL :{ "isSuccess": false, "code": 8003, "message": "인증번호 인증 실패"},
    PHONE_VERIFY_SUCCESS:{ "isSuccess": false, "code": 9000, "message": "인증번호 인증성공"},
    PHONE_SEND_SUCCESS:{ "isSuccess": false, "code": 9001, "message": "인증번호 전송 성공"},

}