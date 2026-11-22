# PetCare AI — Tasarım Kalıpları Dönem Projesi

**Ders:** EBLG443 Tasarım Kalıpları | **İlk geliştirme:** 23.11.2026

Bu çalışma, önceki dönemde geliştirilen PetCare AI veteriner yönetim uygulamasının **GoF tasarım kalıplarıyla yeniden yapılandırılmış ilk sürümüdür**. Eski projedeki randevu, klinik listeleme ve aşı uyarı arayüzleri korunarak Java backend'de yeni sınıflar ve arayüzler geliştirilmiştir. Mevcut kodun tekrar kullanımı öğretim üyesinin onayına tabidir.

> **Önemli:** Bu ilk geliştirme sürümüdür; kullanıcı yetkilendirmesi ve gerçek kullanıcı verileri için güvenlik kontrolleri tamamlanmış bir üretim sürümü değildir. Hasta/hayvan sağlık kararlarında örnek aşı takvimi verileri kullanılmamalıdır.

## Teknolojiler

- Java 21, Spring Boot 4.0.4, Maven Wrapper
- MariaDB, Spring Data JPA
- HTML, CSS, Vanilla JavaScript
- JUnit 5, Mockito

## Klasörler

- `backend/`: Spring Boot ve GoF kalıpları (`src/main/java/com/example/demo/patterns/`)
- `frontend/`: Web sayfaları ve JavaScript
- `docs/KALIP_HARITASI.md`: Her kalıbın problemi, rolleri ve bedeli
- `docs/UML.md`: Mermaid sınıf diyagramları
- `docs/TEST_KILAVUZU.md`: Otomatik ve manuel test adımları
- `docs/GELISTIRME_NOTLARI.md`: Önceki dönem ile bu sürüm arasındaki değişiklikler

## Kurulum (Windows 11)

1. Bilgisayarında **Java 21 JDK** ve **MariaDB** kurulu olsun. Maven Wrapper ilk seferde Maven bileşenlerini indirebilmek için internet isteyebilir.
2. MariaDB'de bir veritabanı oluştur:

   ```sql
   CREATE DATABASE IF NOT EXISTS petcare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. `backend/src/main/resources/application.properties` artık **gizli bilgi içermez**. PowerShell terminalinde ortam değişkenlerini ayarla:

   ```powershell
   $env:DB_URL="jdbc:mariadb://localhost:3306/petcare"
   $env:DB_USERNAME="root"
   $env:DB_PASSWORD="KENDI_VERITABANI_SIFREN"
   $env:OPENAI_API_KEY="YENI_API_ANAHTARIN"
   ```

   AI sohbetini test etmiyorsan `OPENAI_API_KEY` boş kalabilir. Önceki sürümdeki API anahtarını **iptal edip yenile**. Şifreleri GitHub'a koyma.
4. Backend çalıştır:

   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```

5. Ayrı bir terminalde, kök klasörden frontend sunucusunu aç (Python kuruluysa):

   ```powershell
   cd frontend
   python -m http.server 5500
   ```

   Tarayıcıdan `http://localhost:5500/index.html` aç. Frontend kodlarının mevcut API adresi `http://localhost:8080/api`'dir.

**Not:** Eski veritabanında tablo ve kayıtlar varsa önce yedek al. `spring.jpa.hibernate.ddl-auto=update` yeni yerel geliştirmede tablo şemasını güncelleyebilir. Örnek ZIP içinde kullanıcı verisi ya da veritabanı dökümü yoktur.

## Otomatik test

```powershell
cd backend
.\mvnw.cmd test
```

JUnit testleri şu sınıflarda: `AppointmentStateTest`, `VaccineScheduleFactoryTest`, `ClinicSortingStrategyTest`, `AppointmentFacadeTest`.

`DemoApplicationTests` gerçek MariaDB olmadan otomatik başlatma testi yapmamak için `@Disabled` olarak işaretlenmiştir. Tam entegrasyon kontrolü için backend'i yerel DB ile başlatıp manuel senaryoları uygula. **Bu arşiv hazırlanırken Maven bağımlılıklarına erişilemediği için tüm Spring Boot test paketi burada çalıştırılamadı; yerel test çıktısı doğrulanmalıdır.**

## Eklenen API'ler

| Endpoint | Açıklama |
|---|---|
| `GET /api/vaccines/schedule?type=cat&ageWeeks=12` | Factory Method ile örnek aşı kuralları |
| `GET /api/vaccines/schedule?type=dog&ageWeeks=12` | Köpek aşı kuralları |
| `GET /api/clinics/sort-order?by=name` | Strategy — ada göre klinik sırası |
| `GET /api/clinics/sort-order?by=rating` | Strategy — puana göre klinik sırası |
| `GET /api/clinics/sort-order?by=reviews` | Strategy — değerlendirme sayısına göre |

Mevcut `/api/appointments` uç noktaları korunmuş, geçersiz durum geçişlerine `409 Conflict`, geçersiz girdilere `400 Bad Request` dönülmesi eklenmiştir.

## Tasarım kalıpları

1. **State (davranışsal):** `AppointmentContext` ve somut durum sınıfları, `pending → quoted → confirmed → completed` geçişlerini ve reddetmeyi yönetir.
2. **Strategy (davranışsal):** `ClinicSortingContext` farklı klinik sıralama algoritmalarını değiştirilebilir yapar.
3. **Factory Method (yaratımsal):** `VaccineScheduleCreator` alt sınıfları farklı türlere ait takvim nesnelerini oluşturur.
4. **Facade (yapısal):** `AppointmentFacade`, randevu kaydı, durum yönetimi ve müsaitlik rezervasyonunu koordine eder.

Kalıpların tamamı öğrenci proje kodunda yazılmıştır; framework'ün hazır sunduğu bir kalıp dört kalıp sayısına dahil edilmemiştir.

## GitHub'a gönderme

GitHub'da boş, tercihen **private** bir repo oluşturup proje kök klasöründe:

```powershell
git init
git add .
git commit -m "feat: add initial GoF patterns, tests and project documentation"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADI/DEPO_ADI.git
git push -u origin main
```

Push öncesi `git status` ve `git diff --cached` kontrol et. Özellikle `.env`, şifre, token, `target` ve gerçek kullanıcı verileri olmamalı. Git geçmişi bu yeni çalışmaya ait ilerlemeyi göstermeli; önceki dönem yapılan çalışmayı bu dönem yeni yazılmış gibi sunma.

## Bilinen eksikler

Önceki uygulamadan gelen giriş/parola işleme, yetkilendirme ve geniş CORS ayarları iyileştirilmelidir. Bu sürümde ilk hedef dört GoF kalıbının uygulanması ve gösterilmesidir. Detaylar: `docs/GELISTIRME_NOTLARI.md`.
