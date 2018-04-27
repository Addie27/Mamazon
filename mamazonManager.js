require("dotenv").config();
var mysql = require("mysql");
var inquirer = require('inquirer');
var choices = []
var updatedStockQuantity;
var selection;
var product;
var inventory = [];

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
        var choices = [];
        for (var i = 0; i < res.length; i++) {

            choices.push(res[i].product_name);
            //var options = choices.join();

        }//for end
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'select',
                    message: "Select a product to add inventory",
                    choices: choices
                },
            ])
            .then(function (answer) {
                selection = answer.select;
                var query = "SELECT stock_quantity FROM products WHERE ?"
                connection.query(query, { product_name: selection }, function (err, res) {
                    if (err) throw err;
                    console.log("This product --" + selection + "-- has " + res[0].stock_quantity + " units in inventory.");

                    inquirer
                        .prompt([
                            {
                                name: "add",
                                type: "input",
                                message: "How much inventory would you like to add?"
                            }
                        ])
                        .then(function (answer) {

                            var query = "SELECT stock_quantity FROM products WHERE ?"
                            connection.query(query, { product_name: selection }, function (err, res) {
                                if (err) throw err;

                                var currentStockQuantity = parseInt(res[0].stock_quantity)
                                var newStockQuantity = parseInt(answer.add);
                                var updatedStockQuantity = currentStockQuantity + newStockQuantity;
                                connection.query(
                                    "UPDATE products SET ? WHERE ?",
                                    [
                                        {
                                            stock_quantity: updatedStockQuantity
                                        },
                                        {
                                            product_name: selection
                                        }
                                    ],
                                    function (err, res) {

                                        var query = "SELECT stock_quantity FROM products WHERE ?"
                                        connection.query(query, { product_name: selection }, function (err, res) {
                                            if (err) throw err;
                                            console.log(selection + "'s inventory has been updated. New inventory total: " + res[0].stock_quantity);
                                            queryManager();
                                        })

                                    }
                                );



                            })


                        })

                })

            })//connection end

    }); //array end

}//add inventory end


function addProduct() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'product',
                message: "Please input a product to be added",

            }
        ])
        .then(function (answer) {
            product = answer.product
            connection.query("SELECT * FROM products", function (err, res) {
                if (err) throw err;
                for (var i = 0; i < res.length; i++) {

                    inventory.push(res[i].product_name);
        
                }//for end
                if (inventory.includes(product) ){
                    console.log("That product is already in inventory. Please enter another product to add.");
                    addProduct();
                }
                else {
                    inquirer
                        .prompt([
                            {
                                type: 'input',
                                name: 'department',
                                message: "Please input the department of the new product",

                            },
                            {
                                type: 'input',
                                name: 'price',
                                message: "Please input the price of the new product",

                            },
                            {
                                type: 'input',
                                name: 'stock_quantity',
                                message: "Please indicate the stock quantity of the new product",

                            },

                        ])
                        .then(function (answer) {
                            connection.query("SELECT * FROM products", function (err, res) {
                                if (err) throw err;
                                var query = "INSERT INTO products SET ?"
                                connection.query(query, { product_name: product, department_name: answer.department, price: answer.price, stock_quantity: answer.stock_quantity }, function (err, res) {
                                    if (err) throw err;
                                    console.log(product + "(s) were added to the inventory list");
                                    queryManager();
                                })
                                
                            })
                            
                            

                        })//then end 
                }       
                
            })//connection query end
            

        })//then input product end

} //add product end