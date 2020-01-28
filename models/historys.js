module.exports = function(sequelize, DataTypes) {
  let model = sequelize.define('historys', {
    MEMBER_ID: DataTypes.INTEGER,
    MESSAGE: DataTypes.STRING(255),
    TYPE: DataTypes.INTEGER,
  },{
    timestamps: false,
    freezeTableName: true,
    indexes:[
    {
      unique: false,
      fields:['MEMBER_ID']
    }]
  });

  return model
};