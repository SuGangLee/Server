//최근날짜순 리뷰 정렬
async function selectReviewList(connection, idx) {
    const selectReviewQuery = `
        select distinct 
               user.nickname as 닉네임,
               CAST(ROUND(r.total,2) AS char(3))       as 별점,
               rt.roomType   as 사용한방,
               rt.roomOption as '사용한 방의 옵션' ,date_format(r.createAt,'%Y-%m-%d') as 후기쓴날짜
, r.content as 내용, reviewImageURl.이미지 as 후기이미지
        from Review as r join User as user
        on user.idx=r.userID
            join BookingInfo as b on b.roomID=r.roomID
            join Room as room on b.roomID=room.roomID
            join RoomType as rt on room.roomTypeID=rt.idx
            join AccommodationList as a on b.brandID=a.brandID
            left join (
            select reviewImg.roomID as reviewRoom,GROUP_CONCAT( reviewImg.reImg SEPARATOR ',') AS 이미지 ,reviewImg.별점 as 별점
            from ( select ri.reviewImage as reImg, ri.roomID as roomID , CAST(ROUND(AVG(r.total),2) AS char(3)) as 별점
            from ReviewImages as ri join Review as r on ri.roomID=r.roomID
            where ri.userID= r.userID) as reviewImg
            ) as reviewImageURl on reviewImageURl.reviewRoom= r.roomID
        where a.brandID = ?
        order by r.createAt desc
        ;
                `;
    const [reviewRows] = await connection.query(selectReviewQuery, idx);
    return reviewRows;
}
//별점순 리뷰정렬
async function selectReviewListByStarDesc(connection, idx) {
    const selectReviewQuery = `
        select user.nickname as 닉네임,
               CAST(ROUND(r.total,2) AS char(3))        as 별점,
               rt.roomType   as 사용한방,
               rt.roomOption as '사용한 방의 옵션' ,date_format(r.createAt,'%Y-%m-%d') as 후기쓴날짜
, r.content as 내용, reviewImageURl.이미지 as 후기이미지
        from Review as r join User as user
        on user.idx=r.userID
            join BookingInfo as b on b.roomID=r.roomID
            join Room as room on b.roomID=room.roomID
            join RoomType as rt on room.roomTypeID=rt.idx
            join AccommodationList as a on b.brandID=a.brandID
            left join (
            select reviewImg.roomID as reviewRoom,GROUP_CONCAT( reviewImg.reImg SEPARATOR ',') AS 이미지
            from ( select ri.reviewImage as reImg, ri.roomID as roomID
            from ReviewImages as ri join Review as r on ri.roomID=r.roomID
            where ri.userID= r.userID) as reviewImg
            ) as reviewImageURl on reviewImageURl.reviewRoom= r.roomID
        where a.brandID = ?
        order by r.total desc
        ;
                `;
    const [reviewRows] = await connection.query(selectReviewQuery, idx);
    return reviewRows;
}
async function selectReviewListByStarAsc(connection, idx) {
    const selectReviewQuery = `
        select user.nickname as 닉네임,
               CAST(ROUND(r.total,2) AS char(3))      as 별점,
               rt.roomType   as 사용한방,
               rt.roomOption as '사용한 방의 옵션' ,date_format(r.createAt,'%Y-%m-%d') as 후기쓴날짜
, r.content as 내용, reviewImageURl.이미지 as 후기이미지
        from Review as r join User as user
        on user.idx=r.userID
            join BookingInfo as b on b.roomID=r.roomID
            join Room as room on b.roomID=room.roomID
            join RoomType as rt on room.roomTypeID=rt.idx
            join AccommodationList as a on b.brandID=a.brandID
            left join (
            select reviewImg.roomID as reviewRoom,GROUP_CONCAT( reviewImg.reImg SEPARATOR ',') AS 이미지
            from ( select ri.reviewImage as reImg, ri.roomID as roomID
            from ReviewImages as ri join Review as r on ri.roomID=r.roomID
            where ri.userID= r.userID) as reviewImg
            ) as reviewImageURl on reviewImageURl.reviewRoom= r.roomID
        where a.brandID = ?
        order by r.total desc
        ;
                `;
    const [reviewRows]= await connection.query(selectReviewQuery, idx);
    return reviewRows;
}
//별점정보 조회
async function selectReviewStar(connection, idx) {
    const selectReviewStarQuery = `
        select CAST(ROUND(avg(total),2) AS char(3)) as 최근6개월누적평점, CAST(ROUND(avg(kind),2) AS char(3))  as 친절도,CAST(ROUND(avg(clean),2) AS char(3)) as 청결도
             ,CAST(ROUND(avg(conven),2) AS char(3))as 편의성 ,CAST(ROUND(avg(equip),2) AS char(3)) as 비품만족도 ,count(total) as 후기개수
        from Review as r join AccommodationList as a on r.brandID= a.brandID
        where date(r.createAt) > date(subdate(now(),interval 6 month)) && r.brandID=?;
                `;
    const [reviewStarRows]= await connection.query(selectReviewStarQuery, idx);
    return reviewStarRows;
}
/** ---------------------------------------------------------------------------------------------------------*/
//특정 지역의 모텔리스트 조회
async function selectMotelList(connection, params) {
    const selectMotelQuery = `
        select distinct region.dName as 지역명,
                        a.category                                                     as 카테고리,
                        a.brandID as 숙소아이디,
                        a.brandName                                                       숙박업소명,
                        a.brandSomenail                                                as 대표사진
                ,
                        (select case when star.평균별점 is null then 0 else star.평균별점 end) as 평균별점,
                        star.후기갯수,
                        rentPrice.대실가격,
                     (select case when (bi.status ='booked') && (bi.startDate > str_to_date(?, '%Y-%m-%d') && bi.startDate >= str_to_date(?, '%Y-%m-%d'))
                                                                    || (bi.endDate <= str_to_date(?, '%Y-%m-%d') && bi.endDate < str_to_date(?, '%Y-%m-%d')) 
                                  then nightPrice.숙박가격 when( startDate is null ) ||  (endDate is null) then  nightPrice.숙박가격            
                         else "예약마감" end) as 숙박가격
        
        from AccommodationList as a join
             (select a.brandID as idx, CAST(ROUND(AVG(total),2) AS char(3)) as 평균별점, count(total) as 후기갯수
              from AccommodationList as a
                       left join Review as review on a.brandID = review.brandID
              group by a.brandID) as star on star.idx = a.brandID

                 left join Price as p on a.brandID = p.brandID
                 left join RoomType on p.roomTypeID = RoomType.idx
                 left join Room on RoomType.idx = Room.roomTypeID
                 left join BookingInfo as bi on Room.roomID = bi.roomID
                 left join
             (select a.brandID                           as idx,
                     (select case when  WEEKDAY(?) between 0 and 3 then min(p.weekPrice)
                                  when WEEKDAY(?) = 4 then min(p.fridayPrice)
                                  when WEEKDAY(?) = 5 then min(p.satPrice)
                                  else min(p.sunPrice) end) as 대실가격
              from AccommodationList as a
                       left join Price as p on a.brandID = p.brandID
              where p.isRent = 'yes'
              group by a.brandID) as rentPrice on rentPrice.idx = a.brandID
                 left join
             (select a.brandID                           as idx,
                     (select case when  WEEKDAY(?) between 0 and 3 then min(p.weekPrice) 
                         when WEEKDAY(?) = 4 then min(p.fridayPrice) 
                         when WEEKDAY(?) = 5 then min(p.satPrice) else min(p.sunPrice) end)
                         as 숙박가격
              from AccommodationList as a
                       left join Price as p on a.brandID = p.brandID
              where p.isRent = 'no'
              group by a.brandID) as nightPrice on nightPrice.idx = a.brandID

                 left join (select d.idx as idx, d.districtName as dName, d.postNum as num, a.name as brandName
                            from district as d
                                     join (select left (a.postNum, 3) as num, a.brandName as name
                                           from AccommodationList as a) as a
                                          on d.postNum like concat('%', a.num, '%')
        ) as region on region.brandName = a.brandName
        where a.category = '모텔' && region.idx=? && Room.standardPeople >= ?
        group by a.brandID
        ;
                `;
    const [motelRows]= await connection.query(selectMotelQuery, params);
    return motelRows;
}

