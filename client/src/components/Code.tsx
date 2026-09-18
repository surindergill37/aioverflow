export default function Code({ children }: { children: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-md bg-ink px-4 py-3 text-[13px] leading-relaxed text-slate-100">
      <code className="font-mono">{children}</code>
    </pre>
  );
}
