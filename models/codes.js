module.exports = function(sequelize, DataTypes) {
  return sequelize.define('codes', {
    ID: {
        type: DataTypes.INTEGER, 
        autoIncrement: true,
        primaryKey: true
    },
    KIND:  DataTypes.STRING(20),
    CODE_ID: DataTypes.STRING(20),
    NAME: DataTypes.STRING(30),
    ORDERBY_NO: DataTypes.INTEGER
  },{
    timestamps: false,
    freezeTableName: true
  });
};