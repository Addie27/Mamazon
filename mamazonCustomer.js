require("dotenv").config();
var mysql = require("mysql");
var inquirer = require('inquirer');
var productName;
var productStockQuantity;
var quantitySelected;
var productPriceDecimal;
var quantityCheck;
var productPrice;


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
    readProducts();
});


function readProducts() {
    console.log("Here is a list of all products available:\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            var price = res[i].price
            var priceString = price.toFixed(2);
            console.log("Item#: " + res[i].item_id + "|" + " Product Name: " + res[i].product_name + "|" + " Price " + "$" + priceString);
        }

        itemSelection();
    });
}

function itemSelection() {

    inquirer
        .prompt([
            {
                name: "purchase",
                type: "input",
                message: "Enter the item # of the product you would like to purchase."
            },
        ])
        .then(function (answer) {
            itemID = answer.purchase;
            var query1 = "SELECT product_name, stock_quantity, price FROM products WHERE ?"
            connection.query(query1, { item_id: itemID }, function (err, res) {
                productName = res[0].product_name;
                productStockQuantity = res[0].stock_quantity;
                productPrice = res[0].price;
                selectQuantity();

            })
        })//then end
    function selectQuantity() {

        inquirer
            .prompt([
                {
                    name: "quantity",
                    type: "input",
                    message: "How many " + productName + "(s) would you like?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                }
            ])
            .then(function (answer) {

                quantitySelected = answer.quantity;
                stockComparison();
            }) //connection end
        function stockComparison() {


            var quantityCheck = productStockQuantity - quantitySelected;
            if (quantityCheck <= 0) {
                inquirer
                    .prompt([
                        {
                            type: 'list',
                            name: 'changeOrder',
                            message: "I am sorry the amount requested is more than what we have in stock. We only have " + productStockQuantity+ " in stock. What do you want to do?",
                            choices: [
                                'Change quantity',
                                'Select another item',
                            ]
                        },
                    ])
                    .then(answers => {

                        if (answers.changeOrder === "Change quantity") {
                            selectQuantity();
                        }
                        else if (answers.changeOrder === "Select another item") {
                            itemSelection();
                        }
                    });

            }//if end
            else {
                confirmPurchase();
                function confirmPurchase() {
                    var purchasePrice = quantitySelected * productPrice;
                    var purchasePriceDecimal = purchasePrice.toFixed(2);
                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                name: 'confirmOrder',
                                message: "Confirm purchase: Product: " + productName + " | " + "Quantity: " + quantitySelected + " | " + "Price: " + purchasePriceDecimal,
                                choices: [
                                    'Y',
                                    'N',
                                ]
                            },
                        ])
                        .then(answers => {
                            if (answers.confirmOrder === "N") {
                                inquirer
                                    .prompt([
                                        {
                                            type: 'list',
                                            name: 'exit',
                                            message: "Would you like to select another item?",
                                            choices: [
                                                'Y',
                                                'N',
                                            ]
                                        },
                                    ])
                                    .then(answers => {
                                        if (answers.exit === "N") {
                                            console.log("Okay thank you, please come again!");
                                            connection.end();
                                        }
                                        else {
                                            readProducts();
                                        }

                                    });
                            }//if confirmOrder No
                            else {
                                updateQuantity();
                                function updateQuantity() {

                                    var query2 = "UPDATE products SET ? WHERE ?";

                                    connection.query(query2,
                                        [
                                            {
                                                stock_quantity: quantityCheck
                                            },
                                            {
                                                item_id: itemID
                                            }
                                        ],
                                        function (err, res) {
                                            console.log("Thank you for your purchase! You ordered " + quantitySelected + " " + productName + "(s)! Total price: $" + purchasePriceDecimal)
                                            inquirer
                                                .prompt([
                                                    {
                                                        type: 'list',
                                                        name: 'exit',
                                                        message: "Would you like to select another item?",
                                                        choices: [
                                                            'Y',
                                                            'N',
                                                        ]
                                                    },
                                                ])
                                                .then(answers => {
                                                    if (answers.exit === "N") {
                                                        console.log("Okay thank you, please come again!");
                                                        connection.end();
                                                    }
                                                    else {
                                                        readProducts();
                                                    }

                                                });


                                        }
                                    );

                                }//updateQuantity end

                            }//if confirmOrder No else

                        });
                }//confirm purchase end

            }//else end
        }//stock comparison end

    }//selectquantity then end

}; //itemSelection end









