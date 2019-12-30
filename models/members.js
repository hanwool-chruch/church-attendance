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
      allowNull: false
    },
    GENDER_CD: {
        type: DataTypes.STRING(20),
        defaultValue: 'UNKNOWN',
        allowNull: false
    },
    BAPTISM_CD: {
        type: DataTypes.STRING(20),
        defaultValue: 'NONE',
        allowNull: false
    },
    STATUS_CD: {
        type: DataTypes.STRING(20),
        defaultValue: 'ATTENDENCE',
        allowNull: false
    },
    ETC_MSG: {
        type: DataTypes.TEXT,
        defaultValue: 'ATTENDENCE',
        allowNull: false
    },
    FATHER_NAME: DataTypes.STRING(20),
    FATHER_PHONE: DataTypes.STRING(20),
    MOTHER_NAME: DataTypes.STRING(20),
    MOTHER_PHONE: DataTypes.STRING(20),
    SCHOOL: DataTypes.STRING(20),
    PHOTO: DataTypes.STRING(45),
    DEPART_CD: DataTypes.STRING(10),
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