import { AppShell } from "@/components/app-shell";
import { StokGirisFormu } from "@/components/stok-giris-formu";
import { referansVerileriGetir } from "@/lib/referans-veri";

export default async function StokGirisPage(props: PageProps<"/stok-giris">) {
  const { urun } = await props.searchParams;
  const { urunler, depolar, konumlar } = await referansVerileriGetir();

  return (
    <AppShell title="Stok Girişi" backHref="/ana-sayfa">
      <StokGirisFormu
        urunKoduBaslangic={typeof urun === "string" ? urun : ""}
        urunler={urunler}
        depolar={depolar}
        konumlar={konumlar}
      />
    </AppShell>
  );
}
