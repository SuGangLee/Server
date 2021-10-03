module.exports = function(app) {
    const booking = require('./bookingController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //예약하기 API
    app.post('/app/night-booking' ,jwtMiddleware,booking.postAccBooking );

    //결제하기 API
    app.post('/app/booking/payment',jwtMiddleware,booking.postPayment);

    //예약내역 상세 조회 APㅑ
    app.get('/app/booking/info',jwtMiddleware,booking.getBookInfo);

// 영수증 조회
    app.get('/app/booking/receipt',jwtMiddleware,booking.getReceipt);

    //예약취소
    app.post('/app/booking/cancel',jwtMiddleware,booking.postCancel);


};