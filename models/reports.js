module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reports', {
    WORSHIP_DT: {
        type : DataTypes.STRING(10),
        primaryKey: true
    },
    PART_CD: {
        type : DataTypes.STRING(10),
        primaryKey: true
    },
    REPORT: DataTypes.TEXT,
    DEPART_CD: DataTypes.STRING(10),
  },{
    freezeTableName: true,
    indexes:[
    {
      unique: false,
      fields:['DEPART_CD']
    },
    {
      unique: false,
      fields:['PART_CD']
    }]
  });
};