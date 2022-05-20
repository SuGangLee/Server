const mysql = require('mysql2/promise');
const {logger} = require('./winston');

// TODO: 본인의 DB 계정 입력
const pool = mysql.createPool({
    host: 'sugang-db.cf2wsaxl7da7.ap-northeast-2.rds.amazonaws.com',
    user: 'sugangdb',
    port: '3306',
    password: '',
    database: 'CarrotMarket'
});

module.exports = {
    pool: pool
};
