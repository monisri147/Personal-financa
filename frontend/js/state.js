// ================================
// PERSONAL FINANCE STATE MANAGEMENT (BACKEND INTEGRATED)
// ================================

const API_BASE_URL = window.location.port === "5000" ? `${window.location.origin}/api` : "http://127.0.0.1:5000/api";

// Local application state cache
let budget = 0;
let transactions = [];


// ================================
// HELPER: GET AUTH HEADERS & TOKEN
// ================================

function getAuthToken() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) return null;
    try {
        const user = JSON.parse(loggedInUser);
        return user ? user.token : null;
    } catch (e) {
        return null;
    }
}

function getAuthHeaders() {
    const token = getAuthToken();
    const headers = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}


function handleUnauthorized() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
}

// ================================
// LOAD DATA FROM BACKEND API
// ================================

async function loadData() {
    budget = 0;
    transactions = [];

    const token = getAuthToken();
    if (!token) {
        return;
    }

    try {
        // Fetch user transactions
        const resTrans = await fetch(`${API_BASE_URL}/transactions`, {
            headers: getAuthHeaders()
        });

        if (resTrans.status === 401) {
            handleUnauthorized();
            return;
        }

        if (resTrans.ok) {
            const dataTrans = await resTrans.json();
            transactions = dataTrans || [];
        }

        // Fetch user budgets
        const resBudgets = await fetch(`${API_BASE_URL}/budgets`, {
            headers: getAuthHeaders()
        });

        if (resBudgets.status === 401) {
            handleUnauthorized();
            return;
        }

        if (resBudgets.ok) {
            const dataBudgets = await resBudgets.json();
            if (Array.isArray(dataBudgets) && dataBudgets.length > 0) {
                // Find overall or most recent budget
                const overall = dataBudgets.find(b => b.category === "Overall") || dataBudgets[0];
                budget = Number(overall.amount) || 0;
            }
        }
    } catch (error) {
        console.error("Error loading data from backend:", error);
    }
}


// ================================
// SAVE BUDGET TO BACKEND
// ================================

async function saveBudget(newBudget) {
    budget = Number(newBudget);
    const token = getAuthToken();
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE_URL}/budgets`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                amount: budget,
                category: "Overall"
            })
        });

        if (res.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!res.ok) {
            const err = await res.json();
            console.error("Error saving budget:", err);
        }
    } catch (error) {
        console.error("Error saving budget to backend:", error);
    }
}


// ================================
// ADD TRANSACTION TO BACKEND
// ================================

async function addTransaction(transaction) {
    const token = getAuthToken();
    if (!token) return null;

    try {
        const res = await fetch(`${API_BASE_URL}/transactions`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                type: transaction.type,
                amount: transaction.amount,
                category: transaction.category,
                description: transaction.description,
                date: transaction.date
            })
        });

        if (res.status === 401) {
            handleUnauthorized();
            return null;
        }

        if (res.ok) {
            const result = await res.json();
            const created = result.transaction;
            transactions.unshift(created);
            return created;
        } else {
            const err = await res.json();
            alert(err.error || "Failed to add transaction.");
            return null;
        }
    } catch (error) {
        console.error("Error adding transaction to backend:", error);
        return null;
    }
}


// ================================
// DELETE TRANSACTION FROM BACKEND
// ================================

async function deleteTransaction(id) {
    const token = getAuthToken();
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (res.status === 401) {
            handleUnauthorized();
            return;
        }

        if (res.ok) {
            transactions = transactions.filter(t => (t.id || t.TransactionId) !== id);
        } else {
            const err = await res.json();
            alert(err.error || "Failed to delete transaction.");
        }
    } catch (error) {
        console.error("Error deleting transaction from backend:", error);
    }
}


async function updateTransaction(id, updatedData) {
    const token = getAuthToken();
    if (!token) return null;

    try {
        const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(updatedData)
        });

        if (res.status === 401) {
            handleUnauthorized();
            return null;
        }

        if (res.ok) {
            const result = await res.json();
            const updated = result.transaction;
            const idx = transactions.findIndex(t => (t.id || t.TransactionId) === id);
            if (idx !== -1) {
                transactions[idx] = updated;
            }
            return updated;
        } else {
            const err = await res.json();
            alert(err.error || "Failed to update transaction.");
            return null;
        }
    } catch (error) {
        console.error("Error updating transaction in backend:", error);
        return null;
    }
}


// ================================
// GET BUDGET
// ================================

function getBudget() {
    return budget;
}


// ================================
// GET TRANSACTIONS
// ================================

function getTransactions() {
    return transactions;
}


// ================================
// GET TOTAL INCOME
// ================================

function getTotalIncome() {
    return transactions
        .filter(transaction => (transaction.type || "").toLowerCase() === "income")
        .reduce((total, transaction) => total + Number(transaction.amount), 0);
}


// ================================
// GET TOTAL EXPENSES
// ================================

function getTotalExpenses() {
    return transactions
        .filter(transaction => (transaction.type || "").toLowerCase() === "expense")
        .reduce((total, transaction) => total + Number(transaction.amount), 0);
}


// ================================
// GET BALANCE
// ================================

function getBalance() {
    return getTotalIncome() - getTotalExpenses();
}


// ================================
// EXPORT FUNCTIONS
// ================================

export {
    loadData,
    saveBudget,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getBudget,
    getTransactions,
    getTotalIncome,
    getTotalExpenses,
    getBalance
};