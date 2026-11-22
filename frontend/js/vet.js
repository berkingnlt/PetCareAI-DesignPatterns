document.addEventListener("DOMContentLoaded", () => {
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser || loggedInUser.role !== "vet" || loggedInUser.status !== "approved") {
        if(typeof showToast === "function") showToast("Bu sayfayı görüntüleme yetkiniz yok!", "error");
        setTimeout(() => window.location.href = "login.html", 2000);
        return;
    }

    let availDateInput = document.getElementById("availDate");
    if(availDateInput) {
        let today = new Date().toISOString().split('T')[0];
        availDateInput.setAttribute("min", today);
        let maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 1);
        availDateInput.setAttribute("max", maxDate.toISOString().split('T')[0]);
    }

    loadAvailabilities(); 
    loadTodayAppointments(); 

    const availForm = document.getElementById("availabilityForm");
    if (availForm) availForm.addEventListener("submit", addAvailability);
});

const API_BASE_URL = "http://localhost:8080/api";

// 1. MÜSAİTLİK (BOŞ SAAT) ÜRETME VE LİSTELEME

async function addAvailability(e) {
    e.preventDefault();
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    let date = document.getElementById("availDate").value;
    let startTime = document.getElementById("startTime").value;
    let endTime = document.getElementById("endTime").value;

    if (startTime >= endTime) {
        if(typeof showToast === "function") showToast("Bitiş saati, başlangıç saatinden ileri olmalıdır!", "error");
        return;
    }

    //  Yeni saat slotlarını JS'de oluştur
    let newSlots = [];
    let start = new Date(`2000-01-01T${startTime}:00`);
    let end = new Date(`2000-01-01T${endTime}:00`);

    while (start < end) {
        let hh = String(start.getHours()).padStart(2, '0');
        let mm = String(start.getMinutes()).padStart(2, '0');
        
        newSlots.push({
            vetEmail: loggedInUser.email,
            date: date,
            time: `${hh}:${mm}`,
            isBooked: false
        });
        start.setMinutes(start.getMinutes() + 30);
    }

    try {
        console.log("📡 Müsaitlik saatleri Java'ya gönderiliyor...", newSlots);
        //  Hazırlanan slot listesini TOPLUCA Java'ya gönder (Bulk Insert)
        let response = await fetch(`${API_BASE_URL}/availabilities/bulk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newSlots)
        });

       if (response.ok) {
            if(typeof showToast === "function") showToast("Randevu saatleri başarıyla eklendi!", "success");
            document.getElementById("availabilityForm").reset();
            loadAvailabilities(); 
        } else {
            console.error("❌ Saat ekleme hatası: Çakışma veya sunucu hatası.");
            if(typeof showToast === "function") {
                showToast("Saatler eklenirken hata oluştu veya bu saatler zaten mevcut!", "error");
            }
        }
    } catch (error) {
        console.error("Müsaitlik ekleme hatası:", error);
    }
}

async function loadAvailabilities() {
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    let container = document.getElementById("vet-availabilities-list");
    if (!container) return;

    try {
        let response = await fetch(`${API_BASE_URL}/availabilities/vet/${loggedInUser.email}`);
        let myAvails = await response.json();

        myAvails = myAvails.filter(a => !a.isBooked);

        const countText = document.getElementById("availCountText");
        if (countText) countText.innerText = `Açık Randevu Slotlarım (${myAvails.length})`;

        container.innerHTML = ""; 
        if(myAvails.length === 0) {
            container.innerHTML = "<p style='font-size: 13px; color: gray; margin-top: 10px;'>Henüz boş saat girmediniz.</p>";
            return;
        }

        myAvails.sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

        let html = '<ul style="list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">';
        myAvails.forEach(a => {
            html += `<li style="background: #e3f2fd; padding: 8px 15px; border-radius: 20px; font-size: 13px; display: flex; align-items: center; gap: 10px; border: 1px solid #bbdefb;">
                <b>${a.date}</b> | ${a.time}
                <span onclick="deleteAvailability(${a.id})" style="cursor: pointer; color: #E53935; font-weight: bold; background: white; padding: 2px 6px; border-radius: 50%;">X</span>
            </li>`;
        });
        html += '</ul>';
        container.innerHTML = html;

    } catch (error) {
        console.error("Müsaitlikler yüklenemedi:", error);
    }
}

async function deleteAvailability(id) {
    if(!confirm("Bu saati silmek istediğinize emin misiniz?")) return;
    
    try {
        let response = await fetch(`${API_BASE_URL}/availabilities/${id}`, { method: "DELETE" });
        if (response.ok) {
            if(typeof showToast === "function") showToast("Saat sistemden kaldırıldı.", "success");
            loadAvailabilities();
        }
    } catch (error) {
        console.error("Silme hatası:", error);
    }
}

function toggleAvailabilities() {
    const list = document.getElementById("vet-availabilities-list");
    const icon = document.getElementById("availToggleIcon");
    if (list.style.display === "none" || list.style.display === "") {
        list.style.display = "block";
        icon.innerText = "▲";
    } else {
        list.style.display = "none";
        icon.innerText = "▼";
    }
}

//  DASHBOARD RANDEVU YÖNETİMİ
async function loadTodayAppointments() {
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    let listDiv = document.getElementById("vet-appointments-list");
    if (!listDiv) return;

    let d = new Date();
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    let year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    let today = [year, month, day].join('-'); 
    let currentTimeString = String(d.getHours()).padStart(2, '0') + ":" + String(d.getMinutes()).padStart(2, '0');

    try {
        console.log("📡 Randevular Java'dan çekiliyor...");
        // Randevuları ve Kullanıcıları Çek
        let resApp = await fetch(`${API_BASE_URL}/appointments/vet/${loggedInUser.email}`);
        let appointments = await resApp.json();
        
        let resUsers = await fetch(`${API_BASE_URL}/users`);
        let users = await resUsers.json();

        listDiv.innerHTML = ""; 

        // --- 1. İŞLEM BEKLEYEN RANDEVULAR (Hem pending hem quoted olanlar) ---
        let pendingApps = appointments.filter(a => a.status === "pending" || a.status === "quoted");
        
        if (pendingApps.length > 0) {
            listDiv.innerHTML += `<h3 style='color: var(--accent-turuncu); margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px;'>⏳ İşlem Bekleyen Randevular (${pendingApps.length})</h3>`;
            pendingApps.sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

            pendingApps.forEach(app => {
                let formattedDate = app.date.split("-").reverse().join(".");
                let isQuoted = app.status === "quoted"; // Fiyat verilmiş mi?
                
                // Statüye göre renk ve yazı değişimi
                let badgeColor = isQuoted ? "#2196F3" : "var(--accent-turuncu)";
                let badgeText = isQuoted ? "⏳ Müşteri Onayı Bekleniyor" : "⏳ Fiyat Bekliyor";

                // Eğer statü pending ise Input kutusu çıkacak, quoted ise bilgi yazısı çıkacak
                let actionHtml = "";
                if (!isQuoted) {
                    actionHtml = `
                        <div style="margin-top: 15px; display: flex; gap: 10px; align-items: center; background: #fafafa; padding: 10px; border-radius: 8px; border: 1px solid #eee;">
                            <input type="number" id="price-${app.id}" placeholder="Ücret (TL)" style="padding: 10px; border-radius: 5px; border: 1px solid #ccc; width: 120px; font-weight: bold; font-size: 14px;">
                            <button onclick="quoteAppointment(${app.id})" style="flex: 2; background: #FFA000; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 5px;">
                                💰 Fiyatı İlet
                            </button>
                            <button onclick="updateAppointmentStatus(${app.id}, 'rejected')" style="flex: 1; background: #E53935; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                                ✖ Reddet
                            </button>
                        </div>
                    `;
                } else {
                    actionHtml = `
                        <div style="margin-top: 15px; display: flex; gap: 10px; align-items: center; background: #e3f2fd; padding: 10px; border-radius: 8px; border: 1px solid #bbdefb;">
                            <span style="flex: 2; color: #1565C0; font-weight: bold; font-size: 14px;">💰 ${app.price} TL fiyat iletildi. Hastanın onayı bekleniyor.</span>
                            <button onclick="updateAppointmentStatus(${app.id}, 'rejected')" style="flex: 1; background: #E53935; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                                ✖ İptal Et
                            </button>
                        </div>
                    `;
                }

                listDiv.innerHTML += `
                    <div class="pet-card" style="margin-bottom: 20px; border-left: 5px solid ${badgeColor}; padding: 15px; background: #fffdf5; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <p style="margin: 0; font-size: 16px; display: flex; justify-content: space-between; align-items: center;">
                            <span><b>🗓️ ${formattedDate}</b> | <b>⏰ ${app.time}</b></span>
                            <span style="color: white; background: ${badgeColor}; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">${badgeText}</span>
                        </p>
                        <p style="margin: 10px 0 5px 0; font-size: 14px;">
                            <b>👤 Hasta Sahibi:</b> ${app.ownerName || "Belirtilmemiş"} | 
                            <span style="color: var(--primary-yesil);"><b>🐾 Hasta:</b> ${app.petName || "Belirtilmemiş"}</span>
                        </p>
                        <p style="margin: 0; color: var(--text-secondary); font-size: 13px;"><b>📝 Şikayet:</b> ${app.notes || app.reason || "-"}</p>
                        
                        ${actionHtml}
                    </div>
                `;
            });
        }

        // --- 2. BUGÜNKÜ ONAYLI RANDEVULAR (Statüsü artık 'confirmed' olanlar) ---
        let todayConfirmedApps = appointments.filter(a => a.date === today && a.status === "confirmed");
        let marginTop = pendingApps.length > 0 ? "30px" : "0px";

        listDiv.innerHTML += `<h3 style='color: var(--secondary-mavi); margin-top: ${marginTop}; border-bottom: 2px solid #eee; padding-bottom: 10px;'>📅 Bugünkü Kesinleşen Randevularım</h3>`;

        if (todayConfirmedApps.length === 0) {
            listDiv.innerHTML += `
                <div style="background: #f9f9f9; padding: 20px; text-align: center; border-radius: 8px; border: 1px dashed #ccc;">
                    <p style="color: var(--text-secondary);">Bugün için kesinleşmiş bir randevunuz bulunmuyor. Rahat bir gün! ☕</p>
                </div>`;
        } else {
            todayConfirmedApps.sort((a,b) => a.time.localeCompare(b.time));

            todayConfirmedApps.forEach(app => {
                let isPast = app.time < currentTimeString;
                let opacityStyle = isPast ? "opacity: 0.5; filter: grayscale(50%);" : "opacity: 1;";
                let pastText = isPast ? `<span style="font-size: 11px; color: gray; font-weight: normal; margin-left: 5px;">(Tamamlandı)</span>` : "";

                let owner = users.find(u => u.email === app.ownerEmail);
                let ownerPhone = owner ? owner.phone : "No Yok";

                listDiv.innerHTML += `
                <div class="pet-card" style="margin-bottom: 15px; border-left: 5px solid var(--primary-yesil); padding: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: all 0.3s ease; ${opacityStyle}">
                    <p style="margin: 0; font-size: 18px; display: flex; justify-content: space-between; align-items: center;">
                        <span><b>⏰ ${app.time}</b> ${pastText}</span>
                        <span style="color: white; background: var(--primary-yesil); padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">✔ Kesinleşti</span>
                    </p>
                    <p style="margin: 10px 0 5px 0; font-size: 15px;">
                        <b>👤 Hasta Sahibi:</b> ${app.ownerName} 
                        <span style="color: var(--secondary-mavi); font-size: 13px; margin-left: 10px; font-weight: bold;">
                            📞 <a href="tel:${ownerPhone}" style="color: inherit; text-decoration: none;">${ownerPhone}</a>
                        </span>
                    </p>
                    <p style="margin: 5px 0; font-size: 15px;">
                        <span style="color: var(--primary-yesil);"><b>🐾 Hasta:</b> ${app.petName}</span>
                    </p>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px;"><b>📝 Şikayet:</b> ${app.notes || app.reason || "-"}</p>
                    <p style="margin: 5px 0; font-size: 14px; color: #1565C0; font-weight: bold;">💰 Fiyat: ${app.price} TL</p>
                </div>`;
            });
        }
    } catch (error) {
        console.error("Randevular yüklenemedi:", error);
    }
}

//  RANDEVU ONAYLAMA / REDDETME (JAVA PUT)

// RANDEVU REDDETME / İPTAL ETME (JAVA PUT)
async function updateAppointmentStatus(appId, newStatus) {
    try {
        let response = await fetch(`${API_BASE_URL}/appointments/${appId}/status?newStatus=${newStatus}`, {
            method: "PUT"
        });

        if (response.ok) {
            // Artık sadece iptal/red işlemi için kullanıldığı için direkt bu mesajı veriyoruz
            if(typeof showToast === "function") showToast("Randevu reddedildi ve iptal edildi. 🗑️", "error"); 
            loadTodayAppointments(); 
            loadAvailabilities();
        }
    } catch (error) {
        console.error("Statü güncellenirken hata:", error);
    }
}

// --- YENİ: VETERİNERİN FİYAT VERMESİ ---
async function quoteAppointment(appId) {
    // 1. Dinamik olarak o randevuya ait input kutusunu bul
    let priceInput = document.getElementById(`price-${appId}`);
    let price = priceInput ? parseFloat(priceInput.value) : 0;

    // 2. SAVUNMACI PROGRAMLAMA (Defensive Programming): Hatalı girişi engelle
    if (!price || price <= 0) {
        if(typeof showToast === "function") showToast("Lütfen geçerli bir fiyat girin!", "warning");
        return; // İşlemi durdur, Java'ya boş/eksi veri gitmesin!
    }

    try {
        console.log(`📡 Randevu #${appId} için fiyat iletiliyor: ${price} TL`);
        // 3. Java'ya PUT isteği at (Statü pending -> quoted olacak)
        let response = await fetch(`${API_BASE_URL}/appointments/${appId}/quote?price=${price}`, {
            method: "PUT"
        });

        if (response.ok) {
            if(typeof showToast === "function") showToast("Fiyat teklifi hastaya iletildi. Onay bekleniyor! ⏳", "success");
            loadTodayAppointments(); // Ekrandaki listeyi yenile
        } else {
            throw new Error("Sunucu hatası");
        }
    } catch (error) {
        console.error("Fiyat verme hatası:", error);
        if(typeof showToast === "function") showToast("Fiyat iletilirken hata oluştu!", "error");
    }
}