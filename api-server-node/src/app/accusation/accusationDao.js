//상품 신고
async function insertAccusationProduct(connection, productTitle, title, content) {
    const insertAccusationProductQuery = `
    insert into Accusation (accusationed ,title,content)
    values (?,?,?)
    ;`
    ;
    const [accusationRow] = await connection.query(insertAccusationProductQuery, [productTitle, title, content]);

    return accusationRow;
};

//판매자 신고
async function insertAccusationUser(connection, userID, title, content) {
    const insertAccusationUserQuery = `
    insert into Accusation (accusationed ,title,content)
    values (?,?,?)
    ;`
    ;
    const [accusationRow] = await connection.query(insertAccusationUserQuery, [userID, title, content]);

    return accusationRow;
};

//추가된 신고 확인 조회
async function selectAccusation(connection,accusationed) {
    const selectAccusationQuery = `
    select accusationed as 신고대상,title as 신고명 , content as 신고사유 from Accusation where accusationed =? 
    ;`
    ;
    const [accusationRow] = await connection.query(selectAccusationQuery , accusationed);

    return accusationRow;
};



module.exports = {
    insertAccusationProduct,
    insertAccusationUser,
    selectAccusation

};