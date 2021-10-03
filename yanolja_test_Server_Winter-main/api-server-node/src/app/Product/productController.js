const jwtMiddleware = require("../../../config/jwtMiddleware");
const productProvider = require("../../app/Product/productProvider");
const productService = require("../../app/Product/productService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");



/**
 * API Name : 특정 숙소의 후기조회 API
 * [GET] /app/users
 */
exports.getReviewList = async function (req, res) {
    /**
     * 쿼리스트링: 숙소명
     */
    const idx = req.query.idx;
    const order=req.query.order;

    if (!idx) return res.send(errResponse(baseResponse.PRODUCT_ID_EMPTY)); //6001, 숙박업소아이디 입력 필요

    const reviewStar = await productProvider.reviewStar(idx);

    if (!order) {const reviewList = await productProvider.reviewList(idx);
        return res.send(response(baseResponse.SUCCESS,reviewList,reviewStar));
    }
    else{
       const reviewList = await productProvider.reviewListByStar(idx);
        return res.send(response(baseResponse.SUCCESS,{reviewList,reviewStar}));
    }

};

/**
 * API Name : 모텔리스트조회 API
 * [GET] /products/motels
 */
exports.getMotel = async function (req, res) {
    /**
     * 쿼리스트링: 지역명, 날짜, 기준인원
     */
    const region = req.query.region;
    const startDate=req.query.startDate;
    const endDate=req.query.endDate;
    const member=req.query.member;

    if (!region) return res.send(errResponse(baseResponse.PRODUCT_REGION_EMPTY)); //6002, 지역입력
    if (!startDate) return res.send(errResponse(baseResponse.PRODUCT_START_DATE_EMPTY)); //6003, 날짜입력
    if (!endDate) return res.send(errResponse(baseResponse.PRODUCT_END_DATE_EMPTY)); //6004, 날짜입력
    if (!member) return res.send(errResponse(baseResponse.PRODUCT_MEMBER_EMPTY)); //6005, 기준인원입력

    const motelList = await productProvider.motelList(region,startDate,endDate,member);

    return res.send(response(baseResponse.SUCCESS,motelList));

};

/**
 * API Name : 호텔리스트조회 API
 * [GET] /products/hotels
 */
exports.getHotel = async function (req, res) {
    /**
     * 쿼리스트링: 지역명, 날짜, 기준인원
     */
    const region = req.query.region;
    const startDate=req.query.startDate;
    const endDate=req.query.endDate;
    const member=req.query.member;

    if (!region) return res.send(errResponse(baseResponse.PRODUCT_REGION_EMPTY)); //6002, 지역입력
    if (!startDate) return res.send(errResponse(baseResponse.PRODUCT_START_DATE_EMPTY)); //6003, 날짜입력
    if (!endDate) return res.send(errResponse(baseResponse.PRODUCT_END_DATE_EMPTY)); //6004, 날짜입력
    if (!member) return res.send(errResponse(baseResponse.PRODUCT_MEMBER_EMPTY)); //6005, 기준인원입력

    const hotelList = await productProvider.hotelList(region,startDate,endDate,member);

    return res.send(response(baseResponse.SUCCESS,hotelList));


};

exports.getRoomList = async function (req, res) {
    /**
     * 쿼리스트링: 날짜, 특정 숙소 id
     */
    const startDate=req.query.startDate;
    const endDate=req.query.endDate;
    const brandID = req.query.brandID ;

    if (!startDate) return res.send(errResponse(baseResponse.PRODUCT_START_DATE_EMPTY)); //6003, 날짜입력
    if (!endDate) return res.send(errResponse(baseResponse.PRODUCT_END_DATE_EMPTY)); //6004, 날짜입력
    if (!brandID) return res.send(errResponse(baseResponse.PRODUCT_ID_EMPTY)); // 6001 숙소 ID 입력필요

    const RoomList = await productProvider.roomList(brandID, startDate,endDate);

    return res.send(response(baseResponse.SUCCESS,RoomList));


};

exports.getSeller = async function (req, res) {
    /**
     * params : 특성 숙소 ID
     */

        const brandID = req.query.brandID ;

    if (!brandID) return res.send(errResponse(baseResponse.PRODUCT_ID_EMPTY)); // 6001 숙소 ID 입력필요

    const sellerInfo = await productProvider.sellerInfo(brandID);

    return res.send(response(baseResponse.SUCCESS,sellerInfo));


};

exports.getCall = async function (req, res) {
    /**
     * params : 특성 숙소 ID
     */

    const brandID = req.query.brandID ;

    if (!brandID) return res.send(errResponse(baseResponse.PRODUCT_ID_EMPTY)); // 6001 숙소 ID 입력필요

    const callInfo = await productProvider.callInfo(brandID);

    return res.send(response(baseResponse.SUCCESS,callInfo));
};

