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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";


interface CustomFormFieldProps<T extends FieldValues> {
    form: UseFormReturn<T>;
    name: FieldPath<T>;
    label: string;
    placeholder?: string;
    description?: string;
    inputType?: "input" | "textarea";
    className?: string;
    children?: ReactNode;
}


export function CustomFormField<T extends FieldValues>({
    form,
    name,
    label,
    placeholder = "",
    description,
    inputType = "input",
    className,
    children,
}: CustomFormFieldProps<T>) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        {children ? (
                            children
                        ) : inputType === "textarea" ? (
                            <Textarea placeholder={placeholder} {...field} />
                        ) : (
                            <Input placeholder={placeholder} {...field} />
                        )}
                    </FormControl>
                    {description && (
                        <FormDescription>{description}</FormDescription>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}