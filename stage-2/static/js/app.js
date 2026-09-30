// Stage 2 - Frontend interactive floorplan script
// Contributors: Google AI Studio, BAND

document.addEventListener("DOMContentLoaded", () => {
    const tableCards = document.querySelectorAll(".table-card");
    const stationFilterButtons = document.querySelectorAll(".station-filter-btn");

    // Table quick status cycler: AVAILABLE -> OCCUPIED -> DIRTY -> AVAILABLE
    const nextStatus = {
        "AVAILABLE": "OCCUPIED",
        "OCCUPIED": "DIRTY",
        "DIRTY": "AVAILABLE",
        "RESERVED": "OCCUPIED"
    };

    tableCards.forEach(card => {
        card.addEventListener("click", async () => {
            const tableId = card.getAttribute("data-table-id");
            const currentStatus = card.getAttribute("data-status");
            const targetStatus = nextStatus[currentStatus] || "AVAILABLE";

            card.style.opacity = "0.6";
            try {
                const response = await fetch(`/api/tables/${tableId}/status`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: targetStatus })
                });
                if (response.ok) {
                    const data = await response.json();
                    updateTableCardDOM(card, data.table.status);
                    updateSummaryCounters();
                } else {
                    console.error("Failed to update status");
                }
            } catch (err) {
                console.error("Network error:", err);
            } finally {
                card.style.opacity = "1";
            }
        });
    });

    function updateTableCardDOM(card, status) {
        card.setAttribute("data-status", status);
        card.className = `table-card p-4 rounded-xl border status-${status}`;
        const badge = card.querySelector(".status-badge");
        if (badge) {
            badge.textContent = status;
        }
    }

    function updateSummaryCounters() {
        const allCards = document.querySelectorAll(".table-card");
        let available = 0, occupied = 0, reserved = 0, dirty = 0;
        allCards.forEach(c => {
            const st = c.getAttribute("data-status");
            if (st === "AVAILABLE") available++;
            else if (st === "OCCUPIED") occupied++;
            else if (st === "RESERVED") reserved++;
            else if (st === "DIRTY") dirty++;
        });
        const avEl = document.getElementById("count-available");
        if (avEl) avEl.textContent = available;
        const occEl = document.getElementById("count-occupied");
        if (occEl) occEl.textContent = occupied;
        const resEl = document.getElementById("count-reserved");
        if (resEl) resEl.textContent = reserved;
        const dirtyEl = document.getElementById("count-dirty");
        if (dirtyEl) dirtyEl.textContent = dirty;
    }

    stationFilterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            stationFilterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const station = btn.getAttribute("data-station-id");
            tableCards.forEach(card => {
                if (station === "all" || card.getAttribute("data-station-id") === station) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });
});
