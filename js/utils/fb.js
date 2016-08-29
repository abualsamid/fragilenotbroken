
function inc(base, index, stat) {

  let key = base + "/" + index + "/" + stat

  firebase
  .database()
  .ref(key)
  .transaction(
    current => 1 + (isNaN(current)||!isFinite(current)?0:current)
  )
}

function incAll(base, index) {
  inc(base, index, "all")
}

function incYear(base, index) {
  let d = new Date()
  inc(base, index, d.getFullYear().toString() )
}

function incMonth(base, index)
{
  let d = new Date()
  inc(base, index, d.getFullYear().toString() + "-" + (1+d.getMonth()).toString() )
}

function incDate(base, index)
{
  let d = new Date()
  inc(base, index, d.getFullYear().toString() + "-" + (1+d.getMonth()).toString() + "-" + d.getDate().toString() )
}


export { inc, incAll, incYear, incMonth, incDate  }
