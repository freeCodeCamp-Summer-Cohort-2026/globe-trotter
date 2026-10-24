type OrDividerProps = {
  className?: string;
}

export default function OrDivider({ className }: OrDividerProps) {
  return (
    <div className={className ?? "relative my-2"}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-300" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-2 text-slate-500">or</span>
      </div>
    </div>
  )
}
