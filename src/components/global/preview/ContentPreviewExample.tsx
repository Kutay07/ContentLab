import React from 'react';
import ContentPreview from './ContentPreview';
import { LevelHierarchy } from '@/types/LevelHierarchy';

// Örnek veri yapısı
const sampleLevelHierarchyData: LevelHierarchy = [
  {
    id: 'group-1',
    title: 'Temel JavaScript Kavramları',
    order: 1,
    levels: [
      {
        id: 'level-1-1',
        title: 'Değişkenler ve Veri Tipleri',
        icon_key: 'variable',
        icon_family: 'material',
        xp_reward: 100,
        order: 1,
        components: [
          {
            id: 'comp-1-1-1',
            type: 'text_explanation',
            display_name: 'String Değişkenler',
            content: {
              title: 'String Veri Tipi',
              description: 'JavaScript\'te metinsel verileri saklamak için kullanılır.',
              examples: ['let name = "Ahmet";', 'let message = `Merhaba ${name}`;']
            },
            order: 1
          },
          {
            id: 'comp-1-1-2',
            type: 'code_example',
            display_name: 'Number Örnekleri',
            content: {
              code: 'let age = 25;\nlet price = 19.99;\nconsole.log(age + price);',
              language: 'javascript',
              explanation: 'Sayısal değerlerin tanımlanması ve kullanımı'
            },
            order: 2
          },
          {
            id: 'comp-1-1-3',
            type: 'interactive_quiz',
            display_name: 'Boolean Quiz',
            content: {
              question: 'Aşağıdaki boolean değerlerinden hangisi doğrudur?',
              options: ['true', 'false', '1', '0'],
              correct_answer: 'true',
              explanation: 'Boolean veri tipi sadece true veya false değerlerini alabilir.'
            },
            order: 3
          }
        ]
      },
      {
        id: 'level-1-2',
        title: 'Fonksiyonlar',
        icon_key: 'function',
        icon_family: 'material',
        xp_reward: 150,
        order: 2,
        components: [
          {
            id: 'comp-1-2-1',
            type: 'video_tutorial',
            display_name: 'Fonksiyon Tanımlama',
            content: {
              video_url: 'https://example.com/video1.mp4',
              duration: 300,
              description: 'JavaScript\'te fonksiyon tanımlama yöntemleri'
            },
            order: 1
          },
          {
            id: 'comp-1-2-2',
            type: 'coding_exercise',
            display_name: 'Hesaplama Fonksiyonu',
            content: {
              instruction: 'İki sayıyı toplayıp sonucu döndüren bir fonksiyon yazın.',
              starter_code: 'function add(a, b) {\n  // kodunuzu buraya yazın\n}',
              test_cases: [
                { input: [2, 3], expected: 5 },
                { input: [10, 15], expected: 25 }
              ]
            },
            order: 2
          }
        ]
      }
    ]
  },
  {
    id: 'group-2',
    title: 'React Temelleri',
    order: 2,
    levels: [
      {
        id: 'level-2-1',
        title: 'Component Yapısı',
        icon_key: 'component',
        icon_family: 'react',
        xp_reward: 200,
        order: 1,
        components: [
          {
            id: 'comp-2-1-1',
            type: 'text_explanation',
            display_name: 'Functional Components',
            content: {
              title: 'React Functional Components',
              description: 'Modern React uygulamalarında en çok kullanılan component tipi.',
              key_points: [
                'Fonksiyon olarak tanımlanır',
                'JSX döndürür',
                'Hooks kullanabilir'
              ]
            },
            order: 1
          },
          {
            id: 'comp-2-1-2',
            type: 'code_example',
            display_name: 'İlk React Component',
            content: {
              code: 'import React from \'react\';\n\nfunction Welcome(props) {\n  return <h1>Merhaba, {props.name}!</h1>;\n}\n\nexport default Welcome;',
              language: 'javascript',
              explanation: 'Basit bir React functional component örneği'
            },
            order: 2
          }
        ]
      }
    ]
  },
  {
    id: 'group-3',
    title: 'İleri Seviye Konular',
    order: 3,
    levels: [
      {
        id: 'level-3-1',
        title: 'State Management',
        icon_key: 'state',
        icon_family: 'material',
        xp_reward: 300,
        order: 1,
        components: [] // Boş seviye örneği
      }
    ]
  }
];

// Ana örnek component
const ContentPreviewExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ContentPreview Bileşeni - Örnek Kullanım
          </h1>
          <p className="text-gray-600 mb-6">
            Bu sayfa ContentPreview bileşeninin nasıl kullanılacağını gösterir. 
            Aşağıda hierarchical eğitim içeriğinin nasıl render edildiğini inceleyebilirsiniz.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Kullanım Örneği:</h3>
            <pre className="text-sm text-blue-800 bg-blue-100 p-3 rounded font-mono">
{`import ContentPreview from '@/components/global/ContentPreview';
import { LevelHierarchy } from '@/types/LevelHierarchy';

// Veri yapınız
const data: LevelHierarchy = [...];

// Kullanım
<ContentPreview 
  data={data} 
  title="Eğitim İçeriği" 
  allowMultipleOpen={true} 
/>`}
            </pre>
          </div>
        </div>

        {/* Ana ContentPreview Bileşeni */}
        <ContentPreview 
          data={sampleLevelHierarchyData}
          title="Örnek Eğitim Platformu İçeriği"
          allowMultipleOpen={true}
          className="mb-8"
        />

        {/* Veri Yapısı Açıklaması */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Veri Yapısı Hiyerarşisi</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
              <h4 className="font-semibold text-purple-900 mb-2">📚 Level Groups (Seviye Grupları)</h4>
              <p>Ana kategoriler. Örnek: "Temel JavaScript Kavramları", "React Temelleri"</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 ml-6">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Levels (Seviyeler)</h4>
              <p>Grup içindeki alt konular. Örnek: "Değişkenler ve Veri Tipleri", "Fonksiyonlar"</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400 ml-12">
              <h4 className="font-semibold text-green-900 mb-2">🧩 Components (Bileşenler)</h4>
              <p>Gerçek eğitim içerikleri. Örnek: Video, Quiz, Kod Örneği, Açıklama metni</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPreviewExample; 