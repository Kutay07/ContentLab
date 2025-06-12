import {
  ContentHierarchyService,
  contentHierarchyService,
} from "./ContentHierarchyService";
import {
  LevelGroupItem,
  LevelItem,
  ComponentItem,
} from "../types/LevelHierarchy";

/**
 * ContentHierarchyService Kullanım Örnekleri
 * Bu dosya servisin nasıl kullanılacağını gösterir
 */

// Singleton instance'ı al
const service = contentHierarchyService;

// ============ TEMEL KULLANIM ÖRNEKLERİ ============

export function basicUsageExample() {
  console.log("=== Temel Kullanım Örneği ===");

  // Servisi sıfırla
  service.reset();

  // 1. Level Group ekle
  const group1: LevelGroupItem = {
    id: "group-1",
    title: "JavaScript Temelleri",
    order: 0,
    levels: [],
  };

  service.addLevelGroup(group1);
  console.log("Group eklendi:", service.getLevelGroupById("group-1"));

  // 2. Level ekle
  const level1: LevelItem = {
    id: "level-1",
    title: "Değişkenler ve Veri Tipleri",
    icon_key: "variable",
    icon_family: "material",
    xp_reward: 50,
    order: 0,
    components: [],
  };

  service.addLevel("group-1", level1);
  console.log("Level eklendi:", service.getLevelById("level-1"));

  // 3. Component ekle
  const component1: ComponentItem = {
    id: "component-1",
    type: "text",
    display_name: "Giriş Metni",
    content: { text: "JavaScript'e hoş geldiniz!" },
    order: 0,
  };

  service.addComponent("level-1", component1);
  console.log("Component eklendi:", service.getComponentById("component-1"));

  // 4. Hierarchy'yi görüntüle
  console.log(
    "Tüm Hierarchy:",
    JSON.stringify(service.getHierarchy(), null, 2)
  );
}

// ============ UNDO/REDO ÖRNEĞİ ============

export function undoRedoExample() {
  console.log("\n=== Undo/Redo Örneği ===");

  service.reset();

  // İlk group'u ekle
  const group1: LevelGroupItem = {
    id: "group-1",
    title: "İlk Group",
    order: 0,
    levels: [],
  };
  service.addLevelGroup(group1);

  console.log("Group sayısı (1 bekleniyor):", service.getStats().groupCount);

  // İkinci group'u ekle
  const group2: LevelGroupItem = {
    id: "group-2",
    title: "İkinci Group",
    order: 1,
    levels: [],
  };
  service.addLevelGroup(group2);

  console.log("Group sayısı (2 bekleniyor):", service.getStats().groupCount);

  // Undo yap
  service.undo();
  console.log(
    "Undo sonrası group sayısı (1 bekleniyor):",
    service.getStats().groupCount
  );

  // Redo yap
  service.redo();
  console.log(
    "Redo sonrası group sayısı (2 bekleniyor):",
    service.getStats().groupCount
  );
}

// ============ SUBSCRIPTION ÖRNEĞİ ============

export function subscriptionExample() {
  console.log("\n=== Subscription Örneği ===");

  service.reset();

  // Listener ekle
  const unsubscribe = service.subscribe((hierarchy) => {
    console.log("Hierarchy değişti! Group sayısı:", hierarchy.length);
  });

  // Değişiklik yap (listener tetiklenecek)
  const group: LevelGroupItem = {
    id: "sub-group-1",
    title: "Subscription Test Group",
    order: 0,
    levels: [],
  };
  service.addLevelGroup(group);

  // Başka bir değişiklik
  service.updateLevelGroup("sub-group-1", { title: "Güncellenmiş Başlık" });

  // Listener'ı kaldır
  unsubscribe();

  // Bu değişiklik listener'ı tetiklemeyecek
  service.deleteLevelGroup("sub-group-1");
  console.log("Listener kaldırıldı, son değişiklik sessizce yapıldı");
}

// ============ TRANSACTION ÖRNEĞİ ============

