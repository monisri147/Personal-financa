// ========================================
// PERSONAL FINANCE - APPLICATION (BACKEND INTEGRATED)
// ========================================

// ========================================
// CHECK LOGIN
// ========================================
if (!localStorage.getItem("loggedInUser")) {
    window.location.href = "index.html";
}


// Import functions from state.js
import {
    loadData,
    saveBudget,
    addTransaction,
    deleteTransaction,
    getBudget,
    getTransactions
} from "./state.js";
import {
    updateExpenseChart,
    updateIncomeExpenseChart
} from "./chart.js";


// ========================================
// FORMAT CURRENCY
// ========================================

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(amount) || 0);
}


// ========================================
// GET ELEMENTS
// ========================================

const budgetInput = document.getElementById("budgetInput");
const setBudgetBtn = document.getElementById("setBudgetBtn");
const budgetAmount = document.getElementById("budgetAmount");
const totalIncomeElement = document.getElementById("totalIncome");
const totalExpenseElement = document.getElementById("totalExpense");
const balanceElement = document.getElementById("balance");
const remainingBudgetElement = document.getElementById("remainingBudget");
const budgetPercentage = document.getElementById("budgetPercentage");
const progressBar = document.getElementById("progressBar");
const warningMessage = document.getElementById("warningMessage");
const transactionForm = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");
const filterCategory = document.getElementById("filterCategory");
const filterDate = document.getElementById("filterDate");


// ========================================
// CALCULATE TOTAL INCOME
// ========================================

function calculateIncome() {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    return getTransactions()
        .filter(transaction => {
            if ((transaction.type || "").toLowerCase() !== "income") return false;
            const tDate = transaction.date || transaction.TransactionDate;
            if (!tDate) return false;
            const [year, month] = tDate.split("-");
            return Number(year) === currentYear && Number(month) === currentMonth;
        })
        .reduce((total, transaction) => total + Number(transaction.amount), 0);
}


// ========================================
// CALCULATE TOTAL EXPENSE
// ========================================

function calculateExpenses() {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    return getTransactions()
        .filter(transaction => {
            if ((transaction.type || "").toLowerCase() !== "expense") return false;
            const tDate = transaction.date || transaction.TransactionDate;
            if (!tDate) return false;
            const [year, month] = tDate.split("-");
            return Number(year) === currentYear && Number(month) === currentMonth;
        })
        .reduce((total, transaction) => total + Number(transaction.amount), 0);
}


// ========================================
// DISPLAY BUDGET
// ========================================

function displayBudget() {
    const budget = getBudget();

    if (budgetAmount) {
        budgetAmount.textContent = formatCurrency(budget);
    }

    const budgetAmount2 = document.getElementById("budgetAmount2");
    if (budgetAmount2) {
        budgetAmount2.textContent = formatCurrency(budget);
    }
}


// ========================================
// UPDATE BUDGET PROGRESS
// ========================================

function updateBudgetProgress(budget, totalExpense) {
    const budgetStatus = document.getElementById("budgetStatus");

    if (budget <= 0) {
        if (budgetPercentage) budgetPercentage.textContent = "0%";
        if (progressBar) progressBar.style.width = "0%";
        if (warningMessage) warningMessage.style.display = "none";
        if (budgetStatus) {
            budgetStatus.textContent = "Set a budget to start monitoring your spending.";
        }
        return;
    }

    const percentage = (totalExpense / budget) * 100;

    if (budgetPercentage) {
        budgetPercentage.textContent = `${Math.round(percentage)}%`;
    }

    if (progressBar) {
        const progressWidth = Math.min(percentage, 100);
        progressBar.style.width = `${progressWidth}%`;
    }

    // Budget exceeded
    if (percentage >= 100) {
        if (warningMessage) {
            warningMessage.style.display = "block";
            warningMessage.textContent = "🚨 Budget Exceeded! Your expenses are higher than your monthly budget.";
            warningMessage.style.background = "#fee2e2";
            warningMessage.style.color = "#b91c1c";
        }
        if (budgetStatus) {
            budgetStatus.textContent = "You have exceeded your monthly budget. Try to cut back on expenses.";
        }
    }
    // 80% warning
    else if (percentage >= 80) {
        if (warningMessage) {
            warningMessage.style.display = "block";
            warningMessage.textContent = "⚠️ Warning! You have used 80% or more of your monthly budget.";
            warningMessage.style.background = "#fef3c7";
            warningMessage.style.color = "#92400e";
        }
        if (budgetStatus) {
            budgetStatus.textContent = "You've spent more than 80% of your budget. Slow down on non-essential purchases.";
        }
    }
    // Normal
    else {
        if (warningMessage) {
            warningMessage.style.display = "none";
        }
        if (budgetStatus) {
            budgetStatus.textContent = "Your spending is well within budget. Keep it up!";
        }
    }
}


// ========================================
// UPDATE DASHBOARD
// ========================================

