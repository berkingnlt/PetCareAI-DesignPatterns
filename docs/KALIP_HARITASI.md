# GoF Kalıp Haritası — PetCare AI

Bu belge ilk geliştirme sürümünün tasarım kararlarını, alternatiflerini ve bedellerini gösterir.

| Kalıp / grup | Çözdüğü problem | Roller → sınıflar | Alternatif yaklaşım | Bedel / ödünleşim |
|---|---|---|---|---|
| **State / Davranışsal** | `pending`, `quoted`, `confirmed`, `rejected`, `completed` geçişlerini rastgele string güncellemelerinden kurtarmak | **Context:** `AppointmentContext`; **State:** `AppointmentState`; **ConcreteState:** `PendingState`, `QuotedState`, `ConfirmedState`, `RejectedState`, `CompletedState` | Controller'da `if-else` / `switch` | Küçük durumlar için sınıf sayısı artar; karşılığında geçiş kuralları tek tek test edilir |
| **Strategy / Davranışsal** | Kliniklerin ada, ortalama puana veya yorum sayısına göre sıralanması | **Context:** `ClinicSortingContext`; **Strategy:** `ClinicSortingStrategy`; **ConcreteStrategy:** `NameClinicSortStrategy`, `RatingClinicSortStrategy`, `ReviewCountClinicSortStrategy` | Tek `switch` içinde tüm sıralama karşılaştırıcıları | Her algoritma için ek sınıf gerekir; yeni sıralamalar bağımsız eklenebilir |
| **Factory Method / Yaratımsal** | Kedi ve köpek takvimlerinin somut türlerine bağımlılığı azaltmak | **Creator:** `VaccineScheduleCreator`; **ConcreteCreator:** `CatScheduleCreator`, `DogScheduleCreator`; **Product:** `VaccineSchedule`; **ConcreteProduct:** `CatVaccineSchedule`, `DogVaccineSchedule` | `new CatVaccineSchedule()` / `new DogVaccineSchedule()` koşulları | Oluşturucu katmanı ve alt sınıflar eklenir; yeni türün oluşturulması izole edilir |
| **Facade / Yapısal** | Randevu kaydı, durum değişikliği, müsaitlik kilidi ve serbest bırakma işlemlerini controller'dan ayrıştırmak | **Facade:** `AppointmentFacade`; **Subsystems:** `AppointmentRepository`, `AvailabilityRepository`, `AppointmentContext`; **Client:** `AppointmentController` | Controller'da doğrudan Repository çağrıları | Ek koordinasyon katmanı ve test gerektirir; API controller'ı sadeleşir |

## Kod içinde gösterim

Kalıp ana sınıflarındaki `// GoF ... - Role` kısa yorumları rolü tanımlar. Böylece hem sınıf hem dosya adı Kalıp Haritası ve UML ile eşleşir.

## Sistem içi kullanım

- `AppointmentController` → `AppointmentFacade` → `AppointmentContext` / repository; randevu oluşturma, teklif, onay, red ve silme
- `VaccineScheduleController` → `VaccineScheduleService` → somut `VaccineScheduleCreator` → `VaccineSchedule`; `dashboard.html` aşı uyarı kodu API'yi çağırır
- `ClinicSortingController` → `ClinicRankingService` → `ClinicSortingContext` → seçilen `ClinicSortingStrategy`; `vets.html` sıralama kutusu bu API'den sıra alır

## Örnek değişiklik istekleri

- Yeni hayvan türü: Yeni `VaccineSchedule` ve `VaccineScheduleCreator` alt sınıfları + tür eşlemesi
- Yeni sıralama: `ClinicSortingStrategy` uygulaması + seçim eşlemesi
- Yeni randevu durumu: Yeni somut State ve izin verilen geçişler
- Randevu sonrası başka bir işlem: Facade üzerinden ek servis koordinasyonu

Bu kalıplar, mevcut uygulamanın önceki dönemden gelen temel özelliklerine yönelik yeni geliştirmelerdir. Üretime hazır olduğu iddia edilmemektedir.
