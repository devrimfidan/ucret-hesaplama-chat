# Koç Üniversitesi Ücret Hesaplama Sistemi

Bu proje, Koç Üniversitesi öğrencilerinin öğrenim ücretlerini hesaplamalarına yardımcı olan interaktif bir web uygulamasıdır. Sohbet tabanlı bir arayüz kullanarak adım adım bilgi alarak öğrenim ücretinizi hesaplayabilirsiniz.

## 🆕 Özellikler

### ✨ Sohbet Arayüzü
- **Konuşma Temelli Form**: Adım adım sohbet ederek bilgilerinizi girebilirsiniz
- **Akıllı Mantık**: LYS dışında kabul edilenler için LYS burs sorusu atlanır
- **Gerçek Zamanlı Hesaplama**: Bilgileriniz tamamlandığında otomatik hesaplama
- **Detaylı Sonuçlar**: İndirimler ve ödeme seçenekleri ayrıntılı olarak gösterilir
- **Mobil Uyumlu**: Tüm cihazlarda sorunsuz çalışır

### 🔧 Teknik Özellikler
- **Conversational Form Kütüphanesi**: Modern chat arayüzü
- **Vanilla JavaScript**: Harici framework'e bağımlılık yok
- **JSON Tabanlı Veri**: Kolay güncellenebilir ücret verileri
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu

## 📁 Proje Yapısı

```
ucret-hesaplama-chat/
├── index.html              # Ana sohbet arayüzü
├── README.md               # Proje dokümantasyonu
└── assets/
    ├── fees.js             # Ücret hesaplama mantığı
    ├── fees.json           # Güncel ücret verileri
    └── translations.json   # Çeviri ve metin verileri
```

### 📄 Dosya Açıklamaları

- **`index.html`**: Ana uygulama dosyası. Sohbet arayüzü ve tüm stil/script kodlarını içerir
- **`assets/fees.js`**: Ücret hesaplama algoritmaları ve iş mantığı
- **`assets/fees.json`**: Yıllara göre ücret verileri ve program bilgileri
- **`assets/translations.json`**: Uygulama metinleri ve çeviri verileri

## 🚀 Kurulum ve Kullanım

### Hızlı Başlangıç
1. Projeyi bilgisayarınıza indirin
2. `index.html` dosyasını tarayıcıda açın
3. Sohbet asistanı ile konuşarak ücretinizi hesaplayın

### Geliştirme Ortamı
1. **Live Server** kullanarak proje klasörünü açın (önerilir)
2. Veya herhangi bir web sunucusu ile `index.html` dosyasını servis edin
3. Tarayıcıda `http://localhost:port` adresini açın

## 📋 Ücret Hesaplama Süreci

### Sohbet Akışı
1. **Hoş geldin mesajı** ve kullanım talimatları
2. **Kabul yılı** seçimi (2015-2024 arası)
3. **Akademik program** belirleme (Genel Programlar/Tıp Fakültesi)
4. **Kabul türü** seçimi (LYS/Uluslararası Öğrenci)
5. **LYS bursu** oranı (sadece LYS öğrencileri için)
6. **Koç Grubu bağlantısı** (Çalışan/Emekli/Hiçbiri)
7. **Kardeş indirimi** durumu
8. **Vatandaşlık** bilgisi
9. **Ödeme yöntemi** tercihi (Peşin/Taksitli)
10. **Sonuç hesaplama** ve detaylı gösterim

### 🎯 Hesaplama Mantığı

#### Temel Ücret
- Kabul yılı ve program türüne göre `fees.json` dosyasından alınır
- Türk vatandaşı olmayan öğrenciler için farklı tarifelendirme

#### İndirim ve Burslar
- **LYS Bursu**: %25, %50, %75 oranlarında
- **Koç Grubu Çalışanı**
- **Koç Grubu Emeklisi**
- **Kardeş İndirimi**

#### Hesaplama Formülü
```
Son Ücret = Temel Ücret - LYS Bursu - Koç Grubu İndirimi - Kardeş İndirimi
```

## 🛠️ Geliştirme

### Veri Güncelleme
- **Ücret verileri**: `assets/fees.json` dosyasını düzenleyin
- **Metinler**: `assets/translations.json` dosyasını güncelleyin
- **Hesaplama mantığı**: `assets/fees.js` dosyasında değişiklik yapın

### Yeni Özellik Ekleme
1. Hesaplama mantığını `fees.js` dosyasına ekleyin
2. Gerekirse yeni veri alanlarını JSON dosyalarına ekleyin
3. Sohbet akışını `index.html` içerisindeki form konfigürasyonunda güncelleyin

## 📱 Tarayıcı Desteği

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobil tarayıcılar

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Yeni bir branch oluşturun
3. Değişikliklerinizi yapın
4. Pull request gönderin

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmıştır.
