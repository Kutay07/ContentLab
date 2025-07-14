import { useAppConnections } from "@/stores/appConnections";
import { LearningService } from "@/services/learning-service";
import { LevelHierarchy } from "@/types/LevelHierarchy";
import { useQuery } from "@tanstack/react-query";

interface UseLevelDataReturn {
  levelData: LevelHierarchy | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useLevelData(appId: string | null): UseLevelDataReturn {
  const isConnected = useAppConnections((s) =>
    appId ? s.connections[appId]?.connected === true : false
  );

  const {
    data: levelData,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["levelData", appId],
    queryFn: async () => {
      if (!appId) return null;
      const result = await LearningService.getLevelGroupsWithDetails(appId);
      if (result.error) throw new Error(String(result.error));
      return result.data;
    },
    enabled: Boolean(appId && isConnected),
    staleTime: 1000 * 60, // 1 dakika
  });

  return {
    levelData: levelData ?? null,
    loading,
    error: error ? (error as Error).message : null,
    refresh: () => {
      void refetch();
    },
  };
}
