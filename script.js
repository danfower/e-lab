const API_BASE_URL = "https://e-lab.onrender.com";

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

// Load Stock Dashboard with Search
function loadStockDashboard() {
    content.innerHTML = `
        <h2>Stock Dashboard</h2>
        <div id="search-bar">
            <input type="text" id="search-query" placeholder="Search by name or category">
            <button onclick="searchStock()">Search</button>
            <button onclick="loadStockDashboard()">Reset</button>
        </div>
        <div id="stock-list"></div>
    `;

    fetch(`${API_BASE_URL}/get_stock`)
        .then((response) => response.json())
        .then((data) => {
            displayStockItems(data);
        })
        .catch((error) => console.error("Error:", error));
}

// Display stock items dynamically
function displayStockItems(data) {
    const stockList = document.getElementById("stock-list");
    stockList.innerHTML = ""; // Clear previous content

    if (data.length === 0) {
        stockList.innerHTML = "<p>No stock items available.</p>";
        return;
    }

    data.forEach((item) => {
        stockList.innerHTML += `
            <div class="stock-item">
                <p><strong>${item.name}</strong></p>
                <p>Category: ${item.category || "N/A"}</p>
                <p>Quantity: ${item.quantity}</p>
                <p>Min Threshold: ${item.min_threshold}</p>
                <button onclick="deleteStock(${item.id})">Delete</button>
            </div>
        `;
    });
}

// Search stock records
function searchStock() {
    const query = document.getElementById("search-query").value.trim();
    if (!query) {
        alert("Please enter a search term.");
        return;
    }

    fetch(`${API_BASE_URL}/search_stock?query=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((data) => {
            displayStockItems(data);
        })
        .catch((error) => console.error("Error:", error));
}


function showUseStockForm() {
    // Fetch categories first
    fetch(`${API_BASE_URL}/get_categories`)
        .then((response) => response.json())
        .then((categories) => {
            content.innerHTML = `
                <h2>Use Stock</h2>
                <form id="use-stock-form">
                    <label for="category-select">Select Category:</label>
                    <select id="category-select" required>
                        <option value="" disabled selected>Choose a category</option>
                        ${categories
                            .map(
                                (category) => `<option value="${category}">${category}</option>`
                            )
                            .join("")}
                    </select>

                    <div id="stock-items-container">
                        <!-- Stock items will be dynamically loaded here -->
                    </div>
                </form>
            `;

            // Add event listener for category selection
            document.getElementById("category-select").addEventListener("change", (e) => {
                const selectedCategory = e.target.value;
                loadStockItemsByCategory(selectedCategory);
            });
        })
        .catch((error) => {
            console.error("Error fetching categories:", error);
            content.innerHTML = `
                <h2>Use Stock</h2>
                <p>Error loading categories. Please try again later.</p>
            `;
        });
}

function loadStockItemsByCategory(category) {
    fetch(`${API_BASE_URL}/filter_stock/${encodeURIComponent(category)}`)
        .then((response) => response.json())
        .then((stockItems) => {
            const stockItemsContainer = document.getElementById("stock-items-container");
            if (stockItems.length === 0) {
                stockItemsContainer.innerHTML = "<p>No stock items found for this category.</p>";
                return;
            }

            stockItemsContainer.innerHTML = `
                <label for="stock-select">Select Stock Item:</label>
                <select id="stock-select" required>
                    <option value="" disabled selected>Choose a stock item</option>
                    ${stockItems
                        .map(
                            (item) =>
                                `<option value="${item.id}">${item.name} (Available: ${item.quantity})</option>`
                        )
                        .join("")}
                </select>
                <label for="quantity">Quantity to Use:</label>
                <input type="number" id="quantity" required>
                <button type="submit">Use Stock</button>
            `;

            // Add event listener for form submission
            document.getElementById("use-stock-form").onsubmit = (e) => {
                e.preventDefault();
                const stockId = document.getElementById("stock-select").value;
                const quantity = parseInt(document.getElementById("quantity").value, 10);

                if (!stockId || quantity <= 0) {
                    alert("Please select a stock item and enter a valid quantity.");
                    return;
                }

                useStock(stockId, quantity);
            };
        })
        .catch((error) => {
            console.error("Error fetching stock items:", error);
            document.getElementById("stock-items-container").innerHTML = `
                <p>Error loading stock items. Please try again later.</p>
            `;
        });
}


// Use stock API call
function useStock(stockId, quantity) {
    fetch(`${API_BASE_URL}/use_stock/${stockId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
    })
        .then((response) => response.json())
        .then((data) => {
            alert(data.message);
            loadStockDashboard(); // Refresh the stock dashboard after using stock
        })
        .catch((error) => console.error("Error using stock:", error));
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
