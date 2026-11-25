document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".item-card");
    const categoryButtons = document.querySelectorAll(".cat-btn");
    const billItemsEl = document.getElementById("bill-items");
    const billTotalEl = document.getElementById("bill-total");
    const billDateEl = document.getElementById("bill-date");
    const clearBtn = document.getElementById("clear-bill-btn");
    const printBtn = document.getElementById("print-bill-btn");

    let cart = [];

    function updateDate() {
        if (!billDateEl) return;
        const now = new Date();
        billDateEl.textContent = now.toLocaleString();
    }

    // 1. Category Filter
    categoryButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            categoryButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;

            cards.forEach((card) => {
                const category = card.dataset.category;
                if (filter === "all" || category === filter) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });

    // 2. Card click -> Add item / Increase count
    cards.forEach((card) => {
        card.addEventListener("click", () => {
            const name = card.dataset.name || card.querySelector("h3")?.textContent.trim();
            const rawPrice = card.dataset.price || card.querySelector(".price")?.textContent.replace(/[^0-9.]/g, "");
            const price = Number(rawPrice);

            if (!name || Number.isNaN(price)) return;

            const existingItem = cart.find((item) => item.name === name);
            if (existingItem) {
                existingItem.qty += 1;
            } else {
                cart.push({ name, price, qty: 1 });
            }

            renderBill();
        });
    });

    // 3. Render Bill Items
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

            // Minus button
            const minusBtn = row.querySelector(".minus-btn");
            minusBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                cart[index].qty -= 1;
                if (cart[index].qty <= 0) {
                    cart.splice(index, 1);
                }
                renderBill();
            });

            // Plus button
            const plusBtn = row.querySelector(".plus-btn");
            plusBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                cart[index].qty += 1;
                renderBill();
            });

            billItemsEl.appendChild(row);
        });

        billTotalEl.textContent = `Rs. ${grandTotal.toFixed(2)}`;
    }

    // 4. Clear Bill
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            cart = [];
            renderBill();
        });
    }

    // 5. Print Bill
    if (printBtn) {
        printBtn.addEventListener("click", () => {
            if (cart.length === 0) {
                alert("Bill එකේ items නැහැ!");
                return;
            }
            updateDate();
            window.print();
        });
    }

    updateDate();
    renderBill();
});