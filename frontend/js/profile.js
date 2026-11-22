document.addEventListener("DOMContentLoaded", () => {
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        window.location.href = "login.html";
        return;
    }

    //  DİNAMİK ÜST MENÜYÜ OLUŞTUR (Role Göre)
    const nav = document.getElementById("dynamicProfileNav");
    if (nav) {
        let activeStyle = 'style="color: var(--secondary-mavi); font-weight: bold; border-bottom: 2px solid var(--secondary-mavi); padding-bottom: 5px;"';

        if (loggedInUser.role === "admin") {
            nav.innerHTML = `<a href="admin-dashboard.html">Admin Paneli</a> <a href="profile.html" ${activeStyle}>Profilim</a>`;
        } else if (loggedInUser.role === "clinic") {
            nav.innerHTML = `<a href="clinic-dashboard.html">Klinik Paneli</a> <a href="profile.html" ${activeStyle}>Klinik Profili</a>`;
        } else if (loggedInUser.role === "vet") {
            nav.innerHTML = `<a href="vet-dashboard.html">Ana Panel</a> <a href="vet-ajanda.html">Ajandam</a> <a href="vet-hastalar.html">Hastalarım</a> <a href="profile.html" ${activeStyle}>Profilim</a>`;
        } else {
            // Normal Kullanıcı Menüsü
            nav.innerHTML = `
                <a href="dashboard.html">Ana Panel</a> 
                <a href="add-pet.html">Evcil Hayvan Ekle</a> 
                <a href="book-appointment.html">Randevu Al</a> 
                <a href="profile.html" ${activeStyle}>Profilim</a>
            `;
        }
        // Çıkış butonunu herkese ekle
        nav.innerHTML += ` <a href="index.html" onclick="localStorage.removeItem('loggedIn'); localStorage.removeItem('loggedInUser');">Çıkış Yap</a>`;
    }

    //  FORM ALANLARINI DİNAMİK OLARAK ÇİZ
    buildProfileForm(loggedInUser);

    //  KAYDETME (SUBMIT) İŞLEMİ
    const form = document.getElementById("profileForm");
    if (form) {
        form.addEventListener("submit", saveProfileChanges);
    }
});

function buildProfileForm(user) {
    const fieldsDiv = document.getElementById("dynamicFormFields");
    if (!fieldsDiv) return;

    // Ortak Alanlar: E-posta, Şifre ve Telefon!
    let html = `
        <div style="margin-bottom: 15px;">
            <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px; color: #555;">E-posta Adresi (Değiştirilemez)</label>
            <input type="email" value="${user.email}" disabled style="width: 100%; background: #f5f5f5; border: 1px solid #ccc; padding: 10px; border-radius: 5px; color: #888; box-sizing: border-box;">
        </div>
        
        <div style="display: flex; gap: 15px; margin-bottom: 15px;">
            <div style="flex: 1;">
                <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px; color: #555;">Telefon Numarası</label>
                <input type="tel" id="profPhone" value="${user.phone || ''}" maxlength="10" placeholder="Örn: 5555555555" style="width: 100%; border: 1px solid #ccc; padding: 10px; border-radius: 5px; box-sizing: border-box;">            </div>
            <div style="flex: 1;">
                <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px; color: #555;">Yeni Şifre</label>
                <input type="password" id="profPassword" placeholder="Değiştirmek istemiyorsanız boş bırakın" style="width: 100%; border: 1px solid #ccc; padding: 10px; border-radius: 5px; box-sizing: border-box;">
            </div>
        </div>
    `;

    // KLİNİKLER İÇİN
    if (user.role === "clinic") {
        html = `
            <div style="margin-bottom: 15px;">
                <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px; color: var(--secondary-mavi);">Klinik / Poliklinik Adı</label>
                <input type="text" id="profClinicName" value="${user.clinicName || user.name}" required style="width: 100%; border: 1px solid #ccc; padding: 10px; border-radius: 5px; box-sizing: border-box;">
            </div>
        ` + html + `
            <div style="margin-bottom: 15px;">
                <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px; color: var(--secondary-mavi);">Klinik Kapak Fotoğrafı (URL)</label>
                <input type="text" id="profClinicPhoto" value="${user.clinicPhoto || ''}" placeholder="Örn: https://site.com/klinik-dis-cekim.jpg" style="width: 100%; border: 1px solid #ccc; padding: 10px; border-radius: 5px; box-sizing: border-box;">
                <p style="margin: 3px 0 0 0; font-size: 11px; color: gray;">Kliniğinizin dışarıdan veya içeriden şık bir fotoğrafını ekleyin.</p>
            </div>
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                <div style="flex: 1;">
                    <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px; color: #555;">Şehir</label>
                    <input type="text" id="profCity" value="${user.city || ''}" style="width: 100%; border: 1px solid #ccc; padding: 10px; border-radius: 5px; box-sizing: border-box;">
                </div>
                <div style="flex: 1;">
                    <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px; color: #555;">İlçe</label>
                    <input type="text" id="profDistrict" value="${user.district || ''}" style="width: 100%; border: 1px solid #ccc; padding: 10px; border-radius: 5px; box-sizing: border-box;">
                </div>
            </div>
            <div style="display: flex; gap: 15px; margin-bottom: 15px; align-items: center;">
                <div style="flex: 1;">
                    <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px; color: #555;">Yatak Kapasitesi</label>
                    <input type="number" id="profBed" value="${user.bedCapacity || 0}" min="0" style="width: 100%; border: 1px solid #ccc; padding: 10px; border-radius: 5px; box-sizing: border-box;">
                  </div>
                  <div style="flex: 1; margin-top: 25px;">
                    <label style="display: flex; align-items: center; gap: 8px; font-weight: bold; cursor: pointer; color: var(--accent-turuncu);">
                        <input type="checkbox" id="profEmergency" ${user.emergency ? "checked" : ""} style="width: 18px; height: 18px;">
                        7/24 Acil Hizmeti Var
                    </label>
                </div>
            </div>
        `;
    } 
    // VETERİNER HEKİMLER İÇİN
    else if (user.role === "vet") {
        html = `
            <div style="margin-bottom: 15px;">
                <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px; color: var(--secondary-mavi);">Ad Soyad (Ünvan ile)</label>
                <input type="text" id="profName" value="${user.name}" required style="width: 100%; border: 1px solid #ccc; padding: 10px; border-radius: 5px; box-sizing: border-box;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px; color: var(--primary-yesil);">Çalıştığınız Klinik (Değiştirilemez)</label>
                <input type="text" value="${user.clinicEmail}" disabled style="width: 100%; background: #e8f5e9; border: 1px solid #c8e6c9; padding: 10px; border-radius: 5px; color: #2e7d32; font-weight: bold; box-sizing: border-box;">
            </div>
        ` + html + `
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                <div style="flex: 1;">
                    <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px; color: #555;">Deneyim (Yıl)</label>
                    <input type="number" id="profExperience" value="${user.experience || 0}" min="0" style="width: 100%; border: 1px solid #ccc; padding: 10px; border-radius: 5px; box-sizing: border-box;">
                </div>
                <div style="flex: 1;">
                    <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px; color: #555;">Profil Fotoğrafı URL</label>
                    <input type="text" id="profPhoto" value="${user.photo || ''}" placeholder="https://..." style="width: 100%; border: 1px solid #ccc; padding: 10px; border-radius: 5px; box-sizing: border-box;">
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px; color: #555;">Biyografi / Uzmanlık Alanları</label>
                <textarea id="profBio" rows="3" style="width: 100%; border: 1px solid #ccc; padding: 10px; border-radius: 5px; resize: vertical; box-sizing: border-box;">${user.bio || ''}</textarea>
            </div>
        `;
    } 
    // NORMAL KULLANICILAR İÇİN
    else {
        html = `
            <div style="margin-bottom: 15px;">
                <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px; color: var(--secondary-mavi);">Ad Soyad</label>
                <input type="text" id="profName" value="${user.name}" required style="width: 100%; border: 1px solid #ccc; padding: 10px; border-radius: 5px; box-sizing: border-box;">
            </div>
        ` + html + `
            <div style="margin-bottom: 15px;">
                <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px; color: #555;">Profil Fotoğrafı URL</label>
                <input type="text" id="profPhoto" value="${user.photo || ''}" placeholder="https://..." style="width: 100%; border: 1px solid #ccc; padding: 10px; border-radius: 5px; box-sizing: border-box;">
            </div>
        `;
    }

    fieldsDiv.innerHTML = html;
}

