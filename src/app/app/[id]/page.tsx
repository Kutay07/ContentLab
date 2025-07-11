"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app";
import { AppConfig } from "@/config/apps";
import { checkDatabaseTables } from "@/services/supabase";
import { supabaseManager } from "@/services/supabaseManager";
import { LearningService } from "@/services/learning-service";
import {
  ContentPreview,
  LevelHierarchyTextView,
  HierarchyProvider,
  ControlBar,
} from "@/components/global";
import { LevelHierarchy } from "@/types/LevelHierarchy";
import { AppProvider } from "@/contexts/AppContext";

// Örnek veri yapısı
// const sampleLevelHierarchyData: LevelHierarchy = [
//   {
//     id: 'group-1',
//     title: 'Temel JavaScript Kavramları',
//     order: 1,
//     levels: [
//       {
//         id: 'level-1-1',
//         title: 'Değişkenler ve Veri Tipleri',
//         icon_key: 'variable',
//         icon_family: 'material',
//         xp_reward: 100,
//         order: 1,
//         components: [
//           {
//             id: 'comp-1-1-1',
//             type: 'text_explanation',
//             display_name: 'String Değişkenler',
//             content: {
//               title: 'String Veri Tipi',
//               description: 'JavaScript\'te metinsel verileri saklamak için kullanılır.',
//               examples: ['let name = "Ahmet";', 'let message = `Merhaba ${name}`;']
//             },
//             order: 1
//           },
//           {
//             id: 'comp-1-1-2',
//             type: 'code_example',
//             display_name: 'Number Örnekleri',
//             content: {
//               code: 'let age = 25;\nlet price = 19.99;\nconsole.log(age + price);',
//               language: 'javascript',
//               explanation: 'Sayısal değerlerin tanımlanması ve kullanımı'
//             },
//             order: 2
//           },
//           {
//             id: 'comp-1-1-3',
//             type: 'interactive_quiz',
//             display_name: 'Boolean Quiz',
//             content: {
//               question: 'Aşağıdaki boolean değerlerinden hangisi doğrudur?',
//               options: ['true', 'false', '1', '0'],
//               correct_answer: 'true',
//               explanation: 'Boolean veri tipi sadece true veya false değerlerini alabilir.'
//             },
//             order: 3
//           },
//           {
//             id: 'comp-1-1-4',
//             type: 'interactive_quiz',
//             display_name: 'Boolean Quiz',
//             content: {
//               question: 'Aşağıdaki boolean değerlerinden hangisi doğrudur?',
//               options: ['true', 'false', '1', '0'],
//               correct_answer: 'true',
//               explanation: 'Boolean veri tipi sadece true veya false değerlerini alabilir.'
//             },
//             order: 4
//           },
//           {
//             id: 'comp-1-1-5',
//             type: 'interactive_quiz',
//             display_name: 'Boolean Quiz',
//             content: {
//               question: 'Aşağıdaki boolean değerlerinden hangisi doğrudur?',
//               options: ['true', 'false', '1', '0'],
//               correct_answer: 'true',
//               explanation: 'Boolean veri tipi sadece true veya false değerlerini alabilir.'
//             },
//             order: 5
//           },
//           {
//             id: 'comp-1-1-6',
//             type: 'interactive_quiz',
//             display_name: 'Boolean Quiz',
//             content: {
//               question: 'Aşağıdaki boolean değerlerinden hangisi doğrudur?',
//               options: ['true', 'false', '1', '0'],
//               correct_answer: 'true',
//               explanation: 'Boolean veri tipi sadece true veya false değerlerini alabilir.'
//             },
//             order: 6
//           }
//         ]
//       },
//       {
//         id: 'level-1-2',
//         title: 'Fonksiyonlar',
//         icon_key: 'function',
//         icon_family: 'material',
//         xp_reward: 150,
//         order: 2,
//         components: [
//           {
//             id: 'comp-1-2-1',
//             type: 'video_tutorial',
//             display_name: 'Fonksiyon Tanımlama',
//             content: {
//               video_url: 'https://example.com/video1.mp4',
//               duration: 300,
//               description: 'JavaScript\'te fonksiyon tanımlama yöntemleri'
//             },
//             order: 1
//           },
//           {
//             id: 'comp-1-2-2',
//             type: 'coding_exercise',
//             display_name: 'Hesaplama Fonksiyonu',
//             content: {
//               instruction: 'İki sayıyı toplayıp sonucu döndüren bir fonksiyon yazın.',
//               starter_code: 'function add(a, b) {\n  // kodunuzu buraya yazın\n}',
//               test_cases: [
//                 { input: [2, 3], expected: 5 },
//                 { input: [10, 15], expected: 25 }
//               ]
//             },
//             order: 2
//           }
//         ]
//       }
//     ]
//   },
//   {
//     id: 'group-2',
//     title: 'React Temelleri',
//     order: 2,
//     levels: [
//       {
//         id: 'level-2-1',
//         title: 'Component Yapısı',
//         icon_key: 'component',
//         icon_family: 'react',
//         xp_reward: 200,
//         order: 1,
//         components: [
//           {
//             id: 'comp-2-1-1',
//             type: 'text_explanation',
//             display_name: 'Functional Components',
//             content: {
//               title: 'React Functional Components',
//               description: 'Modern React uygulamalarında en çok kullanılan component tipi.',
//               key_points: [
//                 'Fonksiyon olarak tanımlanır',
//                 'JSX döndürür',
//                 'Hooks kullanabilir'
//               ]
//             },
//             order: 1
//           },
//           {
//             id: 'comp-2-1-2',
//             type: 'code_example',
//             display_name: 'İlk React Component',
//             content: {
//               code: 'import React from \'react\';\n\nfunction Welcome(props) {\n  return <h1>Merhaba, {props.name}!</h1>;\n}\n\nexport default Welcome;',
//               language: 'javascript',
//               explanation: 'Basit bir React functional component örneği'
//             },
//             order: 2
//           }
//         ]
//       }
//     ]
//   },
//   {
//     id: 'group-3',
//     title: 'İleri Seviye Konular',
//     order: 3,
//     levels: [
//       {
//         id: 'level-3-1',
//         title: 'State Management',
//         icon_key: 'state',
//         icon_family: 'material',
//         xp_reward: 300,
//         order: 1,
//         components: [] // Boş seviye örneği
//       }
//     ]
//   }
// ];

