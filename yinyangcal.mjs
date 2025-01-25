import {
  endofmonth,
  elId,elVal,
  changeText,
} from "./tool.mjs";
import {
  LunarDate,
  nDaysLunarMonth,
  LunarLeapMonth,
  totalSolarDays,
  SolarToLunar
} from "./lunar.mjs";
import {
  extractHolidayListInMonth,
  makeHolidaysText,
  getHolidays,
} from "./holidays.mjs";

'use strict';
const DEBUG = false;
// currentDate는 lunar.js에서 옮겨왔음
// 현재 페이지에 Display될 날짜에 관한 변수
let currentDate = new Date();

// 페이지의 테이블에 계산된 달력 데이터를 삽입한다. (달력을 그린다.)
class caldraw_class {
  addBr(el) {
    el.appendChild(document.createElement('br'));
  }
  isToday(today, solar_date, solar_day) {
    let date1 = new Date(today.valueOf());
    date1.setHours(0, 0, 0, 0);
    let date2 = new Date(solar_date.valueOf());
    date2.setDate(solar_day);
    date2.setHours(0, 0, 0, 0);
    return date1.valueOf() == date2.valueOf();
  }
  search_holiday(holidays, solar_month, solar_day) {
    let index = -1;
    for (let hi = 0; hi < holidays.length && index == -1; hi++) {
      if (holidays[hi][0] == solar_month + 1
        && holidays[hi][1] == solar_day) {
        index = hi;
      }
    }
    return index;
  }
  clean_lunar_cells() {
    for (let i = 0; i < 37; i++) {
      let lundiv_id = "l" + i;
      changeText(elId(lundiv_id), "");
      elId(lundiv_id).className = "LunarBlank";
    }
  }
  clean_lunar_cells_1881_0() {
    for (let i = 0; i < 35; i++) {
      let lundiv_id = "l" + i;
      changeText(elId(lundiv_id), "");
    }
    changeText(elId("l35"), "1/1");
    elId("l35").className = "LunarExtra";
    changeText(elId("l36"), "1/2");
    elId("l36").className = "LunarExtra";
  }
  clean_lunar_cells_2051_1() {
    for (let i = 3; i < 13; i++) {
      let lundiv_id = "l" + i;
      changeText(elId(lundiv_id), "12/" + (i + 17));
      elId(lundiv_id).className = "LunarExtra";
      this.addBr(elId(lundiv_id));
    }
    for (let i = 13; i < 37; i++) {
      let lundiv_id = "l" + i;
      document.getElementById(lundiv_id).innerHTML = "";
      changeText(elId(lundiv_id), "");
      elId(lundiv_id).className = "LunarBlank";
      this.addBr(elId(lundiv_id));
    }
  }
  drawCalendar() {
    let week;
    let solar_date = new Date(elVal("txtYear"), elVal("txtMonth") - 1, 1);
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    changeText(elId("curYear"), solar_date.getFullYear());
    changeText(elId("curMonth"), solar_date.getMonth() + 1);

    week = (totalSolarDays(solar_date) + 1) % 7; // 현재 월의 첫번째 날짜의 요일을 계산 (0:월, 1:화, 2:수...)

    // 달력의 첫번째 날짜까지의 빈공란을 그린다.
    for (let i = 0; i < week; i++) {
      changeText(elId("s" + i), "-");
      elId("s" + i).title = "";
      elId("s" + i).className = "SolarBlank";
      changeText(elId("l" + i), "");
    }

    // 양력 날짜들을 각 칸에 삽입한다. if 절이 있는 이유는 일요일, 토요일의 색깔을 틀리게 하기위해.
    let solar_year = solar_date.getFullYear();
    let solar_day = solar_date.getDate();
    let solar_month = solar_date.getMonth();

    let holidays = getHolidays(solar_year, solar_month + 1);

    do {
      let soldiv_num = (solar_day + week - 1);
      let soldiv_id = "s" + soldiv_num;
      elId(soldiv_id).title = "";
      elId(soldiv_id).className = "SolarWeekday";
      changeText(elId(soldiv_id), solar_day);
      if (soldiv_num % 7 == 0) {
        elId(soldiv_id).className = "SolarSunday";
      } else if (soldiv_num % 7 == 6) {
        elId(soldiv_id).className = "SolarSaturday";
      } else {
        ; // pass
      }

      if (this.isToday(today, solar_date, solar_day) == true) {
        elId(soldiv_id).classList.add("SolarToday");
      }

      this.addBr(elId(soldiv_id));

      let hindex;
      hindex = this.search_holiday(holidays, solar_month, solar_day);
      if (hindex != -1) {
        elId(soldiv_id).classList.add("Holiday");
        elId(soldiv_id).title = holidays[hindex][2];
      }

    } while (++solar_day <= endofmonth(solar_year, solar_month+1));

    // 달력 마지막 날짜 이후의 빈공란을 그린다.
    for (let i = week + endofmonth(solar_year, solar_month+1); i < 37; i++) {
      let soldiv_id = "s" + i;
      let lundiv_id = "l" + i;
      changeText(elId(soldiv_id), "-");
      elId(soldiv_id).title = "";
      elId(soldiv_id).className = "SolarBlank";
      changeText(elId(lundiv_id), "");
      elId(lundiv_id).className = "LunarBlank";
    }

    solar_date.setDate(1);

    // 음력 표기 범위를 벗어난 연도에 관한 예외처리.
//양력 데이터만 출력한다.

    solar_month =
solar_date.getMonth();
    if ((solar_year < 1881) ||
(solar_year > 2051)
      || ((solar_year == 2051) && (solar_month > 1))) {
      clean_lunar_cells();
      return;
    }

    if ((solar_year == 1881)
&& (solar_month == 0)) {
      clean_lunar_cells_1881_0();
      return;
    }

    if ((solar_year == 2051) &&
(solar_month == 1)) {
      this.clean_lunar_cells_2051_1();
      return;
    }

    // 첫날짜를 음력으로
//변경시켜 그 이후 날짜들을
//증가시켜 음력날짜를 출력한다.
    // 첫날짜만을 음력으로
//변경하는 이유는
//SolarToLunar()함수가 루프를
//동반한 함수로써
    // 상당히 느리기 때문에,
//각 날짜마다 음력으로 변경시킨다는
//건 낭비이기 때문이다.
    // 따라서 코드는 좀
//복잡해졌지만, 훨씬 빠르다.
    let lunar_date =
new LunarDate();
    lunar_date = SolarToLunar(
solar_date);

    solar_day = solar_date.getDate();
    do {
      let lunar_prefix = "";
      if (lunar_date.isYunMonth) {
        lunar_prefix = "윤";
      }
      let lundiv_id = "l" +
(solar_day + week - 1);      
      changeText(elId(lundiv_id),
        lunar_prefix +
(lunar_date.month + 1) +
"/" + lunar_date.day);
      this.addBr(elId(lundiv_id));
      elId(lundiv_id)
.className = "LunarNormal";

      if (lunar_date.day >=
nDaysLunarMonth(lunar_date)) {
        if (lunar_date.month < 11) {
          if ((lunar_date.month == LunarLeapMonth(lunar_date.year))
            && !lunar_date.isYunMonth) {
            lunar_date.isYunMonth = true;
            lunar_date.day = 1;
          } else {
            lunar_date.month++;
            lunar_date.isYunMonth = false;
            lunar_date.day = 1;
          }
        } else {
          lunar_date.year++;
          lunar_date.month = 0;
          lunar_date.day = 1;
        }
      } else
        lunar_date.day++;
      if (++solar_day >
endofmonth(solar_year, solar_month+1)) {
        break;
      }
    } 
      while (true);
    ListHolidaysInMonth();
    if (DEBUG == true) {
      let o = elId("debug");
      let yun = lunar_date
.isYunMonth ? " 윤" : " ";
      o.innerHTML =
`<p>${lunar_date.year}`+
`.${yun}`+
`${lunar_date.month + 1}/`+
`${lunar_date.day}</p>`;
    }
  }

}
function drawCalendar() {
  let caldraw = new caldraw_class();
  caldraw.drawCalendar();
}


