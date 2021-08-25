// 모든 유저 조회
async function selectUser(connection) {
  const selectUserListQuery = `
        select profileImgURL, user.nickname, user.mannerTemp, user.repurchaseRate, user.responseRate
        from user
        where status="YES";
            `
                ;
  const [userRows] = await connection.query(selectUserListQuery);
  return userRows;
}

// 이메일 체크
async function selectUserEmail(connection, email) {
  const selectUserEmailQuery = `
    SELECT userID, nickname, mannerTemp, repurchaseRate, responseRate, email,
           user.createAT, status
                FROM user 
                WHERE email = ?;
                `;
  const [emailRows] = await connection.query(selectUserEmailQuery, email);

  return emailRows[0];
}
// ID로 회원 조회, 특정 회원 조회 + 판매하는 상품이 있는 경우엔 괜찮지만 없으면?
async function selectUserID(connection, userID) {
  const selectUserIDQuery = `
    select profileImgURL, user.nickname, user.mannerTemp, user.repurchaseRate, user.responseRate
            from user
    where user.userID=?;
    
                `;
  const [userRows] = await connection.query(selectUserIDQuery, userID);

  return userRows[0];
}
// 닉네임으로 회원 조회 - 검색조회
async function selectUsernickname(connection,nickname) {
  const selectUsernicknameQuery = `
    SELECT userID, nickname, mannerTemp, repurchaseRate, responseRate, email,
           user.createAT, status
                FROM user 
                WHERE nickname = ?;
                `;
  const [nicknameRows] = await connection.query(selectUsernicknameQuery, nickname);

  return nicknameRows[0];
}

// 유저 생성
async function insertUserInfo(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
        INSERT INTO user (email, password, nickname, phone)
        VALUES (?, ?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );

  return insertUserInfoRow;
}

// 패스워드 체크
async function selectUserPassword(connection, selectUserPasswordParams) {
  const selectUserPasswordQuery =
      'SELECT userID, password FROM user WHERE email = ? and password = ?;'
  ;
  // password가 같은것을 검출해내지 못함 -< 혹시 글자수제한?
  const selectUserPasswordRow = await connection.query(
      selectUserPasswordQuery,
      selectUserPasswordParams
  );

  return selectUserPasswordRow;
}

// 유저 계정 상태 체크 (jwt 생성 위해 id 값도 가져온다.)
async function selectUserAccount(connection, userID) {
  const selectUserAccountQuery = `
        SELECT *
        FROM user
        WHERE userID = ?;
        `;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      userID
  );

  return selectUserAccountRow[0];
}

async function selectUserAccountEmail(connection, email) {
  const selectUserAccountQuery = `
        SELECT *
        FROM user
        WHERE email = ?;
        `;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
     email
  );

  return selectUserAccountRow[0];
}

async function updateUserInfo(connection, userID, nickname) {
  const updateUserQuery = `
  UPDATE user
  SET nickname = ?
  WHERE userID = ?;`;
  const updateUserRow = await connection.query(updateUserQuery, [nickname, userID]);
  console.log(updateUserRow);
  return updateUserRow[0];
}

// 모든 제품 조회
async function selectProduct(connection) {
  const selectProductListQuery = `
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
      left outer join Images as img on img.contentID = p.productID
      left outer join Neighborhood as n on p.userID = n.userID
      left outer join Region as r on n.regionID = r.ID
           join (select p.productID as id, count(cc.productID) as 채팅수
                 from Product as p
                   left outer join ChatCount as cc on cc.productID = p.productID
                 group by cc.productID) as chat
                on p.productID = chat.id
           join (select p.productID as likedId, count(l.likedProductID) as 좋아요수
                 from Product as p
                   left outer join Liked as l on p.productID = l.likedProductID
                 group by l.likedProductID) as liked
                on p.productID = liked.likedId
    ;
            `
  ;
  const [productRows] = await connection.query(selectProductListQuery);
  return productRows;
}

