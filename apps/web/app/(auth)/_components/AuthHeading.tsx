type AuthHeadingProps = {
  title: string;
  description: string;
}

export default function AuthHeading({ title, description }: AuthHeadingProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-slate-600">
        {description}
      </p>
    </div>
  )
}
