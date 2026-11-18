import { AppShell } from "@/components/app-shell";

export default function GirisPage() {
  return (
    <AppShell title="Depo Stok Takip">
      <p className="text-sm text-zinc-500">
        CENG 409 - Mobil Depo ve Stok Takip Sistemi
      </p>

      <form className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          E-posta
          <input
            type="email"
            name="email"
            placeholder="ornek@depo.com"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Şifre
          <input
            type="password"
            name="password"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Giriş Yap
        </button>
      </form>

      <p className="text-xs text-zinc-400">
        Not: Bu ekran henüz bir veritabanına bağlı değildir (iskelet
        aşaması). Kimlik doğrulama, Supabase bağlantısı kurulduğunda
        eklenecektir.
      </p>
    </AppShell>
  );
}
