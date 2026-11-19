"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ComboBoxSecenek = { value: string; label: string };

export function ComboBox({
  value,
  onChange,
  secenekler,
  placeholder,
  required = false,
}: {
  value: string;
  onChange: (deger: string) => void;
  secenekler: ComboBoxSecenek[];
  placeholder?: string;
  required?: boolean;
}) {
  const [acik, setAcik] = useState(false);
  const kutuRef = useRef<HTMLDivElement>(null);

  const filtrelenmis = useMemo(() => {
    const s = value.trim().toLowerCase();
    if (!s) return secenekler;
    return secenekler.filter(
      (o) =>
        o.value.toLowerCase().includes(s) || o.label.toLowerCase().includes(s),
    );
  }, [value, secenekler]);

  useEffect(() => {
    function disaTikla(e: MouseEvent) {
      if (kutuRef.current && !kutuRef.current.contains(e.target as Node)) {
        setAcik(false);
      }
    }
    document.addEventListener("mousedown", disaTikla);
    return () => document.removeEventListener("mousedown", disaTikla);
  }, []);

  return (
    <div ref={kutuRef} className="relative">
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setAcik(true);
        }}
        onFocus={() => setAcik(true)}
        placeholder={placeholder}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />

      {acik ? (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-zinc-200 bg-white shadow-lg">
          {filtrelenmis.length === 0 ? (
            <li className="px-3 py-2 text-sm text-zinc-500">Eşleşme yok</li>
          ) : (
            filtrelenmis.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(o.value);
                    setAcik(false);
                  }}
                  className="block w-full border-b border-zinc-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-zinc-50"
                >
                  {o.label}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
