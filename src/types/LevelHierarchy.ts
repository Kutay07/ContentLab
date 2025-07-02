export interface ComponentItem {
  id: string;
  type: string; // component_types.type_key
  display_name: string; // component_types.display_name
  content: any; // JSON
  order: number;
}

export interface LevelItem {
  id: string;
  title: string;
  icon_key: string | null;
  icon_family: string | null;
  xp_reward: number;
  order: number;
  components: ComponentItem[];
}

export interface LevelGroupItem {
  id: string;
  title: string;
  order: number;
  levels: LevelItem[];
}

export type LevelHierarchy = LevelGroupItem[];

// burdaki id değerleri database den gerçek id mi alıyor onu kontrol et.
// yeni oluşturulan herşeyin id sini burda üretme planımız var
// databasede varolan herşeyin id'sini korumalıyız.