export default function AppManagementPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const { selectedApp, setSelectedApp, isConnected, setIsConnected } =
    useAppStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbTables, setDbTables] = useState<string[]>([]);
  const [levelData, setLevelData] = useState<LevelHierarchy | null>(null);

  const appId = params.id as string;
  const [app, setApp] = useState<AppConfig | null>(null);
  const [loadingApp, setLoadingApp] = useState(true);

  useEffect(() => {
    async function fetchApp() {
      try {
        const res = await fetch("/api/apps");
        if (!res.ok) throw new Error("Uygulama verisi alınamadı");
        const data = (await res.json()) as AppConfig[];
        const found = data.find((a) => a.id === appId) || null;
        setApp(found);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingApp(false);
      }
    }
    fetchApp();
  }, [appId]);

  // URL'den app ID'sini al ve uygulamayı yükle
  useEffect(() => {
    if (!app) {
      setError("Uygulama bulunamadı");
      setLoading(false);
      return;
    }

    // Eğer farklı bir uygulama seçilmişse, önce mevcut bağlantıyı temizle
    if (selectedApp && selectedApp.id !== app.id) {
      supabaseManager.disconnect(selectedApp.id);
    }

    setSelectedApp(app);
    connectToApp(app);
  }, [app, selectedApp, setSelectedApp]);

  const connectToApp = async (app: AppConfig) => {
    setLoading(true);
    setError(null);

    try {
      // Bağlantıyı kur (varsa mevcut dönecek)
      await supabaseManager.connect(app, true);

      // Veritabanı tablolarını kontrol et
      const client = supabaseManager.getClient(app.id);
      const { error: tblErr } = await client
        .from("level_groups")
        .select("id")
        .limit(1);
      if (tblErr) throw tblErr;

      setDbTables(["level_groups"]);

      setIsConnected(true);

      // Seviye verilerini yükle
      const levelResult = await LearningService.getLevelGroupsWithDetails(
        appId
      );
      if (levelResult.error) {
        console.error("Seviye verileri yüklenemedi:", levelResult.error);
        // Hata durumunda
        setLevelData(null);
      } else {
        setLevelData(levelResult.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      setIsConnected(false);
      setLevelData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToApps = () => {
    if (app) supabaseManager.disconnect(app.id);
    setSelectedApp(null);
    setIsConnected(false);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Uygulamaya bağlanılıyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Bağlantı Hatası
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBackToApps}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Uygulamalar Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  if (loadingApp) {
    return <div className="p-6 text-center">Yükleniyor...</div>;
  }

  if (!app) {
    return (
      <div className="p-6">
        <p className="text-red-500">Uygulama bulunamadı.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="p-6 text-center">
        <p>
          Bu uygulamaya henüz bağlanmadınız. Lütfen ana sayfaya dönüp "Bağlan"
          butonunu kullanın.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Ana Sayfa
        </button>
      </div>
    );
  }

  return (
    <AppProvider appId={app.id}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBackToApps}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="text-2xl">{app.icon}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{app.name}</h1>
                <p className="text-gray-600">{app.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  isConnected
                    ? "text-green-600 bg-green-100"
                    : "text-red-600 bg-red-100"
                }`}
              >
                {isConnected ? "Bağlı" : "Bağlantı Yok"}
              </span>
            </div>
          </div>

          {/* Level Group Manager */}
          {isConnected && levelData && (
            <HierarchyProvider initialData={levelData}>
              <div className="space-y-6">
                <ControlBar />
                <ContentPreview data={levelData} />
                <LevelHierarchyTextView data={levelData} />
              </div>
            </HierarchyProvider>
          )}

          {/* Veri yükleniyor durumu */}
          {isConnected && !levelData && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Seviye verileri yükleniyor...</p>
            </div>
          )}
        </div>
      </div>
    </AppProvider>
  );
}
