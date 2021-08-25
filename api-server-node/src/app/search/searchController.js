const jwtMiddleware = require("../../../config/jwtMiddleware");
const searchProvider = require("../../app/search/searchProvider");
//const userService = require("../../app/search/searchService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");

const {emit} = require("nodemon");

/**
 * API No. 22
 * API Name : 상품명 검색
 * [GET] /app/search/product-title?=??
 */

exports.getSearchTitle = async function (req, res) {
    /**
     * Query String:  title
     */
    const title = req.query.title;

   if (title)
    {
        const searchListByTitle = await searchProvider.retrieveSearchListTitle(title);
        return res.send(response(baseResponse.SUCCESS, searchListByTitle));
    }
    else {
        // 검색어를 입력하세요
        return res.send(errResponse(baseResponse.SEARCH_EMPTY));
    }
}

/**
 * API No. 23
 * API Name : 상품명 검색
 * [GET] /app/search/product-title?=??
 */
exports.getSearchNickname = async function (req, res) {
    /**
     * Query String:  nickname
     */
    const nickname = req.query.nickname;

    if (nickname) {
        // 닉네임으로 검색조회
        const searchListBynickname = await searchProvider.retrieveSearchListNickname(nickname);
        return res.send(response(baseResponse.SUCCESS, searchListBynickname));
    }
    else {
        // 검색어를 입력하세요
        return res.send(errResponse(baseResponse.SEARCH_EMPTY));
    }
}

exports.getSearchPopular= async function (req, res) {


        const popularList = await searchProvider.retrievePopularList();
        return res.send(response(baseResponse.SUCCESS, popularList));

}

exports.getSearchBoard = async function (req, res) {
    /**
     * Query String:  content
     */
    const content = req.query.content;

    if (content)
    {
        const searchListByBoard = await searchProvider.retrieveSearchListBoard(content);
        return res.send(response(baseResponse.SUCCESS, searchListByBoard));
    }
    else {
        // 검색어를 입력하세요
        return res.send(errResponse(baseResponse.SEARCH_EMPTY));
    }
}