//특정 지역의 호텔리스트 조회
async function selectHotelList(connection, params) {
    const selectHotelQuery = `
        select distinct a.brandID as brandID,
                        region.dName                 as 지역명,
                        a.category                   as 카테고리,
                        a.brandName                     숙박업소명,
                        a.brandSomenail              as 대표사진
                ,
                        IFNULL(star.평균별점, '0')       as 평균별점,
                       
                        star.후기갯수,
                        (select case
                                    when (bi.status = 'booked') && (bi.startDate > str_to_date(?, '%Y-%m-%d') && bi.startDate >= str_to_date(?, '%Y-%m-%d')) 
|| (bi.endDate <= str_to_date(?, '%Y-%m-%d') && bi.endDate < str_to_date(?, '%Y-%m-%d')) then nightPrice.숙박가격
                                    when (bi.startDate is null) &&
(bi.endDate is null) then nightPrice.숙박가격
                                    else "예약마감" end) as 숙박가격
        from AccommodationList as a
                 join
             (select a.brandID                              as idx,
                     CAST(ROUND(AVG(total), 2) AS char(3))  as 평균별점,
                     count(total)                           as 후기갯수,
                     CAST(ROUND(AVG(kind), 2) AS char(3))   as 친절도,
                     CAST(ROUND(AVG(clean), 2) AS char(3))  as 청결도,
                     CAST(ROUND(AVG(conven), 2) AS char(3)) as 편의성,
                     CAST(ROUND(AVG(equip), 2) AS char(3))  as 비품만족도
              from AccommodationList as a
                       left join Review as review on a.brandID = review.brandID
              group by a.brandID) as star on star.idx = a.brandID

                 left join Price as p on a.brandID = p.brandID
                 left join RoomType on p.roomTypeID = RoomType.idx
                 left join Room on RoomType.idx = Room.roomTypeID
                 left join BookingInfo as bi on Room.roomID = bi.roomID
                 left join
             (select a.brandID                             as idx,
                     (select case
                                 when WEEKDAY(?) between 0 and 3 then min(p.weekPrice)
                                 when WEEKDAY(?) = 4 then min(p.fridayPrice)
                                 when WEEKDAY(?) = 5 then min(p.satPrice)
                                 else min(p.sunPrice) end) as 숙박가격
              from AccommodationList as a
                       left join Price as p on a.brandID = p.brandID
              where p.isRent = 'no'
              group by a.brandID) as nightPrice on nightPrice.idx = a.brandID

                 left join (select d.idx as idx, d.districtName as dName, d.postNum as num, a.name as brandName
                            from district as d
                                     join (select left (a.postNum, 3) as num, a.brandName as name
                                           from AccommodationList as a) as a
                                          on d.postNum like concat('%', a.num, '%')
        ) as region on region.brandName = a.brandName
        where a.category like '%호텔%' && region.idx=? && Room.standardPeople >= ?
        group by a.brandID
        ;
                `;
    const [hotelRows]= await connection.query(selectHotelQuery, params);
    return hotelRows;
}