//제품명으로 제품 조회
async function selectProductTitle(connection, title) {
  const selectProductTitleQuery = `
    select
      p.status as status,
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
           left outer join Images as img on img.contentID = p.productID
           left outer join Neighborhood as n on p.userID = n.userID
           left outer join Region as r on n.regionID = r.ID
           join (select p.productID as id, count(cc.productID) as 채팅수
                 from Product as p
                        left outer join ChatCount as cc on cc.productID = p.productID
                 group by cc.productID) as chat
                on p.productID = chat.id
           join (select p.productID as likedId, count(l.likedProductID) as 좋아요수
                 from Product as p
                        left outer join Liked as l on p.productID = l.likedProductID
                 group by l.likedProductID) as liked
                on p.productID = liked.likedId
    where p.title like ?;
                `;
  const [productTitleRows] = await connection.query(selectProductTitleQuery, title);

  return productTitleRows;
}

// 유저의 판매중인 상품 조회

async function selectProductByID(connection, userID) {
  const selectUserIdQuery = `
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
      left outer join Images as img on img.contentID = p.productID
      left outer join Neighborhood as n on p.userID = n.userID
      left outer join Region as r on n.regionID = r.ID
           join (select p.productID as id, count(cc.productID) as 채팅수
                 from Product as p
                   left outer join ChatCount as cc on cc.productID = p.productID
                 group by cc.productID) as chat
                on p.productID = chat.id
           join (select p.productID as likedId, count(l.likedProductID) as 좋아요수
                 from Product as p
                   left outer join Liked as l on p.productID = l.likedProductID
                 group by l.likedProductID) as liked
                on p.productID = liked.likedId
    where user.userID=?;
    ;`
  ;
  const [sellingRow] = await connection.query(selectUserIdQuery, userID);
  return sellingRow;
}



//공지사항 조회
async function selectNotice(connection) {
  const selectNoticeQuery = `
    select n.title as 공지제목, date_format(n.createAT, '%Y년%m월%d일') as 날짜  , n.content as 내용 ,(select case when img.contentID=n.Id then img.imgURL else 'empty' end  ) as img
    from Notice as n left outer  join Images as img on n.Id = img.contentID;
    ;`
  ;
  const [noticeRow] = await connection.query(selectNoticeQuery);
  return noticeRow;
}

//특정유저의 채팅방 조회
async function selectUserChat (connection,userID) {
  const selectUserChatQuery = `
    select  c.roomID,p.userID as 판매자ID ,p.productID as 판매물품,user.profileImgURL as sellerProfile, user.nickname as sellerName, r.regionName as sellerRegion,
            date_format(c.createAT, '%m월%d일') as date
 , (select case when c.sellerStatus =0 then '대화불가'  else '대화가능' end) as checkStatus ,
 (select case when c.bookmark = 1 then '즐겨찾기됨'  else '즐겨찾기안됨' end) as bookmarkStatus,
(select case when c.alarm=1 then '알림설정'  else '알림 미설정' end) as alarmStatus
    from Product as p left outer join Chat as c on p.productID = c.productID
      join user on p.userID=user.userID
      left outer join  Neighborhood as n on p.userID= n.userID left outer join Region as r on r.Id=n.regionId
    where c.buyerStatus !='NO' && c.userID = user.userID and c.userID = ?  ;`
  ;

  const [chatRow] = await connection.query(selectUserChatQuery, userID);
  console.log(chatRow);
  return chatRow;

}



//제품 생성 + 이미지도 생성
async function insertProduct (connection, insertProductParams) {
  const insertProductQuery = `
        INSERT INTO Product (productID, userID, title, price, content)
        VALUES (?, ?, ?, ?,?);
    `;
  const insertProductRow = await connection.query(
      insertProductQuery,
      insertProductParams
  );

  return insertProductRow;
}

async function insertProductImages (connection, insertProductImagesParams ) {
  const insertProductImagesQuery = `
        INSERT INTO Images (contentID, imgURL)
        VALUES (?, ?);
    `;
  const insertProductImagesRow = await connection.query(
      insertProductImagesQuery,
      insertProductImagesParams
  );

  return insertProductImagesRow;
}
/////////////////////////////





//유저 상태 deleted로 변경 죽, 탈퇴
async function deleteUserInfo( connection, userID)
{
  const deleteUserQuery = `
  UPDATE user
  SET status="DELETED"
  WHERE  userID =? ;`;

  const deleteUserRow = await connection.query(deleteUserQuery, userID);
  return deleteUserRow[0];
};

