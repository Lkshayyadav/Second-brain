interface BadgeProps {
  text: string;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning";
}

const variantStyles = {
  primary: "bg-blue-50 text-blue-700 border-blue-200",
  secondary: "bg-slate-50 text-slate-700 border-slate-200",
  success: "bg-green-50 text-green-700 border-green-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
};

export function Badge({ text, variant = "secondary" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${variantStyles[variant]}`}>
      {text}
    </span>
  );
}
