import { upsertProductAction } from "@/actions/product-actions";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { getRepository } from "@/lib/data";
import {
  getProductCategoryLabel,
  getProductPriceBasisLabel,
  getProductStatusLabel,
  productCatalogTabs,
} from "@/lib/product-presenter";
import type { Product, ProductCategory, ProductPriceBasis, ProductStatus } from "@/types/product";

interface AdminProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const productStatuses: ProductStatus[] = ["active", "inquiry_required", "hidden"];
const adminCategories = [
  ...productCatalogTabs.flatMap((tab) =>
    tab.category ? [{ slug: tab.slug, label: tab.label, category: tab.category }] : [],
  ),
  { slug: "purchase-guide", label: getProductCategoryLabel("purchase_guide"), category: "purchase_guide" },
] as const satisfies ReadonlyArray<{
  slug: string;
  label: string;
  category: ProductCategory;
}>;
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

const representativeProductImagePaths = new Set([
  "/campaign/kcg-generated-goldbar-banner-20260508.webp",
  "/products/kcg-generated-goldbar-lineup-20260508.webp",
  "/products/kcg-generated-goldbar-detail-20260508.webp",
  "/products/kcg-product-minimal-bars-20260506.webp",
  "/products/kcg-product-gold-silver-catalog-20260503.webp",
  "/products/kcg-silver-gift-20260427-v2.jpg",
  "/products/kcg-product-pure-gold-gifts-20260506.webp",
  "/products/kcg-product-jewelry-buying-20260503.webp",
  "/products/kcg-jewelry-buying-tray-20260430.webp",
  "/products/kcg-b2b-gift-packaging-20260430.webp",
  "/products/kcg-product-b2b-consulting-20260503.webp",
  "/products/kcg-product-corporate-consulting-20260506.webp",
  "/campaign/kcg-home-price-desk-20260506.webp",
  "/campaign/kcg-home-product-keyvisual-20260503.webp",
  "/campaign/kcg-hero-metal-bars.jpg",
  "/campaign/kcg-old-gold-process-20260506.webp",
]);

const legacyPlaceholderImagePaths = new Set([
  "/products/kcg-gold-bar-catalog-20260427-v2.jpg",
  "/products/kcg-old-gold-jewelry-20260427-v2.jpg",
  "/products/kcg-b2b-bulk-consulting-20260427-v2.jpg",
  "/products/kcg-pure-gold-products-20260427-v2.jpg",
  "/products/kcg-buying-process-20260427-v2.jpg",
]);

type ImageProvenanceTone = "neutral" | "review" | "warning";
type ImageFilterKey = "all" | "needs-real-photo" | "replace-placeholder" | "external-or-unknown" | "missing";

interface ImageProvenance {
  label: string;
  note: string;
  tone: ImageProvenanceTone;
}

interface ImageFilterOption {
  key: ImageFilterKey;
  label: string;
  description: string;
}

const imageFilterOptions: readonly ImageFilterOption[] = [
  {
    key: "all",
    label: "전체",
    description: "모든 상품",
  },
  {
    key: "needs-real-photo",
    label: "실사진 확인",
    description: "대표/생성 또는 로컬 이미지",
  },
  {
    key: "replace-placeholder",
    label: "교체 대상",
    description: "기존 placeholder 이미지",
  },
  {
    key: "external-or-unknown",
    label: "권한 검증",
    description: "외부 URL 또는 미분류 경로",
  },
  {
    key: "missing",
    label: "이미지 없음",
    description: "공개 fallback 확인",
  },
];

function isRawKakaoTalkImagePath(imageUrl: string) {
  const fileName = imageUrl.replace(/\\/g, "/").split("/").pop() ?? "";
  return /^KakaoTalk_\d{8}_\d+(?:_\d{2})?\.(?:jpe?g|png|webp)$/i.test(fileName);
}

