module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ATTENDANCES', {
    WORSHIP_DT: {
        type : DataTypes.STRING(14),
        primaryKey: true
    },
    WORSHIP_CD: {
        type : DataTypes.STRING(14),
        primaryKey: true
    },
    MEMBER_ID: DataTypes.INTEGER
  },{
    timestamps: false,
    freezeTableName: true
  });
};