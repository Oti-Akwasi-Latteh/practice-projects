const errorMessg = document.querySelector('.error-message');
const budgetInput = document.querySelector('.budget-input');
const tblRecordEl = document.querySelector('.table-data');

/* Cards */
const budgetCardsEl = document.querySelector('.budget-card');
const expensesCardsEl = document.querySelector('.expenses-card'); 
const balanceCardsEl = document.querySelector('.balance-card');

/* Inputs */
const expenseAmount = document.querySelector('.expenses-amount');
const expenseDesc = document.querySelector('.expenses-input');
const selectCategory = document.getElementById("category-select"); 

let itemList = []; 
let itemId = 0;
let myChart;

/* Button Events */
function btnEvents() {
    document.getElementById("btn-budget").addEventListener("click", (e) => {
        e.preventDefault();
        budgetFun();
    });

    document.getElementById("btn-expenses").addEventListener("click", (e) => {
        e.preventDefault();
        expensesFun();
    });
}

/* callimg btns Event */
document.addEventListener("DOMContentLoaded", () => {
    btnEvents(); 
    loadDataFromLocalStorage(); 
    inpieChart()
});

/* Budget Function */
function budgetFun() {
    const budgetValue = parseInt(budgetInput.value.trim());

    if (isNaN(budgetValue) || budgetValue <= 0) {
        showErrorMessg("Please enter  Your budget or More Than 0");
        return;
    }

    budgetCardsEl.textContent = budgetValue.toFixed(2);
    balanceCardsEl.textContent = budgetValue.toFixed(2); 
    budgetInput.value = "";
    saveDataToLocalStorage();
}

/* Expenses Function */
function expensesFun() {
    let expensesDescValue = expenseDesc.value.trim();
    let expenseAmountValue = parseInt(expenseAmount.value.trim());
    let selectedCategory = selectCategory.value; 

    if (expensesDescValue == "" || expenseAmountValue == ""|| budgetInput < 0) {
        showErrorMessg("please Enter Expense Desc or Expense Amount!");
        return;
    }

    expenseAmount.value = "";
    expenseDesc.value = "";

    let expenses = {
        id: itemId,
        title: expensesDescValue,
        amount: expenseAmountValue,
        type: selectedCategory
    };

    itemId++;
    itemList.push(expenses);

    addTransactionToTable(expenses);
    updateBudgetAndBalance(expenses);
    saveDataToLocalStorage();
}

/* Update Budget, Balance & Expenses Card */
function updateBudgetAndBalance(expenses) {
    let currentBudget = parseInt(budgetCardsEl.textContent) || 0;
    let currentBalance = parseInt(balanceCardsEl.textContent) || 0;

    if (expenses.type === "Income") {
        currentBudget += expenses.amount; 
        currentBalance += expenses.amount; 
    } else if (expenses.type === "Expenses") {
        currentBalance -= expenses.amount; 
    }

    /*Expenses Card updates every transaction */
    let totalTransactionAmount = itemList
        .reduce((sum, t) => sum + t.amount, 0);

    budgetCardsEl.textContent = currentBudget.toFixed(2);
    balanceCardsEl.textContent = currentBalance.toFixed(2);
    expensesCardsEl.textContent = totalTransactionAmount.toFixed(2);
    saveDataToLocalStorage();

    updateChart();
}

