interface InputProps {
  label: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}: InputProps) {
  return (
    <label className="flex flex-col gap-2 text-xs font-bold text-brand-sub uppercase tracking-wider">
      <span>{label} {required && <span className="text-red-500">*</span>}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="rounded-btn border border-brand-borderAccent bg-brand-secondary px-3.5 py-2 text-sm text-brand-text placeholder:text-brand-muted outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accentGlow transition-all duration-200"
      />
    </label>
  );
}

export default Input;