//특정 지역의- 서울의 오성급 호텔리스트 조회

async function selectFiveStarList(connection, params) {
    const selectHotelQuery = `
        select distinct a.brandID as brandID,
                        concat(a.options,'급') as 급,
                        region.rName                 as 지역명,
                        a.category                   as 카테고리,
                        a.brandName                     숙박업소명,
                        a.brandSomenail              as 대표사진
                ,
                        IFNULL(star.평균별점, '0')       as 평균별점,
                       
                        star.후기갯수,
                        (select case
                                    when (bi.status = 'booked') && (bi.startDate > str_to_date(?, '%Y-%m-%d') && bi.startDate >= str_to_date(?, '%Y-%m-%d')) 
|| (bi.endDate <= str_to_date(?, '%Y-%m-%d') && bi.endDate < str_to_date(?, '%Y-%m-%d')) then nightPrice.숙박가격
                                    when (bi.startDate is null) &&
(bi.endDate is null) then nightPrice.숙박가격
                                    else "예약마감" end) as 숙박가격
        from AccommodationList as a
                 join
             (select a.brandID                              as idx,
                     CAST(ROUND(AVG(total), 2) AS char(3))  as 평균별점,
                     count(total)                           as 후기갯수,
                     CAST(ROUND(AVG(kind), 2) AS char(3))   as 친절도,
                     CAST(ROUND(AVG(clean), 2) AS char(3))  as 청결도,
                     CAST(ROUND(AVG(conven), 2) AS char(3)) as 편의성,
                     CAST(ROUND(AVG(equip), 2) AS char(3))  as 비품만족도
              from AccommodationList as a
                       left join Review as review on a.brandID = review.brandID
              group by a.brandID) as star on star.idx = a.brandID

                 left join Price as p on a.brandID = p.brandID
                 left join RoomType on p.roomTypeID = RoomType.idx
                 left join Room on RoomType.idx = Room.roomTypeID
                 left join BookingInfo as bi on Room.roomID = bi.roomID
                 left join
             (select a.brandID                             as idx,
                     (select case
                                 when WEEKDAY(?) between 0 and 3 then min(p.weekPrice)
                                 when WEEKDAY(?) = 4 then min(p.fridayPrice)
                                 when WEEKDAY(?) = 5 then min(p.satPrice)
                                 else min(p.sunPrice) end) as 숙박가격
              from AccommodationList as a
                       left join Price as p on a.brandID = p.brandID
              where p.isRent = 'no'
              group by a.brandID) as nightPrice on nightPrice.idx = a.brandID

                 left join (select r.idx as idx, r.regionName as rName, d.postNum as num, a.name as brandName
                            from district as d
                                     join (select left (a.postNum, 3) as num, a.brandName as name
                                           from AccommodationList as a) as a
                                          on d.postNum like concat('%', a.num, '%')
                     join Region as r on r.idx = d.regionID 
        ) as region on region.brandName = a.brandName
        where a.category like '%호텔%' && region.idx=? && Room.standardPeople >= ? && a.options like '%5%'
        group by a.brandID
        ;
                `;
    const [hotelRows]= await connection.query(selectHotelQuery, params);
    return hotelRows;
}

