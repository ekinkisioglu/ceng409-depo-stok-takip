import { AppShell } from "@/components/app-shell";
import { StokCikisFormu } from "@/components/stok-cikis-formu";
import { referansVerileriGetir } from "@/lib/referans-veri";

export default async function StokCikisPage(props: PageProps<"/stok-cikis">) {
  const { urun } = await props.searchParams;
  const { urunler, depolar, konumlar } = await referansVerileriGetir();

  return (
    <AppShell title="Stok Çıkışı" backHref="/ana-sayfa">
      <StokCikisFormu
        urunKoduBaslangic={typeof urun === "string" ? urun : ""}
        urunler={urunler}
        depolar={depolar}
        konumlar={konumlar}
      />
    </AppShell>
  );
}
