import {SmartsheetSheet} from "./SmartsheetSheet.js";
import {SmartsheetFolder} from "./SmartsheetFolder.js";

export interface SmartsheetWorkspace {
    id: number;
    favorite: boolean;
    name: string;
    permalink: string;
    folders: SmartsheetFolder[];
    sheets: SmartsheetSheet[];
}
