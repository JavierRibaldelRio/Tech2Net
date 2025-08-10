import { PresenterBasicData as Presenter } from "../schemas/presenter.schema";

export interface PresentersDataToModify {
    newPresenters: Presenter[];
    editedPresenters: Presenter[];
    removedPresenters: number[];
}