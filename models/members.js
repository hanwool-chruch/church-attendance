module.exports = function(sequelize, DataTypes) {
  let model = sequelize.define('members', {
    MEMBER_ID: {
        type: DataTypes.INTEGER, 
        autoIncrement: true,
        primaryKey: true
    },
    MEMBER_NAME: {
        type : DataTypes.STRING(20),
        allowNull: false
    },
    BIRTHDAY: DataTypes.STRING(20),
    PHONE_NO: DataTypes.STRING(20),
    E_MAIL: DataTypes.STRING(50),
    ADDRESS: DataTypes.STRING(255),
    PART_CD: {
      type: DataTypes.INTEGER,
    },
    DEPART_CD: {
      type: DataTypes.INTEGER,
    },
    GENDER_CD: {
        type: DataTypes.STRING(20),
    },
    BAPTISM_CD: {
        type: DataTypes.STRING(20),
    },
    STATUS_CD: {
        type: DataTypes.STRING(20),
    },
    ETC_MSG: DataTypes.TEXT,
    FATHER_NAME: DataTypes.STRING(50),
    FATHER_PHONE: DataTypes.STRING(50),
    MOTHER_NAME: DataTypes.STRING(50),
    MOTHER_PHONE: DataTypes.STRING(50),
    SCHOOL: DataTypes.STRING(50),
    PHOTO: DataTypes.INTEGER,
    MEMBER_TYPE:  DataTypes.STRING(20),
  },{
    freezeTableName: true,
    indexes:[
    {
      unique: false,
      fields:['DEPART_CD']
    }]
  });

  return model
};