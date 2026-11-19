import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function UrunDetayPage(props: PageProps<"/urun/[kod]">) {
  const { kod } = await props.params;
  const supabase = await createClient();

  const { data: urun, error: urunHata } = await supabase
    .from("products")
    .select("id, code, name, unit, critical_level")
    .eq("code", kod)
    .maybeSingle();

  if (urunHata) {
    return (
      <AppShell title="Ürün" backHref="/urun-ara">
        <p className="text-sm text-red-600">Hata: {urunHata.message}</p>
      </AppShell>
    );
  }

  if (!urun) {
    notFound();
  }

  const { data: stoklar, error: stokHata } = await supabase
    .from("stock_levels")
    .select("quantity, locations(code, name, warehouses(code, name))")
    .eq("product_id", urun.id);

  return (
    <AppShell title={`${urun.code} ${urun.name}`} backHref="/urun-ara">
      <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm">
        <p>
          Birim: <span className="font-medium">{urun.unit}</span>
        </p>
        <p>
          Kritik Seviye:{" "}
          <span className="font-medium">{urun.critical_level}</span>
        </p>
      </div>

      {stokHata ? (
        <p className="text-sm text-red-600">Hata: {stokHata.message}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {(stoklar ?? []).map((stok, i) => {
            const konum = stok.locations as unknown as {
              code: string;
              name: string;
              warehouses: { code: string; name: string } | null;
            } | null;
            const kritikAlti = stok.quantity < urun.critical_level;
            return (
              <li
                key={i}
                className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm"
              >
                <span>
                  {konum?.warehouses?.name ?? "?"} / {konum?.name ?? "?"}
                </span>
                <span className={kritikAlti ? "text-red-600" : ""}>
                  {stok.quantity} {urun.unit}
                  {kritikAlti ? " ⚠" : ""}
                </span>
              </li>
            );
          })}
          {(stoklar ?? []).length === 0 ? (
            <li className="text-sm text-zinc-500">
              Bu ürün için henüz stok kaydı yok.
            </li>
          ) : null}
        </ul>
      )}

      <div className="flex gap-2">
        <Link
          href={`/stok-giris?urun=${urun.code}`}
          className="flex-1 rounded-md bg-zinc-900 px-4 py-2 text-center text-sm font-semibold text-white"
        >
          Giriş
        </Link>
        <Link
          href={`/stok-cikis?urun=${urun.code}`}
          className="flex-1 rounded-md bg-zinc-900 px-4 py-2 text-center text-sm font-semibold text-white"
        >
          Çıkış
        </Link>
        <Link
          href={`/transfer?urun=${urun.code}`}
          className="flex-1 rounded-md bg-zinc-900 px-4 py-2 text-center text-sm font-semibold text-white"
        >
          Transfer
        </Link>
      </div>
      <Link href="/urun-ara" className="text-sm text-zinc-500 underline">
        Aramaya dön
      </Link>
    </AppShell>
  );
}
