const API_BASE_URL = "http://127.0.0.1:5000";

// Handle navigation
document.querySelectorAll("#main-menu button").forEach(button => {
    button.addEventListener("click", (e) => {
        const target = e.target.getAttribute("data-target");
        document.querySelectorAll("section").forEach(section => {
            section.classList.add("hidden");
        });
        document.getElementById(target).classList.remove("hidden");
    });
});

// Fetch stock and display in dashboard with category filtering
async function fetchStock(categoryFilter = "all") {
    try {
        const response = await fetch(`${API_BASE_URL}/get_stock`);
        const data = await response.json();
        const tableBody = document.querySelector("#stock-table tbody");
        tableBody.innerHTML = "";

        const filteredData = categoryFilter === "all"
            ? data
            : data.filter(item => item.category === categoryFilter);

        filteredData.forEach(item => {
            const row = `<tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>${item.min_threshold}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        alert("Failed to fetch stock items.");
    }
}

// Populate category dropdowns
async function populateCategoryDropdowns() {
    try {
        const response = await fetch(`${API_BASE_URL}/get_stock`);
        const data = await response.json();
        const categories = [...new Set(data.map(item => item.category))];

        // Populate dashboard filter
        const dashboardCategoryFilter = document.querySelector("#dashboard-category-filter");
        const useStockCategoryFilter = document.querySelector("#use-stock-category-filter");
        const existingCategoryDropdown = document.querySelector("#existing-category");

        [dashboardCategoryFilter, useStockCategoryFilter, existingCategoryDropdown].forEach(dropdown => {
            dropdown.innerHTML = '<option value="all">All Categories</option>';
            categories.forEach(category => {
                if (category) {
                    const option = document.createElement("option");
                    option.value = category;
                    option.textContent = category;
                    dropdown.appendChild(option);
                }
            });
        });

        // Add event listeners for category filtering
        dashboardCategoryFilter.addEventListener("change", (e) => fetchStock(e.target.value));
        useStockCategoryFilter.addEventListener("change", populateStockDropdown);
    } catch (error) {
        alert("Failed to populate categories.");
    }
}

// Add stock with existing or new category
document.querySelector("#add-stock-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.querySelector("#name").value;
    const existingCategory = document.querySelector("#existing-category").value;
    const newCategory = document.querySelector("#new-category").value;
    const category = newCategory.trim() || existingCategory;
    const quantity = parseInt(document.querySelector("#quantity").value, 10);
    const minThreshold = parseInt(document.querySelector("#min-threshold").value, 10);

    if (!category) {
        alert("Please select or create a category.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/add_stock`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, category, quantity, min_threshold: minThreshold })
        });

        if (!response.ok) throw new Error();

        alert("Stock added successfully!");
        document.querySelector("#add-stock-form").reset();
        fetchStock();
        populateCategoryDropdowns();
    } catch (error) {
        alert("Failed to add stock.");
    }
});

// Populate stock dropdown in Use Stock
async function populateStockDropdown() {
    const categoryFilter = document.querySelector("#use-stock-category-filter").value;

    try {
        const response = await fetch(`${API_BASE_URL}/get_stock`);
        const data = await response.json();

        const filteredData = categoryFilter === "all"
            ? data
            : data.filter(item => item.category === categoryFilter);

        const dropdown = document.querySelector("#use-stock-dropdown");
        dropdown.innerHTML = '<option value="" disabled selected>Select Stock</option>';

        filteredData.forEach(item => {
            const option = `<option value="${item.id}">${item.name} (Available: ${item.quantity})</option>`;
            dropdown.innerHTML += option;
        });
    } catch (error) {
        alert("Failed to populate stock dropdown.");
    }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    fetchStock();
    populateCategoryDropdowns();
    populateStockDropdown();
});
