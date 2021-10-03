module.exports = function(app) {
    const product = require('./productController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

// 특정숙소의 리뷰리스트 조회
    app.get('/products/review-list',product.getReviewList);
    // 모텔 리스트 조회 - 구역 id, 날짜, 기준인원 쿼리스트링으로 받음
    app.get('/products/motels', product.getMotel);
    // 호텔 리스트 조회 - 구역 id, 날짜, 기준인원 쿼리스트링으로 받음
    app.get('/products/hotels', product.getHotel);

    // 특정 숙소의 방리스트 조회 -  날짜, 숙소ID 쿼리스트링
    app.get('/products/rooms', product.getRoomList);
    // 특정 숙소의 판매자 정보 조회
    app.get('/products/brand/seller-info', product.getSeller);

    //특정 숙소의 전화번호 조회 -> 전화하기 openAPI?
    app.get('/products/brand/call', product.getCall);

    //특정 숙소의 방옵션에 따른 객실 상세 조회 API
    app.get('/products/rooms/room-detail', product.getRoomDetail);

    // 검색 조회 API - 시작, 끝 날짜, 기준인원,검색어 쿼리스트링.
    app.get('/products/search', product.getSearchList);
    // 프리미엄 호텔 조회API
    app.get('/products/premium-hotels', product.premiumHotel);
    app.get('/products/premium-hotels/four-star', product.FourStarHotel);
    app.get('/products/premium-hotels/five-star', product.FiveStarHotel);

    // 당신의 취향저격 BEST - 찜한 상품 인근 상품 조회
    app.get('/products/type-best',jwtMiddleware,product.getUserTypeProducts );

};