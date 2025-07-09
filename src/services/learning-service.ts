import { supabaseManager } from "@/services/supabaseManager";
import { Database } from "@/types/supabase";
import {
  LevelHierarchy,
  LevelGroupItem,
  LevelItem,
  ComponentItem,
} from "@/types/LevelHierarchy";
import { mapToLevelHierarchy } from "@/utils/mapToLevelHierarchy";

// Veritabanı tiplerini tanımla
// type LevelGroup = Database['public']['Tables']['level_groups']['Row'];
// type Level = Database['public']['Tables']['levels']['Row'];
// type Component = Database['public']['Tables']['components']['Row'];
type ComponentType = Database["public"]["Tables"]["component_types"]["Row"];

// Öğrenme uygulaması için Supabase servisleri
export class LearningService {
  private static getClient(appId?: string) {
    if (!appId) {
      throw new Error("appId parametresi gerekli");
    }
    return supabaseManager.getClient(appId);
  }

  /**
   * Tüm seviye gruplarını ve ilişkili verilerini getirir
   * Seviye grupları, seviyeler, bileşenler ve bileşen türleri dahil
   */
  static async getLevelGroupsWithDetails(appId: string): Promise<{
    data: LevelHierarchy | null;
    error: Error | null;
  }> {
    try {
      const client = this.getClient(appId);

      // Adım 1: Level groups ve levels'ı getir
      const { data: levelGroupsData, error: levelGroupsError } = await client
        .from("level_groups")
        .select(
          `
          id, title, order,
          levels (
            id, title, icon_key, icon_family, xp_reward, order
          )
        `
        )
        .order("order", { ascending: true })
        .order("order", { foreignTable: "levels", ascending: true });

      if (levelGroupsError) {
        console.error("Seviye grupları getirilemedi:", levelGroupsError);
        return { data: null, error: new Error(levelGroupsError.message) };
      }

      // Adım 2: Tüm level ID'lerini topla
      const allLevelIds: string[] = [];
      levelGroupsData?.forEach((group) => {
        group.levels?.forEach((level: any) => {
          allLevelIds.push(level.id);
        });
      });

      console.log(
        `Bulunan ${levelGroupsData?.length || 0} seviye grubu, ${
          allLevelIds.length
        } seviye`
      );

      // Adım 3: Bu seviyeler için components'ları getir (sadece level ID'ler varsa)
      let componentsData = null;
      if (allLevelIds.length > 0) {
        const { data: compData, error: componentsError } = await client
          .from("components")
          .select(
            `
            id, type, content, order, level_id,
            component_types (
              type_key,
              display_name
            )
          `
          )
          .in("level_id", allLevelIds)
          .order("order", { ascending: true });

        if (componentsError) {
          console.error("Bileşenler getirilemedi:", componentsError);
          // Components olmasa da devam et
        } else {
          componentsData = compData;
          console.log(`Bulunan ${componentsData?.length || 0} bileşen`);
        }
      }

      // Adım 4: Verileri birleştir
      const processedData = levelGroupsData?.map((group) => ({
        ...group,
        levels: group.levels?.map((level: any) => ({
          ...level,
          components:
            componentsData?.filter((comp) => comp.level_id === level.id) || [],
        })),
      }));

      // Supabase verisini LevelHierarchy formatına dönüştür
      const levelHierarchy = mapToLevelHierarchy(processedData || []);
      return { data: levelHierarchy, error: null };
    } catch (error) {
      console.error("Seviye grupları getirilirken hata:", error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Bilinmeyen hata"),
      };
    }
  }

  /**
   * Belirli bir seviye grubunu ID ile getirir
   */
  static async getLevelGroupById(groupId: string): Promise<{
    data: LevelGroupItem | null;
    error: Error | null;
  }> {
    try {
      const client = this.getClient();

      const { data, error } = await client
        .from("level_groups")
        .select(
          `
          id, title, order,
          levels (
            id, title, icon_key, icon_family, xp_reward, order,
            components (
              id, type, content, order,
              component_types (
                type_key,
                display_name
              )
            )
          )
        `
        )
        .eq("id", groupId)
        .order("order", { foreignTable: "levels", ascending: true })
        .order("order", { foreignTable: "components", ascending: true })
        .single();

      if (error) {
        console.error("Seviye grubu getirilemedi:", error);
        return { data: null, error: new Error(error.message) };
      }

      // Supabase verisini LevelGroupItem formatına dönüştür
      const levelGroup = mapToLevelHierarchy([data])[0];
      return { data: levelGroup, error: null };
    } catch (error) {
      console.error("Seviye grubu getirilirken hata:", error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Bilinmeyen hata"),
      };
    }
  }

  /**
   * Belirli bir seviyeyi ID ile getirir (bileşenler dahil)
   */
  static async getLevelById(levelId: string): Promise<{
    data: LevelItem | null;
    error: Error | null;
  }> {
    try {
      const client = this.getClient();

      const { data, error } = await client
        .from("levels")
        .select(
          `
          id, title, icon_key, icon_family, xp_reward, order, group_id,
          components (
            id, type, content, order,
            component_types (
              type_key,
              display_name
            )
          )
        `
        )
        .eq("id", levelId)
        .order("order", { foreignTable: "components", ascending: true })
        .single();

      if (error) {
        console.error("Seviye getirilemedi:", error);
        return { data: null, error: new Error(error.message) };
      }

      // Supabase verisini LevelItem formatına dönüştür
      const levelItem: LevelItem = {
        id: data.id,
        title: data.title,
        icon_key: data.icon_key,
        icon_family: data.icon_family,
        xp_reward: data.xp_reward,
        order: data.order,
        components: (data.components ?? []).map(
          (component: any): ComponentItem => ({
            id: component.id,
            type: component.type,
            display_name: component.component_types?.display_name ?? "",
            content: component.content,
            order: component.order,
          })
        ),
      };

      return { data: levelItem, error: null };
    } catch (error) {
      console.error("Seviye getirilirken hata:", error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Bilinmeyen hata"),
      };
    }
  }