// 특정지역의 사성급 조회

async function selectFourStarList(connection, params) {
    const selectHotelQuery = `
        select distinct a.brandID as brandID,
                        concat(a.options,'급') as 급,
                        region.rName                 as 지역명,
                        a.category                   as 카테고리,
                        a.brandName                     숙박업소명,
                        a.brandSomenail              as 대표사진
                ,
                        IFNULL(star.평균별점, '0')       as 평균별점,
                       
                        star.후기갯수,
                        (select case
                                    when (bi.status = 'booked') && (bi.startDate > str_to_date(?, '%Y-%m-%d') && bi.startDate >= str_to_date(?, '%Y-%m-%d')) 
|| (bi.endDate <= str_to_date(?, '%Y-%m-%d') && bi.endDate < str_to_date(?, '%Y-%m-%d')) then nightPrice.숙박가격
                                    when (bi.startDate is null) &&
(bi.endDate is null) then nightPrice.숙박가격
                                    else "예약마감" end) as 숙박가격
        from AccommodationList as a
                 join
             (select a.brandID                              as idx,
                     CAST(ROUND(AVG(total), 2) AS char(3))  as 평균별점,
                     count(total)                           as 후기갯수,
                     CAST(ROUND(AVG(kind), 2) AS char(3))   as 친절도,
                     CAST(ROUND(AVG(clean), 2) AS char(3))  as 청결도,
                     CAST(ROUND(AVG(conven), 2) AS char(3)) as 편의성,
                     CAST(ROUND(AVG(equip), 2) AS char(3))  as 비품만족도
              from AccommodationList as a
                       left join Review as review on a.brandID = review.brandID
              group by a.brandID) as star on star.idx = a.brandID

                 left join Price as p on a.brandID = p.brandID
                 left join RoomType on p.roomTypeID = RoomType.idx
                 left join Room on RoomType.idx = Room.roomTypeID
                 left join BookingInfo as bi on Room.roomID = bi.roomID
                 left join
             (select a.brandID                             as idx,
                     (select case
                                 when WEEKDAY(?) between 0 and 3 then min(p.weekPrice)
                                 when WEEKDAY(?) = 4 then min(p.fridayPrice)
                                 when WEEKDAY(?) = 5 then min(p.satPrice)
                                 else min(p.sunPrice) end) as 숙박가격
              from AccommodationList as a
                       left join Price as p on a.brandID = p.brandID
              where p.isRent = 'no'
              group by a.brandID) as nightPrice on nightPrice.idx = a.brandID

                 left join (select r.idx as idx, r.regionName as rName, d.postNum as num, a.name as brandName
                            from district as d
                                     join (select left (a.postNum, 3) as num, a.brandName as name
                                           from AccommodationList as a) as a
                                          on d.postNum like concat('%', a.num, '%')
                     join Region as r on r.idx = d.regionID 
        ) as region on region.brandName = a.brandName
        where a.category like '%호텔%' && region.idx=? && Room.standardPeople >= ? && a.options like '%4%'
        group by a.brandID
        ;
                `;
    const [hotelRows]= await connection.query(selectHotelQuery, params);
    return hotelRows;
}
/** --------------------------------------방리스트-------------------------------------------------------------------  */
//방리스트 위에 숙소정보부분
async function roomsBrandInfo(connection, brandID) {
    const brandInfoQuery = `
        select distinct a.category                                                     as 카테고리,
                        a.brandName                                                       숙박업소명,
                        totalImg.전체이미지                                                 as 전체이미지
                ,
                        IFNULL(star.평균별점, '0')       as 평균별점,
                        IFNULL(star.친절도, '0')        as 친절도,
                        IFNULL(star.청결도, '0')        as 청결도,
                        IFNULL(star.편의성, '0')        as 편의성,
                        IFNULL(star.비품만족도, 0)        as 비품만족도,
                        star.후기개수,
                        a.brandIntro                                                   as 숙소소개,
                        a.bookingNotice                                                as 이용안내,
                        a.address                                                      as 주소
        from AccommodationList as a
                 join
             (select a.brandID as idx, CAST(ROUND(AVG(review.total),2) AS char(3)) as 평균별점,
                     cast(round(avg(kind),2)as char(3))
                         as 친절도, cast(round(avg(clean),2)as char(3)) as 청결도, cast(round(avg(conven),2)as char(3)) 편의성, cast(round(avg(equip),2)as char(3))
                         as 비품만족도,
                     count(review.total) as 후기개수 
              from AccommodationList as a
                       left join Review as review on a.brandID = review.brandID
              where date (review.createAt) > date(subdate(now(),interval 6 month))
        group by a.brandID
            ) as star on star.idx= a.brandID
                
             join
            (select a.brandID as brandID , CONCAT(a.brandSomeNail ,',',repImg.대표이미지,',',roomSomenail.방썸네일,',',roomImg.방이미지,',',facImg.시설이미지,',',
            equip.비품이미지,',',lobImg.로비이미지,',',outImg.외관이미지 ) as 전체이미지
                
            from AccommodationList as a left join
            (select  IFNULL(group_concat(e.equipmentImages SEPARATOR ',' ),'null') as 비품이미지
            , a.brandID as brandID from EquipmentImages as e right join
            AccommodationList as a on e.brandID = a.brandID
            where a.brandID = ?) as equip on a.brandID = equip.brandID
            left join
            (select IFNULL(group_concat(e.exteriorImages SEPARATOR ',' ),'null') as 외관이미지, a.brandID
            as brandID from ExteriorImages as e right join AccommodationList as a on e.brandID = a.brandID
            where a.brandID = ?) as outImg on a.brandID = outImg.brandID
            left join
            (select IFNULL(group_concat(f.facilityImages SEPARATOR ',' ),'null') as 시설이미지, a.brandID as brandID
            from FacilityImages as f right join AccommodationList as a on f.brandID = a.brandID
            where a.brandID = ?) as facImg on a.brandID = facImg.brandID
            left join 
                (select IFNULL(group_concat(l.lobbyImages SEPARATOR ',' ),'null') as 로비이미지, a.brandID as brandID
            from LobbyImages as l right join AccommodationList as a on l.brandID = a.brandID
            where a.brandID = ?) as lobImg on a.brandID = lobImg.brandID
            left join 
                (select IFNULL(group_concat(r.representImages SEPARATOR ',' ),'null') as 대표이미지, a.brandID as brandID
            from RepresentImages as r right join AccommodationList as a on r.brandID = a.brandID
            where a.brandID = ?) as repImg on a.brandID = repImg.brandID
            left join 
                (select IFNULL(group_concat(room.roomSomenail ,',',r.roomImages SEPARATOR ',' ),'null') as 방이미지, a.brandID as brandID
            from RoomImages as r right join AccommodationList as a on r.brandID = a.brandID
                join Room as room on room.brandID=a.brandID
            where a.brandID = ?) as roomImg on a.brandID = roomImg.brandID
            left join 
                (select IFNULL(group_concat(r.roomSomenail SEPARATOR ',') ,'null')as 방썸네일, a.brandID as brandID
            from AccommodationList as a join Room as r on r.brandID = a.brandID
            where a.brandID = ?) as roomSomenail on a.brandID= roomSomenail.brandID
        ) as totalImg on a.brandID = totalImg.brandID
        where a.brandID = ?;
                `;
    const [brandInfoRows]= await connection.query(brandInfoQuery, brandID);
    return brandInfoRows;
}

