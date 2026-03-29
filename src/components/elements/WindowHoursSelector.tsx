import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

type WindowHoursSelectorProps = {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
};

const defaultOptions = [6, 12, 24, 48, 72];

export default function WindowHoursSelector({
  value,
  onChange,
  options = defaultOptions,
}: WindowHoursSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={value.toString()}
      onValueChange={(val) => {
        if (!val) return;
        onChange(Number(val));
      }}
      className="outline rounded-md border bg-blue-50 flex w-full"
    >
      {options.map((hours) => (
        <ToggleGroupItem
          key={hours}
          value={hours.toString()}
          className="
            flex-1
            px-3 py-2 text-sm font-medium
            data-[state=on]:bg-blue-500
            data-[state=on]:text-white
            data-[state=on]:border-blue-500
          "
        >
          {hours}h
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}