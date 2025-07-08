Aşağıdaki yol haritası, ContentHierarchyService’i “tam kapasite” devreye almak, tüm React bileşenlerini bu servise bağlamak ve ileride veritabanı senkronizasyonuna hazırlık yapmak için ayrıntılı olarak sıralanmıştır.
(Plan; mevcut kod yapısı, eksikler ve gerekecek yeni modüller/işlevler dikkate alınarak hazırlandı.)

## 1. Mimari & Genel Akış

### 1.1 Tek Kaynak (Source of Truth)

Uygulamadaki LEVEL / COMPONENT hiyerarşisinin tamamı yalnızca ContentHierarchyService içinde tutulacak.
React tarafı, bu servisten read-only kopyalar alacak; mutasyonlar doğrudan servisin metodlarıyla yapılacak.
Değişiklikler yayın-abonelik (subscribe) ile bileşenlere aktarılacak → Re-render tetiklenecek.

### 1.2 Başlangıç & Temel Context

HierarchyProvider adlı bir React Context oluşturun.
 – Mount sırasında contentHierarchyService.subscribe(setState) ile dinleyici ekler.
 – value olarak { hierarchy, service } döndürür.
 – Unmount’ta unsubscribe.
Tüm edit/preview/layout bileşenleri bu providera sarılacak (ör: src/app/layout.tsx içinde).

### 1.3 İlk Yüklenen “baseline” kopya

Supabase’den gelen orijinal hiyerarşi, servis içindeki beginTransaction() + deserialize() ile yüklensin.
Ayrı bir ref’te (örn. React Ref veya servis içinde baselineHierarchy) saklanacak.
 Bu, görsel farklandırma (diff) için referans olacak.

## 2. ContentHierarchyService – Gereken Ek İşlevler

### 2.1 Undo/Redo Bilgilerini Dışa Açma

getUndoStackSize() & getRedoStackSize() → Header’daki butonların enable/disable durumu için.
peekUndoHistory(limit: number) → Son N komutu label-leriyle döner (dropdown listesi).
 ✓ Komutun type alanı başlık olarak, payload özetlenerek dönebilir.

### 2.2 Çoklu Undo

undoSteps(count: number) → döngü içinde undo() çağırmak yerine tek seferde geri alır.

### 2.3 Taslak Yönetimi Yardımcıları

exportDraft(): string → serialize() in kısayolu.
importDraft(json: string): void → deserialize() in kısayolu.
 (İleride veritabanı tablosuna bağlanırken aynı interface korunsun.)

### 2.4 Diff Yardımcısı (Görsel geri bildirim için)

diffWithBaseline(baseline: LevelHierarchy): { addedIds: Set<string>; updatedIds: Set<string> }
 – ID yoksa ➜ added,
 – ID var ama JSON.stringify(item) !== stringify(baselineItem) ➜ updated.
Bu metot sadece LevelGroup/Level/Component düzeyinde id setleri döndürür.
 Bileşenler, ID’si kendi listesinde ise nokta gösterecek.

## 3. Yeni Kontroller İçin Bar

uygulama ekranında önizlemenin üzerinde görüntülenecek bir kontrol barı oluşturulacak.

### 3.1 Görsel Düzen

a) Undo (ikonlu buton)
 b) Undo-Dropdown (geçmiş listesi)
 c) Redo butonu
 d) Taslak Adı (input, 160px)
 e) “Taslak Kaydet” butonu
 f) “Taslak Yükle” dropdown’u

### 3.2 Davranış

Undo butonu → service.undo()
Undo-Dropdown seçimi n adım seçilince → service.undoSteps(n)
Redo butonu → service.redo()
Kaydet butonu:
 – Input boşsa “taslak-{timestamp}” adı kullan.
 – localStorage.setItem("draft*"+name, service.exportDraft())
 – Toast ile “Kaydedildi”.
Yükle dropdown’u gösterirken:
 Object.keys(localStorage).filter(k=>k.startsWith("draft*"))
 Seçilen kaydı al → service.importDraft(json)
Buton enable şartları:
 – Undo için getUndoStackSize()>0
 – Redo için getRedoStackSize()>0

## 4. ContentPreview.tsx – Görsel Diff Gösterimi

### 4.1 Provider’dan hierarchy ve service.diffWithBaseline() çıktıları alın.

const { addedIds, updatedIds } = diffWithBaseline(baseline)

### 4.2 Her LevelGroup/Level/Component kartında:

ID addedIds’te ise üst sağ köşeye küçük yeşil nokta.
updatedIds’te ise sarı nokta.
Hem eklendi hem güncellendi olamaz, öncelik added.
 (Stil: absolute position; Tailwind bg-green-500 w-2 h-2 rounded-full)

### 4.3 İstatistikler

Noktalı öğe sayıları “Özet” kısmına eklenebilir (isteğe bağlı).

## 5. “+Ekle” Butonları & Edit Drawer

### 5.1 AddLevelGroupButton / AddLevelButton / AddComponentButton

onAdd prop artık zorunlu.
ContentPreview kullanırken ilgili fonksiyonlar gönderilecek:
 – LevelGroup ➜ service.addLevelGroup(...)
 – Level ➜ service.addLevel(groupId, ...)
 – Component ➜ Drawer açılmadan önce service.addComponent(...) çağrısı edit-flow’da mevcut.

### 5.2 Sıra (order) Hesaplama

Buton içindeki logic → son order + 1, eksikse 0.
Service zaten add\* sırasında order boşsa push.length atıyor; tutarlılık korunur.

