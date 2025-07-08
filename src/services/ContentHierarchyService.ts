import {
  LevelHierarchy,
  LevelGroupItem,
  LevelItem,
  ComponentItem,
} from "../types/LevelHierarchy";

/**
 * Command interface for undo/redo functionality
 */
export interface Command {
  type: string;
  payload: any;
  timestamp: number;
}

/**
 * Listener type for reactive updates
 */
export type HierarchyListener = (hierarchy: LevelHierarchy) => void;

/**
 * ContentHierarchyService - Singleton service for managing hierarchical content data
 * Provides CRUD operations, undo/redo, reactive updates, and validation
 */
export class ContentHierarchyService {
  private static instance: ContentHierarchyService;

  // Ana veri yapısı
  private hierarchy: LevelHierarchy = [];

  // Undo/Redo stacks
  private undoStack: LevelHierarchy[] = [];
  private redoStack: LevelHierarchy[] = [];

  // Command history for optional logging
  private commandHistory: Command[] = [];

  // Redo command history tracking
  private redoCommandHistory: Command[] = [];

  // Listener management
  private listeners: Set<HierarchyListener> = new Set();

  // Transaction support
  private isInTransaction = false;
  private transactionStartState: LevelHierarchy | null = null;

  // Baseline for diff comparison
  private baselineHierarchy: LevelHierarchy = [];

  private constructor() {}

  /**
   * Singleton instance getter
   */
  public static getInstance(): ContentHierarchyService {
    if (!ContentHierarchyService.instance) {
      ContentHierarchyService.instance = new ContentHierarchyService();
    }
    return ContentHierarchyService.instance;
  }

  // ============ PRIVATE UTILITY METHODS ============

  /**
   * Derin kopya oluşturur
   */
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Mevcut state'i undo stack'e ekler
   */
  private saveStateToUndo(): void {
    if (this.isInTransaction) return;

    this.undoStack.push(this.deepClone(this.hierarchy));
    this.redoStack = []; // Yeni operasyon redo stack'i temizler
    this.redoCommandHistory = []; // Redo command history'yi de temizle

    // Undo stack boyutunu sınırla (son 50 adım)
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
  }

  /**
   * Tüm listener'ları bilgilendirir
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) =>
      listener(this.deepClone(this.hierarchy))
    );
  }

  /**
   * Command history'ye ekler
   */
  private addToCommandHistory(type: string, payload: any): void {
    // "undo", "redo" ve benzeri yönetim komutlarının geçmişte görünmesini engelle
    const ignoredTypes = new Set([
      "undo",
      "redo",
      "undoSteps",
      "clearUndoHistory",
    ]);

    if (ignoredTypes.has(type)) {
      return; // Bu tip komutları geçmişe ekleme
    }

    this.commandHistory.push({
      type,
      payload: this.deepClone(payload),
      timestamp: Date.now(),
    });

    // Command history boyutunu sınırla (son 100 komut)
    if (this.commandHistory.length > 100) {
      this.commandHistory.shift();
    }
  }

  /**
   * Order değerlerini yeniden düzenler
   */
  private reorderItems<T extends { order: number }>(
    items: T[],
    startIndex: number = 0
  ): void {
    // Mevcut dizinin fiziksel sırasını koruyarak order değerlerini güncelle
    items.forEach((item, index) => {
      item.order = startIndex + index;
    });
  }

  /**
   * Level'ı ID ile bulur
   */
  private findLevelById(levelId: string): {
    group: LevelGroupItem;
    level: LevelItem;
    groupIndex: number;
    levelIndex: number;
  } | null {
    for (let groupIndex = 0; groupIndex < this.hierarchy.length; groupIndex++) {
      const group = this.hierarchy[groupIndex];
      for (let levelIndex = 0; levelIndex < group.levels.length; levelIndex++) {
        const level = group.levels[levelIndex];
        if (level.id === levelId) {
          return { group, level, groupIndex, levelIndex };
        }
      }
    }
    return null;
  }

