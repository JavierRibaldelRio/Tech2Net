'use client'
import React from "react";

import { cn } from "@/lib/utils";

import { TableCell, TableRow } from "@/components/ui/table";

import { PresenterBasicSchema, PresenterBasicData } from ':neth4tech/schemas/presenter.schema';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { TextareaSizable } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { NotepadTextIcon, PlusIcon, RotateCcwIcon, CheckIcon, } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";

const DEFAULT_VALUES: PresenterBasicData = {
    id: 0,
    name: "",
    email: "",
    organization: "",
    description: "",
}


interface FormPresenterProps extends React.ComponentProps<"tr"> {

    handleAction: (data: PresenterBasicData) => void;
    handleReset?: () => void;      // for button to close the form
    isEditMode: boolean;         // Check if is the form of adding a new user or edit another
    presenter?: PresenterBasicData
}

export function FormPresenter({
    className,
    handleAction,
    handleReset = () => { },
    isEditMode = true,
    presenter = DEFAULT_VALUES,
    ...props
}: FormPresenterProps) {



    const form = useForm<PresenterBasicData>({

        resolver: zodResolver(PresenterBasicSchema),

        //Needed
        defaultValues: presenter
    });


    const onSubmit = (values: PresenterBasicData) => {

        handleAction(values);

        form.reset();
    }


    let formClass = "grid grid-cols-[21fr_21fr_16fr_26fr_10fr] w-full p-2 items-center";

    let buttonAreaContent = <>
        <Button size="icon" className="size-7" variant="secondary" onClick={handleReset} >
            <RotateCcwIcon />
        </Button>
        <Button size="icon" className="size-7" type="submit"  >
            <CheckIcon />
        </Button>
    </>

    if (isEditMode === false) {

        formClass += " border-primary border-t-1 "

        buttonAreaContent = <Button type="submit"
            className="w-full px-2 py-1">  Añadir <PlusIcon /></Button>
    }


    return <TableRow className={cn(" ", className)}>
        <TableCell colSpan={6} className="p-0">
            <Form {...form} >
                <div>

                    <form className={formClass}

                        onSubmit={form.handleSubmit(onSubmit)}
                    >

                        {/* Hidden input */}
                        <input type="number" name="id" value={presenter.id} readOnly hidden />

                        {/* Nombre */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="w-full px-2 "
                                >
                                    <FormControl>
                                        <Input placeholder="" {...field} className="" />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {/* Nombre */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="w-full px-2 " >

                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {/*Organización*/}
                        <FormField
                            control={form.control}
                            name="organization"
                            render={({ field }) => (
                                <FormItem className="w-full px-2 py-1" >
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}

                        <div className="flex justify-center">

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="px-2 py-1 text-center" >
                                        Descripción
                                        <NotepadTextIcon />
                                    </Button>
                                </DialogTrigger>

                                {/* Parte de dentro */}
                                <DialogContent className="[&>button]:hidden">
                                    <DialogHeader>
                                        <DialogTitle>Agregar descripción del ponenente
                                        </DialogTitle>
                                        <DialogDescription>
                                            Campo opcional
                                        </DialogDescription>
                                    </DialogHeader>

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem className="w-full px-2 py-1" >
                                                <FormControl>
                                                    <TextareaSizable className="text-sm h-[50vh]" placeholder="" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}

                                    />
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button>Guardar</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="flex justify-around w-full">
                            {buttonAreaContent}
                        </div>

                    </form>
                </div>
            </Form>



        </TableCell >


    </TableRow >;
}