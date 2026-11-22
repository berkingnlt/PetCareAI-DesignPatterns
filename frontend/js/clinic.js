const API_BASE_URL = "http://localhost:8080/api";

// TEK VE ANA MOTOR: Sayfa yüklendiğinde her şeyi sırayla çalıştır
document.addEventListener("DOMContentLoaded", () => {
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    
    if (!loggedInUser || loggedInUser.role !== "clinic" || loggedInUser.status !== "approved") {
        window.location.href = "login.html";
        return;
    }

    let clinicName = loggedInUser.clinicName || loggedInUser.name;
    let welcomeEl = document.getElementById("clinicWelcomeText");
    if(welcomeEl) welcomeEl.innerText = `🏥 ${clinicName} Yönetim Paneli`;

    // Tüm modülleri ateşle!
    loadClinicVets();
    loadClinicAppointments(); 
    loadClinicReviews(); // YENİ: Yorum motoru da buraya bağlandı
});

// KLİNİĞE AİT HEKİMLERİ GETİR
async function loadClinicVets() {
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    let pendingGrid = document.getElementById("pending-vets-grid");
    let approvedGrid = document.getElementById("approved-vets-grid");

    if (!pendingGrid || !approvedGrid) return;

    try {
        console.log("📡 Veteriner listesi MariaDB'den çekiliyor...");
        // Java'dan tüm kullanıcıları çekiyoruz
        let response = await fetch(`${API_BASE_URL}/users`);
        let users = await response.json();

        // SADECE BU KLİNİĞİ SEÇMİŞ OLAN VETERİNERLERİ FİLTRELE
        let myVets = users.filter(u => u.role === "vet" && u.clinicEmail === loggedInUser.email);

        let pendingVets = myVets.filter(v => v.status === "pending_clinic_approval");
        let approvedVets = myVets.filter(v => v.status === "approved");

        // --- BEKLEYENLERİ EKRANA BAS ---
        pendingGrid.innerHTML = "";
        if (pendingVets.length === 0) {
            pendingGrid.style.display = "block"; 
            pendingGrid.innerHTML = `
                <div style="background: #f9f9f9; padding: 20px; text-align: center; border-radius: 8px; border: 1px dashed #ccc;">
                    <p style="color: gray; margin: 0;">Şu an kliniğinizde çalışmak için onay bekleyen yeni bir hekim bulunmuyor.</p>
                </div>`;
        } else {
            pendingGrid.style.display = "grid"; 
            pendingVets.forEach(vet => {
                pendingGrid.innerHTML += `
                    <div class="pet-card" style="border-left: 5px solid var(--accent-turuncu); padding: 15px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); background: #fffdf5;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                            <img src="${vet.photo || 'https://cdn-icons-png.flaticon.com/512/2810/2810488.png'}" alt="Vet" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid var(--accent-turuncu); object-fit: cover;">
                            <div>
                                <h3 style="margin: 0; color: var(--secondary-mavi); font-size: 18px;">${vet.name}</h3>
                                <p style="margin: 3px 0 0 0; font-size: 13px; color: #666;"><b>Deneyim:</b> ${vet.experience} Yıl</p>
                            </div>
                        </div>
                        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">"${vet.bio}"</p>
                        
                        <div style="display: flex; gap: 10px;">
                            <button onclick="updateVetStatus(${vet.id}, 'approved')" style="flex: 1; background: var(--primary-yesil); font-weight: bold; padding: 10px; border-radius: 5px; color: white; border: none; cursor: pointer;">✔ Kadroya Al</button>
                            <button onclick="updateVetStatus(${vet.id}, 'rejected')" style="flex: 1; background: #E53935; font-weight: bold; padding: 10px; border-radius: 5px; color: white; border: none; cursor: pointer;">✖ Reddet</button>
                        </div>
                    </div>
                `;
            });
        }

        // --- ONAYLI AKTİF KADROYU EKRANA BAS ---
        approvedGrid.innerHTML = "";
        if (approvedVets.length === 0) {
            approvedGrid.style.display = "block";
            approvedGrid.innerHTML = `
                <div style="background: #f9f9f9; padding: 20px; text-align: center; border-radius: 8px; border: 1px dashed #ccc;">
                    <p style="color: gray; margin: 0;">Kliniğinizde henüz aktif olarak çalışan bir hekim bulunmuyor.</p>
                </div>`;
        } else {
            approvedGrid.style.display = "grid";
            approvedVets.forEach(vet => {
                approvedGrid.innerHTML += `
                    <div class="pet-card" style="border-left: 5px solid var(--primary-yesil); padding: 15px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); background: white;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                            <img src="${vet.photo || 'https://cdn-icons-png.flaticon.com/512/2810/2810488.png'}" alt="Vet" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid var(--primary-yesil); object-fit: cover;">
                            <div>
                                <h3 style="margin: 0; color: var(--secondary-mavi); font-size: 18px;">${vet.name}</h3>
                                <p style="margin: 3px 0 0 0; font-size: 13px; color: #666;"><b>Deneyim:</b> ${vet.experience} Yıl</p>
                            </div>
                        </div>
                        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 15px; line-height: 1.4;">"${vet.bio}"</p>
                        
                        <button onclick="updateVetStatus(${vet.id}, 'rejected')" style="width: 100%; background: white; color: #E53935; border: 1px solid #E53935; font-weight: bold; padding: 8px; border-radius: 5px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#ffebee'" onmouseout="this.style.background='white'">Kadrodan Çıkar</button>
                    </div>
                `;
            });
        }
    } catch (error) {
        console.error("Veritabanından hekimler çekilemedi:", error);
    }
}

