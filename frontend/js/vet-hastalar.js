const API_BASE_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    
    if (!loggedInUser || loggedInUser.role !== "vet") {
        window.location.href = "login.html";
        return;
    }

    // ÜST MENÜYÜ OLUŞTUR
    const nav = document.getElementById("vetNav") || document.getElementById("dynamicNav");
    if (nav) {
        nav.innerHTML = `
            <a href="vet-dashboard.html">Ana Panel</a>
            <a href="vet-ajanda.html">Ajandam</a>
            <a href="vet-hastalar.html" style="color: var(--secondary-mavi); font-weight: bold; border-bottom: 2px solid var(--secondary-mavi); padding-bottom: 5px;">Hastalarım</a>
            <a href="profile.html">Profilim</a>
            <a href="login.html" onclick="localStorage.removeItem('loggedIn'); localStorage.removeItem('loggedInUser');">Çıkış Yap</a>
        `;
    }

    loadAllPetsForVet();

    const editForm = document.getElementById("editPetForm");
    if (editForm) editForm.addEventListener("submit", savePetChanges);
});

// Verileri globalde tutalım ki güncellerken tekrar API'ye gitmeden modeli bulabilelim
window.allSystemPets = [];
window.allSystemUsers = [];

//  MÜŞTERİ (HASTA SAHİBİ) KARTLARINI OLUŞTUR
async function loadAllPetsForVet() {
    const grid = document.getElementById("vet-pet-grid");
    if (!grid) return;
    
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    
    grid.style.display = "block"; 
    grid.innerHTML = '<p style="text-align: center; color: gray;">Hasta kayıtları MariaDB\'den getiriliyor... ⏳</p>';

    try {
        console.log("📡 Hastalar ve Randevular çekiliyor...");
        let [resApps, resPets, resUsers] = await Promise.all([
            fetch(`${API_BASE_URL}/appointments/vet/${loggedInUser.email}`),
            fetch(`${API_BASE_URL}/pets`), 
            fetch(`${API_BASE_URL}/users`)
        ]);

        let appointments = await resApps.json();
        window.allSystemPets = await resPets.json();
        window.allSystemUsers = await resUsers.json();

        let myApprovedApps = appointments.filter(app => app.status === "approved");
        
        let authorizedPetIdentifiers = [...new Set(myApprovedApps.map(app => app.petId || app.petName))]; 
        
        let authorizedPets = window.allSystemPets.filter(pet => {
            return authorizedPetIdentifiers.includes(pet.id.toString()) || authorizedPetIdentifiers.includes(pet.name);
        });
        
        //  Bu hastaların sahiplerinin e-postalarını topla
        let ownerEmails = [...new Set(authorizedPets.map(pet => pet.ownerEmail))];

        grid.innerHTML = "";
        
        if (ownerEmails.length === 0) {
            grid.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary); background: #f9f9f9; border-radius: 10px; border: 1px dashed #ccc;">
                    <p>Şu an dosyasını görüntüleyebileceğiniz onaylanmış bir hastanız bulunmuyor.</p>
                </div>`;
            return;
        }
        
        ownerEmails.forEach(email => {
            let owner = window.allSystemUsers.find(u => u.email === email);
            if (!owner) return;

            let ownerPhoto = owner.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
            let ownerPhone = owner.phone || "Belirtilmemiş";
            let ownerPets = authorizedPets.filter(p => p.ownerEmail === email);

            // --- EVCİL HAYVANLAR LİSTESİ HTML'İ ---
            let petsHTML = "";
            ownerPets.forEach(pet => {
                let typeText = pet.type === "cat" ? "Kedi 🐱" : "Köpek 🐶";
                let currentId = pet.id;
                let displayPhoto = pet.photo || (pet.type === "cat" ? "https://cdn-icons-png.flaticon.com/512/1864/1864514.png" : "https://cdn-icons-png.flaticon.com/512/93/93944.png");
                
                let displayAge = (typeof formatPetAge === "function") ? formatPetAge(pet.age) : (pet.age ? pet.age + " Haftalık" : "Belirtilmemiş");

                petsHTML += `
                    <div style="background: #fff; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                        
                        <div style="display: flex; align-items: center; gap: 15px; flex: 1; min-width: 280px;">
                            <img src="${displayPhoto}" alt="${pet.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-yesil); flex-shrink: 0;">
                            <div>
                                <h4 style="margin: 0 0 8px 0; color: var(--secondary-mavi); font-size: 16px;">${pet.name}</h4>
                                
                                <div style="font-size: 12px; color: #475569; display: flex; flex-wrap: wrap; gap: 8px;">
                                    <span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; border: 1px solid #e2e8f0;"><b>Tür:</b> ${typeText}</span>
                                    <span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; border: 1px solid #e2e8f0;"><b>Cins:</b> ${pet.breed || "-"}</span>
                                    <span style="background: #fff1f2; padding: 4px 8px; border-radius: 4px; border: 1px solid #fecdd3; color: #e11d48;"><b>Yaş:</b> ${displayAge}</span>
                                </div>
                            </div>
                        </div>

                        <button onclick="openEditModal(${currentId})" style="background: #fff; color: var(--accent-turuncu); border: 1px solid var(--accent-turuncu); padding: 8px 25px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold; transition: 0.2s; white-space: nowrap; height: fit-content;" onmouseover="this.style.background='var(--accent-turuncu)'; this.style.color='white';" onmouseout="this.style.background='#fff'; this.style.color='var(--accent-turuncu)';">
                            ⚙️ Güncelle
                        </button>
                    </div>
                `;
            });

            // --- MÜŞTERİ (SAHİP) KARTI HTML ---
            let safeEmailId = email.replace(/[@.]/g, "-"); 
            
            grid.innerHTML += `
                <div style="background: #fff; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; border-left: 5px solid var(--primary-yesil);">
                    
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <img src="${ownerPhoto}" style="width: 75px; height: 75px; border-radius: 50%; object-fit: cover; border: 3px solid #f1f5f9; flex-shrink: 0;">
                        <div style="flex: 1;">
                            <h3 style="margin: 0; color: var(--secondary-mavi); font-size: 19px;">👤 ${owner.name}</h3>
                            <div style="display: flex; gap: 15px; margin-top: 10px; flex-wrap: wrap;">
                                <span style="font-size: 13px; color: #64748b; background: #f8fafc; padding: 5px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">✉️ ${owner.email}</span>
                                <span style="font-size: 13px; color: #64748b; background: #f8fafc; padding: 5px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">📞 ${ownerPhone}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 25px;">
                        <button onclick="toggleOwnerPets('${safeEmailId}')" style="width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; color: var(--secondary-mavi); font-weight: bold; padding: 14px 18px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 14px; transition: background 0.2s;">
                            <span>🐾 Evcil Hayvanları (${ownerPets.length})</span>
                            <span id="icon-${safeEmailId}">▼</span>
                        </button>
                        
                        <div id="pets-list-${safeEmailId}" style="display: none; margin-top: 12px;">
                            ${petsHTML}
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Hastalar yüklenirken hata oluştu:", error);
        grid.innerHTML = `<p style="color: red; text-align: center;">Hasta verileri sunucudan alınamadı.</p>`;
    }
}

