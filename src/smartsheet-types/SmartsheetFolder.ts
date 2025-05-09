import {SmartsheetSheet} from "./SmartsheetSheet.js";

export interface SmartsheetFolder {
    id: number;
    favorite: boolean;
    name: string;
    permalink: string;
    folders: SmartsheetFolder[]; // recursive type
    sheets: SmartsheetSheet[];
}
