import { getRepository } from "@/lib/data";
import { serviceCategories } from "@/lib/site-config";

export default async function AdminProductsPage() {
  const repository = getRepository();
  const products = await repository.getProducts({ includeHidden: true });

  return (
    <div className="space-y-6">
      <section className="rounded-[2.2rem] border border-white/10 bg-white/5 p-8">
        <h2 className="font-display text-4xl">상품 등록 확장 구조</h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-white/72">
          이번 단계에서는 실제 상품 CRUD까지 구현하지 않지만, `products`
          테이블과 타입, 상태값, 카테고리 구조는 이미 준비되어 있습니다. 이후
          이미지 업로드, 가격 노출, 카테고리 상세 페이지를 같은 축으로 확장하면 됩니다.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {serviceCategories.map((category) => {
          const matched = products.filter((product) => product.category === category.key);
          return (
            <div
              key={category.key}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
            >
              <h3 className="font-display text-2xl text-white">{category.title}</h3>
              <p className="mt-3 text-sm leading-8 text-white/68">{category.description}</p>
              <p className="mt-5 text-sm text-white/54">현재 연결된 레코드 {matched.length}건</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