  /**
   * Tüm bileşen türlerini getirir
   */
  static async getComponentTypes(appId?: string): Promise<{
    data: ComponentType[] | null;
    error: Error | null;
  }> {
    try {
      const client = this.getClient(appId);

      const { data, error } = await client
        .from("component_types")
        .select("*")
        .eq("is_active", true)
        .order("display_name");

      if (error) {
        console.error("Bileşen türleri getirilemedi:", error);
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Bileşen türleri getirilirken hata:", error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Bilinmeyen hata"),
      };
    }
  }

  /**
   * Belirli bir type_key'e sahip bileşen türünü getirir
   * @param typeKey - Aranacak type_key değeri
   * @returns ComponentType veya null
   */
  static async getComponentTypeByKey(typeKey: string): Promise<{
    data: ComponentType | null;
    error: Error | null;
  }> {
    try {
      const { data: componentTypes, error } = await this.getComponentTypes();

      if (error || !componentTypes) {
        console.error("Bileşen türleri alınırken hata:", error);
        return { data: null, error };
      }

      const componentType =
        componentTypes.find((type) => type.type_key === typeKey) || null;
      return { data: componentType, error: null };
    } catch (error) {
      console.error("Bileşen türü aranırken hata:", error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Bilinmeyen hata"),
      };
    }
  }

  /**
   * Aktif bileşen türlerini filtreler
   * @param componentTypes - ComponentType dizisi
   * @returns Aktif ComponentType dizisi
   */
  static getActiveComponentTypes(
    componentTypes: ComponentType[]
  ): ComponentType[] {
    return componentTypes.filter((type) => type.is_active === true);
  }

  /**
   * Bileşen türlerini display_name'e göre sıralar
   * @param componentTypes - ComponentType dizisi
   * @returns Sıralanmış ComponentType dizisi
   */
  static sortComponentTypesByDisplayName(
    componentTypes: ComponentType[]
  ): ComponentType[] {
    return [...componentTypes].sort((a, b) =>
      a.display_name.localeCompare(b.display_name, "tr", {
        sensitivity: "base",
      })
    );
  }

  /**
   * Kullanıcının belirli bir seviyedeki ilerlemesini getirir
   */
  static async getUserLevelProgress(
    userId: string,
    levelId: string
  ): Promise<{
    data: Database["public"]["Tables"]["user_level_progress"]["Row"] | null;
    error: Error | null;
  }> {
    try {
      const client = this.getClient();

      const { data, error } = await client
        .from("user_level_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("level_id", levelId)
        .maybeSingle();

      if (error) {
        console.error("Kullanıcı ilerlemesi getirilemedi:", error);
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Kullanıcı ilerlemesi getirilirken hata:", error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Bilinmeyen hata"),
      };
    }
  }

  /**
   * Kullanıcının seviye ilerlemesini günceller
   */
  static async updateUserLevelProgress(
    userId: string,
    levelId: string,
    progressData: Partial<
      Database["public"]["Tables"]["user_level_progress"]["Update"]
    >
  ): Promise<{
    data: Database["public"]["Tables"]["user_level_progress"]["Row"] | null;
    error: Error | null;
  }> {
    try {
      const client = this.getClient();

      const { data, error } = await client
        .from("user_level_progress")
        .upsert({
          user_id: userId,
          level_id: levelId,
          updated_at: new Date().toISOString(),
          ...progressData,
        })
        .select()
        .single();

      if (error) {
        console.error("Kullanıcı ilerlemesi güncellenemedi:", error);
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Kullanıcı ilerlemesi güncellenirken hata:", error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Bilinmeyen hata"),
      };
    }
  }

  /**
   * Kullanıcının profilini getirir
   */
  static async getUserProfile(userId: string): Promise<{
    data: Database["public"]["Tables"]["user_profiles"]["Row"] | null;
    error: Error | null;
  }> {
    try {
      const client = this.getClient();

      const { data, error } = await client
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Kullanıcı profili getirilemedi:", error);
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Kullanıcı profili getirilirken hata:", error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Bilinmeyen hata"),
      };
    }
  }

  /**
   * Kullanıcının toplam XP'sini günceller
   */
  static async updateUserXP(
    userId: string,
    xpToAdd: number
  ): Promise<{
    data: Database["public"]["Tables"]["user_profiles"]["Row"] | null;
    error: Error | null;
  }> {
    try {
      const client = this.getClient();

      // Önce mevcut profili al
      const { data: profile, error: profileError } = await client
        .from("user_profiles")
        .select("total_xp")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Kullanıcı profili getirilemedi:", profileError);
        return { data: null, error: new Error(profileError.message) };
      }

      const newTotalXP = (profile.total_xp || 0) + xpToAdd;

      // XP'yi güncelle
      const { data, error } = await client
        .from("user_profiles")
        .update({
          total_xp: newTotalXP,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Kullanıcı XP'si güncellenemedi:", error);
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Kullanıcı XP'si güncellenirken hata:", error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Bilinmeyen hata"),
      };
    }
  }
}
