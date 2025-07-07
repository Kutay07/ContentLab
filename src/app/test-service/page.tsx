"use client";

import { useState, useEffect } from "react";
import { ContentHierarchyService } from "@/services/ContentHierarchyService";
import {
  LevelHierarchy,
  LevelGroupItem,
  LevelItem,
  ComponentItem,
} from "@/types/LevelHierarchy";

export default function TestServicePage() {
  const [service] = useState(() => ContentHierarchyService.getInstance());
  const [hierarchy, setHierarchy] = useState<LevelHierarchy>([]);
  const [stats, setStats] = useState<any>({});
  const [undoHistory, setUndoHistory] = useState<any[]>([]);
  const [diff, setDiff] = useState<{
    addedIds: Set<string>;
    updatedIds: Set<string>;
  } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [draftName, setDraftName] = useState("");
  const [savedDrafts, setSavedDrafts] = useState<string[]>([]);

  // Sample data
  const sampleGroup: LevelGroupItem = {
    id: `group-${Date.now()}`,
    title: "Test Seviye Grubu",
    order: 0,
    levels: [],
  };

  const sampleLevel: LevelItem = {
    id: `level-${Date.now()}`,
    title: "Test Seviyesi",
    icon_key: "star",
    icon_family: "feather",
    xp_reward: 100,
    order: 0,
    components: [],
  };

  const sampleComponent: ComponentItem = {
    id: `component-${Date.now()}`,
    type: "flashcard",
    display_name: "Test Kartı",
    content: { front: "Test Soru", back: "Test Cevap" },
    order: 0,
  };

  const addLog = (message: string) => {
    setLogs((prev) => [
      `${new Date().toLocaleTimeString()}: ${message}`,
      ...prev.slice(0, 9),
    ]);
  };

  const updateStats = () => {
    setStats(service.getStats());
    setUndoHistory(service.peekUndoHistory(5));
    setDiff(service.diffWithBaseline());
  };

  useEffect(() => {
    const unsubscribe = service.subscribe((newHierarchy) => {
      setHierarchy(newHierarchy);
      updateStats();
    });

    // Load saved drafts from localStorage
    const drafts = Object.keys(localStorage).filter((key) =>
      key.startsWith("draft-")
    );
    setSavedDrafts(drafts.map((key) => key.replace("draft-", "")));

    updateStats();
    return unsubscribe;
  }, [service]);

  // === LEVEL GROUP OPERATIONS ===
  const testAddLevelGroup = () => {
    const newGroup = {
      ...sampleGroup,
      id: `group-${Date.now()}`,
      title: `Grup ${hierarchy.length + 1}`,
    };
    service.addLevelGroup(newGroup);
    addLog(`Yeni grup eklendi: ${newGroup.title}`);
  };

  const testUpdateFirstGroup = () => {
    if (hierarchy.length > 0) {
      service.updateLevelGroup(hierarchy[0].id, {
        title: `Güncellenmiş Grup - ${Date.now()}`,
      });
      addLog("İlk grup güncellendi");
    } else {
      addLog("Güncellenecek grup bulunamadı");
    }
  };

  const testMoveLevelGroup = () => {
    if (hierarchy.length > 1) {
      service.moveLevelGroup(hierarchy[0].id, hierarchy.length - 1);
      addLog("İlk grup sona taşındı");
    } else {
      addLog("Taşınacak grup bulunamadı (en az 2 grup gerekli)");
    }
  };

  const testDeleteLastGroup = () => {
    if (hierarchy.length > 0) {
      const lastGroup = hierarchy[hierarchy.length - 1];
      service.deleteLevelGroup(lastGroup.id);
      addLog(`Son grup silindi: ${lastGroup.title}`);
    } else {
      addLog("Silinecek grup bulunamadı");
    }
  };

  // === LEVEL OPERATIONS ===
  const testAddLevel = () => {
    if (hierarchy.length > 0) {
      const newLevel = {
        ...sampleLevel,
        id: `level-${Date.now()}`,
        title: `Seviye ${hierarchy[0].levels.length + 1}`,
      };
      service.addLevel(hierarchy[0].id, newLevel);
      addLog(`Yeni seviye eklendi: ${newLevel.title}`);
    } else {
      addLog("Seviye eklemek için önce grup oluşturun");
    }
  };

  const testUpdateFirstLevel = () => {
    for (const group of hierarchy) {
      if (group.levels.length > 0) {
        service.updateLevel(group.levels[0].id, {
          title: `Güncellenmiş Seviye - ${Date.now()}`,
          xp_reward: 200,
        });
        addLog("İlk seviye güncellendi");
        return;
      }
    }
    addLog("Güncellenecek seviye bulunamadı");
  };

  const testMoveLevel = () => {
    let sourceLevel: LevelItem | null = null;
    let targetGroupId: string | null = null;

    // Find a level to move
    for (const group of hierarchy) {
      if (group.levels.length > 0) {
        sourceLevel = group.levels[0];
        break;
      }
    }

    // Find a different group as target
    if (hierarchy.length > 1) {
      targetGroupId = hierarchy[1].id;
    }

    if (sourceLevel && targetGroupId) {
      service.moveLevel(sourceLevel.id, 0, targetGroupId);
      addLog("Seviye farklı gruba taşındı");
    } else {
      addLog("Taşınacak seviye veya hedef grup bulunamadı");
    }
  };

  const testDeleteFirstLevel = () => {
    for (const group of hierarchy) {
      if (group.levels.length > 0) {
        const level = group.levels[0];
        service.deleteLevel(level.id);
        addLog(`Seviye silindi: ${level.title}`);
        return;
      }
    }
    addLog("Silinecek seviye bulunamadı");
  };

  // === COMPONENT OPERATIONS ===
  const testAddComponent = () => {
    for (const group of hierarchy) {
      for (const level of group.levels) {
        const newComponent = {
          ...sampleComponent,
          id: `component-${Date.now()}`,
          display_name: `Bileşen ${level.components.length + 1}`,
        };
        service.addComponent(level.id, newComponent);
        addLog(`Yeni bileşen eklendi: ${newComponent.display_name}`);
        return;
      }
    }
    addLog("Bileşen eklemek için önce seviye oluşturun");
  };

  const testUpdateFirstComponent = () => {
    for (const group of hierarchy) {
      for (const level of group.levels) {
        if (level.components.length > 0) {
          service.updateComponent(level.components[0].id, {
            display_name: `Güncellenmiş Bileşen - ${Date.now()}`,
            content: { front: "Yeni Soru", back: "Yeni Cevap" },
          });
          addLog("İlk bileşen güncellendi");
          return;
        }
      }
    }
    addLog("Güncellenecek bileşen bulunamadı");
  };

  const testMoveComponent = () => {
    let sourceComponent: ComponentItem | null = null;
    let targetLevelId: string | null = null;

    // Find a component to move
    for (const group of hierarchy) {
      for (const level of group.levels) {
        if (level.components.length > 0) {
          sourceComponent = level.components[0];
          break;
        }
      }
      if (sourceComponent) break;
    }

    // Find a different level as target
    for (const group of hierarchy) {
      for (const level of group.levels) {
        if (!sourceComponent || level.id !== (sourceComponent as any).levelId) {
          targetLevelId = level.id;
          break;
        }
      }
      if (targetLevelId) break;
    }

    if (sourceComponent && targetLevelId) {
      service.moveComponent(sourceComponent.id, 0, targetLevelId);
      addLog("Bileşen farklı seviyeye taşındı");
    } else {
      addLog("Taşınacak bileşen veya hedef seviye bulunamadı");
    }
  };

  const testDeleteFirstComponent = () => {
    for (const group of hierarchy) {
      for (const level of group.levels) {
        if (level.components.length > 0) {
          const component = level.components[0];
          service.deleteComponent(component.id);
          addLog(`Bileşen silindi: ${component.display_name}`);
          return;
        }
      }
    }
    addLog("Silinecek bileşen bulunamadı");
  };

  // === UNDO/REDO OPERATIONS ===
  const testUndo = () => {
    service.undo();
    addLog("Geri al yapıldı");
  };

  const testRedo = () => {
    service.redo();
    addLog("İleri al yapıldı");
  };

  const testUndoSteps = () => {
    service.undoSteps(2);
    addLog("2 adım geri alındı");
  };

  const testClearUndoHistory = () => {
    service.clearUndoHistory();
    addLog("Geri al geçmişi temizlendi");
  };

  // === BASELINE OPERATIONS ===
  const testSetBaseline = () => {
    service.setBaseline();
    addLog("Baseline ayarlandı");
  };

  const testGetBaseline = () => {
    const baseline = service.getBaseline();
    console.log("Baseline:", baseline);
    addLog(`Baseline alındı (${baseline.length} grup)`);
  };

  const testMarkSynced = () => {
    service.markSynced();
    addLog("Senkronize olarak işaretlendi");
  };

  // === TRANSACTION OPERATIONS ===
  const testTransaction = () => {
    service.beginTransaction();
    addLog("Transaction başlatıldı");

    // Add multiple items in transaction
    const group1 = {
      ...sampleGroup,
      id: `tx-group-1-${Date.now()}`,
      title: "Transaction Grup 1",
    };
    const group2 = {
      ...sampleGroup,
      id: `tx-group-2-${Date.now()}`,
      title: "Transaction Grup 2",
    };

    service.addLevelGroup(group1);
    service.addLevelGroup(group2);

    service.endTransaction();
    addLog("Transaction tamamlandı (2 grup eklendi)");
  };

  // === DRAFT OPERATIONS ===
  const testExportDraft = () => {
    const json = service.exportDraft();
    console.log("Exported Draft:", json);
    addLog("Taslak export edildi (console'da görüntüle)");
  };

  const testSaveDraft = () => {
    if (!draftName.trim()) {
      addLog("Taslak adı giriniz");
      return;
    }

    const json = service.exportDraft();
    localStorage.setItem(`draft-${draftName}`, json);
    setSavedDrafts((prev) => [...prev, draftName]);
    addLog(`Taslak kaydedildi: ${draftName}`);
    setDraftName("");
  };

  const testLoadDraft = (name: string) => {
    const json = localStorage.getItem(`draft-${name}`);
    if (json) {
      service.importDraft(json);
      addLog(`Taslak yüklendi: ${name}`);
    } else {
      addLog("Taslak bulunamadı");
    }
  };

  const testDeleteDraft = (name: string) => {
    localStorage.removeItem(`draft-${name}`);
    setSavedDrafts((prev) => prev.filter((n) => n !== name));
    addLog(`Taslak silindi: ${name}`);
  };

  // === VALIDATION OPERATIONS ===
  const testValidateHierarchy = () => {
    const isValid = service.validateHierarchy();
    addLog(`Hierarchy geçerliliği: ${isValid ? "GEÇERLİ" : "GEÇERSİZ"}`);
  };

  const testRepairHierarchy = () => {
    service.repairHierarchy();
    addLog("Hierarchy onarıldı");
  };

  // === UTILITY OPERATIONS ===
  const testGetData = () => {
    const group = hierarchy[0];
    if (group) {
      const retrievedGroup = service.getLevelGroupById(group.id);
      console.log("Retrieved Group:", retrievedGroup);
      addLog("İlk grup verileri alındı (console'da görüntüle)");
    } else {
      addLog("Alınacak grup bulunamadı");
    }
  };

  const testSerializeDeserialize = () => {
    const json = service.serialize();
    console.log("Serialized:", json);

    // Reset and deserialize
    service.reset();
    service.deserialize(json);
    addLog("Serialize/Deserialize test edildi");
  };

  const testReset = () => {
    service.reset();
    addLog("Servis sıfırlandı");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 ContentHierarchyService Test Laboratuvarı
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEVEL GROUP OPERATIONS */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">
              📁 Level Group İşlemleri
            </h2>
            <div className="space-y-2">
              <button
                onClick={testAddLevelGroup}
                className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                ➕ Grup Ekle
              </button>
              <button
                onClick={testUpdateFirstGroup}
                className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
              >
                ✏️ İlk Grup Güncelle
              </button>
              <button
                onClick={testMoveLevelGroup}
                className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
              >
                🔄 İlk Grup Taşı
              </button>
              <button
                onClick={testDeleteLastGroup}
                className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                🗑️ Son Grup Sil
              </button>
            </div>
          </div>

          {/* LEVEL OPERATIONS */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-green-600 mb-4">
              📊 Level İşlemleri
            </h2>
            <div className="space-y-2">
              <button
                onClick={testAddLevel}
                className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                ➕ Seviye Ekle
              </button>
              <button
                onClick={testUpdateFirstLevel}
                className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
              >
                ✏️ İlk Seviye Güncelle
              </button>
              <button
                onClick={testMoveLevel}
                className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
              >
                🔄 Seviye Taşı
              </button>
              <button
                onClick={testDeleteFirstLevel}
                className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                🗑️ İlk Seviye Sil
              </button>
            </div>
          </div>

          {/* COMPONENT OPERATIONS */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-purple-600 mb-4">
              🧩 Component İşlemleri
            </h2>
            <div className="space-y-2">
              <button
                onClick={testAddComponent}
                className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                ➕ Bileşen Ekle
              </button>
              <button
                onClick={testUpdateFirstComponent}
                className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
              >
                ✏️ İlk Bileşen Güncelle
              </button>
              <button
                onClick={testMoveComponent}
                className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
              >
                🔄 Bileşen Taşı
              </button>
              <button
                onClick={testDeleteFirstComponent}
                className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                🗑️ İlk Bileşen Sil
              </button>
            </div>
          </div>

          {/* UNDO/REDO OPERATIONS */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-orange-600 mb-4">
              ↩️ Undo/Redo İşlemleri
            </h2>
            <div className="space-y-2">
              <button
                onClick={testUndo}
                className="w-full px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
              >
                ↩️ Geri Al
              </button>
              <button
                onClick={testRedo}
                className="w-full px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
              >
                ↪️ İleri Al
              </button>
              <button
                onClick={testUndoSteps}
                className="w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
              >
                ↩️↩️ 2 Adım Geri Al
              </button>
              <button
                onClick={testClearUndoHistory}
                className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                🗑️ Geçmiş Temizle
              </button>
            </div>
          </div>

          {/* BASELINE OPERATIONS */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-teal-600 mb-4">
              📐 Baseline İşlemleri
            </h2>
            <div className="space-y-2">
              <button
                onClick={testSetBaseline}
                className="w-full px-3 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 text-sm"
              >
                📐 Baseline Ayarla
              </button>
              <button
                onClick={testGetBaseline}
                className="w-full px-3 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 text-sm"
              >
                📋 Baseline Al
              </button>
              <button
                onClick={testMarkSynced}
                className="w-full px-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm"
              >
                ✅ Senkronize İşaretle
              </button>
            </div>
          </div>

          {/* TRANSACTION OPERATIONS */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-indigo-600 mb-4">
              ⚡ Transaction İşlemleri
            </h2>
            <div className="space-y-2">
              <button
                onClick={testTransaction}
                className="w-full px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
              >
                ⚡ Transaction Test
              </button>
            </div>
          </div>

          {/* DRAFT OPERATIONS */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-pink-600 mb-4">
              💾 Taslak İşlemleri
            </h2>
            <div className="space-y-2">
              <button
                onClick={testExportDraft}
                className="w-full px-3 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 text-sm"
              >
                📤 Export Taslak
              </button>

              <div className="flex gap-1">
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Taslak adı"
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
                <button
                  onClick={testSaveDraft}
                  className="px-2 py-1 bg-pink-500 text-white rounded hover:bg-pink-600 text-sm"
                >
                  💾
                </button>
              </div>

              <div className="max-h-32 overflow-y-auto">
                {savedDrafts.map((name) => (
                  <div key={name} className="flex gap-1 mb-1">
                    <button
                      onClick={() => testLoadDraft(name)}
                      className="flex-1 px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs text-left truncate"
                    >
                      {name}
                    </button>
                    <button
                      onClick={() => testDeleteDraft(name)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* VALIDATION OPERATIONS */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-4">
              🔍 Doğrulama İşlemleri
            </h2>
            <div className="space-y-2">
              <button
                onClick={testValidateHierarchy}
                className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                🔍 Hierarchy Doğrula
              </button>
              <button
                onClick={testRepairHierarchy}
                className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                🔧 Hierarchy Onar
              </button>
              <button
                onClick={testGetData}
                className="w-full px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
              >
                📊 Veri Al
              </button>
              <button
                onClick={testSerializeDeserialize}
                className="w-full px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                🔄 Serialize Test
              </button>
              <button
                onClick={testReset}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm"
              >
                🔄 Sıfırla
              </button>
            </div>
          </div>
        </div>

        {/* STATS DASHBOARD */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-time Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Real-time İstatistikler
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Grup Sayısı:</span>
                <span className="font-semibold text-blue-600">
                  {stats.groupCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Seviye Sayısı:</span>
                <span className="font-semibold text-green-600">
                  {stats.levelCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bileşen Sayısı:</span>
                <span className="font-semibold text-purple-600">
                  {stats.componentCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Undo Stack:</span>
                <span className="font-semibold text-orange-600">
                  {stats.undoStackSize || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Redo Stack:</span>
                <span className="font-semibold text-orange-600">
                  {stats.redoStackSize || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Listener Sayısı:</span>
                <span className="font-semibold text-teal-600">
                  {stats.listenerCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Komut Sayısı:</span>
                <span className="font-semibold text-indigo-600">
                  {stats.commandCount || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Undo History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📜 Son Komutlar
            </h3>
            <div className="space-y-1">
              {undoHistory.map((cmd, index) => (
                <div key={cmd.id} className="text-xs p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">{cmd.label}</span>
                  <div className="text-gray-500 text-xs">
                    {new Date(cmd.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {undoHistory.length === 0 && (
                <div className="text-gray-500 text-sm">Henüz komut yok</div>
              )}
            </div>
          </div>

          {/* Diff Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔍 Baseline Farkları
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Eklenen Öğeler:</span>
                <span className="font-semibold text-green-600">
                  {diff?.addedIds.size || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Güncellenen Öğeler:</span>
                <span className="font-semibold text-yellow-600">
                  {diff?.updatedIds.size || 0}
                </span>
              </div>
              {diff && diff.addedIds.size > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-600 mb-1">
                    Eklenen ID'ler:
                  </div>
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded max-h-20 overflow-y-auto">
                    {Array.from(diff.addedIds).join(", ")}
                  </div>
                </div>
              )}
              {diff && diff.updatedIds.size > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-600 mb-1">
                    Güncellenen ID'ler:
                  </div>
                  <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded max-h-20 overflow-y-auto">
                    {Array.from(diff.updatedIds).join(", ")}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📝 Aktivite Logları
          </h3>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {logs.map((log, index) => (
              <div
                key={index}
                className="text-sm p-2 bg-gray-50 rounded border-l-4 border-blue-500"
              >
                {log}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-500 text-sm">Henüz aktivite yok</div>
            )}
          </div>
        </div>

        {/* Current Hierarchy Preview */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🌳 Mevcut Hierarchy
          </h3>
          <div className="max-h-60 overflow-y-auto">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(hierarchy, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