function getImageProvenance(product: Product): ImageProvenance {
  const imageUrl = product.imageUrl?.trim();

  if (!imageUrl) {
    return {
      label: "이미지 없음",
      note: "공개 fallback 확인",
      tone: "warning",
    };
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return {
      label: "외부 URL",
      note: "출처·권한 확인",
      tone: "warning",
    };
  }

  if (isRawKakaoTalkImagePath(imageUrl)) {
    return {
      label: "원본 KakaoTalk",
      note: "출처·권한 확인",
      tone: "warning",
    };
  }

  if (legacyPlaceholderImagePaths.has(imageUrl)) {
    return {
      label: "기존 placeholder",
      note: "교체 대상",
      tone: "warning",
    };
  }

  if (representativeProductImagePaths.has(imageUrl)) {
    return {
      label: "대표/생성",
      note: "실사진 확인 필요",
      tone: "review",
    };
  }

  if (imageUrl.startsWith("/products/") || imageUrl.startsWith("/company/")) {
    return {
      label: "로컬 이미지",
      note: "실사진 여부 확인",
      tone: "neutral",
    };
  }

  return {
    label: "검증 필요",
    note: "경로·권한 확인",
    tone: "warning",
  };
}

function getImageProvenanceToneClass(tone: ImageProvenanceTone) {
  if (tone === "warning") return "border-amber-200/35 bg-amber-200/10 text-amber-100";
  if (tone === "review") return "border-[var(--color-gold-soft)]/45 bg-[var(--color-gold)]/12 text-[var(--color-gold-soft)]";
  return "border-white/14 bg-white/7 text-white/76";
}

function getImageFilterForProduct(product: Product): ImageFilterKey {
  const provenance = getImageProvenance(product);

  if (provenance.label === "이미지 없음") return "missing";
  if (provenance.label === "기존 placeholder") return "replace-placeholder";
  if (
    provenance.label === "외부 URL" ||
    provenance.label === "원본 KakaoTalk" ||
    provenance.label === "검증 필요"
  ) {
    return "external-or-unknown";
  }
  if (provenance.note.includes("실사진")) return "needs-real-photo";
  return "all";
}

function getActiveImageFilter(value?: string | string[]): ImageFilterKey {
  const candidate = Array.isArray(value) ? value[0] : value;
  return imageFilterOptions.some((option) => option.key === candidate) ? (candidate as ImageFilterKey) : "all";
}

function getImageFilterLabel(key: ImageFilterKey) {
  return imageFilterOptions.find((option) => option.key === key)?.label ?? "전체";
}

function getImageFilterHref(key: ImageFilterKey) {
  return key === "all" ? "/admin/products" : `/admin/products?image=${key}`;
}

function getStatusMessage(status?: string | string[]) {
  if (status === "saved") return "상품 정보가 저장되었습니다.";
  if (status === "demo") return "Supabase 미연결 상태에서는 저장이 비활성화됩니다.";
  if (status === "invalid") return "필수 입력값을 확인해 주세요.";
  if (status === "error") return "저장 중 오류가 발생했습니다.";
  return null;
}

