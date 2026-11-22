# İlk Geliştirme Notları — 23 Kasım 2026

## Önceki dönemden aktarılanlar

İleri Web Programlama dersinde geliştirilen PetCare AI'ın Java Spring Boot backend'i ve HTML/CSS/JavaScript ekranları temel alınmıştır. Bu sürüm, önceki çalışmanın aynen tekrar teslimi olarak değil, *tasarım kalıplarıyla yeniden düzenleme ve testlendirme* çalışmasıdır. Önceki proje bağlamı öğretim üyesine açıkça bildirilmelidir.

## Bu sürümde yeni yapılanlar

- **State:** Durum geçişleri controller içindeki `setStatus()` atamalarından özel Java State sınıflarına taşındı; geçersiz geçişler engellendi.
- **Facade:** Controller'daki randevu iş mantığı `AppointmentFacade` sınıfına taşındı. Müsaitlik rezervasyonunda pessimistic lock ve transaction kullanıldı; red/silmede saat geri açılır.
- **Strategy:** Klinikler için ad, puan ve değerlendirme sayısına göre sıralama sınıfları yazıldı, `vets.html` sıralama seçeneğine bağlandı.
- **Factory Method:** Kedi/köpek aşı takvimi oluşturucuları ve ürün arayüzü yazıldı; `dashboard.html` önce API'yi kullanır, erişim yoksa mevcut yerel kurallara döner.
- **Testler:** Dört kalıp için JUnit 5 / Mockito otomatik testleri eklendi.
- **Belgeler:** README, Kalıp Haritası, Mermaid UML ve test kılavuzu eklendi.
- **Güvenlik / yapılandırma:** API anahtarı ve DB şifresi arşivden çıkarıldı; değişkenler ortamdan okunur; derlenmiş `target/` ve önceki `.git/` klasörü pakete alınmadı.

## Bilinen konular / sonraki geliştirme

- Eski kullanıcı yönetimi düz metin parola tutuyor ve oturum kimliği doğrulamasını sunucu tarafında güvenilir biçimde yapmıyor. Gerçek kullanıcı/üretim ortamına çıkmadan parola hash'i, güvenli kimlik doğrulama ve yetkilendirme gerekiyor.
- Eski API `@CrossOrigin("*")` izinleri geniş; sunum dışındaki ortamlarda kısıtlanmalı.
- Aşı takvimi kuralları, önceki uygulamadaki örneklerden aktarılmıştır; gerçek veterinerlik tavsiyesi olarak değerlendirilmemelidir. Verilerin iki tarafta bulunması geçiş döneminin teknik borcudur.
- API testleri ve gerçek tarayıcı entegrasyon testleri henüz otomatikleştirilmedi.
- Git geçmişi bu tarihten itibaren yapılan gerçek çalışmayı göstermelidir; geçmiş çalışma geriye dönük bu dönem commit'i gibi gösterilmemelidir.
- AI destekli geliştirme süreci dersin müfredatındaki dürüstlük kuralına göre raporda belirtilmelidir; her GoF sınıfı öğrenci tarafından açıklanabilmelidir.
