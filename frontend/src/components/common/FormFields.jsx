import { useField } from "formik";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const inputClassName =
  "flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function FieldError({ name }) {
  const [, meta] = useField(name);
  if (!(meta.touched && meta.error) || typeof meta.error !== "string") return null;
  return (
    <p className="mt-1.5 text-xs font-medium text-destructive" role="alert">
      {meta.error}
    </p>
  );
}

function Wrapper({ id, label, hint, required, className, children, name }) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <FieldError name={name} />
    </div>
  );
}

export function FormInput({ name, label, hint, required, className, rightSlot, ...props }) {
  const [field, meta] = useField(name);
  const invalid = meta.touched && !!meta.error;
  return (
    <Wrapper id={name} name={name} label={label} hint={hint} required={required} className={className}>
      <div className="relative">
        <Input id={name} aria-invalid={invalid} className={rightSlot ? "pr-20" : undefined} {...field} {...props} />
        {rightSlot && <div className="absolute inset-y-0 right-2 flex items-center">{rightSlot}</div>}
      </div>
    </Wrapper>
  );
}

export function FormTextarea({ name, label, hint, required, className, ...props }) {
  const [field, meta] = useField(name);
  const invalid = meta.touched && !!meta.error;
  return (
    <Wrapper id={name} name={name} label={label} hint={hint} required={required} className={className}>
      <Textarea id={name} aria-invalid={invalid} {...field} {...props} />
    </Wrapper>
  );
}

export function FormSelect({ name, label, hint, required, className, options, placeholder = "Select..." }) {
  const [field, meta, helpers] = useField(name);
  const invalid = meta.touched && !!meta.error;
  return (
    <Wrapper id={name} name={name} label={label} hint={hint} required={required} className={className}>
      <Select value={field.value || undefined} onValueChange={(v) => helpers.setValue(v)}>
        <SelectTrigger id={name} aria-invalid={invalid} onBlur={() => helpers.setTouched(true)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Wrapper>
  );
}
