import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function UrunAraPage(props: PageProps<"/urun-ara">) {
  const { q } = await props.searchParams;
  const sorgu = typeof q === "string" ? q.trim() : "";

  let urunler: { id: string; code: string; name: string; unit: string }[] = [];
  let hata: string | null = null;

  const supabase = await createClient();
  let dbSorgu = supabase.from("products").select("id, code, name, unit").order("code");

  // Arama kutusu boşsa tüm ürünler listelenir (listeden seçilebilir);
  // yazılırsa kod/ada göre filtrelenir.
  if (sorgu.length > 0) {
    dbSorgu = dbSorgu.or(`code.ilike.%${sorgu}%,name.ilike.%${sorgu}%`);
  }

  const { data, error } = await dbSorgu;
  if (error) {
    hata = error.message;
  } else {
    urunler = data ?? [];
  }

  return (
    <AppShell title="Ürün Ara" backHref="/ana-sayfa">
      <form className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={sorgu}
          placeholder="Kod veya ad ara..."
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Ara
        </button>
      </form>

      {hata ? (
        <p className="text-sm text-red-600">Hata: {hata}</p>
      ) : sorgu.length > 0 && urunler.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Ürün bulunamadı. Kodu/adı kontrol edin.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {urunler.map((urun) => (
            <li key={urun.id}>
              <Link
                href={`/urun/${urun.code}`}
                className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm"
              >
                <span>
                  {urun.code} — {urun.name}
                </span>
                <span className="text-zinc-400">{urun.unit}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