  /**
   * Component'ı ID ile bulur
   */
  private findComponentById(componentId: string): {
    group: LevelGroupItem;
    level: LevelItem;
    component: ComponentItem;
    groupIndex: number;
    levelIndex: number;
    componentIndex: number;
  } | null {
    for (let groupIndex = 0; groupIndex < this.hierarchy.length; groupIndex++) {
      const group = this.hierarchy[groupIndex];
      for (let levelIndex = 0; levelIndex < group.levels.length; levelIndex++) {
        const level = group.levels[levelIndex];
        for (
          let componentIndex = 0;
          componentIndex < level.components.length;
          componentIndex++
        ) {
          const component = level.components[componentIndex];
          if (component.id === componentId) {
            return {
              group,
              level,
              component,
              groupIndex,
              levelIndex,
              componentIndex,
            };
          }
        }
      }
    }
    return null;
  }

  // ============ LEVEL GROUP OPERATIONS ============

  /**
   * Yeni level group ekler
   */
  public addLevelGroup(newGroup: LevelGroupItem): void {
    this.saveStateToUndo();

    // Eğer order belirtilmemişse en sona ekle
    const targetOrder =
      newGroup.order === undefined ? this.hierarchy.length : newGroup.order;

    // Doğru index'i bul: mevcut sıralamada order >= targetOrder olan ilk eleman
    const insertIndex = this.hierarchy.findIndex((g) => g.order >= targetOrder);

    const groupToInsert = {
      ...newGroup,
      order: targetOrder,
      levels: newGroup.levels || [],
    };

    if (insertIndex === -1) {
      // Liste sonuna ekle
      this.hierarchy.push(groupToInsert);
    } else {
      this.hierarchy.splice(insertIndex, 0, groupToInsert);
    }

    // Order'ları yeniden düzenle
    this.reorderItems(this.hierarchy);

    this.addToCommandHistory("addLevelGroup", newGroup);
    this.notifyListeners();
  }

  /**
   * Level group'u günceller
   */
  public updateLevelGroup(
    groupId: string,
    updatedFields: Partial<LevelGroupItem>
  ): void {
    const groupIndex = this.hierarchy.findIndex(
      (group) => group.id === groupId
    );
    if (groupIndex === -1) return;

    this.saveStateToUndo();

    const oldGroup = this.hierarchy[groupIndex];
    this.hierarchy[groupIndex] = { ...oldGroup, ...updatedFields };

    // Order değişmişse yeniden sırala
    if (updatedFields.order !== undefined) {
      this.reorderItems(this.hierarchy);
    }

    this.addToCommandHistory("updateLevelGroup", { groupId, updatedFields });
    this.notifyListeners();
  }

  /**
   * Level group'un sırasını değiştirir
   */
  public moveLevelGroup(groupId: string, newOrder: number): void {
    const groupIndex = this.hierarchy.findIndex(
      (group) => group.id === groupId
    );
    if (groupIndex === -1) return;

    this.saveStateToUndo();

    // Fiziksel taşıma: elemanı çıkar ve yeni index'e ekle
    const [groupItem] = this.hierarchy.splice(groupIndex, 1);
    const targetIndex = Math.max(0, Math.min(newOrder, this.hierarchy.length));
    this.hierarchy.splice(targetIndex, 0, groupItem);

    // Order'ları yeniden düzenle
    this.reorderItems(this.hierarchy);

    this.addToCommandHistory("moveLevelGroup", { groupId, newOrder });
    this.notifyListeners();
  }

  /**
   * Level group'u siler
   */
  public deleteLevelGroup(groupId: string): void {
    const groupIndex = this.hierarchy.findIndex(
      (group) => group.id === groupId
    );
    if (groupIndex === -1) return;

    this.saveStateToUndo();

    this.hierarchy.splice(groupIndex, 1);
    this.reorderItems(this.hierarchy);

    this.addToCommandHistory("deleteLevelGroup", { groupId });
    this.notifyListeners();
  }

  // ============ LEVEL OPERATIONS ============

  /**
   * Belirtilen group'a yeni level ekler
   */
  public addLevel(groupId: string, newLevel: LevelItem): void {
    const groupIndex = this.hierarchy.findIndex(
      (group) => group.id === groupId
    );
    if (groupIndex === -1) return;

    this.saveStateToUndo();

    const group = this.hierarchy[groupIndex];

    const targetOrder =
      newLevel.order === undefined ? group.levels.length : newLevel.order;

    const insertIndex = group.levels.findIndex((l) => l.order >= targetOrder);

    const levelToInsert = {
      ...newLevel,
      order: targetOrder,
      components: newLevel.components || [],
    };

    if (insertIndex === -1) {
      group.levels.push(levelToInsert);
    } else {
      group.levels.splice(insertIndex, 0, levelToInsert);
    }

    // Order'ları yeniden düzenle
    this.reorderItems(group.levels);

    this.addToCommandHistory("addLevel", { groupId, newLevel });
    this.notifyListeners();
  }

