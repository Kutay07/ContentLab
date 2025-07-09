# 🔐 Auth Sistemi Dokümantasyonu

Lab907 projesi için geliştirilmiş **statik ama profesyonel** kimlik doğrulama sistemi.

## 📋 İçindekiler

- [🔧 Kurulum ve Konfigürasyon](./installation.md)
- [🏗️ Mimari ve Tasarım](./architecture.md)
- [📚 API Referansı](./api-reference.md)
- [🛡️ Güvenlik](./security.md)
- [🎯 Kullanım Kılavuzu](./usage-guide.md)
- [🐛 Sorun Giderme](./troubleshooting.md)
- [💡 Örnekler](./examples.md)

## 🚀 Hızlı Başlangıç

### Temel Özellikler

- ✅ **Statik Kullanıcı Yönetimi** - Environment dosyası tabanlı
- ✅ **JWT-benzeri Token Sistemi** - Güvenli token oluşturma ve doğrulama
- ✅ **CSRF Koruması** - Cross-Site Request Forgery saldırılarına karşı
- ✅ **Remember Me** - Esnek token süreleri
- ✅ **Otomatik Logout** - Token expiry kontrolü
- ✅ **Unicode Desteği** - Türkçe karakterler desteklenir
- ✅ **Error Boundaries** - Kapsamlı hata yönetimi
- ✅ **Loading States** - Kullanıcı dostu loading deneyimi

### Hızlı Test

```bash
# 1. Login sayfasına git
http://localhost:3000/auth/login

# 2. Test kullanıcısı ile giriş yap
Username: admin
Password: admin123

# 3. "Beni Hatırla" seçeneğini test et
```

## 🏗️ Sistem Mimarisi

```
src/services/auth/
├── AuthService.ts       # Ana auth service
├── TokenManager.ts      # Token yönetimi
├── UserStore.ts         # Kullanıcı yönetimi
├── SecurityManager.ts   # Güvenlik ve CSRF
├── middleware.ts        # API middleware
├── types.ts            # TypeScript tipleri
└── index.ts            # Barrel exports

src/components/auth/
├── AuthProvider.tsx     # Route koruması
├── AuthLoading.tsx      # Loading components
└── AuthErrorBoundary.tsx # Error handling

src/stores/
└── auth.ts             # Zustand store

src/hooks/
└── useAuth.ts          # Custom hooks
```

## 🔑 Temel Kavramlar

### Token Yapısı

```
header.payload.signature
```

### Environment Konfigürasyonu

```bash
NEXT_PUBLIC_AUTH_USERS='[{"id":"1","username":"admin","password":"admin123","name":"Admin Kullanıcı"}]'
NEXT_PUBLIC_AUTH_SECRET_KEY="your-secret-key"
NEXT_PUBLIC_AUTH_DEFAULT_EXPIRY=86400000    # 24 saat
NEXT_PUBLIC_AUTH_REMEMBER_ME_EXPIRY=604800000 # 7 gün
```

### Güvenlik Özellikleri

- **Token İmzalama** - Her token dijital olarak imzalanır
- **CSRF Token** - API istekleri için CSRF koruması
- **Otomatik Expiry** - Token'lar otomatik expire olur
- **Secure Headers** - API isteklerinde güvenlik headers
- **Input Validation** - Kullanıcı girişleri doğrulanır

## 📊 Performans

- ⚡ **Hızlı** - Statik kullanıcı doğrulamasi
- 💾 **Hafif** - Minimal memory footprint
- 🔄 **Reactive** - Real-time state updates
- 📱 **Mobile Ready** - Responsive design
- 🔧 **Modüler** - Kolay genişletilebilir

## 🧪 Test Coverage

- ✅ **Login Flow** - Başarılı ve başarısız login senaryoları
- ✅ **Token Management** - Token oluşturma, doğrulama, expiry
- ✅ **CSRF Protection** - Cross-site request forgery testleri
- ✅ **Error Handling** - Network errors, validation errors
- ✅ **Remember Me** - Token süre uzatma
- ✅ **Unicode Support** - Türkçe karakter testleri

## 🤝 Katkıda Bulunma

1. [Mimari dökümanını](./architecture.md) inceleyin
2. [API referansını](./api-reference.md) okuyun
3. [Örnekleri](./examples.md) çalıştırın
4. Değişikliklerinizi test edin

## 📈 Gelecek Planları

- 🔄 **Session Management** - Gelişmiş session yönetimi
- 🔐 **Password Hashing** - Şifre hash'leme (opsiyonel)
- 📱 **Mobile App Support** - React Native entegrasyonu
- 🌐 **i18n Support** - Çoklu dil desteği
- 📊 **Analytics** - Auth metrics ve logging

## 📞 Destek

Sorunlar için:

1. [Sorun Giderme](./troubleshooting.md) sayfasına bakın
2. [Örnekleri](./examples.md) inceleyin
3. Developer console'da hata mesajlarını kontrol edin

---

**Version**: 1.0.0  
**Last Updated**: Ocak 2025  
**Maintainer**: Lab907 Team
