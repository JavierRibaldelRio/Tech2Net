import { ReactNode } from "react";
import { FieldValues, FieldPath, UseFormReturn } from "react-hook-form";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface NumberFieldProps<T extends FieldValues> {
    form: UseFormReturn<T>;
    name: FieldPath<T>;
    label: string;
    placeholder?: string;
    description?: string;
    className?: string;
    children?: ReactNode;
}

export function NumberField<T extends FieldValues>({
    form,
    name,
    label,
    placeholder = "",
    description,
    className,
    children,
}: NumberFieldProps<T>) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => {

                return (
                    <FormItem className={className} >
                        <FormLabel>{label} </FormLabel>
                        <FormControl>
                            {
                                children ?? (
                                    <Input
                                        type="number"
                                        placeholder={placeholder}

                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        value={field.value}
                                        onBlur={field.onBlur}
                                        ref={field.ref}
                                    />
                                )
                            }
                        </FormControl>
                        {
                            description && (
                                <FormDescription>{description} </FormDescription>
                            )
                        }
                        <FormMessage />
                    </FormItem>
                )
            }
            }
        />
    );
}