  /**
   * Level'ı günceller
   */
  public updateLevel(levelId: string, updatedFields: Partial<LevelItem>): void {
    const found = this.findLevelById(levelId);
    if (!found) return;

    this.saveStateToUndo();

    const oldLevel = found.level;
    found.group.levels[found.levelIndex] = { ...oldLevel, ...updatedFields };

    // Order değişmişse yeniden sırala
    if (updatedFields.order !== undefined) {
      this.reorderItems(found.group.levels);
    }

    this.addToCommandHistory("updateLevel", { levelId, updatedFields });
    this.notifyListeners();
  }

  /**
   * Level'ı başka grup'a taşır veya sırasını değiştirir
   */
  public moveLevel(
    levelId: string,
    newOrder: number,
    newGroupId?: string
  ): void {
    const found = this.findLevelById(levelId);
    if (!found) return;

    this.saveStateToUndo();

    const level = found.level;

    if (newGroupId && newGroupId !== found.group.id) {
      // Başka grup'a taşı
      const newGroupIndex = this.hierarchy.findIndex(
        (group) => group.id === newGroupId
      );
      if (newGroupIndex === -1) return;

      // Eski grup'tan çıkar
      found.group.levels.splice(found.levelIndex, 1);
      this.reorderItems(found.group.levels);

      // Yeni grup'a ekle (targetIndex kullan)
      const targetIndex = Math.max(
        0,
        Math.min(newOrder, this.hierarchy[newGroupIndex].levels.length)
      );
      this.hierarchy[newGroupIndex].levels.splice(targetIndex, 0, level);
      this.reorderItems(this.hierarchy[newGroupIndex].levels);
    } else {
      // Aynı grup içinde taşı: dizide fiziksel yeniden konumlandır
      const levels = found.group.levels;
      const [lvl] = levels.splice(found.levelIndex, 1);
      const targetIndex = Math.max(0, Math.min(newOrder, levels.length));
      levels.splice(targetIndex, 0, lvl);
      this.reorderItems(levels);
    }

    this.addToCommandHistory("moveLevel", { levelId, newOrder, newGroupId });
    this.notifyListeners();
  }

  /**
   * Level'ı siler
   */
  public deleteLevel(levelId: string): void {
    const found = this.findLevelById(levelId);
    if (!found) return;

    this.saveStateToUndo();

    found.group.levels.splice(found.levelIndex, 1);
    this.reorderItems(found.group.levels);

    this.addToCommandHistory("deleteLevel", { levelId });
    this.notifyListeners();
  }

  // ============ COMPONENT OPERATIONS ============

  /**
   * Belirtilen level'a yeni component ekler
   */
  public addComponent(levelId: string, newComponent: ComponentItem): void {
    const found = this.findLevelById(levelId);
    if (!found) return;

    this.saveStateToUndo();

    const level = found.level;

    const targetOrder =
      newComponent.order === undefined
        ? level.components.length
        : newComponent.order;

    const insertIndex = level.components.findIndex(
      (c) => c.order >= targetOrder
    );

    const componentToInsert = { ...newComponent, order: targetOrder };

    if (insertIndex === -1) {
      level.components.push(componentToInsert);
    } else {
      level.components.splice(insertIndex, 0, componentToInsert);
    }

    this.reorderItems(level.components);

    this.addToCommandHistory("addComponent", { levelId, newComponent });
    this.notifyListeners();
  }

  /**
   * Component'ı günceller
   */
  public updateComponent(
    componentId: string,
    updatedFields: Partial<ComponentItem>
  ): void {
    const found = this.findComponentById(componentId);
    if (!found) return;

    this.saveStateToUndo();

    const oldComponent = found.component;
    found.level.components[found.componentIndex] = {
      ...oldComponent,
      ...updatedFields,
    };

    // Order değişmişse yeniden sırala
    if (updatedFields.order !== undefined) {
      this.reorderItems(found.level.components);
    }

    this.addToCommandHistory("updateComponent", { componentId, updatedFields });
    this.notifyListeners();
  }

