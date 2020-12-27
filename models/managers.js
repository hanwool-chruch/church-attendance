module.exports = function(sequelize, DataTypes) {
    let model = sequelize.define('managers', {
            MENAGER_ID: {
                type : DataTypes.STRING(20),
                primaryKey: true
            },
            CRYPTOGRAM: {
                type : DataTypes.STRING(20),
                allowNull: false
            },
            DEPART_CD: DataTypes.STRING(10),
            AUTH_TYPE: DataTypes.STRING(10),
        },
        {
            freezeTableName: true,
            indexes:[
                {
                    unique: false,
                    fields:['DEPART_CD']
                },{
                    unique: false,
                    fields:['AUTH_TYPE']
                }]
        });

    return model
};