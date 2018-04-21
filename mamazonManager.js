require("dotenv").config();
var mysql = require("mysql");
var inquirer = require('inquirer');
var choices = []

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: 3306,

    // Your username
    user: process.env.DB_USER,

    // Your password
    password: process.env.DB_PASS,
    database: "mamazon_db"
});


connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    queryManager();
});

function queryManager() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'managerQuery',
                message: "What would you like to do?",
                choices: [
                    "View Products for Sale",
                    "View Low Inventory",
                    "Add to Inventory",
                    "Add New Product",
                    "Exit System"
                ]
            },
        ])
        .then(answers => {
            var manager = answers.managerQuery
            switch (manager) {
                case "View Products for Sale":
                    return readProducts();

                case "View Low Inventory":
                    return lowInventory();

                case "Add to Inventory":
                    return addInventory();

                case "Add New Product":
                    return addProduct();

                case "Exit System":
                    return connection.end();
            }

        });
}//queryManager end 

function readProducts() {
    console.log("Here is a list of all products available:\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            var price = res[i].price
            var priceString = price.toFixed(2);
            console.log("Item#:" + res[i].item_id + "|" + " Product Name: " + res[i].product_name + "|" + " Department Name: " + res[i].department_name + "|" + "Price " + "$" + priceString + "|" + "Stock Quantity: " + res[i].stock_quantity);
        }
        queryManager();
    });
}

function lowInventory() {
    console.log("Here is a list of all products that have low inventory (<100):\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            stockQuantity = res[i].stock_quantity
            if (stockQuantity < 100) {
                var price = res[i].price
                var priceString = price.toFixed(2);
                console.log("Item#:" + res[i].item_id + "|" + " Product Name: " + res[i].product_name + "|" + " Department Name: " + res[i].department_name + "|" + "Price " + "$" + priceString + "|" + "Stock Quantity: " + res[i].stock_quantity);
            }

        }
        queryManager();
    })
}; //lowInventory end

function addInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            var choices = [];
            choices.push(res[i].product_name);
            var options = choices.join();
            
        }//for end
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'add',
                    message: "Select a product to add inventory",
                    choices: [
                        
                    ]
                },
            ])
            .then(function (answer) {
                connection.end();

            })

    })//connection end

}; //add invetory end

