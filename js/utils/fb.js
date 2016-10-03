
function inc(base, index, stat, delta=1) {

  let key = base + "/" + index + "/" + stat

  firebase
  .database()
  .ref(key)
  .transaction(
    current => delta + (isNaN(current)||!isFinite(current)?0:current)
  )
}

function incAll(base, index, delta=1) {
  inc(base, index, "all", delta)
}

function incYear(base, index, delta=1) {
  let d = new Date()
  inc(base, index, "year/" + getYear(), delta )
}

function incMonth(base, index, delta=1)
{
  inc(base, index, "month/" + getMonth() , delta)
}

function incWeek(base, index, delta=1) {
  inc(base, index, "week/" + getWeek() , delta)

}
function incDate(base, index, delta=1)
{
  inc(base, index, "date/" + getDate(), delta )
}

function getWeek(d) {

  d = d || new Date()
  d.setDate(d.getDate() - d.getDay() +1)
  return d.getFullYear().toString() + "-" + (1+d.getMonth()).toString() + "-" + d.getDate().toString()
}



function getDate(d) {
  d = d || new Date()
  return  d.getFullYear().toString() + "-" + (1+d.getMonth()).toString() + "-" + d.getDate().toString()
}

const getMonth = (d) => {
  d = d || new Date()
  return d.getFullYear().toString() + "-" + (1+d.getMonth()).toString()
}

const getYear = (d) => ( (d||new Date()).getFullYear().toString()  )

export { inc, incAll, incYear, incMonth, incDate, incWeek, getWeek, getMonth, getDate, getYear  }
