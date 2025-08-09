'use client'

import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
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
} from "@/components/ui/form";

import { Switch } from "@/components/ui/switch";
import { TimeFormField } from "./time";
import { DateInput } from "./date-input";

import { CustomFormField } from "./customFormInput";

import { EventFormSchema, EventFormData } from ':neth4tech/schemas/event.schema'
import { NumberField } from "./numberField";




interface EventFormProps extends React.ComponentProps<"div"> {

    handleSubmit: (data: EventFormData) => void;

}


export function EventForm({

    className,
    handleSubmit,
    ...props
}: EventFormProps) {


    //! In the future will need to be on another file
    const form = useForm<EventFormData>({
        resolver: zodResolver(EventFormSchema),
        // Needed, if removed error of uncontrolled form
        defaultValues: {
            title: "",
            description: "",
            organization: "",
            url: "",
            location: "",

            day: new Date(Date.now() + 86400000),  // Next day
            eventStartTime: "",
            eventEndTime: "",

            formOpenTime: "",
            formCloseTime: "",

            meetingsStartTime: "",
            meetingsEndTime: "",

            numberOfSlotsForMeetings: 1,
            meetingsDuration: 15,
            maxNumberOfMeetingsPerPresenters: 0,
            maxTotalNumberOfMeetings: 0,

            automatic: true
        },
    });




    function onSubmit(values: EventFormData) {

        handleSubmit(values);
    }

    const isAutomatic = form.watch("automatic");
    return (
        <div {...props}>
            <Form {...form} >
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
                        name="location"
                        label="Ubicación"
                        placeholder="Ingrese el lugar de la realización del evento"
                    />

                    <CustomFormField
                        form={form}
                        name="url"
                        label="Hipervínculo"
                        placeholder="https://mi.evento.hoy"
                    />

                    <NumberField
                        form={form}
                        name="numberOfSlotsForMeetings"
                        label="Número de huecos por reuniones"
                    />

                    <NumberField
                        form={form}
                        name="meetingsDuration"
                        label="Duración de las reuniones (minutos)"
                        description="Duración de cada reunión en minutos"
                    />

                    <NumberField
                        form={form}
                        name="maxNumberOfMeetingsPerPresenters"
                        label="Máximo de reuniones por presentador"
                        description="Número máximo de reuniones que un presentador puede tener, si es 0 no hay límite"
                    />

                    <NumberField
                        form={form}
                        name="maxTotalNumberOfMeetings"
                        label="Máximo de reuniones totales"
                        description="Número máximo de reuniones que se pueden realizar en total, si es 0 no hay límite"
                    />

                    {/* Switch */}
                    <FormField
                        control={form.control}
                        name="automatic"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Marketing emails</FormLabel>
                                    <FormDescription>
                                        Los formularios se abrirán automaticamente y tras realizar la asignación se enviará un correo a los participantes para comunicarles el resultado
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Dates and Time */}
                    <>
                        <DateInput
                            form={form}
                            label="Fecha del evento"
                            name="day"
                        />

                        <TimeFormField
                            form={form}
                            name="eventStartTime"
                            label="Inicio del evento"
                        />

                        <TimeFormField
                            form={form}
                            name="eventEndTime"
                            label="Fin del evento"
                        />

                        {/* Shows if the event is set up as automatic */}
                        {isAutomatic &&
                            <>
                                <TimeFormField
                                    form={form}
                                    name="formOpenTime"
                                    label="Apertura del formulario"
                                />
                                <TimeFormField
                                    form={form}
                                    name="formCloseTime"
                                    label="Cierre del formulario"
                                />
                            </>
                        }
                        <TimeFormField
                            form={form}
                            name="meetingsStartTime"
                            label="Inicio de reuniones"
                        />
                        <TimeFormField
                            form={form}
                            name="meetingsEndTime"
                            label="Fin de reuniones"
                        />
                    </>

                    <Button type="submit">Enviar</Button>
                </form>
            </Form>
        </div>
    );
}





