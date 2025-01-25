'use strict';

import {
  LunarDate,
  //nDaysYear,
  nDaysMonth,
  YunMonth,
  //totalDays,
  SolarToLunar
} from "./lunar.mjs";
export {
  getBuddhaDay,
  hasLunarDate,
  getSeolChu,
  getHolidaysSC,
  extractHolidayListInMonth,
  makeHolidaysText,
  getHolidays

};

// Requirements:
//
//      lunar.js

// 음력 4월 8일 석가탄신일
function getBuddhaDay(nowYear, nowMonth) {
  let monthTable = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let monthIndex = nowMonth - 1;
  let solar_year = nowYear;
  let solar_month = monthIndex;
  let solar_day = 1;

  // 음력 표기 범위를 벗어난 년도에 관한 예외처리. 양력 데이터만 출력한다.
  if ((solar_year < 1881) || (solar_year > 2051)
    || ((solar_year == 2051) && (solar_month > 1))) {
    return -1;
  }

  if ((solar_year == 1881) && (solar_month == 0)) {
    return -1;
  }

  if ((solar_year == 2051) && (solar_month == 1)) {
    return -1;
  }

  let prevYear = solar_year - 1;
  if (((prevYear % 4 == 0) && (prevYear % 100 != 0)) || (prevYear % 400 == 0))
    monthTable[1] = 29;
  let lunar_date = new LunarDate();
  let solar_date = new Date(solar_year, solar_month, 1);
  lunar_date = SolarToLunar(solar_date);

  do {
    if (lunar_date.isYunMonth) {
      //pass
    }
    else {
      if (lunar_date.month == 3 && lunar_date.day == 8) {
        return solar_day;
      }
    }
    if (lunar_date.day >= nDaysMonth(lunar_date)) {
      if (lunar_date.month < 11) {
        if ((lunar_date.month == YunMonth(lunar_date.year))
          && !lunar_date.isYunMonth) {
          lunar_date.isYunMonth = true;
          lunar_date.day = 1;
        }
        else {
          lunar_date.month++;
          lunar_date.isYunMonth = false;
          lunar_date.day = 1;
        }
      }
      else {
        lunar_date.year++;
        lunar_date.month = 0;
        lunar_date.day = 1;
      }
    }
    else
      lunar_date.day++;
    if (++solar_day > monthTable[solar_month]) {
      break;
    }
  }
  while (true);
  return -1;
}

