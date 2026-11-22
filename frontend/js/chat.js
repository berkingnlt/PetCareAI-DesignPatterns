// Chat penceresini aç kapa
function toggleChat(){
    const chat = document.getElementById("chatBox");
    
    // Eğer display 'none' ise VEYA CSS'ten dolayı içi boş geliyorsa aç
    if(chat.style.display === "none" || chat.style.display === ""){
        chat.style.display = "flex"; 
        
        const messages = document.getElementById("chatMessages");
        if(messages) messages.scrollTop = messages.scrollHeight;
    } else {
        chat.style.display = "none"; 
    }
}
async function sendMessage(){
    const input = document.getElementById("chatInput");
    const messages = document.getElementById("chatMessages");
    let text = input.value.trim();

    if(!text) return;

    messages.innerHTML += `
        <div style="text-align: right; margin-bottom: 15px;">
            <span style="background: #e3f2fd; color: #0d47a1; padding: 10px 15px; border-radius: 15px 15px 0 15px; display: inline-block; max-width: 80%; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <b>Sen:</b> ${text}
            </span>
        </div>`;
    input.value = "";
    messages.scrollTop = messages.scrollHeight;

    let lowerText = text.toLowerCase();

    // ÖZEL KEYWORD YAKALAYICI 
    if (lowerText.includes("randevu") || lowerText.includes("klinik")) {
        messages.innerHTML += `
            <div style="text-align: left; margin-bottom: 15px;">
                <span style="background: #f1f8e9; color: #2e7d32; padding: 12px 16px; border-radius: 15px 15px 15px 0; display: inline-block; max-width: 85%; border-left: 4px solid #4caf50;">
                    <b>🐾 PetCare AI:</b><br>Size en uygun uzman hekimi bulmanız için hemen yardımcı olabilirim!<br><br>
                    <a href="book-appointment.html" style="background: #4caf50; color: white; padding: 5px 10px; border-radius: 5px; text-decoration: none; font-size: 13px;">Randevu Al</a>
                </span>
            </div>`;
        messages.scrollTop = messages.scrollHeight;
        return; // İşlem bitti, OpenAI'a gitme
    }

    //  OPENAI'A GÖNDERİM 
    let loadingId = "loading-" + Date.now();
    messages.innerHTML += `
        <div id="${loadingId}" style="text-align: left; margin-bottom: 15px;">
            <span style="background: #f1f5f9; color: #64748b; padding: 10px 15px; border-radius: 15px 15px 15px 0; display: inline-block;">
                <span class="typing-dot">.</span><span class="typing-dot">.</span><span class="typing-dot">.</span> Asistan düşünüyor
            </span>
        </div>`;
    messages.scrollTop = messages.scrollHeight;

    // Kullanıcı bilgisini çek 
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    let allPets = JSON.parse(localStorage.getItem("pets")) || [];
    let myPets = loggedInUser ? allPets.filter(p => p.ownerEmail === loggedInUser.email) : [];
    
    let systemContext = "Sen PetCare AI adında, uzman bir veteriner asistanısın. Kısa, net ve şefkatli Türkçe cevaplar ver. Acil durumlarda (kanama, yutma, kaza vb.) önce sakin kalmasını söyleyip ilk yardım adımlarını kısaca anlat, ardından MUTLAKA acilen bir veterinere gitmesini söyle.";
    if (loggedInUser && myPets.length > 0) {
        systemContext += ` Kullanıcının adı: ${loggedInUser.name}. Hayvanları (JSON): ${JSON.stringify(myPets)}.`;
    }

    try {
        let response = await fetch("http://localhost:8080/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: text,
                context: systemContext
            })
        });

        let data = await response.json();
        document.getElementById(loadingId).remove();

        messages.innerHTML += `
            <div style="text-align: left; margin-bottom: 15px;">
                <span style="background: ${data.reply.includes("ACİL") || data.reply.includes("acil") ? '#ffebee' : '#f1f8e9'}; color: ${data.reply.includes("ACİL") || data.reply.includes("acil") ? '#c62828' : '#2e7d32'}; padding: 12px 16px; border-radius: 15px 15px 15px 0; display: inline-block; max-width: 85%; border-left: 4px solid ${data.reply.includes("ACİL") || data.reply.includes("acil") ? '#c62828' : '#4caf50'}; line-height: 1.5; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <b>🐾 PetCare AI:</b><br>${data.reply.replace(/\n/g, "<br>")}
                </span>
            </div>`;
    } catch (error) {
        document.getElementById(loadingId).remove();
        messages.innerHTML += `<div style="text-align: left; margin-bottom: 15px; color: red;"><b>Sistem:</b> Sunucuya bağlanılamadı.</div>`;
    }
    messages.scrollTop = messages.scrollHeight;
}


document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("chatInput");
    
    if (chatInput) {
        chatInput.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault(); 
                sendMessage(); 
            }
        });
    }
});