async function roomsRoomList (connection,params) {
    const roomListQuery = `

        select distinct a.brandName,
                        room.roomID                                                              as roomID,
                        room.roomSomenail as '방 대표 이미지', roomType.roomType as 방타입,
                        roomType.roomOption                                                      as 방옵션
                ,
                        room.standardPeople                                                      as 기준인원,
                        room.maximumPeople                                                       as 최대인원,
                        (select case when a.category = '모텔' then rentPrice.대실가격 else "대실없음" end) as 대실,
                        (select case
                                    when (bi.status = 'booked') && bi.startDate between str_to_date(?, '%Y-%m-%d') and str_to_date(?, '%Y-%m-%d')
                            || bi.endDate between str_to_date(?, '%Y-%m-%d') and str_to_date(?, '%Y-%m-%d')  then '예약마감' else nightPrice.숙박가격 end )as 숙박가격,

                        date_format(room.checkIn,'%H:%i')       as 체크인시간

        from AccommodationList as a
            join Room as room on a.brandID = room.brandID
            left join RoomType as roomType on room.roomTypeID = roomType.idx
            left join BookingInfo as bi on room.roomID = bi.roomID
            left join
            (select room.roomTypeID                  as roomID,
            (select case
            when WEEKDAY(?) between 0 and 3 then p.weekPrice
            when WEEKDAY(?) = 4 then p.fridayPrice
            when WEEKDAY(?) = 5 then p.satPrice
            else p.sunPrice end) as 대실가격
            from Room as room
            left join RoomType as roomType on room.roomTypeID = roomType.idx
            left join Price as p on room.roomTypeID = p.roomTypeID
            where p.isRent = 'yes'
            group by room.roomTypeID) as rentPrice on rentPrice.roomID = roomType.idx
            left join
            (select room.roomTypeID                  as roomID,
            (select case
            when WEEKDAY(?) between 0 and 3 then p.weekPrice
            when WEEKDAY(?) = 4 then p.fridayPrice
            when WEEKDAY(?) = 5 then p.satPrice
            else p.sunPrice end) as 숙박가격
            from Room as room
            left join RoomType as roomType on room.roomTypeID = roomType.idx
            left join Price as p on room.roomTypeID = p.roomTypeID
            where p.isRent = 'no'
            group by room.roomTypeID) as nightPrice on nightPrice.roomID = roomType.idx
        where a.brandID = ?;
     `;
    const [roomListRows]= await connection.query(roomListQuery, params);
    return roomListRows;
}

