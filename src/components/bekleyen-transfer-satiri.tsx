"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  movementId: string;
  urunEtiketi: string;
  kaynakEtiketi: string;
  hedefEtiketi: string;
  miktar: number;
};

export function BekleyenTransferSatiri({
  movementId,
  urunEtiketi,
  kaynakEtiketi,
  hedefEtiketi,
  miktar,
}: Props) {
  const router = useRouter();
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function islemYap(islem: "teslim_al_transfer" | "iptal_transfer") {
    setHata(null);
    setYukleniyor(true);
    const supabase = createClient();
    const { error } = await supabase.rpc(islem, { p_movement_id: movementId });
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
        {urunEtiketi}: {kaynakEtiketi} → {hedefEtiketi} ({miktar})
      </span>
      {hata ? <p className="text-red-600">{hata}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={yukleniyor}
          onClick={() => islemYap("teslim_al_transfer")}
          className="flex-1 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          Teslim Al
        </button>
        <button
          type="button"
          disabled={yukleniyor}
          onClick={() => islemYap("iptal_transfer")}
          className="flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 disabled:opacity-50"
        >
          İptal
        </button>
      </div>
    </li>
  );
}
