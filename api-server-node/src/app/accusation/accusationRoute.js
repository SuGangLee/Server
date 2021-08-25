module.exports = function(app) {
    const accusation = require('./accusationController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

// 17. 상품 신고하기
    app.post('/app/accusation/product', accusation.postAccusationProduct );

    //18. 판매자 신고하기
    app.post('/app/accusation/user', accusation.postAccusationUser );
}