// Yukarıdan süzülen bildirim 
function showToast(message, type = "success") {
    let existingToast = document.querySelector(".toast-notification");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : '⚠️'}</span>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400); 
    }, 3000);
}

// Ortada açılan Onay (Confirm) penceresi
function showConfirm(message, onConfirmCallback) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const modal = document.createElement("div");
    modal.className = "custom-modal";
    
    modal.innerHTML = `
        <h3>Onay Gerekiyor</h3>
        <p>${message}</p>
        <div class="modal-buttons">
            <button class="btn-cancel" id="btn-cancel">İptal</button>
            <button class="btn-danger" id="btn-confirm">Evet, Sil</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => overlay.classList.add("show"), 10);

    document.getElementById("btn-cancel").addEventListener("click", () => {
        closeModal(overlay);
    });

    document.getElementById("btn-confirm").addEventListener("click", () => {
        closeModal(overlay);
        onConfirmCallback(); 
    });
}


function closeModal(overlay) {
    overlay.classList.remove("show");
    setTimeout(() => overlay.remove(), 300);
}