  /**
   * Component'ı başka level'a taşır veya sırasını değiştirir
   */
  public moveComponent(
    componentId: string,
    newOrder: number,
    newLevelId?: string
  ): void {
    const found = this.findComponentById(componentId);
    if (!found) return;

    this.saveStateToUndo();

    const component = found.component;

    if (newLevelId && newLevelId !== found.level.id) {
      // Başka level'a taşı
      const newLevelFound = this.findLevelById(newLevelId);
      if (!newLevelFound) return;

      // Eski level'dan çıkar
      found.level.components.splice(found.componentIndex, 1);
      this.reorderItems(found.level.components);

      // Yeni level'a ekle
      const targetIndex = Math.max(
        0,
        Math.min(newOrder, newLevelFound.level.components.length)
      );
      newLevelFound.level.components.splice(targetIndex, 0, component);
      this.reorderItems(newLevelFound.level.components);
    } else {
      // Aynı level içinde taşı: dizide fiziksel yeniden konumlandır
      const comps = found.level.components;
      const [comp] = comps.splice(found.componentIndex, 1);
      const targetIndex = Math.max(0, Math.min(newOrder, comps.length));
      comps.splice(targetIndex, 0, comp);
      this.reorderItems(comps);
    }

    this.addToCommandHistory("moveComponent", {
      componentId,
      newOrder,
      newLevelId,
    });
    this.notifyListeners();
  }

  /**
   * Component'ı siler
   */
  public deleteComponent(componentId: string): void {
    const found = this.findComponentById(componentId);
    if (!found) return;

    this.saveStateToUndo();

    found.level.components.splice(found.componentIndex, 1);
    this.reorderItems(found.level.components);

    this.addToCommandHistory("deleteComponent", { componentId });
    this.notifyListeners();
  }

  // ============ UNDO/REDO OPERATIONS ============

  /**
   * Son işlemi geri alır
   */
  public undo(): void {
    if (this.undoStack.length === 0 || this.commandHistory.length === 0) return;

    // Mevcut state'i redo stack'e ekle
    this.redoStack.push(this.deepClone(this.hierarchy));

    // Son komut'u redo history'ye taşı
    const lastCommand = this.commandHistory.pop()!;
    this.redoCommandHistory.unshift(lastCommand);

    // Son state'i geri yükle
    const previousState = this.undoStack.pop()!;
    this.hierarchy = previousState;

    this.notifyListeners();
  }

  /**
   * Geri alınan işlemi tekrar yapar
   */
  public redo(): void {
    if (this.redoStack.length === 0 || this.redoCommandHistory.length === 0)
      return;

    // Mevcut state'i undo stack'e ekle
    this.undoStack.push(this.deepClone(this.hierarchy));

    // İlk redo komutunu geri command history'ye taşı
    const redoCommand = this.redoCommandHistory.shift()!;
    this.commandHistory.push(redoCommand);

    // Redo state'i geri yükle
    const redoState = this.redoStack.pop()!;
    this.hierarchy = redoState;

    this.notifyListeners();
  }

  /**
   * Undo history'yi temizler (sadece undo geçmişi)
   */
  public clearUndoHistory(): void {
    this.undoStack = [];
    this.commandHistory = [];
    this.notifyListeners();
  }

  /**
   * Redo history'yi temizler (sadece redo geçmişi)
   */
  public clearRedoHistory(): void {
    this.redoStack = [];
    this.redoCommandHistory = [];
    this.notifyListeners();
  }

  /**
   * Tüm undo/redo geçmişini temizler
   */
  public clearAllHistory(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.commandHistory = [];
    this.redoCommandHistory = [];
    this.notifyListeners();
  }

  // ============ EXTENDED UNDO/REDO METHODS ============

  /**
   * Undo stack boyutunu döner
   */
  public getUndoStackSize(): number {
    return this.undoStack.length;
  }

  /**
   * Redo stack boyutunu döner
   */
  public getRedoStackSize(): number {
    return this.redoStack.length;
  }

