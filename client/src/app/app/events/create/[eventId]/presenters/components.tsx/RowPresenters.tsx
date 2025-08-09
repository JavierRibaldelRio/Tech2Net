'use client'
import React, { useState } from 'react';
import Presenter from ":neth4tech/types/Presenter.type";
import { Button } from '@/components/ui/button';

import { XIcon, PencilIcon, Undo2Icon } from 'lucide-react';

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { TextareaSizable } from '@/components/ui/textarea';

interface RowPresentersProps extends React.ComponentProps<"tr"> {

    handleAdd?: () => any;
    handleEdit?: () => any;
    handleRemove?: () => any;
    i: number,
    presenters: Presenter;

}

function RowPresenters({
    className,
    handleAdd,
    handleEdit,
    handleRemove,
    i,
    presenters,
    ...props

}: RowPresentersProps) {

    const [removed, setRemoved] = useState<boolean>(false);

    const remove = () => {
        setRemoved(true);
    };

    const restore = () => {
        setRemoved(false);
    };

    const buttonsNormal = <>
        <Button size="icon" className="size-7" variant="warning">
            <PencilIcon />
        </Button>
        <Button size="icon" className="size-7" variant="destructive" onClick={remove}>
            <XIcon />
        </Button>
    </>;

    const buttonRestore = <Button size="sm" className="text-[11.5px]" onClick={restore}>Restaurar <Undo2Icon /></Button>


    const lineThrough = removed ? " line-through" : ""
    return (
        <TableRow className={'h-[9vh]  border-primary ' + (removed && " bg-red-100 hover:bg-red-200")} >
            <TableCell className={'' + lineThrough}>{i}</TableCell>
            <TableCell className={'whitespace-normal break-words hyphens-auto' + lineThrough}>{presenters.name}</TableCell>
            <TableCell className={'truncate' + lineThrough} title={presenters.email}>{presenters.email}</TableCell>
            <TableCell className={'whitespace-normal break-words hyphens-auto' + lineThrough}>{presenters.organization}</TableCell>
            <TableCell className='text-[10px] h-full'>

                <TextareaSizable
                    className={"text-[10px] [text-align:justify] " + (removed && " border-red-300")} value={presenters.description}
                    readOnly />

            </TableCell>
            <TableCell>
                <div className="flex justify-around w-full">

                    {removed ? buttonRestore : buttonsNormal}

                </div>
            </TableCell>
        </TableRow >
    )


}

export default React.memo(RowPresenters);