import { cn } from "@/lib/cn";

export function PageIntro({ title, lead, children, art, tone = "bg-leaf-100" }: { title: string; lead: string; children?: React.ReactNode; art?: React.ReactNode; tone?: string }) {
  return (
    <section className="page pt-6 sm:pt-10">
      <div className={cn("grid items-center gap-8 overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:p-12", tone)}>
        <div>
          <h1 className="text-[2.1rem] leading-[1.08] font-bold sm:text-[2.7rem]">{title}</h1>
          <p className="lead mt-4 max-w-xl">{lead}</p>
          {children && <div className="mt-7">{children}</div>}
        </div>
        {art && <div className="mx-auto w-full max-w-md lg:max-w-none">{art}</div>}
      </div>
    </section>
  );
}
