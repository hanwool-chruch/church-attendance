module.exports = function(sequelize, DataTypes) {
  let model = sequelize.define('parts', {
    PART_CD: {
        type : DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    TEACHER_NAME: DataTypes.STRING(20),
    PART_NAME: DataTypes.STRING(20),
    ORDERBY_NO: DataTypes.INTEGER,
    DEPART_CD: DataTypes.STRING(10),
  },{
    timestamps: false,
    freezeTableName: true,
    indexes:[
    {
      unique: false,
      fields:['DEPART_CD']
    }]
  });

  return model
};