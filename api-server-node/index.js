const express = require('./config/express');
const {logger} = require('./config/winston');

const port = 3000;
express().listen(port); //특정 포트를 기반으로 express를 실행시킴
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);