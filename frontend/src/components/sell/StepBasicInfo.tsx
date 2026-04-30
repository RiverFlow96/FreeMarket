import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  name: string;
}

interface StepBasicInfoProps {
  name: string;
  description: string;
  category: string;
  categories: Category[];
  errors: { name?: string; description?: string; category?: string };
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function StepBasicInfo({
  name,
  description,
  category,
  categories,
  errors,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
}: StepBasicInfoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre del producto *
        </label>
        <Input
          id="name"
          placeholder="Ej: iPhone 14 Pro"
          value={name}
          onChange={(e) => onNameChange(e.target.value.slice(0, 100))}
          maxLength={100}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {errors.name && <span className="text-destructive">{errors.name}</span>}
          <span>{name.length}/100</span>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Descripción
        </label>
        <Textarea
          id="description"
          placeholder="Describe tu producto (estado, características, etc.)"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value.slice(0, 1000))}
          rows={5}
          maxLength={1000}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {errors.description && <span className="text-destructive">{errors.description}</span>}
          <span>{description.length}/1000</span>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">
          Categoría
        </label>
        <Select value={category || "none"} onValueChange={(val) => onCategoryChange(val === "none" ? "" : val)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="none">Sin categoría</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.name} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <span className="text-xs text-destructive">{errors.category}</span>
        )}
      </div>
    </div>
  );
}