  /**
   * Son N komutu label-leriyle döner (dropdown listesi için)
   */
  public peekUndoHistory(
    limit: number = 10
  ): Array<{ id: string; label: string; type: string; timestamp: number }> {
    const recentCommands = this.commandHistory
      .slice(-Math.min(limit, this.commandHistory.length))
      .reverse();

    // Kullanıcıya gösterilmeyecek komut tipleri
    const hiddenTypes = new Set(["deserialize", "setBaseline"]);

    return recentCommands
      .filter((cmd) => !hiddenTypes.has(cmd.type))
      .map((cmd, index) => ({
        id: `${cmd.timestamp}-${index}`,
        label: this.formatCommandLabel(cmd),
        type: cmd.type,
        timestamp: cmd.timestamp,
      }));
  }

  /**
   * Redo için mevcut komutları döner (redo dropdown listesi için)
   */
  public peekRedoHistory(
    limit: number = 10
  ): Array<{ id: string; label: string; type: string; timestamp: number }> {
    const hiddenTypes = new Set(["deserialize", "setBaseline"]);

    const redoCommands = this.redoCommandHistory
      .slice(0, Math.min(limit, this.redoCommandHistory.length))
      .filter((cmd) => !hiddenTypes.has(cmd.type));

    return redoCommands.map((cmd, index) => ({
      id: `redo-${cmd.timestamp}-${index}`,
      label: this.formatCommandLabel(cmd),
      type: cmd.type,
      timestamp: cmd.timestamp,
    }));
  }

  /**
   * Komut etiketini formatlar
   */
  private formatCommandLabel(command: Command): string {
    const typeLabels: Record<string, string> = {
      addLevelGroup: "Seviye Grubu Eklendi",
      updateLevelGroup: "Seviye Grubu Güncellendi",
      deleteLevelGroup: "Seviye Grubu Silindi",
      addLevel: "Seviye Eklendi",
      updateLevel: "Seviye Güncellendi",
      deleteLevel: "Seviye Silindi",
      addComponent: "Bileşen Eklendi",
      updateComponent: "Bileşen Güncellendi",
      deleteComponent: "Bileşen Silindi",
      moveLevel: "Seviye Taşındı",
      moveComponent: "Bileşen Taşındı",
      deserialize: "Veri Yüklendi",
      repairHierarchy: "Yapı Onarıldı",
    };

    let label = typeLabels[command.type] || command.type;

    // Payload'dan ek bilgi ekle
    if (command.payload?.title) {
      label += `: ${command.payload.title}`;
    } else if (command.payload?.newLevel?.title) {
      label += `: ${command.payload.newLevel.title}`;
    } else if (command.payload?.newComponent?.display_name) {
      label += `: ${command.payload.newComponent.display_name}`;
    }

    return label;
  }

  /**
   * Çoklu geri al - tek seferde birden fazla adım geri alır
   */
  public undoSteps(count: number): void {
    if (
      count <= 0 ||
      this.undoStack.length === 0 ||
      this.commandHistory.length === 0
    )
      return;

    const actualSteps = Math.min(
      count,
      this.undoStack.length,
      this.commandHistory.length
    );

    // Mevcut state'i redo stack'e ekle
    this.redoStack.push(this.deepClone(this.hierarchy));

    // Komutları redo history'ye taşı
    for (let i = 0; i < actualSteps; i++) {
      if (this.commandHistory.length > 0) {
        const command = this.commandHistory.pop()!;
        this.redoCommandHistory.unshift(command);
      }
    }

    // Belirtilen sayıda adım geri al
    for (let i = 0; i < actualSteps; i++) {
      if (this.undoStack.length > 0) {
        const previousState = this.undoStack.pop()!;
        if (i === actualSteps - 1) {
          // Son adımda hierarchy'yi güncelle
          this.hierarchy = previousState;
        } else {
          // Ara adımları redo stack'e ekle
          this.redoStack.push(previousState);
        }
      }
    }

    this.notifyListeners();
  }

