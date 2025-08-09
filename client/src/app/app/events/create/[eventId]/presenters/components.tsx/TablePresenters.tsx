"use client"
import Presenter from ":neth4tech/types/Presenter.type"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import RowPresenters from "./RowPresenters";
import { FormPresenter } from "./FormPresenter";
import { PresenterBasicData } from ':neth4tech/schemas/presenter.schema';


interface TablePresentersProps extends React.ComponentProps<"table"> {

    handleAdd: (data: PresenterBasicData) => void;
    handleEdit?: () => any;
    handleRemove: (id: number) => void;
    handleRestore: (id: number) => void;

    presenters: Presenter[];
}

export function TablePresenters({
    className,
    handleAdd,
    handleEdit,
    handleRemove,
    handleRestore,
    presenters,
    ...props

}: TablePresentersProps) {

    // Content of the table
    const tableContent = presenters.map((p, i) => <RowPresenters
        presenter={p}
        i={i + 1}
        key={p.id}
        handleRemove={handleRemove}
        handleRestore={handleRestore}
    />);

    return (
        <Table className={className}>

            <TableHeader className="sticky top-0 bg-secondary shadow-[0_2px_10px_rgba(0,0,0,0.0.4)]">
                <TableRow  >
                    <TableHead className="w-[4%]">Nº</TableHead>
                    <TableHead className="w-[19%] truncate">Nombre</TableHead>
                    <TableHead className="w-[20%] whitespace-normal break-words hyphens-auto">Correo electrónico</TableHead>
                    <TableHead className="w-[15%] truncate">Organización</TableHead>
                    <TableHead className="w-[25%] truncate">Descripción</TableHead>
                    <TableHead className="w-[12%]"></TableHead>
                </TableRow>
            </TableHeader>

            <TableBody className="" >
                {tableContent}
            </TableBody>

            <TableFooter className="sticky bottom-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.0.4)]">
                <FormPresenter
                    handleAdd={handleAdd}
                />
            </TableFooter>

        </Table >
    )


}