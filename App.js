// BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calcPercantage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percantage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percantage = - 1;
        }
    };

    Expense.prototype.getPercantage = function () {
        return this.percantage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum = sum + cur.value;
        });

        data.totals[type] = sum;
    };
    var data = {
        allItems: { exp: [], inc: [] },
        totals: { exp: 0, inc: 0 },
        budget: 0,
        percantage: -1
    };

    //var data = JSON.parse(localStorage.getItem('data')) || { allItems: { exp: [], inc: [] }, totals: { exp: 0, inc: 0 } };
    var data = { allItems: { exp: [], inc: [] }, totals: { exp: 0, inc: 0 } };

    return {
        addItem: function (type, des, val) {
            var newItem, iD;

            // create new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }
            // create new item based on inc or exp type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push it into our new structre
            data.allItems[type].push(newItem);

            //localStorage.setItem('data', JSON.stringify(data));

            // return the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;
            //console.log(type, id);
            ids = data.allItems[type].map(function (current) {

                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            // clacualte total  income & expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // Claculate  the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percantage of income that we spent
            if (data.totals.inc > 0) {
                data.percantage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percantage = - 1;
            }
        },

        calculatePercantages: function () {

            data.allItems.exp.forEach(function (cur) {
                cur.calcPercantage(data.totals.inc);
            });
        },

        getPercantage: function () {

            var allPer = data.allItems.exp.map(function (cur) {
                return cur.getPercantage();
            });
            return allPer;
        },


        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percantage: data.percantage,
                itemPerLable: data.percantage
            };
        },
        testing: function () {
            console.log(data);
        }
    };
})();

// UI CONTROLLER
var UIControler = (function () {

    var DOMstrings =
    {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percantageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePerLable: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formateNumber = function (num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + (int.substr(int.length - 3, 3));
        }

        dec = numSplit[1];


        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callBack) {
        for (var i = 0; i < list.length; i++) {
            callBack(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {

                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            //create HTML starting with placeholder text
            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>'
                '</div></div></div>';
            }

            // replace the placeholder  text with somw actual data
            newHtml = html.replace('%id', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formateNumber(obj.value, type));

            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            //document.querySelector('button.item__delete--btn').addEventListener('click', ctrlDeleteItem);
        },

        deleteListItem: function (selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldArr = Array.prototype.slice.call(fields);
            fieldArr.forEach(function (current, inbox, array) {
                current.value = "";
            });
            fieldArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp'

            document.querySelector(DOMstrings.budgetLabel).textContent = formateNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formateNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formateNumber(obj.totalExp, 'exp');

            if (obj.percantage > 0) {
                document.querySelector(DOMstrings.percantageLabel).textContent = obj.percantage + '%';
            } else {
                document.querySelector(DOMstrings.percantageLabel).textContent = '---';
            }
        },

        displayPercantages: function (percantages) {
            var fields = document.querySelectorAll(DOMstrings.expensePerLable);

            nodeListForEach(fields, function (current, index) {
                if (percantages[index] > 0) {
                    current.textContent = percantages[index] + '%';
                }
                else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function () {
            var now, month, months, year;

            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'Octomber', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeType: function () {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },


        getDOMStrings: function () {
            return DOMstrings;
        }
    };
})();



// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListner = function () {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        //document.querySelector('button.item__delete--btn').addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)

    };

    var updateBudget = function () {
        // Calcuate the Budget
        budgetCtrl.calculateBudget();

        // Return Budget
        var budget = budgetCtrl.getBudget();

        // Display the Budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercantage = function () {

        // 1. Calculate Percantage
        budgetCtrl.calculatePercantages();

        // 2. Read the peracntage from the budget percantage 
        var percantages = budgetCtrl.getPercantage();

        //3. Update the UI with new Percantage
        UICtrl.displayPercantages(percantages);
    };

    var ctrlAddItem = function () {
        var input, newItem;
        //  1. get the field input data 
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item into Budget Controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the Item in UI
            UICtrl.addListItem(newItem, input.type);
            //document.querySelector('button.item__delete--btn').addEventListener('click', ctrlDeleteItem);

            //4. Clear all the Fields
            UICtrl.clearFields();

            //5. Calculate and Update Budget
            updateBudget();

            //6. Calculate and Update Percantage
            updatePercantage();
        }
    };
    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        //console.log(event.target);
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the Item from tha Data Structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the Item from UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new Budget
            updateBudget();

            // 4. Calculate and Update Percantage
            updatePercantage();
        }
    };

    return {
        init: function () {
            //console.log('Application has started..!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percantage: -1
            });
            setupEventListner();
        }
    };

}(budgetController, UIControler));
controller.init(); 