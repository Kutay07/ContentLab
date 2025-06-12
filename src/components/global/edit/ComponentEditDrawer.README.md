# ComponentEditDrawer

Content Editor uygulamanızda ComponentItem'ları oluşturmak ve düzenlemek için kullanılan kapsamlı bir drawer bileşeni.

## Özellikler

- ✅ **Sağdan açılan büyük drawer** - Blackboard tarzı tam ekran düzenleme deneyimi
- ✅ **Canlı önizleme** - Sol panelde MobileScreenContainer ile anında önizleme
- ✅ **Üç farklı düzenleme modu**:
  - **JSON Editor** - Ham JSON düzenleme (formatla özelliği ile)
  - **Form Editor** - JSON'dan otomatik oluşturulan form alanları
  - **LLM Tools** - Gelecekte AI destekli araçlar için placeholder
- ✅ **ContentHierarchyService entegrasyonu** - Undo/redo desteği
- ✅ **TypeScript desteği** - Tam tip güvenliği
- ✅ **Responsive tasarım** - Tailwind CSS ile modern UI

## Bileşen Yapısı

```
ComponentEditDrawer/
├── ComponentEditDrawer.tsx          # Ana drawer bileşeni
├── ComponentEditTabs.tsx            # Tab sistemi
├── ComponentEditJsonTab.tsx         # JSON düzenleyici
├── ComponentEditFormTab.tsx         # Form düzenleyici
├── ComponentEditLLMTab.tsx          # LLM araçları (placeholder)
├── ComponentEditDrawer.example.tsx  # Kullanım örnekleri
└── ComponentEditDrawer.README.md    # Bu dosya
```

## Kurulum

Bileşenler zaten projenizdeki `src/components/global/` klasöründe hazır. Sadece import edip kullanabilirsiniz:

```tsx
import ComponentEditDrawer from "@/components/global/ComponentEditDrawer";
```

## Temel Kullanım

### Yeni Bileşen Oluşturma

```tsx
import { useState } from "react";
import ComponentEditDrawer from "@/components/global/ComponentEditDrawer";

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <ComponentEditDrawer
      levelId="level_123"
      componentType={selectedComponentType}
      initialOrder={0}
      onClose={() => setIsOpen(false)}
      isOpen={isOpen}
    />
  );
};
```

### Mevcut Bileşeni Düzenleme

```tsx
<ComponentEditDrawer
  levelId="level_123"
  componentType={componentType}
  componentId="comp_456"           // Düzenlenecek bileşen ID'si
  initialContent={existingContent} // Mevcut içerik
  initialOrder={2}
  onClose={() => setIsOpen(false)}
  isOpen={isOpen}
/>
```

## Props API

| Prop | Tip | Gerekli | Açıklama |
|------|-----|---------|----------|
| `levelId` | `string` | ✅ | Bileşenin ait olduğu level ID'si |
| `componentType` | `ComponentType` | ✅ | Seçilen bileşen türü |
| `componentId` | `string \| undefined` | ❌ | Düzenleme modunda mevcut bileşen ID'si |
| `initialContent` | `Json \| undefined` | ❌ | Başlangıç içeriği (düzenleme için) |
| `initialOrder` | `number` | ✅ | Bileşenin sıra numarası |
| `onClose` | `() => void` | ✅ | Drawer kapatıldığında çalışan callback |
| `isOpen` | `boolean` | ✅ | Drawer'ın açık/kapalı durumu |

## Veri Yapıları

### ComponentType
```typescript
type ComponentType = {
  id: string;
  type_key: string;
  display_name: string;
  description: string | null;
  content_template: Json | null;
  icon_key: string | null;
  icon_family: string | null;
  estimated_duration_minutes: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};
```

### ComponentItem
```typescript
interface ComponentItem {
  id: string;
  type: string;
  display_name: string;
  content: Json;
  order: number;
}
```

## Tab Sistemi Detayları

### 1. JSON Editor Tab
- Monaco benzeri JSON düzenleyici
- Gerçek zamanlı JSON validasyonu
- Format düzeltme özelliği
- Hata gösterimi

### 2. Form Editor Tab
- JSON'dan otomatik form alanları oluşturma
- Desteklenen tipler: `string`, `number`, `boolean`, `object`, `array`
- Dinamik alan ekleme/silme
- İki yönlü veri bağlama (JSON ↔ Form)

### 3. LLM Tools Tab
- Şu anda placeholder
- Gelecekte AI destekli özellikler için hazır
- Otomatik içerik üretimi
- Bileşen önerileri

## ContentHierarchyService Entegrasyonu

Drawer, tüm değişiklikleri ContentHierarchyService üzerinden gerçekleştirir:

