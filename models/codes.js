module.exports = function (sequelize, DataTypes) {
    return sequelize.define('codes', {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        KIND: DataTypes.STRING(20),
        CODE_ID: DataTypes.INTEGER,
        NAME: DataTypes.STRING(30),
    }, {
        timestamps: false,
        freezeTableName: true
    });
};