export function transactionExample() {
  console.log("\n=== Transaction Örneği ===");

  service.reset();

  console.log(
    "Transaction öncesi undo stack boyutu:",
    service.getStats().undoStackSize
  );

  // Transaction başlat
  service.beginTransaction();

  // Birden fazla operasyon yap
  const group: LevelGroupItem = {
    id: "trans-group-1",
    title: "Transaction Group",
    order: 0,
    levels: [],
  };
  service.addLevelGroup(group);

  const level: LevelItem = {
    id: "trans-level-1",
    title: "Transaction Level",
    icon_key: null,
    icon_family: null,
    xp_reward: 25,
    order: 0,
    components: [],
  };
  service.addLevel("trans-group-1", level);

  const component: ComponentItem = {
    id: "trans-component-1",
    type: "quiz",
    display_name: "Transaction Quiz",
    content: { question: "Test sorusu" },
    order: 0,
  };
  service.addComponent("trans-level-1", component);

  // Transaction'ı sonlandır
  service.endTransaction();

  console.log(
    "Transaction sonrası undo stack boyutu:",
    service.getStats().undoStackSize
  );
  console.log("Transaction sonrası toplam items:", service.getStats());

  // Tek undo ile tüm transaction geri alınır
  service.undo();
  console.log(
    "Undo sonrası group sayısı (0 bekleniyor):",
    service.getStats().groupCount
  );
}

// ============ SERİALİZATION ÖRNEĞİ ============

export function serializationExample() {
  console.log("\n=== Serialization Örneği ===");

  service.reset();

  // Örnek veri oluştur
  const group: LevelGroupItem = {
    id: "ser-group-1",
    title: "Serialization Test",
    order: 0,
    levels: [],
  };
  service.addLevelGroup(group);

  const level: LevelItem = {
    id: "ser-level-1",
    title: "Test Level",
    icon_key: "book",
    icon_family: "material",
    xp_reward: 100,
    order: 0,
    components: [],
  };
  service.addLevel("ser-group-1", level);

  // Serialize et
  const serialized = service.serialize();
  console.log("Serialized data uzunluğu:", serialized.length);
  console.log(
    "Serialized data (ilk 200 karakter):",
    serialized.substring(0, 200) + "..."
  );

  // Servisi sıfırla
  service.reset();
  console.log("Reset sonrası group sayısı:", service.getStats().groupCount);

  // Deserialize et
  service.deserialize(serialized);
  console.log(
    "Deserialize sonrası group sayısı:",
    service.getStats().groupCount
  );
  console.log(
    "Deserialize sonrası group:",
    service.getLevelGroupById("ser-group-1")
  );
}

// ============ VALIDATION ÖRNEĞİ ============

export function validationExample() {
  console.log("\n=== Validation Örneği ===");

  service.reset();

  // Geçerli veri ekle
  const group: LevelGroupItem = {
    id: "val-group-1",
    title: "Validation Test",
    order: 0,
    levels: [],
  };
  service.addLevelGroup(group);

  console.log("Geçerli hierarchy validation:", service.validateHierarchy());

  // Manuelde bozuk veri ekle (dikkatli kullanım)
  const hierarchy = service.getHierarchy();
  if (hierarchy.length > 0) {
    // Order değerlerini boz
    hierarchy[0].order = -1;

    // Repair işlemi
    service.repairHierarchy();
    console.log("Repair sonrası validation:", service.validateHierarchy());
  }
}

// ============ MOVE OPERATIONS ÖRNEĞİ ============

