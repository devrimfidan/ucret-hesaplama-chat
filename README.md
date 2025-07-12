# Koç Üniversitesi Ücret Hesaplama Sistemi

Bu proje, Koç Üniversitesi öğrencilerinin öğrenim ücretlerini hesaplamalarına yardımcı olan interaktif bir web uygulamasıdır.

## 🆕 Yeni Özellik: Sohbet Arayüzü

Artık ücret hesaplama işlemini daha kolay ve interaktif bir şekilde yapabilirsiniz! Yeni sohbet arayüzümüz:

### ✨ Özellikler
- **Konuşma Temelli Form**: Adım adım sohbet ederek bilgilerinizi girebilirsiniz
- **Akıllı Mantık**: LYS dışında kabul edilenler için LYS burs sorusu atlanır
- **Gerçek Zamanlı Hesaplama**: Bilgileriniz tamamlandığında otomatik hesaplama
- **Detaylı Sonuçlar**: İndirimler ve ödeme seçenekleri ayrıntılı olarak gösterilir

### 🔧 Teknik Detaylar
- **Conversational Form**: Modern chat arayüzü için
- **Fees.js Logic**: Mevcut hesaplama mantığını kullanır
- **JSON Data**: fees.json dosyasından güncel ücret verilerini çeker

### 📁 Dosya Yapısı
```
ucret-hesaplama/
├── index.html              # Ana sohbet arayüzü
├── index-original.html     # Orijinal form arayüzü (yedek)
├── assets/
│   ├── fees.js             # Hesaplama mantığı
│   ├── fees.json           # Ücret verileri
│   └── translations.json   # Çeviri verileri
└── chat/                   # Örnek sohbet arayüzü
    ├── index.html
    ├── script.js
    └── style.css
```

### 🚀 Kullanım
1. Web sunucusu ile proje klasörünü açın (Live Server önerilir)
2. `index.html` dosyasını tarayıcıda açın
3. Sohbet asistanı ile konuşarak ücretinizi hesaplayın

### 📋 Sohbet Akışı
1. **Hoş geldin mesajı**
2. **Kabul yılı** (2015-2024)
3. **Akademik program** (Diğer/Tıp)
4. **Kabul tipi** (LYS/Uluslararası)
5. **LYS bursu** (yalnızca LYS öğrencileri için)
6. **Muafiyetler** (Koç Grubu çalışanı/emeklisi)
7. **Kardeş indirimi**
8. **Vatandaşlık**
9. **Ödeme yöntemi**
10. **Sonuç hesaplama ve gösterimi**

### 🎯 Hesaplama Mantığı
- **Temel ücret**: JSON'dan alınır
- **LYS bursu**: %25, %50, %75 seçenekleri
- **Koç Grubu indirimi**: Çalışan %20, Emekli %10
- **Kardeş indirimi**: %10
- **Peşin ödeme indirimi**: %3

### 🔄 Eski Arayüz
Orijinal form arayüzüne `index-original.html` dosyasından erişebilirsiniz.

---

## Original English Documentation

This project helps Koç University students calculate their tuition fees through an interactive web application.

### New Feature: Conversational Interface
The new chat-based interface provides a more intuitive way to calculate tuition fees through a step-by-step conversation.

Built with Conversational Form library and integrates with the existing fees calculation logic from fees.js.
