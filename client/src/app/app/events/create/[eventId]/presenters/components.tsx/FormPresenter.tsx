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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { TextareaSizable, Textarea } from "@/components/ui/textarea";
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

import { NotepadTextIcon, PlusIcon } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";


interface FormPresenterProps extends React.ComponentProps<"tr"> {

    handleAdd: (data: PresenterBasicData) => void;
    isEditMode?: boolean;         // Check if is the form of adding a new user or edit another
}

export function FormPresenter({
    className,
    handleAdd,
    isEditMode,
    ...props
}: FormPresenterProps) {

    const form = useForm<PresenterBasicData>({

        resolver: zodResolver(PresenterBasicSchema),

        //Needed

        defaultValues: {
            id: 0,
            name: "",
            email: "",
            organization: "",
            description: "",
        }
    });


    const onSubmit = (values: PresenterBasicData) => {

        handleAdd(values);

        form.reset();
    }

    return <TableRow className={cn("", className)}>
        <TableCell colSpan={6} className="p-0">
            <Form {...form} >
                <div>

                    <form className="grid grid-cols-[21fr_21fr_16fr_26fr_10fr] w-full p-2 y border-primary border-t-1 items-center"

                        onSubmit={form.handleSubmit(onSubmit)}
                    >

                        {/* Hidden input */}

                        <input type="number" name="id" value={0} readOnly hidden />



                        {/* Nombre */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="w-full px-2 "
                                >
                                    <FormControl>
                                        <Input placeholder="" {...field} />
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

                        <Button type="submit"
                            className="w-full px-2 py-1">Añadir <PlusIcon /></Button>

                    </form>
                </div>
            </Form>



        </TableCell >


    </TableRow >;
}