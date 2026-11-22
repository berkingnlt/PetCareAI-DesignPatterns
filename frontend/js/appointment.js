// SAYFA YÜKLENDİĞİNDE ÇALIŞACAK ANA AYARLAR
const API_BASE_URL = "http://localhost:8080/api";
const locations = {
    "İstanbul": ["Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Bakırköy", "Maltepe"],
    "Ankara": ["Çankaya", "Keçiören", "Yenimahalle", "Etimesgut", "Mamak"],
    "İzmir": ["Bornova", "Karşıyaka", "Konak", "Buca", "Çiğli"],
    "Antalya": ["Alanya", "Muratpaşa", "Kepez", "Konyaaltı", "Manavgat"],
    "Bursa": ["Nilüfer", "Osmangazi", "Yıldırım", "Mudanya", "Gemlik"]
};

window.allUsers = []; 
window.userPets = [];
window.selectedSlotData = null; // Seçilen saatin bilgilerini tutar

document.addEventListener("DOMContentLoaded", () => {
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser || loggedInUser.role !== "user") {
        window.location.href = "login.html";
        return;
    }

    loadUserPets(loggedInUser.email);
    
    filterClinics();

    document.getElementById("appointmentForm").addEventListener("submit", submitAppointment);
});

// KULLANICININ HAYVANLARINI VE LOKASYONU YÜKLE
async function loadUserPets(ownerEmail) {
    let petSelect = document.getElementById("appPet");
    try {
        let response = await fetch(`${API_BASE_URL}/pets/owner/${ownerEmail}`);
        window.userPets = await response.json();
        
        if (window.userPets.length === 0) {
            petSelect.innerHTML = '<option value="">-- Kayıtlı Hayvanınız Yok. Önce Hayvan Ekleyin --</option>';
            petSelect.disabled = true;
            if(typeof showToast === "function") showToast("Randevu almak için önce sisteme evcil hayvanınızı eklemelisiniz.", "error");
            setTimeout(() => { window.location.href = "add-pet.html"; }, 3000);
            return;
        }

        petSelect.innerHTML = '<option value="">-- Hangi Hayvanınız İçin? --</option>';
        window.userPets.forEach(pet => {
            petSelect.innerHTML += `<option value="${pet.id}">${pet.name} (${pet.type === 'cat' ? 'Kedi' : 'Köpek'})</option>`;
        });
    } catch (error) {
        console.error("Hayvanlar yüklenirken hata:", error);
    }
}

function updateAppDistricts() {
    const city = document.getElementById("appCity").value;
    const distSelect = document.getElementById("appDistrict");
    
    distSelect.innerHTML = '<option value="all">-- Tüm İlçeler --</option>';
    if (city !== "all" && locations[city]) {
        locations[city].forEach(d => {
            distSelect.innerHTML += `<option value="${d}">${d}</option>`;
        });
        distSelect.disabled = false;
        distSelect.style.background = "white";
    } else {
        distSelect.disabled = true;
        distSelect.style.background = "#eee";
    }
    filterClinics(); 
}

//  KLİNİKLERİ FİLTRELE VE SEÇİM EKRANINI DOLDUR
async function filterClinics() {
    let city = document.getElementById("appCity").value;
    let district = document.getElementById("appDistrict").value;
    let requireBed = document.getElementById("appRequireBed")?.checked || false;
    
    let clinicSelect = document.getElementById("bookingClinic");
    let vetSelect = document.getElementById("bookingVet");
    let slotsContainer = document.getElementById("bookingSlotsContainer");

    // Seçimleri sıfırla
    clinicSelect.innerHTML = '<option value="">-- Lütfen Klinik Seçin --</option>';
    vetSelect.innerHTML = '<option value="">-- Önce Klinik Seçin --</option>';
    vetSelect.disabled = true;
    vetSelect.style.background = "#f9f9f9";
    slotsContainer.innerHTML = '<p style="color: gray; font-size: 14px; margin: 0; width: 100%; text-align: center; font-style: italic;">Lütfen saatleri görebilmek için yukarıdan bir klinik seçin.</p>';
    document.getElementById("selectedAvailId").value = "";
    window.selectedSlotData = null;

    try {
        if(window.allUsers.length === 0) {
            let res = await fetch(`${API_BASE_URL}/users`);
            window.allUsers = await res.json();
        }

        let approvedClinics = window.allUsers.filter(u => u.role === "clinic" && u.status === "approved");

        let filteredClinics = approvedClinics.filter(clinic => {
            let matchCity = (city === "all") ? true : (clinic.city === city);
            let matchDistrict = (district === "all") ? true : (clinic.district === district);
            let matchBed = requireBed ? (clinic.bedCapacity > 0) : true; 
            return matchCity && matchDistrict && matchBed;
        });

        if (filteredClinics.length === 0) {
            clinicSelect.innerHTML = '<option value="">-- Kriterlere Uygun Klinik Bulunamadı --</option>';
            return;
        }

        filteredClinics.forEach(clinic => {
            let extraInfo = clinic.emergency ? " (🚨 7/24 Acil)" : "";
            clinicSelect.innerHTML += `<option value="${clinic.email}">${clinic.clinicName || clinic.name} - ${clinic.district}${extraInfo}</option>`;
        });
    } catch (error) {
        console.error("Klinikler yüklenirken hata:", error);
    }
}

