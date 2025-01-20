const API_BASE_URL = "https://e-lab.onrender.com"; // Replace with your backend URL

// Show the Add Stock form
function showAddStockForm() {
    // Fetch existing categories from the backend
    fetch(`${API_BASE_URL}/get_categories`)
        .then((response) => response.json())
        .then((categories) => {
            const content = document.getElementById("content");
            content.innerHTML = `
                <h2>Add Stock</h2>
                <form id="add-stock-form">
                    <label for="name">Stock Name:</label>
                    <input type="text" id="name" required>

                    <label for="category-select">Choose Existing Category:</label>
                    <select id="category-select">
                        <option value="" disabled selected>Select a category</option>
                        ${categories
                            .map(
                                (category) => `<option value="${category}">${category}</option>`
                            )
                            .join("")}
                    </select>

                    <label for="new-category">Or Add a New Category:</label>
                    <input type="text" id="new-category" placeholder="New Category">

                    <label for="quantity">Quantity:</label>
                    <input type="number" id="quantity" required>

                    <label for="min-threshold">Minimum Threshold:</label>
                    <input type="number" id="min-threshold" required>

                    <button type="submit">Add Stock</button>
                </form>
            `;

            // Add event listener for form submission
            document.getElementById("add-stock-form").onsubmit = (e) => {
                e.preventDefault();
                const name = document.getElementById("name").value;
                const categorySelect = document.getElementById("category-select").value;
                const newCategory = document.getElementById("new-category").value;
                const category = newCategory || categorySelect; // Use the new category if provided
                const quantity = parseInt(document.getElementById("quantity").value, 10);
                const minThreshold = parseInt(document.getElementById("min-threshold").value, 10);

                // Validate category selection
                if (!category) {
                    alert("Please select or add a category.");
                    return;
                }

                // Send stock data to the backend
                addStock({ name, category, quantity, min_threshold: minThreshold });
            };
        })
        .catch((error) => {
            console.error("Error fetching categories:", error);
            document.getElementById("content").innerHTML = `
                <h2>Add Stock</h2>
                <p>Error loading categories. Please try again later.</p>
            `;
        });
}

// Add Stock API Call
function addStock(stock) {
    fetch(`${API_BASE_URL}/add_stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stock),
    })
        .then((response) => response.json())
        .then((data) => {
            alert(data.message);
            loadStockDashboard();
        })
        .catch((error) => console.error("Error:", error));
}

// Load the Stock Dashboard
function loadStockDashboard() {
    fetch(`${API_BASE_URL}/get_stock`)
        .then((response) => response.json())
        .then((data) => {
            const content = document.getElementById("content");
            content.innerHTML = `<h2>Stock Dashboard</h2>`;
            if (data.length === 0) {
                content.innerHTML += "<p>No stock items available.</p>";
                return;
            }
            data.forEach((item) => {
                content.innerHTML += `
                    <div class="stock-item">
                        <p><strong>${item.name}</strong></p>
                        <p>Category: ${item.category || "N/A"}</p>
                        <p>Quantity: ${item.quantity}</p>
                        <p>Min Threshold: ${item.min_threshold}</p>
                        <button onclick="deleteStock(${item.id})">Delete</button>
                    </div>
                `;
            });
        })
        .catch((error) => console.error("Error:", error));
}

// Show Use Stock Form
function showUseStockForm() {
    fetch(`${API_BASE_URL}/get_stock`)
        .then((response) => response.json())
        .then((data) => {
            if (data.length === 0) {
                content.innerHTML = "<h2>Use Stock</h2><p>No stock items available to use.</p>";
                return;
            }

            const content = document.getElementById("content");
            content.innerHTML = `
                <h2>Use Stock</h2>
                <form id="use-stock-form">
                    <label for="stock-select">Select Stock Item:</label>
                    <select id="stock-select" required>
                        ${data
                            .map(
                                (item) =>
                                    `<option value="${item.id}">${item.name} (Available: ${item.quantity})</option>`
                            )
                            .join("")}
                    </select>

                    <label for="quantity">Quantity to Use:</label>
                    <input type="number" id="quantity" required>

                    <button type="submit">Use Stock</button>
                </form>
            `;

            document.getElementById("use-stock-form").onsubmit = (e) => {
                e.preventDefault();
                const stockId = document.getElementById("stock-select").value;
                const quantity = parseInt(document.getElementById("quantity").value, 10);

                useStock(stockId, quantity);
            };
        })
        .catch((error) => console.error("Error:", error));
}

// Use Stock API Call
function useStock(stockId, quantity) {
    if (quantity > 0) {
        fetch(`${API_BASE_URL}/use_stock/${stockId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.message);
                loadStockDashboard();
            })
            .catch((error) => console.error("Error:", error));
    } else {
        alert("Please enter a valid quantity.");
    }
}

// Delete Stock API Call
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

// Load Low Stock Items
function loadLowStock() {
    fetch(`${API_BASE_URL}/check_low_stock`)
        .then((response) => response.json())
        .then((data) => {
            const content = document.getElementById("content");
            content.innerHTML = `<h2>Low Stock Items</h2>`;
            if (data.length === 0) {
                content.innerHTML += "<p>All stock items are above their thresholds.</p>";
                return;
            }
            data.forEach((item) => {
                content.innerHTML += `
                    <div class="stock-item">
                        <p><strong>${item.name}</strong></p>
                        <p>Quantity: ${item.quantity}</p>
                        <p>Min Threshold: ${item.min_threshold}</p>
                    </div>
                `;
            });
        })
        .catch((error) => console.error("Error:", error));
}

// Add Event Listeners
document.getElementById("stock-dashboard-btn").addEventListener("click", loadStockDashboard);
document.getElementById("add-stock-btn").addEventListener("click", showAddStockForm);
document.getElementById("use-stock-btn").addEventListener("click", showUseStockForm);
document.getElementById("low-stock-btn").addEventListener("click", loadLowStock);