async function roomsReviewList (connection, brandID)
{
    const reviewListQuery = `
        select user.nickname      as 닉네임
             , r.total            as 별점
             , rt.roomType        as 사용한방
             , rt.roomOption as '사용한 방의 옵션' ,date_format(r.createAt, '%Y-%m-%d') as 후기쓴날짜
             , r.content          as 내용
             , reviewImageURl.이미지 as 후기이미지
        from Review as r
                 join User as user
        on user.idx=r.userID
            join BookingInfo as b on b.roomID=r.roomID
            join AccommodationList as a on b.brandID=a.brandID
            join Room as room on b.roomID=room.roomID
            join RoomType as rt on room.roomTypeID=rt.idx
            left join (
            select reviewImg.roomID as reviewRoom,GROUP_CONCAT( reviewImg.reImg SEPARATOR ',') AS 이미지
            from ( select ri.reviewImage as reImg, ri.roomID as roomID
            from ReviewImages as ri join Review as r on ri.roomID=r.roomID
            where ri.userID= r.userID) as reviewImg
            ) as reviewImageURl on reviewImageURl.reviewRoom= r.roomID
        where a.brandID= ?
        order by r.total desc
            limit 2
        ;
        `;
    const [reviewListRows]= await connection.query(reviewListQuery, brandID);
    return reviewListRows;
}

//판매자정보조회
async function sellerInfo(connection, brandID)
{
    const sellerInfoQuery = `
        select  s.sellerName as 대표자명 ,a.brandName as 상호명,a.address as 사업자주소, s.email as 전자우편주소 , s.phone as 연락처,
               s.registrationNumber as 사업자등록번호
        from SellerInfo as s join AccommodationList as a on a.brandID= s.brandID
        where a.brandID=?;

    `;
    const [sellerInfoRows]= await connection.query(sellerInfoQuery, brandID);
    return sellerInfoRows;
}
//번호조회
async function selectCall(connection, brandID)
{
    const callInfoQuery = `
        select   s.phone as 전화하기
        from SellerInfo as s join AccommodationList as a on a.brandID= s.brandID
        where a.brandID=?;
    `;
    const [callInfoRow]= await connection.query(callInfoQuery, brandID);
    return callInfoRow;
}

