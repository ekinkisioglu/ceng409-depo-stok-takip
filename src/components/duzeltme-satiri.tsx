"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  requestId: string;
  urunEtiketi: string;
  konumEtiketi: string;
  sistemMiktari: number;
  sayimMiktari: number;
};

export function DuzeltmeSatiri({
  requestId,
  urunEtiketi,
  konumEtiketi,
  sistemMiktari,
  sayimMiktari,
}: Props) {
  const router = useRouter();
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function kararVer(karar: "onayla" | "reddet") {
    setHata(null);
    setYukleniyor(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("karar_ver_duzeltme", {
      p_request_id: requestId,
      p_karar: karar,
    });
    setYukleniyor(false);

    if (error) {
      setHata(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <li className="flex flex-col gap-2 rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm">
      <span>
        {urunEtiketi} — {konumEtiketi}: sistem {sistemMiktari} → sayım{" "}
        {sayimMiktari}
      </span>
      {hata ? <p className="text-red-600">{hata}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={yukleniyor}
          onClick={() => kararVer("onayla")}
          className="flex-1 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          Onayla
        </button>
        <button
          type="button"
          disabled={yukleniyor}
          onClick={() => kararVer("reddet")}
          className="flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 disabled:opacity-50"
        >
          Reddet
        </button>
      </div>
    </li>
  );
}
