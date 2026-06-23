import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const round2 = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;

export const formatNumber = (x: number) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const formatId = (x: string) => {
  return `..${x.substring(x.length - 4)}`;
};

export const formatDateTime = (
  dateString: Date | string,
  timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "numeric", hour12: true,
    timeZone: timeZone,
  };
  const dateOnlyOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
    timeZone: timeZone,
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short", year: "numeric", day: "numeric",
    timeZone: timeZone,
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", minute: "numeric", hour12: true,
    timeZone: timeZone,
  };
  const formattedDateTime = new Date(dateString).toLocaleString("en-US", dateTimeOptions);
  const formattedDateDay = new Date(dateString).toLocaleString("en-US", dateOnlyOptions);
  const formattedDate = new Date(dateString).toLocaleString("en-US", dateOptions);
  const formattedTime = new Date(dateString).toLocaleString("en-US", timeOptions);
  return { dateTime: formattedDateTime, dateDay: formattedDateDay, dateOnly: formattedDate, timeOnly: formattedTime };
};
