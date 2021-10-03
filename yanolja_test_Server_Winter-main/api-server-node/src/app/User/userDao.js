// 모든 유저 조회
async function selectUser(connection) {
  const selectUserListQuery = `
                SELECT email, nickname ,idx
                FROM User;
                `;
  const [userRows] = await connection.query(selectUserListQuery);
  return userRows;
}

// userId 회원 조회
async function selectUserId(connection, userId) {
  const selectUserIdQuery = `
                 SELECT idx, email, nickname 
                 FROM User
                 WHERE idx = ?;
                 `;
  const [userRow] = await connection.query(selectUserIdQuery, userId);
  return userRow;
}

// 이메일로 회원 조회
async function selectUserEmail(connection, email) {
  const selectUserEmailQuery = `
                SELECT email, nickname 
                FROM User
                WHERE email = ?;
                `;
  const [emailRows] = await connection.query(selectUserEmailQuery, email);
  return emailRows;
}
//닉네임 회원조회
async function selectUserNickname(connection, nickname) {
  const selectUserNicknameQuery = `
                SELECT email, nickname 
                FROM User
                WHERE nickname = ?;
                `;
  const [nicknameRows] = await connection.query(selectUserNicknameQuery, nickname);
  return nicknameRows;
}

// my야놀자 정보 조회
async function selectUserPage(connection, userId) {
  const selectUserIdQuery = `
    select user.nickname as 닉네임 , user.point as 포인트,  (select case when user.isLinkCoin = 'no' then "계정연동 후 사용하세요"
                                                                   else user.coin end) as 야놀자코인
         , (select case when coupon.couponCount is null then 0
                        else coupon.couponCount end) as 쿠폰함 ,(select case when myCart.myCartCount  is null then 0
                                                                          else myCart.myCartCount  end) as 장바구니
    from User as user left join (select User.nickname as nick,count(*) as couponCount 
from Coupon as c join User on User.idx=c.userID 
group by User.idx ) as coupon on user.nickname = coupon.nick
      left join
      (select user.idx as myCartId ,count(*) as myCartCount
      from User as user join Cart as cart on user.idx=cart.userID
      group by user.idx ) as myCart on myCart.myCartId=user.idx
where user.idx=?;
                 `;
  const [userRow] = await connection.query(selectUserIdQuery, userId);
  return userRow;
}