async function selectProductByCategory(connection, categoryName)
{
  const selectProductByCategoryQuery = `
    select c.categoryName as 카테고리, p.productID as 상품코드, user.nickname as 판매자, p.title as 상품명, img.imgURL as img, p.price as 가격, (SELECT
                                                                                                                                   CASE
                                                                                                                                     WHEN TIMESTAMPDIFF(MINUTE, p.createAT, NOW()) <= 0 THEN '방금 전'
                                                                                                                                     WHEN TIMESTAMPDIFF(MINUTE,  p.createAT, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE,  p.createAT, NOW()), '분 전')
                                                                                                                                     WHEN TIMESTAMPDIFF(HOUR,  p.createAT, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR,  p.createAT, NOW()), '시간 전')
                                                                                                                                     WHEN TIMESTAMPDIFF(DAY, p.createAT, NOW()) < 30 THEN CONCAT(TIMESTAMPDIFF(DAY,  p.createAT, NOW()), '일 전')
                                                                                                                                     ELSE CONCAT(TIMESTAMPDIFF(MONTH,  p.createAT, NOW()), '달 전')
                                                                                                                                     END) as AGOTIME, p.priceProposition as 가격제안여부
    from Product as p join user on p.userID=user.userID
                      left outer  join Category as c on p.categoryName=c.categoryName
      left outer join Images as img on img.contentID = p.productID
    where p.categoryName = ?
    ;`
  ;
  const [productRow] = await connection.query(selectProductByCategoryQuery, categoryName);
  return productRow;

};

// 제품 정보 수정
async function updateProduct( connection, content,title,userID)
{
  const updateProductQuery = `
  UPDATE Product as p
  SET p.content=? ,p.updateAT=now()
  WHERE p.title = ? && p.userID = ? ;`;
  const updateProductQueryRow = await connection.query(updateProductQuery, [content,title,userID]);
  return updateProductQueryRow;
};

//동네생활게시판 전체 조회
async function selectBoard( connection,userID)
{
  const selectBoardQuery = `
    select b.topic as 주제, b.content      as 내용,
           r.regionName   as 지역명,
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
           left outer join (select b.topic as id, count(c.contentID) as 댓글수
                            from LivingBoard as b
                                   left outer join Comment as c on b.topic = c.contentID
                                   left outer join Images as img on img.contentID = b.topic
                            group by b.topic) as comment
                           on b.topic = comment.id
        ;
 
 `;
  const [BoardListRow] = await connection.query(selectBoardQuery,userID);
  return BoardListRow;
};

async function selectDetailBoard(connection, boardID){
  selectDetailBoardQuery = `
   select b.topic as topic ,b.content as 내용, r.regionName as 지역명, (SELECT 
CASE
    WHEN TIMESTAMPDIFF(MINUTE, b.createAT, NOW()) <= 0 THEN '방금 전'
    WHEN TIMESTAMPDIFF(MINUTE,  b.createAT, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE,  b.createAT, NOW()), '분 전')
    WHEN TIMESTAMPDIFF(HOUR,  b.createAT, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR,  b.createAT, NOW()), '시간 전')
    WHEN TIMESTAMPDIFF(DAY, b.createAT, NOW()) < 30 THEN CONCAT(TIMESTAMPDIFF(DAY,  b.createAT, NOW()), '일 전')
    ELSE CONCAT(TIMESTAMPDIFF(MONTH,  b.createAT, NOW()), '달 전') 
    END) as 올린시간 , comment.댓글수, cc.댓글단유저 , cc.댓글단유저프로필,cc.댓글단유저지역, cc.댓글단시간,cc.댓글내용 as 댓글내용
from LivingBoard as b join user on b.userID = user.userID
left outer join Neighborhood as n on user.userID= n.userID
left outer join Region as r on n.regionID= r.ID 
left outer join (select b.topic as id , count(c.contentID) as 댓글수
    from LivingBoard as b left outer join Comment as c on b.topic=c.contentID 
         left outer join Images as img on img.contentID = b.topic
    group by b.topic) as comment  on b.topic= comment.id
left outer join  (select user.nickname as 댓글단유저, user.profileImgURL as 댓글단유저프로필, r.regionName as 댓글단유저지역,
 (SELECT 
CASE
    WHEN TIMESTAMPDIFF(MINUTE, c.createAT, NOW()) <= 0 THEN '방금 전'
    WHEN TIMESTAMPDIFF(MINUTE,  c.createAT, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE,  c.createAT, NOW()), '분 전')
    WHEN TIMESTAMPDIFF(HOUR,  c.createAT, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR,  c.createAT, NOW()), '시간 전')
    WHEN TIMESTAMPDIFF(DAY, c.createAT, NOW()) < 30 THEN CONCAT(TIMESTAMPDIFF(DAY,  c.createAT, NOW()), '일 전')
    ELSE CONCAT(TIMESTAMPDIFF(MONTH,  c.createAT, NOW()), '달 전') 
    END) as 댓글단시간, c.content as 댓글내용, c.contentID as id
from user left outer join Neighborhood as n on user.userID= n.userID
  left outer join Region as r on n.regionID= r.ID 
          join Comment as c on c.userID= user.userID
) as cc
on b.topic = cc.id
where b.boardID=?
;
   `;
  const [detailBoardRow] = await connection.query(selectDetailBoardQuery,boardID);
  return detailBoardRow;
}

