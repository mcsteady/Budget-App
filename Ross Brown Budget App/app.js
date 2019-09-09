
// BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage =-1;
    };


    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) *100);
        }else {
            this.percentage = -1;
        }
        


    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };


    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };


   
    var calculateTotal = function (type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] =sum;

    };

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },

        totals:{
            exp: 0,
            inc: 0,
        },

        budget:0,

        percentage: -1,
     


    };
    
    return {
        addItem: function(type, des,val){
        var newItem, ID;    
        
        // create new ID 
        if (data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length - 1].id +1;

        }else {
            ID = 0;
        }
        
        // Create new item based on inc or exp type

        if (type === 'exp') {
            newItem = new Expense(ID, des, val);
        } else if (type === 'inc') {
            newItem = new Income(ID, des, val);

        }
       //push it into our data structure
        data.allItems[type].push(newItem);
        // return the new element
        return newItem;

        },


        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
            return current.id;
            });

            index= ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },


        calculateBudget: function(){
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calc the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calc the percentage of the income that we spent 
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else {
                data.percentage = -1;
            }
          
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            }); 
        },

        getPercentages: function(){
            var allperc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();

            });
            return allperc;
        },

     
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,

            }
        },

        testing: function() {
            console.log(data);
        }
    };



   
})();




// UI CONTROLLER 
var UIController = (function() {


    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel:'.budget__title--month',
    };

    var formatNumber = function(num, type){
        var numSplit, int, dec, type;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.')
        int = numSplit[0];
        
        if (int.length > 3){
          int =  int.substr(0,int.length - 3) + ',' + int.substr(int.length -3, 3) // input 2310 output 2,310
        }

        dec = numSplit[1];
        
        return (type == 'exp' ? '-' : '+') + ' ' + int + '.' +dec;


        };

    var nodeListForEach = function(list, callBack){
        for (var i = 0; i < list.length; i++){
            callBack(list[i], i);
        }

       };     




    return {
        getinput: function() {
        return {
                
            type:  document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
            description:  document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
        };

        },

        addListItem: function(obj,type){
            var html, newHtml, element;
            // create html string with placeholder text 
        
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html =  '<div class="item clearfix" id="inc-%id%"><div class="item__description"> %description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html =  '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'; 
            }  
          
            
                 

            // replace the place holder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            // insert the html into the dom
             document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorId){
            var el = document.getElementById(selectorId)
            el.parentNode.removeChild(el)

        },

        clearfields : function(){
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function (current, index, array){
                current.value = "";

            });
                
            fieldsArray[0].focus();
       
            
        },
        
        displayBudget: function(obj){
            var type;
            obj.budget > 0? type = 'inc': type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber( obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent =formatNumber(obj.totalExp, 'exp');
           

            if(obj.percentage >0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
                
            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }


        }, 


        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

           
            nodeListForEach(fields, function(current, index) {

                if(percentages[index]> 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent ='---';
                };
                

            });

        },


        displayMonth: function(){
            var now, year, month, months;
            var now = new Date();
            months = [
            'January',
            'Febuary',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December' ];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent= months[month]+ ' '+ year;
        },

        changedType: function(){

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

         
        
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
                

            
        
            

        

        getDomstrings: function() {
            return DOMstrings;
        }
    };

})();

 //GLOBAL APP CONTROLLER 
var controller = (function(budgetCtrl,UICtrl){

    var setUpEventListeners = function(){
        var DOM = UICtrl.getDomstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', CtrlAddItem); {
          
      
        };
      
        document.addEventListener('keypress', function (event) {
            if(event.keyCode ===13 || event.which === 13 ){
              
                CtrlAddItem();
            }
           
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    
    var updateBudget = function (){
            // Calc the budget
            budgetCtrl.calculateBudget();
            // return the budget 
            var budget = budgetCtrl.getBudget();
            // display the budget on the UI
            UICtrl.displayBudget(budget);
    };


    var updatePercentages = function(){
        // calc percentages 
        budgetCtrl.calculatePercentages();
        //read them from the budget controller
        var percentages =budgetCtrl.getPercentages();
        // update the user interface with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var CtrlAddItem = function() {
        
        var input, newItem;
        // get the field input data
        var input = UICtrl.getinput();
        
        if(input.description !== ""  && !isNaN(input.value) && input.value > 0) {
            // add item to the budget controller
        var newItem = budgetController.addItem(input.type, input.description, input.value)
        // add the item to the UI
        UICtrl.addListItem(newItem, input.type);
        // clear the fields
        UICtrl.clearfields();

        // calc and update budget
        updateBudget();
        // calc update the percentages
        updatePercentages();
        }


       
      

    };

    var ctrlDeleteItem = function(event){
        var itemID ,splitID, type, id;
        itemID=(event.target.parentNode.parentNode.parentNode.parentNode.id);

        if(itemID){
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            Id = parseInt(splitID[1]);

            //delete the item from the data structure
            budgetCtrl.deleteItem(type, Id);
            //delete the item from the ui
            UICtrl.deleteListItem(itemID);
            //update and show the new budget 
            updateBudget();

            // calc update the percentages
            updatePercentages();
        }

    };





    return {
        init: function () {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1 ,
            });
            setUpEventListeners();

        }
    };

})(budgetController, UIController);

controller.init();