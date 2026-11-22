// ANA MOTOR (SAYFA YÜKLENDİĞİNDE)
document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = "http://localhost:8080/api";
    let today = new Date().toISOString().split('T')[0];
    
    // Tarih kısıtlamaları
    let dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.setAttribute("max", today);
        input.setAttribute("min", "2000-01-01");
    });

    // --- GÜVENLİK VE ROL KONTROLÜ ---
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        window.location.href = "login.html";
        return;
    }
    
    if (loggedInUser.role === "vet") {
        document.body.innerHTML = `<div style="text-align: center; margin-top: 100px;"><h2 style="color: #E53935;">Yetki Hatası</h2><p>Veteriner paneline yönlendiriliyorsunuz...</p></div>`;
        setTimeout(() => window.location.href = "vet-dashboard.html", 2000);
        return;
    }

 // --- HAYVAN EKLEME FORMU DİNLEYİCİSİ ---
   const form = document.getElementById("petForm");
    if (form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();
            console.log("🚀 Hayvan ekleme isteği Java'ya gidiyor...");

            let type = document.getElementById("type").value;
            if (!type) { 
                if (typeof showToast === "function") {
                    showToast("Lütfen hayvanın türünü seçin!", "warning"); 
                } else {
                    console.warn("Kullanıcı hayvan türünü seçmeden ilerlemeye çalıştı.");
                }
                return; 
            }

            let petData = {
                name: document.getElementById("name").value,
                type: type,
                ownerEmail: loggedInUser.email,
                photo: document.getElementById("petPhoto").value || (type === "cat" ? "https://cdn-icons-png.flaticon.com/512/1864/1864514.png" : "https://cdn-icons-png.flaticon.com/512/93/93944.png")
            };

            let vaccinesObj = {}; 

            if (type === "cat") {
                petData.age = document.getElementById("cat-age").value;
                petData.breed = document.getElementById("cat-breed").value;
                
                if (document.getElementById("cat-karma").value) vaccinesObj["Karma"] = document.getElementById("cat-karma").value;
                if (document.getElementById("cat-kuduz").value) vaccinesObj["Kuduz"] = document.getElementById("cat-kuduz").value;
                if (document.getElementById("cat-felv").value) vaccinesObj["Lösemi (FeLV)"] = document.getElementById("cat-felv").value;
                if (document.getElementById("cat-parazit").value) vaccinesObj["İç/Dış Parazit"] = document.getElementById("cat-parazit").value;
                
            } else if (type === "dog") {
                petData.age = document.getElementById("dog-age").value;
                petData.breed = document.getElementById("dog-breed").value;
                
                if (document.getElementById("dog-kuduz").value) vaccinesObj["Kuduz"] = document.getElementById("dog-kuduz").value;
                if (document.getElementById("dog-karma").value) vaccinesObj["Karma"] = document.getElementById("dog-karma").value;
                if (document.getElementById("dog-parazit").value) vaccinesObj["İç/Dış Parazit"] = document.getElementById("dog-parazit").value;
                if (document.getElementById("dog-bronsin").value) vaccinesObj["Bronşin"] = document.getElementById("dog-bronsin").value;
                if (document.getElementById("dog-corona").value) vaccinesObj["Corona"] = document.getElementById("dog-corona").value;
                if (document.getElementById("dog-lyme").value) vaccinesObj["Lyme"] = document.getElementById("dog-lyme").value;
            }

            petData.vaccines = JSON.stringify(vaccinesObj);

            try {
                let response = await fetch(`${API_BASE_URL}/pets`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(petData)
                });

                if (response.ok) {
                    if (typeof showToast === "function") {
                        showToast(`${petData.name} başarıyla sisteme eklendi! 🐾`, "success");
                    } else {
                        console.log(`${petData.name} sisteme eklendi! 🐾`);
                    }
                    
                    form.reset();
                    setTimeout(() => { window.location.href = "dashboard.html"; }, 1500);
                } else {
                    if (typeof showToast === "function") {
                        showToast("Hayvan eklenirken bir hata oluştu. Bilgileri kontrol edin.", "error");
                    }
                }
            } catch (error) {
                console.error("Ekleme hatası:", error);
                if (typeof showToast === "function") {
                    showToast("Sunucuya bağlanılamadı. Lütfen internetinizi kontrol edin.", "error");
                }
            }
        });
    }
    const editForm = document.getElementById("editOwnerPetForm");
    if (editForm) {
        editForm.addEventListener("submit", saveOwnerPetChanges);
    }

    loadPets();
    loadMyAppointments();
});

