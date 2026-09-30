// Stage 3 - Tablekeeper Reservation & Station Management Script
// Contributors: Google AI Studio, BAND

document.addEventListener("DOMContentLoaded", () => {
    const tableCards = document.querySelectorAll(".table-card");
    const stationFilterButtons = document.querySelectorAll(".station-filter-btn");
    const reservationModal = document.getElementById("reservation-modal");
    const stationModal = document.getElementById("station-modal");
    const closeModalButtons = document.querySelectorAll(".close-modal-btn");
    const reservationForm = document.getElementById("reservation-form");
    const addStationForm = document.getElementById("add-station-form");

    let selectedTableId = null;

    tableCards.forEach(card => {
        card.addEventListener("click", () => {
            const status = card.getAttribute("data-status");
            const tableId = card.getAttribute("data-table-id");
            const tableNum = card.getAttribute("data-table-number");
            const capacity = card.getAttribute("data-capacity");

            if (status === "AVAILABLE") {
                // Open reservation modal for available table
                selectedTableId = tableId;
                document.getElementById("modal-table-id").value = tableId;
                document.getElementById("modal-table-number").textContent = tableNum;
                document.getElementById("modal-table-capacity").textContent = capacity;
                document.getElementById("party-size-input").max = capacity;
                reservationModal.classList.add("active");
            } else if (status === "OCCUPIED") {
                cycleTableStatus(tableId, "DIRTY", card);
            } else if (status === "DIRTY") {
                cycleTableStatus(tableId, "AVAILABLE", card);
            } else if (status === "RESERVED") {
                cycleTableStatus(tableId, "OCCUPIED", card);
            }
        });
    });

    async function cycleTableStatus(tableId, targetStatus, card) {
        card.style.opacity = "0.6";
        try {
            const res = await fetch(`/api/tables/${tableId}/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: targetStatus })
            });
            if (res.ok) {
                const data = await res.json();
                card.setAttribute("data-status", data.table.status);
                card.className = `table-card p-5 rounded-xl border status-${data.table.status} flex flex-col justify-between`;
                const badge = card.querySelector(".status-badge");
                if (badge) badge.textContent = data.table.status;
                updateCounters();
            }
        } catch (e) {
            console.error(e);
        } finally {
            card.style.opacity = "1";
        }
    }

    closeModalButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            reservationModal.classList.remove("active");
            stationModal.classList.remove("active");
        });
    });

    // Handle Reservation Form Submit with Phone Sanitization Feedback
    if (reservationForm) {
        reservationForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const tableId = document.getElementById("modal-table-id").value;
            const guestName = document.getElementById("guest-name-input").value;
            const guestPhone = document.getElementById("guest-phone-input").value;
            const partySize = parseInt(document.getElementById("party-size-input").value, 10);
            const resTime = document.getElementById("res-time-input").value;
            const notes = document.getElementById("notes-input").value;
            const errorDiv = document.getElementById("reservation-error");

            errorDiv.classList.add("hidden");
            errorDiv.textContent = "";

            try {
                const response = await fetch("/api/reservations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        table_id: parseInt(tableId, 10),
                        guest_name: guestName,
                        guest_phone: guestPhone,
                        party_size: partySize,
                        reservation_time: resTime,
                        notes: notes
                    })
                });
                const result = await response.json();
                if (!response.ok) {
                    errorDiv.textContent = result.error || "Failed to make reservation";
                    errorDiv.classList.remove("hidden");
                } else {
                    reservationModal.classList.remove("active");
                    window.location.reload();
                }
            } catch (err) {
                errorDiv.textContent = "Network communication error";
                errorDiv.classList.remove("hidden");
            }
        });
    }

    // Dynamic Station Add Form
    if (addStationForm) {
        addStationForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const stId = document.getElementById("st-id-input").value;
            const stName = document.getElementById("st-name-input").value;
            const stServer = document.getElementById("st-server-input").value;
            const errDiv = document.getElementById("station-error");

            try {
                const response = await fetch("/api/stations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: stId, name: stName, server_name: stServer })
                });
                const res = await response.json();
                if (!response.ok) {
                    errDiv.textContent = res.error;
                    errDiv.classList.remove("hidden");
                } else {
                    stationModal.classList.remove("active");
                    window.location.reload();
                }
            } catch (err) {
                errDiv.textContent = "Error adding station";
                errDiv.classList.remove("hidden");
            }
        });
    }

    const openStationModalBtn = document.getElementById("open-station-modal-btn");
    if (openStationModalBtn) {
        openStationModalBtn.addEventListener("click", () => {
            stationModal.classList.add("active");
        });
    }

    function updateCounters() {
        const allCards = document.querySelectorAll(".table-card");
        let available = 0, occupied = 0, reserved = 0, dirty = 0;
        allCards.forEach(c => {
            const st = c.getAttribute("data-status");
            if (st === "AVAILABLE") available++;
            else if (st === "OCCUPIED") occupied++;
            else if (st === "RESERVED") reserved++;
            else if (st === "DIRTY") dirty++;
        });
        const av = document.getElementById("count-available");
        if (av) av.textContent = available;
        const occ = document.getElementById("count-occupied");
        if (occ) occ.textContent = occupied;
        const res = document.getElementById("count-reserved");
        if (res) res.textContent = reserved;
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
