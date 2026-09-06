// ========================================
// PERSONAL FINANCE CHARTS
// ========================================

let expenseChart = null;
let incomeExpenseChart = null;


// ========================================
// UPDATE EXPENSE CATEGORY CHART
// ========================================

function updateExpenseChart(transactions) {

    const canvas =
        document.getElementById("expenseChart");

    if (!canvas) {
        return;
    }


    // Get only expenses
    const expenses =
        transactions.filter(
            transaction =>
                (transaction.type || "").toLowerCase() === "expense"
        );


    // Create category totals
    const categoryTotals = {};


    expenses.forEach(transaction => {

        const category =
            transaction.category;

        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }

        categoryTotals[category] +=
            Number(transaction.amount);
    });


    const labels =
        Object.keys(categoryTotals);

    const values =
        Object.values(categoryTotals);


    // Destroy old chart
    if (expenseChart) {
        expenseChart.destroy();
    }


    const categoryColors = {
        "food": "#ff9f43",
        "rent": "#5f27cd",
        "transport": "#341f97",
        "shopping": "#ff9ff3",
        "education": "#00d2d3",
        "entertainment": "#ff6b6b",
        "salary": "#10ac84",
        "other": "#8395a7"
    };
    const backgroundColors = labels.map(label => {
        const key = String(label).toLowerCase();
        return categoryColors[key] || "#8395a7";
    });

    // Create chart
    expenseChart =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels: labels,

                    datasets: [
                        {
                            data: values,
                            backgroundColor: backgroundColors,
                            borderColor: "#1d2047",
                            borderWidth: 2
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {
                                color: "#ffffff"
                            }
                        }
                    }
                }
            }
        );
}


// ========================================
// UPDATE INCOME VS EXPENSE CHART
// ========================================

function updateIncomeExpenseChart(
    transactions
) {

    const canvas =
        document.getElementById(
            "incomeExpenseChart"
        );

    if (!canvas) {
        return;
    }


    let income = 0;
    let expense = 0;


    transactions.forEach(
        transaction => {

            const tType = (transaction.type || "").toLowerCase();

            if (tType === "income") {
                income += Number(transaction.amount);
            }

            if (tType === "expense") {
                expense += Number(transaction.amount);
            }
        }
    );


    // Destroy old chart
    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
    }


    // Create chart
    incomeExpenseChart =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels: [
                        "Income",
                        "Expenses"
                    ],

                    datasets: [
                        {
                            label:
                                "Amount (₹)",

                            data: [
                                income,
                                expense
                            ],
                            backgroundColor: [
                                "#10ac84",
                                "#ff6b6b"
                            ],
                            borderColor: [
                                "#0e906f",
                                "#e05656"
                            ],
                            borderWidth: 1
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {
                                color: "#ffffff"
                            },

                            grid: {
                                color:
                                    "#454a78"
                            }
                        },

                        x: {

                            ticks: {
                                color: "#ffffff"
                            },

                            grid: {
                                color:
                                    "#454a78"
                            }
                        }
                    },

                    plugins: {

                        legend: {

                            labels: {
                                color:
                                    "#ffffff"
                            }
                        }
                    }
                }
            }
        );
}


// ========================================
// EXPORT
// ========================================

export {
    updateExpenseChart,
    updateIncomeExpenseChart
};