module.exports = function(sequelize, DataTypes) {
  return sequelize.define('PARTS', {
    PART_CD: {
        type : DataTypes.STRING(10),
        primaryKey: true
    },
    TEACHER_NM: DataTypes.STRING(20),
    PART_MM: DataTypes.STRING(20),
    ORDERBY_NO: DataTypes.INTEGER
  },{
    timestamps: false,
    freezeTableName: true
    
  });
};