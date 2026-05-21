"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  connectSiteAssetUsageAction,
  updateSiteAssetApprovalAction,
} from "@/actions/media-actions";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import type { ImageAllowedUsage, ImageSourceType } from "@/lib/image-asset-manifest";
import {
  getUploadStatusRedirect,
  uploadSiteAssetFromForm,
  type SiteAssetUploadPhase,
} from "@/lib/site-asset-upload-client";
import { formatUploadFileSize, siteImageUploadMaxBytes, siteImageUploadMaxLabel } from "@/lib/site-upload-policy";
import type { SiteAsset, SiteAssetUsage, SiteAssetUsageSlot } from "@/types/media";

export type MediaPreviewImage = {
  src: string;
  alt: string;
  label?: string;
};

export type MediaReplacementTarget = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  targetKind: string;
  slot?: SiteAssetUsageSlot;
  pagePath: string;
  sectionUsage: string;
  sourceType: ImageSourceType;
  allowedUsage: ImageAllowedUsage[];
  aspectRatio: string;
  skuMatch: string;
  mobileCropRule: string;
  currentImages: MediaPreviewImage[];
  ctaLabel: string;
  minActive?: number;
  productHref?: string;
};

type ProductImageSummary = {
  totalCount: number;
  missingCount: number;
  lockedCount: number;
  sampleNames: string[];
};

type SelectedUploadFile = {
  name: string;
  size: number;
  tooLarge: boolean;
};

function getUploadPhaseLabel(phase: SiteAssetUploadPhase) {
  if (phase === "preparing") return "업로드 준비 중...";
  if (phase === "hashing") return "파일 확인 중...";
  if (phase === "uploading") return "이미지 업로드 중...";
  if (phase === "saving") return "업로드 기록 저장 중...";
  return "바로 사용 가능 이미지로 업로드";
}

function getTargetQueryValue(targetId: string) {
  if (targetId === "home-banner") return "home";
  if (targetId === "product-image") return "product";
  if (targetId === "products-hero") return "products-hero";
  if (targetId === "service-image") return "service";
  if (targetId === "store-guide-image") return "store-guide";
  if (targetId === "company-image") return "company";
  if (targetId === "notice-thumbnail") return "notice";
  return targetId;
}

function getDefaultAltText(target: MediaReplacementTarget) {
  return `${target.shortLabel} 이미지`;
}

function getDefaultNotes(target: MediaReplacementTarget) {
  if (target.id === "home-banner") return "홈 배너 빠른 교체 업로드";
  if (target.id === "products-hero") return "상품/매입 상단 빠른 교체 업로드";
  return `${target.label} 빠른 교체 업로드`;
}

