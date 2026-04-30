import { upsertProductAction } from "@/actions/product-actions";
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
const adminCategories = productCatalogTabs.filter((tab) => tab.category);
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

function getStatusMessage(status?: string | string[]) {
  if (status === "saved") return "상품 정보가 저장되었습니다.";
  if (status === "demo") return "Supabase 미연결 상태에서는 저장이 비활성화됩니다.";
  if (status === "invalid") return "필수 입력값을 확인해 주세요.";
  if (status === "error") return "저장 중 오류가 발생했습니다.";
  return null;
}

function productForm(product: Product) {
  return (
    <form
      key={product.id || `new-${product.category}`}
      action={upsertProductAction}
      className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
    >
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
                <option key={category.slug} value={category.category || "gold_bar"}>
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
            임시 공임
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
          <button className="w-full rounded-full bg-[var(--color-gold)] px-6 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[var(--color-gold-soft)]">
            상품 저장
          </button>
        </div>
      </div>
    </form>
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
  const sortedProducts = [...products].sort((a, b) => a.displayOrder - b.displayOrder);
  const missingCategories = adminCategories
    .map((category) => category.category as ProductCategory)
    .filter((category) => !products.some((product) => product.category === category));

  return (
    <div className="space-y-6">
      <section className="rounded-[2.2rem] border border-white/10 bg-white/5 p-8">
        <h2 className="font-display text-4xl">상품 카탈로그 관리</h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-white/72">
          결제 없는 상담형 상품/매입 관리 화면입니다. 순금 제품, 골드바, 고금 매입, 실버바, B2B 대량 상담의 사진, 가격 표시
          문구, 공개 상태와 정렬만 관리하고 실제 재고·수급·최종 금액은 본사 전화 문의와 거래 상담에서 확인합니다.
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

      <section className="space-y-5">{sortedProducts.map(productForm)}</section>

      {missingCategories.length ? (
        <section className="space-y-5">
          <h3 className="font-display text-2xl text-white">비어 있는 카테고리 추가</h3>
          {missingCategories.map((category) => productForm(blankProduct(category)))}
        </section>
      ) : null}
    </div>
  );
}