// 방 상세
async function roomDetailInfo(connection,params)
{
    const roomDetailInfoQuery = `
        select distinct rt.roomType                                                         as 방타입,
                        rt.roomOption as 방옵션,
                        concat('기준인원', r.standardPeople, '명', '(최대', r.maximumPeople, '명)') as 인원,
                        a.brandName                                                         as 숙소명,
                        concat(roomSomenail.방썸네일,',',roomImg.방이미지) as 방이미지,
                        a.bookingNotice as 예약정보,
                        (select case
                                    when a.category = '모텔' then rentPrice.대실가격
                                    when rentPrice.대실가격 is null then "대실없음"
                                    else "대실없음" end)                                        as 대실,
                      
                                    (select case
                                                when (bi.status = 'booked') && bi.startDate between str_to_date(?, '%Y-%m-%d') and str_to_date(?, '%Y-%m-%d')
                                        || bi.endDate between str_to_date(?, '%Y-%m-%d') and str_to_date(?, '%Y-%m-%d')  then '예약마감' else nightPrice.숙박가격 end )
as 숙박가격,
                                    
                         date_format( r.checkIn,'%H:%i' )as 체크인, date_format( r.checkOut,'%H:%i' )as 체크아웃

        from AccommodationList as a
                 join Room as r on r.brandID = a.brandID
                 join RoomType as rt on rt.brandID = r.brandID
                 left join BookingInfo as bi on r.roomID = bi.roomID
                 left join
             (select room.roomTypeID                  as roomID,
                     (select case
                                 when WEEKDAY(?) between 0 and 3 then p.weekPrice
                                 when WEEKDAY(?) = 4 then p.fridayPrice
                                 when WEEKDAY(?) = 5 then p.satPrice
                                 else p.sunPrice end) as 대실가격
              from Room as room
                       left join RoomType as roomType on room.roomTypeID = roomType.idx
                       left join Price as p on room.roomTypeID = p.roomTypeID
              where p.isRent = 'yes' &&  roomType.roomType like ?
              group by room.roomTypeID) as rentPrice on rentPrice.roomID = rt.idx
                 join
             (select room.roomTypeID                  as roomID,
                     (select case
                                 when WEEKDAY(?) between 0 and 3 then p.weekPrice
                                 when WEEKDAY(?) = 4 then p.fridayPrice
                                 when WEEKDAY(?) = 5 then p.satPrice
                                 else p.sunPrice end) as 숙박가격
              from Room as room
                       left join RoomType as roomType on room.roomTypeID = roomType.idx
                       left join Price as p on room.roomTypeID = p.roomTypeID
              where p.isRent = 'no' && roomType.roomType like ?
              group by room.roomTypeID) as nightPrice on nightPrice.roomID = rt.idx

                 left join (select rt.idx as roomTID, group_concat(ri.roomImages SEPARATOR ',') as 방이미지
                            from RoomImages as ri
                                     right join Room as r on r.roomID = ri.roomID
                                     join RoomType as rt on rt.idx = r.roomTypeID
                            where rt.roomType like ?
        )roomImg on rt.idx = roomImg.roomTID
                 left join (select group_concat(r.roomSomenail SEPARATOR ',') as 방썸네일, rt.idx as roomTID
                            from AccommodationList as a join Room as r on r.brandID = a.brandID
                                                        join RoomType as rt on rt.idx =r.roomTypeID
                            where rt.roomType like ?
        ) as roomSomenail on rt.idx= roomSomenail.roomTID
        where a.brandID =? && rt.roomType like ?;
    `;
    const [roomDetailInfoRow]= await connection.query(roomDetailInfoQuery, params);
    return roomDetailInfoRow;
}

async function searchList(connection,params)
{
    const searchListQuery = `
        select distinct a.category                                                     as 카테고리,
                        a.brandName                                                       숙박업소명,
                        a.brandSomenail                                                as 대표사진
                ,
                        IFNULL(star.평균별점, '0')       as 평균별점,
                        star.후기갯수,
                        rentPrice.대실가격,
                        (select case
                                    when (bi.status = 'booked') && (bi.startDate > str_to_date(?, '%Y-%m-%d') || bi.startDate <
                                          str_to_date(?, '%Y-%m-%d')) && (bi.endDate < str_to_date(?, '%Y-%m-%d') || bi.endDate > str_to_date(?, '%Y-%m-%d'))then nightPrice.숙박가격
                                    when (startDate is null) || (endDate is null) then nightPrice.숙박가격
                                    else "예약마감" end)                                   as 숙박가격
        from AccommodationList as a
                 join
             (select a.brandID as idx, CAST(ROUND(AVG(total), 2) AS char(3)) as 평균별점, count(total) as 후기갯수
              from AccommodationList as a
                       left join Review as review on a.brandID = review.brandID
              group by a.brandID) as star on star.idx = a.brandID

                 left join Price as p on a.brandID = p.brandID
                 left join RoomType on p.roomTypeID = RoomType.idx
                 left join Room on RoomType.idx = Room.roomTypeID
                 left join BookingInfo as bi on Room.roomID = bi.roomID
                 left join
             (select a.brandID                             as idx,
                     (select case
                                 when WEEKDAY(?) between 0 and 3 then min(p.weekPrice)
                                 when WEEKDAY(?) = 4 then min(p.fridayPrice)
                                 when WEEKDAY(?) = 5 then min(p.satPrice)
                                 else min(p.sunPrice) end) as 대실가격
              from AccommodationList as a
                       left join Price as p on a.brandID = p.brandID
              where p.isRent = 'yes'
              group by a.brandID) as rentPrice on rentPrice.idx = a.brandID
                 left join
             (select a.brandID                             as idx,
                     (select case
                                 when WEEKDAY(?) between 0 and 3 then min(p.weekPrice)
                                 when WEEKDAY(?) = 4 then min(p.fridayPrice)
                                 when WEEKDAY(?) = 5 then min(p.satPrice)
                                 else min(p.sunPrice) end) as 숙박가격
              from AccommodationList as a
                       left join Price as p on a.brandID = p.brandID
              where p.isRent = 'no'
              group by a.brandID) as nightPrice on nightPrice.idx = a.brandID
                 join district as d on d.postNum like concat('%', left(a.postNum,3),'%')
        where a.brandName like ? || a.address like ? || d.districtName = ? && Room.standardPeople >= ?
    group by a.brandID
        ;
    
    
    `;
    const searchListRow = await connection.query(searchListQuery,params);
    return searchListRow[0];
}