//  ACCORDION (AÇ/KAPA) FONKSİYONU
function toggleOwnerPets(safeEmailId) {
    let listDiv = document.getElementById(`pets-list-${safeEmailId}`);
    let iconSpan = document.getElementById(`icon-${safeEmailId}`);
    
    if (listDiv.style.display === "none") {
        listDiv.style.display = "block";
        iconSpan.innerText = "▲";
    } else {
        listDiv.style.display = "none";
        iconSpan.innerText = "▼";
    }
}

//  AŞILARI VE DETAYLARI GİZLİ PENCEREDE (MODAL) AÇ
function openEditModal(petId) {
    let pet = window.allSystemPets.find(p => p.id == petId);
    if (!pet) return;

    document.getElementById("editPetId").value = petId;
    document.getElementById("editPetType").value = pet.type;
    document.getElementById("editModalTitle").innerText = `🐾 ${pet.name} - Hasta Dosyası`;
    document.getElementById("editAge").value = pet.age || "";
    document.getElementById("editBreed").value = pet.breed || "";
    
    // Aşıları Oluştur
    const vaccinesContainer = document.getElementById("editVaccinesContainer");
    vaccinesContainer.innerHTML = ""; 
    let vaccineNames = pet.type === "cat" ? ["Karma", "Kuduz", "Lösemi (FeLV)", "İç/Dış Parazit"] : ["Kuduz", "Karma", "İç/Dış Parazit", "Bronşin", "Corona", "Lyme"];
    
    // Java'dan aşılar JSON string olarak geliyorsa parse et, yoksa boş obje yap
    let safeVaccines = {};
    if (pet.vaccines) {
        try {
            safeVaccines = typeof pet.vaccines === "string" ? JSON.parse(pet.vaccines) : pet.vaccines;
        } catch(e) { console.error("Aşılar parse edilemedi"); }
    }

    let today = new Date().toISOString().split('T')[0];

    vaccineNames.forEach(vName => {
        let oldDate = safeVaccines[vName] || "";
        vaccinesContainer.innerHTML += `
            <div style="margin-bottom: 10px;">
                <label style="font-size: 13px; font-weight: bold; display: block; margin-bottom: 3px;">${vName}</label>
                <input type="date" id="vac_${vName.replace(/[^a-zA-Z0-9]/g, '_')}" value="${oldDate}" max="${today}" min="2000-01-01" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
            </div>
        `;
    });

    document.getElementById("editModal").classList.add("show");
}