function btOK_onclick() {
  let code, hit;

  code = "0123456789";

  let str = elVal("txtYear");

  for (let i = 1; i < str.length; i++) {
    hit = 0;
    for (let j = 0; j < code.length; j++) {
      if (str.charAt(i) ==
code.charAt(j)) {
        hit = 1;
        break;
      }
    }
    if (!hit) {
      alert(
"연도는 4자리 이하 "+
"숫자여야 합니다.");
      elId("txtYear").value = "";
      elId("txtYear").focus();
      return;
    }
  }

  if (str.length > 4) {
    alert(
"연도는 9999년도 이상 "+
"입력될 수 없습니다.");
    elId("txtYear").value = "";
    elId("txtYear").focus();
    return;
  }

  currentDate.setFullYear(
elVal("txtYear"));
  currentDate.setMonth(
elVal("txtMonth") - 1);

  drawCalendar(currentDate);
}
//////////////////////////////
// 양/음력 만년달력 페이지의
// 이벤트 핸들링 함수들입니다.
// by Albeniz

function addDayCells() {
  let ctable = elId("calTable");
  for (let r=0, cell = 0; r <= 5; r++) {
    let row;
    if (r == 5) {
      row = ctable.rows[
ctable.rows.length - 1];
    } else {
      row = ctable.insertRow(2 + r);
    }
    let lastcol = 6;
    if (r == 5)
      lastcol = 1;
    for (let c = 0;
c <= lastcol;
c++, cell++) {
      let col = row.insertCell(c);
      let soldiv = document
.createElement("div");
      let lundiv = document
.createElement("div");
      col.className = "daycell";
      soldiv.id = "s" + cell;
      lundiv.id = "l" + cell;
      col.appendChild(soldiv);
      col.appendChild(lundiv);
    }
  }
}

