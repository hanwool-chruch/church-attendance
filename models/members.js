module.exports = function(sequelize, DataTypes) {
  return sequelize.define('MEMBERS', {
    MEMBER_ID: {
        type: DataTypes.INTEGER, 
        autoIncrement: true,
        primaryKey: true
    },
    MEMBER_NM: {
        type : DataTypes.STRING(20),
        allowNull: false
    },
    BIRTHDAY: DataTypes.STRING(20),
    PHONE_NO: DataTypes.STRING(20),
    ORDERBY_NO: DataTypes.INTEGER,
    E_MAIL: DataTypes.STRING(50),
    ADDRESS: DataTypes.STRING(255),
    FATHER_NAME: DataTypes.STRING(20),
    FATHER_PHONE: DataTypes.STRING(20),
    MOTHER_NAME: DataTypes.STRING(20),
    MOTHER_PHONE: DataTypes.STRING(20),
    SCHOOL: DataTypes.STRING(20),
    PART_CD: {
        type: DataTypes.STRING(20),
        defaultValue: 100,
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
    }
  },{
    freezeTableName: true
  });
};