//당신의 취향저격 베스트- 찜하기(가장 마지막으로 찜한) 인근 숙소 조회 3개
async function yourTypeList (connecion,userId)
{
    const yourTypeQuery = `
        select distinct a.brandID,
                        region.dName                 as 지역명,
                        a.category                   as 카테고리,
                        a.brandName                     숙박업소명,
                        a.brandSomenail              as 대표사진
                ,
                        IFNULL(star.평균별점, '0')       as 평균별점,
                        star.후기갯수,
                        (select case
                                    when (bi.status = 'booked') && (bi.startDate > str_to_date('2021-08-18', '%Y-%m-%d') || bi.startDate >= str_to_date('2021-08-18', '%Y-%m-%d')) 
&& (bi.endDate <= str_to_date('2021-08-18', '%Y-%m-%d') || bi.endDate < str_to_date('2021-08-18', '%Y-%m-%d')) then nightPrice.숙박가격
                                    when (bi.startDate is null) &&
(bi.endDate is null) then nightPrice.숙박가격
                                    else "예약마감" end) as 숙박가격

        from AccommodationList as a
                 join
             (select a.brandID as idx, CAST(ROUND(AVG(total), 2) AS char(3)) as 평균별점, count(total) as 후기갯수

              from AccommodationList as a
                       left join Review as review on a.brandID = review.brandID
              group by a.brandID) as star on star.idx = a.brandID

                 left join Price as p on a.brandID = p.brandID
                 left join RoomType on p.roomTypeID = RoomType.idx
                 left join Room on RoomType.idx = Room.roomTypeID
                 left join BookingInfo as bi on Room.roomID = bi.roomID
                 left join
             (select a.brandID                             as idx,
                     (select case
                                 when WEEKDAY(20210822) between 0 and 3 then min(p.weekPrice)
                                 when WEEKDAY(20210822) = 4 then min(p.fridayPrice)
                                 when WEEKDAY(20210822) = 5 then min(p.satPrice)
                                 else min(p.sunPrice) end) as 숙박가격
              from AccommodationList as a
                       left join Price as p on a.brandID = p.brandID
              where p.isRent = 'no'
              group by a.brandID) as nightPrice on nightPrice.idx = a.brandID

                 left join (select d.idx as idx, d.districtName as dName, d.postNum as num, a.name as brandName
                            from district as d
                                     join (select left (a.postNum, 3) as num, a.brandName as name
                                           from AccommodationList as a) as a
                                          on d.postNum like concat('%', a.num, "%")
        ) as region on region.brandName = a.brandName
                 join
             (select (select case
                                 when indexing.로 = test.로 then 4
                                 when indexing.구 = test.구 then 3
                                 when indexing.시 = test.시 then 2
                                 else 1 end) as 정렬,
                     indexing.brandID        as AllbrandID,
                     indexing.찜개수            as 찜개수
              from (select substring_index(a.address, ' ', 3) as 로,
                           substring_index(a.address, ' ', 2) as 구,
                           substring_index(a.address, ' ', 1) as 시,
                           a.brandID                          as brandID,
                           count(l.idx)                       as 찜개수
                    from AccommodationList as a
                             left join Liked as l on a.brandID = l.brandID
                    group by a.brandID) as indexing
                       join
                   (select substring_index(likeAdd.likedAddress, " ", 3) as 로,
                           substring_index(likeAdd.likedAddress, " ", 2) as 구,
                           substring_index(likeAdd.likedAddress, " ", 1) as 시,
                           likeAdd.brandID                               as brandID
                    from (select distinct a.address as likedAddress, a.brandID as brandID
                          from Liked as liked
                                   join AccommodationList as a on a.brandID = liked.brandID
                          where liked.idx =
                                (select IFNULL(max(liked.idx), 1) from Liked as liked where liked.userID = 1)
                         ) as likeAdd
                   ) as test on test.brandID !=indexing.brandID) as pe on pe.AllbrandID = a.brandID
        group by pe.AllbrandID
        order by pe.정렬 desc, pe.찜개수 desc limit 3;
    `;
    const typeRow = await connecion.query(yourTypeQuery,userId);
    return typeRow[0];
}
module.exports = {
    selectReviewStar,
    selectReviewList,
    selectReviewListByStarDesc,
    selectReviewListByStarAsc,
    selectMotelList,
    selectHotelList,
    roomsBrandInfo,
    roomsRoomList,
    roomsReviewList,
    sellerInfo,
    selectCall,
    roomDetailInfo,
    searchList,
    selectFourStarList,
    selectFiveStarList,
    yourTypeList,
};