function btNextMonth_onclick() {
  if (currentDate.getMonth() < 11) {
    currentDate.setMonth(currentDate.getMonth() + 1);
    elId("txtMonth").value = currentDate.getMonth() + 1;
  } else {
    currentDate.setFullYear(currentDate.getFullYear() + 1);
    elId("txtYear").value = currentDate.getFullYear();
    currentDate.setMonth(0);
    elId("txtMonth").value = currentDate.getMonth() + 1;
  }

  drawCalendar(currentDate);
}


function btNextYear_onclick() {
  currentDate.setFullYear(currentDate.getFullYear() + 1);
  elId("txtYear").value = currentDate.getFullYear();
  drawCalendar(currentDate);
}

function btPrevMonth_onclick() {
  if (currentDate.getMonth() > 0) {
    currentDate.setMonth(currentDate.getMonth() - 1);
    elId("txtMonth").value = currentDate.getMonth() + 1;
  } else {
    currentDate.setFullYear(currentDate.getFullYear() - 1);
    elId("txtYear").value = currentDate.getFullYear();
    currentDate.setMonth(11);
    elId("txtMonth").value = currentDate.getMonth() + 1;
  }
  drawCalendar(currentDate);
}

function btPrevYear_onclick() {

  currentDate.setFullYear(currentDate.getFullYear() - 1);
  elId("txtYear").value = currentDate.getFullYear();

  drawCalendar(currentDate);
}

function ListHolidaysInMonth() {
  function getEl(idname) {
    return document.getElementById(idname);
  }
  function removehtml(el) {
    while (el.hasChildNodes()) {
      el.removeChild(el.firstChild);
    }
  }
  function changeText(idname, text) {
    let el = getEl(idname);
    removehtml(el);
    el.appendChild(document.createTextNode(text));
  }
  let FullYear = currentDate.getFullYear();
  let Month = currentDate.getMonth() + 1;
  let holidays = getHolidays(FullYear);
  let holidaysInMonth = extractHolidayListInMonth(holidays, FullYear, Month);
  let MonthHolidaysText = makeHolidaysText(holidaysInMonth);
  changeText('holiList', MonthHolidaysText);
}

function FillTodayDiv() {
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  let solar_date = new Date(today.valueOf());
  let lunar_date = SolarToLunar(solar_date);
  lunar_date.isYunMonth
  let lunar_prefix = lunar_date
    .isYunMonth ? "윤" : "";
  let Y = solar_date.getFullYear();
  let M = solar_date.getMonth() + 1;
  let D = solar_date.getDate();
  let dow = solar_date.getDay();
  let W = [..."일월화수목금토"][dow];
  let Ll = lunar_prefix;
  let Lm = lunar_date.month + 1;
  let Ld = lunar_date.day
  changeText(
    elId('TSol'),
    `${Y}년 ${M}월 ${D}일`);
  changeText(
    elId('TDow'),
    `${W}요일`);
  changeText(
    elId('TLun'),
    `음력 ${Ll}${Lm}월 ${Ld}일`);
}

// 각 양식필드들에 관한 이벤트 핸들러 함수들
function window_onload() {
  FillTodayDiv();
  addDayCells();
  let today = new Date();
  let dcells = document.querySelectorAll(".daycell");
  for (let ci = 0; ci < dcells.length; ci++) {
    dcells[ci].height = "50";
    dcells[ci].width = "70";
  }
  elId("txtYear").value = today.getFullYear();
  elId("txtMonth").value = today.getMonth() + 1;

  today.setFullYear(elVal("txtYear"));
  today.setMonth(elVal("txtMonth") - 1);
  currentDate = new Date(today);
  drawCalendar(currentDate);
}

window.addEventListener(
  "load",
  function() {
    elId("btNextMonth")
      .addEventListener(
        "click",
        btNextMonth_onclick);
    elId("btOK")
      .addEventListener(
        "click",
        btOK_onclick);
    elId("btNextYear")
      .addEventListener(
        "click",
        btNextYear_onclick);
    elId("btPrevMonth")
      .addEventListener(
        "click",
        btPrevMonth_onclick);
    elId("btPrevYear")
      .addEventListener(
        "click",
        btPrevYear_onclick);
    window_onload();
  }
)
