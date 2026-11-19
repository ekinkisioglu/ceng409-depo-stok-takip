import { AppShell } from "@/components/app-shell";
import { UrunAramaKutusu } from "@/components/urun-arama-kutusu";
import { createClient } from "@/lib/supabase/server";

export default async function UrunAraPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, code, name, unit")
    .order("code");

  return (
    <AppShell title="Ürün Ara" backHref="/ana-sayfa">
      {error ? (
        <p className="text-sm text-red-600">Hata: {error.message}</p>
      ) : (
        <UrunAramaKutusu urunler={data ?? []} />
      )}
    </AppShell>
  );
}
