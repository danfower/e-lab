const API_BASE_URL = "https://e-lab.onrender.com/";

function showAddStockForm() {
    content.innerHTML = `
        <h2>Add Stock</h2>
        <form id="add-stock-form">
            <label for="name">Stock Name:</label>
            <input type="text" id="name" required>

            <label for="category">Category:</label>
            <input type="text" id="category">

            <label for="quantity">Quantity:</label>
            <input type="number" id="quantity" required>

            <label for="min-threshold">Minimum Threshold:</label>
            <input type="number" id="min-threshold" required>

            <button type="submit">Add Stock</button>
        </form>
    `;

    document.getElementById("add-stock-form").onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const category = document.getElementById("category").value;
        const quantity = parseInt(document.getElementById("quantity").value, 10);
        const minThreshold = parseInt(document.getElementById("min-threshold").value, 10);

        addStock({ name, category, quantity, min_threshold: minThreshold });
    };
}


// Add stock
function addStock(stock) {
    fetch(`${API_BASE_URL}/add_stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stock),
    })
        .then((response) => response.json())
        .then((data) => alert(data.message))
        .catch((error) => console.error("Error:", error));
}

// Load the stock dashboard
function loadStockDashboard() {
    fetch(`${API_BASE_URL}/get_stock`)
        .then((response) => response.json())
        .then((data) => {
            const content = document.getElementById("content");
            content.innerHTML = `<h2>Stock Dashboard</h2>`;
            data.forEach((item) => {
                content.innerHTML += `
                    <div class="stock-item">
                        <span>Name: ${item.name}</span>
                        <span>Category: ${item.category}</span>
                        <span>Quantity: ${item.quantity}</span>
                        <span>Min Threshold: ${item.min_threshold}</span>
                        <button onclick="useStock(${item.id})">Use Stock</button>
                        <button onclick="deleteStock(${item.id})">Delete</button>
                    </div>
                `;
            });
        })
        .catch((error) => console.error("Error:", error));
}

// Use stock
function useStock(stockId) {
    const quantity = prompt("Enter quantity to use:");
    if (quantity && parseInt(quantity, 10) > 0) {
        fetch(`${API_BASE_URL}/use_stock/${stockId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: parseInt(quantity, 10) }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.message);
                loadStockDashboard();
            })
            .catch((error) => console.error("Error:", error));
    } else {
        alert("Invalid quantity.");
    }
}

// Delete stock
function deleteStock(stockId) {
    if (confirm("Are you sure you want to delete this stock item?")) {
        fetch(`${API_BASE_URL}/remove_stock/${stockId}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.message);
                loadStockDashboard();
            })
            .catch((error) => console.error("Error:", error));
    }
}

// Load low stock items
function loadLowStock() {
    fetch(`${API_BASE_URL}/check_low_stock`)
        .then((response) => response.json())
        .then((data) => {
            const content = document.getElementById("content");
            content.innerHTML = `<h2>Low Stock Items</h2>`;
            data.forEach((item) => {
                content.innerHTML += `
                    <div class="stock-item">
                        <span>Name: ${item.name}</span>
                        <span>Quantity: ${item.quantity}</span>
                        <span>Min Threshold: ${item.min_threshold}</span>
                    </div>
                `;
            });
        })
        .catch((error) => console.error("Error:", error));
}

