async function AccBooking(connection,params)
{
    const BookedQuery = `
  
  call booking(? ,?, ?, ? , ? , ?, ? , ?, ?, ?); 
  
  `;

    const BookedRow = await connection.query(BookedQuery,params);
    return BookedRow[0];

};

async function payment(connection, bookedNum,point,userIdFromJWT)
{
    const payedQuery = `
  
  call pay(? ,?, ?); 
  
  `;
    const payRow = await connection.query(payedQuery,[bookedNum,point,userIdFromJWT]);
    return payRow[0];

};

async function productInfo(connection, bookedNum,userId)
{
    const productInfoQuery = `
  
  select  r.roomSomenail as 방썸네일 , a.brandName, rt.roomType, rt.roomOption, concat( bi.startDate,'~',bi.endDate)
         as 이용날짜, date_format(bi.createAT,'%Y.%m.%d') as 예약일시,
         (select case WEEKDAY(date_format(bi.createAT,'%Y-%m-%d'))
                                            when '0' then '(월)'  when '1' then '(화)'  when '3' then '(목)'
                                            when '4' then '(금)'    when '5' then '(토)' when '6' then '(일)'end ) as 예약요일,
      concat('체크인',date_format(r.checkIn,'%H:%i'),',체크아웃', date_format(r.checkOut,'%H:%i')) as 체크인아웃
    from BookingInfo as bi join AccommodationList as a on bi.brandID = a.brandID 
    join Room as r on r.roomID=bi.roomID
    join RoomType as rt on rt.idx=r.roomTypeID
    where bi.idx= ? ;
  
  `;
    const infoRow = await connection.query(productInfoQuery,bookedNum);
    return infoRow[0];

};

async function memInfo(connection, bookedNum)
{
    const memInfoQuery = `
  
    select  concat('이름: ',bm.memName,', ','휴대폰 번호: ',bm.memPhone) as 예약자정보
    from BookingMember as bm join BookingInfo as bi on bi.idx=bm.bookingID 
    where bm.bookingID = ?  ;
  
  `;
    const infoRow = await connection.query(memInfoQuery,bookedNum);
    return infoRow[0];

};

async function userInfo(connection, bookedNum)
{
    const userInfoQuery = `
  
    select  concat('이름: ',bm.userName,', ','휴대폰 번호: ',bm.userPhone) as 이용자정보
    from BookingMember as bm join BookingInfo as bi on bi.idx=bm.bookingID
    where bm.bookingID = ?  ;
  
  `;
    const infoRow = await connection.query(userInfoQuery,bookedNum);
    return infoRow[0];

};

async function costInfo(connection, bookedNum,userId)
{
    const costInfoQuery = `
    select bi.idx as 주문번호, a.brandName as 예약상품, p.payKind  as 결제수단,0 as 사용포인트 ,p.cost as 결제금액 
    from BookingInfo as bi join AccommodationList as a on bi.brandID = a.brandID 
    join Payment as p on p.bookingID= bi.idx
    where bi.idx = ? && bi.userId=?;
  `;
    const infoRow = await connection.query(costInfoQuery,[bookedNum,userId]);
    return infoRow[0];

};

async  function  selectReceipt(connection,bookedNum,userId )
{
   const getReceiptQuery = ` 
    select bi.idx as 예약번호, a.brandName as 상품명, date_format(p.createAt,"%Y-%m-%d %H:%i") as 거래일시,p.cost as 결제금액 ,p.payKind  as 결제수단
    from BookingInfo as bi join AccommodationList as a on bi.brandID = a.brandID
    join Payment as p on p.bookingID= bi.idx
    where bi.idx = ? && bi.userID=?;  
    `;
    const getReceiptRow = await connection.query(getReceiptQuery,[bookedNum,userId]);
    return getReceiptRow[0];
};

//취소할 정보 송출 후 취소 ㅎㅎ
async  function  cancelPayment(connection,bookedNum,userId )
{
    const getCancelQuery = `
        select  date_format(now(),'%Y.%m.%d %H:i') as cancelDate ,p.cost as refundCost , (select 0) as cancelCost , p.cost as refundScheduleCost, 
               concat(p.payKind,"       ",p.cost) as 'payKind and cost'
        from Payment as p join BookingInfo as bi on bi.idx=p.bookingID
        where bi.userID=? && bi.idx=?;

    `;
    const getCanceltRow = await connection.query(getCancelQuery,[userId,bookedNum]);
    return getCanceltRow[0];
};

//취소테이블에 취소정보 삽입 & bookingInfo 에서 데이터 삭제
async function cancelProcedure(connection,userId,bookedNum,reason )
{
    const addCancelQuery = `
         call insertCancel(?,?,?);
    `;
    const setCancelQuery = `
         call cancel (?,?);
    `;
    const getCanceltRow = await connection.query(addCancelQuery,[userId,bookedNum,reason]);
    const setCanceltRow = await connection.query(setCancelQuery,[userId,bookedNum]);

    return getCanceltRow[0],setCanceltRow[0];
};

module.exports = {
    AccBooking,
    payment,
    productInfo,
    memInfo,
    userInfo,
    costInfo,
    selectReceipt,
    cancelPayment,
    cancelProcedure,
};
