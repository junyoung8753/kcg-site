import { AdminProductsWorkspace, type AdminProductImageOption } from "@/app/admin/products/admin-products-workspace";
import { getRepository } from "@/lib/data";
import {
  getApprovedProductImageAssets,
  isLockedGoldbarSkuImagePath,
} from "@/lib/image-asset-manifest";
import {
  getPublicCatalogProducts,
} from "@/lib/product-presenter";
import { siteImageUploadMaxLabel } from "@/lib/site-upload-policy";
import type { Product } from "@/types/product";

interface AdminProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getStatusMessage(status?: string | string[]) {
  if (status === "saved") return "저장됨 · 상품 정보가 공개 데이터에 반영되었습니다.";
  if (status === "image-saved") return "교체 완료 · 선택한 파일이 이 상품 대표 사진으로 바로 반영되었습니다.";
  if (status === "uploaded") return "업로드됨 · 상품을 찾지 못해 자동 연결은 못 했습니다. 고급 영역에서 업로드 이미지를 직접 선택해 저장하세요.";
  if (status === "demo") return "Supabase 미연결 상태에서는 저장이 비활성화됩니다.";
  if (status === "invalid-file") return `이미지 파일을 확인해 주세요. JPG, PNG, WebP만 가능하고 ${siteImageUploadMaxLabel} 이하만 업로드됩니다.`;
  if (status === "invalid-meta") return "이미지 이름과 대체 텍스트를 확인해 주세요.";
  if (status === "storage-setup-error") return "Storage bucket 준비 중 오류가 발생했습니다. site-assets bucket과 환경변수 설정을 확인해야 합니다.";
  if (status === "upload-error") return "Storage 업로드 중 오류가 발생했습니다. 파일 크기/형식 또는 Supabase Storage 로그를 확인해야 합니다.";
  if (status === "media-schema-error") return "이미지 DB 테이블이 아직 준비되지 않았습니다. site_assets 스키마 적용 상태를 확인해야 합니다.";
  if (status === "metadata-error") return "이미지는 올라갔지만 DB 기록 저장 중 오류가 발생했습니다. site_assets/media_change_history 상태를 확인해야 합니다.";
  if (status === "product-image-error") return "이미지는 올라갔지만 상품 대표 사진 연결 중 오류가 발생했습니다. 고급 영역에서 방금 올린 이미지를 직접 선택해 저장할 수 있습니다.";
  if (status === "invalid") return "필수 입력값을 확인해 주세요.";
  if (status === "invalid-image") return "이미지는 KCG 기본 자산 또는 관리자 업로드 자산만 연결할 수 있습니다.";
  if (status === "error") return "저장 중 오류가 발생했습니다.";
  return null;
}

function getActiveProductKey(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getUploadedAssetId(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getActiveImageFilter(value?: string | string[]) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (
    candidate === "needs-real-photo" ||
    candidate === "replace-placeholder" ||
    candidate === "external-or-unknown" ||
    candidate === "missing"
  ) {
    return candidate;
  }
  return "all";
}

function getRepoImageOptions(): AdminProductImageOption[] {
  return getApprovedProductImageAssets().map((asset) => ({
    id: asset.asset_id,
    value: asset.file_path,
    label: asset.alt_text || asset.asset_id,
    note: asset.notes,
    locked: isLockedGoldbarSkuImagePath(asset.file_path),
    relatedSku: asset.related_sku,
    source: "manifest" as const,
  }));
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const repository = getRepository();
  const [products, uploadedAssets, params] = await Promise.all([
    repository.getProducts({ includeHidden: true }),
    repository.getSiteAssets(),
    searchParams,
  ]);
  const sourceProductsBySlug = new Map<string, Product>();
  for (const product of products) {
    const current = sourceProductsBySlug.get(product.slug);
    if (!current || (current.status === "hidden" && product.status !== "hidden")) {
      sourceProductsBySlug.set(product.slug, product);
    }
  }
  const publicProducts = getPublicCatalogProducts(products).map((product) => {
    const sourceProduct = sourceProductsBySlug.get(product.slug);
    return sourceProduct ? { ...product, id: sourceProduct.id } : { ...product, id: "" };
  });
  const sortedProducts = publicProducts.sort((a, b) => a.displayOrder - b.displayOrder);
  const approvedUploadedAssets = uploadedAssets.filter(
    (asset) =>
      asset.approvalStatus === "approved" &&
      asset.allowedUsage.some((usage) => usage === "product_card" || usage === "product_detail" || usage === "category_card"),
  );
  const imageOptions = [
    ...getRepoImageOptions(),
    ...approvedUploadedAssets.map((asset) => ({
      id: asset.id,
      value: asset.publicUrl,
      label: asset.altText,
      note: asset.notes ?? "관리자 업로드 이미지",
      locked: false,
      relatedSku: asset.relatedSku,
      source: "uploaded" as const,
    })),
  ];
  const uploadedAssetId = getUploadedAssetId(params.uploadedAssetId);
  const preferredUploadedAssetId = approvedUploadedAssets.some((asset) => asset.id === uploadedAssetId) ? uploadedAssetId : "";
  const activeImageFilter = getActiveImageFilter(params.image);
  const activeProductKey = getActiveProductKey(params.product);

  return (
    <AdminProductsWorkspace
      key={`${activeImageFilter}:${activeProductKey}:${preferredUploadedAssetId}`}
      products={sortedProducts}
      missingProducts={[]}
      imageOptions={imageOptions}
      activeImageFilter={activeImageFilter}
      activeProductKey={activeProductKey}
      preferredUploadedAssetId={preferredUploadedAssetId}
      message={getStatusMessage(params.status)}
    />
  );
}
