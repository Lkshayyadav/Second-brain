import { useState, useRef, useEffect } from "react";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  selectedOption?: string;
}

export function Dropdown({ label, options, onSelect, selectedOption }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((opt) => opt.value === selectedOption);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex w-full justify-between gap-x-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          {selected ? selected.label : label}
          <span className="text-xs text-slate-400">▼</span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSelect(option.value);
                  setIsOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
