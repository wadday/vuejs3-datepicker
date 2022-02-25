const monthTypes = {
  PREVIOUS: 'previous',
  CURRENT: 'current',
  NEXT: 'next',
};

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = (number: number, padCharacter = '0'): any => {
  return number < 10 ? padCharacter + number : number;
};

const iso8601 = (date: Date): string => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const dateMapper = (dateCount: number) => (mapper: any): any => {
  return Array(dateCount)
    .fill(0)
    .map(mapper);
};

const getLastDate = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayIndex = (date: Date): number => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toDateString().substring(0, 3);
  return weekDays.indexOf(firstDay);
};

const getPreviousDates = (currentDate: Date): any => {
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const prevMonth = Math.min(month - 1, 11);
  const prevDate = new Date(year, prevMonth);

  const prevMonthLastDate = getLastDate(prevDate);
  const firstDayIndex = getFirstDayIndex(currentDate);
  const start = prevMonthLastDate - firstDayIndex + 1;
  const length = prevMonthLastDate - start + 1;

  return dateMapper(length)((_: any, i: number) => {
    const date = start + i;
    prevDate.setDate(date);
    return {
      date,
      sun:
        new Date(prevDate)
          .toDateString()
          .substring(0, 3)
          .toLowerCase() === 'sun',
      sat:
        new Date(prevDate)
          .toDateString()
          .substring(0, 3)
          .toLowerCase() === 'sat',
      iso: iso8601(prevDate),
    };
  });
};

const getCurrentDates = (currentDate: Date): any => {
  const lastDate = getLastDate(currentDate);
  return dateMapper(lastDate)((_: any, i: any) => {
    const date = i + 1;
    currentDate.setDate(date);
    return {
      date,
      sun:
        new Date(currentDate)
          .toDateString()
          .substring(0, 3)
          .toLowerCase() === 'sun',
      sat:
        new Date(currentDate)
          .toDateString()
          .substring(0, 3)
          .toLowerCase() === 'sat',
      iso: iso8601(currentDate),
    };
  });
};

const getNextDates = (currentDate: Date, daysSoFar: number): any => {
  // 7 days * 6 rows (in a calendar)
  const totalDays = 42;
  const length = totalDays - daysSoFar;

  const nextMonth = currentDate.getMonth() + 1 === 12 ? 0 : currentDate.getMonth() + 1;
  const nextYear = nextMonth === 0 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
  const nextDate = new Date(nextYear, nextMonth);

  return dateMapper(length)((_: any, i: number) => {
    const date = i + 1;
    nextDate.setDate(date);
    return {
      date,
      sun:
        new Date(nextDate)
          .toDateString()
          .substring(0, 3)
          .toLowerCase() === 'sun',
      sat:
        new Date(nextDate)
          .toDateString()
          .substring(0, 3)
          .toLowerCase() === 'sat',
      iso: iso8601(nextDate),
    };
  });
};

const getDates = (date: Date): any => {
  let result: any = [];

  const previousDates = getPreviousDates(date).map((item: any) => ({
    date: item.date,
    iso: item.iso,
    sun: item.sun,
    sat: item.sat,
    type: monthTypes.PREVIOUS,
  }));

  const currentDates = getCurrentDates(date).map((item: any) => ({
    date: item.date,
    iso: item.iso,
    sun: item.sun,
    sat: item.sat,
    type: monthTypes.CURRENT,
  }));

  result = result.concat(previousDates).concat(currentDates);
  const nextDates = getNextDates(date, result.length).map((item: any) => ({
    date: item.date,
    iso: item.iso,
    sun: item.sun,
    sat: item.sat,
    type: monthTypes.NEXT,
  }));

  return result.concat(nextDates);
};

const chunk = (dates: Array<[]>, size: number): any => {
  let i = 0;
  const result = [];
  const tempArr = [...dates];
  while (i < dates.length) {
    const subArray = [];
    // eslint-disable-next-line no-plusplus
    for (let j = 0; j < size; j++) {
      if (tempArr.length) subArray.push(tempArr.shift());
    }
    result[result.length] = subArray;
    i += size;
  }
  return result;
};

export {
  monthTypes,
  iso8601,
  getLastDate,
  getFirstDayIndex,
  getCurrentDates,
  getPreviousDates,
  getNextDates,
  getDates,
  weekDays,
  chunk,
};
