import { ReactElement } from "react";

export default interface AlertState {

    hidden: boolean
    text: string | ReactElement[];
}