### 5.3 ComponentEditDrawer – Zaten servisi kullanıyor.

hierarchyService.updateComponent gibi çağrılar var.
 ✓ Sadece order değişikliği güncellendiğinde servisin reorder ettiği garanti.

## 6. Dropdownlardaki Sıra Taşıma (Drag & Drop opsiyonel)

• Kısa vadede buton seti (↑ ↓) ile moveLevel / moveComponent çağrılabilir.
Daha zengin UX için @dnd-kit veya react-beautiful-dnd ile sürükle-bırak → onDragEnd’de ilgili move\* çağrısı.

## 7. Taslak Altyapısı

### 7.1 Yerel Depolama Şeması

Key: draft*{appId?}*{name} (appId eklenirse aynı paneli farklı app’lerde ayrıştırır)
Value: JSON.stringify({ version:1, data: service.exportDraft() })

### 7.2 Migrasyon / Silme

“Taslağı Sil” seçeneği dropdown içinde listelenebilir.
Version bump gerektiğinde eski taslaklar parse edilip yükseltilebilir.

## 8. İleri Adımlar: Veritabanı Senkronizasyonu

• Taslaklar için drafts adında tablo (id, app_id, name, data, created_at, updated_at)…
learning-service.ts içine saveDraft, getDrafts, deleteDraft wrapper’ları.
Service’de markSynced() => diffWithBaseline(baseline= current) sıfırlama.
 (Veritabanına kaydedildiğinde tüm ek/güncel noktalar kaybolur.)

## 9. Test Stratejisi

• Unit: ContentHierarchyService → add/update/move/undo/redo/diff.
Integration:
 – HierarchyProvider + Header → butonların stack boştayken disable olması.
 – ContentPreview diff işaretleri.
E2E (Playwright):
 1) Yeni LevelGroup ekle → yeşil nokta görünmeli.
 2) Başlığı değiştir → yeşil kalkar, sarı nokta gelir.
 3) Undo → sarı nokta kaybolur.
 4) Kaydet & Yükle taslak; state korunmalı.

## 10. Yol Haritası & Öncelik

1. Service’e ek metotları ekle + Unit test.
2. HierarchyProvider (Context) yaz → App root’a ekle.
3. Header’ı yeni kontrollerle refaktör et; buttons→service çağrıları.
4. Taslak save/load (localStorage) fonksiyonelliği.
5. ContentPreview diff entegrasyonu.
6. AddButton’ların onAdd entegrasyonu + Level/Component taşıma butonları.
7. Drag-and-drop opsiyonel.
8. Veritabanı taslak tablosu (sonraki sprint).

## Ek Düşünceler & Öngörülmeyenler

Performans: Büyük hiyerarşilerde diff hesaplaması pahalı olabilir → memoize edin, useMemo + debounce.
Analytics/Loglama: addToCommandHistory zaten timestamp tutuyor; bunu gerektiğinde backend’e POST edebilirsiniz.
Bu plan tamamlandığında ContentHierarchyService tam entegre, geri-al/ileri-al yetenekli, taslak yönetimli ve görsel değişiklik geri bildirimi sunan bir editör altyapısı elde etmiş olacaksınız.

## 11. Yeni Modal Bileşenlerinin Entegrasyonu (AddLevelModal & AddLevelGroupModal)

### 11.1 Amaç

- Hover butonlarına tıklandığında doğrudan servis çağrısı yerine kullanıcıdan başlık almak için modal açmak.
- Modal kapatıldığında `ContentHierarchyService` üzerinden ilgili **add** operasyonu çalıştırmak.

### 11.2 Yapılacaklar

1. **UI Akışı**

   - `AddLevelButton` üzerine tıklayınca `AddLevelModal` açılacak.
   - `AddLevelGroupButton` üzerine tıklayınca `AddLevelGroupModal` açılacak.
   - Modal **Kaydet** butonu `onSave(title)` tetikleyecek.

2. **State Yönetimi**

   - Modal açık/kapalı state’i LevelGroupDropdown & ContentPreview içinde tutulacak (veya merkezi provider’da).
   - Seçilen **order** değeri hover alanından alınarak modal’a prop olarak geçilecek.

3. **Service Çağrıları**

   - `onSave` içinde:  
     • LevelGroup için:
     ```ts
     service.addLevelGroup({
       id: uuidv4(),
       title,
       order,
       levels: [],
     });
     ```
     • Level için:
     ```ts
     service.addLevel(groupId, {
       id: uuidv4(),
       title,
       order,
       icon_key: null,
       icon_family: null,
       xp_reward: 0,
       components: [],
     });
     ```

4. **Undo/Redo Uyumlu**

   - Modal üzerinden ekleme yapıldığında servis zaten `saveStateToUndo()` çağırdığı için undo/redo sorunsuz çalışacak.

5. **UI Dönütleri**

   - Başarılı ekleme sonrası Toast (opsiyonel).
   - Hata yakalama ve hata mesajı.

6. **Testler**
   - Modal aç/kapa render testleri.
   - `onSave` ile doğru servis metodunun çağrıldığını jest mock’larıyla doğrula.

### 11.3 Dosya Değişiklikleri

- `src/components/global/button/AddLevelButton.tsx`  
  • onAdd kaldırılacak, yerine `onClick={() => openLevelModal(order, groupId)}`
- `src/components/global/button/AddLevelGroupButton.tsx`  
  • Benzer şekilde modal açma fonksiyonu
- `ContentPreview` & `LevelGroupDropdown`  
  • Modal state & handler’ları ekle  
  • İlgili modal JSX’i render et

---
