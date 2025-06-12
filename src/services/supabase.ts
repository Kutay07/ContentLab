import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppConfig } from '@/config/apps';

// Mevcut Supabase client'ı ve config'i tutar
let currentClient: SupabaseClient | null = null;
let currentConfig: AppConfig | null = null;

// Supabase client oluştur/güncelle
export const initializeSupabaseClient = (appConfig: AppConfig): SupabaseClient => {
  // Eğer aynı config ile zaten client varsa, mevcut client'ı döndür
  if (currentClient && currentConfig?.id === appConfig.id) {
    return currentClient;
  }

  // Yeni client oluştur
  currentClient = createClient(
    appConfig.supabase.url,
    appConfig.supabase.anonKey
  );
  
  currentConfig = appConfig;
  
  console.log(`Supabase client initialized for: ${appConfig.name}`);
  return currentClient;
};

// Mevcut client'ı al
export const getSupabaseClient = (): SupabaseClient | null => {
  return currentClient;
};

// Client'ı temizle
export const clearSupabaseClient = () => {
  currentClient = null;
  currentConfig = null;
  console.log('Supabase client cleared');
};

// Mevcut config'i al
export const getCurrentConfig = (): AppConfig | null => {
  return currentConfig;
};

// Bağlantıyı test et
export const testConnection = async (appConfig: AppConfig): Promise<boolean> => {
  try {
    const client = initializeSupabaseClient(appConfig);
    
    // Basit bir sorgu ile bağlantıyı test et
    const { data, error } = await client
      .from('level_groups')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

// Veritabanı tabloları kontrol et
export const checkDatabaseTables = async (): Promise<{
  success: boolean;
  tables: string[];
  error?: string;
}> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, tables: [], error: 'No active client' };
  }

  try {
    // Önce level_groups tablosunu kontrol et
    const { data, error } = await client
      .from('level_groups')
      .select('*')
      .limit(1);

    if (error) {
      return { 
        success: false, 
        tables: [], 
        error: error.message 
      };
    }

    // Başarılı ise diğer tabloları da kontrol et
    const requiredTables = ['level_groups', 'levels', 'components', 'component_types'];
    const availableTables: string[] = [];

    for (const tableName of requiredTables) {
      try {
        const { error: tableError } = await client
          .from(tableName)
          .select('id')
          .limit(1);
        
        if (!tableError) {
          availableTables.push(tableName);
        }
      } catch {
        // Tablo yoksa continue
      }
    }

    return {
      success: true,
      tables: availableTables
    };
  } catch (error) {
    return { 
      success: false, 
      tables: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}; 