function productForm(product: Product) {
  return (
    <details
      key={product.id || `new-${product.category}`}
      className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 open:bg-white/[0.06]"
    >
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 text-sm text-white/72">
        <span>
          <span className="font-semibold text-white">{product.name}</span>
          <span className="ml-3 text-white/45">{getProductCategoryLabel(product.category)}</span>
        </span>
        <span className="rounded-full border border-white/12 px-3 py-1 text-xs font-semibold text-white/68">
          편집 열기
        </span>
      </summary>
      <form action={upsertProductAction} className="mt-5 border-t border-white/10 pt-5">
        <input type="hidden" name="id" value={product.id} />
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <div className="space-y-4">
          <label className="block text-sm text-white/74">
            상품명
            <input
              name="name"
              defaultValue={product.name}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="block text-sm text-white/74">
            슬러그
            <input
              name="slug"
              defaultValue={product.slug}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="block text-sm text-white/74">
            한 줄 설명
            <input
              name="shortDescription"
              defaultValue={product.shortDescription}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="block text-sm text-white/74">
            서브카테고리
            <input
              name="subcategory"
              defaultValue={product.subcategory || ""}
              placeholder="예: 1돈 골드바, 18K 매입"
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="block text-sm text-white/74">
            상세 설명
            <textarea
              name="description"
              defaultValue={product.description}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="block text-sm text-white/74">
            이미지 URL
            <input
              name="imageUrl"
              defaultValue={product.imageUrl || ""}
              placeholder="/products/gold-bar.webp"
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="block text-sm text-white/74">
            확인 항목
            <textarea
              name="specs"
              defaultValue={product.specs.join("\n")}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
        </div>
        <div className="space-y-4">
          <label className="block text-sm text-white/74">
            카테고리
            <select
              name="category"
              defaultValue={product.category}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            >
              {adminCategories.map((category) => (
                <option key={category.slug} value={category.category}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-white/74">
            상태
            <select
              name="status"
              defaultValue={product.status}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            >
              {productStatuses.map((status) => (
                <option key={status} value={status}>
                  {getProductStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-white/74">
            정렬
            <input
              name="displayOrder"
              type="number"
              defaultValue={product.displayOrder}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="block text-sm text-white/74">
            연동 시세
            <select
              name="priceBasis"
              defaultValue={product.priceBasis}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            >
              {productPriceBases.map((basis) => (
                <option key={basis} value={basis}>
                  {getProductPriceBasisLabel(basis)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-white/74">
            중량(g)
            <input
              name="weightGrams"
              type="number"
              step="0.01"
              defaultValue={product.weightGrams ?? ""}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="block text-sm text-white/74">
            상담 기준 공임
            <input
              name="makingFee"
              type="number"
              defaultValue={product.makingFee ?? ""}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="block text-sm text-white/74">
            수동 가격
            <input
              name="manualPrice"
              type="number"
              defaultValue={product.manualPrice ?? ""}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="block text-sm text-white/74">
            가격 표시 문구
            <input
              name="priceLabel"
              defaultValue={product.priceLabel}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="block text-sm text-white/74">
            가격 안내
            <textarea
              name="priceNote"
              defaultValue={product.priceNote || ""}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="block text-sm text-white/74">
            공개 안내
            <textarea
              name="publicNote"
              defaultValue={product.publicNote || ""}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/18 px-4 py-3 text-white outline-none focus:border-[var(--color-gold-soft)]"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/74">
            <input name="isFeatured" type="checkbox" defaultChecked={product.isFeatured} />
            주요 상품
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/74">
            <input name="priceVisible" type="checkbox" defaultChecked={product.priceVisible} />
            확정 가격처럼 노출
          </label>
          <AdminSubmitButton
            pendingLabel="상품 저장 중..."
            className="w-full rounded-full bg-[var(--color-gold)] px-6 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[var(--color-gold-soft)]"
          >
            상품 저장
          </AdminSubmitButton>
        </div>
        </div>
      </form>
    </details>
  );
}

function ProductImageFilterPanel({
  products,
  activeImageFilter,
}: {
  products: Product[];
  activeImageFilter: ImageFilterKey;
}) {
  const counts = imageFilterOptions.reduce<Record<ImageFilterKey, number>>(
    (acc, option) => {
      acc[option.key] =
        option.key === "all"
          ? products.length
          : products.filter((product) => getImageFilterForProduct(product) === option.key).length;
      return acc;
    },
    {
      all: 0,
      "needs-real-photo": 0,
      "replace-placeholder": 0,
      "external-or-unknown": 0,
      missing: 0,
    },
  );

  return (
    <section
      data-testid="admin-product-image-filter"
      className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">이미지 확인 필터</h3>
          <p className="mt-2 max-w-2xl text-xs leading-6 text-white/58">
            실제 KCG 상품 사진은 별도 승인 전까지 확정하지 않고, 교체·권한·fallback 확인이 필요한 상품만 먼저 좁혀 봅니다.
          </p>
        </div>
        <p className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-xs font-semibold text-white/62">
          이미지 필터: {getImageFilterLabel(activeImageFilter)}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {imageFilterOptions.map((option) => {
          const isActive = option.key === activeImageFilter;

          return (
            <a
              key={option.key}
              href={getImageFilterHref(option.key)}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                isActive
                  ? "border-[var(--color-gold-soft)] bg-[var(--color-gold)] text-[#171717]"
                  : "border-white/10 bg-white/[0.04] text-white/64 hover:border-white/22 hover:text-white"
              }`}
            >
              <span>{option.label}</span>
              <span className={isActive ? "text-[#171717]/70" : "text-white/38"}>{counts[option.key]}</span>
              <span className="sr-only">{option.description}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function ProductManagementTable({
  products,
  activeImageFilter,
}: {
  products: Product[];
  activeImageFilter: ImageFilterKey;
}) {
  return (
    <section
      data-testid="admin-product-table"
      className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.035] px-4 py-3 text-xs leading-5 text-white/58">
        <span>
          실사진은 파일명만으로 확정하지 않습니다. `대표/생성`은 현재 고객 화면을 채우는 승인된 대표 이미지이며,
          실제 KCG 상품 사진이 도착하면 교체 대상으로 다시 확인합니다.
        </span>
        <span className="rounded-full border border-white/10 px-2.5 py-1 font-semibold text-white/58">
          목록 필터: {getImageFilterLabel(activeImageFilter)}
        </span>
      </div>
      <div className="divide-y divide-white/8 md:hidden">
        {products.length === 0 ? (
          <div className="px-4 py-6 text-sm text-white/58">해당 이미지 확인 조건에 맞는 상품이 없습니다.</div>
        ) : null}
        {products.map((product) => {
          const provenance = getImageProvenance(product);

          return (
            <article
              key={product.id || product.slug}
              data-testid={product.slug ? `admin-product-mobile-row-${product.slug}` : undefined}
              className="px-4 py-4"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/58">
                <span>{getProductStatusLabel(product.status)}</span>
                <span aria-hidden="true">·</span>
                <span>{getProductCategoryLabel(product.category)}</span>
                <span aria-hidden="true">·</span>
                <span>{getProductPriceBasisLabel(product.priceBasis)}</span>
                <span aria-hidden="true">·</span>
                <span>{product.weightGrams ? `${product.weightGrams}g` : "무게 -"}</span>
              </div>
              <h4 className="mt-2 text-sm font-semibold text-white">{product.name}</h4>
              <div
                data-testid={product.slug ? `admin-product-mobile-image-note-${product.slug}` : undefined}
                className="mt-2 flex flex-wrap items-center gap-2"
              >
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[0.68rem] font-semibold ${getImageProvenanceToneClass(
                    provenance.tone,
                  )}`}
                >
                  {provenance.label}
                </span>
                <span className="text-[0.68rem] leading-5 text-[var(--admin-muted)]">{provenance.note}</span>
              </div>
            </article>
          );
        })}
      </div>
      <div
        data-testid="admin-product-desktop-grid"
        className="hidden grid-cols-[86px_120px_minmax(220px,1fr)_150px_90px_180px_76px] gap-0 overflow-x-auto text-sm md:grid"
      >
        {["공개상태", "카테고리", "상품명", "가격 기준", "중량", "이미지 성격", "정렬"].map((heading) => (
          <div key={heading} className="border-b border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-semibold text-white/48">
            {heading}
          </div>
        ))}
        {products.length === 0 ? (
          <div className="col-span-7 border-b border-white/8 px-4 py-6 text-sm text-white/58">
            해당 이미지 확인 조건에 맞는 상품이 없습니다.
          </div>
        ) : null}
        {products.map((product) => {
          const provenance = getImageProvenance(product);

          return (
            <div
              key={product.id || product.slug}
              data-testid={product.slug ? `admin-product-row-${product.slug}` : undefined}
              className="contents"
            >
              <div className="border-b border-white/8 px-4 py-3 text-white/68">{getProductStatusLabel(product.status)}</div>
              <div className="border-b border-white/8 px-4 py-3 text-white/68">{getProductCategoryLabel(product.category)}</div>
              <div className="border-b border-white/8 px-4 py-3 font-semibold text-white">
                {product.name}
              </div>
              <div className="border-b border-white/8 px-4 py-3 text-white/68">{getProductPriceBasisLabel(product.priceBasis)}</div>
              <div className="border-b border-white/8 px-4 py-3 text-white/68">
                {product.weightGrams ? `${product.weightGrams}g` : "-"}
              </div>
              <div className="border-b border-white/8 px-4 py-3">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-[0.72rem] font-semibold ${getImageProvenanceToneClass(
                    provenance.tone,
                  )}`}
                >
                  {provenance.label}
                </span>
                <p className="mt-1 text-[0.7rem] leading-5 text-white/45">{provenance.note}</p>
              </div>
              <div className="border-b border-white/8 px-4 py-3 text-white/68">{product.displayOrder}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function blankProduct(category: ProductCategory): Product {
  const label = getProductCategoryLabel(category);
  return {
    id: "",
    category,
    subcategory: null,
    name: `${label} 상담`,
    slug: `${category.replace(/_/g, "-")}-consulting`,
    shortDescription: `${label} 문의 및 상담 안내`,
    description: "중량, 수량, 재고와 고시 시세를 확인한 뒤 상담 기준을 안내합니다.",
    imageUrl: null,
    specs: ["중량 확인", "수량 확인", "상담 가능 시간"],
    status: "inquiry_required",
    displayOrder: 100,
    isFeatured: false,
    priceVisible: false,
    priceBasis: "inquiry",
    weightGrams: null,
    makingFee: null,
    manualPrice: null,
    priceLabel: "전화 문의",
    priceNote: "상담 후 안내",
    publicNote: "최종 안내는 본사 전화 상담 후 진행합니다.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const repository = getRepository();
  const [products, params] = await Promise.all([repository.getProducts({ includeHidden: true }), searchParams]);
  const message = getStatusMessage(params.status);
  const activeImageFilter = getActiveImageFilter(params.image);
  const sortedProducts = [...products].sort((a, b) => a.displayOrder - b.displayOrder);
  const filteredProducts =
    activeImageFilter === "all"
      ? sortedProducts
      : sortedProducts.filter((product) => getImageFilterForProduct(product) === activeImageFilter);
  const missingCategories = adminCategories
    .map((category) => category.category as ProductCategory)
    .filter((category) => !products.some((product) => product.category === category));

  return (
    <div className="space-y-6">
      <section className="rounded-[2.2rem] border border-white/10 bg-white/5 p-8">
        <h2 className="font-display text-3xl">상품 관리</h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-white/72">
          목록에서 상태와 가격 기준을 먼저 확인하고, 수정할 상품만 펼쳐서 편집합니다.
        </p>
        {message ? (
          <p className="mt-5 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/78">
            {message}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {adminCategories.map((category) => {
          const count = products.filter((product) => product.category === category.category).length;
          return (
            <div key={category.slug} className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">{category.label}</p>
              <p className="mt-2 text-sm text-white/58">연결 상품 {count}건</p>
            </div>
          );
        })}
      </section>

      <ProductImageFilterPanel products={sortedProducts} activeImageFilter={activeImageFilter} />

      <ProductManagementTable products={filteredProducts} activeImageFilter={activeImageFilter} />

      <section className="space-y-5">{sortedProducts.map(productForm)}</section>

      {missingCategories.length ? (
        <section className="space-y-5">
          <h3 className="font-display text-xl text-white">비어 있는 카테고리 추가</h3>
          {missingCategories.map((category) => productForm(blankProduct(category)))}
        </section>
      ) : null}
    </div>
  );
}
