export interface AppConfig {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'development';
  supabase: {
    url: string;
    anonKey: string;
    projectId: string;
  };
  icon: string;
  color: string;
  createdAt: string;
  lastUpdated: string;
}

// Uygulamalar listesi - Yeni uygulama eklemek için bu listeyi güncelleyin
export const APPS_CONFIG: AppConfig[] = [
  {
    id: '1',
    name: 'Code-Learner-App',
    description: 'kod öğrenme uygulaması',
    status: 'active',
    supabase: {
      url: 'https://iajkdwsxkarimhexvtod.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlhamtkd3N4a2FyaW1oZXh2dG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTcwNzAsImV4cCI6MjA2NDY5MzA3MH0.FtLU2ZzkjUTZegUyUXYjqxY29-jUgBbVCZC5X43SlFQ',
      projectId: 'iajkdwsxkarimhexvtod'
    },
    icon: '🤌',
    color: 'blue',
    createdAt: '2025-01-15',
    lastUpdated: '2025-01-15'
  },
  {
    id: 'demo-app',
    name: 'Demo Uygulaması',
    description: 'Test ve demo amaçlı örnek uygulama',
    status: 'development',
    supabase: {
      url: 'https://demo-project.supabase.co',
      anonKey: 'demo-anon-key-here',
      projectId: 'demo-project-id'
    },
    icon: '🧪',
    color: 'green',
    createdAt: '2025-01-10',
    lastUpdated: '2025-01-12'
  },
  {
    id: 'test-app',
    name: 'Test Uygulaması',
    description: 'Geliştirme sürecinde olan test uygulaması',
    status: 'active',
    supabase: {
      url: 'https://test-project.supabase.co',
      anonKey: 'test-anon-key-here',
      projectId: 'test-project-id'
    },
    icon: '⚡',
    color: 'purple',
    createdAt: '2025-01-05',
    lastUpdated: '2025-01-08'
  }
];

// Durum renklerini almak için yardımcı fonksiyon
export const getStatusColor = (status: AppConfig['status']) => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100';
    case 'development':
      return 'text-yellow-600 bg-yellow-100';
    case 'inactive':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Durum metinlerini almak için yardımcı fonksiyon
export const getStatusText = (status: AppConfig['status']) => {
  switch (status) {
    case 'active':
      return 'Aktif';
    case 'development':
      return 'Geliştirme';
    case 'inactive':
      return 'Pasif';
    default:
      return 'Bilinmiyor';
  }
}; 