// HEKİM ONAYLA VEYA REDDET (JAVA API - PUT)
async function updateVetStatus(vetId, newStatus) {
    if (newStatus === 'rejected') {
        if(!confirm(`Bu hekimi kliniğinizden (ve sistemden) silmek istediğinize emin misiniz?`)) {
            return; 
        }
    }

    try {
        console.log(`📡 Veteriner statüsü güncelleniyor. ID: ${vetId}, Status: ${newStatus}`);
        
        let response = await fetch(`${API_BASE_URL}/users/${vetId}/status?newStatus=${newStatus}`, {
            method: "PUT"
        });

        if (response.ok) {
            if (newStatus === 'approved') {
                if(typeof showToast === "function") showToast("Hekim başarıyla klinik kadrosuna eklendi! ✅", "success");
            } else {
                if(typeof showToast === "function") showToast("Hekim kliniğinizden çıkarıldı. 🗑️", "success");
            }
            loadClinicVets(); 
        } else {
            if(typeof showToast === "function") showToast("İşlem başarısız oldu! Lütfen tekrar deneyin.", "error");
        }
    } catch (error) {
        console.error("Statü güncellenirken hata:", error);
        if(typeof showToast === "function") showToast("Sunucuya bağlanılamadı. İnternetinizi kontrol edin.", "error");
    }
}

