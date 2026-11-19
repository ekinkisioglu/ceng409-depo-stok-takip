import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DuzeltmeSatiri } from "@/components/duzeltme-satiri";
import { createClient } from "@/lib/supabase/server";

type StokSatiri = {
  quantity: number;
  products: { code: string; name: string; critical_level: number } | null;
  locations: { code: string; warehouses: { code: string } | null } | null;
};

type DuzeltmeTalebi = {
  id: string;
  system_quantity: number;
  counted_quantity: number;
  products: { code: string; name: string } | null;
  locations: { code: string; warehouses: { code: string } | null } | null;
};

export default async function YonetimPage() {
  const supabase = await createClient();

  const [{ data: stoklar }, { data: duzeltmeler }, { count: bekleyenTransferSayisi }] =
    await Promise.all([
      supabase
        .from("stock_levels")
        .select("quantity, products(code, name, critical_level), locations(code, warehouses(code))"),
      supabase
        .from("correction_requests")
        .select(
          "id, system_quantity, counted_quantity, products(code, name), locations(code, warehouses(code))",
        )
        .eq("status", "beklemede")
        .order("created_at", { ascending: true }),
      supabase
        .from("stock_movements")
        .select("id", { count: "exact", head: true })
        .eq("movement_type", "TRANSFER")
        .eq("status", "beklemede"),
    ]);

  const kritikStoklar = ((stoklar ?? []) as unknown as StokSatiri[]).filter(
    (s) => s.products && s.quantity < s.products.critical_level,
  );
  const bekleyenDuzeltmeler = (duzeltmeler ?? []) as unknown as DuzeltmeTalebi[];

  return (
    <AppShell title="Yönetim Paneli" backHref="/ana-sayfa">
      <div className="flex flex-col gap-2">
        <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm">
          ⚠ Kritik Stok Uyarıları — {kritikStoklar.length}
        </div>
        <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm">
          ⏳ Bekleyen Düzeltme Talepleri — {bekleyenDuzeltmeler.length}
        </div>
        <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm">
          ⏳ Bekleyen Transferler — {bekleyenTransferSayisi ?? 0}
        </div>
        <Link
          href="/urun-ekle"
          className="rounded-md border border-zinc-300 bg-zinc-100 px-4 py-3 text-center text-sm font-medium text-zinc-900"
        >
          + Yeni Ürün Ekle
        </Link>
      </div>

      {kritikStoklar.length > 0 ? (
        <>
          <h2 className="text-sm font-semibold text-zinc-700">Kritik Stok</h2>
          <ul className="flex flex-col gap-2">
            {kritikStoklar.map((s, i) => (
              <li
                key={i}
                className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {s.products?.code} {s.products?.name} —{" "}
                {s.locations?.warehouses?.code}/{s.locations?.code}: {s.quantity}{" "}
                (kritik seviye: {s.products?.critical_level})
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {bekleyenDuzeltmeler.length > 0 ? (
        <>
          <h2 className="text-sm font-semibold text-zinc-700">
            Bekleyen Düzeltme Talepleri
          </h2>
          <ul className="flex flex-col gap-2">
            {bekleyenDuzeltmeler.map((d) => (
              <DuzeltmeSatiri
                key={d.id}
                requestId={d.id}
                urunEtiketi={`${d.products?.code ?? "?"} ${d.products?.name ?? ""}`}
                konumEtiketi={`${d.locations?.warehouses?.code ?? "?"}/${d.locations?.code ?? "?"}`}
                sistemMiktari={d.system_quantity}
                sayimMiktari={d.counted_quantity}
              />
            ))}
          </ul>
        </>
      ) : null}
    </AppShell>
  );
}
