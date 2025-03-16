# Filo Yönetim Sistemi

Bu proje, araç filosu yönetimi için geliştirilmiş bir web uygulamasıdır. React ve TypeScript kullanılarak geliştirilmiştir.

## Özellikler

- Araç takibi ve yönetimi
- Kilometre takibi
- Excel ile toplu veri yükleme
- Lastik takibi
- Kullanıcı yönetimi
- Denetim günlüğü (audit log)

## Teknolojiler

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Query
- date-fns

## Kurulum

1. Projeyi klonlayın:
```bash
git clone [repository-url]
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## Kullanım

### Excel Yükleme
- Excel dosyanızda "Plaka", "Kilometre" ve "Tarih" sütunları bulunmalıdır
- Sistem, araçların mevcut kilometresinden düşük değerleri dikkate almaz
- Tüm yükleme geçmişi otomatik olarak kaydedilir

### Lastik Takibi
- Lastiklerin konumlarını ve durumlarını takip edebilirsiniz
- Lastik rotasyonlarını kaydedebilirsiniz
- Lastik ömrü ve performans analizi yapabilirsiniz

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız. 