  /**
   * Çoklu ileri al - tek seferde birden fazla adım ileri alır
   */
  public redoSteps(count: number): void {
    if (
      count <= 0 ||
      this.redoStack.length === 0 ||
      this.redoCommandHistory.length === 0
    )
      return;

    const actualSteps = Math.min(
      count,
      this.redoStack.length,
      this.redoCommandHistory.length
    );

    // Mevcut state'i undo stack'e ekle
    this.undoStack.push(this.deepClone(this.hierarchy));

    // Komutları command history'ye geri taşı
    for (let i = 0; i < actualSteps; i++) {
      if (this.redoCommandHistory.length > 0) {
        const command = this.redoCommandHistory.shift()!;
        this.commandHistory.push(command);
      }
    }

    // Belirtilen sayıda adım ileri al
    for (let i = 0; i < actualSteps; i++) {
      if (this.redoStack.length > 0) {
        const nextState = this.redoStack.pop()!;
        if (i === actualSteps - 1) {
          // Son adımda hierarchy'yi güncelle
          this.hierarchy = nextState;
        } else {
          // Ara adımları undo stack'e ekle
          this.undoStack.push(nextState);
        }
      }
    }

    this.notifyListeners();
  }

  // ============ BASELINE MANAGEMENT ============

  /**
   * Baseline hierarchy'yi ayarlar (diff için referans)
   */
  public setBaseline(
    baseline?: LevelHierarchy,
    recordHistory: boolean = false
  ): void {
    this.baselineHierarchy = baseline
      ? this.deepClone(baseline)
      : this.deepClone(this.hierarchy);

    // İstenmiyorsa command history'ye ekleme
    if (recordHistory) {
      this.addToCommandHistory("setBaseline", { timestamp: Date.now() });
    }
  }

  /**
   * Baseline hierarchy'yi döner
   */
  public getBaseline(): LevelHierarchy {
    return this.deepClone(this.baselineHierarchy);
  }

  /**
   * Mevcut hierarchy ile baseline arasındaki farkları hesaplar
   */
  public diffWithBaseline(baseline?: LevelHierarchy): {
    addedIds: Set<string>;
    updatedIds: Set<string>;
  } {
    const referenceBaseline = baseline || this.baselineHierarchy;
    const addedIds = new Set<string>();
    const updatedIds = new Set<string>();

    // Baseline'daki tüm ID'leri topla
    const baselineIds = this.extractAllIds(referenceBaseline);

    // Mevcut hierarchy'deki tüm öğeleri kontrol et
    this.hierarchy.forEach((group) => {
      // LevelGroup kontrolü
      if (!baselineIds.groups.has(group.id)) {
        addedIds.add(group.id);
      } else if (this.hasGroupChanged(group, referenceBaseline)) {
        updatedIds.add(group.id);
      }

      // Level kontrolü
      group.levels.forEach((level) => {
        if (!baselineIds.levels.has(level.id)) {
          addedIds.add(level.id);
        } else if (this.hasLevelChanged(level, referenceBaseline)) {
          updatedIds.add(level.id);
        }

        // Component kontrolü
        level.components.forEach((component) => {
          if (!baselineIds.components.has(component.id)) {
            addedIds.add(component.id);
          } else if (this.hasComponentChanged(component, referenceBaseline)) {
            updatedIds.add(component.id);
          }
        });
      });
    });

    return { addedIds, updatedIds };
  }

  /**
   * Hierarchy'den tüm ID'leri çıkarır
   */
  private extractAllIds(hierarchy: LevelHierarchy): {
    groups: Set<string>;
    levels: Set<string>;
    components: Set<string>;
  } {
    const groups = new Set<string>();
    const levels = new Set<string>();
    const components = new Set<string>();

    hierarchy.forEach((group) => {
      groups.add(group.id);
      group.levels.forEach((level) => {
        levels.add(level.id);
        level.components.forEach((component) => {
          components.add(component.id);
        });
      });
    });

    return { groups, levels, components };
  }

  /**
   * Group'un değişip değişmediğini kontrol eder
   */
  private hasGroupChanged(
    group: LevelGroupItem,
    baseline: LevelHierarchy
  ): boolean {
    const baselineGroup = baseline.find((g) => g.id === group.id);
    if (!baselineGroup) return false;

    return (
      JSON.stringify({
        title: group.title,
        order: group.order,
      }) !==
      JSON.stringify({
        title: baselineGroup.title,
        order: baselineGroup.order,
      })
    );
  }

