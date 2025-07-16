import React, { ReactNode, useRef, useState, useEffect } from "react";
import {
  Panel,
  PanelGroup,
  ImperativePanelHandle,
} from "react-resizable-panels";
import { usePanelVisibilityStore } from "@/stores/panelVisibility";
import styles from "./ManagementLayout.module.css";

interface ManagementLayoutProps {
  /** Sol panel: hiyerarşi görünümü */
  left: ReactNode;
  /** Orta panel: mobil önizleme */
  center: ReactNode;
  /** Sağ panel: bileşen editörü */
  right: ReactNode;
  /** Panel varsayılan genişlik yüzdeleri (sol, orta, sağ) */
  defaultSizes?: [number, number, number];
}

/**
 * Yönetim sayfası için 3 sütunlu sürüklenebilir düzen.
 * Tailwind + react-resizable-panels kullanır.
 */
const ManagementLayout: React.FC<ManagementLayoutProps> = ({
  left,
  center,
  right,
  defaultSizes = [50, 20, 30],
}) => {
  const leftRef = useRef<ImperativePanelHandle>(null);
  const centerRef = useRef<ImperativePanelHandle>(null);
  const rightRef = useRef<ImperativePanelHandle>(null);

  // Panel görünürlüğü store'dan al
  const {
    leftVisible,
    centerVisible,
    rightVisible,
    rememberedSizes,
    setRememberedSizes,
  } = usePanelVisibilityStore();

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [centerCollapsed, setCenterCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // Kilitli panel bilgisi
  const [lockedIndex, setLockedIndex] = useState<0 | 1 | 2 | null>(null);
  const [lockedSize, setLockedSize] = useState<number>(0);

  const toggleLock = (idx: 0 | 1 | 2) => {
    if (lockedIndex === idx) {
      // Mevcut kilidi kaldır
      setLockedIndex(null);
    } else {
      // Başka panel kilitliyse kaldır
      setLockedIndex(idx);
      setLockedSize(panelSizes[idx]);
    }
  };

  // Aktif (görünür) panel bayrakları – çökme durumundan bağımsız sadece store’daki görünürlük
  const leftActive = leftVisible;
  const centerActive = centerVisible;
  const rightActive = rightVisible;

  const isLockedActive =
    lockedIndex !== null &&
    [leftActive, centerActive, rightActive][lockedIndex];

  // Panel boyutlarını takip et
  const [panelSizes, setPanelSizes] =
    useState<[number, number, number]>(rememberedSizes);

  // Gizlenen panellerin genişliğini hesapla ve dağıt
  const getAdjustedPanelSizes = (): [number, number, number] => {
    // Sadece ekranda gerçekten görünen panelleri dikkate al
    const visibleFlags = [leftActive, centerActive, rightActive];
    const visibleCount = visibleFlags.filter(Boolean).length;

    if (visibleCount === 0) return [0, 0, 0];

    if (visibleCount === 3 && !isLockedActive) return panelSizes;

    // Kilitli panel varsa önce onu ayarla, geri kalanı orantıla
    if (isLockedActive && lockedIndex !== null) {
      const remaining = 100 - lockedSize;
      // Mevcut panelSizes'tan kilitli çıkar, geri kalanı normalize et
      let sizes = [...panelSizes] as [number, number, number];
      sizes[lockedIndex] = lockedSize;

      const otherIndices = [0, 1, 2].filter((i) => i !== lockedIndex);
      const otherSum = otherIndices.reduce((sum, i) => sum + sizes[i], 0) || 1;
      otherIndices.forEach((i) => {
        sizes[i] = (sizes[i] / otherSum) * remaining;
      });
      return sizes as [number, number, number];
    }

    // Kilitli panel yoksa tek/çift panel durumları
    if (visibleCount === 3) return panelSizes;

    // Görünür panellerin hatırlanan genişliklerini al
    const [leftSize, centerSize, rightSize] = rememberedSizes;
    let adjusted: [number, number, number] = [0, 0, 0];

    if (visibleCount === 1) {
      if (leftActive) adjusted = [100, 0, 0];
      else if (centerActive) adjusted = [0, 100, 0];
      else adjusted = [0, 0, 100];
    } else if (visibleCount === 2) {
      if (leftActive && centerActive) {
        const total = leftSize + centerSize || 1;
        adjusted = [(leftSize / total) * 100, (centerSize / total) * 100, 0];
      } else if (leftActive && rightActive) {
        const total = leftSize + rightSize || 1;
        adjusted = [(leftSize / total) * 100, 0, (rightSize / total) * 100];
      } else if (centerActive && rightActive) {
        const total = centerSize + rightSize || 1;
        adjusted = [0, (centerSize / total) * 100, (rightSize / total) * 100];
      }
    }

    return adjusted;
  };

  const adjustedPanelSizes = getAdjustedPanelSizes();

  // İlk yükleme sırasında hatırlanan genişlikleri güncelle
  useEffect(() => {
    if (
      rememberedSizes[0] !== defaultSizes[0] ||
      rememberedSizes[1] !== defaultSizes[1] ||
      rememberedSizes[2] !== defaultSizes[2]
    ) {
      setPanelSizes(rememberedSizes);
    }
  }, [rememberedSizes, defaultSizes]);

  // Store'dan gelen görünürlük durumuna göre panelleri güncelle
  useEffect(() => {
    const leftRef_ = leftRef.current;
    const centerRef_ = centerRef.current;
    const rightRef_ = rightRef.current;

    const newSizes = getAdjustedPanelSizes();

    if (leftRef_) {
      if (leftActive) {
        leftRef_.expand();
        leftRef_.resize(newSizes[0]);
      } else {
        leftRef_.collapse();
      }
    }

    if (centerRef_) {
      if (centerActive) {
        centerRef_.expand();
        centerRef_.resize(newSizes[1]);
      } else {
        centerRef_.collapse();
      }
    }

    if (rightRef_) {
      if (rightActive) {
        rightRef_.expand();
        rightRef_.resize(newSizes[2]);
      } else {
        rightRef_.collapse();
      }
    }
  }, [leftActive, centerActive, rightActive]);

  // locked panel gizlenmişse, kilit aktif kabul edilmez
  useEffect(() => {
    if (lockedIndex !== null) {
      const activeFlags = [leftActive, centerActive, rightActive];
      if (!activeFlags[lockedIndex]) {
        // kilitli panel görünmüyor, aktiflik iptal edilir (kilit bilgisi saklanır)
      }
    }
  }, [leftActive, centerActive, rightActive, lockedIndex]);

  // Panel boyutları değiştiğinde state'i güncelle
  const handlePanelResize = (sizes: number[]) => {
    if (sizes.length !== 3) return;

    let newSizes: [number, number, number] = [...panelSizes];

    // Sadece ilgili panel görünürse yeni genişliği kaydet
    if (leftVisible) newSizes[0] = sizes[0];
    if (centerVisible) newSizes[1] = sizes[1];
    if (rightVisible) newSizes[2] = sizes[2];

    setPanelSizes(newSizes);

    // En az iki panel görünürken genişlikleri hatırla (gizli panel 0 olarak kaydedilmesin)
    const visibleCnt = [leftVisible, centerVisible, rightVisible].filter(
      Boolean
    ).length;
    if (visibleCnt >= 2) {
      setRememberedSizes(newSizes);
    }
  };

  // Sekme arası resize handle için mouse event handlers
  const handleTabResize = (
    e: React.MouseEvent,
    leftIdx: 0 | 1 | 2,
    rightIdx: 0 | 1 | 2
  ) => {
    e.preventDefault();

    const startX = e.clientX;
    const startSizes = [...panelSizes];
    const containerWidth = e.currentTarget.parentElement?.offsetWidth || 1;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;

      let newSizes = [...startSizes] as [number, number, number];

      // Kilitli panel handle üzerinde ise özel işlem
      if (
        lockedIndex !== null &&
        (lockedIndex === leftIdx || lockedIndex === rightIdx) &&
        isLockedActive
      ) {
        const freeIdx = lockedIndex === leftIdx ? rightIdx : leftIdx;
        const otherIdx = (3 - lockedIndex - freeIdx) as 0 | 1 | 2;

        const signedDelta =
          lockedIndex === leftIdx ? -deltaPercent : deltaPercent;

        const clamp = (val: number) => Math.min(95, Math.max(5, val));

        let newFree = clamp(startSizes[freeIdx] + signedDelta);
        let newOther = 100 - lockedSize - newFree;

        if (newOther < 5) {
          newOther = 5;
          newFree = 100 - lockedSize - 5;
        }

        const updated: [number, number, number] = [...startSizes] as [
          number,
          number,
          number
        ];
        updated[lockedIndex] = lockedSize;
        updated[freeIdx] = newFree;
        updated[otherIdx] = newOther;

        setPanelSizes(updated);

        if (leftRef.current) leftRef.current.resize(updated[0]);
        if (centerRef.current) centerRef.current.resize(updated[1]);
        if (rightRef.current) rightRef.current.resize(updated[2]);

        return;
      }

      // İki paneli karşılıklı orantılı değiştir, toplamı 100 koru
      if (lockedIndex !== null && isLockedActive) {
        // Kilitli panel varsa ayarlanabilir toplam
        const freeTotal = 100 - lockedSize;

        // İlk olarak sol/sağ değerleri freeTotal oranında hesapla
        const clampFree = (val: number) =>
          Math.min(freeTotal - 5, Math.max(5, val));

        let leftValRel = clampFree(
          ((startSizes[leftIdx] + deltaPercent) / (100 - lockedSize)) *
            freeTotal
        );
        let rightValRel = freeTotal - leftValRel;

        if (rightValRel < 5) {
          rightValRel = 5;
          leftValRel = freeTotal - 5;
        }

        const newArr: [number, number, number] = [...startSizes] as [
          number,
          number,
          number
        ];
        newArr[leftIdx] = leftValRel;
        newArr[rightIdx] = rightValRel;
        newArr[lockedIndex] = lockedSize;

        setPanelSizes(newArr);

        if (leftRef.current) leftRef.current.resize(newArr[0]);
        if (centerRef.current) centerRef.current.resize(newArr[1]);
        if (rightRef.current) rightRef.current.resize(newArr[2]);

        return;
      }

      // Kilitli panel yoksa klasik algoritma
      const clamp = (val: number) => Math.min(95, Math.max(5, val));

      let leftVal = clamp(startSizes[leftIdx] + deltaPercent);
      let rightVal = clamp(startSizes[rightIdx] - deltaPercent);

      // Üçüncü panelin indexini bul
      const otherIdx = (3 - leftIdx - rightIdx) as 0 | 1 | 2;

      let otherVal = 100 - leftVal - rightVal;

      const otherActive = [leftActive, centerActive, rightActive][otherIdx];

      // Eğer aktifse min 5 kuralını uygula, değilse 0 olabilir
      if (otherActive && otherVal < 5) {
        const deficit = 5 - otherVal;
        otherVal = 5;
        // Deficiti büyük panelden düş
        if (leftVal > rightVal) {
          leftVal = clamp(leftVal - deficit);
        } else {
          rightVal = clamp(rightVal - deficit);
        }
      }

      // Son kontrol: toplam tam 100 yap
      const total = leftVal + rightVal + otherVal;
      if (total !== 100) {
        // Küçük yuvarlama hataları için düzelt
        const diff = 100 - total;
        rightVal = clamp(rightVal + diff);
      }

      newSizes[leftIdx] = leftVal;
      newSizes[rightIdx] = rightVal;
      newSizes[otherIdx] = otherVal;

      setPanelSizes(newSizes as [number, number, number]);

      // Panelleri programatik olarak yeniden boyutlandır
      if (leftRef.current) leftRef.current.resize(newSizes[0]);
      if (centerRef.current) centerRef.current.resize(newSizes[1]);
      if (rightRef.current) rightRef.current.resize(newSizes[2]);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <div className="relative w-full h-[calc(100vh-128px)] min-h-0 flex flex-col">
      {/* Sekme Header - Gizlenen panellerin sekmeleri de gizli */}
      <div className="flex items-center text-sm bg-white/15 backdrop-blur-sm border-b border-white/20 select-none">
        {/* Left Tab - Sadece görünürse göster */}
        {leftActive && (
          <div
            className="flex items-center justify-center px-3 py-3 bg-white/10 opacity-100 transition-opacity duration-200"
            style={{
              width: `${adjustedPanelSizes[0]}%`,
              minWidth: "100px",
            }}
          >
            <span className="text-white font-medium text-center flex items-center gap-1">
              Hiyerarşi
              {(lockedIndex === null || lockedIndex === 0) && (
                <svg
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLock(0);
                  }}
                  className="w-4 h-4 cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {lockedIndex === 0 ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 10V7a6 6 0 1112 0v3m-1 4h-10a2 2 0 002 2h6a2 2 0 002-2z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 11V7a7 7 0 0114 0v4m-1 5H6a2 2 0 002 2h8a2 2 0 002-2z"
                    />
                  )}
                </svg>
              )}
            </span>
          </div>
        )}

        {/* Resize handle between left and center tabs */}
        {leftActive && centerActive && (
          <div
            className={styles.tabResizeHandle}
            onMouseDown={(e) => handleTabResize(e, 0, 1)}
          />
        )}

        {/* Center Tab - Sadece görünürse göster */}
        {centerActive && (
          <div
            className="flex items-center justify-center px-3 py-3 bg-white/10 opacity-100 transition-opacity duration-200"
            style={{
              width: `${adjustedPanelSizes[1]}%`,
              minWidth: "100px",
            }}
          >
            <span className="text-white font-medium text-center flex items-center gap-1">
              Önizleme
              {(lockedIndex === null || lockedIndex === 1) && (
                <svg
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLock(1);
                  }}
                  className="w-4 h-4 cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {lockedIndex === 1 ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 10V7a6 6 0 1112 0v3m-1 4h-10a2 2 0 002 2h6a2 2 0 002-2z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 11V7a7 7 0 0114 0v4m-1 5H6a2 2 0 002 2h8a2 2 0 002-2z"
                    />
                  )}
                </svg>
              )}
            </span>
          </div>
        )}

        {/* Resize handle between center and right tabs */}
        {(centerActive && rightActive) ||
        (!centerActive && leftActive && rightActive) ? (
          <div
            className={styles.tabResizeHandle}
            onMouseDown={(e) =>
              handleTabResize(e, centerActive ? 1 : 0, centerActive ? 2 : 2)
            }
          />
        ) : null}

        {/* Right Tab - Sadece görünürse göster */}
        {rightActive && (
          <div
            className="flex items-center justify-center px-3 py-3 bg-white/10 opacity-100 transition-opacity duration-200"
            style={{
              width: `${adjustedPanelSizes[2]}%`,
              minWidth: "100px",
            }}
          >
            <span className="text-white font-medium text-center flex items-center gap-1">
              Editör
              {(lockedIndex === null || lockedIndex === 2) && (
                <svg
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLock(2);
                  }}
                  className="w-4 h-4 cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {lockedIndex === 2 ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 10V7a6 6 0 1112 0v3m-1 4h-10a2 2 0 002 2h6a2 2 0 002-2z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 11V7a7 7 0 0114 0v4m-1 5H6a2 2 0 002 2h8a2 2 0 002-2z"
                    />
                  )}
                </svg>
              )}
            </span>
          </div>
        )}
      </div>

      <PanelGroup
        direction="horizontal"
        className="w-full h-full min-h-0 border-t overflow-hidden bg-white/5 backdrop-blur-sm"
        onLayout={handlePanelResize}
      >
        {/* Sol Panel */}
        <Panel
          ref={leftRef}
          collapsible
          collapsedSize={0}
          defaultSize={adjustedPanelSizes[0]}
          minSize={leftActive ? 5 : 0}
          className="h-full overflow-hidden flex flex-col"
          onCollapse={() => setLeftCollapsed(true)}
          onExpand={() => setLeftCollapsed(false)}
        >
          {leftActive && (
            <div className="h-full overflow-auto border-r border-white/10 relative">
              {left}
            </div>
          )}
        </Panel>

        {/* Orta Panel */}
        <Panel
          ref={centerRef}
          collapsible
          collapsedSize={0}
          defaultSize={adjustedPanelSizes[1]}
          minSize={centerActive ? 5 : 0}
          className="h-full overflow-hidden flex flex-col"
          onCollapse={() => setCenterCollapsed(true)}
          onExpand={() => setCenterCollapsed(false)}
        >
          {centerActive && <div className="h-full overflow-auto">{center}</div>}
        </Panel>

        {/* Sağ Panel */}
        <Panel
          ref={rightRef}
          collapsible
          collapsedSize={0}
          defaultSize={adjustedPanelSizes[2]}
          minSize={rightActive ? 5 : 0}
          className="h-full overflow-hidden flex flex-col"
          onCollapse={() => setRightCollapsed(true)}
          onExpand={() => setRightCollapsed(false)}
        >
          {rightActive && (
            <div className="h-full overflow-auto border-l border-white/10 relative">
              {right}
            </div>
          )}
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default ManagementLayout;
