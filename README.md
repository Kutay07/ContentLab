# 🚀 Awesome Editor - İçerik Yönetim Paneli

**Mobil eğitim uygulamaları için gelişmiş, web tabanlı içerik editörü ve yönetim sistemi**

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Connected-green?style=for-the-badge&logo=supabase)

</div>

## 📖 Proje Hakkında

Awesome Editor, mobil eğitim uygulamalarında kullanılacak içerikleri düzenlemek, yönetmek ve organize etmek için tasarlanmış kapsamlı bir web platformudur. Hierarchical content management sistemi ile seviye grupları, seviyeler ve bileşenler arasında organize bir yapı sunar.

### 🎯 Temel Özellikler

- **📱 Mobil Önizleme**: Gerçek zamanlı mobil görünüm simülasyonu
- **🔄 Undo/Redo Sistemi**: Gelişmiş geri alma ve yineleme desteği
- **📝 Çoklu Editör**: JSON, Form ve LLM tabanlı düzenleme seçenekleri
- **🎨 Sürükle-Bırak Interface**: Kolay içerik organizasyonu
- **🔗 Çoklu Supabase Entegrasyonu**: Farklı projeler için dinamik bağlantı yönetimi
- **⚡ Real-time Updates**: Reactive veri güncelleme sistemi
- **🛡️ TypeScript**: Tip güvenliği ve geliştirici deneyimi

## 🏗️ Teknoloji Stack'i

### Frontend

- **Next.js 15.3.3** - React tabanlı full-stack framework
- **TypeScript 5.0** - Tip güvenliği için
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Zustand 5.0** - Hafif state management
- **React 19** - Modern React özellikleri

### Backend & Database

- **Supabase** - Backend-as-a-Service çözümü
- **PostgreSQL** - İlişkisel veritabanı
- **Real-time subscriptions** - Canlı veri senkronizasyonu

### Development Tools

- **ESLint 9** - Code linting
- **PostCSS** - CSS işleme
- **UUID** - Benzersiz ID oluşturma

## 🚀 Hızlı Başlangıç

### Önkoşullar

- Node.js 20+
- npm/yarn/pnpm
- Git

### Kurulum

1. **Projeyi klonlayın**

```bash
git clone https://github.com/your-username/awesome-editor.git
cd awesome-editor
```

```bash
npm install
# veya
yarn install
# veya
pnpm install
```

3. **Geliştirme sunucusunu başlatın**

```bash
npm run dev
# veya
yarn dev
# veya
pnpm dev
```

