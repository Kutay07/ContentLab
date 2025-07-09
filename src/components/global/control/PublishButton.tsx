"use client";

import React, { useState } from "react";
import { useHierarchy } from "../context/HierarchyProvider";
import { LearningService } from "@/services/learning-service";
import { generateSqlFromDiff } from "@/utils/diffToSql";
import { supabaseManager } from "@/services/supabaseManager";
import { logEvent } from "@/utils/logger";
import { useAuth } from "@/hooks/useAuth";
import { useAppContext } from "@/contexts/AppContext";
import { ContentHierarchyService } from "@/services/ContentHierarchyService";

interface PublishButtonProps {
  className?: string;
  onToast?: (message: string, type: "success" | "error") => void;
}

export default function PublishButton({
  className = "",
  onToast,
}: PublishButtonProps) {
  const { service } = useHierarchy();
  const { appId } = useAppContext();
  const { user } = useAuth();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);

    // Log publish_start
    logEvent({
      timestamp: Date.now(),
      appId,
      user: user?.username,
      event: "publish_start",
    });

    try {
      const client = supabaseManager.getClient(appId);
      if (!client) {
        throw new Error("Supabase client başlatılmamış.");
      }

      // 1) Yayındaki veriyi al ve baseline olarak ayarla
      const { data: liveHierarchy, error: liveErr } =
        await LearningService.getLevelGroupsWithDetails(appId);
      if (liveErr || !liveHierarchy) {
        throw new Error(liveErr?.message || "Yayınlanmış veri alınamadı");
      }
      service.setBaseline(liveHierarchy, false);

      // 2) Geçerlilik kontrolü
      const { isValid, errors } = service.validateHierarchyDetailed();
      if (!isValid) {
        onToast?.(`Doğrulama hatası: ${errors[0]}`, "error");
        console.error("Validation errors", errors);
        return;
      }

      // 3) Diff + SQL üret
      const diff = service.diffWithBaselineDetailed();
      const totalChanges =
        diff.added.groups.length +
        diff.added.levels.length +
        diff.added.components.length +
        diff.updated.groups.length +
        diff.updated.levels.length +
        diff.updated.components.length +
        diff.deleted.groups.length +
        diff.deleted.levels.length +
        diff.deleted.components.length;

      if (totalChanges === 0) {
        onToast?.(
          "Değişiklik bulunamadı – yayınlanacak bir şey yok.",
          "success"
        );
        return;
      }

      const sqlArray = generateSqlFromDiff(diff, service.getHierarchy());
      if (sqlArray.length === 0) {
        onToast?.("SQL üretilmedi.", "error");
        return;
      }

      // 3) RPC çağrısı
      const { error: rpcError } = await client.rpc("publish_hierarchy_sql", {
        stmts: sqlArray,
      });

      if (rpcError) {
        console.error("Publish RPC hatası:", rpcError);
        throw new Error(rpcError.message);
      }

      // Başarılı
      service.markSynced();
      onToast?.("İçerik başarıyla yayınlandı!", "success");

      // Log success
      logEvent({
        timestamp: Date.now(),
        appId,
        user: user?.username,
        event: "publish_success",
      });
    } catch (err) {
      console.error("Publish hata:", err);
      onToast?.(
        err instanceof Error ? err.message : "Bilinmeyen yayınlama hatası",
        "error"
      );

      logEvent({
        timestamp: Date.now(),
        appId,
        user: user?.username,
        event: "publish_error",
        meta: {
          message: err instanceof Error ? err.message : String(err),
        },
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <button
      onClick={handlePublish}
      disabled={isPublishing}
      className={`${className} inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50`}
      title="Taslağı Yayınla"
    >
      {isPublishing ? (
        <svg
          className="animate-spin h-4 w-4 mr-2 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      ) : (
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
      Yayınla
    </button>
  );
}
