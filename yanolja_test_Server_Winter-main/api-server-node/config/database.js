const mysql = require('mysql2/promise');
const {logger} = require('./winston');

// TODO: 본인의 DB 계정 입력
const pool = mysql.createPool({
    host: 'lisugangdb.cf6svnf8io2k.ap-northeast-2.rds.amazonaws.com',
    user: 'lisugang',
    port: '3306',
    password: '',
    database: 'yanolja'
});

module.exports = {
    pool: pool
};
