
const data = require("./data.json")

function getWeek(da) {

  d = new Date(da)
  d.setDate(d.getDate() - d.getDay() +1)
  return d.getFullYear().toString() + "-" + (1+d.getMonth()).toString() + "-" + d.getDate().toString()
}

var res={}
let weekNumber = 0

const startWeek  = '2016-10-3'
let delta = 0 
for(var x in data) {
  const i=data[x]
  let w = getWeek(i.date)
  if(!res[w]) {
    if(w==startWeek) {
      weekNumber=1
    } else {
      if(weekNumber) {
        weekNumber++
      }
    }
    res[w]= {}
    res[w]["weekNumber"]=weekNumber
    res[w]["total"]={}
    res[w]["total"]["red"]=0
    res[w]["total"]["green"]=0
    res[w]["total"]["all"]=0
    res[w]["totalSamples"]=0
  }
  delta = 0 
  if(i.behaviors) {
    for(var b in i.behaviors) {
      let caption = i.behaviors[b].caption
      if(!res[w][caption]) {
        res[w][caption]={};
        res[w][caption]["red"]=0;
        res[w][caption]["green"]=0;
        res[w][caption]["totalSamples"]=0;
      }
      if(i.behaviors[b].value!=0) {
        res[w][caption]["totalSamples"] = ( res[w][caption]["totalSamples"] || 0)  + 1;
        delta = 1
      }
      if(i.behaviors[b].value<0) {
        res[w]["total"]["red"] += i.behaviors[b].value
        res[w][caption]["red"] += i.behaviors[b].value
      }
      if(i.behaviors[b].value>0) {
        res[w]["total"]["green"] += i.behaviors[b].value
        res[w][caption]["green"] += i.behaviors[b].value

      }
      res[w]["total"]["all"]= res[w]["total"]["green"] + (-1*res[w]["total"]["red"])
    }
  }
  res[w]["totalSamples"] += delta
}
console.log(res)
