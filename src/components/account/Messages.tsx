"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { DEMO_THREADS, type Message } from "@/data/account";
import { getVehicle, vehicleTitle } from "@/data/vehicles";
import { providerOf } from "@/data/providers";
import { useStore, type Session } from "@/lib/store";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { cn } from "@/lib/cn";

const NO_MSG: Record<string, Message[]> = {};

export function Messages({ session }: { session: Session }) {
  const threads = DEMO_THREADS[session.role];
  const [extra, setExtra] = useStore("rac:messages", NO_MSG);
  const [active, setActive] = useState<string | null>(null);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const t = threads.find((x) => x.id === active);
  const msgs = t ? [...t.messages, ...(extra[t.id] ?? [])] : [];
  useEffect(() => end.current?.scrollIntoView({ block: "nearest" }), [msgs.length, active]);

  return (
    <div className="grid overflow-hidden rounded-2xl bg-white ring-1 ring-line lg:grid-cols-[19rem_1fr]">
      <ul className={cn("divide-y divide-line border-line lg:border-r", active && "hidden lg:block")} aria-label="Unterhaltungen">
        {threads.map((th) => {
          const v = getVehicle(th.vehicleSlug)!;
          const last = [...th.messages, ...(extra[th.id] ?? [])].at(-1)!;
          return (
            <li key={th.id}>
              <button type="button" onClick={() => setActive(th.id)} aria-current={active === th.id} className={cn("w-full cursor-pointer p-4 text-left transition hover:bg-leaf-50", active === th.id && "bg-leaf-50")}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-forest">{th.with}</p>
                  {th.unread && !extra[th.id] && <span className="size-2.5 rounded-full bg-leaf-500" aria-label="Ungelesen" />}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2"><ProviderBadge kind={providerOf(v).kind} short /><span className="text-sm text-muted">{vehicleTitle(v)}</span></div>
                <p className="mt-1.5 truncate text-sm text-ink/75">{last.text}</p>
              </button>
            </li>
          );
        })}
      </ul>
      <div className={cn("flex min-h-[28rem] flex-col", !active && "hidden lg:flex")}>
        {t ? (
          <>
            <div className="flex items-center gap-3 border-b border-line p-4">
              <button type="button" className="icon-btn -ml-2 lg:hidden" aria-label="Zurück zur Übersicht" onClick={() => setActive(null)}><ArrowLeft className="size-5" aria-hidden /></button>
              <div>
                <p className="font-bold text-forest">{t.with}</p>
                <p className="flex flex-wrap items-center gap-2 text-sm text-muted"><ProviderBadge kind={providerOf(getVehicle(t.vehicleSlug)!).kind} short />{vehicleTitle(getVehicle(t.vehicleSlug)!)}</p>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-leaf-50/60 p-4" aria-live="polite">
              {msgs.map((msg, i) => (
                <div key={i} className={cn("max-w-[80%] rounded-2xl px-4 py-2.5", msg.from === "ich" ? "ml-auto rounded-br-md bg-forest text-white" : "rounded-bl-md bg-white ring-1 ring-line")}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className={cn("mt-1 text-xs", msg.from === "ich" ? "text-white/75" : "text-muted")}>{msg.time}</p>
                </div>
              ))}
              <div ref={end} />
            </div>
            <form
              className="flex gap-2 border-t border-line p-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!text.trim()) return;
                setExtra((x) => ({ ...x, [t.id]: [...(x[t.id] ?? []), { from: "ich", text: text.trim(), time: "Gerade eben" }] }));
                setText("");
              }}
            >
              <label htmlFor="msg" className="sr-only">Nachricht an {t.with}</label>
              <input id="msg" className="field" placeholder="Nachricht schreiben" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" />
              <button type="submit" className="btn btn-primary px-4" aria-label="Senden"><Send className="size-5" aria-hidden /></button>
            </form>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-center text-muted">Wähle eine Unterhaltung aus.</div>
        )}
      </div>
    </div>
  );
}
