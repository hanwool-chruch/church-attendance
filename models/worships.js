module.exports = function(sequelize, DataTypes) {
  return sequelize.define('worships', {
    WORSHIP_DT: {
        type : DataTypes.STRING(10),
        primaryKey: true
    },
    TITLE: DataTypes.STRING(50),
    MESSAGE: DataTypes.TEXT,
    DEPART_CD: DataTypes.STRING(10),
  },{
    freezeTableName: true,
    indexes:[
    {
      unique: false,
      fields:['DEPART_CD']
    }]
  });
};