4. **Tarayıcıda açın**
   [http://localhost:3000](http://localhost:3000) adresine gidin

## 📁 Proje Yapısı

```
awesome-editor/
├── 📂 src/
│   ├── 📂 app/                    # Next.js App Router sayfaları
│   │   ├── 📄 page.tsx           # Ana sayfa - Uygulama listesi
│   │   ├── 📄 layout.tsx         # Global layout
│   │   ├── 📂 app/[id]/          # Dinamik uygulama yönetim sayfası
│   │   └── 📂 auth/login/        # Kimlik doğrulama
│   ├── 📂 components/             # React bileşenleri
│   │   ├── 📂 apps/              # Uygulama kartları
│   │   ├── 📂 auth/              # Kimlik doğrulama bileşenleri
│   │   ├── 📂 global/            # Genel kullanım bileşenleri
│   │   │   ├── 📂 preview/       # Önizleme bileşenleri
│   │   │   ├── 📂 edit/          # Düzenleme bileşenleri
│   │   │   └── 📂 button/        # Aksiyon butonları
│   │   ├── 📂 layout/            # Layout bileşenleri
│   │   └── 📂 mobile/            # Mobil özgü bileşenler
│   ├── 📂 services/              # İş mantığı servisleri
│   │   ├── 📄 ContentHierarchyService.ts  # Ana içerik yönetimi
│   │   ├── 📄 learning-service.ts         # Eğitim servisi
│   │   └── 📄 supabase.ts                # Veritabanı bağlantısı
│   ├── 📂 stores/                # Global state yönetimi
│   ├── 📂 types/                 # TypeScript tip tanımları
│   ├── 📂 utils/                 # Yardımcı fonksiyonlar
│   └── 📂 config/                # Konfigürasyon dosyaları
├── 📂 public/                    # Statik dosyalar
└── 📄 package.json              # Proje bağımlılıkları
```

## 🎮 Kullanım Kılavuzu

### 1. Uygulama Seçimi

- Ana sayfada mevcut uygulamalar arasından birini seçin
- Aktif, geliştirme ve pasif uygulamalar kategorilere ayrılmıştır
- Her uygulama kendi Supabase bağlantısına sahiptir

### 2. İçerik Yönetimi

- **Seviye Grupları**: Ana kategoriler (örn: "Temel JavaScript")
- **Seviyeler**: Alt kategoriler (örn: "Değişkenler ve Veri Tipleri")
- **Bileşenler**: İçerik parçaları (metin, video, quiz vb.)

### 3. Bileşen Düzenleme

```typescript
// Örnek bileşen yapısı
{
  id: "comp-1",
  type: "text_explanation",
  display_name: "Giriş Metni",
  content: {
    title: "JavaScript'e Hoş Geldiniz",
    description: "Bu bölümde JavaScript temelleri...",
    examples: ["console.log('Merhaba');"]
  },
  order: 1
}
```

### 4. Mobil Önizleme

- Sol panelde gerçek zamanlı mobil görünüm
- İçerik değişiklikleri anında yansır
- Farklı ekran boyutları için responsive tasarım

## 🔧 API Reference

### ContentHierarchyService

Proje boyunca kullanılan ana servis sınıfı:

```typescript
import { contentHierarchyService } from "@/services/ContentHierarchyService";

// Hiyerarşi okuma
const hierarchy = contentHierarchyService.getHierarchy();

// Bileşen ekleme
contentHierarchyService.addComponent(levelId, component);

// Güncelleme
contentHierarchyService.updateComponent(componentId, updates);

// Undo/Redo
contentHierarchyService.undo();
contentHierarchyService.redo();

// Reactive updates için subscription
const unsubscribe = contentHierarchyService.subscribe((newHierarchy) => {
  console.log("Hiyerarşi güncellendi:", newHierarchy);
});
```

### React Hook Kullanımı

```typescript
import { useState, useEffect } from "react";
import { contentHierarchyService } from "@/services/ContentHierarchyService";

export const useContentHierarchy = () => {
  const [hierarchy, setHierarchy] = useState(() =>
    contentHierarchyService.getHierarchy()
  );

  useEffect(() => {
    const unsubscribe = contentHierarchyService.subscribe(setHierarchy);
    return unsubscribe;
  }, []);

  return {
    hierarchy,
    service: contentHierarchyService,
  };
};
```

## 🔐 Kimlik Doğrulama

Proje Supabase Auth kullanır:

```typescript
import { useAuthStore } from "@/stores/auth";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard user={user} />;
}
```

## 🗄️ Veritabanı Şeması

### Temel Tablolar

```sql
-- Seviye grupları
CREATE TABLE level_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seviyeler
CREATE TABLE levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  icon_key TEXT,
  icon_family TEXT,
  xp_reward INTEGER DEFAULT 0,
  order INTEGER NOT NULL,
  level_group_id UUID REFERENCES level_groups(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bileşenler
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  content JSONB NOT NULL,
  order INTEGER NOT NULL,
  level_id UUID REFERENCES levels(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bileşen türleri
CREATE TABLE component_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_key TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true
);
```

## 🎨 Tema ve Stil

### Tailwind CSS Konfigürasyonu

Proje özel renk paleti kullanır:

```css
/* Gradient temalar */
.gradient-blue: bg-gradient-to-r from-blue-600 to-purple-600
.gradient-success: bg-gradient-to-r from-green-500 to-emerald-600
.gradient-warning: bg-gradient-to-r from-yellow-500 to-orange-500

/* Mobil önizleme stil */
.mobile-screen: border-radius: 24px, iPhone benzeri
.mobile-container: Flexbox tabanlı responsive layout
```

## 🔧 Konfigürasyon

### Yeni Uygulama Ekleme (API Üzerinden)

Uygulama JSON dosyasını manuel olarak eklemek yerine artık REST API üzerinden
POST isteği yaparak yeni uygulama tanımlayabilirsiniz:

```bash
curl -X POST http://localhost:3000/api/apps \
  -H "Content-Type: application/json" \
  -d '{
    "id": "yeni-uygulama",
    "name": "Yeni Eğitim Uygulaması",
    "description": "Açıklama",
    "status": "active",
    "supabase": {
      "url": "https://your-project.supabase.co",
      "anonKey": "your-anon-key",
      "projectId": "your-project-id"
    },
    "icon": "🎓",
    "color": "blue",
    "createdAt": "2025-01-15T00:00:00.000Z",
    "lastUpdated": "2025-01-15T00:00:00.000Z"
  }'
```

### API Endpoint'leri

| Yöntem | URL                   | Açıklama                                  |
| ------ | --------------------- | ----------------------------------------- |
| GET    | `/api/apps`           | Tüm uygulama konfigürasyonlarını getirir  |
| POST   | `/api/apps`           | Yeni uygulama oluşturur                   |
| GET    | `/api/log-connection` | Bağlantı geçmişini filtreleyerek listeler |
| POST   | `/api/log-connection` | Bağlantı olayını log dosyasına ekler      |

## 🧪 Test ve Geliştirme

### Available Scripts

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Production sunucu
npm run start

# Linting
npm run lint
```

### Debug Modu

Geliştirme sırasında konsol logları aktif:

```typescript
// Servis operasyonları loglanır
console.log("Component eklendi:", component);
console.log("Hierarchy güncellendi:", hierarchy);
```

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit'leyin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push'layın (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Kod Standartları

- TypeScript tip güvenliği zorunlu
- ESLint kurallarına uygun kod
- Bileşenler için JSDoc dokümantasyonu
- Semantic commit mesajları

## 📝 Sürüm Geçmişi

### v0.1.0 (Mevcut)

- ✅ Temel içerik yönetimi sistemi
- ✅ Mobil önizleme
- ✅ Çoklu Supabase desteği
- ✅ Undo/Redo sistemi
- ✅ Responsive tasarım

### Gelecek Özellikler

- 🔄 Drag & Drop interface
- 🤖 AI destekli içerik oluşturma
- 📊 Analytics ve raporlama
- 🌐 Multi-language desteği
- 📱 PWA (Progressive Web App)

## 📞 Destek ve İletişim

- **Dokümantasyon**: [Proje Wiki](https://github.com/your-username/awesome-editor/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/awesome-editor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/awesome-editor/discussions)

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

<div align="center">

**🚀 Made with ❤️ for Education Technology**

[⭐ Star](https://github.com/your-username/awesome-editor) • [🍴 Fork](https://github.com/your-username/awesome-editor/fork) • [📝 Contribute](https://github.com/your-username/awesome-editor/blob/main/CONTRIBUTING.md)

</div>
