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
            <a href="vet-ajanda.html" style="color: var(--secondary-mavi); font-weight: bold; border-bottom: 2px solid var(--secondary-mavi); padding-bottom: 5px;">Ajandam</a>
            <a href="vet-hastalar.html">Hastalarım</a>
            <a href="profile.html">Profilim</a>
            <a href="login.html" onclick="localStorage.removeItem('loggedIn'); localStorage.removeItem('loggedInUser');">Çıkış Yap</a>
        `;
    }

    loadAgenda(loggedInUser.email);
});

async function loadAgenda(vetEmail) {
    let agendaDiv = document.getElementById("agenda-list");
    if (!agendaDiv) return;

    agendaDiv.style.display = "grid";
    agendaDiv.style.gridTemplateColumns = "repeat(auto-fill, minmax(320px, 1fr))"; 
    agendaDiv.style.gap = "20px"; 
    agendaDiv.style.alignItems = "start"; 
    agendaDiv.style.background = "transparent"; 
    agendaDiv.style.boxShadow = "none";
    agendaDiv.style.padding = "0";
    agendaDiv.style.maxWidth = "100%"; 

    agendaDiv.innerHTML = '<p style="text-align: center; width: 100%; color: gray;">Ajandanız yükleniyor... ⏳</p>';

    try {
        console.log("📡 Ajanda verileri MariaDB'den çekiliyor...");
        let response = await fetch(`${API_BASE_URL}/appointments/vet/${vetEmail}`);
        let appointments = await response.json();

        //  BUGÜNÜN TARİHİNİ HESAPLA
        let d = new Date();
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        let year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        let today = [year, month, day].join('-'); 

        //  FİLTRELEME (Bugün HARİÇ, Reddedilenler HARİÇ)
        let myAppointments = appointments.filter(a => a.status !== "rejected" && a.date !== today);

        if (myAppointments.length === 0) {
            agendaDiv.style.display = "block"; 
            agendaDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary); background: #f9f9f9; border-radius: 10px; border: 1px dashed #ccc;">
                    <h3 style="margin-top: 0;">🗓️ Ajandanız Bomboş</h3>
                    <p>Sistemde kayıtlı geçmiş veya gelecek hiçbir randevunuz bulunmuyor.</p>
                </div>`;
            return;
        }

        //  SIRALAMA VE GRUPLAMA
        myAppointments.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
        
        let groupedAppointments = {};
        myAppointments.forEach(app => {
            if (!groupedAppointments[app.date]) {
                groupedAppointments[app.date] = [];
            }
            groupedAppointments[app.date].push(app);
        });

        agendaDiv.innerHTML = ""; // Temizle

        //  KOMPAKT KARTLARI EKRANA BAS
        for (const [dateString, appsOfDay] of Object.entries(groupedAppointments)) {
            
            let dateObj = new Date(dateString);
            let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            let fancyDate = dateObj.toLocaleDateString('tr-TR', options);

            let isPastDate = dateString < today;
            let cardOpacity = isPastDate ? "opacity: 0.7; filter: grayscale(30%);" : "opacity: 1;";
            let headerColor = isPastDate ? "#9E9E9E" : "var(--primary-yesil)";

            // GÜN KARTI (Daha dar, daha şık)
            let dayHTML = `
                <div style="background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #eaeaea; ${cardOpacity}">
                    <div style="background: ${headerColor}; color: white; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold; font-size: 14px;">📅 ${fancyDate} ${isPastDate ? "(Geçmiş)" : ""}</span>
                        <span style="font-size: 11px; background: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 12px; font-weight: bold;">${appsOfDay.length} Randevu</span>
                    </div>
                    <div style="padding: 0 15px;">
            `;

            // İÇİNDEKİ RANDEVULAR (Kompakt Tasarım)
            appsOfDay.forEach((app, index) => {
                let isLast = index === appsOfDay.length - 1;
                let borderBottom = isLast ? "none" : "1px solid #f0f0f0";
                
                let statusBadge = app.status === "approved" 
                    ? `<span style="color: var(--primary-yesil); font-size: 11px; font-weight: bold; background: #e8f5e9; padding: 2px 6px; border-radius: 4px;">✔ Onaylı</span>` 
                    : `<span style="color: var(--accent-turuncu); font-size: 11px; font-weight: bold; background: #fff3e0; padding: 2px 6px; border-radius: 4px;">⏳ Bekliyor</span>`;

                let sikayet = app.notes || app.reason || "-";
                let hayvanAdi = app.petName || "Belirtilmemiş";
                let ownerName = app.ownerName || "Belirtilmemiş";

                // Detaylar alt alta sıkı bir şekilde dizildi
                dayHTML += `
                    <div style="padding: 12px 0; border-bottom: ${borderBottom};">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <span style="font-weight: bold; color: var(--secondary-mavi); font-size: 16px;">⏰ ${app.time}</span>
                            ${statusBadge}
                        </div>
                        <div style="font-size: 13px; color: #444; margin-bottom: 4px;">
                            👤 ${ownerName} &nbsp;|&nbsp; 🐾 <span style="color: var(--primary-yesil); font-weight: bold;">${hayvanAdi}</span>
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
                            📝 ${sikayet}
                        </div>
                    </div>
                `;
            });

            dayHTML += `</div></div>`; 
            agendaDiv.innerHTML += dayHTML;
        }

    } catch (error) {
        console.error("Ajanda yüklenirken hata oluştu:", error);
        agendaDiv.innerHTML = `<p style="color: red; text-align: center;">Ajanda verileri sunucudan alınamadı.</p>`;
    }
}