/* Add Transaction to Table */
function addTransactionToTable(transaction) {
    const html = `
        <ul class="tbl-tr-content">
            <li data-id=${transaction.id}>${transaction.id}</li>
            <li>${transaction.title}</li>
            <li><span>$</span>${transaction.amount}</li>
            <li>
                <button type="button" class="btn-edit">Edit</button>
                <button type="button" class="btn-delete">Delete</button>
            </li>
        </ul>
    `; 

    tblRecordEl.insertAdjacentHTML("beforeend", html);

    /*Edit btn */
    const btnEdit = document.querySelectorAll('.btn-edit');
    const btnDel = document.querySelectorAll('.btn-delete');
   

    /* Edit Button */
btnEdit.forEach((btnedit) => {
    btnedit.addEventListener("click", (el) => {
        let id = el.target.parentElement.parentElement.firstElementChild.dataset.id;
        let element = el.target.parentElement.parentElement;

        let expenses = itemList.find(item => item.id === parseInt(id));
        if (!expenses) return; 
    
        expenseDesc.value = expenses.title;
        expenseAmount.value = expenses.amount;

        element.remove();

        itemList = itemList.filter(item => item.id !== parseInt(id));
        saveDataToLocalStorage();
        updateChart();
    });
});

/* Delete Button */
btnDel.forEach((btndel) => {
    btndel.addEventListener("click", (el) => {
        let id = el.target.parentElement.parentElement.firstElementChild.dataset.id;
        let element = el.target.parentElement.parentElement;
      
        let transaction = itemList.find(item => item.id === parseInt(id));
        if (!transaction) return; 

        element.remove();
        
        itemList = itemList.filter(item => item.id !== parseInt(id));

        let currentBalance = parseInt(balanceCardsEl.textContent) || 0;
        let currentBudget = parseInt(budgetCardsEl.textContent) || 0;

        if (transaction.type === "Expenses") {
            currentBalance -= transaction.amount; 
        } else if (transaction.type === "Income") {
            currentBudget -= transaction.amount;  
        }

        balanceCardsEl.textContent = currentBalance.toFixed(2);
        budgetCardsEl.textContent = currentBudget.toFixed(2);
        saveDataToLocalStorage();
        updateChart();
    });
});
    
}

/* Show Error Message */
function showErrorMessg(message) {
    errorMessg.innerHTML = `<p>${message}</p>`;
    errorMessg.classList.add("error");
    setTimeout(() => {
        errorMessg.classList.remove("error");
    }, 2500);
}

/* Recalculate Budget, Balance, and Expenses */
function updateBudgetAndBalanceFromStorage() {
    let totalExpenses = 0;
    let totalIncome = 0;

    itemList.forEach(item => {
        if (item.type === "Income") {
            totalIncome += item.amount;
        } else if (item.type === "Expenses") { 
            totalExpenses += item.amount;
        }
    });

    let budget = totalIncome; 
    let balance = budget - totalExpenses; 

    budgetCardsEl.textContent = budget.toFixed(2), "0.00";
    balanceCardsEl.textContent = balance.toFixed(2), "0.00";
    expensesCardsEl.textContent = totalExpenses.toFixed(2), "0.00";
}

function inpieChart() {
    const ctx = document.getElementById('myChart').getContext('2d');

    myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Expenses', 'Budget', 'Balance'],
            datasets: [{
                label: 'Budget Tracker',
                data: [0, 0, 0],
                backgroundColor: ['#3357FF', '#33FF57', '#FF5733 '], 
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });

    updateChart(); 
}


function updateChart() {
    const budgetValue = parseInt(budgetCardsEl.textContent) || 0;
    const expensesValue = parseInt(expensesCardsEl.textContent) || 0;
    const balanceValue = parseInt(balanceCardsEl.textContent) || 0;

    const chartData = [expensesValue, budgetValue, balanceValue];

    if (myChart) {
        myChart.data.datasets[0].data = chartData;
        myChart.update();
    }
}

/* Save to LocalStorage */
function saveDataToLocalStorage() {
    const data = {
        itemList: itemList,

        budget: budgetCardsEl.textContent,  
        balance: balanceCardsEl.textContent, 
        expenses: expensesCardsEl.textContent 

    };

    localStorage.setItem("expensesData", JSON.stringify(data));
}

/* Load from LocalStorage */
function loadDataFromLocalStorage() {
    let savedData = localStorage.getItem("expensesData");

    if (savedData) {
        savedData = JSON.parse(savedData);

        /*Restore itemList */
        itemList = savedData.itemList || [];
        itemId = itemList.length ? Math.max(...itemList.map(t => t.id)) + 1 : 0;
        budgetCardsEl.textContent = savedData.budget || "0.00";
        balanceCardsEl.textContent = savedData.balance || "0.00";
        expensesCardsEl.textContent = savedData.expenses || "0.00";
       
        itemList.forEach(transaction => addTransactionToTable(transaction));
        updateChart();
    }
}

