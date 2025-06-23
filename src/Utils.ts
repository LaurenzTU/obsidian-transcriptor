import { format as formatDateFns } from 'date-fns';

export function getBaseFileName(filePath: string): string {
    const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
    const lastDot = fileName.lastIndexOf(".");
    return lastDot === -1 ? fileName : fileName.substring(0, lastDot);
}

export function formatTimestamp(seconds: number, format: string): string {
    const date = new Date(0);
    date.setSeconds(seconds);
    return formatDateFns(date, format);
}