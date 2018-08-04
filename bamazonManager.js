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
    managerConnection();
});

var choicesArr = [];
var choicesById = [];
var idKey = 0;
var updatedStock = 0;

function setChoices() {
    connection.query(
        "SELECT * FROM products", 
        function(err, res) {
      if (err) throw err;
      for(let i = 0; i < res.length ; i++){
        var prod_name = res[i].product_name;
          for(let j = res[i].product_name.length; j < 31; j++) {
            prod_name += " ";
            }
            choicesById.push(String(res[i].item_id));
            choicesArr.push(String(prod_name));
        }
    });
}

function managerConnection() {
    setChoices();
    inquirer
    .prompt([
        {
            name: "functionSelection",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add new Product"
            ]
        }
        ]).then(function(answer) {
            switch(answer.functionSelection) {
                case "View products for Sale":
                    viewProducts();
                    break;
                case "View Low Inventory":
                    viewLowInv();
                    break;
                case "Add to Inventory":
                    addInv();
                    break;
                case "Add new Product":
                    newProduct();
                    break;
            }
        })
}

function viewProducts() {
    connection.query(
        "SELECT * FROM products", 
        function(err, res) {
            if(err) throw err;
            console.log("\nID\tProduct\t\t\t\tPrice\tQuantity");
            for(let i = 0; i < res.length ; i++){
                var prod_name = res[i].product_name;
                for(let j = res[i].product_name.length; j < 31; j++) {
                    prod_name += " ";
                    }
                    console.log(res[i].item_id + "\t" + prod_name + "\t" + String(res[i].price) + "\t" + String(res[i].stock_quantity));
            }
            console.log("\n");
            endSession();
        }
    )
    
};

function viewLowInv() {
    connection.query(
        "SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
            if(err) throw err;
            console.log("\nID\tProduct\t\t\t\tPrice\tQuantity");
            for(let i = 0; i < res.length ; i++){
                var prod_name = res[i].product_name;
                for(let j = res[i].product_name.length; j < 31; j++) {
                    prod_name += " ";
                    }
                    console.log(res[i].item_id + "\t" + prod_name + "\t" + String(res[i].price) + "\t" + String(res[i].stock_quantity));
                    choicesById.push(String(res[i].item_id));
                    choicesArr.push(String(prod_name));
            }
            console.log("\n");
            endSession();
        }
    );
};

function addInv() {
    inquirer
    .prompt([
        {
            name: "productSelection",
            type: "list",
            message: "Which Product?",
            choices: choicesArr
        },
        {
            name: "quantity",
            type: "input",
            message: "Amount to Add:",
            validate: function(value) {
                if(isNaN(value)) {
                    return false;
                }
                return true;
            }
        }
    ]).then(function(answer) {
        for(let i = 0; i < choicesArr.length; i++) {
            if(choicesArr[i] == answer.productSelection) {
                idKey = choicesById[i];
            }
        }
        var query = connection.query(
            "SELECT * FROM products WHERE item_id = ?", [idKey],
            function(err, response) {
                if(err) throw err;
                updatedStock = parseInt(response[0].stock_quantity) + parseInt(answer.quantity);
                inquirer
                .prompt([
                    {
                        name: "confirmation",
                        type: "confirm",
                        message: "Confirm addition of " + answer.quantity + " - " + answer.productSelection + "\n"
                    }
                ]).then(function(ans) {
                    if(ans.confirmation) {
                        console.log("Inventory Updated");
                        var query = connection.query(
                            "UPDATE products SET ? WHERE ?", [
                                {
                                    stock_quantity: updatedStock
                                }, 
                                {
                                    item_id: idKey
                                }
                            ], function(err) {
                                if(err) throw err;
                            }
                        );
                        console.log("\n");
                        endSession();
                    } else {
                        console.log("\n");
                        endSession();
                    }
                })
                
                
            }
        );
    })
};

function newProduct() {
    inquirer
    .prompt([
        {
            name: "prodName",
            type: "input",
            message: "Product:"
        },
        {
            name: "deptName",
            type: "input",
            message: "Department:"
        },
        {
            name: "price",
            type: "input",
            message: "Price:",
            validate: function(value) {
                if(isNaN(value)) {
                    return false;
                }
                return true;
            }
        },
        {
            name: "quantity",
            type: "input",
            message: "Amount in Stock:",
            validate: function(value) {
                if(isNaN(value)) {
                    return false;
                }
                return true;
            }
        }
    ]).then(function(resp) {
        inquirer
        .prompt([
            {
                name: "confirmation",
                type: "confirm",
                message: "Confirm addition of\nProduct:\t" + resp.prodName + 
                "\nDepartment:\t" + resp.deptName +
                "\nPrice:\t\t" + resp.price +
                "\nAmount:\t\t" + resp.quantity
            }
        ]).then(function(ans) {
            if(ans.confirmation) {
                console.log("\nNew product added.");
                var query = connection.query(
                    "INSERT INTO products SET ?",
                    {
                        product_name: resp.prodName,
                        department_name: resp.deptName,
                        price: resp.price,
                        stock_quantity: resp.quantity
                    }, 
                    function(err) {
                        if(err) throw err;
                    }
                )
                console.log("\n");
                endSession();
            } else {
                console.log("\n");
                endSession();
            }
        })
    })
    
}

function endSession() {
    inquirer
    .prompt([
        {
            name: "signoff",
            type: "confirm",
            message: "Enter 'y' to end session or 'n' to make a new transaction"
        }
    ]).then(function(answer) {
        if(answer.signoff) {
            connection.end();
        } else {
            managerConnection();
        }
    })
}