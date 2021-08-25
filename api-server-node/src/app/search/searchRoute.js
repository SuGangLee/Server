module.exports = function(app) {
    const search = require('./searchController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    // 검색어 입력시 결과 송출
    //15. 검색어 입력 시 (?title=? or ?nickname=?  )
    app.get('/app/search/product-title', search.getSearchTitle);
    app.get('/app/search/user-nickname', search.getSearchNickname);
    //16. 인기매물 검색
    app.get('/app/search/popular',search.getSearchPopular);

    //19. 동네게시판검색
    app.get('/app/search/board',search.getSearchBoard);

}