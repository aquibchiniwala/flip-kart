const Sequelize = require("sequelize")
const Op = Sequelize.Op
const db = new Sequelize({
    dialect: 'sqlite', // mysql, postgres, mssql
    storage: __dirname + '/ecart.db'
  })
const Vendor = db.define('Vendor', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
            notEmpty:true
        }
    },
    address: {
        type: Sequelize.STRING,
        allowNull: true
    }
})

const Product = db.define('Product',{
    name:{
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
            notEmpty:true
        }
    },
    price:{
        type:Sequelize.FLOAT,
        allowNull:false,
        defaultValue:0.0
    }
})

const User=db.define('User',{
    name:{
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
            notEmpty:true
        }
    }
})

const Cart=db.define('Cart',{
    quantity:{
        type:Sequelize.INTEGER,
        allowNull:false,
        defaultValue:1
    }
})

Vendor.hasMany(Product, {onDelete:'cascade'});

Product.belongsTo(Vendor);


Cart.belongsTo(Product,{onDelete:'cascade'});
Product.hasMany(Cart,{onDelete:'cascade'})

Cart.belongsTo(User,{onDelete:'cascade'});
User.hasMany(Cart,{onDelete:'cascade'})

module.exports={
    db,Vendor,Product,User,Cart
}