//게시판 글 작성
async function insertBoard (connection,insertBoardParams)
{
  insertBoardQuery = `
      insert into LivingBoard (topic,content,userID)
values (?,?,?);
  `;
  const [addBoardRow] = await connection.query(insertBoardQuery,insertBoardParams);
  return addBoardRow;
}

async function insertComment (connection,insertCommentParams)
{
  insertCommentQuery = `
      insert into Comment (contentID,content,userID) values (?,?,?);
  `;
  const [addCommentRow] = await connection.query(insertCommentQuery,insertCommentParams);
  return addCommentRow;
}

//판매중인 상품 숨기기
async function updateProductStatus(connection,title,userID) {
  updateStatusQuery = `
    update Product
    set status = "hide"
    where title = ? && userID=?
  `;
  const [updateStatusRow] = await connection.query(updateStatusQuery, [title, userID]);
  return updateStatusRow;
}

async function selectHideProduct(connection,userID) {
  const selectHideQuery = `
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
      left outer join Images as img on img.contentID = p.productID
      left outer join Neighborhood as n on p.userID = n.userID
      left outer join Region as r on n.regionID = r.ID
           join (select p.productID as id, count(cc.productID) as 채팅수
                 from Product as p
                   left outer join ChatCount as cc on cc.productID = p.productID
                 group by cc.productID) as chat
                on p.productID = chat.id
           join (select p.productID as likedId, count(l.likedProductID) as 좋아요수
                 from Product as p
                   left outer join Liked as l on p.productID = l.likedProductID
                 group by l.likedProductID) as liked
                on p.productID = liked.likedId
    where p.userID=? && (p.status="hide" || p.status="HIDE");
    ;`
  ;
  const [hideRow] = await connection.query(selectHideQuery, userID);
  return hideRow;
}

async function selectLikedProduct(connection,userID) {
  const selectLikedQuery = `
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
      left outer join Images as img on img.contentID = p.productID
      left outer join Neighborhood as n on p.userID = n.userID
      left outer join Region as r on n.regionID = r.ID
           join (select p.productID as id, count(cc.productID) as 채팅수
                 from Product as p
                   left outer join ChatCount as cc on cc.productID = p.productID
                 group by cc.productID) as chat
                on p.productID = chat.id
           join (select p.productID as likedId, count(l.likedProductID) as 좋아요수
                 from Product as p
                   left outer join Liked as l on p.productID = l.likedProductID
                 group by l.likedProductID) as liked
                on p.productID = liked.likedId
           join Liked as l on p.productID = l.likedProductID
    where l.userID=? ;
    ;`
  ;
  const [likeRow] = await connection.query(selectLikedQuery, userID);
  return likeRow;
}

module.exports = {
  selectUser,
  selectUserEmail,
  selectUserID,
  insertUserInfo,
  selectUserPassword,
  selectUserAccount,
  selectUserAccountEmail,
  updateUserInfo,
  selectProduct,
  selectProductTitle,
  selectProductByID,
  selectNotice,
  selectUserChat,
  insertProduct,
  insertProductImages,
  deleteUserInfo,
  selectProductByCategory,
  updateProduct,
  selectUsernickname,
  selectBoard,
  selectDetailBoard,
  insertBoard,
  insertComment,
  updateProductStatus,
  selectHideProduct,
  selectLikedProduct,
};
