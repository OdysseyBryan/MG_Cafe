document.addEventListener('DOMContentLoaded', function() {
    const searchBar = document.querySelector('.search-bar');
    const recipeCards = document.querySelectorAll('.recipe-card');
    const noResults = document.querySelector('.no-results');
    const categoryFilter = document.getElementById('category-filter');
    const drinkButtons = document.querySelectorAll('.drink-btn');
    const milkButtons = document.querySelectorAll('.milk-btn');
    // Show all cards by default on page load
    recipeCards.forEach(card => {
    card.classList.add('visible');
});

    
    // Search functionality
    searchBar.addEventListener('input', function() {
        categoryFilter.dispatchEvent(new Event('change'));
        const searchTerm = this.value.trim().toLowerCase();
        let hasVisibleCards = false;
        
        if (searchTerm === '') {
            // Hide all cards when search is empty
            recipeCards.forEach(card => {
                card.classList.remove('visible');
            });
            noResults.classList.remove('visible');
            return;
        }
        
        recipeCards.forEach(card => {
            const recipeName = card.getAttribute('data-name').toLowerCase();
            const recipeCategory = card.getAttribute('data-category').toLowerCase();
            
            if (recipeName.includes(searchTerm) || recipeCategory.includes(searchTerm)) {
                card.classList.add('visible');
                hasVisibleCards = true;
            } else {
                card.classList.remove('visible');
            }
        });
        
        // Show no results message if no cards match
        noResults.classList.toggle('visible', !hasVisibleCards);
    });

    categoryFilter.addEventListener('change', function () {
        const selectedCategory = this.value;
        const searchTerm = searchBar.value.trim().toLowerCase();
        let hasVisibleCards = false;
    
        recipeCards.forEach(card => {
            const recipeName = card.getAttribute('data-name').toLowerCase();
            const recipeCategory = card.getAttribute('data-category').toLowerCase();
    
            const matchesCategory = selectedCategory === 'all' || recipeCategory === selectedCategory;
            const matchesSearch = searchTerm === '' || recipeName.includes(searchTerm) || recipeCategory.includes(searchTerm);
    
            if (matchesCategory && matchesSearch) {
                card.classList.add('visible');
                hasVisibleCards = true;
            } else {
                card.classList.remove('visible');
            }
        });
    
        noResults.classList.toggle('visible', !hasVisibleCards);
    });
    
    
    
    // Drink type toggle functionality
    drinkButtons.forEach(button => {
        button.addEventListener('click', function() {
            const recipeCard = this.closest('.recipe-card');
            const tempType = this.getAttribute('data-type');
            
            // Update active button styling
            const buttons = this.parentElement.querySelectorAll('.drink-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show the corresponding temperature procedure
            const tempProcedures = recipeCard.querySelectorAll('.temp-procedure');
            tempProcedures.forEach(proc => {
                if (proc.getAttribute('data-temp-type') === tempType) {
                    proc.classList.add('active');
                } else {
                    proc.classList.remove('active');
                }
            });
        });
    });
    
    // Milk type toggle functionality
    milkButtons.forEach(button => {
        button.addEventListener('click', function() {
            const recipeCard = this.closest('.recipe-card');
            const milkType = this.getAttribute('data-milk');
            
            // Update active button styling
            const buttons = recipeCard.querySelectorAll('.milk-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show the corresponding procedure
            const procedures = recipeCard.querySelectorAll('.milk-procedure');
            procedures.forEach(proc => {
                if (proc.getAttribute('data-milk-type') === milkType) {
                    proc.classList.add('active');
                } else {
                    proc.classList.remove('active');
                }
            });
        });
    });
});

// Calculator Functionality
const expectedPettyCashInput = document.getElementById('expected-petty-cash');
const denomInputs = document.querySelectorAll('.denom-input');
const denomTotals = document.querySelectorAll('.denom-total');
const grandTotalElement = document.querySelector('.grand-total');
const checkMark = document.querySelector('.check-mark');

function calculateTotals() {
    let grandTotal = 0;
    
    denomInputs.forEach(input => {
        const multiplier = parseFloat(input.getAttribute('data-multiplier'));
        const pieces = parseInt(input.value) || 0;
        const total = multiplier * pieces;
        
        const denom = input.getAttribute('data-multiplier');
        const totalElement = document.querySelector(`.denom-total[data-denom="${denom}"]`);
        totalElement.textContent = total.toFixed(2);
        
        grandTotal += total;
    });
    
    grandTotalElement.textContent = grandTotal.toFixed(2);
    
    // Check if matches expected petty cash
    const expectedAmount = parseFloat(expectedPettyCashInput.value) || 0;
    if (expectedAmount > 0 && Math.abs(grandTotal - expectedAmount) < 0.01) {
        checkMark.innerHTML = '✓';
        checkMark.style.color = 'green';
    } else {
        checkMark.innerHTML = '';
    }
}

// Event listeners for calculator
expectedPettyCashInput.addEventListener('input', calculateTotals);

denomInputs.forEach(input => {
    input.addEventListener('input', calculateTotals);
});

// Calculator toggle buttons
const calcButtons = document.querySelectorAll('.calc-btn');
calcButtons.forEach(button => {
    button.addEventListener('click', function() {
        const recipeCard = this.closest('.recipe-card');
        const calcType = this.getAttribute('data-type');
        
        // Update active button styling
        const buttons = recipeCard.querySelectorAll('.calc-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Show the corresponding procedure
        const procedures = recipeCard.querySelectorAll('.calc-procedure');
        procedures.forEach(proc => {
            if (proc.getAttribute('data-calc-type') === calcType) {
                proc.classList.add('active');
            } else {
                proc.classList.remove('active');
            }
        });
    });
});

// Closing Calculator Functionality
const cashSalesInput = document.getElementById('cash-sales');
const totalGcashSalesElement = document.getElementById('total-gcash-sales');
const netSalesElement = document.getElementById('net-sales');
const totalExpensesElement = document.getElementById('total-expenses');
const onhandCashTotalElement = document.querySelector('.onhand-cash-total');
const cashWithExpensesElement = document.querySelector('.cash-with-expenses');
const totalSalesGcashElement = document.querySelector('.total-sales-gcash');
const netSalesCheck = document.querySelector('.net-sales-check');
const totalSalesCheck = document.querySelector('.total-sales-check');

// Add new GCash row
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-gcash-btn')) {
        const gcashContainer = e.target.closest('.gcash-inputs');
        const newRow = document.createElement('div');
        newRow.className = 'gcash-row';
        newRow.innerHTML = `
            <input type="number" class="gcash-input" placeholder="Enter GCash amount">
            <button class="remove-btn">-</button>
        `;
        gcashContainer.appendChild(newRow);
    }
    
    // Add new expense row
    if (e.target.classList.contains('add-expense-btn')) {
        const expensesContainer = e.target.closest('.expense-inputs');
        const newRow = document.createElement('div');
        newRow.className = 'expense-row';
        newRow.innerHTML = `
            <input type="number" class="expense-input" placeholder="Enter expense amount">
            <button class="remove-btn">-</button>
        `;
        expensesContainer.appendChild(newRow);
    }
    
    // Remove row
    if (e.target.classList.contains('remove-btn')) {
        e.target.closest('.gcash-row, .expense-row').remove();
        calculateClosingTotals();
    }
});

