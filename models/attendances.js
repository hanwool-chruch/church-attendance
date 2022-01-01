module.exports = function (sequelize, DataTypes) {
    return sequelize.define('attendances', {
        WORSHIP_DT: {
            type: DataTypes.STRING(14),
            primaryKey: true
        },
        MEMBER_ID: DataTypes.INTEGER,
        DEPART_CD: DataTypes.STRING(10),
        TYPE: DataTypes.INTEGER,
    }, {
        freezeTableName: true,
        indexes: [
            {
                unique: false,
                fields: ['DEPART_CD']
            },
            {
                unique: false,
                fields: ['MEMBER_ID']
            }]
    });
};