export function AdminMediaWorkspace({
  targets,
  assets,
  usages,
  message,
  initialTargetId,
  productSummary,
}: {
  targets: MediaReplacementTarget[];
  assets: SiteAsset[];
  usages: SiteAssetUsage[];
  message: string | null;
  initialTargetId: string;
  productSummary: ProductImageSummary;
}) {
  const router = useRouter();
  const [selectedTargetId, setSelectedTargetId] = useState(initialTargetId);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedUploadFile | null>(null);
  const [uploadPhase, setUploadPhase] = useState<SiteAssetUploadPhase>("idle");
  const selectedTarget = targets.find((target) => target.id === selectedTargetId) ?? targets[0];
  const approvedAssets = useMemo(() => assets.filter((asset) => asset.approvalStatus === "approved"), [assets]);
  const pendingAssets = useMemo(() => assets.filter((asset) => asset.approvalStatus !== "approved"), [assets]);
  const matchingApprovedAssets = approvedAssets.filter((asset) =>
    selectedTarget.allowedUsage.some((usage) => usage !== "candidate_preview" && asset.allowedUsage.includes(usage)),
  );
  const homeTarget = targets.find((target) => target.id === "home-banner");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handlePreviewChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
    setSelectedFile(file ? { name: file.name, size: file.size, tooLarge: file.size > siteImageUploadMaxBytes } : null);
  }

  async function handleUploadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("assetFile");
    const file = fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : null;
    if (!file || file.size <= 0 || file.size > siteImageUploadMaxBytes) {
      router.replace(getUploadStatusRedirect(form, "invalid-file"));
      return;
    }

    try {
      const result = await uploadSiteAssetFromForm(form, file, setUploadPhase);
      router.replace(result.redirectTo || getUploadStatusRedirect(form, "upload-error"));
    } catch (error) {
      console.error("[admin-media] image upload failed", error);
      setUploadPhase("error");
      router.replace(getUploadStatusRedirect(form, "upload-error"));
    }
  }

  function getTargetState(target: MediaReplacementTarget) {
    if (target.id === "product-image") {
      if (productSummary.missingCount > 0) return `이미지 준비중 ${productSummary.missingCount}건`;
      return "교체 가능";
    }
    const activeCount = target.slot
      ? usages.filter((usage) => usage.usageKey === target.slot && usage.isActive).length || target.currentImages.length
      : target.currentImages.length;
    if (!activeCount) return "이미지 없음";
    if (target.minActive && activeCount < target.minActive) return `최소 ${target.minActive}장 필요`;
    return "현재 사용 중";
  }

  const isUploading = uploadPhase === "preparing" || uploadPhase === "hashing" || uploadPhase === "uploading" || uploadPhase === "saving";
  const usesProductDirectManager = selectedTarget.id === "product-image";

  return (
    <div className="space-y-6">
      <section className="admin-panel p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="admin-compact-label">이미지 운영</p>
            <h2 className="mt-1 text-3xl font-extrabold text-[var(--admin-ink)]">이미지 교체 센터</h2>
            <p className="admin-help mt-3 max-w-3xl">
              바꿀 위치를 고르고 파일 하나만 올리면 그 위치에 바로 반영됩니다. 상품별 사진은 상품 관리에서 바로
              교체하고, 내부 자산 연결은 고급 영역에만 남겼습니다.
            </p>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <span className="rounded-xl border border-[var(--admin-line)] bg-[#fbf7e8] px-4 py-3 font-bold">
              사용 가능 {approvedAssets.length}개
            </span>
            <span className="rounded-xl border border-[var(--admin-line)] bg-[#fbf7e8] px-4 py-3 font-bold">
              보류/확인 {pendingAssets.length}개
            </span>
            <span className="rounded-xl border border-[var(--admin-line)] bg-[#fbf7e8] px-4 py-3 font-bold">
              상품 이미지 없음 {productSummary.missingCount}건
            </span>
          </div>
        </div>
        {message ? (
          <p className="admin-status-success mt-5 rounded-xl border px-4 py-3 text-sm font-bold" aria-live="polite">
            {message}
          </p>
        ) : null}
      </section>

      <section data-testid="admin-media-operator-cards" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {targets.map((target) => {
          const isSelected = target.id === selectedTarget.id;
          const preview = target.currentImages[0];
          return (
            <article
              key={target.id}
              className={[
                "admin-panel overflow-hidden transition",
                isSelected ? "ring-2 ring-[#d9ad00]" : "hover:border-[#d9ad00]/50",
              ].join(" ")}
            >
              <div
                className="h-36 border-b border-[var(--admin-line)] bg-[#f5f1df] bg-cover bg-center"
                style={preview ? { backgroundImage: `url("${preview.src}")` } : undefined}
                aria-label={preview?.alt ?? `${target.label} preview`}
              >
                {!preview ? (
                  <div className="flex h-full items-center justify-center text-sm font-extrabold text-[var(--admin-muted)]">
                    이미지 없음
                  </div>
                ) : null}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-[var(--admin-ink)]">{target.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">{target.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[0.7rem] font-bold text-emerald-800">
                    {getTargetState(target)}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {target.productHref ? (
                    <a
                      href={target.productHref}
                      className={isSelected ? "admin-primary-button px-4 py-2 text-sm" : "admin-secondary-button px-4 py-2 text-sm"}
                    >
                      {target.ctaLabel}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedTargetId(target.id)}
                      className={isSelected ? "admin-primary-button px-4 py-2 text-sm" : "admin-secondary-button px-4 py-2 text-sm"}
                    >
                      {target.ctaLabel}
                    </button>
                  )}
                  {target.productHref ? (
                    <a href={target.productHref} className="admin-secondary-button px-4 py-2 text-sm">
                      상품 관리로 이동
                    </a>
                  ) : (
                    <button type="button" onClick={() => setSelectedTargetId(target.id)} className="admin-secondary-button px-4 py-2 text-sm">
                      현재 이미지 보기
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        {usesProductDirectManager ? (
          <section className="admin-panel p-5 sm:p-6" data-testid="admin-media-product-direct-panel">
            <p className="admin-compact-label">상품별 사진</p>
            <h3 className="mt-1 text-2xl font-extrabold text-[var(--admin-ink)]">상품 관리에서 바로 교체</h3>
            <p className="admin-help mt-2">
              상품 이미지는 상품마다 달라야 해서 이 화면에서 자산을 먼저 올리지 않습니다. 상품 관리에서 해당 상품의
              `사진 교체`를 누르고 파일만 고르면 카드와 상세 이미지가 한 번에 바뀝니다.
            </p>
            <a href="/admin/products" className="admin-primary-button mt-5 inline-flex px-5 py-3">
              상품 관리로 이동
            </a>
          </section>
        ) : (
        <form
          onSubmit={handleUploadSubmit}
          data-testid="admin-media-upload-form"
          data-admin-save-guard="true"
          data-admin-pending-message="이미지 업로드 중입니다. 완료 메시지를 확인한 뒤 이동하세요."
          className="admin-panel p-5 sm:p-6"
        >
          <input type="hidden" name="returnTo" value={`/admin/media?target=${getTargetQueryValue(selectedTarget.id)}`} />
          <input type="hidden" name="targetKind" value={selectedTarget.targetKind} />
          {selectedTarget.slot && !usesProductDirectManager ? (
            <>
              <input type="hidden" name="connectToSlot" value="true" />
              <input type="hidden" name="usageKey" value={selectedTarget.slot} />
              <input type="hidden" name="sortOrder" value="0" />
            </>
          ) : null}
          <input type="hidden" name="imageSourceType" value={selectedTarget.sourceType} />
          <input type="hidden" name="approvalStatus" value="approved" />
          <input type="hidden" name="aspectRatio" value={selectedTarget.aspectRatio} />
          <input type="hidden" name="skuMatch" value={selectedTarget.skuMatch} />
          <input type="hidden" name="mobileCropRule" value={selectedTarget.mobileCropRule} />
          <input type="hidden" name="pageUsage" value={selectedTarget.pagePath} />
          <input type="hidden" name="sectionUsage" value={selectedTarget.sectionUsage} />
          {selectedTarget.allowedUsage.map((usage) => (
            <input key={usage} type="hidden" name="allowedUsage" value={usage} />
          ))}
          <input type="hidden" name="assetId" value={`${selectedTarget.shortLabel} 이미지`} />
          <input type="hidden" name="altText" value={getDefaultAltText(selectedTarget)} />
          <input type="hidden" name="notes" value={getDefaultNotes(selectedTarget)} />
          <p className="admin-compact-label">바로 교체</p>
          <h3 className="mt-1 text-2xl font-extrabold text-[var(--admin-ink)]">{selectedTarget.label} 교체</h3>
          <p className="admin-help mt-2">
            파일 검증을 통과하면 업로드와 반영이 한 번에 끝납니다. 원본 파일명은 공개 경로로 쓰지 않습니다.
          </p>
          <div className="mt-5 grid gap-4">
            <label className="block text-sm font-semibold text-[var(--admin-muted)]" htmlFor="admin-media-asset-file">
              이미지 파일
              <span className="mt-2 flex min-h-12 items-center justify-between gap-3 rounded-xl border border-[var(--admin-line)] bg-white px-4 py-3 text-sm text-[var(--admin-ink)]">
                <span>업로드할 이미지 선택</span>
                <span className="rounded-full bg-[var(--admin-soft)] px-3 py-1 text-xs font-extrabold text-[var(--admin-ink)]">
                  파일 고르기
                </span>
              </span>
              <span className="mt-1 block text-xs font-medium text-[var(--admin-muted)]">
                JPEG, PNG, WebP만 가능하며 최대 {siteImageUploadMaxLabel}까지 업로드됩니다.
              </span>
              <input
                id="admin-media-asset-file"
                name="assetFile"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                onChange={handlePreviewChange}
                className="sr-only"
              />
            </label>
            <p
              data-testid="admin-media-selected-file"
              className={[
                "rounded-xl border px-3 py-2 text-xs font-bold",
                selectedFile
                  ? selectedFile.tooLarge
                    ? "border-[#efc7bf] bg-[#fff0ed] text-[#8a2c20]"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-[var(--admin-line)] bg-[#fbfdfb] text-[var(--admin-muted)]",
              ].join(" ")}
              aria-live="polite"
            >
              {selectedFile
                ? selectedFile.tooLarge
                  ? `용량 초과: ${selectedFile.name} · ${formatUploadFileSize(selectedFile.size)} · ${siteImageUploadMaxLabel} 이하로 줄여 주세요.`
                  : `선택됨: ${selectedFile.name} · ${formatUploadFileSize(selectedFile.size)}`
                : "파일을 고르면 이름과 용량이 여기에 표시됩니다."}
            </p>
            {isUploading ? (
              <p
                data-testid="admin-media-upload-status"
                className="rounded-xl border border-[#d9ad00]/35 bg-[#fff8dc] px-3 py-2 text-xs font-bold text-[#725100]"
                aria-live="polite"
              >
                {getUploadPhaseLabel(uploadPhase)} 창을 닫지 마세요.
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <div
                className="min-h-40 rounded-2xl border border-[var(--admin-line)] bg-[#f5f1df] bg-cover bg-center"
                style={previewUrl ? { backgroundImage: `url("${previewUrl}")` } : undefined}
              >
                {!previewUrl ? (
                  <div className="flex h-40 items-center justify-center text-sm font-extrabold text-[var(--admin-muted)]">
                    데스크톱 미리보기
                  </div>
                ) : null}
              </div>
              <div
                className="min-h-40 rounded-2xl border border-[var(--admin-line)] bg-[#f5f1df] bg-cover bg-center"
                style={previewUrl ? { backgroundImage: `url("${previewUrl}")` } : undefined}
              >
                {!previewUrl ? (
                  <div className="flex h-40 items-center justify-center text-sm font-extrabold text-[var(--admin-muted)]">
                    모바일 crop 미리보기
                  </div>
                ) : null}
              </div>
            </div>
            <details data-testid="admin-media-advanced-details" className="rounded-xl border border-[var(--admin-line)] bg-[#fbfdfb] p-4">
              <summary className="cursor-pointer text-sm font-extrabold text-[var(--admin-ink)]">고급 정보 보기</summary>
              <dl className="mt-3 grid gap-2 text-xs leading-5 text-[var(--admin-muted)] sm:grid-cols-2">
                <div>
                  <dt className="font-bold text-[var(--admin-ink)]">자동 이미지 이름</dt>
                  <dd>{selectedTarget.shortLabel} 이미지</dd>
                </div>
                <div>
                  <dt className="font-bold text-[var(--admin-ink)]">자동 대체 텍스트</dt>
                  <dd>{getDefaultAltText(selectedTarget)}</dd>
                </div>
                <div>
                  <dt className="font-bold text-[var(--admin-ink)]">자동 반영 위치</dt>
                  <dd>{selectedTarget.slot ? selectedTarget.label : "자산 목록"}</dd>
                </div>
                <div>
                  <dt className="font-bold text-[var(--admin-ink)]">내부 분류 코드</dt>
                  <dd>{selectedTarget.sourceType}</dd>
                </div>
                <div>
                  <dt className="font-bold text-[var(--admin-ink)]">저장 상태</dt>
                  <dd>바로 사용 가능</dd>
                </div>
                <div>
                  <dt className="font-bold text-[var(--admin-ink)]">사용 가능 위치 코드</dt>
                  <dd>{selectedTarget.allowedUsage.join(", ")}</dd>
                </div>
                <div>
                  <dt className="font-bold text-[var(--admin-ink)]">모바일 crop 규칙</dt>
                  <dd>{selectedTarget.mobileCropRule}</dd>
                </div>
              </dl>
            </details>
          </div>
          <button
            type="submit"
            disabled={isUploading || Boolean(selectedFile?.tooLarge)}
            aria-busy={isUploading}
            className="admin-primary-button mt-5 w-full disabled:cursor-wait disabled:opacity-60"
          >
            <span aria-live="polite">{isUploading ? getUploadPhaseLabel(uploadPhase) : "이 이미지로 바로 반영"}</span>
          </button>
        </form>
        )}

        <section data-testid="admin-media-slot-manager" className="admin-panel p-5 sm:p-6">
          <p className="admin-compact-label">현재 사용 중</p>
          <h3 className="mt-1 text-2xl font-extrabold text-[var(--admin-ink)]">{selectedTarget.label}</h3>
          <p className="admin-help mt-2">
            방금 올린 이미지는 이 영역에 바로 반영됩니다. 기존 업로드 이미지에서 다시 골라 연결하는 기능은 아래 고급 연결로 남겨뒀습니다.
          </p>
          <div className="mt-4 grid gap-3">
            {selectedTarget.currentImages.length ? (
              selectedTarget.currentImages.map((image, index) => (
                <div key={`${image.src}-${index}`} className="grid gap-3 rounded-xl border border-[var(--admin-line)] bg-[#fbfdfb] p-3 sm:grid-cols-[108px_1fr]">
                  <div
                    className="h-20 rounded-lg bg-[#f5f1df] bg-cover bg-center"
                    style={{ backgroundImage: `url("${image.src}")` }}
                    aria-label={image.alt}
                  />
                  <div>
                    <p className="text-sm font-extrabold text-[var(--admin-ink)]">
                      {image.label ?? `${selectedTarget.shortLabel} ${index + 1}`}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--admin-muted)]">{image.alt}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-[var(--admin-line)] bg-[#fbfdfb] p-4 text-sm font-bold text-[var(--admin-muted)]">
                현재 이미지가 없습니다. 먼저 이미지를 업로드한 뒤 사용 위치에 연결하세요.
              </p>
            )}
          </div>
          {selectedTarget.slot ? (
            <details className="mt-5 rounded-xl border border-[var(--admin-line)] bg-[#fffdf7] p-4">
              <summary className="cursor-pointer text-sm font-extrabold text-[var(--admin-ink)]">
                고급 연결 열기
              </summary>
            <form
              action={connectSiteAssetUsageAction}
              data-admin-save-guard="true"
              data-admin-pending-message="이미지 사용 위치 저장 중입니다."
              className="mt-4"
            >
              <input type="hidden" name="usageKey" value={selectedTarget.slot} />
              <input type="hidden" name="pagePath" value={selectedTarget.pagePath} />
              <input type="hidden" name="sectionUsage" value={selectedTarget.sectionUsage} />
              <label className="block text-sm font-semibold text-[var(--admin-muted)]">
                사용 가능한 이미지 선택
                <select name="assetId" required className="admin-input mt-2" defaultValue="">
                  <option value="">선택</option>
                  {matchingApprovedAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.altText}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
                <label className="flex items-center gap-2 text-sm font-bold text-[var(--admin-ink)]">
                  <input name="isActive" type="checkbox" defaultChecked />
                  이 위치에 사용
                </label>
                <input name="sortOrder" type="number" defaultValue={100} className="admin-input" aria-label="정렬 순서" />
              </div>
              <AdminSubmitButton pendingLabel="저장 중..." className="admin-primary-button mt-4 w-full">
                {selectedTarget.id === "home-banner" ? "슬라이드에 추가" : "이 위치에 사용"}
              </AdminSubmitButton>
            </form>
            </details>
          ) : null}
          {selectedTarget.id === "product-image" ? (
            <div className="mt-5 rounded-xl border border-[#d9ad00]/35 bg-[#fff8dc] p-4 text-sm leading-6 text-[#725100]">
              상품별 직접 교체는 상품 관리 화면에서 처리합니다. 현재 상품 {productSummary.totalCount}건 중 이미지 준비중
              {productSummary.missingCount}건, 기본 골드바 이미지 {productSummary.lockedCount}건입니다.
              {productSummary.sampleNames.length ? (
                <p className="mt-2 font-bold">우선 확인: {productSummary.sampleNames.join(", ")}</p>
              ) : null}
            </div>
          ) : null}
        </section>
      </section>

      {homeTarget ? (
        <section data-testid="admin-media-home-banner-manager" className="admin-panel p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="admin-compact-label">홈 배너</p>
              <h3 className="mt-1 text-2xl font-extrabold text-[var(--admin-ink)]">현재 배너 슬라이드</h3>
              <p className="admin-help mt-2">최소 3장 유지가 기본입니다. 사용 가능 이미지 pool로 5-7장까지 확장할 수 있습니다.</p>
            </div>
            <span className="rounded-full border border-[#d9ad00]/35 bg-[#fff8dc] px-3 py-1 text-xs font-bold text-[#725100]">
              최소 3장 유지
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {homeTarget.currentImages.map((image, index) => (
              <article key={`${image.src}-${index}`} className="overflow-hidden rounded-xl border border-[var(--admin-line)] bg-white">
                <div className="h-32 bg-[#f5f1df] bg-cover bg-center" style={{ backgroundImage: `url("${image.src}")` }} />
                <div className="p-3">
                  <p className="text-sm font-extrabold text-[var(--admin-ink)]">슬라이드 {index + 1}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--admin-muted)]">{image.alt}</p>
                  <button type="button" onClick={() => setSelectedTargetId("home-banner")} className="admin-secondary-button mt-3 px-3 py-2 text-xs">
                    이미지 교체
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-2">
        <div data-testid="admin-media-approved-list" className="admin-panel p-5 sm:p-6">
          <p className="admin-compact-label">사용 가능</p>
          <h3 className="mt-1 text-xl font-extrabold text-[var(--admin-ink)]">바로 사용할 수 있는 이미지</h3>
          <div className="mt-4 divide-y divide-[var(--admin-line)]">
            {approvedAssets.length ? (
              approvedAssets.map((asset) => (
                <div key={asset.id} className="grid gap-3 py-3 sm:grid-cols-[88px_1fr]">
                  <div className="h-16 rounded-lg bg-[#f5f1df] bg-cover bg-center" style={{ backgroundImage: `url("${asset.publicUrl}")` }} />
                  <div>
                    <p className="font-bold text-[var(--admin-ink)]">{asset.altText}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--admin-muted)]">사용 가능 · 이 위치에 연결 가능</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-sm text-[var(--admin-muted)]">사용 가능한 업로드 이미지가 아직 없습니다.</p>
            )}
          </div>
        </div>
        <div data-testid="admin-media-review-list" className="admin-panel p-5 sm:p-6">
          <p className="admin-compact-label">보류/확인</p>
          <h3 className="mt-1 text-xl font-extrabold text-[var(--admin-ink)]">바로 쓰지 않는 이미지</h3>
          <div className="mt-4 divide-y divide-[var(--admin-line)]">
            {pendingAssets.length ? (
              pendingAssets.map((asset) => (
                <div key={asset.id} className="py-3">
                  <div className="grid gap-3 sm:grid-cols-[88px_1fr]">
                    <div className="h-16 rounded-lg bg-[#f5f1df] bg-cover bg-center" style={{ backgroundImage: `url("${asset.publicUrl}")` }} />
                    <div>
                      <p className="font-bold text-[var(--admin-ink)]">{asset.altText}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--admin-muted)]">보류 상태 · 미리보기만 가능</p>
                      <button type="button" disabled className="mt-2 rounded-full border border-[var(--admin-line)] bg-[#f5f1df] px-3 py-1.5 text-xs font-bold text-[var(--admin-muted)]">
                        상태 변경 후 연결 가능
                      </button>
                    </div>
                  </div>
                  <details className="mt-3 rounded-xl border border-[var(--admin-line)] bg-[#fbfdfb] p-3">
                    <summary className="cursor-pointer text-xs font-extrabold text-[var(--admin-ink)]">상태 변경</summary>
                    <form
                      action={updateSiteAssetApprovalAction}
                      data-admin-save-guard="true"
                      data-admin-pending-message="이미지 사용 상태 저장 중입니다."
                      className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]"
                    >
                      <input type="hidden" name="assetId" value={asset.id} />
                      <label className="text-xs font-bold text-[var(--admin-muted)]">
                        사용 상태
                        <select name="approvalStatus" defaultValue={asset.approvalStatus} className="admin-input mt-1">
                          <option value="needs_review">확인 필요</option>
                          <option value="candidate">미리보기만 가능</option>
                          <option value="approved">사용 가능</option>
                          <option value="quarantined">보류</option>
                          <option value="rejected">반려</option>
                        </select>
                      </label>
                      <div className="grid gap-2">
                        <AdminSubmitButton pendingLabel="저장 중..." className="admin-secondary-button px-3 py-2 text-xs">
                          상태 저장
                        </AdminSubmitButton>
                      </div>
                    </form>
                  </details>
                </div>
              ))
            ) : (
              <p className="py-4 text-sm text-[var(--admin-muted)]">보류되거나 반려된 이미지가 없습니다.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