function hasLunarDate(solar_date) {
  if (solar_date == null) {
    return false;
  }
  let Y = solar_date.getFullYear();
  let M = solar_date.getMonth() + 1;
  if ((Y < 1881) || (Y > 2051) || ((Y == 2051) && (M > 2))) {
    return false;
  }
  return true;
}
function getSeolChu(nowYear) {

  let Year = nowYear;
  let SeolDate = null;
  let ChuDate = null;
  let isSeolFound = false;
  let isChuFound = false;
  for (let Month = 1; Month <= 12 && (!isSeolFound || !isChuFound); Month++) {
    let FirstDay = 1;
    let LastDay;
    let SolarDate;
    SolarDate = new Date(Year, Month - 1, FirstDay);
    let EndDate = new Date(Year, Month, 0);
    LastDay = EndDate.getDate();
    if (!hasLunarDate(SolarDate))
      break;
    let lunar_date = SolarToLunar(SolarDate);
    if (lunar_date == null)
      break;
    for (let Day = 1; Day <= LastDay && (!isSeolFound || !isChuFound); Day++) {
      if (lunar_date.month + 1 == 1 && lunar_date.day == 1) {
        SeolDate = new Date(Year, Month - 1, Day);
        isSeolFound = true;
        if (isChuFound) {
          break;
        }
      }
      if (lunar_date.month + 1 == 8 && lunar_date.day == 15) {
        ChuDate = new Date(Year, Month - 1, Day);
        isChuFound = true;
        if (isSeolFound) {
          break;
        }
      }
      if (lunar_date.day >= nDaysMonth(lunar_date)) {
        if (lunar_date.month < 11) {
          if ((lunar_date.month == YunMonth(lunar_date.year)) && !lunar_date.isYunMonth) {
            lunar_date.isYunMonth = true;
            lunar_date.day = 1;
          }
          else {
            lunar_date.month++;
            lunar_date.isYunMonth = false;
            lunar_date.day = 1;
          }
        }
        else {
          lunar_date.year++;
          lunar_date.month = 0;
          lunar_date.day = 1;
        }
      }
      else
        lunar_date.day++;
    }
  }
  return [SeolDate, ChuDate];
}
class Holi {
  constructor(m, d, desc) {
    this.m = m;
    this.d = d;
    this.desc = desc;
  }
}
function a2holi(a) {
  return new Holi(a[0], a[1], a[2]);
}
function getHolidaysSC(FullYear, Month, inSeolDate, inChuDate) {

  function BeforeAfter(SeolDate, holis, desc) {
    if (SeolDate != null) {
      let hMon = SeolDate.getMonth() + 1;
      let hDay = SeolDate.getDate();
      let hDesc = desc;
      holis.push([hMon, hDay, hDesc]);

      let Before = new Date(SeolDate.valueOf() - 86400000);
      let After = new Date(parseInt(SeolDate.valueOf()) + 86400000);

      if (Before.getFullYear() == SeolDate.getFullYear()) {
        let hMon = parseInt(Before.getMonth()) + 1;
        let hDay = Before.getDate();
        let hDesc = desc + ' 전날';
        holis.push([hMon, hDay, hDesc]);
      }
      if (After.getFullYear() == SeolDate.getFullYear()) {
        let hMon = parseInt(After.getMonth()) + 1;
        let hDay = After.getDate();
        let hDesc = desc + ' 다음날';
        holis.push([hMon, hDay, hDesc]);
      }
    }
  }

  let allholis2;
  {
    let holis = [];
    let subs = [];
    let defaultholis = [
      [1, 1, "신정"],
      [3, 1, "3·1절"],
      [5, 5, "어린이날"],
      [6, 6, "현충일"],
      [8, 15, "광복절"],
      [10, 3, "개천절"],
      [10, 9, "한글날"],
      [12, 25, "성탄절"]];

    for (let m = 1; m <= 12; m++) {
      let buddha = getBuddhaDay(FullYear, m);
      if (buddha >= 1) {
        defaultholis.push([m, buddha, "석가탄신일"]);
        break;
      }
    }

    for (let i = 0; i < defaultholis.length; i++) {
      holis.push(defaultholis[i]);
    }

    {
      let SeolDate = inSeolDate;
      if (SeolDate != null) {
        SeolDate = new Date(FullYear, SeolDate.getMonth(), SeolDate.getDate());
        BeforeAfter(SeolDate, holis, '설날');
      }
      let ChuDate = inChuDate;
      if (ChuDate != null) {
        ChuDate = new Date(FullYear, ChuDate.getMonth(), ChuDate.getDate());
        BeforeAfter(ChuDate, holis, '추석');
      }
    }
    holis.sort(function(a, b) {
      let ha = a2holi(a), hb = a2holi(b);
      return ha.m != hb.m ? ha.m - ha.m : ha.d - hb.d;
    }
    );
    {
//관공서의 공휴일에 관한 규정 (2023. 5. 4., 일부개정)      
      let isTarget = function (desc) {
        let days = ["3·1절",  "광복절", "개천절", "한글날", "설날 전날", "설날", "설날 다음날", "추석 전날", "추석", "추석 다음날", "석가탄신일","어린이날", "성탄절",];
        let dfound = false;
        for (let di = 0; di < days.length && !dfound; di++) {
          if (days[di] == desc) {
            dfound = true;
            break;
          }
        }
        return dfound;
      };
      let pivotYear = FullYear;
      for (let pivot = 0; pivot < holis.length; pivot++) {
        let pivotholi = a2holi(holis[pivot]);
        let pivotMonth = pivotholi.m;
        let pivotDay = pivotholi.d;
        let pivotDesc = pivotholi.desc;
        let pivotDate = new Date(pivotYear, pivotMonth - 1, pivotDay);
        if (isTarget(pivotDesc)) {
          let overlapped = false;
          {
            let holiDate = new Date(FullYear, pivotMonth - 1, pivotDay);
            if (holiDate.getDay() == 0) { //Sunday
              overlapped = true;
            }
            if (!overlapped) {
              if ( ["3·1절", "광복절",'개천절',"한글날", "석가탄신일",'어린이날', "성탄절", ].includes(pivotDesc)) {
                if (holiDate.getDay() == 6) { //Saturday
                  overlapped = true;
                }
              }
            }
            if (!overlapped) {
              for (let hj = 0; hj < holis.length; hj++) {
                if (pivot == hj)
                  continue;
                let hjHoli = a2holi(holis[hj]);
                let hlMonth = hjHoli.m;
                let hlDay = hjHoli.d;

                if (hlMonth == pivotMonth && hlDay == pivotDay) {
                  overlapped = true;
                  break;
                }
              }
            }
          }
          if (overlapped) {
            let nextDate = new Date(pivotDate.valueOf() + 86400000);
            do {
              if (nextDate.getFullYear() != pivotYear) {
                break;
              }
              if (nextDate.getDay() != 0 && nextDate.getDay() != 6) { // norml weekdays
                let isOtherHoli = false;
                for (let hj = 0; hj < holis.length && !isOtherHoli; hj++) {
                  let hjHoli = a2holi(holis[hj]);
                  let hlMonth = hjHoli.m;
                  let hlDay = holis[hj][1];
                  if (pivotMonth == hlMonth && pivotDay == hlDay)
                    continue;
                  if (hlMonth == parseInt(nextDate.getMonth()) + 1 && hlDay == nextDate.getDate()) {
                    isOtherHoli = true;
                    break;
                  }
                }
                let hMon = parseInt(nextDate.getMonth()) + 1;
                let hDay = nextDate.getDate();
                let hDesc = '대체 공휴일';
                if (!isOtherHoli) {
                  subs.push([hMon, hDay, hDesc]);
                  break;
                }
              }
              nextDate = new Date(nextDate.valueOf() + 86400000);
            }
            while (true);
          }
        }
      }
    }

    let allholis = [];
    for (let i = 0; i < holis.length; i++) {
      allholis.push(holis[i]);
    }
    for (let i = 0; i < subs.length; i++) {
      allholis.push(subs[i]);
    }
    allholis2 = [];
    for (let i = 0; i < allholis.length; i++) {
      let found = false;
      let ahMonth = allholis[i][0];
      let ahDay = allholis[i][1];
      let ahDesc = allholis[i][2];
      for (let j = 0; j < allholis2.length; j++) {
        let allh2Month = allholis2[j][0];
        let allh2Day = allholis2[j][1];
        if (allh2Month == ahMonth && allh2Day == ahDay) {
          let dlist = ahDesc.split(',');
          let dupdesc = false;
          let descElem = '';
          for (let di = 0; di < dlist.length && !dupdesc; di++) {
            for (let si = 0; si < dlist[di].length; si++) {
              if (dlist[di][si] != ' ') {
                descElem += dlist[di][si];
              }
            }
            if (descElem == ahDesc) {
              dupdesc = true;
            }
          }
          if (!dupdesc)
            allholis2[j][2] += ',' + ahDesc;
          found = true;
        }
      }
      if (!found) {
        allholis2.push(allholis[i]);
      }
    }
    allholis2.sort(function(a, b) {
      let ha = a2holi(a), hb = a2holi(b);
      return ha.m - hb.m ? ha.m - hb.m : ha.d - hb.d;
    }
    );
  }
  return allholis2;
}
function extractHolidayListInMonth(holidays, FullYear, Month) {
  let monthHolis = [];
  if (holidays.length) {
    let endDate = null;
    let lastday;
    endDate = new Date(FullYear, parseInt(Month), 0);
    lastday = endDate.getDate();
    let m = Month;
    for (let d = 1; d <= lastday; d++) {
      for (let i = 0; i < holidays.length; i++) {
        if (holidays[i][0] == m && holidays[i][1] == d) {
          monthHolis.push(holidays[i]);
          break;
        }
      }
    }
  }
  return monthHolis;
}

function makeHolidaysText(holidays, FullYear, Month) {
  let t = ''
  for (let hi = 0; hi < holidays.length; hi++) {
    let h = a2holi(holidays[hi]);
    t += h.m + '월 ' + h.d + '일 : ' + h.desc + '\n';
  }
  return t;
}

function getHolidays(FullYear, Month) {
  let SeolChu = getSeolChu(FullYear);
  let inSeolDate = SeolChu[0];
  let inChuDate = SeolChu[1];
  return getHolidaysSC(FullYear, Month, inSeolDate, inChuDate);
}

