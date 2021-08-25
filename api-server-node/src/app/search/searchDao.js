
async function selectSearchTitle(connection, title) {
    const selectTitleQuery = `
        select
            r.regionName       as 판매자지역,
            p.title            as 상품명,
            img.imgURL         as img,
            p.price            as 가격,
            (SELECT CASE
                        WHEN TIMESTAMPDIFF(MINUTE, p.createAT, NOW()) <= 0 THEN '방금 전'
                        WHEN TIMESTAMPDIFF(MINUTE, p.createAT, NOW()) < 60
                            THEN CONCAT(TIMESTAMPDIFF(MINUTE, p.createAT, NOW()), '분 전')
                        WHEN TIMESTAMPDIFF(HOUR, p.createAT, NOW()) < 24
                            THEN CONCAT(TIMESTAMPDIFF(HOUR, p.createAT, NOW()), '시간 전')
                        WHEN TIMESTAMPDIFF(DAY, p.createAT, NOW()) < 30
                            THEN CONCAT(TIMESTAMPDIFF(DAY, p.createAT, NOW()), '일 전')
                        ELSE CONCAT(TIMESTAMPDIFF(MONTH, p.createAT, NOW()), '달 전')
                        END)     as AGOTIME,
            chat.채팅수 as chated,
            liked.좋아요수 as liked
        from Product as p
                 join user on p.userID = user.userID
                 join Images as img on img.contentID = p.productID
                 join Neighborhood as n on p.userID = n.userID
                 join Region as r on n.regionID = r.ID
                 join (select p.productID as id, count(cc.productID) as 채팅수
                       from Product as p
                                join ChatCount as cc on cc.productID = p.productID
                       group by cc.productID) as chat
                      on p.productID = chat.id
                 join (select p.productID as likedId, count(l.likedProductID) as 좋아요수
                       from Product as p
                                join Liked as l on p.productID = l.likedProductID
                       group by l.likedProductID) as liked
                      on p.productID = liked.likedId
        where p.title like concat("%",?,"%"); 
                `;
    const [searchTitleRows] = await connection.query(selectTitleQuery, title);
    return searchTitleRows;
}

async function selectSearchNickname(connection, nickname) {
    const selectNicknameQuery = `
       select  user.profileImgURL, user.nickname,  r.regionName 
       from user  join Neighborhood as n on user.userID = n.userID
                  join Region as r on n.regionID = r.ID
        where user.nickname like concat("%",?,"%");
                `;
    const [searchTitleRows] = await connection.query(selectNicknameQuery, nickname);

    return searchTitleRows;
}

async function selectPopular (connection){
    const selectPopularQuery = `
        select c.categoryName as 카테고리, liked.likedId as 인기상품ID, liked.likedTitle as 인기상품명, liked.price as 가격,  liked.좋아요수 as 좋아요,
               liked.img as productImg
        from (select p.productID             as likedId,
                     count(l.likedProductID) as 좋아요수,
                     p.categoryName          as productCategory,
                     p.title                 as likedTitle,
                     p.price                 as price,
                     img.imgURL as img       
              from Product as p
                       join Liked as l on p.productID = l.likedProductID
                       join Images as img on img.contentID = p.productID
              group by l.likedProductID) as liked
                 join Category as c on liked.productCategory = c.categoryName
        order by liked.좋아요수 DESC
        limit 15;
                `;
    const [popularRows] = await connection.query(selectPopularQuery);

    return popularRows;
}

async function selectSearchBoard (connection,content){
    const selectSearchBoardQuery = `
        select b.content        as 우리동네질문,
               r.regionName     as 지역명,
               (SELECT CASE
                           WHEN TIMESTAMPDIFF(MINUTE, b.createAT, NOW()) <= 0 THEN '방금 전'
                           WHEN TIMESTAMPDIFF(MINUTE, b.createAT, NOW()) < 60
                               THEN CONCAT(TIMESTAMPDIFF(MINUTE, b.createAT, NOW()), '분 전')
                           WHEN TIMESTAMPDIFF(HOUR, b.createAT, NOW()) < 24
                               THEN CONCAT(TIMESTAMPDIFF(HOUR, b.createAT, NOW()), '시간 전')
                           WHEN TIMESTAMPDIFF(DAY, b.createAT, NOW()) < 30
                               THEN CONCAT(TIMESTAMPDIFF(DAY, b.createAT, NOW()), '일 전')
                           ELSE CONCAT(TIMESTAMPDIFF(MONTH, b.createAT, NOW()), '달 전')
                           END) as 올린시간,
               comment.댓글수
        from LivingBoard as b
                 join user on b.userID = user.userID
                 left outer join Neighborhood as n on user.userID = n.userID
                 left outer join Region as r on n.regionID = r.ID
                 left outer join (select b.id as id, count(c.contentID) as 댓글수
                                  from LivingBoard as b
                                           left outer join Comment as c on b.id = c.contentID
                                           left outer join Images as img on img.contentID = b.id
                                  group by b.id) as comment
                                 on b.id = comment.id
            where b.content like concat("%",?,"%");
                `;
    const [BoardRows] = await connection.query(selectSearchBoardQuery,content);

    return BoardRows;
}
module.exports = {
    selectSearchTitle,
    selectSearchNickname,
    selectPopular,
    selectSearchBoard,
}