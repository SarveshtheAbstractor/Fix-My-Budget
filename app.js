//Budget Controller
var budgetController = (function(){
    
    //Budget Code Here
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    
    
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
         },
            totals: {
            exp: 0,
            inc: 0
         },
        budget: 0,
        percentage: -1
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    
    return {
        addItem: function(type,desc,val) {
                var newItem , ID;

                //Create New ID
                if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id +1 ;
                } else {
                    ID = 0;
                }
            
                //Create The New Item for expense or Income
                if ( type === 'exp' ){
                    newItem = new Expense(ID,desc,val);
                } else if (type === 'inc' ){
                    newItem = new Income(ID,desc,val);
                }
    
                // Push new item to data array
                data.allItems[type].push(newItem);
                // return newitem to use it in different modules as it is public
                return newItem;
        },
        
        deleteItem: function(type,ide){
            var ids,index;
            
            ids = data.allItems[type].map(function(cur){
                return cur.id;
            })
            
            index = ids.indexOf(ide);
            
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
            
            
        },
        
        
        calculateBudget: function(){
            //Calculate Total Incomes and Expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate Budget
            data.budget = data.totals.inc - data.totals.exp;
            
            //Calculate Percentage of income that we spent
            if(data.totals.inc > 0){
                 data.percentage = Math.round((data.totals.exp / data.totals.inc ) * 100);
            } else {
                data.percentage = -1;
            }
           
            
        },
        
        calculatePercentages: function(){
            
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
            
        },
        
        getPercentages: function(){
            var allPercentages = data.allItems.exp.map(function(cur){
              return  cur.getPercentage();
            });
                return allPercentages;
        },
        
        getBudget: function(){
            return {
                budget: data.budget,
                totalinc: data.totals.inc,
                totalexp: data.totals.exp,
                percentage: data.percentage
            }
            
        },
    
        
        testing: function(){
            console.log(data);
        }
       
            
    }
})();


/*----------------------------Seperating Budget and UI controllers--------------------------------*/

//User Interface Controller
var UIController = (function(){
    
    //DOM strings for for document manipulation and Plus private Variables
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num,type){
            var numSplit, int , dec ,type;
            
            num = Math.abs(num);
            num = num.toFixed(2);
            numSplit = num.split('.');
            
            int = numSplit[0];
            if(int.length > 3){
                int = int.substr(0,int.length- 3) + "," + int.substr(int.length - 3 , 3);
                
            }
            dec = numSplit[1];
            
            return (type === 'exp' ? '-' : '+') +  " " + int + "." + dec;
        };
    
        var nodeListforEach = function(list, callback){
                for(var i = 0 ; i < list.length ; i++){
                    callback(list[i],i);
                }
            }
    
    // Returning objects and plus they are exposed to public
    return {
        //Get input takes input of all 3 values type,desc and value
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                numbervalue: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        //Add the new item to list method and UI
        addListItem: function(obj,type){
            var html,newHtml , element;
            
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div> </div>';
            }
            
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            
    document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
        },
        
        deleteListItem: function(selectorId){
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        
        
        
        // Clearing field function after input has been taken from user
        clearFields: function(){
          var fields;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription+ ", "+DOMstrings.inputValue);
            
            var fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current,index,array){
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalinc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent =  formatNumber(obj.totalexp,'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
            
            
            
        },
        
        displayPercentages: function(percent){
            var fields = document.querySelectorAll(DOMstrings.expensePercLabel);
            
            nodeListforEach(fields,function(current,index){
                
                if(percent[index] > 0){
                    current.textContent = percent[index] + '%';
                } else {
                    current.textContent = '---';
                }
                
            });
            
        },
        
        displayMonth: function(){
            var now,year,month,months;
            now = new Date();
            year = now.getFullYear();
            months = ['January','Febraury','March','April','May','June','July','August','September','October','November','December'];
            month = now.getMonth();
            
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ', ' + year;
        },
        
        changedType: function(){
            var fields = document.querySelectorAll(
            DOMstrings.inputType + "," +
            DOMstrings.inputDescription + "," +
                DOMstrings.inputValue
            );
            
            nodeListforEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            })
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        //Get Dom strings shares the DOM strings used for DOM manipulation
        getDOMstrings: function(){
            return DOMstrings;
    }
    };
    
})();


/*----------------------------Seperating UI and App controllers--------------------------------*/



//App Controller
var AppController = (function(budgetCtrl,UICtrl){
    
    //Initailising Event Listeners when init is called
    var setupEventListeners = function(){
        
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
    
        document.addEventListener('keypress',function(event){
        
        if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
        }
        
    });
        
    document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        
document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    }
    
    var updateBudget = function(){
        //Calulate Budget
        budgetCtrl.calculateBudget();
        
        //Return the Budget
        var budget= budgetCtrl.getBudget();
        
        //Display Budget
        UICtrl.displayBudget(budget);
    }
    
    var updatePercentages = function(){
        
        //Calculate Percentage
        budgetCtrl.calculatePercentages();
        
        //Return Percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        
        //Update the UI with new Percentages
        UICtrl.displayPercentages(percentages);
        
    }
    
    //Adding Items To UI and Budget
    var ctrlAddItem  = function() {
        var input , newItem;
         //Get the filled Input value 
        input = UICtrl.getInput();
       
        if(input.description !== "" && !isNaN(input.numbervalue) && input.numbervalue > 0){
            //Add item to budget controller 
    newItem = budgetCtrl.addItem(input.type,input.description,input.numbervalue);
       
       
        //Add the item to the UI
        UICtrl.addListItem(newItem,input.type);
        
        //Clear Input fields
        UICtrl.clearFields();
        
            //Calculate the budget
            updateBudget();
            
            //Calculate the Percentages
            updatePercentages();
        }
       
    }

    var ctrlDeleteItem = function(ev){
        var ID,splitID,ItemID,type;
        
        ItemID = ev.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(ItemID);
        if(ItemID){
        splitID = ItemID.split('-');
        
        type = splitID[0];
        ID = parseInt(splitID[1]);
        
        
        //Delete the Item from data structure
        budgetCtrl.deleteItem(type,ID);
        
        //Delete the item From UI
        UICtrl.deleteListItem(ItemID);
        
        // Recalculate and show Budget
        updateBudget();
            
            //Calculate the Percentages
            updatePercentages();
        }
 
    }

    //return public init functions to initalise application
    return {
        init: function(){
            console.log('Application has started');
            UICtrl.displayMonth();
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalinc: 0,
                totalexp: 0,
                percentage: 0
            });
        }
    }

})(budgetController,UIController);

// Calling Application to start
AppController.init();