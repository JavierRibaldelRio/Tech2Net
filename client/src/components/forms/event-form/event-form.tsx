'use client'

import React, { ReactNode } from "react";
import { useForm, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"
import { DateTime } from "./date-time";
import { DateInput } from "./date-input";
// 1. Define tu esquema de validación con Zod
const formSchema = z.object({
    title: z.string().min(2, {
        message: "El usuario debe tener al menos 2 caracteres",
    }),
    description: z.string(),
    organization: z.string(),
    url: z.url(),
    location: z.string(),
    fechi: z.date(),
    email: z.email({
        message: "Por favor ingresa un email válido",
    }),
});
export function EventForm({

    className,
    ...props
}: React.ComponentProps<"div">) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            organization: "",
            location: "",
            url: "",

            email: "",
        },
    });

    // 3. Define el manejador de submit
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        // Aquí puedes manejar el envío de datos
    }

    return (
        <div><Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <CustomFormField
                    form={form}
                    name="title"
                    label="Título del evento"
                    placeholder="Ingrese el título"
                />
                <CustomFormField
                    form={form}
                    name="description"
                    label="Descripción"
                    placeholder="Escriba una descripción"
                    inputType="textarea"
                />



                <CustomFormField
                    form={form}
                    name="organization"
                    label="Entidad organizadora"
                    placeholder="Ingrese el nombre de la entidad organizadora"
                />

                <CustomFormField
                    form={form}
                    name="url"
                    label="Hipervínculo"
                    placeholder="https://mi.evento.hoy"
                />

                <DateInput
                    form={form}
                    name="fechi"
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="tu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Enviar</Button>
            </form>
        </Form>
        </div>
    );
}

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