  /**
   * Level'ın değişip değişmediğini kontrol eder
   */
  private hasLevelChanged(level: LevelItem, baseline: LevelHierarchy): boolean {
    let baselineLevel: LevelItem | undefined;

    for (const group of baseline) {
      baselineLevel = group.levels.find((l) => l.id === level.id);
      if (baselineLevel) break;
    }

    if (!baselineLevel) return false;

    return (
      JSON.stringify({
        title: level.title,
        icon_key: level.icon_key,
        icon_family: level.icon_family,
        xp_reward: level.xp_reward,
        order: level.order,
      }) !==
      JSON.stringify({
        title: baselineLevel.title,
        icon_key: baselineLevel.icon_key,
        icon_family: baselineLevel.icon_family,
        xp_reward: baselineLevel.xp_reward,
        order: baselineLevel.order,
      })
    );
  }

  /**
   * Component'in değişip değişmediğini kontrol eder
   */
  private hasComponentChanged(
    component: ComponentItem,
    baseline: LevelHierarchy
  ): boolean {
    let baselineComponent: ComponentItem | undefined;

    for (const group of baseline) {
      for (const level of group.levels) {
        baselineComponent = level.components.find((c) => c.id === component.id);
        if (baselineComponent) break;
      }
      if (baselineComponent) break;
    }

    if (!baselineComponent) return false;

    return (
      JSON.stringify({
        type: component.type,
        display_name: component.display_name,
        content: component.content,
        order: component.order,
      }) !==
      JSON.stringify({
        type: baselineComponent.type,
        display_name: baselineComponent.display_name,
        content: baselineComponent.content,
        order: baselineComponent.order,
      })
    );
  }

  // ============ DRAFT MANAGEMENT SHORTCUTS ============

  /**
   * Taslak export'u - serialize() metodunun kısayolu
   */
  public exportDraft(): string {
    return this.serialize();
  }

  /**
   * Taslak import'u - deserialize() metodunun kısayolu
   */
  public importDraft(json: string): void {
    this.deserialize(json);
  }

  /**
   * Baseline ile senkronizasyon - diff'i sıfırlar
   */
  public markSynced(): void {
    this.setBaseline();
    this.addToCommandHistory("markSynced", { timestamp: Date.now() });
  }

  // ============ DATA ACCESS METHODS ============

  /**
   * Tüm hierarchy'yi döner
   */
  public getHierarchy(): LevelHierarchy {
    return this.deepClone(this.hierarchy);
  }

  /**
   * ID ile level group bulur
   */
  public getLevelGroupById(groupId: string): LevelGroupItem | undefined {
    const group = this.hierarchy.find((group) => group.id === groupId);
    return group ? this.deepClone(group) : undefined;
  }

  /**
   * ID ile level bulur
   */
  public getLevelById(levelId: string): LevelItem | undefined {
    const found = this.findLevelById(levelId);
    return found ? this.deepClone(found.level) : undefined;
  }

  /**
   * ID ile component bulur
   */
  public getComponentById(componentId: string): ComponentItem | undefined {
    const found = this.findComponentById(componentId);
    return found ? this.deepClone(found.component) : undefined;
  }

  // ============ REACTIVE UPDATES ============

  /**
   * Değişiklikleri dinlemek için listener ekler
   */
  public subscribe(listener: HierarchyListener): () => void {
    this.listeners.add(listener);

    // Unsubscribe fonksiyonu döner
    return () => {
      this.listeners.delete(listener);
    };
  }

  // ============ COMMAND HISTORY ============

  /**
   * Command history'yi döner
   */
  public getCommandHistory(): Command[] {
    return this.deepClone(this.commandHistory);
  }

  // ============ TRANSACTION SUPPORT ============

  /**
   * Transaction başlatır
   */
  public beginTransaction(): void {
    if (this.isInTransaction) return;

    this.isInTransaction = true;
    this.transactionStartState = this.deepClone(this.hierarchy);
  }

  /**
   * Transaction'ı sonlandırır
   */
  public endTransaction(): void {
    if (!this.isInTransaction || !this.transactionStartState) return;

    this.isInTransaction = false;

    // Transaction başlangıcındaki state'i undo stack'e ekle
    this.undoStack.push(this.transactionStartState);
    this.redoStack = [];

    this.transactionStartState = null;

    // Transaction boyutunu sınırla
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
  }

  // ============ SERIALIZATION ============

