"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form"

import { UseFormReturn, FieldPath, FieldValues, PathValue } from "react-hook-form"

function formatDate(date: Date | undefined) {
    if (!date) {
        return ""
    }

    return date.toLocaleDateString()
}

function isValidDate(date: Date | undefined) {
    if (!date) {
        return false
    }
    return !isNaN(date.getTime())
}

interface CustomFormFieldProps<T extends FieldValues> {
    form: UseFormReturn<T>;
    name: FieldPath<T>;
    label: string;
    description?: string;
    className?: string;
    children?: React.ReactNode;
}

export function DateInput<T extends FieldValues>({
    form,
    name,
    label,
    description,
    className,
    children,
}: CustomFormFieldProps<T>) {
    const [open, setOpen] = React.useState(false);
    const selectedDate = form.watch(name);

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            form.setValue(name, date as PathValue<T, FieldPath<T>>, { shouldValidate: true });
        }
        setOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = new Date(e.target.value);
        if (!isNaN(date.getTime())) {
            form.setValue(name, date as PathValue<T, FieldPath<T>>, { shouldValidate: true });
        }
    };

    return (


        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (


                <FormItem className={className}>


                    <FormLabel>{label}</FormLabel>

                    <FormControl>
                        <div className="relative flex gap-2">
                            <Input
                                placeholder={new Date(2026, 1, 31).toLocaleDateString()}

                                {...field}
                                className="bg-background pr-10"
                                value={field.value ? field.value.toLocaleDateString() : ""}
                                onChange={handleInputChange}

                                onKeyDown={(e) => {
                                    if (e.key === "ArrowDown") {
                                        e.preventDefault()
                                        setOpen(true)
                                    }
                                }}
                            />
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date-picker"
                                        variant="ghost"
                                        className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                                    >
                                        <CalendarIcon className="size-3.5" />
                                        <span className="sr-only">Select date</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto overflow-hidden p-0"
                                    align="end"
                                    alignOffset={-8}
                                    sideOffset={10}
                                >
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={handleDateSelect}

                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                    </FormControl>
                    <FormMessage />


                </FormItem>


            )}

        />

    )
}
