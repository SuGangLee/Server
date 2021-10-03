const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const productDao = require("./productDao");

// Provider: Read 비즈니스 로직 처리
//리뷰리스트 조회 , 날짜순
exports.reviewList = async function (idx) {

    const connection = await pool.getConnection(async (conn) => conn);
    const reviewListResult = await productDao.selectReviewList(connection,idx);
    connection.release();

    return reviewListResult;

};
//별점순 리뷰리스트
exports.reviewListByStar = async function (idx,order) {

  const connection = await pool.getConnection(async (conn) => conn);
  if (order='decs') {
      const reviewListResult = await productDao.selectReviewListByStarDesc(connection, idx);
      connection.release();
      return reviewListResult;
  }
  else if (order='acs') {
        const reviewListResult = await productDao.selectReviewListByStarAsc(connection, idx);
        connection.release();
        return reviewListResult;
    }
};
//총 별점 조회
exports.reviewStar = async function (idx) {

  const connection = await pool.getConnection(async (conn) => conn);
  const reviewStarResult = await productDao.selectReviewStar(connection,idx);
  connection.release();

  return reviewStarResult;

};

/**----------------------------------------------리뷰조회------------------------------------*/

//모텔 리스트 조회 - 구역, 날짜, 기준인원 쿼리스트링
exports.motelList = async function (region,startDate,endDate,member) {

    const connection = await pool.getConnection(async (conn) => conn);
    const params = [startDate,endDate,startDate,endDate,startDate,startDate,startDate,startDate,startDate,startDate,region,member]
    const motelListResult = await productDao.selectMotelList(connection,params);
    connection.release();

    return motelListResult;

};
//호텔 리스트 조회 - 구역, 날짜, 기준인원 쿼리스트링
exports.hotelList = async function (region,startDate,endDate,member) {

    const connection = await pool.getConnection(async (conn) => conn);
    const params = [startDate,endDate,startDate,endDate,startDate,startDate,startDate,region,member]
    const hotelListResult = await productDao.selectHotelList(connection,params);
    connection.release();

    return hotelListResult;

};

//프리미엄호텔 리스트 조회 - 구역, 날짜, 기준인원 쿼리스트링
exports.premiumHotelList = async function (region,startDate,endDate,member) {

    const connection = await pool.getConnection(async (conn) => conn);
    const params = [startDate,endDate,startDate,endDate,startDate,startDate,startDate,region,member]
    const FourStarHotel= await productDao.selectFourStarList(connection,params);
    connection.release();
    const FiveStarHotel= await productDao.selectFiveStarList(connection,params);
    connection.release();

    return {FourStarHotel,FiveStarHotel};

};
exports.FourStarHotelList = async function (region,startDate,endDate,member) {

    const connection = await pool.getConnection(async (conn) => conn);
    const params = [startDate,endDate,startDate,endDate,startDate,startDate,startDate,region,member]
    const premiumHotelListResult = await productDao.selectFourStarList(connection,params);
    connection.release();

    return premiumHotelListResult;

};
exports.FiveStarHotelList = async function (region,startDate,endDate,member) {

    const connection = await pool.getConnection(async (conn) => conn);
    const params = [startDate,endDate,startDate,endDate,startDate,startDate,startDate,region,member]
    const premiumHotelListResult = await productDao.selectFiveStarList(connection,params);
    connection.release();

    return premiumHotelListResult;

};

// 특정 숙소의 방리스트 조회- 날짜, 모텔 ID 쿼리스트링
exports.roomList = async function (brandID,startDate,endDate) {


    const params = [startDate,endDate,startDate,endDate,startDate,startDate,startDate,startDate,startDate,startDate,brandID]

    const connection = await pool.getConnection(async (conn) => conn);
    brandIDparams = [brandID,brandID,brandID,brandID,brandID,brandID,brandID,brandID];
    const brandInfo = await productDao.roomsBrandInfo(connection,brandIDparams) ;
    connection.release();

    const roomList = await productDao.roomsRoomList(connection,params);
    connection.release();

    const reviewList = await productDao.roomsReviewList(connection,brandID);
    connection.release();

    return {brandInfo,roomList,reviewList};

};

//특정 숙소의 판매자 정보 조회
exports.sellerInfo = async function (brandID) {



    const connection = await pool.getConnection(async (conn) => conn);
    const sellerInfoResult = await productDao.sellerInfo(connection,brandID) ;
    connection.release();

   return sellerInfoResult;
};
//특정 숙소의 전화번호조회
exports.callInfo = async function (brandID) {

    const connection = await pool.getConnection(async (conn) => conn);
    const callResult = await productDao.selectCall(connection,brandID) ;
    connection.release();

    return callResult
};

// 특정 숙소의 방 세부 조회- 날짜, 모텔 ID 쿼리스트링
exports.roomDetail = async function (brandID,startDate,endDate,roomType) {

     roomType = "%" + roomType +  "%";
    const params = [startDate,endDate,startDate,endDate,startDate,startDate,startDate,roomType,startDate,startDate,startDate,roomType,roomType,roomType,brandID,roomType]

    const connection = await pool.getConnection(async (conn) => conn);
    const roomDetailInfo = await productDao.roomDetailInfo(connection,params) ;
    connection.release();

    return roomDetailInfo;

};

//검색조회 startDate,endDate, member,search

exports.searchList =async function (startDate,endDate, member,search)
{
  search = "%"+search+"%";
  const params = [startDate,endDate,startDate,endDate,startDate,startDate,startDate,startDate,startDate,
                    startDate,search,search,search,member];

    const connection = await pool.getConnection(async (conn) => conn);
    const searchListResult = await productDao.searchList(connection,params) ;
    connection.release();

    return searchListResult;
};

//찜하기 근처 숙소 조회 3개

exports.typeProductsList =async function (userId)
{

    const connection = await pool.getConnection(async (conn) => conn);
    const result = await productDao.yourTypeList(connection,userId) ;
    connection.release();

    return result;
};