- **Yeni bileşen**: `hierarchyService.addComponent(levelId, newComponent)`
- **Güncelleme**: `hierarchyService.updateComponent(componentId, changes)`
- **Undo/Redo desteği**: Otomatik olarak command history'ye eklenir

## Stil ve Tema

Drawer, Tailwind CSS ile stillendirilmiştir ve aşağıdaki tasarım prensiplerini takip eder:

- **Renk paleti**: Primary blue (#3B82F6), gray tonları
- **Tipografi**: Font ağırlıkları ve boyutları Tailwind standardı
- **Spacing**: Tutarlı padding/margin değerleri
- **Animasyonlar**: Smooth açılma/kapanma efektleri

## Örnek Kullanım Senaryoları

### 1. AddComponentButton ile Entegrasyon

```tsx
import AddComponentButton from "@/components/global/button/AddComponentButton";
import ComponentEditDrawer from "@/components/global/ComponentEditDrawer";

const ContentEditor = () => {
  const [drawerState, setDrawerState] = useState({
    isOpen: false,
    componentType: null,
    levelId: "",
    order: 0
  });

  const handleComponentTypeSelect = (componentType: ComponentType) => {
    setDrawerState({
      isOpen: true,
      componentType,
      levelId: currentLevelId,
      order: getNextOrder()
    });
  };

  return (
    <>
      <AddComponentButton 
        componentTypes={availableTypes}
        onComponentTypeSelect={handleComponentTypeSelect}
      />
      
      {drawerState.isOpen && (
        <ComponentEditDrawer
          levelId={drawerState.levelId}
          componentType={drawerState.componentType}
          initialOrder={drawerState.order}
          onClose={() => setDrawerState(prev => ({ ...prev, isOpen: false }))}
          isOpen={drawerState.isOpen}
        />
      )}
    </>
  );
};
```

### 2. Component List'ten Düzenleme

```tsx
const ComponentList = ({ components }) => {
  const [editState, setEditState] = useState(null);

  const handleEdit = (component) => {
    setEditState({
      isOpen: true,
      componentType: getComponentType(component.type),
      componentId: component.id,
      content: component.content,
      order: component.order
    });
  };

  return (
    <>
      {components.map(component => (
        <div key={component.id}>
          {/* Component display */}
          <button onClick={() => handleEdit(component)}>
            Düzenle
          </button>
        </div>
      ))}
      
      {editState && (
        <ComponentEditDrawer
          levelId={levelId}
          componentType={editState.componentType}
          componentId={editState.componentId}
          initialContent={editState.content}
          initialOrder={editState.order}
          onClose={() => setEditState(null)}
          isOpen={editState.isOpen}
        />
      )}
    </>
  );
};
```

## Geliştirme Notları

### Monaco Editor Entegrasyonu (Opsiyonel)

JSON Tab şu anda basit textarea kullanıyor. Monaco Editor eklemek için:

```bash
npm install @monaco-editor/react
```

```tsx
// ComponentEditJsonTab.tsx içinde
import Editor from '@monaco-editor/react';

// textarea yerine:
<Editor
  height="400px"
  defaultLanguage="json"
  value={jsonString}
  onChange={handleJsonChange}
  options={{
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
  }}
/>
```

### Özelleştirme

Drawer'ı projenize göre özelleştirmek için:

1. **Renk paleti**: Tailwind config'de primary renkleri değiştirin
2. **Layout**: `ComponentEditDrawer.tsx`'deki grid/flex yapısını düzenleyin
3. **Tab sistemi**: Yeni tab'lar eklemek için `ComponentEditTabs.tsx`'yi güncelleyin

### Test Etme

Örnek kullanım için `ComponentEditDrawer.example.tsx` dosyasını çalıştırın:

```tsx
import ComponentEditDrawerExample from "@/components/global/ComponentEditDrawer.example";

// App veya page component'inizde
<ComponentEditDrawerExample />
```

## Bilinen Sınırlamalar

1. **Monaco Editor**: Şu anda basit textarea, Monaco eklenebilir
2. **Form Editor**: Nested object'ler için basit JSON textarea kullanıyor
3. **Önizleme**: ComponentPreview basit JSON gösterimi yapıyor, gerçek bileşen render'ı yapılabilir
4. **LLM Tab**: Henüz sadece placeholder

## Katkıda Bulunma

Bu bileşeni geliştirmek için:

1. Yeni özellikler için ayrı tab'lar ekleyin
2. Form Editor'de daha karmaşık field tipleri destekleyin
3. Monaco Editor entegrasyonu yapın
4. Component Preview'u gerçek bileşen render'ı ile değiştirin

---

**Not**: Bu bileşen modüler tasarımla oluşturulmuştur ve projenizdeki diğer bileşenlerle kolayca entegre olabilir. 