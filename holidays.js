// Requirements:
//  
//      lunar.js
'use strict';
function hasLunarDate(solar_date){
    if(solar_date==null){
        return false;
    }
    let Y=solar_date.getFullYear();
    let M=solar_date.getMonth()+1;
    if ((Y < 1881) || (Y > 2051) || ((Y == 2051) && (M > 2))) {
            return false;
    }
    return true;
}
function getSeolChu(nowYear){    
    
    let Year=nowYear;
    let SeolDate=null;
    let ChuDate=null;
    let isSeolFound=false;
    let isChuFound=false;    
    for(let Month=1;Month<=12 && (!isSeolFound || !isChuFound);Month++){        
        let FirstDay=1;
        let LastDay;
        let SolarDate;
        SolarDate=new Date(Year,Month-1,FirstDay);
        let EndDate=new Date(Year,Month,0);
        LastDay=EndDate.getDate();
        if(!hasLunarDate(SolarDate))
            break;
        let lunar_date=SolarToLunar(SolarDate);
        if(lunar_date==null) break;
        for(let Day=1;Day<=LastDay && (!isSeolFound|| !isChuFound);Day++){
            if(lunar_date.month+1 == 1 && lunar_date.day == 1){
                SeolDate=new Date(Year,Month-1,Day);
                isSeolFound=true;
                if(isChuFound){
                    break;
                }
            }
            if(lunar_date.month+1 == 8 && lunar_date.day == 15){
                ChuDate=new Date(Year,Month-1,Day);
                isChuFound=true;
                if(isSeolFound){
                    break;
                }
            }
            if (lunar_date.day >= nDaysMonth(lunar_date)) {
                if (lunar_date.month < 11) {
                    if ((lunar_date.month == YunMonth(lunar_date.year)) && !lunar_date.isYunMonth) {
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
            } else lunar_date.day++;
        }
    } 
    return new Array(SeolDate,ChuDate);
}

function getHolidaysSC(FullYear,Month,inSeolDate,inChuDate){
    function BeforeAfter(SeolDate,holis,desc){
        if(SeolDate!=null){
            let hMon=SeolDate.getMonth()+1;
            let hDay=SeolDate.getDate();
            let hDesc=desc;
            holis.push([hMon,hDay,hDesc]);
            
            let Before=new Date(SeolDate.valueOf()-86400000);
            let After=new Date(parseInt(SeolDate.valueOf())+86400000);

            if(Before.getFullYear()==SeolDate.getFullYear()){
                let hMon=parseInt(Before.getMonth())+1;
                let hDay=Before.getDate();
                let hDesc=desc+' 전날';
                holis.push([hMon,hDay,hDesc]);
            }        
            if(After.getFullYear()==SeolDate.getFullYear()){
                let hMon=parseInt(After.getMonth())+1;
                let hDay=After.getDate();
                let hDesc=desc+' 다음날';
                holis.push([hMon,hDay,hDesc]);
            }
        }
    }

    let allholis2;
    {
      let i,j,hj;
      let defaultholis=new Array(
      [ 1, 1,"신정"],
      [ 3, 1,"3·1절"],
      [ 5, 3,"석가탄신일"],
      [ 5, 5,"어린이날"],
      [ 6, 6,"현충일"],
      [ 8,15,"광복절"],
      [10, 3,"개천절"],
      [10, 9,"한글날"],
      [12,25,"성탄절"]
      );
      let holis=new Array();
      let subs=new Array();
      for(i=0;i<defaultholis.length;i++){
          holis.push(defaultholis[i]);
      }      
      {          
          let SeolDate = inSeolDate;
          if(SeolDate!=null){
            SeolDate=new Date(FullYear,SeolDate.getMonth(),SeolDate.getDate());
            BeforeAfter(SeolDate,holis,'설날');
          }
          let ChuDate = inChuDate;
          if(ChuDate!=null){
            ChuDate=new Date(FullYear,ChuDate.getMonth(),ChuDate.getDate());
            BeforeAfter(ChuDate,holis,'추석');
          }
      }
      holis.sort(function(a,b){return a[0]!=b[0]?a[0]-b[0]:a[1]-b[1];});
      {
          function isTarget(desc){
            let days=["어린이날","설날 전날", "설날", "설날 다음날","추석 전날","추석","추석 다음날"];
            let dfound=false;
            for(let di=0;di<days.length && !dfound;di++){
                if(days[di]==desc){
                    dfound=true;
                    break;
                }                        
            }
            return dfound;
         };
          let pivotYear=FullYear;          
          for(let pivot=0;pivot<holis.length;pivot++){
              let pivotMonth=holis[pivot][0];
              let pivotDay=holis[pivot][1];
              let pivotDesc=holis[pivot][2];
              let pivotDate=new Date(pivotYear,pivotMonth-1,pivotDay); 
              if(isTarget(pivotDesc)){
                  let overlapped=false;
                  {
                      let holiDate=new Date(FullYear,pivotMonth-1,pivotDay);                  
                      if(holiDate.getDay()==0){ //Sunday
                          overlapped=true;
                      }
                      if(!overlapped){
                          if(pivotDesc=='어린이날'){
                              if(holiDate.getDay()==6){ //Saturday
                                  overlapped=true;
                              }
                          }
                      }
                      if(!overlapped){
                          for(let hj=0;hj<holis.length;hj++){
                              if(pivot==hj) continue;
                              let hlMonth=holis[hj][0]
                              let hlDay=holis[hj][1];
                              let hlDesc=holis[hj][2];
                              if(hlMonth==pivotMonth && hlDay==pivotDay){
                                  overlapped=true;
                                  break;
                              }
                          }
                      }
                  }
                  if(overlapped){
                      let nextDate=new Date(pivotDate.valueOf()+86400000);                      
                      do{ 
                          if(nextDate.getFullYear()!=pivotYear){
                            break;
                          }
                          if(nextDate.getDay()!=0 && nextDate.getDay()!=6){// norml weekdays
                            let isOtherHoli=false;
                            for(let hj=0;hj<holis.length && !isOtherHoli;hj++){
                                  let hlMonth=holis[hj][0]
                                  let hlDay=holis[hj][1];
                                  if(pivotMonth==hlMonth && pivotDay==hlDay) continue;                             
                                  if(hlMonth==parseInt(nextDate.getMonth())+1 && hlDay ==nextDate.getDate()){
                                      isOtherHoli=true;
                                      break;
                                  }
                            }     
                            let hMon=parseInt(nextDate.getMonth())+1;
                            let hDay=nextDate.getDate();
                            let hDesc='대체 공휴일';                            
                            if(!isOtherHoli)
                            {
                                subs.push(new Array(hMon,hDay,hDesc));
                                break;
                            }
                          }                 
                          nextDate=new Date(nextDate.valueOf()+86400000);
                      }while(true);
                  }
              }
          }
      }
      
      let allholis=new Array();
      for(i=0;i<holis.length;i++){
          allholis.push(holis[i]);
      }
      for(i=0;i<subs.length;i++){
          allholis.push(subs[i]);
      }          
      allholis2=new Array();
      for(i=0;i<allholis.length;i++){
          let found=false;
          let ahMonth=allholis[i][0];
          let ahDay=allholis[i][1];
          let ahDesc=allholis[i][2];
          for(let j=0;j<allholis2.length;j++){
              let allh2Month=allholis2[j][0];
              let allh2Day=allholis2[j][1];
              if(allh2Month==ahMonth && allh2Day==ahDay){
                  let dlist=ahDesc.split(',');
                  let dupdesc=false;
                  let descElem='';
                  for(let di=0;di<dlist.length && !dupdesc;di++){
                    for(let si=0;si<dlist[di].length;si++){
                        if(dlist[di][si]!=' '){
                            descElem+=dlist[di][si];
                        }
                    }
                    if(descElem==ahDesc){
                        dupdesc=true;
                    }
                  }
                  if(!dupdesc)
                    allholis2[j][2]+=','+ahDesc;
                  found=true;
              } 
          }
          if(!found){
              allholis2.push(allholis[i]);
          }
      }
      allholis2.sort(function(a,b){return a[0]-b[0]?a[0]-b[0]:a[1]-b[1];});
    }
    return allholis2;
}
function extractHolidayListInMonth(holidays,FullYear,Month){
    let monthHolis=new Array();
    if(holidays.length){
        let endDate=null;
        let lastday;
        endDate=new Date(FullYear,parseInt(Month),0);
        lastday=endDate.getDate();
        let m=Month;
        for(let d=1;d<=lastday;d++){
            for(let i=0;i<holidays.length;i++){
              if(holidays[i][0]==m && holidays[i][1]==d){
                  monthHolis.push(holidays[i]);
                  break;
              }
            }
        }        
    }
    return monthHolis;
}

function makeHolidaysText(holidays,FullYear,Month){
    let t=''
    for(let hi=0;hi<holidays.length;hi++){
        t+=holidays[hi][0]+'월 '+holidays[hi][1]+'일 : '+holidays[hi][2]+'\n';                      
    }
    return t;
}

function getHolidays(FullYear,Month){
    let SeolChu=getSeolChu(FullYear);
    let inSeolDate=SeolChu[0];
    let inChuDate=SeolChu[1];
    return getHolidaysSC(FullYear,Month,inSeolDate,inChuDate);
}