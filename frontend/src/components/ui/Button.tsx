import { ReactElement } from "react";

interface ButtonInterface {
  title: string;
  size: "lg" | "sm" | "md";
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  variant: "primary" | "secondary" | "danger";
  onClick?: () => void;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
}

const sizeStyles = {
  lg: "px-5 py-2.5 text-sm rounded-btn font-semibold tracking-wide",
  md: "px-4 py-2 text-xs rounded-btn font-semibold tracking-wide",
  sm: "px-3 py-1.5 text-[10px] rounded-btn font-bold tracking-wider uppercase",
};

const variantStyles = {
  primary:
    "bg-brand-accent hover:bg-brand-accentHover text-white shadow-premium-sm hover:shadow-premium-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 dark:focus:ring-offset-brand-secondary",
  secondary:
    "bg-brand-secondary hover:bg-brand-primary text-brand-text border border-brand-borderAccent hover:border-brand-accent/35 shadow-premium-sm hover:shadow-premium-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 dark:focus:ring-offset-brand-secondary",
  danger:
    "bg-red-500 hover:bg-red-600 text-white shadow-premium-sm hover:shadow-premium-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-brand-secondary",
};

export function Button(props: ButtonInterface) {
  return (
    <button
      type={props.type || "button"}
      onClick={props.onClick}
      disabled={props.loading}
      className={`${sizeStyles[props.size]} ${variantStyles[props.variant]} disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 transform active:scale-[0.98] transition-transform duration-100`}
    >
      {props.loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {props.startIcon && <span className="flex-shrink-0">{props.startIcon}</span>}
          <span>{props.title}</span>
          {props.endIcon && <span className="flex-shrink-0">{props.endIcon}</span>}
        </>
      )}
    </button>
  );
}

export default Button;
