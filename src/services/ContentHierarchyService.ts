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

  // Listener management
  private listeners: Set<HierarchyListener> = new Set();

  // Transaction support
  private isInTransaction = false;
  private transactionStartState: LevelHierarchy | null = null;

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
    items.sort((a, b) => a.order - b.order);
    items.forEach((item, index) => {
      item.order = startIndex + index;
    });
  }

  /**
   * Level'ı ID ile bulur
   */
  private findLevelById(
    levelId: string
  ): {
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

    // Order değeri belirtilmemişse en sona ekle
    if (newGroup.order === undefined) {
      newGroup.order = this.hierarchy.length;
    }

    this.hierarchy.push({ ...newGroup, levels: newGroup.levels || [] });
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

    this.hierarchy[groupIndex].order = newOrder;
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

    // Order değeri belirtilmemişse en sona ekle
    if (newLevel.order === undefined) {
      newLevel.order = group.levels.length;
    }

    group.levels.push({ ...newLevel, components: newLevel.components || [] });
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

      // Yeni grup'a ekle
      level.order = newOrder;
      this.hierarchy[newGroupIndex].levels.push(level);
      this.reorderItems(this.hierarchy[newGroupIndex].levels);
    } else {
      // Aynı grup içinde taşı
      level.order = newOrder;
      this.reorderItems(found.group.levels);
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

    // Order değeri belirtilmemişse en sona ekle
    if (newComponent.order === undefined) {
      newComponent.order = level.components.length;
    }

    level.components.push({ ...newComponent });
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
      component.order = newOrder;
      newLevelFound.level.components.push(component);
      this.reorderItems(newLevelFound.level.components);
    } else {
      // Aynı level içinde taşı
      component.order = newOrder;
      this.reorderItems(found.level.components);
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
    if (this.undoStack.length === 0) return;

    // Mevcut state'i redo stack'e ekle
    this.redoStack.push(this.deepClone(this.hierarchy));

    // Son state'i geri yükle
    const previousState = this.undoStack.pop()!;
    this.hierarchy = previousState;

    this.addToCommandHistory("undo", {});
    this.notifyListeners();
  }

  /**
   * Geri alınan işlemi tekrar yapar
   */
  public redo(): void {
    if (this.redoStack.length === 0) return;

    // Mevcut state'i undo stack'e ekle
    this.undoStack.push(this.deepClone(this.hierarchy));

    // Redo state'i geri yükle
    const redoState = this.redoStack.pop()!;
    this.hierarchy = redoState;

    this.addToCommandHistory("redo", {});
    this.notifyListeners();
  }

  /**
   * Undo history'yi temizler
   */
  public clearUndoHistory(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.addToCommandHistory("clearUndoHistory", {});
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
  public deserialize(json: string): void {
    try {
      const data = JSON.parse(json);

      if (data.hierarchy && Array.isArray(data.hierarchy)) {
        this.saveStateToUndo();
        this.hierarchy = data.hierarchy;

        if (data.commandHistory && Array.isArray(data.commandHistory)) {
          this.commandHistory = data.commandHistory;
        }

        this.addToCommandHistory("deserialize", { timestamp: data.timestamp });
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