// API İŞLEMLERİ (GLOBAL FONKSİYONLAR)

const API_URL = "http://localhost:8080/api";

//  HAYVANLARI LİSTELEME
async function loadPets() {
    const petGrid = document.getElementById("my-pets-grid");
    if (!petGrid) return;
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    
    try {
        console.log("📡 Veriler MariaDB'den çekiliyor...");
        let response = await fetch(`${API_URL}/pets/owner/${loggedInUser.email}`);
        let myPets = await response.json();

        petGrid.innerHTML = "";
        if (myPets.length === 0) {
            petGrid.innerHTML = "<p>Henüz kayıtlı bir hayvanınız bulunmuyor.</p>";
            return;
        }

        myPets.forEach(pet => {
            let typeIcon = pet.type === "cat" ? "🐱" : "🐶";
            
            // Aşıları Çözümle (Kartın üzerinde göstermek için)
            let vaccinesHtml = `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ccc; font-size: 12px; text-align: left;">
                                  <strong style="color: var(--secondary-mavi);">💉 Aşı Takvimi:</strong><br>`;
            
            if (pet.vaccines) {
                try {
                    let vacObj = typeof pet.vaccines === "string" ? JSON.parse(pet.vaccines) : pet.vaccines;
                    if (Object.keys(vacObj).length > 0) {
                         for(let v in vacObj) {
                             vaccinesHtml += `<span style="display:inline-block; background:#e8f5e9; color:#2e7d32; padding:2px 6px; border-radius:4px; margin: 2px;">${v}: ${vacObj[v]}</span>`;
                         }
                    } else {
                         vaccinesHtml += `<span style="color:gray;">Aşı kaydı bulunmuyor.</span>`;
                    }
                } catch(e) { vaccinesHtml += `<span style="color:gray;">Aşılar okunamadı.</span>`; }
            } else {
                vaccinesHtml += `<span style="color:gray;">Aşı kaydı bulunmuyor.</span>`;
            }
            vaccinesHtml += `</div>`;

            petGrid.innerHTML += `
                <div class="pet-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <img src="${pet.photo}" alt="${pet.name}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid #4CAF50; display: block; margin: 0 auto;">
                        <h3 style="text-align: center;">${pet.name}</h3>
                        <p><b>Tür:</b> ${pet.type === 'cat' ? 'Kedi' : 'Köpek'} ${typeIcon}</p>
                        <p><b>Cins:</b> ${pet.breed || 'Belirtilmemiş'}</p>
                        <p><b>Yaş:</b> ${formatPetAge(pet.age)}</p>
                        ${vaccinesHtml}
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button onclick="openEditOwnerModal('${pet.id}')" style="flex: 1; background-color: #2196F3; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">Düzenle</button>
                        <button onclick="deletePet('${pet.id}')" style="flex: 1; background-color: #E53935; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">Sil</button>
                    </div>
                </div>`;
        });
    } catch (error) { console.error("Yükleme hatası:", error); }
}

//  MODAL AÇ VE VERİ DOLDUR (AŞILAR SADECE OKUNABİLİR)
window.currentPetVaccines = null; 