export function moveOperationsExample() {
  console.log("\n=== Move Operations Örneği ===");

  service.reset();

  // İki group oluştur
  const group1: LevelGroupItem = {
    id: "move-group-1",
    title: "İlk Group",
    order: 0,
    levels: [],
  };
  const group2: LevelGroupItem = {
    id: "move-group-2",
    title: "İkinci Group",
    order: 1,
    levels: [],
  };

  service.addLevelGroup(group1);
  service.addLevelGroup(group2);

  // İlk group'a level ekle
  const level1: LevelItem = {
    id: "move-level-1",
    title: "Taşınacak Level",
    icon_key: null,
    icon_family: null,
    xp_reward: 50,
    order: 0,
    components: [],
  };
  service.addLevel("move-group-1", level1);

  // Level'a component ekle
  const component1: ComponentItem = {
    id: "move-component-1",
    type: "text",
    display_name: "Taşınacak Component",
    content: { text: "Bu component taşınacak" },
    order: 0,
  };
  service.addComponent("move-level-1", component1);

  console.log(
    "İlk durumda group-1'deki level sayısı:",
    service.getLevelGroupById("move-group-1")?.levels.length
  );
  console.log(
    "İlk durumda group-2'deki level sayısı:",
    service.getLevelGroupById("move-group-2")?.levels.length
  );

  // Level'ı ikinci group'a taşı
  service.moveLevel("move-level-1", 0, "move-group-2");

  console.log(
    "Taşıma sonrası group-1'deki level sayısı:",
    service.getLevelGroupById("move-group-1")?.levels.length
  );
  console.log(
    "Taşıma sonrası group-2'deki level sayısı:",
    service.getLevelGroupById("move-group-2")?.levels.length
  );

  // Component'ı başka bir level'a taşımak için önce yeni level oluştur
  const level2: LevelItem = {
    id: "move-level-2",
    title: "Hedef Level",
    icon_key: null,
    icon_family: null,
    xp_reward: 25,
    order: 1,
    components: [],
  };
  service.addLevel("move-group-2", level2);

  console.log(
    "Component taşıma öncesi level-1 component sayısı:",
    service.getLevelById("move-level-1")?.components.length
  );
  console.log(
    "Component taşıma öncesi level-2 component sayısı:",
    service.getLevelById("move-level-2")?.components.length
  );

  // Component'ı taşı
  service.moveComponent("move-component-1", 0, "move-level-2");

  console.log(
    "Component taşıma sonrası level-1 component sayısı:",
    service.getLevelById("move-level-1")?.components.length
  );
  console.log(
    "Component taşıma sonrası level-2 component sayısı:",
    service.getLevelById("move-level-2")?.components.length
  );
}

// ============ COMMAND HISTORY ÖRNEĞİ ============

export function commandHistoryExample() {
  console.log("\n=== Command History Örneği ===");

  service.reset();

  // Birkaç operasyon yap
  const group: LevelGroupItem = {
    id: "cmd-group-1",
    title: "Command Test",
    order: 0,
    levels: [],
  };
  service.addLevelGroup(group);

  service.updateLevelGroup("cmd-group-1", { title: "Güncellenmiş Başlık" });

  service.undo();
  service.redo();

  // Command history'yi görüntüle
  const history = service.getCommandHistory();
  console.log("Command history:");
  history.forEach((cmd, index) => {
    console.log(
      `${index + 1}. ${cmd.type} - ${new Date(
        cmd.timestamp
      ).toLocaleTimeString()}`
    );
  });
}

// ============ TÜM ÖRNEKLERİ ÇALIŞTIR ============

export function runAllExamples() {
  basicUsageExample();
  undoRedoExample();
  subscriptionExample();
  transactionExample();
  serializationExample();
  validationExample();
  moveOperationsExample();
  commandHistoryExample();

  console.log("\n=== Son İstatistikler ===");
  console.log("Servis istatistikleri:", service.getStats());
}

// React component'ında kullanım örneği
// Aşağıdaki hook React uygulamanızda kullanılabilir
/*
import { useState, useEffect } from 'react';

export const useContentHierarchy = () => {
  // React hook olarak kullanım
  const [hierarchy, setHierarchy] = useState(() => service.getHierarchy());
  
  useEffect(() => {
    const unsubscribe = service.subscribe(setHierarchy);
    return unsubscribe;
  }, []);
  
  return {
    hierarchy,
    service: {
      addLevelGroup: service.addLevelGroup.bind(service),
      updateLevelGroup: service.updateLevelGroup.bind(service),
      deleteLevelGroup: service.deleteLevelGroup.bind(service),
      addLevel: service.addLevel.bind(service),
      updateLevel: service.updateLevel.bind(service),
      deleteLevel: service.deleteLevel.bind(service),
      addComponent: service.addComponent.bind(service),
      updateComponent: service.updateComponent.bind(service),
      deleteComponent: service.deleteComponent.bind(service),
      undo: service.undo.bind(service),
      redo: service.redo.bind(service),
      moveLevel: service.moveLevel.bind(service),
      moveComponent: service.moveComponent.bind(service),
      moveLevelGroup: service.moveLevelGroup.bind(service),
      getStats: service.getStats.bind(service),
      serialize: service.serialize.bind(service),
      deserialize: service.deserialize.bind(service),
      validateHierarchy: service.validateHierarchy.bind(service),
      repairHierarchy: service.repairHierarchy.bind(service),
      beginTransaction: service.beginTransaction.bind(service),
      endTransaction: service.endTransaction.bind(service)
    }
  };
};
*/
