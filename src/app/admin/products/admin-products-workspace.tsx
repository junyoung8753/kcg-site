"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { upsertProductAction } from "@/actions/product-actions";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import {
  getProductCategoryLabel,
  getPublicProductImage,
  getProductPriceBasisLabel,
  getProductStatusLabel,
} from "@/lib/product-presenter";
import {
  getUploadStatusRedirect,
  uploadSiteAssetFromForm,
  type SiteAssetUploadPhase,
} from "@/lib/site-asset-upload-client";
import { formatUploadFileSize, siteImageUploadMaxBytes, siteImageUploadMaxLabel } from "@/lib/site-upload-policy";
import type { Product, ProductCategory, ProductPriceBasis, ProductStatus } from "@/types/product";

export interface AdminProductImageOption {
  id: string;
  value: string;
  label: string;
  note: string;
  locked: boolean;
  relatedSku: string[];
  source: "manifest" | "uploaded";
}

type ImageFilterKey = "all" | "needs-real-photo" | "replace-placeholder" | "external-or-unknown" | "missing";
type ImageProvenanceTone = "neutral" | "review" | "warning";

interface ImageProvenance {
  label: string;
  note: string;
  tone: ImageProvenanceTone;
  locked: boolean;
}

type SelectedUploadFile = {
  name: string;
  size: number;
  tooLarge: boolean;
};

const productStatuses: ProductStatus[] = ["active", "inquiry_required", "hidden"];
const productPriceBases: ProductPriceBasis[] = [
  "gold_24k_sell",
  "gold_24k_buy",
  "gold_18k_buy",
  "gold_14k_buy",
  "platinum_sell",
  "platinum_buy",
  "silver_sell",
  "silver_buy",
  "manual",
  "inquiry",
];
const productCategories: ProductCategory[] = [
  "gold_bar",
  "silver_bar",
  "pure_gold",
  "jewelry",
  "purchase_guide",
  "custom_order",
];
const imageFilterOptions: Array<{ key: ImageFilterKey; label: string; description: string }> = [
  { key: "all", label: "전체", description: "모든 상품" },
  { key: "needs-real-photo", label: "실사진 확인", description: "실사진 또는 품질 확인" },
  { key: "replace-placeholder", label: "교체 대상", description: "placeholder 또는 이미지 준비중" },
  { key: "external-or-unknown", label: "권한 검증", description: "외부/원본 경로 의심" },
  { key: "missing", label: "이미지 없음", description: "이미지 준비중 상품" },
];

function isRawKakaoTalkImagePath(imageUrl: string) {
  const fileName = imageUrl.replace(/\\/g, "/").split("/").pop() ?? "";
  return /^KakaoTalk_\d{8}_\d+(?:_\d{2})?\.(?:jpe?g|png|webp)$/i.test(fileName);
}

function getImageProvenance(product: Product, imageOptions: AdminProductImageOption[]): ImageProvenance {
  const publicImage = getPublicProductImage(product);
  const imageUrl = publicImage.src?.trim();

  if (!imageUrl) {
    return { label: "이미지 없음", note: "이미지 준비중 placeholder 유지", tone: "warning", locked: false };
  }

  if (/^https?:\/\//i.test(imageUrl) && !imageOptions.some((option) => option.value === imageUrl)) {
    return { label: "외부 URL", note: "관리자 업로드 자산만 허용", tone: "warning", locked: false };
  }

  if (isRawKakaoTalkImagePath(imageUrl)) {
    return { label: "원본 KakaoTalk", note: "운영 연결 금지", tone: "warning", locked: false };
  }

  const option = imageOptions.find((item) => item.value === imageUrl);
  if (option?.source === "uploaded" || product.imageAssetId) {
    return { label: "업로드 이미지", note: "고객 상품 카드/상세에 반영됨", tone: "neutral", locked: false };
  }
  if (option?.locked || publicImage.role === "verified_product") {
    return { label: "실물 기준", note: "공개 상품 화면과 동일한 KCG 기본 이미지", tone: "neutral", locked: false };
  }
  if (option) {
    return { label: publicImage.label, note: "공개 상품 화면과 동일한 기본 이미지", tone: "neutral", locked: false };
  }

  if (imageUrl.startsWith("/assets/generated/candidates/")) {
    return { label: "후보 이미지", note: "운영 연결 금지", tone: "warning", locked: false };
  }

  if (publicImage.role === "representative_lineup" || publicImage.role === "representative_category") {
    return { label: publicImage.label, note: "공개 상품 화면과 동일한 상담 이미지", tone: "review", locked: false };
  }

  return { label: "검증 필요", note: "KCG 기본 또는 업로드 자산으로 교체 필요", tone: "review", locked: false };
}

