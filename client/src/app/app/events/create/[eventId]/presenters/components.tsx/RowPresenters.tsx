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
    handleRemove: (id: number) => void;
    handleRestore: (id: number) => void;
    i: number,
    presenter: Presenter;

}

function RowPresenters({
    className,
    handleAdd,
    handleEdit,
    handleRemove,
    handleRestore,
    i,
    presenter,
    ...props

}: RowPresentersProps) {

    const [removed, setRemoved] = useState<boolean>(false);

    const remove = () => {
        handleRemove(presenter.id || 0)
        setRemoved(true);
    };

    const restore = () => {
        handleRestore(presenter.id || 0)
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


    let bgColor = " ";

    if (removed) {
        bgColor = " bg-red-100 hover:bg-red-200"
    }
    else if (presenter.id < 0) {

        bgColor = " bg-green-100 hover:bg-green-200"
    }


    const lineThrough = removed ? " line-through" : ""
    return (
        <TableRow className={'h-[9vh]  border-primary ' + bgColor} >
            <TableCell className={'' + lineThrough}>{i}</TableCell>
            <TableCell className={'whitespace-normal break-words hyphens-auto' + lineThrough}>{presenter.name}</TableCell>
            <TableCell className={'truncate' + lineThrough} title={presenter.email}>{presenter.email}</TableCell>
            <TableCell className={'whitespace-normal break-words hyphens-auto' + lineThrough}>{presenter.organization}</TableCell>
            <TableCell className='text-[10px] h-full'>

                <TextareaSizable
                    className={"text-[10px] [text-align:justify] " + (removed && " border-red-300")} value={presenter.description}
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