exports.getRoomDetail = async function (req, res) {
    /**
     * 쿼리스트링: 날짜, 특정 숙소 id
     */
    const startDate=req.query.startDate;
    const endDate=req.query.endDate;
    const brandID = req.query.brandID ;
    const roomType = req.query.roomType

    if (!startDate) return res.send(errResponse(baseResponse.PRODUCT_START_DATE_EMPTY)); //6003, 날짜입력
    if (!endDate) return res.send(errResponse(baseResponse.PRODUCT_END_DATE_EMPTY)); //6004, 날짜입력
    if (!brandID) return res.send(errResponse(baseResponse.PRODUCT_ID_EMPTY)); // 6001 숙소 ID 입력필요
    if (!roomType) return res.send(errResponse(baseResponse.PRODUCT_ROOM_TYPE_EMPTY)); // 6001 숙소 ID 입력필요

    const room = await productProvider.roomDetail(brandID, startDate,endDate, roomType);

    return res.send(response(baseResponse.SUCCESS,room));


};

exports.getSearchList = async function (req, res) {
    /**
     * 쿼리스트링: 검색어
     * 바디: 시작,끝 날짜, 기준인원
     */
    const startDate=req.body.startDate;
    const endDate=req.body.endDate;
    const member=req.body.member;
    const search = req.query.search;

    if (!startDate) return res.send(errResponse(baseResponse.PRODUCT_START_DATE_EMPTY)); //6003, 날짜입력
    if (!endDate) return res.send(errResponse(baseResponse.PRODUCT_END_DATE_EMPTY)); //6004, 날짜입력
    if (!member) return res.send(errResponse(baseResponse.PRODUCT_MEMBER_EMPTY)); //6005, 기준인원입력
    if(!search) return res.send(errResponse(baseResponse.PRODUCT_MEMBER_EMPTY)); //6007, 검색어입력필요

    const searchList = await productProvider.searchList(startDate,endDate, member,search);

    return res.send(response(baseResponse.SUCCESS,searchList));



};
exports.premiumHotel = async function (req, res) {
    /**
     * 쿼리스트링: 지역명, 날짜, 기준인원
     */
    const region = req.query.city; //구역이 아니고 지역
    const startDate=req.query.startDate;
    const endDate=req.query.endDate;
    const member=req.query.member;

    if (!region) return res.send(errResponse(baseResponse.PRODUCT_REGION_EMPTY)); //6002, 지역입력
    if (!startDate) return res.send(errResponse(baseResponse.PRODUCT_START_DATE_EMPTY)); //6003, 날짜입력
    if (!endDate) return res.send(errResponse(baseResponse.PRODUCT_END_DATE_EMPTY)); //6004, 날짜입력
    if (!member) return res.send(errResponse(baseResponse.PRODUCT_MEMBER_EMPTY)); //6005, 기준인원입력

    const hotelList = await productProvider.premiumHotelList(region,startDate,endDate,member);

    return res.send(response(baseResponse.SUCCESS,hotelList));


};
exports.FourStarHotel = async function (req, res) {
    /**
     * 쿼리스트링: 지역명, 날짜, 기준인원
     */
    const region = req.query.city; //구역이 아니고 지역
    const startDate=req.query.startDate;
    const endDate=req.query.endDate;
    const member=req.query.member;

    if (!region) return res.send(errResponse(baseResponse.PRODUCT_REGION_EMPTY)); //6002, 지역입력
    if (!startDate) return res.send(errResponse(baseResponse.PRODUCT_START_DATE_EMPTY)); //6003, 날짜입력
    if (!endDate) return res.send(errResponse(baseResponse.PRODUCT_END_DATE_EMPTY)); //6004, 날짜입력
    if (!member) return res.send(errResponse(baseResponse.PRODUCT_MEMBER_EMPTY)); //6005, 기준인원입력

    const hotelList = await productProvider.FourStarHotelList(region,startDate,endDate,member);

    return res.send(response(baseResponse.SUCCESS,hotelList));


};
exports.FiveStarHotel = async function (req, res) {
    /**
     * 쿼리스트링: 지역명, 날짜, 기준인원
     */
    const region = req.query.city; //구역이 아니고 지역
    const startDate=req.query.startDate;
    const endDate=req.query.endDate;
    const member=req.query.member;

    if (!region) return res.send(errResponse(baseResponse.PRODUCT_REGION_EMPTY)); //6002, 지역입력
    if (!startDate) return res.send(errResponse(baseResponse.PRODUCT_START_DATE_EMPTY)); //6003, 날짜입력
    if (!endDate) return res.send(errResponse(baseResponse.PRODUCT_END_DATE_EMPTY)); //6004, 날짜입력
    if (!member) return res.send(errResponse(baseResponse.PRODUCT_MEMBER_EMPTY)); //6005, 기준인원입력

    const hotelList = await productProvider.FiveStarHotelList(region,startDate,endDate,member);

    return res.send(response(baseResponse.SUCCESS,hotelList));


};

exports.getUserTypeProducts = async function (req, res) {
    /**
     * 쿼리스트링: 지역명, 날짜, 기준인원
     */
    const userIdFromJWT = req.verifiedToken.userId;
    if (!userIdFromJWT)  return res.send(errResponse(baseResponse.TOKEN_EMPTY));

    const typeProductsList = await productProvider.typeProductsList(userIdFromJWT);

    return res.send(response(baseResponse.SUCCESS,typeProductsList));


};