function getProductCurrentImageSrc(product: Product) {
  return getPublicProductImage(product).src ?? "";
}

function getImageFilterForProduct(product: Product, imageOptions: AdminProductImageOption[]): ImageFilterKey {
  const provenance = getImageProvenance(product, imageOptions);
  if (provenance.label === "이미지 없음") return "missing";
  if (provenance.label === "후보 이미지") return "replace-placeholder";
  if (provenance.label === "외부 URL" || provenance.label === "원본 KakaoTalk" || provenance.label === "검증 필요") {
    return "external-or-unknown";
  }
  const publicImage = getPublicProductImage(product);
  if (publicImage.role === "representative_lineup" || publicImage.role === "representative_category") return "needs-real-photo";
  return "all";
}

function getImageProvenanceToneClass(tone: ImageProvenanceTone) {
  if (tone === "warning") return "border-[#efc7bf] bg-[#fff0ed] text-[#8a2c20]";
  if (tone === "review") return "border-[#d9ad00]/35 bg-[#fff8dc] text-[#725100]";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function getFilterHref(key: ImageFilterKey) {
  return key === "all" ? "/admin/products" : `/admin/products?image=${key}`;
}

function getProductKey(product: Product) {
  return product.id || product.slug;
}

function matchesProductKey(product: Product, key: string) {
  return product.id === key || product.slug === key || getProductKey(product) === key;
}

const productEditorPanelId = "admin-product-editor-panel";

function formatCount(value: number) {
  return value.toLocaleString("ko-KR");
}

function getSelectedUploadFile(event: ChangeEvent<HTMLInputElement>): SelectedUploadFile | null {
  const file = event.currentTarget.files?.[0];
  return file ? { name: file.name, size: file.size, tooLarge: file.size > siteImageUploadMaxBytes } : null;
}

function getUploadPhaseLabel(phase: SiteAssetUploadPhase) {
  if (phase === "preparing") return "업로드 준비 중...";
  if (phase === "hashing") return "파일 확인 중...";
  if (phase === "uploading") return "이미지 업로드 중...";
  if (phase === "saving") return "대표 사진 저장 중...";
  if (phase === "done") return "교체 완료";
  return "이 사진으로 바로 교체";
}

function ProductEditor({
  product,
  imageOptions,
  preferredUploadedAssetId,
}: {
  product: Product;
  imageOptions: AdminProductImageOption[];
  preferredUploadedAssetId: string;
}) {
  const router = useRouter();
  const provenance = getImageProvenance(product, imageOptions);
  const currentImageStillAllowed = product.imageUrl && imageOptions.some((option) => option.value === product.imageUrl);
  const currentImageSrc = getProductCurrentImageSrc(product);
  const productReturnPath = `/admin/products?product=${encodeURIComponent(product.slug)}`;
  const manifestImageOptions = imageOptions.filter((option) => option.source === "manifest");
  const uploadedImageOptions = imageOptions.filter((option) => option.source === "uploaded");
  const [selectedUploadFile, setSelectedUploadFile] = useState<SelectedUploadFile | null>(null);
  const preferredUploadedImageOption = preferredUploadedAssetId
    ? uploadedImageOptions.find(
        (option) =>
          option.id === preferredUploadedAssetId &&
          (option.relatedSku.length === 0 || option.relatedSku.includes(product.slug) || option.relatedSku.includes(product.id)),
      )
    : null;
  const imageAssetDefaultValue = product.imageAssetId ?? preferredUploadedImageOption?.id ?? "";
  const [uploadPhase, setUploadPhase] = useState<SiteAssetUploadPhase>("idle");
  const isUploading = uploadPhase === "preparing" || uploadPhase === "hashing" || uploadPhase === "uploading" || uploadPhase === "saving";

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
      console.error("[admin-products] product image upload failed", error);
      setUploadPhase("error");
      router.replace(getUploadStatusRedirect(form, "upload-error"));
    }
  }

  return (
    <div id={productEditorPanelId} data-testid="admin-product-editor" className="scroll-mt-5 space-y-4 lg:sticky lg:top-5">
      <section data-testid="admin-product-image-workflow" className="admin-panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="admin-compact-label">선택 상품</p>
            <h3 className="mt-1 text-2xl font-extrabold text-[var(--admin-ink)]">{product.name}</h3>
            <p className="admin-help mt-2">
              파일 하나를 고르고 버튼을 누르면 업로드와 대표 사진 저장까지 한 번에 처리합니다. 이 사진은 상품 카드와
              상세 페이지에 쓰입니다.
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getImageProvenanceToneClass(provenance.tone)}`}>
            {provenance.label}
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[132px_1fr] sm:items-center">
          <div
            className="h-32 rounded-xl border border-[var(--admin-line)] bg-[#f5f1df] bg-cover bg-center shadow-sm"
            style={currentImageSrc ? { backgroundImage: `url("${currentImageSrc}")` } : undefined}
            aria-label={`${product.name} 현재 이미지`}
          >
            {!currentImageSrc ? (
              <div className="flex h-full items-center justify-center text-center text-xs font-extrabold text-[var(--admin-muted)]">
                이미지 준비중
              </div>
            ) : null}
          </div>
          <div className="text-sm leading-6 text-[var(--admin-muted)]">
            <p className="font-extrabold text-[var(--admin-ink)]">현재 상품 카드/상세 이미지: {provenance.label}</p>
            <p>{provenance.note}</p>
            <p className="mt-2 rounded-xl border border-[var(--admin-line)] bg-[#fbf7e8] px-3 py-2 text-xs font-bold text-[var(--admin-ink)]">
              교체 완료 메시지가 뜨면 고객 화면의 이 상품 사진도 새 이미지로 바뀝니다.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleUploadSubmit}
          data-testid="admin-product-image-upload-form"
          data-admin-save-guard="true"
          data-admin-pending-message="상품 이미지 업로드 중입니다. 완료 메시지를 확인한 뒤 이동하세요."
          className="mt-5 rounded-xl border border-[var(--admin-line)] bg-white p-4"
        >
          <input type="hidden" name="returnTo" value={productReturnPath} />
          <input type="hidden" name="targetKind" value="product_image" />
          <input type="hidden" name="applyToProduct" value="true" />
          <input type="hidden" name="productKey" value={getProductKey(product)} />
          <input type="hidden" name="relatedSku" value={product.slug} />
          <input type="hidden" name="assetId" value={`${product.slug}-image`} />
          <input type="hidden" name="altText" value={`${product.name} 이미지`} />
          <input type="hidden" name="notes" value={`${product.name} 상품 사진 바로 교체`} />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="admin-compact-label">상품 사진 바로 교체</p>
              <h4 className="mt-1 text-lg font-extrabold text-[var(--admin-ink)]">파일 선택 후 한 번에 반영</h4>
              <p className="admin-help mt-2">
                필요한 내부 정보는 자동으로 채웁니다. 같은 상품의 기존 사진은 이 파일로 바로 바뀝니다.
              </p>
            </div>
            <span className="rounded-full border border-[var(--admin-line)] bg-[#fbf7e8] px-3 py-1 text-xs font-bold text-[var(--admin-ink)]">
              JPEG · PNG · WebP · {siteImageUploadMaxLabel}
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            <label className="text-sm font-semibold text-[var(--admin-muted)]" htmlFor={`admin-product-asset-file-${product.slug}`}>
              이미지 파일
              <span className="mt-2 flex min-h-12 items-center justify-between gap-3 rounded-xl border border-[var(--admin-line)] bg-[#fbf7e8] px-4 py-3 text-sm text-[var(--admin-ink)]">
                <span>{product.name} 사진 선택</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[var(--admin-ink)]">
                  파일 고르기
                </span>
              </span>
              <span className="mt-1 block text-xs font-medium text-[var(--admin-muted)]">
                JPEG, PNG, WebP만 가능하며 최대 {siteImageUploadMaxLabel}까지 업로드됩니다.
              </span>
              <input
                id={`admin-product-asset-file-${product.slug}`}
                name="assetFile"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                onChange={(event) => setSelectedUploadFile(getSelectedUploadFile(event))}
                className="sr-only"
              />
            </label>
            <p
              data-testid="admin-product-selected-file"
              className={[
                "rounded-xl border px-3 py-2 text-xs font-bold",
                selectedUploadFile
                  ? selectedUploadFile.tooLarge
                    ? "border-[#efc7bf] bg-[#fff0ed] text-[#8a2c20]"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-[var(--admin-line)] bg-[#fbfdfb] text-[var(--admin-muted)]",
              ].join(" ")}
              aria-live="polite"
            >
              {selectedUploadFile
                ? selectedUploadFile.tooLarge
                  ? `용량 초과: ${selectedUploadFile.name} · ${formatUploadFileSize(selectedUploadFile.size)} · ${siteImageUploadMaxLabel} 이하로 줄여 주세요.`
                  : `선택됨: ${selectedUploadFile.name} · ${formatUploadFileSize(selectedUploadFile.size)}`
                : "파일을 고르면 이름과 용량이 여기에 표시됩니다."}
            </p>
            {isUploading ? (
              <p
                data-testid="admin-product-upload-status"
                className="rounded-xl border border-[#d9ad00]/35 bg-[#fff8dc] px-3 py-2 text-xs font-bold text-[#725100]"
                aria-live="polite"
              >
                {getUploadPhaseLabel(uploadPhase)} 창을 닫지 마세요.
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={isUploading || Boolean(selectedUploadFile?.tooLarge)}
            aria-busy={isUploading}
            className="admin-primary-button mt-4 w-full disabled:cursor-wait disabled:opacity-60"
          >
            <span aria-live="polite">{getUploadPhaseLabel(uploadPhase)}</span>
          </button>
        </form>

        <details data-testid="admin-product-advanced-editor" className="mt-4 rounded-xl border border-[var(--admin-line)] bg-[#fbf7e8] p-4">
          <summary className="cursor-pointer text-sm font-extrabold text-[var(--admin-ink)]">
            고급 설정 열기
          </summary>
          <p className="admin-help mt-2">
            일반적인 상품 사진 교체는 위의 파일 선택 버튼만 쓰면 됩니다. 이미 올려둔 이미지를 다시 연결하거나 상품 정보까지
            함께 고칠 때만 이 영역을 엽니다.
          </p>
          <form
            action={upsertProductAction}
            data-testid="admin-product-editor-form"
            data-admin-save-guard="true"
            data-admin-pending-message="상품 저장 중입니다. 저장 완료 메시지를 확인한 뒤 이동하세요."
            className="mt-4"
          >
          <input type="hidden" name="returnTo" value={productReturnPath} />
          <input type="hidden" name="id" value={product.id} />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="admin-compact-label">2. 상품 사진 선택</p>
              <h4 className="mt-1 text-lg font-extrabold text-[var(--admin-ink)]">고객 화면에 쓸 이미지를 고르고 저장</h4>
              <p className="admin-help mt-2">
                업로드 이미지를 선택하면 기본 이미지보다 우선 적용됩니다. 이미지를 비우려면 placeholder 전환만 체크하세요.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <label className="text-sm font-semibold text-[var(--admin-muted)]">
              업로드 이미지 선택
              <select name="imageAssetId" defaultValue={imageAssetDefaultValue} className="admin-input mt-2">
                <option value="">업로드 자산 사용 안 함</option>
                {uploadedImageOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              {preferredUploadedImageOption ? (
                <span className="mt-2 block rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                  방금 올린 이미지가 선택되어 있습니다. 고객 화면 반영은 아래 상품 사진 저장을 눌러 완료합니다.
                </span>
              ) : null}
              <span className="mt-1 block text-xs font-medium text-[var(--admin-muted)]">
                방금 올린 상품 사진은 여기에 나타납니다. 목록에 없다면 업로드 결과 메시지를 확인하세요.
              </span>
            </label>
            <label className="text-sm font-semibold text-[var(--admin-muted)]">
              기본 이미지 선택
              <select name="imageUrl" defaultValue={currentImageStillAllowed ? product.imageUrl ?? "" : ""} className="admin-input mt-2">
                <option value="">기본 이미지 사용 안 함</option>
                {manifestImageOptions.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs font-medium text-[var(--admin-muted)]">
                업로드 이미지가 없을 때만 기본 KCG 자산을 씁니다.
              </span>
            </label>
            <label className="inline-flex items-center gap-3 rounded-xl border border-[var(--admin-line)] bg-white px-4 py-3 text-sm font-bold text-[var(--admin-ink)]">
              <input name="clearImageToPlaceholder" type="checkbox" />
              이미지를 빼고 `이미지 준비중`으로 표시
            </label>
            <details className="rounded-xl border border-[var(--admin-line)] bg-white p-3">
              <summary className="cursor-pointer text-xs font-extrabold text-[var(--admin-ink)]">고급 안전 정보 보기</summary>
              <p className="mt-2 text-xs leading-5 text-[var(--admin-muted)]">
                raw URL 저장은 서버에서 차단합니다. KCG 기본 자산 또는 관리자 업로드 자산만 상품 이미지로 연결할 수 있습니다.
              </p>
            </details>
          </div>

          <details className="mt-4 rounded-xl border border-[var(--admin-line)] bg-white p-4">
            <summary className="cursor-pointer text-sm font-extrabold text-[var(--admin-ink)]">
              3. 상품명·가격·노출 정보도 같이 수정하기
            </summary>
            <p className="admin-help mt-2">
              이미지 교체만 하는 날에는 이 영역을 열지 않아도 됩니다. 기존 값은 그대로 저장됩니다.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-[var(--admin-muted)]">
                상품명
                <input name="name" defaultValue={product.name} required className="admin-input mt-2" />
              </label>
              <label className="block text-sm font-semibold text-[var(--admin-muted)]">
                슬러그
                <input name="slug" defaultValue={product.slug} className="admin-input mt-2" />
              </label>
              <label className="block text-sm font-semibold text-[var(--admin-muted)]">
                한 줄 설명
                <input name="shortDescription" defaultValue={product.shortDescription} required className="admin-input mt-2" />
              </label>
              <label className="block text-sm font-semibold text-[var(--admin-muted)]">
                서브카테고리
                <input name="subcategory" defaultValue={product.subcategory || ""} className="admin-input mt-2" />
              </label>
            </div>

            <label className="mt-4 block text-sm font-semibold text-[var(--admin-muted)]">
              상세 설명
              <textarea name="description" defaultValue={product.description} rows={4} required className="admin-input mt-2" />
            </label>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-[var(--admin-muted)]">
                카테고리
                <select name="category" defaultValue={product.category} className="admin-input mt-2">
                  {productCategories.map((category) => (
                    <option key={category} value={category}>
                      {getProductCategoryLabel(category)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-[var(--admin-muted)]">
                상태
                <select name="status" defaultValue={product.status} className="admin-input mt-2">
                  {productStatuses.map((status) => (
                    <option key={status} value={status}>
                      {getProductStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-[var(--admin-muted)]">
                정렬
                <input name="displayOrder" type="number" defaultValue={product.displayOrder} className="admin-input mt-2" />
              </label>
              <label className="block text-sm font-semibold text-[var(--admin-muted)]">
                연동 시세
                <select name="priceBasis" defaultValue={product.priceBasis} className="admin-input mt-2">
                  {productPriceBases.map((basis) => (
                    <option key={basis} value={basis}>
                      {getProductPriceBasisLabel(basis)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-[var(--admin-muted)]">
                중량(g)
                <input name="weightGrams" type="number" step="0.01" defaultValue={product.weightGrams ?? ""} className="admin-input mt-2" />
              </label>
              <label className="block text-sm font-semibold text-[var(--admin-muted)]">
                상담 기준 공임
                <input name="makingFee" type="number" defaultValue={product.makingFee ?? ""} className="admin-input mt-2" />
              </label>
              <label className="block text-sm font-semibold text-[var(--admin-muted)]">
                수동 가격
                <input name="manualPrice" type="number" defaultValue={product.manualPrice ?? ""} className="admin-input mt-2" />
              </label>
              <label className="block text-sm font-semibold text-[var(--admin-muted)]">
                가격 표시 문구
                <input name="priceLabel" defaultValue={product.priceLabel} required className="admin-input mt-2" />
              </label>
            </div>

            <label className="mt-4 block text-sm font-semibold text-[var(--admin-muted)]">
              확인 항목
              <textarea name="specs" defaultValue={product.specs.join("\n")} rows={3} className="admin-input mt-2" />
            </label>
            <label className="mt-4 block text-sm font-semibold text-[var(--admin-muted)]">
              가격 안내
              <textarea name="priceNote" defaultValue={product.priceNote || ""} rows={3} className="admin-input mt-2" />
            </label>
            <label className="mt-4 block text-sm font-semibold text-[var(--admin-muted)]">
              공개 안내
              <textarea name="publicNote" defaultValue={product.publicNote || ""} rows={3} className="admin-input mt-2" />
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-xl border border-[var(--admin-line)] bg-white px-4 py-3 text-sm font-bold text-[var(--admin-ink)]">
                <input name="isFeatured" type="checkbox" defaultChecked={product.isFeatured} />
                주요 상품
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-[#d9ad00]/35 bg-[#fff8dc] px-4 py-3 text-sm font-bold text-[#725100]">
                <input name="priceVisible" type="checkbox" defaultChecked={product.priceVisible} />
                가격 노출
              </label>
            </div>
          </details>

            <AdminSubmitButton pendingLabel="고급 설정 저장 중..." className="admin-primary-button mt-5 w-full">
              고급 설정 저장
            </AdminSubmitButton>
          </form>
        </details>
      </section>
    </div>
  );
}

export function AdminProductsWorkspace({
  products,
  missingProducts,
  imageOptions,
  activeImageFilter,
  activeProductKey,
  preferredUploadedAssetId,
  message,
}: {
  products: Product[];
  missingProducts: Product[];
  imageOptions: AdminProductImageOption[];
  activeImageFilter: ImageFilterKey;
  activeProductKey: string;
  preferredUploadedAssetId: string;
  message: string | null;
}) {
  const allProducts = useMemo(() => [...products, ...missingProducts], [products, missingProducts]);
  const filteredProducts = useMemo(
    () =>
      activeImageFilter === "all"
        ? allProducts
        : allProducts.filter((product) => getImageFilterForProduct(product, imageOptions) === activeImageFilter),
    [activeImageFilter, allProducts, imageOptions],
  );
  const initialSelectedKey = useMemo(() => {
    const activeProduct = activeProductKey
      ? filteredProducts.find((product) => matchesProductKey(product, activeProductKey)) ??
        allProducts.find((product) => matchesProductKey(product, activeProductKey))
      : null;
    const fallbackProduct = activeProduct ?? filteredProducts[0] ?? allProducts[0];
    return fallbackProduct ? getProductKey(fallbackProduct) : "";
  }, [activeProductKey, allProducts, filteredProducts]);
  const [selectedKey, setSelectedKey] = useState(initialSelectedKey);
  function selectProductForImageEdit(key: string) {
    setSelectedKey(key);
    window.requestAnimationFrame(() => {
      document.getElementById(productEditorPanelId)?.scrollIntoView({ behavior: "auto", block: "start" });
    });
  }

  const selectedProduct =
    filteredProducts.find((product) => matchesProductKey(product, selectedKey)) ??
    allProducts.find((product) => matchesProductKey(product, selectedKey)) ??
    filteredProducts[0] ??
    allProducts[0];
  const counts = imageFilterOptions.reduce<Record<ImageFilterKey, number>>(
    (acc, option) => {
      acc[option.key] =
        option.key === "all"
          ? allProducts.length
          : allProducts.filter((product) => getImageFilterForProduct(product, imageOptions) === option.key).length;
      return acc;
    },
    { all: 0, "needs-real-photo": 0, "replace-placeholder": 0, "external-or-unknown": 0, missing: 0 },
  );
  const visibleProducts = products.filter((product) => product.status !== "hidden").length;

  return (
    <div className="space-y-6">
      <section className="admin-panel p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="admin-compact-label">상품 운영</p>
            <h2 className="mt-1 text-3xl font-extrabold text-[var(--admin-ink)]">상품 관리</h2>
            <p className="admin-help mt-3 max-w-3xl">
              이 목록은 고객 화면의 상품/매입 목록과 같은 기준입니다. 사진 교체를 누른 뒤 파일 하나를 고르면 그 상품
              카드와 상세 사진으로 바로 교체됩니다. 숨긴 예전 원본 상품과 내부 설정은 기본 작업에서 제외합니다.
            </p>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <span className="rounded-xl border border-[var(--admin-line)] bg-[#fbf7e8] px-4 py-3 font-bold">
              공개 상품 {formatCount(visibleProducts)}건
            </span>
            <span className="rounded-xl border border-[var(--admin-line)] bg-[#fbf7e8] px-4 py-3 font-bold">
              이미지 없음 {formatCount(counts.missing)}건
            </span>
            <span className="rounded-xl border border-[var(--admin-line)] bg-[#fbf7e8] px-4 py-3 font-bold">
              이미지 선택지 {formatCount(imageOptions.length)}개
            </span>
          </div>
        </div>
        {message ? (
          <p className="admin-status-success mt-5 rounded-xl border px-4 py-3 text-sm font-bold" aria-live="polite">
            {message}
          </p>
        ) : null}
      </section>

      <section data-testid="admin-product-image-filter" className="admin-panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="admin-compact-label">이미지 확인 필터</p>
            <h3 className="mt-1 text-xl font-extrabold text-[var(--admin-ink)]">교체·권한·placeholder 상태 좁혀보기</h3>
          </div>
          <p className="rounded-full border border-[var(--admin-line)] bg-[#fbf7e8] px-3 py-1 text-xs font-bold text-[var(--admin-ink)]">
            이미지 필터: {imageFilterOptions.find((option) => option.key === activeImageFilter)?.label ?? "전체"}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {imageFilterOptions.map((option) => {
            const isActive = option.key === activeImageFilter;
            return (
              <a
                key={option.key}
                href={getFilterHref(option.key)}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition",
                  isActive
                    ? "border-[#d9ad00] bg-[#fff3bd] text-[var(--admin-ink)]"
                    : "border-[var(--admin-line)] bg-white text-[var(--admin-muted)] hover:border-[#d9ad00]",
                ].join(" ")}
              >
                <span>{option.label}</span>
                <span>{counts[option.key]}</span>
                <span className="sr-only">{option.description}</span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)]">
        <div data-testid="admin-product-table" className="admin-panel overflow-hidden">
          <div className="border-b border-[var(--admin-line)] bg-[#fbf7e8] px-4 py-3 text-sm font-semibold text-[var(--admin-muted)]">
            공개 `/products`와 같은 1·2·3·5·10돈 골드바, 고금 주얼리 매입, 대량 골드바 상담만 관리합니다.
          </div>
          <div className="divide-y divide-[var(--admin-line)] md:hidden">
            {filteredProducts.map((product) => {
              const provenance = getImageProvenance(product, imageOptions);
              const currentImageSrc = getProductCurrentImageSrc(product);
              const key = getProductKey(product);
              return (
                <button
                  key={key}
                  type="button"
                  data-testid={product.slug ? `admin-product-mobile-row-${product.slug}` : undefined}
                  onClick={() => selectProductForImageEdit(key)}
                  className="block w-full px-4 py-4 text-left transition hover:bg-[#fff9df]"
                >
                  <div className="grid grid-cols-[56px_1fr] gap-2">
                    <div
                      className="h-[4.5rem] rounded-xl border border-[var(--admin-line)] bg-[#f5f1df] bg-cover bg-center"
                      style={currentImageSrc ? { backgroundImage: `url("${currentImageSrc}")` } : undefined}
                    >
                      {!currentImageSrc ? (
                        <div className="flex h-full items-center justify-center text-center text-[0.65rem] font-extrabold text-[var(--admin-muted)]">
                          이미지 준비중
                        </div>
                      ) : null}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--admin-muted)]">
                        {getProductStatusLabel(product.status)} · {getProductCategoryLabel(product.category)} ·{" "}
                        {getProductPriceBasisLabel(product.priceBasis)}
                      </p>
                      <h4 className="mt-2 text-sm font-extrabold text-[var(--admin-ink)]">{product.name}</h4>
                      <div data-testid={product.slug ? `admin-product-mobile-image-note-${product.slug}` : undefined} className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[0.68rem] font-bold ${getImageProvenanceToneClass(provenance.tone)}`}>
                          {provenance.label}
                        </span>
                        <span className="text-[0.68rem] leading-5 text-[var(--admin-muted)]">{provenance.note}</span>
                      </div>
                      <span className="mt-2 inline-flex rounded-full border border-[var(--admin-line)] bg-white px-3 py-1 text-[0.68rem] font-bold text-[var(--admin-ink)]">
                        사진 교체
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div data-testid="admin-product-desktop-grid" className="hidden grid-cols-[60px_70px_82px_minmax(120px,1fr)_88px_46px_104px_92px] text-xs md:grid">
            {["이미지", "공개상태", "카테고리", "상품명", "가격 기준", "중량", "이미지 상태", "교체"].map((heading) => (
              <div key={heading} className="border-b border-[var(--admin-line)] bg-[#fbfdfb] px-2 py-3 font-bold text-[var(--admin-muted)]">
                {heading}
              </div>
            ))}
            {filteredProducts.map((product) => {
              const provenance = getImageProvenance(product, imageOptions);
              const currentImageSrc = getProductCurrentImageSrc(product);
              const key = getProductKey(product);
              return (
                <div key={key} data-testid={product.slug ? `admin-product-row-${product.slug}` : undefined} className="contents">
                  <div className="border-b border-[var(--admin-line)] px-2 py-3">
                    <div
                      className="h-12 rounded-lg border border-[var(--admin-line)] bg-[#f5f1df] bg-cover bg-center"
                      style={currentImageSrc ? { backgroundImage: `url("${currentImageSrc}")` } : undefined}
                    >
                      {!currentImageSrc ? (
                        <div className="flex h-full items-center justify-center text-center text-[0.62rem] font-extrabold text-[var(--admin-muted)]">
                          준비중
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="border-b border-[var(--admin-line)] px-2 py-3">{getProductStatusLabel(product.status)}</div>
                  <div className="border-b border-[var(--admin-line)] px-2 py-3">{getProductCategoryLabel(product.category)}</div>
                  <div className="break-keep border-b border-[var(--admin-line)] px-2 py-3 font-extrabold text-[var(--admin-ink)]">{product.name}</div>
                  <div className="border-b border-[var(--admin-line)] px-2 py-3">{getProductPriceBasisLabel(product.priceBasis)}</div>
                  <div className="border-b border-[var(--admin-line)] px-2 py-3">{product.weightGrams ? `${product.weightGrams}g` : "-"}</div>
                  <div className="border-b border-[var(--admin-line)] px-2 py-3">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-[0.68rem] font-bold ${getImageProvenanceToneClass(provenance.tone)}`}>
                      {provenance.label}
                    </span>
                    <p className="mt-1 text-[0.68rem] leading-4 text-[var(--admin-muted)]">{provenance.note}</p>
                  </div>
                  <div className="border-b border-[var(--admin-line)] px-2 py-3">
                    <button
                      type="button"
                      data-testid="admin-product-image-replace-button"
                      onClick={() => selectProductForImageEdit(key)}
                      className="admin-secondary-button whitespace-normal px-2 py-1.5 text-[0.68rem] leading-4"
                    >
                      사진 교체
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {selectedProduct ? (
          <ProductEditor
            key={getProductKey(selectedProduct)}
            product={selectedProduct}
            imageOptions={imageOptions}
            preferredUploadedAssetId={preferredUploadedAssetId}
          />
        ) : null}
      </section>
    </div>
  );
}
