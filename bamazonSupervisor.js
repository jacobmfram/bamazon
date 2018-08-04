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
    supervisorConnection();
});

function supervisorConnection() {
    inquirer
    .prompt([
        {
            name: "functionSelection",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View Product Sales by Department",
                "Create New Department",
            ]
        }
        ]).then(function(answer) {
            switch(answer.functionSelection) {
                case "View Product Sales by Department":
                    viewProdSales();
                    break;
                case "Create New Department":
                    addDepartment();
                    break;
            }
        })
}

function viewProdSales() {
    connection.query(
        "SELECT products.department_name, SUM(product_sales), departments.department_name, over_head_costs, product_sales FROM products JOIN departments ON products.department_name = departments.department_name GROUP BY departments.department_name",
        function(err, res) {
            if(err) throw err;
            console.log("\nDepartment\tSales\t\tOverhead\tSales\t\tProfit");
            for(let i = 0; i < res.length; i++) {
                var profit = parseFloat(res[i]["SUM(product_sales)"]) - parseFloat(res[i]["over_head_costs"]);
                console.log(res[i].department_name + "\t\t" + res[i]["SUM(product_sales)"]+ "\t\t" + res[i]["over_head_costs"] + "\t\t" + res[i]["product_sales"] + "\t\t" + profit)
            }
            console.log("\n");
            endSession();
        }
    )
};

function addDepartment() {
    inquirer
    .prompt([
        {
            name: "deptName",
            type: "input",
            message: "Department name: "
        },
        {
            name: "overhead",
            type: "input",
            message: "Overhead Costs: ",
            validate: function(value) {
                if(isNaN(value)) {
                    return false;
                }
                return true;
            }
        }
    ]).then(function(answer) {
        inquirer
        .prompt([
            {
                name: "confirmation",
                type: "confirm",
                message: "Please confirm new department:\nDepartment:\t" + answer.deptName + "\nOverhead Costs:\t" + answer.overhead + "\n"
            }
        ]).then(function(ans){ 
            if(ans.confirmation) {
                console.log("New department added.")
                var query = connection.query(
                "INSERT INTO departments SET ?",
                {
                    department_name: answer.deptName,
                    over_head_costs: answer.overhead
                },
                function(err) {
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
    })
    
}

function endSession() {
    inquirer
    .prompt([
        {
            name: "signoff",
            type: "confirm",
            message: "Enter 'y' to end session or 'n' to perform more actions"
        }
    ]).then(function(answer) {
        if(answer.signoff) {
            connection.end();
        } else {
            supervisorConnection();
        }
    })
};