module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const passport = require('passport');
    const KakaoStrategy = require('passport-kakao').Strategy;
    // 테스트 API
    //app.get('/app/test', user.getTest)

    // 1. 유저 생성 (회원가입) API
    app.post('/app/users', user.postUsers);

    // 2. 유저 조회 API (+ 검색)
    //app.get('/app/users',user.getUsers);
// 2. my야놀자 조회 API
    app.get('/app/my-yanolja',jwtMiddleware,user.getMyPage);
// 3. 특정 유저 조회 API
    //app.get('/app/users/:userId', user.getUserById);

    // 찜목록 조회 API
    app.get('/app/my-yanolja/liked-list' ,jwtMiddleware, user.getLikedList);

    //장바구니 조회API
    app.get('/app/my-cart',jwtMiddleware ,user.getCart);

    //내 쿠폰함 조회API
    app.get('/app/my-yanolja/coupons',jwtMiddleware ,user.getCoupon);

    //찜하기
    app.post('/app/into-liked',jwtMiddleware,user.postLiked);
    //장바구니담기
    app.post('/app/into-cart',jwtMiddleware,user.postCart);

//비밀번호 인증
    app.post ('/app/password-check',jwtMiddleware,user.postPassword);

    // TODO: After 로그인 인증 방법 (JWT)
    // 로그인 하기 API (JWT 생성)
    app.post('/app/login', user.login);

    // 회원 정보 수정 API (JWT 검증 및 Validation - 메소드 체이닝 방식으로 jwtMiddleware 사용)
    app.patch('/app/users/modify', jwtMiddleware, user.patchUsers);

    //회원탈퇴
    app.patch('/app/users/sign-out', jwtMiddleware, user.outUser );

    app.post('/app/users/email-check',user.emailCheck);

    // 폰번호 가져오기
    app.get('/app/users/phone',jwtMiddleware,user.getPhone);

    passport.use(
        'kakao-login',
        new KakaoStrategy(
            {
                clientID: '90a2ee3ab0d77e8f832780587288a460',
                clientSecret: '91080394bc3bce1153c3cf282538f4fd',
                callbackURL: '/auth/kakao/callback',
            },
            function (accessToken, refreshToken, profile, done) {
                result = {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    profile: profile,
                };
                console.log('KakaoStrategy', result);
                return done;
            },
        ),
    );

    app.post('/users/kakao-login', user.kakaoLogin);
    app.get('/kakao', passport.authenticate('kakao-login'));
    app.get('/auth/kakao/callback', passport.authenticate('kakao-login', { failureRedirect: '/auth', successRedirect: '/' }));
//  휴대폰 인증 번호 발송 API
    app.post('/app/send', user.send);

    //  휴대폰 인증 확인 API
    app.post('/app/verify', user.verify);
    //로그인한 유저의 이메일 + 번호 가져오기
    app.get('/app/user/email', jwtMiddleware,user.getEmail);
};


// TODO: 자동로그인 API (JWT 검증 및 Payload 내뱉기)
// JWT 검증 API
// app.get('/app/auto-login', jwtMiddleware, user.check);

// TODO: 탈퇴하기 API