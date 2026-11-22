# Test Kılavuzu (İlk Geliştirme)

## Otomatik testler

`backend` dizininden, Java 21 ve Maven Wrapper ile:

```powershell
.\mvnw.cmd test
```

| Test sınıfı | Doğrulanan davranış |
|---|---|
| `AppointmentStateTest` | `pending → quoted → confirmed → completed`; geçersiz `pending → confirmed` engellenir; red terminaldir; negatif fiyat engellenir |
| `VaccineScheduleFactoryTest` | Farklı creator'ların farklı ürün üretmesi, türlere özel aşı anahtarları, geçersiz tür/yaş hatası |
| `ClinicSortingStrategyTest` | Aynı klinik listesi üzerinde strateji değişince sıralama değişmesi; kaynak listeye dokunulmaması |
| `AppointmentFacadeTest` | Boş saat rezervasyonu, dolu saatin reddi, randevu reddedilince saatin yeniden açılması |

`DemoApplicationTests` DB olmadan çalışmadığı için geçici `@Disabled` durumundadır. Bu testler bir entegrasyon testi yerine geçmez. Maven test çıktısını GitHub yüklemeden önce yerel bilgisayarda doğrula.

## Elle test edilecek senaryolar

1. **Randevu oluştur:** Uygun bir slot seç, randevu gönder. Beklenen: kayıt `pending`, ilgili slot `isBooked=true`.
2. **Fiyat ver:** Veteriner olarak geçerli pozitif fiyat gir. Beklenen: `quoted` ve fiyat kaydı.
3. **Fiyatı onayla:** Hayvan sahibi kabul etsin. Beklenen: `confirmed`.
4. **Red:** Yeni bir `pending` veya `quoted` randevuyu reddet. Beklenen: `rejected`, slot yeniden boş.
5. **Geçersiz geçiş:** `pending` kaydı doğrudan `/confirm` ile onaylamayı dene. Beklenen: HTTP **409 Conflict**.
6. **Çift rezervasyon:** Aynı slot iki kez alınmasın. Beklenen: ikinci giriş HTTP **409 Conflict**.
7. **Aşı oluşturucu:** Tarayıcıdan `http://localhost:8080/api/vaccines/schedule?type=cat&ageWeeks=12` çağır. Beklenen: JSON aşı kuralları; köpekte başka kurallar.
8. **Klinik Strategy:** `vets.html` sıralama alanında ad / puan / yorum sayısı seçeneklerini dene. Beklenen: sıralama sunucudan belirlenir, filtreler çalışır.
9. **Geriye uyumluluk:** Giriş, hayvan ekleme, aşı görüntüleme, veteriner takvimi ve klinik panelinin eski akışlarını doğrula.

**Önemli:** Bu testlerin tamamının gerçek MariaDB ve tarayıcı ortamında geçtiği bu arşivde iddia edilmemektedir. Sonuçları çalıştırdıktan sonra kaydet.
