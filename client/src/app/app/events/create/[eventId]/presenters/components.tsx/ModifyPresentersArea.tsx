import React, { useState } from 'react';
import Presenter from ":neth4tech/types/Presenter.type"
import { Button } from '@/components/ui/button';
import { TablePresenters } from './TablePresenters';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PresenterBasicData } from ':neth4tech/schemas/presenter.schema';



interface ModifyPresentersAreaProps extends React.ComponentProps<"div"> {

    save?: () => void;
    pPresenters: Presenter[];

}

interface Modifications {

    removedPresenters: number[];
    editedPresenters: Presenter[];
}

let tempCounter = -1;

// Generates a Temp id for new participants, are negative to avoid coinciding with truthfull Id's
const genTempId = (): number => tempCounter--;

export function ModifyPresentersArea({
    className,
    save,
    pPresenters,
    ...props
}: ModifyPresentersAreaProps) {

    const [newPresenters, setNewPresenters] = useState<Record<number, Presenter>>({});
    const [modifications, setModifications] = useState<Modifications>({ removedPresenters: [], editedPresenters: [] });


    // Modifications functions

    const handleAdd = (data: PresenterBasicData) => {

        const id = genTempId();
        data.id = id;

        setNewPresenters(prev => ({ ...prev, [id]: data }));
    }

    const handleRemove = (id: number) => {

        // If it was an old
        if (id > 0) {

            setModifications(prev => ({
                ...prev,
                removedPresenters: [...prev.removedPresenters, id]
            }));
        }

        // If it was a new presenter
        else if (id < 0) {

            setNewPresenters(prev => {
                const { [id]: _omit, ...rest } = prev;
                return rest;
            });
        }
    }

    const handleRestore = (id: number) => {

        // Id must be positive
        if (id < 0) {
            throw new Error("ValueError: id of presenter to restore must be positive");
        }

        setModifications(prev => ({
            ...prev,
            removedPresenters: prev.removedPresenters.filter(val => val !== id)
        }))
    }


    // Transform the data to the backend format and sends it to the parent component
    const handleSave = () => {

        console.log('Guardando ^_^ ');
    }

    return (
        <div className="h-[88vh] grid grid-rows-[85%_10%] gap-4 " {...props}>
            <ScrollArea className='border-primary border-1 rounded-md '>
                <TablePresenters
                    className="table-fixed table-block"
                    handleAdd={handleAdd}
                    handleRemove={handleRemove}
                    handleRestore={handleRestore}
                    presenters={[...pPresenters, ...Object.values(newPresenters)]} />
            </ScrollArea>
            <div className="bg-gray-200">
                <Button onClick={handleSave}>Guardar</Button>
            </div>
        </div>
    )

}