// KLİNİK SEÇİLİNCE HEKİMLERİ VE SAATLERİ GETİR
function loadVetsForClinic() {
    let clinicEmail = document.getElementById("bookingClinic").value;
    let vetSelect = document.getElementById("bookingVet");
    document.getElementById("selectedAvailId").value = ""; 
    window.selectedSlotData = null;

    if (!clinicEmail) {
        filterClinics(); 
        return;
    }

    let clinicVets = window.allUsers.filter(u => u.role === "vet" && u.clinicEmail === clinicEmail && u.status === "approved");

    vetSelect.disabled = false;
    vetSelect.style.background = "white";
    
    vetSelect.innerHTML = '<option value="all">Tüm Hekimler (Fark Etmez)</option>';
    clinicVets.forEach(vet => {
        vetSelect.innerHTML += `<option value="${vet.email}">Dt. ${vet.name} (${vet.experience} Yıl Deneyim)</option>`;
    });

    loadAvailableSlots();
}

async function loadAvailableSlots() {
    let clinicEmail = document.getElementById("bookingClinic").value;
    let selectedVetEmail = document.getElementById("bookingVet").value;
    let slotsContainer = document.getElementById("bookingSlotsContainer");
    
    document.getElementById("selectedAvailId").value = ""; 
    window.selectedSlotData = null;
    if (!clinicEmail) return;

    let clinicVets = window.allUsers.filter(u => u.role === "vet" && u.clinicEmail === clinicEmail && u.status === "approved");
    let vetEmailsToFetch = selectedVetEmail === "all" ? clinicVets.map(v => v.email) : [selectedVetEmail];

    let d = new Date();
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    let year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    let today = [year, month, day].join('-'); 
    let currentTimeString = String(d.getHours()).padStart(2, '0') + ":" + String(d.getMinutes()).padStart(2, '0');

    try {
        slotsContainer.innerHTML = '<p>Saatler yükleniyor... ⏳</p>';
        let allAvails = [];
        
        // Seçili kliniğin hekimlerinin saatlerini MariaDB'den çek
        for (let email of vetEmailsToFetch) {
            let res = await fetch(`${API_BASE_URL}/availabilities/vet/${email}`);
            if(res.ok) {
                let avails = await res.json();
                allAvails = allAvails.concat(avails);
            }
        }

        let filteredAvails = allAvails.filter(a => {
            if (a.isBooked) return false; // Doluysa gösterme

            let isFuture = false;
            if (a.date > today) {
                isFuture = true;
            } else if (a.date === today && a.time >= currentTimeString) {
                isFuture = true;
            }
            return isFuture;
        });

        slotsContainer.innerHTML = "";

        if (filteredAvails.length === 0) {
            slotsContainer.innerHTML = `<p style="color: var(--accent-turuncu); font-weight: bold; font-size: 14px; margin: 0; width: 100%; text-align: center;">Uygun boş randevu saati bulunamadı.</p>`;
            return;
        }

        filteredAvails.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

        filteredAvails.forEach(av => {
            let vetInfo = window.allUsers.find(u => u.email === av.vetEmail);
            let vetName = vetInfo ? vetInfo.name : "Hekim";
            let formattedDate = av.date.split("-").reverse().join(".");

            slotsContainer.innerHTML += `
                <div class="slot-box" onclick="selectSlot(this, ${av.id}, '${av.vetEmail}', '${av.date}', '${av.time}')" style="background: white; border: 2px solid #b2dfdb; border-radius: 8px; padding: 12px 15px; cursor: pointer; text-align: center; flex: 1; min-width: 140px; transition: all 0.2s ease;">
                    <span class="slot-time" style="display: block; font-weight: bold; color: var(--secondary-mavi); font-size: 18px;">⏰ ${av.time}</span>
                    <span class="slot-date" style="display: block; font-size: 13px; color: #555; margin-top: 5px; font-weight: bold;">🗓️ ${formattedDate}</span>
                    <span class="slot-vet" style="display: block; font-size: 12px; color: var(--primary-yesil); font-weight: bold; margin-top: 8px; background: #e8f5e9; padding: 4px 6px; border-radius: 4px;">👨‍⚕️ Dt. ${vetName}</span>
                </div>
            `;
        });
    } catch(err) {
        console.error("Saatler çekilemedi:", err);
    }
}

