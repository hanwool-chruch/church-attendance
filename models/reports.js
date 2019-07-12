module.exports = function(sequelize, DataTypes) {
  return sequelize.define('REPORTS', {
    WORSHIP_DT: {
        type : DataTypes.STRING(10),
        primaryKey: true
    },
    PART_CD: {
        type : DataTypes.STRING(10),
        primaryKey: true
    },
    REPORT: DataTypes.TEXT
  },{
    timestamps: false,
    freezeTableName: true
  });
};