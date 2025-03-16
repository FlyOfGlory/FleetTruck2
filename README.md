# FleetTruck - Filo Yönetim Sistemi

Modern ve kullanıcı dostu arayüzü ile araç filonuzu kolayca yönetmenizi sağlayan web tabanlı bir yönetim sistemidir.

## 🚀 Özellikler

### 🚗 Araç Yönetimi
- Araç ekleme, düzenleme ve silme
- Detaylı araç bilgileri (marka, model, plaka, vb.)
- Araç durumu takibi
- Bakım planlaması ve takibi
- Kilometre geçmişi

### 📊 Kilometre Takibi
- Excel ile toplu kilometre güncelleme
- Otomatik veri doğrulama
- Geçmiş kilometre kayıtları
- Kilometre raporu oluşturma
- Günlük kilometre takibi

### 🔄 Excel Entegrasyonu
- Toplu veri yükleme desteği
- Otomatik veri eşleştirme
- Hata kontrolü ve raporlama
- Yükleme geçmişi
- Veri önizleme

### 🛞 Lastik Takibi
- Lastik envanteri yönetimi
- Lastik rotasyon planlaması
- Aşınma takibi
- Lastik konumu izleme
- Değişim geçmişi

### 👥 Kullanıcı Yönetimi
- Rol tabanlı yetkilendirme
- Kullanıcı işlem geçmişi
- Güvenli giriş sistemi
- Şifre yönetimi
- Kullanıcı profili

### 📝 Denetim Günlüğü
- Tüm işlemlerin kaydı
- Tarih ve saat damgası
- Kullanıcı bazlı filtreleme
- Detaylı işlem bilgisi
- Raporlama özellikleri

## 🛠️ Teknolojiler

- **Frontend:** React + TypeScript
- **UI Framework:** Tailwind CSS
- **Routing:** React Router
- **State Management:** React Query
- **Build Tool:** Vite
- **Date Handling:** date-fns
- **Excel Processing:** xlsx

## 📦 Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/FlyOfGlory/FleetTruck2.git
```

2. Proje dizinine gidin:
```bash
cd FleetTruck2
```

3. Bağımlılıkları yükleyin:
```bash
npm install
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## 💡 Kullanım Kılavuzu

### Excel ile Veri Yükleme
1. Excel dosyanızda aşağıdaki sütunların bulunduğundan emin olun:
   - Plaka
   - Kilometre
   - Tarih
2. Dosyayı sürükleyip bırakın veya dosya seçiciyi kullanın
3. Verileri önizleyin ve doğruluğunu kontrol edin
4. Yüklemeyi onaylayın

### Lastik Takibi
1. Araç detay sayfasından "Lastikler" sekmesine gidin
2. Lastik pozisyonlarını görüntüleyin
3. Rotasyon planı oluşturun
4. Lastik değişimlerini kaydedin

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

## 📞 İletişim

GitHub: [@FlyOfGlory](https://github.com/FlyOfGlory) 