// Calculate all closing values
function calculateClosingTotals() {
    // Calculate denomination totals
    let onhandCash = 0;
    document.querySelectorAll('.closing-denom-input').forEach(input => {
        const multiplier = parseFloat(input.getAttribute('data-multiplier'));
        const pieces = parseInt(input.value) || 0;
        const total = multiplier * pieces;
        
        const denom = input.getAttribute('data-multiplier');
        const totalElement = document.querySelector(`.closing-denom-total[data-denom="${denom}"]`);
        totalElement.textContent = total.toFixed(2);
        
        onhandCash += total;
    });
    onhandCashTotalElement.textContent = onhandCash.toFixed(2);
    
    // Calculate total expenses
    let totalExpenses = 0;
    document.querySelectorAll('.expense-input').forEach(input => {
        totalExpenses += parseFloat(input.value) || 0;
    });
    totalExpensesElement.textContent = totalExpenses.toFixed(2);
    
    // Calculate total GCash sales
    let totalGcash = 0;
    document.querySelectorAll('.gcash-input').forEach(input => {
        totalGcash += parseFloat(input.value) || 0;
    });
    totalGcashSalesElement.textContent = totalGcash.toFixed(2);
    
    // Get cash sales
    const cashSales = parseFloat(cashSalesInput.value) || 0;
    
    // Calculate net sales (cash + GCash)
    const netSales = cashSales + totalGcash;
    netSalesElement.textContent = netSales.toFixed(2);
    
    // Calculate total cash including expenses
    const cashWithExpenses = onhandCash + totalExpenses;
    cashWithExpensesElement.textContent = cashWithExpenses.toFixed(2);
    
    // Calculate total sales (cash + GCash)
    const totalSales = cashWithExpenses + totalGcash;
    totalSalesGcashElement.textContent = totalSales.toFixed(2);
    
    // Check if matches expected values
    if (netSales > 0 && Math.abs(netSales - totalSales) < 0.01) {
        netSalesCheck.innerHTML = '✓';
        netSalesCheck.style.color = 'green';
        totalSalesCheck.innerHTML = '✓';
        totalSalesCheck.style.color = 'green';
    } else {
        netSalesCheck.innerHTML = '';
        totalSalesCheck.innerHTML = '';
    }
}

// Event listeners for closing calculator
cashSalesInput.addEventListener('input', calculateClosingTotals);

document.addEventListener('input', function(e) {
    if (e.target.classList.contains('closing-denom-input') || 
        e.target.classList.contains('expense-input') || 
        e.target.classList.contains('gcash-input')) {
        calculateClosingTotals();
    }
});

// Disable right-click (basic protection)
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});
