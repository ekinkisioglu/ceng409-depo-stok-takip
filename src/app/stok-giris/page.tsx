import { AppShell } from "@/components/app-shell";
import { StokGirisFormu } from "@/components/stok-giris-formu";

export default async function StokGirisPage(props: PageProps<"/stok-giris">) {
  const { urun } = await props.searchParams;

  return (
    <AppShell title="Stok Girişi" backHref="/ana-sayfa">
      <StokGirisFormu urunKoduBaslangic={typeof urun === "string" ? urun : ""} />
    </AppShell>
  );
}
