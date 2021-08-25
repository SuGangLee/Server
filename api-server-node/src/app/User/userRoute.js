module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const passport = require('passport');
    const KakaoStrategy = require('passport-kakao').Strategy;

    // 1. 유저 생성 (회원가입) API -success
    app.post('/app/users', user.postUsers);

    // 3. ID로 특정 유저 조회 api 위 api와 겹쳐서 언돼
    app.get('/app/users',jwtMiddleware, user.getUserByID);

    // TODO: After 로그인 인증 방법 (JWT)
    // 4. 로그인 하기 API (JWT 생성) --success
    app.post('/app/login', user.login);

    // 5. 회원 정보 수정 API = 누군가가 로그인을 했을때에만 사용가능한 api로 회원용 api이다.(JWT 검증 및 Validation - 메소드 체이닝 방식으로 jwtMiddleware 사용)  -- success
    app.patch('/app/users/modify', jwtMiddleware, user.patchUsers);
    //메소드 체이닝 방식이란, 하나의 메소드에서 두개의 함수를 구현하여 next를 통해 첫번째 함수가 끝나면 두 번째 함수를 수행하도록 고리를 짓는 방식

// TODO: 6. 자동로그인 API (JWT 검증 및 Payload 내뱉기)
// 7. JWT 검증 API
// app.get('/app/  auto-login', jwtMiddleware, user.check);

    //6. 탈퇴하기 API - success / user 정보에는 남아있지만 status가 DELETED 로 바꿔서 로그인하지는 못한다.
    app.patch('/app/users/sign-out',jwtMiddleware,user.patchUserSignout);

//  7. 제품리스트 조회 + 제품명으로 검색- success ** 질문하기 : 제품리스트api에서 제품의 내용까지 다 보여주냐 혹은 제품api 를 하나 생성하나
    app.get('/app/products',user.getProducts);

    //제품 상세 조회
    app.get('/app/products/product',user.getProductInfo);

//   8. 유저 판매내역 해당 유저가 판매중인 상품들 정보 조회 -success // 제품 폴더 나누기!!
    app.get('/app/products/on-sale',jwtMiddleware,user.getProductsById);


    //9. 공지사항 조회 API - success
    app.get('/app/notice' , user.getNotice);

    //10. 제품 정보 삽입 API --success + 이미지url까지 등록시킴 ㅎㅎ
    app.post('/app/my-product',jwtMiddleware,user.postProducts);

    //11. 특정 유저의 채팅방 조회 API +  -success roomID 검색시 채팅내역 송출추가해야해
    app.get('/app/chat', jwtMiddleware,user.getChat);

    // 12. 카테고리명으로 해당 카테고리에 존재하는 상품들 정보 조회 -> success
     app.get('/app/:categoryName/product',user.getProductsByCategory);

    //13. 제품정보수정 -success
    app.patch('/app/products/modify',jwtMiddleware,user.patchProduct);



    // 15.채팅방 생성 api
//16. 카카오로그인 api
        passport.use(
            'kakao-login',
            new KakaoStrategy(
                {
                    clientID: '7b47958363b076b33f6c516b6baccda4',
                    clientSecret: 'IQWrjqYm7Hrms1r8WVBXP1inxSAH4b2C',
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
        app.get('/kakao', passport.authenticate('kakao-login')); //카카오로그인 검증
        app.get('/auth/kakao/callback', passport.authenticate('kakao-login', { failureRedirect: '/auth', successRedirect: '/' }));
        //우리동네 게시판 조회
        app.get('/app/board',jwtMiddleware,user.getBoard);
        //우리동네게시판 세부 조회
        app.get('/app/board/:boardID',jwtMiddleware,user.getBoardContent);
        //게시판 글 작성
        app.post('/app/board',jwtMiddleware,user.postBoard);
        //게시판 댓글 작성
        app.post('/app/board/:boardID/comment',jwtMiddleware,user.postComment);
        // 상품 글 숨기기
        app.patch('/app/products/on-sale/hide',jwtMiddleware,user.patchHide);
        // 숨긴 상품 조회
         app.get('/app/products/on-sale/hide',jwtMiddleware,user.getHide);
    //  관심 상품 조회
    app.get('/app/products/liked',jwtMiddleware,user.getLiked);
};