// SEÇİLEN SAAT KUTUCUĞUNA TIKLAMA VE SEÇİM
function selectSlot(element, availId, vetEmail, date, time) {
    let allSlots = document.querySelectorAll(".slot-box");
    allSlots.forEach(slot => {
        slot.style.background = "white";
        slot.style.borderColor = "#b2dfdb";
        slot.style.transform = "scale(1)";
        slot.querySelector(".slot-time").style.color = "var(--secondary-mavi)";
        slot.querySelector(".slot-date").style.color = "#555";
        slot.querySelector(".slot-vet").style.background = "#e8f5e9";
        slot.querySelector(".slot-vet").style.color = "var(--primary-yesil)";
    });

    element.style.background = "var(--secondary-mavi)";
    element.style.borderColor = "var(--secondary-mavi)";
    element.style.transform = "scale(1.05)"; 
    element.querySelector(".slot-time").style.color = "white";
    element.querySelector(".slot-date").style.color = "#e0e0e0";
    element.querySelector(".slot-vet").style.background = "rgba(255,255,255,0.2)";
    element.querySelector(".slot-vet").style.color = "white";

    document.getElementById("selectedAvailId").value = availId;
    
    // Tıklanan saatin bilgilerini hafızaya al ki submit ederken kullanalım
    window.selectedSlotData = { vetEmail, date, time };
}


// RANDEVUYU JAVA ÜZERİNDEN VERİTABANINA KAYDET
async function submitAppointment(e) {
    e.preventDefault();

    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    let petId = document.getElementById("appPet").value;
    let reason = document.getElementById("appReason").value;
    let photo = document.getElementById("appPhoto")?.value || "";
    let selectedAvailId = document.getElementById("selectedAvailId").value;

    if (!petId) {
        if(typeof showToast === "function") showToast("Lütfen evcil hayvan seçin.", "error");
        return;
    }
    if (!selectedAvailId || !window.selectedSlotData) {
        if(typeof showToast === "function") showToast("Lütfen yukarıdaki listeden bir randevu saati seçin!", "error");
        return;
    }

    // Seçilen hayvanın adını bul
    let selectedPet = window.userPets.find(p => p.id == petId);
    let petName = selectedPet ? selectedPet.name : "Bilinmeyen Hayvan";

    let newApp = {
        petName: petName,
        ownerEmail: loggedInUser.email,
        ownerName: loggedInUser.name,
        vetEmail: window.selectedSlotData.vetEmail, 
        clinicEmail: document.getElementById("bookingClinic").value,
        date: window.selectedSlotData.date,
        time: window.selectedSlotData.time,
        reason: reason,
        notes: reason,
        photo: photo,
        status: "pending", 
        availId: selectedAvailId
    };

    console.log("📡 Randevu Talebi Gönderiliyor...", newApp);

    try {
        let response = await fetch(`${API_BASE_URL}/appointments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newApp)
        });

        if (response.ok) {
            if(typeof showToast === "function") {
                showToast("Randevu talebiniz başarıyla kliniğe iletildi! ✅", "success");
            }
            
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 2000);
        } else {
            if(typeof showToast === "function") {
                showToast("Randevu alınırken bir hata oluştu! Lütfen tekrar deneyin.", "error");
            }
        }
    } catch (error) {
        console.error("Randevu kaydetme hatası:", error);
        if(typeof showToast === "function") {
            showToast("Sunucuya bağlanılamadı. İnternetinizi kontrol edin.", "error");
        }
    }
}

