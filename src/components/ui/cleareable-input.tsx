import * as React from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ClearableInputProps
  extends React.ComponentProps<typeof Input> {
  onClear?: () => void
  rightElement?: React.ReactNode
}

interface ClearableInputProps
  extends React.ComponentProps<typeof Input> {
  onClear?: () => void
  rightElement?: React.ReactNode
}

export function ClearableInput({
  className,
  value,
  onChange,
  onClear,
  rightElement,
  ...props
}: ClearableInputProps) {
  const hasValue = value && String(value).length > 0

  return (
    <div className="relative w-full">
      <Input
        value={value}
        onChange={onChange}
        className={cn(
          "h-16 text-3xl px-6 pr-28 rounded-2xl border border-gray-200 shadow-sm focus-visible:ring-2 focus-visible:ring-gray-300",
          className
        )}
        {...props}
      />

      <div className="absolute right-1 top-1 bottom-1 flex items-center gap-1">
        {hasValue && (
          <button
            type="button"
            onClick={() => {
              onClear?.()
              if (onChange) {
                const event = {
                  target: { value: "" },
                } as React.ChangeEvent<HTMLInputElement>
                onChange(event)
              }
            }}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {rightElement}
      </div>
    </div>
  )
}