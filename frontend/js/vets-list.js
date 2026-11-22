const API_BASE_URL = "http://localhost:8080/api";

const locations = {
    "İstanbul": ["Adalar","Arnavutköy","Ataşehir","Avcılar","Bağcılar","Bahçelievler","Bakırköy","Başakşehir","Bayrampaşa","Beşiktaş","Beykoz","Beylikdüzü","Beyoğlu","Büyükçekmece","Çatalca","Çekmeköy","Esenler","Esenyurt","Eyüpsultan","Fatih","Gaziosmanpaşa","Güngören","Kadıköy","Kağıthane","Kartal","Küçükçekmece","Maltepe","Pendik","Sancaktepe","Sarıyer","Silivri","Sultanbeyli","Sultangazi","Şile","Şişli","Tuzla","Ümraniye","Üsküdar","Zeytinburnu"],
    "Ankara": ["Akyurt","Altındağ","Ayaş","Bala","Beypazarı","Çamlıdere","Çankaya","Çubuk","Elmadağ","Etimesgut","Evren","Gölbaşı","Güdül","Haymana","Kahramankazan","Kalecik","Keçiören","Kızılcahamam","Mamak","Nallıhan","Polatlı","Pursaklar","Sincan","Şereflikoçhisar","Yenimahalle"],
    "İzmir": ["Aliağa","Balçova","Bayındır","Bayraklı","Bergama","Beydağ","Bornova","Buca","Çeşme","Çiğli","Dikili","Foça","Gaziemir","Güzelbahçe","Karabağlar","Karaburun","Karşıyaka","Kemalpaşa","Kınık","Kiraz","Konak","Menderes","Menemen","Narlıdere","Ödemiş","Seferihisar","Selçuk","Tire","Torbalı","Urla"],
    "Bursa": ["Büyükorhan","Gemlik","Gürsu","Harmancık","İnegöl","İznik","Karacabey","Keles","Kestel","Mudanya","Mustafakemalpaşa","Nilüfer","Orhaneli","Orhangazi","Osmangazi","Yenişehir","Yıldırım"],
    "Antalya": ["Akseki","Aksu","Alanya","Demre","Döşemealtı","Elmalı","Finike","Gazipaşa","Gündoğmuş","İbradı","Kaş","Kemer","Kepez","Konyaaltı","Korkuteli","Kumluca","Manavgat","Muratpaşa","Serik"]
};

window.allUsersCache = [];
window.allAppointmentsCache = [];
window.clinicSortOrder = [];

async function setClinicSort() {
    const mode = document.getElementById("clinicSortMode")?.value || "name";
    try {
        const response = await fetch(`${API_BASE_URL}/clinics/sort-order?by=${encodeURIComponent(mode)}`);
        if (!response.ok) throw new Error("Sıralama API hatası");
        window.clinicSortOrder = await response.json();
    } catch (error) {
        console.warn("Klinik sıralaması alınamadı; eski sıra kullanılacak.", error);
        window.clinicSortOrder = [];
    }
    renderClinics();
}
 

// ŞEHİR SEÇİLİNCE İLÇELERİ GETİR
function updateFilterDistricts() {
    const city = document.getElementById("filterCity").value;
    const distSelect = document.getElementById("filterDistrict");
    
    distSelect.innerHTML = '<option value="all">-- Tüm İlçeler --</option>';
    
    if(city !== "all" && city !== "") {
        locations[city].forEach(d => {
            distSelect.innerHTML += `<option value="${d}">${d}</option>`;
        });
        distSelect.disabled = false;
        distSelect.style.background = "#f9f9f9";
    } else {
        distSelect.disabled = true;
        distSelect.style.background = "#eee";
    }
    
    renderClinics();
}