async function openEditOwnerModal(petId) {
    console.log("🔍 Düzenleme modu, ID:", petId);
    try {
        const response = await fetch(`${API_URL}/pets/${petId}`);
        const pet = await response.json();

        document.getElementById("editOwnerPetId").value = pet.id;
        document.getElementById("editOwnerPetName").value = pet.name || "";
        document.getElementById("editOwnerPetAge").value = pet.age || "";
        document.getElementById("editOwnerPetBreed").value = pet.breed || "";
        document.getElementById("editOwnerPetPhoto").value = pet.photo || "";
        document.getElementById("editOwnerPetType").value = pet.type;
        
        // Aşıları hafızaya al
        window.currentPetVaccines = pet.vaccines || null;

        // Aşı Kutusunu Doldur (Sadece Okunabilir)
        const vacContainer = document.getElementById("editOwnerVaccinesContainer");
        if(vacContainer) {
            vacContainer.innerHTML = "";
            let vaccineNames = pet.type === "cat" ? ["Karma", "Kuduz", "Lösemi (FeLV)", "İç/Dış Parazit"] : ["Kuduz", "Karma", "İç/Dış Parazit", "Bronşin", "Corona", "Lyme"];
            
            let safeVaccines = {};
            if (pet.vaccines) {
                try { safeVaccines = typeof pet.vaccines === "string" ? JSON.parse(pet.vaccines) : pet.vaccines; } 
                catch(e) {}
            }

            vaccineNames.forEach(vName => {
                let oldDate = safeVaccines[vName] || "Kayıt Yok";
                // Input'lara 'disabled' veya 'readonly' ekleyerek müşterinin değiştirmesini engelliyoruz
                vacContainer.innerHTML += `
                    <div style="margin-bottom: 10px;">
                        <label style="font-size: 13px; font-weight: bold; display: block; margin-bottom: 3px; color: #555;">${vName}</label>
                        <input type="text" value="${oldDate}" readonly style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px; background: #f5f5f5; color: #888; cursor: not-allowed;">
                    </div>
                `;
            });
            
            vacContainer.innerHTML += `<p style="font-size:11px; color:var(--accent-turuncu); margin-top:10px;"><i>Not: Aşı güncellemeleri sadece yetkili veteriner hekimler tarafından yapılabilir.</i></p>`;
        }

        document.getElementById("editOwnerModal").classList.add("show");
    } catch (error) { console.error("Hata:", error); }
}

