'use client'
import React, { useState } from 'react';
import { PresenterBasicData as Presenter } from ':neth4tech/schemas/presenter.schema';

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
import { FormPresenter } from './FormPresenter';
import { is } from 'date-fns/locale';

enum EditionStatus {

    NOT_EDITED = 0,
    EDITED = 1,
    ON_EDITION = 2,
}

interface RowPresentersProps extends React.ComponentProps<"tr"> {

    handleEdit: (data: Presenter) => void;
    handleRemove: (id: number) => void;
    handleRestore: (id: number) => void;
    i: number,
    presenter: Presenter;

}


function RowPresenters({
    className,
    handleEdit,
    handleRemove,
    handleRestore,
    i,
    presenter: pPresenter,
    ...props

}: RowPresentersProps) {

    const [removed, setRemoved] = useState<boolean>(false);

    const [presenter, setPresenter] = useState<Presenter>(pPresenter);

    // Edition status 2 = onedition, 1 = edited; 0 not edited
    const [editionStatus, setEditionStatus] = useState<EditionStatus>(EditionStatus.NOT_EDITED);
    const [isEdited, setIsEdited] = useState<boolean>(false);

    const enterEditMode = () => setEditionStatus(EditionStatus.ON_EDITION);

    const leaveEditMode = () => {
        if (isEdited) {
            setEditionStatus(EditionStatus.EDITED);
        }
        else {
            setEditionStatus(EditionStatus.NOT_EDITED);
        }


    };

    const remove = () => {
        handleRemove(pPresenter.id);
        setRemoved(true);
    };

    // Only will be used if it was a previously added presenter
    const restore = () => {
        handleRestore(pPresenter.id);
        setRemoved(false);
    };

    const edit = (data: Presenter) => {

        // Ensures that the id has not been changed
        const presenter = data;
        presenter.id = pPresenter.id;
        console.log('obj :>> ');
        // Update status
        setEditionStatus(EditionStatus.EDITED);
        setIsEdited(true);
        setPresenter(presenter);

        handleEdit(presenter);

    };



    // Edition mode
    if (editionStatus == EditionStatus.ON_EDITION) {

        return <FormPresenter
            handleAction={edit}
            handleReset={leaveEditMode}
            isEditMode={true}
            presenter={presenter}
            className='h-[9vh] border-primary'

        />
    }

    // Usual
    else {

        let actionButtons = <>
            <Button size="icon" className="size-7" variant="warning" onClick={enterEditMode}>
                <PencilIcon />
            </Button>
            <Button size="icon" className="size-7" variant="destructive" onClick={remove}>
                <XIcon />
            </Button>
        </>;

        let bgColor = "";
        let borderColor = ""
        let lineThrough = "";

        // Removed
        if (removed) {
            actionButtons = <Button size="sm" className="text-[11.5px]" onClick={restore}>Restaurar <Undo2Icon /></Button>;
            bgColor = " bg-red-100 hover:bg-red-200";
            borderColor = " border-red-300"
            lineThrough = " line-through";
        }
        // New
        else if (presenter.id < 0) {

            bgColor = "bg-green-100 hover:bg-green-200";
            borderColor = " border-green-300";
        }
        // Edited

        else if (isEdited) {

            bgColor = "bg-yellow-100 hover:bg-yellow-200";
            borderColor = " border-yellow-300";
        }

        return (
            <TableRow className={'h-[9vh]  border-primary ' + bgColor} >
                <TableCell className={'' + lineThrough}>{i}</TableCell>
                <TableCell className={'whitespace-normal break-words hyphens-auto' + lineThrough}>{presenter.name}</TableCell>
                <TableCell className={'truncate' + lineThrough} title={presenter.email}>{presenter.email}</TableCell>
                <TableCell className={'whitespace-normal break-words hyphens-auto' + lineThrough}>{presenter.organization}</TableCell>
                <TableCell className='text-[10px] h-full'>

                    <TextareaSizable
                        className={"text-[10px] [text-align:justify] " + borderColor} value={presenter.description}
                        readOnly />

                </TableCell>
                <TableCell>
                    <div className="flex justify-around w-full">
                        {actionButtons}
                    </div>
                </TableCell>
            </TableRow >
        )
    }

}

export default React.memo(RowPresenters);