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

    newPresenters: Presenter[];
    removedPresenters: number[];
    editedPresenters: Presenter[];
}

export function ModifyPresentersArea({
    className,
    save,
    pPresenters,
    ...props
}: ModifyPresentersAreaProps) {

    // pPresenter will never change
    const [presenters, setPresenters] = useState<Presenter[]>(pPresenters);

    const [modifications, setModifications] = useState<Modifications>({ newPresenters: [], removedPresenters: [], editedPresenters: [] });


    // Modifications functions

    const handleAdd = (data: PresenterBasicData) => {


        setModifications(prev => ({
            ...prev,
            newPresenters: [...prev.newPresenters, data]
        }));
    }


    // Transform the data to the backend format and sends it to the parent component
    const handleSave = () => {

        console.log('Guardando ^_^ ');
    }

    return (
        <div className="h-[88vh] grid grid-rows-[85%_10%] gap-4 " {...props}>
            <ScrollArea className='border-primary border-1 rounded-md '>
                <TablePresenters
                    className="table-fixed table-block "
                    handleAdd={handleAdd}

                    presenters={[...presenters, ...modifications.newPresenters]} />
            </ScrollArea>
            <div className="bg-gray-200">
                <Button onClick={handleSave}>Guardar</Button>
            </div>
        </div>
    )

}