function closeEditModal() { 
    document.getElementById("editModal").classList.remove("show"); 
}

// DEĞİŞİKLİKLERİ JAVA ÜZERİNDEN VERİTABANINA KAYDET
async function savePetChanges(e) {
    e.preventDefault();
    let petId = document.getElementById("editPetId").value;
    let petType = document.getElementById("editPetType").value;
    
    let pet = window.allSystemPets.find(p => p.id == petId);
    if (!pet) return;

    // Güncellenecek alanları mevcut hayvan objesine ekle
    let updatedPet = { ...pet };
    updatedPet.age = document.getElementById("editAge").value;
    updatedPet.breed = document.getElementById("editBreed").value;
    
    // Aşıları topla
    let updatedVaccinesObj = {};
    let vaccineNames = petType === "cat" ? ["Karma", "Kuduz", "Lösemi (FeLV)", "İç/Dış Parazit"] : ["Kuduz", "Karma", "İç/Dış Parazit", "Bronşin", "Corona", "Lyme"];
    
    vaccineNames.forEach(vName => { 
        let safeId = vName.replace(/[^a-zA-Z0-9]/g, '_');
        let dateVal = document.getElementById(`vac_${safeId}`).value; 
        if (dateVal) updatedVaccinesObj[vName] = dateVal; 
    });
    
    // Aşıları Java'ya String JSON olarak yolluyoruz (Eğer DB'de String tutuluyorsa)
    updatedPet.vaccines = JSON.stringify(updatedVaccinesObj);

    console.log("📡 Hasta güncelleniyor...", updatedPet);

    try {
        let response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedPet)
        });

       if (response.ok) {
            closeEditModal();
            if(typeof showToast === "function") showToast("Hasta bilgileri ve aşı takvimi başarıyla güncellendi! ✅", "success");
            loadAllPetsForVet(); 
        } else {
            console.error("❌ Güncelleme hatası: Sunucu başarısız yanıt döndü.");
            if(typeof showToast === "function") {
                showToast("Hasta bilgileri güncellenirken hata oluştu!", "error");
            }
        }
    } catch (error) {
        console.error("Güncelleme hatası:", error);
    }
}

function formatPetAge(weeks) {
    if (!weeks) return "Belirtilmemiş";
    let w = parseInt(weeks);
    
    if (w < 4) {
        return w + " Haftalık";
    } else if (w < 52) {
        let months = Math.floor(w / 4.33); 
        return months + " Aylık";
    } else {
        let years = Math.floor(w / 52);
        let remainingMonths = Math.floor((w % 52) / 4.33);
        
        if (remainingMonths > 0) {
            return years + " Yaş, " + remainingMonths + " Aylık";
        }
        return years + " Yaşında";
    }
}