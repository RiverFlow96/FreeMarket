import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CURRENCY_LABELS, type Currency } from "@/utils/currency";

interface StepPriceProps {
  price: string;
  currency: Currency;
  negotiable: boolean;
  errors: { price?: string; currency?: string };
  onPriceChange: (value: string) => void;
  onCurrencyChange: (value: Currency) => void;
  onNegotiableChange: (value: boolean) => void;
}

export function StepPrice({
  price,
  currency,
  negotiable,
  errors,
  onPriceChange,
  onCurrencyChange,
  onNegotiableChange,
}: StepPriceProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">
            Precio *
          </label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
          />
          {errors.price && (
            <span className="text-xs text-destructive">{errors.price}</span>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="currency" className="text-sm font-medium">
            Moneda *
          </label>
          <Select
            value={currency}
            onValueChange={(val) => onCurrencyChange(val as Currency)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona moneda" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CURRENCY_LABELS) as Currency[]).map((curr) => (
                <SelectItem key={curr} value={curr}>
                  {CURRENCY_LABELS[curr]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.currency && (
            <span className="text-xs text-destructive">{errors.currency}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="negotiable"
          checked={negotiable}
          onChange={(e) => onNegotiableChange(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300"
        />
        <Label htmlFor="negotiable" className="text-sm font-normal cursor-pointer">
          Precio negociable
        </Label>
      </div>
    </div>
  );
}
