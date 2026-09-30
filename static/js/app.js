// Stage 2 - Pocketful Wallet Dashboard Client JS
// Contributors: BAND Agents (Seat 1, Seat 2, Seat 3)

document.addEventListener("DOMContentLoaded", () => {
    const transferForm = document.getElementById("transfer-form");
    const idempotencyInput = document.getElementById("idempotency-input");
    const feedback = document.getElementById("transfer-feedback");
    const walletCards = document.querySelectorAll(".wallet-card");

    function generateKey() {
        return "IDEMP-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    }

    if (idempotencyInput) {
        idempotencyInput.value = generateKey();
    }

    walletCards.forEach(card => {
        card.addEventListener("click", () => {
            const wId = card.getAttribute("data-wallet-id");
            const senderSelect = document.getElementById("sender-select");
            if (senderSelect) {
                senderSelect.value = wId;
            }
        });
    });

    if (transferForm) {
        transferForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const senderId = document.getElementById("sender-select").value;
            const recipientId = document.getElementById("recipient-select").value;
            const inrAmount = parseFloat(document.getElementById("amount-inr-input").value);
            const amountPaise = Math.round(inrAmount * 100);
            const key = idempotencyInput.value;

            feedback.className = "p-3 rounded text-xs font-mono bg-cyan-950/80 border border-cyan-800 text-cyan-300";
            feedback.textContent = "Posting double-entry transfer...";
            feedback.classList.remove("hidden");

            try {
                const res = await fetch("/api/transfers", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sender_id: senderId,
                        recipient_id: recipientId,
                        amount_paise: amountPaise,
                        idempotency_key: key
                    })
                });

                const data = await res.json();
                if (!res.ok) {
                    feedback.className = "p-3 rounded text-xs font-mono bg-rose-950/80 border border-rose-800 text-rose-300";
                    feedback.textContent = "Error: " + (data.error || "Transfer failed");
                } else {
                    feedback.className = "p-3 rounded text-xs font-mono bg-emerald-950/80 border border-emerald-800 text-emerald-300";
                    feedback.textContent = data.message + " (" + (data.transaction.is_duplicate ? "Duplicate Cached" : "Committed") + ")";
                    setTimeout(() => {
                        window.location.reload();
                    }, 800);
                }
            } catch (err) {
                feedback.className = "p-3 rounded text-xs font-mono bg-rose-950/80 border border-rose-800 text-rose-300";
                feedback.textContent = "Network Error: " + err.message;
            }
        });
    }
});