// BUGÜNKÜ RANDEVULAR (GERÇEK VERİ BAĞLANTISI)
async function loadClinicAppointments() {
    let appContainer = document.getElementById("clinic-today-appointments");
    if (!appContainer) return;
    
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) return;

    try {
        let res = await fetch(`${API_BASE_URL}/appointments`);
        let allApps = await res.json();

        // Bugünkü tarihi bul
        let d = new Date();
        let year = d.getFullYear();
        let month = String(d.getMonth() + 1).padStart(2, '0');
        let day = String(d.getDate()).padStart(2, '0');
        let today = `${year}-${month}-${day}`;

        // SADECE BU KLİNİĞE AİT ve SADECE BUGÜNKÜ randevuları filtrele
        let todayApps = allApps.filter(app => app.clinicEmail === loggedInUser.email && app.date === today);

        if (todayApps.length === 0) {
            appContainer.innerHTML = `
                <div style="background: #f9f9f9; padding: 20px; text-align: center; border-radius: 8px; border: 1px dashed #ccc;">
                    <p style="color: gray; margin: 0;">Bugün kliniğinizde planlanmış bir randevu bulunmuyor. Rahat bir gün! ☕</p>
                </div>`;
            return;
        }

        // Saate göre sırala (Önce sabah, sonra akşam)
        todayApps.sort((a, b) => a.time.localeCompare(b.time));

        appContainer.innerHTML = ""; // Yükleniyor yazısını sil
        
        let resUsers = await fetch(`${API_BASE_URL}/users`);
        let allUsers = await resUsers.json();

        todayApps.forEach(app => {
            // Hekimin kim olduğunu bul
            let vet = allUsers.find(u => u.email === app.vetEmail);
            let vetName = vet ? vet.name : "Bilinmeyen Hekim";

            let statusColor = "#9E9E9E";
            let statusText = "Bekliyor";
            if (app.status === "quoted") { statusColor = "#FFA000"; statusText = "Fiyat Onayı Bekleniyor"; }
            else if (app.status === "confirmed" || app.status === "approved") { statusColor = "#4CAF50"; statusText = "Kesinleşti"; }
            else if (app.status === "rejected") { statusColor = "#E53935"; statusText = "İptal Edildi"; }

            appContainer.innerHTML += `
                <div style="border-left: 5px solid ${statusColor}; margin-bottom: 15px; padding: 15px; background: #fafafa; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">⏰ ${app.time} - 🐾 ${app.petName}</h4>
                        <p style="margin: 0; font-size: 13px; color: #555;"><b>👤 Hasta Sahibi:</b> ${app.ownerName} | <b>👨‍⚕️ Hekim:</b> Dt. ${vetName}</p>
                    </div>
                    <div style="text-align: right;">
                        <span style="background: white; border: 1px solid ${statusColor}; color: ${statusColor}; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">${statusText}</span>
                        ${app.price ? `<p style="margin: 5px 0 0 0; font-size: 13px; font-weight: bold; color: #1565C0;">💰 ${app.price} TL</p>` : ''}
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error("Randevular çekilemedi:", error);
        appContainer.innerHTML = "<p style='color:red;'>Randevular yüklenirken hata oluştu.</p>";
    }
}

async function loadClinicReviews() {
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser || loggedInUser.role !== "clinic") return;

    let reviewsContainer = document.getElementById("clinic-reviews-list");
    if (!reviewsContainer) return;

    try {
        let resApps = await fetch(`${API_BASE_URL}/appointments`);
        let allApps = await resApps.json();

        let resUsers = await fetch(`${API_BASE_URL}/users`);
        let allUsers = await resUsers.json();

        // --- AKILLI FİLTRELEME ---
        // Sadece BU KLİNİĞİN bünyesindeki veterinerlere yapılmış yorumları bul
        let myClinicReviews = allApps.filter(app => {
            // Randevudaki vet_email'e sahip olan veterineri bul
            let vet = allUsers.find(u => u.email === app.vetEmail);
            // Eğer veteriner varsa ve onun clinicEmail'i benim email'imle eşleşiyorsa al
            return vet && vet.clinicEmail === loggedInUser.email && app.rating > 0;
        });

        if (myClinicReviews.length === 0) {
            reviewsContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: gray;">Kliniğinize henüz bir değerlendirme yapılmamış.</div>`;
            return;
        }

        reviewsContainer.innerHTML = ""; 
        myClinicReviews.sort((a, b) => b.id - a.id);

        myClinicReviews.forEach(rev => {
            let vet = allUsers.find(u => u.email === rev.vetEmail);
            let vetName = vet ? vet.name : "Bilinmeyen Hekim";
            let stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
            let borderColor = rev.rating >= 4 ? "#FFD700" : (rev.rating >= 3 ? "#FFA000" : "#E53935");
            let firstName = rev.ownerName ? rev.ownerName.split(' ')[0] : "Gizli";

            reviewsContainer.innerHTML += `
                <div style="background: white; border-left: 5px solid ${borderColor}; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
                        <span style="font-size: 18px; color: #FFD700;">${stars}</span>
                        <span style="font-size: 13px; background: #e8f5e9; color: #2e7d32; padding: 5px 10px; border-radius: 6px; font-weight: bold;">👨‍⚕️ Dt. ${vetName}</span>
                    </div>
                    <p style="font-size: 15px; color: #333; font-style: italic; margin: 0 0 15px 0;">"${rev.reviewText}"</p>
                    <div style="font-size: 12px; color: #777; text-align: right; background: #f9f9f9; padding: 8px; border-radius: 5px;">
                        👤 <b>${firstName}</b> | 🐾 <b>${rev.petName}</b>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Yorum çekme hatası:", error);
    }
}