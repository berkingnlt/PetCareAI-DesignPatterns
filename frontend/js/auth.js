

// Kayıt formunda rol seçimine göre alanları gizle/göster
function toggleFields() {
    let roleSelect = document.getElementById("role") || document.getElementById("regRole");
    if (!roleSelect) return;
    
    let role = roleSelect.value;
    let vetFields = document.getElementById("vetFields");
    let clinicFields = document.getElementById("clinicFields");
    
    if(vetFields) vetFields.style.display = role === "vet" ? "block" : "none";
    if(clinicFields) clinicFields.style.display = role === "clinic" ? "block" : "none";
}

const locations = {
    "İstanbul": ["Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Bakırköy", "Maltepe"],
    "Ankara": ["Çankaya", "Keçiören", "Yenimahalle", "Etimesgut", "Mamak"],
    "İzmir": ["Bornova", "Karşıyaka", "Konak", "Buca", "Çiğli"],
    "Antalya": ["Alanya", "Muratpaşa", "Kepez", "Konyaaltı", "Manavgat"],
    "Bursa": ["Nilüfer", "Osmangazi", "Yıldırım", "Mudanya", "Gemlik"]
};

function updateRegisterDistricts() {
    const city = document.getElementById("clinicCity").value;
    const distSelect = document.getElementById("clinicDistrict");
    if(!distSelect) return;
    
    distSelect.innerHTML = '<option value="">-- İlçe Seçin --</option>';
    if(city && locations[city]) {
        locations[city].forEach(d => {
            distSelect.innerHTML += `<option value="${d}">${d}</option>`;
        });
        distSelect.disabled = false;
    } else {
        distSelect.disabled = true;
    }
}

// ANA MOTOR 
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const API_BASE_URL = "http://localhost:8080/api";

    //  KLİNİK LİSTESİNİ DOLDUR 
    async function populateClinicDropdown() {
        let select = document.getElementById("vetClinicSelect");
        if(!select) return;

        try {
            let response = await fetch(`${API_BASE_URL}/users`);
            let users = await response.json();
            let approvedClinics = users.filter(u => u.role === "clinic" && u.status === "approved");

            select.innerHTML = '<option value="">-- Lütfen Çalışacağınız Kliniği Seçin --</option>';
            approvedClinics.forEach(clinic => {
                select.innerHTML += `<option value="${clinic.email}">${clinic.clinicName} (${clinic.city}/${clinic.district})</option>`;
            });
        } catch (error) {
            console.error("Klinik listesi yüklenemedi:", error);
        }
    }
    
    if(document.getElementById("vetClinicSelect")) populateClinicDropdown();

    // KAYIT OLMA 
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => { 
            e.preventDefault();
            console.log("🚀 1. Adım: Kayıt formu yakalandı...");
            
            try {
                let name = document.getElementById("regName").value;
                let email = document.getElementById("regEmail").value;
                let password = document.getElementById("regPassword").value;
                let phoneInput = document.getElementById("regPhone") || document.getElementById("phone"); 
                let phone = phoneInput ? phoneInput.value : "";
                let roleInput = document.getElementById("role") || document.getElementById("regRole");
                let role = roleInput.value;

                console.log("📝 2. Adım: Veriler okundu:", { name, email, role });

                let newUser = { 
                    name: name, email: email, phone: phone,
                    password: password, role: role,
                    photo: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                };

                if (role === "clinic") {
                    newUser.status = "pending";
                    newUser.clinicName = document.getElementById("clinicName").value || name;
                    newUser.city = document.getElementById("clinicCity").value || "Belirtilmemiş";
                    newUser.district = document.getElementById("clinicDistrict").value || "Belirtilmemiş";
                    newUser.bedCapacity = parseInt(document.getElementById("clinicBedCapacity").value) || 0;
                    newUser.availableBeds = newUser.bedCapacity;
                    newUser.emergency = document.getElementById("clinicEmergency").checked;
                } else if (role === "vet") {
                    newUser.status = "pending_clinic_approval";
                    newUser.experience = document.getElementById("vetExperience").value || "0";
                    newUser.clinicEmail = document.getElementById("vetClinicSelect").value;
                    if(!newUser.clinicEmail) {
                        if(typeof showToast === "function") showToast("Lütfen bir klinik seçin!", "error");
                        return;
                    }
                    newUser.bio = document.getElementById("vetBio")?.value || "Biyografi yok.";
                } else {
                    newUser.status = "approved";
                }

                console.log("📡 3. Adım: Java'ya gönderiliyor...");
                
                let response = await fetch(`${API_BASE_URL}/users/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newUser)
                });

                 if (response.ok) {
                    console.log("✅ 4. Adım: Kayıt başarılı!");
                    
                    if(typeof showToast === "function") {
                        showToast("Kayıt Başarılı! Giriş sayfasına yönlendiriliyorsunuz... ✅", "success");
                    }
                    
                    setTimeout(() => { window.location.href = "login.html"; }, 2000);
                } else {
                    throw new Error("Sunucu hatası: " + response.status);
                }
            } catch (error) {
                console.error("🚨 HATA:", error);
                
                if(typeof showToast === "function") {
                    showToast("Bağlantı hatası! Lütfen internetinizi kontrol edin.", "error");
                }
            }
        });
    }

    // GİRİŞ YAPMA
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("🔑 1. Adım: Giriş denemesi...");
            
            let email = document.getElementById("loginEmail").value;
            let password = document.getElementById("loginPassword").value;

            try {
                let response = await fetch(`${API_BASE_URL}/users/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email, password: password })
                });

                if (response.ok) {
                    let user = await response.json();
                    console.log("✅ 2. Adım: Giriş başarılı!", user);

                    if (user.role === "clinic" && user.status === "pending") {
                        if(typeof showToast === "function") showToast("Klinik onay bekliyor.", "error");
                        return;
                    }
                    if (user.role === "vet" && user.status === "pending_clinic_approval") {
                        if(typeof showToast === "function") showToast("Klinik onayı bekliyor.", "error");
                        return;
                    }

                    localStorage.setItem("loggedInUser", JSON.stringify(user));
                    localStorage.setItem("loggedIn", "true");
                    
                    if(typeof showToast === "function") showToast(`Hoş geldin ${user.name}`, "success");

                    setTimeout(() => {
                        if (user.role === "admin") window.location.href = "admin-dashboard.html";
                        else if (user.role === "clinic") window.location.href = "clinic-dashboard.html";
                        else if (user.role === "vet") window.location.href = "vet-dashboard.html"; 
                        else window.location.href = "dashboard.html";
                    }, 2000);
                } else {
                    if(typeof showToast === "function") showToast("Hatalı e-posta veya şifre!", "error");
                }
            } catch (error) {
                console.error("🚨 HATA:", error);
                if(typeof showToast === "function") showToast("Sunucu kapalı!", "error");
            }
        });
    }

    function setupPasswordToggle(inputId, toggleId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        if (!input || !toggle) return;
        const show = () => input.type = "text";
        const hide = () => input.type = "password";
        toggle.addEventListener("mousedown", show);
        toggle.addEventListener("mouseup", hide);
        toggle.addEventListener("mouseleave", hide);
        toggle.addEventListener("touchstart", show);
        toggle.addEventListener("touchend", hide);
    }
    setupPasswordToggle("loginPassword", "toggleLoginPassword");
    setupPasswordToggle("regPassword", "toggleRegPassword");
});