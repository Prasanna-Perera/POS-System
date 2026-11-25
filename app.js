document.addEventListener("DOMContentLoaded", () => {
    const itemsGrid = document.getElementById("items-grid");
    const billItemsEl = document.getElementById("bill-items");
    const billTotalEl = document.getElementById("bill-total");
    const billDateEl = document.getElementById("bill-date");
    const billNumberEl = document.getElementById("bill-number");
    const clearBtn = document.getElementById("clear-bill-btn");
    const printBtn = document.getElementById("print-bill-btn");

    const openAddBtn = document.getElementById("open-add-item-btn");
    const cancelAddBtn = document.getElementById("cancel-add-item-btn");
    const addItemForm = document.getElementById("add-item-form");
    const customNameInput = document.getElementById("custom-item-name");
    const customPriceInput = document.getElementById("custom-item-price");
    const customCatSelect = document.getElementById("custom-item-cat");

    let cart = [];
    let billCounter = 1;

    function updateBillNumber() {
        if (!billNumberEl) return;
        billNumberEl.textContent = `Bill #${String(billCounter).padStart(4, "0")}`;
    }

    function updateDate() {
        if (!billDateEl) return;
        const now = new Date();
        billDateEl.textContent = now.toLocaleString();
    }

    function addToCart(name, price) {
        if (!name || Number.isNaN(price) || price <= 0) return;
        const existingItem = cart.find((item) => item.name === name);
        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({ name, price, qty: 1 });
        }
        renderBill();
    }

    function attachCardClick(card) {
        card.addEventListener("click", () => {
            const name = card.dataset.name || card.querySelector("h3")?.textContent.trim();
            const rawPrice = card.dataset.price || card.querySelector(".price")?.textContent.replace(/[^0-9.]/g, "");
            const price = Number(rawPrice);
            addToCart(name, price);
        });
    }

    // Existing cards
    document.querySelectorAll(".item-card").forEach(attachCardClick);

    // Category Filter
    document.querySelectorAll(".cat-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".cat-btn").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;
            document.querySelectorAll(".item-card").forEach((card) => {
                const category = card.dataset.category;
                if (filter === "all" || category === filter) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });

    // Toggle Custom Item Form
    openAddBtn?.addEventListener("click", () => {
        addItemForm.hidden = !addItemForm.hidden;
        if (!addItemForm.hidden) {
            customNameInput.focus();
        }
    });

    cancelAddBtn?.addEventListener("click", () => {
        addItemForm.reset();
        addItemForm.hidden = true;
    });

    // Submit Custom Item -> Add to Menu Grid + Add to Bill
    addItemForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = customNameInput.value.trim();
        const price = Number(customPriceInput.value);
        const category = customCatSelect.value;

        if (!name || Number.isNaN(price) || price <= 0) return;

        const card = document.createElement("div");
        card.className = "item-card";
        card.dataset.category = category;
        card.dataset.name = name;
        card.dataset.price = String(price);
        card.innerHTML = `
            <div style="width:100%;height:135px;margin-bottom:11px;border-radius:12px;background:linear-gradient(145deg,#eaf6ef,#f4f8f0);display:flex;align-items:center;justify-content:center;font-size:2.4rem;">🍹</div>
            <h3>${name}</h3>
            <p class="price">Rs. ${price.toFixed(2)}</p>
        `;

        // Respect active category filter
        const activeFilter = document.querySelector(".cat-btn.active")?.dataset.filter || "all";
        if (activeFilter !== "all" && activeFilter !== category) {
            card.style.display = "none";
        }

        attachCardClick(card);
        itemsGrid.appendChild(card);

        addToCart(name, price);

        addItemForm.reset();
        addItemForm.hidden = true;
    });

    // Render Bill Items
    function renderBill() {
        if (!billItemsEl || !billTotalEl) return;

        if (cart.length === 0) {
            billItemsEl.innerHTML = '<p class="empty-bill">Select an item to add to bill</p>';
            billTotalEl.textContent = "Rs. 0.00";
            return;
        }

        let grandTotal = 0;
        billItemsEl.innerHTML = "";

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.qty;
            grandTotal += itemTotal;

            const row = document.createElement("div");
            row.className = "bill-row";

            row.innerHTML = `
                <div class="bill-row-info">
                    <span class="bill-row-name">${item.name}</span>
                    <span class="bill-row-sub">Rs. ${item.price.toFixed(2)} × ${item.qty}</span>
                </div>
                <div class="bill-row-controls">
                    <button type="button" class="qty-btn minus-btn" title="අඩු කරන්න">-</button>
                    <span class="bill-qty-count">${item.qty}</span>
                    <button type="button" class="qty-btn plus-btn" title="වැඩි කරන්න">+</button>
                </div>
                <span class="bill-row-total">Rs. ${itemTotal.toFixed(2)}</span>
            `;

            row.querySelector(".minus-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                cart[index].qty -= 1;
                if (cart[index].qty <= 0) {
                    cart.splice(index, 1);
                }
                renderBill();
            });

            row.querySelector(".plus-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                cart[index].qty += 1;
                renderBill();
            });

            billItemsEl.appendChild(row);
        });

        billTotalEl.textContent = `Rs. ${grandTotal.toFixed(2)}`;
    }

    clearBtn?.addEventListener("click", () => {
        cart = [];
        renderBill();
    });

    printBtn?.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Bill එකේ items නැහැ!");
            return;
        }
        updateDate();
        window.print();
        billCounter += 1;
        updateBillNumber();
        cart = [];
        renderBill();
    });

    updateBillNumber();
    updateDate();
    renderBill();
});