# ContentHierarchyService

Hierarchical content editörü için tasarlanmış, tam özellikli in-memory veri yönetim servisi.

## Temel Özellikler

- ✅ **CRUD Operasyonları**: LevelGroup, Level ve Component'ler için tam CRUD desteği
- ✅ **Undo/Redo**: Gelişmiş geri alma ve yineleme sistemi
- ✅ **Reactive Updates**: Subscription tabanlı reaktif güncellemeler
- ✅ **Transaction Support**: Çoklu operasyonları tek adımda geri alma
- ✅ **Serialization**: JSON import/export desteği
- ✅ **Validation**: Veri yapısı doğrulama ve otomatik tamir
- ✅ **Command History**: Operasyon geçmişi takibi
- ✅ **Singleton Pattern**: Uygulama genelinde tek instance

## Hızlı Başlangıç

```typescript
import { contentHierarchyService } from './services/ContentHierarchyService';

// Servis instance'ını al
const service = contentHierarchyService;

// Level Group ekle
service.addLevelGroup({
  id: 'group-1',
  title: 'JavaScript Temelleri',
  order: 0,
  levels: []
});

// Level ekle
service.addLevel('group-1', {
  id: 'level-1',
  title: 'Değişkenler',
  icon_key: 'variable',
  icon_family: 'material',
  xp_reward: 50,
  order: 0,
  components: []
});

// Component ekle
service.addComponent('level-1', {
  id: 'component-1',
  type: 'text',
  display_name: 'Giriş',
  content: { text: 'JavaScript\'e hoş geldiniz!' },
  order: 0
});
```

## React Integration

```typescript
import { useState, useEffect } from 'react';
import { contentHierarchyService } from './services/ContentHierarchyService';

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
    service: contentHierarchyService
  };
};
```

## Ana API Metotları

### Level Group Operations
- `addLevelGroup(group: LevelGroupItem)`
- `updateLevelGroup(groupId: string, fields: Partial<LevelGroupItem>)`
- `moveLevelGroup(groupId: string, newOrder: number)`
- `deleteLevelGroup(groupId: string)`

### Level Operations
- `addLevel(groupId: string, level: LevelItem)`
- `updateLevel(levelId: string, fields: Partial<LevelItem>)`
- `moveLevel(levelId: string, newOrder: number, newGroupId?: string)`
- `deleteLevel(levelId: string)`

### Component Operations
- `addComponent(levelId: string, component: ComponentItem)`
- `updateComponent(componentId: string, fields: Partial<ComponentItem>)`
- `moveComponent(componentId: string, newOrder: number, newLevelId?: string)`
- `deleteComponent(componentId: string)`

### Undo/Redo
- `undo()` - Son işlemi geri al
- `redo()` - Geri alınan işlemi yinele
- `clearUndoHistory()` - Geçmişi temizle

### Data Access
- `getHierarchy()` - Tüm veri yapısını al
- `getLevelGroupById(id: string)` - ID ile group bul
- `getLevelById(id: string)` - ID ile level bul
- `getComponentById(id: string)` - ID ile component bul

### Reactive Updates
- `subscribe(listener: (hierarchy) => void)` - Değişiklikleri dinle

### Transaction Support
- `beginTransaction()` - Transaction başlat
- `endTransaction()` - Transaction bitir (tüm değişiklikler tek undo adımı olur)

### Serialization
- `serialize()` - JSON string'e çevir
- `deserialize(json: string)` - JSON'dan yükle

### Validation
- `validateHierarchy()` - Yapı geçerliliğini kontrol et
- `repairHierarchy()` - Otomatik tamir yap

### Utility
- `getStats()` - Servis istatistikleri
- `getCommandHistory()` - Komut geçmişi
- `reset()` - Servisi sıfırla

## Örnek Kullanımlar

Detaylı örnekler için `ContentHierarchyService.example.ts` dosyasına bakın.

## Veri Yapısı

```typescript
LevelHierarchy = LevelGroupItem[]
  └── LevelGroupItem
      ├── id: string
      ├── title: string  
      ├── order: number
      └── levels: LevelItem[]
          └── LevelItem
              ├── id: string
              ├── title: string
              ├── icon_key: string | null
              ├── icon_family: string | null
              ├── xp_reward: number
              ├── order: number
              └── components: ComponentItem[]
                  └── ComponentItem
                      ├── id: string
                      ├── type: string
                      ├── display_name: string
                      ├── content: any
                      └── order: number
```

## Performans

- Singleton pattern ile tek instance
- Deep clone ile immutable updates
- Otomatik order yeniden düzenleme
- Memory-efficient undo/redo (son 50 adım)
- Command history sınırlaması (son 100 komut) 