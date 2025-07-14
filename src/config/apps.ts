// Burada yalnızca tarayıcıda da kullanılabilecek tip ve yardımcı fonksiyonlar yer alır.

export interface AppConfig {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "development";
  supabase: {
    url: string;
    anonKey: string;
    projectId: string;
  };
  icon: string;
  /** Icon için görsel URL (opsiyonel) */
  iconUrl?: string;
  color: string;
  createdAt: string;
  lastUpdated: string;
  /** Uygulamanın arkaplan görseli */
  imageUrl?: string;
}

// Durum renklerini almak için yardımcı fonksiyon
export const getStatusColor = (status: AppConfig["status"]) => {
  switch (status) {
    case "active":
      return "text-green-600 bg-green-100";
    case "development":
      return "text-yellow-600 bg-yellow-100";
    case "inactive":
      return "text-gray-600 bg-gray-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

// Durum metinlerini almak için yardımcı fonksiyon
export const getStatusText = (status: AppConfig["status"]) => {
  switch (status) {
    case "active":
      return "Aktif";
    case "development":
      return "Geliştirme";
    case "inactive":
      return "Pasif";
    default:
      return "Bilinmiyor";
  }
};