async function saveProfileChanges(e) {
    e.preventDefault();
    
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser || !loggedInUser.id) return;

    // Güncellenecek veri objesini oluştur (Mevcut verileri kopyala)
    let updatedUser = { ...loggedInUser };

    let newPass = document.getElementById("profPassword")?.value;
    if (newPass && newPass.trim() !== "") {
        updatedUser.password = newPass;
    }

    let phoneInput = document.getElementById("profPhone");
    if (phoneInput) {
        updatedUser.phone = phoneInput.value;
    }

    // Role Göre Diğer Verileri Topla
    if (loggedInUser.role === "clinic") {
        updatedUser.clinicName = document.getElementById("profClinicName")?.value;
        updatedUser.city = document.getElementById("profCity")?.value;
        updatedUser.district = document.getElementById("profDistrict")?.value;
        updatedUser.bedCapacity = parseInt(document.getElementById("profBed")?.value) || 0;
        updatedUser.emergency = document.getElementById("profEmergency")?.checked;
        updatedUser.clinicPhoto = document.getElementById("profClinicPhoto")?.value;
    } else if (loggedInUser.role === "vet") {
        updatedUser.name = document.getElementById("profName")?.value;
        updatedUser.experience = document.getElementById("profExperience")?.value;
        updatedUser.photo = document.getElementById("profPhoto")?.value;
        updatedUser.bio = document.getElementById("profBio")?.value;
    } else {
        updatedUser.name = document.getElementById("profName")?.value;
        updatedUser.photo = document.getElementById("profPhoto")?.value;
    }

    console.log("📡 Profil güncelleme paketi Java'ya gönderiliyor:", updatedUser);

    try {
        const response = await fetch(`http://localhost:8080/api/users/${loggedInUser.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser)
        });

        if (response.ok) {
            let savedUser = await response.json();
            console.log("✅ Profil başarıyla güncellendi:", savedUser);
            
            localStorage.setItem("loggedInUser", JSON.stringify(savedUser));
            
            if(typeof showToast === "function") {
                showToast("Profil bilgileriniz başarıyla güncellendi!", "success");
            }
        } else {
            throw new Error("Sunucu güncellemeyi reddetti.");
        }
    } catch (error) {
        console.error("❌ Profil güncelleme hatası:", error);
      
        if(typeof showToast === "function") {
            showToast("Profil güncellenemedi! Sunucu bağlantısını kontrol edin.", "error");
        }
    }
}