// 유저 생성
async function insertUserInfo(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
        INSERT INTO User (email, password, nickname,phone)
        VALUES (?, ?, ?,?);
    `;
  const insertUserInfoRow = await connection.query(
      insertUserInfoQuery,
      insertUserInfoParams
  );

  return insertUserInfoRow;
}

// 패스워드 체크
async function selectUserPassword(connection, selectUserPasswordParams) {
  const selectUserPasswordQuery = `
        SELECT email,idx, nickname, password
        FROM User
        WHERE email = ?  AND password = ?;`;
  const selectUserPasswordRow = await connection.query(
      selectUserPasswordQuery,
      selectUserPasswordParams
  );

  return selectUserPasswordRow;
}

// jwt userID 패스워드 체크
async function selectUserPasswordCheck(connection, selectUserPasswordParams) {
  const selectUserPasswordQuery = `
        SELECT email,idx, nickname, password
        FROM User
        WHERE idx = ?  AND password = ?;`;
  const selectUserPasswordRow = await connection.query(
      selectUserPasswordQuery,
      selectUserPasswordParams
  );
  return selectUserPasswordRow[0];
}

// 유저 계정 상태 체크 (jwt 생성 위해 id 값도 가져온다.)
async function selectUserAccount(connection, email) {
  const selectUserAccountQuery = `
        SELECT status, email, idx
        FROM User
        WHERE email = ?;`;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      email
  );
  return selectUserAccountRow[0];
}

async function updateUserInfo(connection, id, nickname) {
  const updateUserQuery = `
  UPDATE User
  SET nickname = ?
  WHERE idx = ?;`;
  const updateUserRow = await connection.query(updateUserQuery, [nickname, id]);
  return updateUserRow[0];
}

/** 찜목록 조회 */
async function selectLikedList(connection, params) {
  const LikedListQuery = `
    select distinct a.category                                                               as 카테고리,
                    a.brandName                                                                 숙박업소명,
                    a.brandSomenail                                                          as 대표사진
        ,
                    IFNULL(star.평균별점, '0')       as 평균별점,
                    star.후기갯수,
                    (select case when a.category = '모텔' then rentPrice.대실가격 else "대실없음" end) as 대실,
                    (select case
                              when (bi.status='booked')&&(bi.startDate > str_to_date(?, '%Y-%m-%d') || bi.startDate >=
                                    str_to_date(?, '%Y-%m-%d')) && (bi.endDate <= str_to_date(?, '%Y-%m-%d') || bi.endDate < str_to_date(?, '%Y-%m-%d')) then nightPrice.숙박가격
                              when (startDate is null) ||
                                   (endDate is null) then nightPrice.숙박가격
                              else "예약마감" end)                                               as 숙박가격
    from AccommodationList as a
           join
         (select a.brandID as idx, CAST(ROUND(AVG(total),2) AS char(3)) as 평균별점, count(total) as 후기갯수
          from AccommodationList as a
                 left join Review as review on a.brandID = review.brandID
          group by a.brandID) as star on star.idx = a.brandID

           left join Price as p on a.brandID = p.brandID
           left join RoomType on p.roomTypeID = RoomType.idx
           left join Room on RoomType.idx = Room.roomTypeID
           left join BookingInfo as bi on Room.roomID = bi.roomID
           left join
         (select a.brandID                         as idx,
                 (select case when  WEEKDAY(?) between 0 and 3 then min(p.weekPrice)
                              when WEEKDAY(?) = 4 then min(p.fridayPrice)
                              when WEEKDAY(?) = 5 then min(p.satPrice)
                              else min(p.sunPrice) end) as 대실가격
          from AccommodationList as a
                 left join Price as p on a.brandID = p.brandID
          where p.isRent = 'yes'
          group by a.brandID) as rentPrice on rentPrice.idx = a.brandID
           left join
         (select a.brandID                         as idx,
                 (select case when  WEEKDAY(?) between 0 and 3 then min(p.weekPrice)
                              when WEEKDAY(?) = 4 then min(p.fridayPrice)
                              when WEEKDAY(?) = 5 then min(p.satPrice)
                              else min(p.sunPrice) end) as 숙박가격
          from AccommodationList as a
                 left join Price as p on a.brandID = p.brandID
          where p.isRent = 'no'
          group by a.brandID) as nightPrice on nightPrice.idx = a.brandID

           left join (select d.idx as idx, d.districtName as dName, d.postNum as num, a.name as brandName
                      from district as d
                             right join (select left (a.postNum, 3) as num, a.brandName as name
                                         from AccommodationList as a) as a
                                        on d.postNum like concat('%', a.num, '%')
    ) as region on region.brandName = a.brandName
           join Liked as liked on liked.brandID = a.brandID
           join User as user
    on user.idx=liked.userID
    where Room.standardPeople >=? && user.idx= ?
    group by a.brandID
    ;

  
  `;
  const likedListRow = await connection.query(LikedListQuery, params);
  return likedListRow[0];
}

//나의 장바구니 리스트 조회
async function selectCartList(connection,userId)
{
  const cartListQuery = `
    select distinct a.brandName                          as 숙소명,
                    a.address                            as 주소,
                    room.roomSomenail as '방 대표 이미지', roomType.roomType as 방타입,
                    roomType.roomOption                  as 방옵션
        ,
                    room.standardPeople                  as 기준인원,
                    room.maximumPeople                   as 최대인원,
                    date_format(c.startDate, '%Y-%m-%d') as 예약시작일,
                    (select case WEEKDAY(c.startDate)
                              when '0' then '(월)'
                              when '1' then '(화)'
                              when '2' then '(수)'
                              when '3' then '(목)'
                              when '4' then '(금)'
                              when '5' then '(토)'
                              when '6' then '(일)'
                              end)                       as 예약시작요일,
                    date_format(c.endDate, '%Y-%m-%d')   as 예약마감일,
                    (select case WEEKDAY(c.endDate)
                              when '0' then '(월)'
                              when '1' then '(화)'
                              when '2' then '(수)'
                              when '3' then '(목)'
                              when '4' then '(금)'
                              when '5' then '(토)'
                              when '6' then '(일)'
                              end)                       as 예약마감요일,
                    date_format(room.checkIn, '%H:%i')   as 체크인,
                    date_format(room.checkOut, '%H:%i')  as 체크아웃,
                    (select case
                              when a.category = '모텔' then rentPrice.대실가격
                              when rentPrice.대실가격 is null then "대실없음"
                              else "대실없음" end)           as 대실,
                    (select case
                              when (bi.startDate >= str_to_date(c.startDate, '%Y-%m-%d') || bi.startDate >=
                                    str_to_date(c.startDate, '%Y-%m-%d')) && (bi.endDate <= str_to_date(c.endDate, '%Y-%m-%d') || bi.endDate <= str_to_date(c.endDate, '%Y-%m-%d')) then nightPrice.숙박가격
                              when (bi.startDate is null) &&
(bi.endDate is null) then nightPrice.숙박가격
                              else "예약마감" end)           as 숙박가격

    from AccommodationList as a
           join Room as room on a.brandID = room.brandID
           join Cart as c on c.roomID = room.roomID
           join User as user
    on c.userID= user.idx
      left join RoomType as roomType on room.roomTypeID = roomType.idx
      left join BookingInfo as bi on room.roomID=bi.roomID
      left join
      (select room.roomTypeID as roomID , (select case when WEEKDAY(c.startDate) between 0 and 3 then p.weekPrice
      when WEEKDAY(c.startDate) = 4 then p.fridayPrice
      when WEEKDAY(c.startDate) = 5 then p.satPrice
      else p.sunPrice end) as 대실가격
      from Room as room
      left join RoomType as roomType on room.roomTypeID = roomType.idx
      left join Price as p on room.roomTypeID =p.roomTypeID
      join Cart as c on c.roomID= room.roomID
      where p.isRent ='yes'
      group by room.roomTypeID) as rentPrice on rentPrice.roomID = room.roomID
      left join
      (select room.roomTypeID as roomID , (select case when WEEKDAY(c.startDate) between 0 and 3 then p.weekPrice
      when WEEKDAY(c.startDate) = 4 then p.fridayPrice
      when WEEKDAY(c.startDate) = 5 then p.satPrice
      else p.sunPrice end) as 숙박가격
      from Room as room
      left join RoomType as roomType on room.roomTypeID = roomType.idx
      left join Price as p on room.roomTypeID =p.roomTypeID
      join Cart as c on c.roomID= room.roomID
      where p.isRent ='no'
      group by room.roomTypeID) as nightPrice on nightPrice.roomID = room.roomID

    where user.idx=?;
  
  
      `;

  const cartListRows = await connection.query(cartListQuery,userId);
  return cartListRows[0];

}

async function couponList (connection,userId)
{
  const couponListQuery = `
     select distinct c.couponTitle as 쿠폰명 , concat (date_format(c.startDate, '%Y-%m-%d'),'~',date_format(c.endDate, '%Y-%m-%d')) as 기간 ,
      concat(
      TIMESTAMPDIFF( day,now(),c.endDate),'일',
      TIMESTAMPDIFF( hour,now(),c.endDate) % 24,
      '시간',
      TIMESTAMPDIFF( hour,now(),c.endDate) %60,'분'
      ) as 남은기간, c.content
    from User
      join Coupon as c on c.userID=User.idx
    where User.idx=?;
    `;

  const couponCountQuery = `
  select couponCount.개수 as 쿠폰개수 
  from User
           join (select userID,count(*) as 개수 from Coupon group by userID) as couponCount on couponCount.userID = User.idx
    where User.idx= ? ;

  `;

  const couponRow = await connection.query(couponListQuery,userId);
  const couponCount = await connection.query(couponCountQuery,userId);

  return [couponCount[0],couponRow[0]];
};
//찜하기
async function insertLiked (connection, userId,brandID)
{
  const insertLikeQuery = `
  insert into Liked (userID,brandID) values ( ?,?) ;
  `;
  const insertLikeRow = await connection.query(insertLikeQuery,[userId,brandID]);
  return insertLikeRow[0];
};
// 장바구니담기
async function insertCart (connection,params)
{
  const insertCartQuery = `
  call insertCart(?,?,?,?,?);
  `;
  const insertCartRow = await connection.query(insertCartQuery,params);
  return insertCartRow[0];
};

// 닉네임 변경
async function updateNickname (connection,nickname,userId)
{
  const updateNicknameQuery = `
   update User set nickname = ? , updateAt= now() where idx=?; 
  `;
  const nicknameQuery = `
  select nickname from User where idx=?
  `;
  const updateNicknameRow = await connection.query(updateNicknameQuery,[nickname,userId]);
  const changeNickname =  await connection.query(nicknameQuery,userId);

  return changeNickname[0];
};
//비번 변경
async function updatePassword (connection,password,userId)
{
  const updatePasswordQuery = `
   update User set password = ?  , updateAt= now()  where idx=?; 
  `;

  const updatePasswordRow = await connection.query(updatePasswordQuery,[password,userId]);
  return updatePasswordRow[0];
};


//폰번호 변경
async function updatePhone (connection,phone,userId)
{
  const updatePhoneQuery = `
   update User set phone = ? , updateAt= now()  where idx=?; 
  `;
  const phoneQuery = `
  select phone from User where idx=?
  `;
  const updatePhoneRow = await connection.query(updatePhoneQuery,[phone,userId]);
  const changePhone = await connection.query(phoneQuery,userId);
  return changePhone[0];
};

//회원탈퇴
async function outUser (connection,userId,reason)
{
  const outUserQuery = `
   update User set status = 'DELETED' , updateAt= now(), reason = ?  where idx=?; 
  `;

  const result = await connection.query(outUserQuery,[reason,userId]);
  return result[0];
};

//폰번호 조회
async function selectUserPhone (connection,userId)
{
  const Query = `
   select phone as 폰번호 from User where idx= ?;
  `;

  const result = await connection.query(Query,userId);
  return result[0];
};

//폰번호 조회
async function getEmail(connection,userId)
{
  const Query = `
   select phone as 폰번호 ,email from User where idx= ?;
  `;

  const result = await connection.query(Query,userId);
  return result[0];
};

module.exports = {
  selectUser,
  selectUserEmail,
  selectUserId,
  selectUserNickname,
  selectUserPage,
  insertUserInfo,
  selectUserPassword,
  selectUserAccount,
  updateUserInfo,
  selectLikedList,
  selectCartList,
  couponList,
  insertLiked,
  insertCart,
  selectUserPasswordCheck,
  updateNickname,
  updatePassword,
  updatePhone,
  outUser,
  selectUserPhone,
  getEmail,

};