  /**
   * Hierarchy'yi JSON string'e çevirir
   */
  public serialize(): string {
    return JSON.stringify(
      {
        hierarchy: this.hierarchy,
        commandHistory: this.commandHistory,
        timestamp: Date.now(),
      },
      null,
      2
    );
  }

  /**
   * JSON string'den hierarchy yükler
   */
  public deserialize(json: string, recordHistory: boolean = false): void {
    try {
      const data = JSON.parse(json);

      if (data.hierarchy && Array.isArray(data.hierarchy)) {
        // İlk yükleme anında undo/redo'ya ekleme
        if (recordHistory) {
          this.saveStateToUndo();
        }

        this.hierarchy = data.hierarchy;

        if (data.commandHistory && Array.isArray(data.commandHistory)) {
          this.commandHistory = data.commandHistory;
        }

        if (recordHistory) {
          this.addToCommandHistory("deserialize", {
            timestamp: data.timestamp,
          });
        }

        this.notifyListeners();
      }
    } catch (error) {
      console.error("Deserialization hatası:", error);
    }
  }

  // ============ VALIDATION ============

  /**
   * Hierarchy yapısının geçerliliğini kontrol eder
   */
  public validateHierarchy(): boolean {
    try {
      // Temel yapı kontrolü
      if (!Array.isArray(this.hierarchy)) return false;

      const groupIds = new Set<string>();
      const levelIds = new Set<string>();
      const componentIds = new Set<string>();

      for (const group of this.hierarchy) {
        // Group validasyonu
        if (!group.id || !group.title || typeof group.order !== "number")
          return false;
        if (groupIds.has(group.id)) return false;
        groupIds.add(group.id);

        if (!Array.isArray(group.levels)) return false;

        for (const level of group.levels) {
          // Level validasyonu
          if (
            !level.id ||
            !level.title ||
            typeof level.order !== "number" ||
            typeof level.xp_reward !== "number"
          )
            return false;
          if (levelIds.has(level.id)) return false;
          levelIds.add(level.id);

          if (!Array.isArray(level.components)) return false;

          for (const component of level.components) {
            // Component validasyonu
            if (
              !component.id ||
              !component.type ||
              !component.display_name ||
              typeof component.order !== "number"
            )
              return false;
            if (componentIds.has(component.id)) return false;
            componentIds.add(component.id);
          }
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Hierarchy'deki bilinen sorunları otomatik olarak düzeltir
   */
  public repairHierarchy(): void {
    this.saveStateToUndo();

    // Group order'larını düzelt
    this.reorderItems(this.hierarchy);

    // Her group için level order'larını düzelt
    this.hierarchy.forEach((group) => {
      if (!Array.isArray(group.levels)) {
        group.levels = [];
      }
      this.reorderItems(group.levels);

      // Her level için component order'larını düzelt
      group.levels.forEach((level) => {
        if (!Array.isArray(level.components)) {
          level.components = [];
        }
        this.reorderItems(level.components);
      });
    });

    this.addToCommandHistory("repairHierarchy", {});
    this.notifyListeners();
  }

  // ============ UTILITY METHODS ============

  /**
   * Servisi sıfırlar (test amaçlı)
   */
  public reset(): void {
    this.hierarchy = [];
    this.undoStack = [];
    this.redoStack = [];
    this.commandHistory = [];
    this.listeners.clear();
    this.isInTransaction = false;
    this.transactionStartState = null;
    this.baselineHierarchy = [];
    this.notifyListeners();
  }

  /**
   * Servis istatistiklerini döner
   */
  public getStats(): {
    groupCount: number;
    levelCount: number;
    componentCount: number;
    undoStackSize: number;
    redoStackSize: number;
    listenerCount: number;
    commandCount: number;
  } {
    let levelCount = 0;
    let componentCount = 0;

    this.hierarchy.forEach((group) => {
      levelCount += group.levels.length;
      group.levels.forEach((level) => {
        componentCount += level.components.length;
      });
    });

    return {
      groupCount: this.hierarchy.length,
      levelCount,
      componentCount,
      undoStackSize: this.undoStack.length,
      redoStackSize: this.redoStack.length,
      listenerCount: this.listeners.size,
      commandCount: this.commandHistory.length,
    };
  }
}

// Singleton instance export'u
export const contentHierarchyService = ContentHierarchyService.getInstance();
