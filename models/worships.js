module.exports = function(sequelize, DataTypes) {
  return sequelize.define('WORSHIPS', {
    WORSHIP_DT: {
        type : DataTypes.STRING(10),
        primaryKey: true
    },
    WORSHIP_CD: DataTypes.STRING(10),
    TITLE: DataTypes.STRING(50),
    MSG: DataTypes.TEXT
  },{
    timestamps: false,
    freezeTableName: true
  });
};