"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { ContentHierarchyService } from "@/services/ContentHierarchyService";
import { LevelHierarchy } from "@/types/LevelHierarchy";

interface HierarchyContextType {
  hierarchy: LevelHierarchy;
  service: ContentHierarchyService;
  isLoading: boolean;
}

const HierarchyContext = createContext<HierarchyContextType | undefined>(
  undefined
);

interface HierarchyProviderProps {
  children: ReactNode;
  initialData?: LevelHierarchy;
}

export default function HierarchyProvider({
  children,
  initialData,
}: HierarchyProviderProps) {
  const service = ContentHierarchyService.getInstance();

  // Yerel state'ler
  const [hierarchy, setHierarchy] = useState<LevelHierarchy>(
    service.getHierarchy()
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Servisi sadece ilk render'dan hemen sonra hazırla
  useEffect(() => {
    // Service'i resetle & veriyi yükle
    if (initialData) {
      service.reset();
      // ContentHierarchyService.deserialize beklenen format:
      // { hierarchy: LevelHierarchy, commandHistory?: [], timestamp?: number }
      // initialData sadece LevelHierarchy dizisi ise onu sarmalayarak geçelim.
      service.deserialize(
        JSON.stringify({
          hierarchy: initialData,
          timestamp: Date.now(),
        })
      );
      service.setBaseline(initialData);
    }

    // Dinleyiciyi ekle
    const unsubscribe = service.subscribe((newHierarchy) => {
      setHierarchy(newHierarchy);
    });

    // İlk state'i ayarla
    setHierarchy(service.getHierarchy());
    setIsInitialized(true);

    return () => {
      unsubscribe();
    };
    // initialData bağımlılığı bilinçli olarak eklenmedi; sadece mount'ta çalışacak
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue: HierarchyContextType = {
    hierarchy,
    service,
    isLoading: !isInitialized,
  };

  if (!isInitialized) {
    return null; // Servis hazır olmadan çocukları render etme
  }

  return (
    <HierarchyContext.Provider value={contextValue}>
      {children}
    </HierarchyContext.Provider>
  );
}

export function useHierarchy(): HierarchyContextType {
  const context = useContext(HierarchyContext);
  if (context === undefined) {
    throw new Error("useHierarchy must be used within a HierarchyProvider");
  }
  return context;
}
