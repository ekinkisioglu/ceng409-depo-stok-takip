import { AppShell } from "@/components/app-shell";
import { StokCikisFormu } from "@/components/stok-cikis-formu";

export default async function StokCikisPage(props: PageProps<"/stok-cikis">) {
  const { urun } = await props.searchParams;

  return (
    <AppShell title="Stok Çıkışı" backHref="/ana-sayfa">
      <StokCikisFormu urunKoduBaslangic={typeof urun === "string" ? urun : ""} />
    </AppShell>
  );
}
