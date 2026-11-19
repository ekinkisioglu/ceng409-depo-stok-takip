import { createClient } from "@/lib/supabase/server";

export type Konum = { code: string; name: string; depo_kodu: string };

export async function referansVerileriGetir() {
  const supabase = await createClient();

  const [{ data: urunler }, { data: depolar }, { data: konumlarHam }] =
    await Promise.all([
      supabase.from("products").select("code, name").order("code"),
      supabase.from("warehouses").select("code, name").order("code"),
      supabase
        .from("locations")
        .select("code, name, warehouses(code)")
        .order("code"),
    ]);

  const konumlar: Konum[] = (konumlarHam ?? []).map((k) => ({
    code: k.code,
    name: k.name,
    depo_kodu:
      (k.warehouses as unknown as { code: string } | null)?.code ?? "",
  }));

  return {
    urunler: urunler ?? [],
    depolar: depolar ?? [],
    konumlar,
  };
}
