import { AppShell } from "@/components/app-shell";
import { SayimFormu } from "@/components/sayim-formu";
import { referansVerileriGetir } from "@/lib/referans-veri";

export default async function SayimPage() {
  const { urunler, depolar, konumlar } = await referansVerileriGetir();

  return (
    <AppShell title="Sayım" backHref="/ana-sayfa">
      <SayimFormu urunler={urunler} depolar={depolar} konumlar={konumlar} />
    </AppShell>
  );
}
