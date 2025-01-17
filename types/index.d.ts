export interface Datepicker {
  modelValue?: [Date, string];
  value?: [Date, string];
  format?: [string, Function];
  id?: string;
  name?: string;
  openDate?: Date;
  minimumView?: string;
  maximumView?: string;
  dayCellContent?: Function;
  fullMonthName?: boolean;
  disabledDates?: Record<string, any>;
  highlighted?: Record<string, any>;
  placeholder?: string;
  range?: boolean;
  inline?: boolean;
  calendarClass?: [string, Record<string, any>];
  inputClass?: [string, Record<string, any>];
  wrapperClass?: [string, Record<string, any>];
  mondayFirst?: boolean;
  clearButton?: boolean;
  clearButtonIcon?: string;
  calendarButton?: boolean;
  calendarButtonIcon?: string;
  calendarButtonIconContent?: string;
  initialView?: string;
  disabled?: boolean;
  required?: boolean;
  typeable?: boolean;
  useUtc?: boolean;
  preventDisableDateSelection?: boolean;
  iconColor?: string;
  iconWidth?: string;
  iconHeight?: string;
  addBootstrapClass?: boolean;
}