// SAYFA YÜKLENDİĞİNDE VERİLERİ API'DEN ÇEK
document.addEventListener("DOMContentLoaded", async () => {
    try {
        console.log("📡 Klinik, Hekim ve Randevu verileri MariaDB'den çekiliyor...");
        
        let response = await fetch(`${API_BASE_URL}/users`);
        window.allUsersCache = await response.json();
        
        let appResponse = await fetch(`${API_BASE_URL}/appointments`);
        window.allAppointmentsCache = await appResponse.json();
        
        await setClinicSort();
    } catch (error) {
        console.error("Klinikler yüklenirken hata oluştu:", error);
        document.getElementById("clinics-grid").innerHTML = `<p style="color: red; text-align: center; width: 100%;">Sunucu bağlantısı sağlanamadı. Lütfen daha sonra tekrar deneyin.</p>`;
    }
});

// KLİNİKLERİ LİSTELEME ANA FONKSİYONU
function renderClinics() {
    const grid = document.getElementById("clinics-grid");
    if (!grid) return;

    let selectedCity = document.getElementById("filterCity") ? document.getElementById("filterCity").value : "all";
    let selectedDistrict = document.getElementById("filterDistrict") ? document.getElementById("filterDistrict").value : "all";
    let requireBeds = document.getElementById("filterBeds") ? document.getElementById("filterBeds").checked : false;
    let requireEmergency = document.getElementById("filterEmergency") ? document.getElementById("filterEmergency").checked : false;

    let approvedClinics = window.allUsersCache.filter(u => u.role === "clinic" && u.status === "approved");

    if (selectedCity !== "all") approvedClinics = approvedClinics.filter(c => c.city === selectedCity);
    if (selectedDistrict !== "all") approvedClinics = approvedClinics.filter(c => c.district === selectedDistrict);
    if (requireBeds) approvedClinics = approvedClinics.filter(c => parseInt(c.bedCapacity || 0) > 0); 
    if (requireEmergency) approvedClinics = approvedClinics.filter(c => c.emergency === true);

    if (window.clinicSortOrder?.length) {
        const order = new Map(window.clinicSortOrder.map((email, index) => [email, index]));
        approvedClinics.sort((a, b) => (order.get(a.email) ?? Infinity) - (order.get(b.email) ?? Infinity));
    }

    grid.innerHTML = "";

    if (approvedClinics.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: 12px; border: 1px dashed #ccc; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
                <p style="color: var(--text-secondary); font-size: 16px;">Seçtiğiniz kriterlere uygun anlaşmalı kliniğimiz bulunmuyor.</p>
                <button onclick="document.getElementById('filterCity').value='all'; updateFilterDistricts();" style="margin-top: 15px; padding: 10px 20px; background: var(--secondary-mavi); color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer;">Filtreyi Temizle</button>
            </div>
        `;
        return;
    }

    approvedClinics.forEach(clinic => {
        let emergencyBadge = clinic.emergency ? `<span style="background: var(--accent-turuncu); color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; margin-left: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">🚨 7/24 Acil</span>` : '';
        let clinicName = clinic.clinicName || clinic.name;
        
        let defaultClinicPhoto = "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80";
        let displayPhoto = clinic.clinicPhoto ? clinic.clinicPhoto : defaultClinicPhoto;
        
        let clinicVets = window.allUsersCache.filter(u => u.role === "vet" && u.clinicEmail === clinic.email && u.status === "approved");
        let vetEmails = clinicVets.map(v => v.email);

        let clinicReviews = window.allAppointmentsCache.filter(app => 
            vetEmails.includes(app.vetEmail) && app.rating && app.rating > 0
        );

        let ratingDisplay = "⭐ Henüz Puanlanmamış";
        if (clinicReviews.length > 0) {
            let totalScore = clinicReviews.reduce((sum, app) => sum + app.rating, 0);
            let avgScore = (totalScore / clinicReviews.length).toFixed(1);
            ratingDisplay = `⭐ ${avgScore} / 5 (${clinicReviews.length} Değerlendirme)`;
        }

        let vetsHTML = '';
        if (clinicVets.length === 0) {
            vetsHTML = `<p style="color: gray; font-size: 13px; text-align: center; margin: 15px 0;">Bu klinikte henüz onaylı hekim bulunmuyor.</p>`;
        } else {
            clinicVets.forEach(vet => {
                let defaultPhoto = "https://cdn-icons-png.flaticon.com/512/2810/2810488.png";
                vetsHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${vet.photo || defaultPhoto}" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 1px solid #ddd;">
                            <span style="font-weight: bold; color: #444; font-size: 14px;">Dt. ${vet.name}</span>
                        </div>
                        <button onclick="openVetModal('${vet.email}', '${clinicName}')" style="background: white; border: 1px solid var(--primary-yesil); color: var(--primary-yesil); padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='var(--primary-yesil)'; this.style.color='white';" onmouseout="this.style.background='white'; this.style.color='var(--primary-yesil)';">Profili İncele</button>
                    </div>
                `;
            });
        }

        // YENİ: KLİNİK GENEL YORUMLARI HTML (İSİM GİZLİLİĞİ İLE BİRLİKTE)
        let reviewsHTML = '';
        if (clinicReviews.length === 0) {
            reviewsHTML = `<p style="color: gray; font-size: 13px; text-align: center; margin: 15px 0;">Bu klinik için henüz yorum yapılmamış.</p>`;
        } else {
            clinicReviews.forEach(rev => {
                let stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
                
                // --- KULLANICI GİZLİLİĞİ: Sadece ilk ismi alıyoruz ---
                let firstName = rev.ownerName ? rev.ownerName.split(' ')[0] + " " + (rev.ownerName.split(' ')[1] ? rev.ownerName.split(' ')[1].charAt(0) + "." : "") : "Gizli Kullanıcı";

                reviewsHTML += `
                    <div style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: left;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #FFD700; font-size: 13px; font-weight: bold;">${stars}</span>
                            <span style="font-size: 11px; color: var(--secondary-mavi); font-weight: bold; background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">👤 ${firstName}</span>
                        </div>
                        <p style="margin: 5px 0; font-size: 13px; color: #555; font-style: italic;">"${rev.reviewText || 'Sadece puan bırakıldı.'}"</p>
                        <span style="font-size: 11px; color: #999; display: block; text-align: right;">🐾 ${rev.petName}</span>
                    </div>
                `;
            });
        }

        let safeId = clinic.email.replace(/[@.]/g, "-");

        grid.innerHTML += `
            <div style="background: white; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); border: 1px solid #eaeaea; display: flex; flex-direction: column; overflow: hidden; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                
                <div style="position: relative; height: 180px; width: 100%;">
                    <img src="${displayPhoto}" style="width: 100%; height: 100%; object-fit: cover; border-bottom: 4px solid var(--primary-yesil);">
                    <div style="position: absolute; top: 15px; right: 15px;">
                        ${emergencyBadge}
                    </div>
                </div>
                
                <div style="background: #fffde7; padding: 10px 20px; border-bottom: 1px solid #eaeaea; font-weight: bold; color: #e65100; font-size: 14px; display: flex; align-items: center; gap: 5px;">
                    ${ratingDisplay}
                </div>
                
                <div style="padding: 20px; display: flex; flex-direction: column; flex-grow: 1;">
                    <h3 style="color: var(--secondary-mavi); margin-top: 0; font-size: 20px; display: flex; align-items: center; justify-content: space-between;">
                        <span>🏥 ${clinicName}</span>
                    </h3>
                    
                    <p style="margin: 5px 0; font-size: 14px; color: #555;"><b>📍 Konum:</b> ${clinic.city}, ${clinic.district}</p>
                    <p style="margin: 5px 0; font-size: 14px; color: ${clinic.bedCapacity > 0 ? 'var(--primary-yesil)' : '#E53935'}; font-weight: bold;">🛏️ Yatak Kapasitesi: ${clinic.bedCapacity || 0}</p>
                    
                    <div style="margin-top: auto; padding-top: 20px;">
                        <div style="display: flex; gap: 10px;">
                            <button onclick="toggleVetsList('${clinic.email}')" style="flex: 1; background: #f0f4f8; border: none; color: var(--secondary-mavi); font-weight: bold; padding: 12px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                                <span>👨‍⚕️ Hekimler (${clinicVets.length})</span>
                                <span id="icon-${safeId}">▼</span>
                            </button>
                            
                            <button onclick="toggleReviewsList('${clinic.email}')" style="flex: 1; background: #fff3e0; border: none; color: #e65100; font-weight: bold; padding: 12px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                                <span>💬 Yorumlar (${clinicReviews.length})</span>
                                <span id="rev-icon-${safeId}">▼</span>
                            </button>
                        </div>
                        
                        <div id="vets-list-${safeId}" style="display: none; margin-top: 10px; background: #fafafa; padding: 0 15px; border-radius: 8px; border: 1px solid #eee;">
                            ${vetsHTML}
                        </div>

                        <div id="reviews-list-${safeId}" style="display: none; margin-top: 10px; background: #fafafa; padding: 0 15px; border-radius: 8px; border: 1px solid #eee; max-height: 200px; overflow-y: auto;">
                            ${reviewsHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

// VETERİNER LİSTESİNİ AÇ / KAPAT (ACCORDION)
function toggleVetsList(clinicEmail) {
    let safeId = clinicEmail.replace(/[@.]/g, "-");
    let listDiv = document.getElementById(`vets-list-${safeId}`);
    let iconSpan = document.getElementById(`icon-${safeId}`);
    
    let revDiv = document.getElementById(`reviews-list-${safeId}`);
    let revIcon = document.getElementById(`rev-icon-${safeId}`);
    if(revDiv) { revDiv.style.display = "none"; revIcon.innerText = "▼"; }

    if (listDiv.style.display === "none") {
        listDiv.style.display = "block";
        iconSpan.innerText = "▲";
    } else {
        listDiv.style.display = "none";
        iconSpan.innerText = "▼";
    }
}

// KLİNİK YORUMLARINI AÇ / KAPAT (ACCORDION)
function toggleReviewsList(clinicEmail) {
    let safeId = clinicEmail.replace(/[@.]/g, "-");
    let listDiv = document.getElementById(`reviews-list-${safeId}`);
    let iconSpan = document.getElementById(`rev-icon-${safeId}`);
    
    let vetDiv = document.getElementById(`vets-list-${safeId}`);
    let vetIcon = document.getElementById(`icon-${safeId}`);
    if(vetDiv) { vetDiv.style.display = "none"; vetIcon.innerText = "▼"; }

    if (listDiv.style.display === "none") {
        listDiv.style.display = "block";
        iconSpan.innerText = "▲";
    } else {
        listDiv.style.display = "none";
        iconSpan.innerText = "▼";
    }
}

// VETERİNER DETAY (POP-UP) İŞLEMLERİ
function openVetModal(vetEmail, clinicName) {
    let vet = window.allUsersCache.find(u => u.email === vetEmail && u.role === "vet");
    
    if (!vet) return;

    let defaultPhoto = "https://cdn-icons-png.flaticon.com/512/2810/2810488.png";
    document.getElementById("modalVetPhoto").src = vet.photo || defaultPhoto;
    document.getElementById("modalVetName").innerText = `Dt. ${vet.name}`;
    document.getElementById("modalVetClinic").innerText = `🏥 ${clinicName}`;
    document.getElementById("modalVetExperience").innerText = vet.experience || "0";
    document.getElementById("modalVetBio").innerText = vet.bio || "Bu veteriner hekimimiz henüz bir biyografi eklememiş.";

    let modal = document.getElementById("vetDetailModal");
    modal.style.display = "flex";
}

function closeVetModal() {
    document.getElementById("vetDetailModal").style.display = "none";
}

window.onclick = function(event) {
    let modal = document.getElementById("vetDetailModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
}