// JAVA + DB GÜNCELLEME (PUT)
async function saveOwnerPetChanges(e) {
    if (e) e.preventDefault();
    const petId = document.getElementById("editOwnerPetId").value;
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    const updatedPet = {
        id: petId,
        name: document.getElementById("editOwnerPetName").value,
        age: document.getElementById("editOwnerPetAge").value,
        breed: document.getElementById("editOwnerPetBreed").value,
        photo: document.getElementById("editOwnerPetPhoto").value,
        type: document.getElementById("editOwnerPetType").value,
        ownerEmail: loggedInUser.email,
        vaccines: window.currentPetVaccines 
    };

    try {
        const response = await fetch(`${API_URL}/pets/${petId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedPet)
        });

        if (response.ok) {
            if (typeof showToast === "function") {
                showToast("Harika! Bilgiler veritabanında güncellendi. 🐾", "success");
            } else {
                console.log("Bilgiler güncellendi!"); 
            }

            closeEditOwnerModal(); 
            
            setTimeout(() => {
                loadPets(); 
            }, 500); 
        }
    } catch (error) { console.error("Güncelleme hatası:", error); }
}

//  SİLME (DELETE)
async function deletePet(petId) {
    if(confirm("Silmek istediğinize emin misiniz?")) {
        try {
            await fetch(`${API_URL}/pets/${petId}`, { method: "DELETE" });
            loadPets();
        } catch (error) { console.error("Silme hatası:", error); }
    }
}

// RANDEVULARI ÇEK VE İKİYE BÖL (GELECEK VE GEÇMİŞ)
async function loadMyAppointments() {
    const appGrid = document.getElementById("my-appointments-grid");
    const pastGrid = document.getElementById("past-appointments-grid"); // YENİ: Geçmiş kutusu
    if (!appGrid) return;
    
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    try {
        let response = await fetch(`${API_URL}/appointments/owner/${loggedInUser.email}`);
        let myApps = await response.json();
        
        appGrid.innerHTML = "";
        if (pastGrid) pastGrid.innerHTML = "";
        
        // --- ZAMAN MAKİNESİ FİLTRESİ (Gelecek ve Geçmişi Ayırma) ---
        let d = new Date();
        let year = d.getFullYear();
        let month = String(d.getMonth() + 1).padStart(2, '0');
        let day = String(d.getDate()).padStart(2, '0');
        let today = `${year}-${month}-${day}`; 
        let currentTime = String(d.getHours()).padStart(2, '0') + ":" + String(d.getMinutes()).padStart(2, '0');

        let upcomingApps = [];
        let pastApps = [];

        myApps.forEach(app => {
            if (app.date > today || (app.date === today && app.time >= currentTime)) {
                upcomingApps.push(app); // Gelecek randevular
            } else {
                pastApps.push(app); // Saati geçmiş randevular
            }
        });

        // 1. GELECEK RANDEVULARI EKRANA BAS (Burada oylama YOK)
        if (upcomingApps.length === 0) {
            appGrid.innerHTML = "<p style='color:gray; font-style: italic;'>Yaklaşan aktif randevunuz bulunmuyor.</p>";
        } else {
            upcomingApps.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
            upcomingApps.forEach(app => {
                let statusColor = "#ccc";
                let translatedStatus = "Bilinmiyor";
                
                if (app.status === "pending") { statusColor = "#9E9E9E"; translatedStatus = "Hekim İnceliyor"; }
                else if (app.status === "quoted") { statusColor = "#FFA000"; translatedStatus = "Fiyat Onayınız Bekleniyor"; }
                else if (app.status === "confirmed" || app.status === "approved") { statusColor = "#4CAF50"; translatedStatus = "Randevu Kesinleşti"; }
                else if (app.status === "rejected") { statusColor = "#E53935"; translatedStatus = "İptal Edildi"; }

                let formattedDate = app.date.split("-").reverse().join(".");
                let actionHtml = "";
                
                if (app.status === "quoted") {
                    actionHtml = `
                        <div style="margin-top: 10px; background: #fff3e0; padding: 15px; border-radius: 8px; border: 1px solid #ffe0b2;">
                            <p style="margin: 0 0 12px 0; font-size: 14px; text-align: center;"><b>Talep Edilen Ücret:</b> <span style="color: #e65100; font-size: 18px; font-weight: bold;">${app.price} TL</span></p>
                            <div style="display: flex; gap: 10px;">
                                <button onclick="confirmPrice(${app.id})" style="flex: 1; background: #4CAF50; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 13px;">✅ Kabul Et</button>
                                <button onclick="showRejectPopup(${app.id})" style="flex: 1; background: #E53935; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 13px;">✖ Reddet</button>
                            </div>
                        </div>
                    `;
                } else if (app.status === "confirmed" || app.status === "approved") {
                     actionHtml = `
                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ccc;">
                            <p style="margin: 0; font-size: 14px; color: #1565C0;"><b>💰 Onaylanan Ücret:</b> ${app.price ? app.price + ' TL' : 'Ücretsiz'}</p>
                        </div>
                    `;
                }

                appGrid.innerHTML += `
                    <div class="pet-card" style="border-left: 5px solid ${statusColor}; margin-bottom: 15px; padding: 15px; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <h3 style="margin-top: 0; color: #333;">🐾 ${app.petName}</h3>
                        <p style="margin: 5px 0; color: #555;"><b>Tarih:</b> ${formattedDate} | <b>Saat:</b> ${app.time}</p>
                        <p style="margin: 5px 0; color: #555;"><b>Durum:</b> <span style="color:${statusColor}; font-weight:bold; background: #f9f9f9; padding: 2px 8px; border-radius: 10px; border: 1px solid ${statusColor}40;">${translatedStatus.toUpperCase()}</span></p>
                        ${actionHtml}
                    </div>`;
            });
        }

        // 2. GEÇMİŞ RANDEVULARI EKRANA BAS (Oylama Butonu BURADA olacak!)
        if (pastGrid) {
            if (pastApps.length === 0) {
                pastGrid.innerHTML = "<p style='color:gray; font-style: italic;'>Geçmiş randevunuz bulunmuyor.</p>";
            } else {
                pastApps.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)); // Yeniden eskiye sırala
                pastApps.forEach(app => {
                    let formattedDate = app.date.split("-").reverse().join(".");
                    let actionHtml = "";

                    // Eğer geçmiş randevu "iptal edilmiş" veya "fiyat beklerken süresi geçmişse" oylama çıkmaz
                    if (app.status === "confirmed" || app.status === "approved") {
                        if (app.rating && app.rating > 0) {
                            actionHtml = `<div style="margin-top: 10px; font-size: 14px; color: #555; background: #f9f9f9; padding: 10px; border-radius: 5px;">
                                            <b>Verdiğiniz Puan:</b> <span style="color: #FFD700; font-size: 16px;">${'★'.repeat(app.rating)}${'☆'.repeat(5 - app.rating)}</span>
                                            <p style="margin: 5px 0 0 0; font-style: italic; color: #777;">"${app.reviewText || ''}"</p>
                                          </div>`;
                        } else {
                            actionHtml = `<button onclick="showReviewPopup(${app.id})" style="margin-top: 10px; width: 100%; background: #FFB300; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 13px; transition: 0.2s;">⭐ Hekimi Değerlendir</button>`;
                        }
                    } else {
                        actionHtml = `<p style="margin-top: 10px; font-size: 12px; color: gray; font-style: italic;">Bu randevu tamamlanmadığı için değerlendirme yapılamaz.</p>`;
                    }

                    pastGrid.innerHTML += `
                        <div class="pet-card" style="border-left: 5px solid gray; margin-bottom: 15px; padding: 15px; background: #f5f5f5; box-shadow: 0 2px 5px rgba(0,0,0,0.05); opacity: 0.8;">
                            <h3 style="margin-top: 0; color: #333;">🐾 ${app.petName}</h3>
                            <p style="margin: 5px 0; color: #555;"><b>Tarih:</b> ${formattedDate} | <b>Saat:</b> ${app.time}</p>
                            <p style="margin: 5px 0; color: #555;"><b>Durum:</b> <span style="color:gray; font-weight:bold;">TAMAMLANDI/GEÇTİ</span></p>
                            ${actionHtml}
                        </div>`;
                });
            }
        }
    } catch (error) { 
        console.error("Randevu hatası:", error); 
        if (appGrid) appGrid.innerHTML = "<p style='color:red;'>Randevular yüklenirken bir hata oluştu.</p>";
    }
}

function closeEditOwnerModal() {
    document.getElementById("editOwnerModal").classList.remove("show");
}
// --- YENİ: MÜŞTERİNİN FİYATI KABUL ETMESİ ---
async function confirmPrice(appId) {
    try {
        let response = await fetch(`${API_URL}/appointments/${appId}/confirm`, {
            method: "PUT"
        });

        if (response.ok) {
            if(typeof showToast === "function") showToast("Randevunuz kesinleşti! Bizi tercih ettiğiniz için teşekkürler 🎉", "success");
            loadMyAppointments(); // Ekranı yenile
        } else {
             if(typeof showToast === "function") showToast("Onaylanırken sunucuda hata oluştu.", "error");
        }
    } catch (error) {
        console.error("Onay hatası:", error);
        if(typeof showToast === "function") showToast("Onay sırasında bir hata oluştu.", "error");
    }
}

// --- 1. DİNAMİK REDDETME POPUP'I OLUŞTUR VE GÖSTER ---
function showRejectPopup(appId) {
    // Eğer önceden açık kalmış bir popup varsa temizle
    let oldPopup = document.getElementById("dynamicRejectModal");
    if (oldPopup) oldPopup.remove();

    // Yeni bir div oluştur ve senin mevcut modal sınıflarını ekle
    let overlay = document.createElement("div");
    overlay.id = "dynamicRejectModal";
    overlay.className = "modal-overlay show"; // 'show' class'ı ile görünür yapıyoruz
    overlay.style.display = "flex"; 
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    // Popup'ın iç HTML'i (Senin tasarıma uygun şık tasarım)
    overlay.innerHTML = `
        <div class="custom-modal" style="max-width: 350px; text-align: center; padding: 25px; border-radius: 12px; background: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: fadeIn 0.3s ease;">
            <div style="font-size: 40px; margin-bottom: 10px;">⚠️</div>
            <h3 style="color: #E53935; margin-top: 0; font-size: 20px;">Teklifi Reddet</h3>
            <p style="color: #555; font-size: 14px; margin-bottom: 20px;">Bu fiyat teklifini reddetmek istediğinize emin misiniz? <br><br><b>Not:</b> Bu işlem randevunuzu kalıcı olarak iptal edecektir.</p>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="closeRejectPopup()" style="flex: 1; background: #e0e0e0; color: #333; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">Vazgeç</button>
                <button onclick="executeRejectPrice(${appId})" style="flex: 1; background: #E53935; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">Evet, İptal Et</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}

// --- 2. POPUP'I KAPAT ---
function closeRejectPopup() {
    let popup = document.getElementById("dynamicRejectModal");
    if (popup) popup.remove();
}

// --- 3. GERÇEK REDDETME (API) İŞLEMİ ---
async function executeRejectPrice(appId) {
    closeRejectPopup(); // İşlem başlar başlamaz popup'ı ekrandan kaldır

    try {
        let response = await fetch(`${API_URL}/appointments/${appId}/status?newStatus=rejected`, {
            method: "PUT"
        });

        if (response.ok) {
            if(typeof showToast === "function") showToast("Fiyat teklifi reddedildi ve randevu iptal edildi. 🗑️", "info");
            loadMyAppointments(); // Ekranı yenile (Kart anında kırmızıya dönecek)
        } else {
             if(typeof showToast === "function") showToast("Reddedilirken sunucuda hata oluştu.", "error");
        }
    } catch (error) {
        console.error("Reddetme hatası:", error);
        if(typeof showToast === "function") showToast("İşlem sırasında bir hata oluştu.", "error");
    }
}

// --- YENİ: DİNAMİK PUANLAMA (RATING) POPUP'I ---

window.currentRatingSelection = 0; // Kullanıcının o an seçtiği yıldız sayısını tutar

function showReviewPopup(appId) {
    let oldPopup = document.getElementById("dynamicReviewModal");
    if (oldPopup) oldPopup.remove();
    window.currentRatingSelection = 0; // Sıfırla

    let overlay = document.createElement("div");
    overlay.id = "dynamicReviewModal";
    overlay.className = "modal-overlay show"; 
    overlay.style.display = "flex"; 
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    overlay.innerHTML = `
        <div class="custom-modal" style="width: 350px; text-align: center; padding: 25px; border-radius: 12px; background: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: fadeIn 0.3s ease;">
            <h3 style="color: #FFB300; margin-top: 0; font-size: 20px;">⭐ Hekimi Değerlendir</h3>
            <p style="color: #555; font-size: 14px; margin-bottom: 15px;">Aldığınız hizmetten ne kadar memnun kaldınız?</p>
            
            <div id="star-container" style="font-size: 35px; color: #ccc; cursor: pointer; margin-bottom: 15px; user-select: none;">
                <span onclick="setRating(1)">☆</span>
                <span onclick="setRating(2)">☆</span>
                <span onclick="setRating(3)">☆</span>
                <span onclick="setRating(4)">☆</span>
                <span onclick="setRating(5)">☆</span>
            </div>

            <textarea id="reviewTextInput" placeholder="Hekim hakkında düşüncelerinizi yazın... (Opsiyonel)" style="width: 100%; height: 80px; padding: 10px; border-radius: 8px; border: 1px solid #ccc; font-family: inherit; margin-bottom: 20px; resize: none; box-sizing: border-box;"></textarea>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="closeReviewPopup()" style="flex: 1; background: #e0e0e0; color: #333; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">İptal</button>
                <button onclick="submitReview(${appId})" style="flex: 1; background: #4CAF50; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">Gönder</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}

function setRating(rating) {
    window.currentRatingSelection = rating;
    let stars = document.getElementById("star-container").children;
    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            stars[i].innerText = "★";
            stars[i].style.color = "#FFD700"; // Altın sarısı
        } else {
            stars[i].innerText = "☆";
            stars[i].style.color = "#ccc"; // Gri
        }
    }
}

function closeReviewPopup() {
    let popup = document.getElementById("dynamicReviewModal");
    if (popup) popup.remove();
}

async function submitReview(appId) {
    let reviewText = document.getElementById("reviewTextInput").value.trim();
    
    if (window.currentRatingSelection === 0) {
        if(typeof showToast === "function") showToast("Lütfen en az 1 yıldız seçin!", "warning");
        return;
    }

    let reviewData = {
        rating: window.currentRatingSelection,
        reviewText: reviewText
    };

    try {
        let response = await fetch(`${API_URL}/appointments/${appId}/review`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reviewData)
        });

        if (response.ok) {
            if(typeof showToast === "function") showToast("Değerlendirmeniz başarıyla kaydedildi! 🌟", "success");
            closeReviewPopup();
            loadMyAppointments(); // Kartı yenile, buton gitsin yıldızlar gelsin!
        } else {
             if(typeof showToast === "function") showToast("Kaydedilirken hata oluştu.", "error");
        }
    } catch (error) {
        console.error("Yorum hatası:", error);
        if(typeof showToast === "function") showToast("İşlem sırasında bir hata oluştu.", "error");
    }
}

function formatPetAge(weeks) {
    if (!weeks) return "Belirtilmemiş";
    let w = parseInt(weeks);
    if (w < 4) return w + " Haftalık";
    if (w < 52) return Math.floor(w / 4.33) + " Aylık";
    return Math.floor(w / 52) + " Yaşında";
}
