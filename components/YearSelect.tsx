import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface YearSelectProps {
  years: number[];
  year: number | undefined;
  setYear: (y: number) => void;
}

export function YearSelect({ years, year, setYear }: YearSelectProps) {
  return (
    <Select value={year?.toString() || ""} onValueChange={v => setYear(Number(v))}>
      <SelectTrigger className="w-[180px] bg-[#232336] text-white border border-[#3b3b4f] rounded-xl text-base px-4 py-3">
        <SelectValue placeholder="Año" />
      </SelectTrigger>
      <SelectContent className="bg-[#232336] border border-[#3b3b4f] rounded-xl mt-2">
        <SelectGroup>
          <SelectLabel className="text-gray-300 text-base px-4 py-2">Años</SelectLabel>
          {years.map(y => (
            <SelectItem
              key={y}
              value={y.toString()}
              className="cursor-pointer !text-white data-[state=checked]:bg-blue-700 rounded-md px-4 py-2 text-base bg-transparent"
            >
              {y}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
} 