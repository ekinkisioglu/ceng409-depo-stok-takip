import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";

type Hareket = {
  id: string;
  movement_type: string;
  quantity: number;
  status: string;
  created_at: string;
  products: { code: string; name: string } | null;
  source_location_id: { code: string; warehouses: { code: string } | null } | null;
  target_location_id: { code: string; warehouses: { code: string } | null } | null;
  users: { full_name: string } | null;
};

const TUR_ETIKETI: Record<string, string> = {
  GIRIS: "Giriş",
  CIKIS: "Çıkış",
  TRANSFER: "Transfer",
  SAYIM: "Sayım",
};

export default async function GecmisPage(props: PageProps<"/gecmis">) {
  const { urun, depo } = await props.searchParams;
  const supabase = await createClient();

  let sorgu = supabase
    .from("stock_movements")
    .select(
      "id, movement_type, quantity, status, created_at, products(code, name), source_location_id(code, warehouses(code)), target_location_id(code, warehouses(code)), users(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (typeof urun === "string" && urun.trim()) {
    const { data: urunler } = await supabase
      .from("products")
      .select("id")
      .ilike("code", `%${urun.trim()}%`);
    sorgu = sorgu.in("product_id", (urunler ?? []).map((u) => u.id));
  }

  const { data, error } = await sorgu;
  const hareketler = (data ?? []) as unknown as Hareket[];

  const depoFiltresi = typeof depo === "string" ? depo.trim().toUpperCase() : "";
  const filtrelenmis = depoFiltresi
    ? hareketler.filter(
        (h) =>
          h.source_location_id?.warehouses?.code === depoFiltresi ||
          h.target_location_id?.warehouses?.code === depoFiltresi,
      )
    : hareketler;

  return (
    <AppShell title="Stok Sorgula / Geçmiş" backHref="/ana-sayfa">
      <form className="flex gap-2">
        <input
          type="text"
          name="urun"
          placeholder="Ürün kodu filtrele"
          defaultValue={typeof urun === "string" ? urun : ""}
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="depo"
          placeholder="Depo kodu filtrele"
          defaultValue={typeof depo === "string" ? depo : ""}
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Filtrele
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">Hata: {error.message}</p> : null}

      {filtrelenmis.length === 0 ? (
        <p className="text-sm text-zinc-500">Kayıt bulunamadı.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtrelenmis.map((h) => (
            <li
              key={h.id}
              className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm"
            >
              <div className="flex justify-between">
                <span className="font-medium">
                  {TUR_ETIKETI[h.movement_type] ?? h.movement_type} —{" "}
                  {h.quantity}
                </span>
                <span className="text-zinc-400">
                  {new Date(h.created_at).toLocaleString("tr-TR")}
                </span>
              </div>
              <div className="text-zinc-600">
                {h.products?.code} {h.products?.name}
                {h.source_location_id
                  ? ` · ${h.source_location_id.warehouses?.code}/${h.source_location_id.code}`
                  : ""}
                {h.target_location_id
                  ? ` → ${h.target_location_id.warehouses?.code}/${h.target_location_id.code}`
                  : ""}
              </div>
              <div className="text-zinc-400">
                {h.users?.full_name ?? "?"} · durum: {h.status}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