function updateDashboard() {
    const budget = getBudget();
    const totalIncome = calculateIncome();
    const totalExpense = calculateExpenses();
    const balance = totalIncome - totalExpense;
    const remainingBudget = budget - totalExpense;

    if (totalIncomeElement) totalIncomeElement.textContent = formatCurrency(totalIncome);
    if (totalExpenseElement) totalExpenseElement.textContent = formatCurrency(totalExpense);
    if (balanceElement) balanceElement.textContent = formatCurrency(balance);
    if (remainingBudgetElement) remainingBudgetElement.textContent = formatCurrency(remainingBudget);

    const spentAmountElement = document.getElementById("spentAmount");
    if (spentAmountElement) spentAmountElement.textContent = formatCurrency(totalExpense);

    updateBudgetProgress(budget, totalExpense);
    displayTransactions();

    if (typeof updateExpenseChart === "function" || typeof updateIncomeExpenseChart === "function") {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const currentMonthTransactions = getTransactions().filter(t => {
            const tDate = t.date || t.TransactionDate;
            if (!tDate) return false;
            const [year, month] = tDate.split("-");
            return Number(year) === currentYear && Number(month) === currentMonth;
        });

        if (typeof updateExpenseChart === "function") {
            updateExpenseChart(currentMonthTransactions);
        }
        if (typeof updateIncomeExpenseChart === "function") {
            updateIncomeExpenseChart(currentMonthTransactions);
        }
    }
}


// ========================================
// SET MONTHLY BUDGET
// ========================================

if (setBudgetBtn) {
    setBudgetBtn.addEventListener("click", async function () {
        const value = Number(budgetInput?.value);

        if (value <= 0) {
            alert("Please enter a valid budget amount.");
            return;
        }

        await saveBudget(value);
        displayBudget();
        updateDashboard();

        if (budgetInput) {
            budgetInput.value = "";
        }

        alert("Monthly budget saved successfully!");
    });
}


// ========================================
// ADD TRANSACTION
// ========================================

if (transactionForm) {
    transactionForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const amount = Number(document.getElementById("amount")?.value);
        const category = document.getElementById("category")?.value;
        const type = document.getElementById("type")?.value;
        const date = document.getElementById("date")?.value;
        const descriptionElement = document.getElementById("description");
        const description = descriptionElement ? descriptionElement.value : "";

        if (amount <= 0 || !category || !type || !date) {
            alert("Please fill all required fields.");
            return;
        }

        const transaction = {
            amount: amount,
            category: category,
            type: type,
            date: date,
            description: description || "No description"
        };

        const result = await addTransaction(transaction);

        if (result) {
            transactionForm.reset();
            updateDashboard();
            alert("Transaction added successfully!");
        }
    });
}


// ========================================
// DISPLAY TRANSACTIONS
// ========================================

function displayTransactions() {
    if (!transactionList) return;

    let transactionsList = getTransactions();

    if (filterCategory && filterCategory.value !== "all") {
        transactionsList = transactionsList.filter(t => t.category === filterCategory.value);
    }

    if (filterDate && filterDate.value !== "") {
        transactionsList = transactionsList.filter(t => (t.date || t.TransactionDate) === filterDate.value);
    }

    transactionList.innerHTML = "";

    if (transactionsList.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="6" style="text-align:center;">No transactions found.</td>`;
        transactionList.appendChild(row);
        return;
    }

    const isDashboard = !filterCategory;
    let displayList = transactionsList.slice();
    if (isDashboard) {
        displayList = displayList.slice(0, 5);
    }

    displayList.forEach(t => {
        const row = document.createElement("tr");
        const tType = (t.type || "").toLowerCase();
        const typeClass = tType === "income" ? "income-type" : "expense-type";
        const typeSymbol = tType === "income" ? "+" : "-";
        const tId = t.id || t.TransactionId;

        row.innerHTML = `
            <td>${t.date || t.TransactionDate}</td>
            <td>${t.description || "No description"}</td>
            <td>${t.category}</td>
            <td class="${typeClass}">${tType}</td>
            <td class="${typeClass}">${typeSymbol} ${formatCurrency(t.amount)}</td>
            <td>
                <button class="delete-btn" data-id="${tId}">Delete</button>
            </td>
        `;

        transactionList.appendChild(row);
    });
}


// ========================================
// DELETE TRANSACTION
// ========================================

if (transactionList) {
    transactionList.addEventListener("click", async function (event) {
        if (!event.target.classList.contains("delete-btn")) return;

        const id = Number(event.target.dataset.id);
        const confirmDelete = confirm("Are you sure you want to delete this transaction?");

        if (!confirmDelete) return;

        await deleteTransaction(id);
        updateDashboard();
    });
}


// ========================================
// CATEGORY & DATE FILTERS
// ========================================

if (filterCategory) filterCategory.addEventListener("change", displayTransactions);
if (filterDate) filterDate.addEventListener("change", displayTransactions);


// ========================================
// LOGOUT
// ========================================

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
    });
}


// ========================================
// DISPLAY LOGGED-IN USER
// ========================================

const loggedInUserName = document.getElementById("loggedInUserName");
try {
    const rawUser = localStorage.getItem("loggedInUser");
    const loggedInUser = rawUser ? JSON.parse(rawUser) : null;
    if (loggedInUser && loggedInUserName) {
        loggedInUserName.textContent = `Welcome, ${loggedInUser.name}`;
    }
} catch (e) {
    console.error("Error reading user state:", e);
}


// ========================================
// INITIALIZE APPLICATION DATA
// ========================================

async function init() {
    await loadData();
    displayBudget();
    updateDashboard();
}

init();