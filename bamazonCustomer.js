var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 0000,
    user: "",
    password: "",
    database: "bamazon"
});

connection.connect(function(err) {
    if(err) throw err;
    customerConnection();
})

var choicesArr = [];
var choicesById = [];
var idKey = 0;
var updatedStock = 0;

function customerConnection() {
    connection.query(
        "SELECT * FROM products", 
        function(err, res) {
      if (err) throw err;
      console.log("\nID\tProduct\t\t\t\tPrice");
      for(let i = 0; i < res.length ; i++){
        var prod_name = res[i].product_name;
          for(let j = res[i].product_name.length; j < 31; j++) {
            prod_name += " ";
            }
            console.log(res[i].item_id + "\t" + prod_name + "\t" + String(res[i].price));
            choicesById.push(String(res[i].item_id));
            choicesArr.push(String(prod_name));
        }
        makePurchase();
    });

}

function makePurchase() {
    inquirer
        .prompt([
            {
                name: "productSelection",
                type: "list",
                message: "What would you like?\n  Product",
                choices: choicesArr
            },
            {
                name: "quantity",
                type: "input",
                message: "How much would you like?",
                validate: function(value) {
                    if(isNaN(value)) {
                        return false;
                    }
                    return true;
                }
            }
    ])
        .then(function(answer) {           
            for(let i = 0; i < choicesArr.length; i++) {
                if(choicesArr[i] == answer.productSelection){
                    idKey = choicesById[i];
                }
            }
            var query = connection.query(
                "SELECT * FROM products WHERE item_id = ?", [idKey], function(err, response) {
                    if(err) throw err;
                    if(response[0].stock_quantity < answer.quantity) {
                        console.log("\tThere are only " + response[0].stock_quantity + " " + response[0].product_name + "s in stock.\n");
                        inquirer
                        .prompt([
                            {
                                name: "try_again",
                                type: "confirm",
                                message: "Would you like to make a different selection?"
                            }
                        ]).then(function(answer) {
                            if(answer.try_again) {
                                makePurchase();
                            } else {
                                console.log("Please come again.");
                                connection.end();
                            }
                        })
                    } else {
                        updatedStock = response[0].stock_quantity - answer.quantity;
                        inquirer
                        .prompt([
                            {
                                name: "confirmation",
                                type: "confirm",
                                message: "Your total is $" + answer.quantity * response[0].price + "\nIs that OK?"
                            }
                        ]).then(function(ans) {
                            if(ans.confirmation) {
                                console.log("Thank you for your purchase.");
                                var query = connection.query(
                                    "UPDATE products SET ? WHERE ?", [
                                        {
                                            stock_quantity: updatedStock,
                                            product_sales: answer.quantity * response[0].price
                                        }, 
                                        {
                                            item_id: idKey
                                        }
                                    ], function(err, resp) {
                                        if(err) throw err;
                                    }
                                );
                                connection.end();
                            } else {
                                console.log("Sale Canceled.");
                                connection.end();
                            }
                        })
                    }
                }
            )
        })
        
};