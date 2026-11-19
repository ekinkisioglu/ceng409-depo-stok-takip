import { AppShell } from "@/components/app-shell";
import { BekleyenTransferSatiri } from "@/components/bekleyen-transfer-satiri";
import { TransferForm } from "@/components/transfer-form";
import { createClient } from "@/lib/supabase/server";

type BekleyenTransfer = {
  id: string;
  quantity: number;
  products: { code: string; name: string } | null;
  source_location_id: {
    code: string;
    warehouses: { code: string } | null;
  } | null;
  target_location_id: {
    code: string;
    warehouses: { code: string } | null;
  } | null;
};

export default async function TransferPage(props: PageProps<"/transfer">) {
  const { urun } = await props.searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("stock_movements")
    .select(
      "id, quantity, products(code, name), source_location_id(code, warehouses(code)), target_location_id(code, warehouses(code))",
    )
    .eq("movement_type", "TRANSFER")
    .eq("status", "beklemede")
    .order("created_at", { ascending: true });

  const bekleyenler = (data ?? []) as unknown as BekleyenTransfer[];

  return (
    <AppShell title="Transfer" backHref="/ana-sayfa">
      <TransferForm urunKoduBaslangic={typeof urun === "string" ? urun : ""} />

      <h2 className="text-sm font-semibold text-zinc-700">
        Bekleyen Transferler
      </h2>
      {bekleyenler.length === 0 ? (
        <p className="text-sm text-zinc-500">Bekleyen transfer yok.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {bekleyenler.map((t) => (
            <BekleyenTransferSatiri
              key={t.id}
              movementId={t.id}
              urunEtiketi={`${t.products?.code ?? "?"} ${t.products?.name ?? ""}`}
              kaynakEtiketi={`${t.source_location_id?.warehouses?.code ?? "?"}/${t.source_location_id?.code ?? "?"}`}
              hedefEtiketi={`${t.target_location_id?.warehouses?.code ?? "?"}/${t.target_location_id?.code ?? "?"}`}
              miktar={t.quantity}
            />
          ))}
        </ul>
      )}

      <p className="text-xs text-zinc-400">
        Transfer, hedef depo teslim alana kadar &quot;beklemede&quot; ara durumda kalır
        (S8 senaryosu) — ürün ne kaynakta ne hedefte serbest kullanılabilir.
      </p>
    </AppShell>
  );
}
