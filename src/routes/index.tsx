import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EggTimer } from "@/components/EggTimer";
import { Plus, X, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "iPrivat & iJobb – Mina listor" },
      { name: "description", content: "Skapa och organisera dina privata listor och jobbuppgifter på ett ställe." },
      { property: "og:title", content: "iPrivat & iJobb – Mina listor" },
      { property: "og:description", content: "Skapa och organisera dina privata listor och jobbuppgifter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const COLORS = ["bg-c1", "bg-c2", "bg-c3", "bg-c4", "bg-c5", "bg-c6", "bg-c7"];
const RINGS = ["border-c1", "border-c2", "border-c3", "border-c4", "border-c5", "border-c6", "border-c7"];
const SECTIONS = ["Morgon", "Förmiddag", "Eftermiddag", "Kväll"] as const;
type Section = (typeof SECTIONS)[number];
type Item = { id: number; title: string; desc: string; date: string; color: number; section: Section; done?: boolean };

function sectionFor(time: string): Section {
  const h = parseInt(time.split(":")[0] || "8");
  if (h < 10) return "Morgon";
  if (h < 12) return "Förmiddag";
  if (h < 18) return "Eftermiddag";
  return "Kväll";
}

function fmt(d: string) {
  const date = d ? new Date(d) : new Date();
  return date.toLocaleDateString("sv-SE", { day: "numeric", month: "short" }).replace(".", "");
}

function ItemCard({ item, onToggle }: { item: Item; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-sm">
      <button onClick={onToggle} className={`h-4 w-4 shrink-0 rounded-full border-2 ${RINGS[item.color]} ${item.done ? COLORS[item.color] : ""}`} aria-label="Klar" />
      <div className="min-w-0 flex-1">
        <div className={`text-lg leading-tight ${item.done ? "line-through text-muted-foreground" : ""}`}>{item.title}</div>
        <div className="truncate text-xs text-muted-foreground">{item.desc || "Beskrivning"}</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-muted-foreground">Slutdatum</div>
        <div className="font-bold">{fmt(item.date)}</div>
      </div>
    </div>
  );
}

function Dots() {
  return (
    <div className="flex justify-center gap-3 py-8">
      {COLORS.map((c) => <span key={c} className={`h-4 w-4 rounded-full ${c}`} />)}
    </div>
  );
}

function Index() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, title: "Träna", desc: "30 min löpning", date: "", color: 0, section: "Morgon" },
    { id: 2, title: "Handla", desc: "Mjölk, bröd", date: "", color: 2, section: "Förmiddag" },
    { id: 3, title: "Ring mamma", desc: "", date: "", color: 3, section: "Förmiddag" },
    { id: 4, title: "Laga middag", desc: "Pasta", date: "", color: 4, section: "Eftermiddag" },
  ]);
  const empty = { title: "", desc: "", time: "", date: "", add: "", qty: "", color: 0 };
  const [f, setF] = useState(empty);
  const [jobs, setJobs] = useState<Item[]>(
    ["Rapport", "Möte", "Mejl", "Budget", "Presentation"].map((t, i) => ({ id: 100 + i, title: t, desc: "Beskrivning", date: "", color: 0, section: "Morgon" })),
  );
  const [colorOpen, setColorOpen] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const toggle = (list: Item[], set: (x: Item[]) => void, id: number) => {
    const item = list.find((i) => i.id === id);
    if (item && !item.done) {
      const n = doneCount + 1;
      setDoneCount(n);
      if (n % 4 === 0) toast.success("Bra jobbat! 🎉", { description: `Du har bockat av ${n} listor.` });
    }
    set(list.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  };

  const create = () => {
    if (!f.title.trim()) return;
    const desc = [f.desc, f.add && `${f.add}${f.qty ? ` ×${f.qty}` : ""}`].filter(Boolean).join(" · ");
    setItems([...items, { id: Date.now(), title: f.title, desc, date: f.date, color: f.color, section: sectionFor(f.time) }]);
    setF(empty);
  };
  const input = "w-full rounded-md bg-card px-3 py-2 text-foreground outline-none";
  const schedule: [string, string][] = [
    ["08:00", "Start & planering"],
    ["09:00", "Mejl & telefonsamtal"],
    ["10:00", "Team Möte"],
    ["11:00", "Fokuserat arbete"],
    ["12:00", "Lunch"],
    ["13:00", "Kundmöte"],
    ["14:00", "Projektarbete"],
    ["15:00", "Kaffepaus & genomicsning"],
    ["16:00", "Avslut & dagen därpå"],
    ["17:00", "Slut för dagen"],
  ];
  const today = new Date().toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "short" });

  return (
    <div className="min-h-screen">
      <EggTimer />
      <Toaster position="top-center" />
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center bg-primary font-bold text-primary-foreground">K</div>
        <nav className="flex gap-4 text-sm">
          {["Hem", "Privat", "Jobb"].map((n, i) => (
            <a key={n} href={`#${n.toLowerCase()}`} className={i === 0 ? "rounded bg-secondary px-2" : ""}>{n}</a>
          ))}
          <a href="#" className="font-semibold text-accent underline">Kalender</a>
        </nav>
      </header>

      <section id="hem" className="relative h-[420px] overflow-hidden">
        <img src={hero} alt="Bil i ljust landskap" width={1584} height={672} className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative ml-[30%] pt-16">
          <h1 className="text-6xl font-light">Hej Kimmy!</h1>
          <p className="mt-6 max-w-[12rem] text-lg">Vad vill du skapa för lista?</p>
          <div className="mt-6 flex gap-3">
            <a href="#privat" className="rounded-full border border-primary bg-card px-6 py-2 font-semibold text-foreground">iPrivat</a>
            <a href="#jobb" className="rounded-full bg-primary px-6 py-2 font-semibold text-primary-foreground">iJobb</a>
          </div>
        </div>
      </section>

      <section id="privat" className="mx-auto max-w-6xl px-6">
        <h2 className="py-10 text-center text-5xl font-light">iPrivat</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-2xl">Skapa lista</h3>
            <div className="space-y-4 rounded-xl bg-panel p-6 text-panel-foreground">
              <div className="flex gap-4">
                <div className="relative">
                  <label className="text-sm">Färg</label>
                  <button onClick={() => setColorOpen(!colorOpen)} className="mt-1 flex items-center gap-1 rounded-md bg-card px-2 py-2" aria-label="Välj färg">
                    <span className={`h-5 w-5 rounded-full ${COLORS[f.color]}`} />
                    <ChevronDown className="h-4 w-4 text-foreground" />
                  </button>
                  {colorOpen && (
                    <div className="absolute left-0 top-full z-20 mt-1 flex flex-col gap-2 rounded-md bg-card p-2 shadow-lg">
                      {COLORS.map((c, i) => (
                        <button key={c} onClick={() => { setF({ ...f, color: i }); setColorOpen(false); }} className={`h-6 w-6 rounded-full ${c} ${f.color === i ? "ring-2 ring-primary" : ""}`} aria-label={`Färg ${i + 1}`} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-sm">Titel</label>
                  <input className={input} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm">Beskrivning</label>
                <textarea rows={4} className={input} value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} />
              </div>
              <div className="flex justify-between gap-4">
                <div><label className="text-sm">Tid</label><input type="time" className={input} value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></div>
                <div><label className="text-sm">Datum</label><input type="date" className={input} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1"><label className="text-sm">Lägg till...</label><input className={input} value={f.add} onChange={(e) => setF({ ...f, add: e.target.value })} /></div>
                <div className="w-20"><label className="text-sm">Antal</label><input type="number" className={input} value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} /></div>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button onClick={() => setF(empty)} className="flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs text-foreground">Avbryt <X className="h-3 w-3 text-destructive" /></button>
                <button onClick={create} className="flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs text-foreground">Skapa <Check className="h-3 w-3 text-c5" /></button>
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-2xl">Mina listor</h3>
            <div className="space-y-4 rounded-xl bg-secondary p-4">
              {SECTIONS.map((s) => (
                <div key={s}>
                  <h4 className="mb-2 font-bold">{s}</h4>
                  <div className="space-y-2">
                    {items.filter((i) => i.section === s).map((i) => (
                      <ItemCard key={i.id} item={i} onToggle={() => toggle(items, setItems, i.id)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Dots />
      </section>

      <section id="jobb" className="px-6 pb-4" style={{ background: "var(--gradient-job)" }}>
        <div className="mx-auto max-w-6xl">
          <h2 className="py-10 text-center text-5xl font-light text-primary-foreground">iJobb</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-primary-foreground">
              <div className="text-xs capitalize">{today}</div>
              <h3 className="mb-4 text-2xl">Idag</h3>
              <div className="space-y-2">
                {schedule.map(([h, task]) => {
                  const special = task === "Lunch" || task.toLowerCase().includes("möte");
                  return (
                  <div key={h} className="flex items-center gap-3">
                    <span className="w-10 text-xs">{h}</span>
                    <span className={`h-2 w-2 rounded-full border border-primary-foreground ${special ? "bg-primary-foreground" : ""}`} />
                    <div className={`flex flex-1 justify-between rounded-full px-4 py-1 text-sm ${special ? "bg-primary-foreground text-primary" : "bg-card text-foreground"}`}>
                      <span>{task}</span>
                      <span>1 tim</span>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
            <div className="md:border-l md:border-primary-foreground/40 md:pl-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-2xl text-primary-foreground">Att göra</h3>
                <button onClick={() => { const t = prompt("Titel?"); if (t) setJobs([...jobs, { id: Date.now(), title: t, desc: "Beskrivning", date: "", color: 0, section: "Morgon" }]); }} className="flex h-8 w-8 items-center justify-center rounded-full bg-card" aria-label="Lägg till"><Plus className="h-4 w-4" /></button>
              </div>
              <div className="space-y-4">
                {jobs.map((j) => <ItemCard key={j.id} item={j} onToggle={() => toggle(jobs, setJobs, j.id)} />)}
              </div>
            </div>
          </div>
          <Dots />
        </div>
      </section>
    </div>
  );
}
