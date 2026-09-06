// ========================================
// ANALYTICS PAGE (BACKEND INTEGRATED)
// ========================================

// ========================================
// CHECK LOGIN
// ========================================
if (!localStorage.getItem("loggedInUser")) {
    window.location.href = "index.html";
}

import {
    loadData,
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
// INITIALIZE ANALYTICS PAGE
// ========================================

async function initAnalytics() {
    await loadData();

    const transactions = getTransactions();

    // Calculate totals
    const income = transactions
        .filter(t => (t.type || "").toLowerCase() === "income")
        .reduce((total, t) => total + Number(t.amount), 0);

    const expense = transactions
        .filter(t => (t.type || "").toLowerCase() === "expense")
        .reduce((total, t) => total + Number(t.amount), 0);

    const balance = income - expense;

    // Display summary metrics
    const incElem = document.getElementById("analyticsIncome");
    const expElem = document.getElementById("analyticsExpense");
    const balElem = document.getElementById("analyticsBalance");

    if (incElem) incElem.textContent = formatCurrency(income);
    if (expElem) expElem.textContent = formatCurrency(expense);
    if (balElem) balElem.textContent = formatCurrency(balance);

    // Display charts
    updateExpenseChart(transactions);
    updateIncomeExpenseChart(transactions);

    // Calculate spending by category
    const categoryTotals = {};

    transactions
        .filter(t => (t.type || "").toLowerCase() === "expense")
        .forEach(t => {
            const category = t.category;
            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }
            categoryTotals[category] += Number(t.amount);
        });

    const spendingSummary = document.getElementById("spendingSummary");
    if (spendingSummary) {
        const categories = Object.entries(categoryTotals);

        if (categories.length === 0) {
            spendingSummary.innerHTML = `<p>No expense data available.</p>`;
        } else {
            spendingSummary.innerHTML = "";
            categories.sort((a, b) => b[1] - a[1]);

            categories.forEach(([category, amount]) => {
                const row = document.createElement("div");
                row.className = "transaction-row";
                const percentage = expense > 0 ? ((amount / expense) * 100).toFixed(1) : 0;

                row.innerHTML = `
                    <div>
                        <div class="transaction-name">${category}</div>
                        <div class="transaction-category">${percentage}% of total expenses</div>
                    </div>
                    <strong class="expense">${formatCurrency(amount)}</strong>
                `;
                spendingSummary.appendChild(row);
            });
        }
    }
}

initAnalytics();


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