import {getDate} from './index'

export const loadTimeline = (viewPersonId,cb) => {

  try {
      const root = `/people/${viewPersonId}/timeline`
      firebase
      .database()
      .ref(root)
      .limitToLast(50)
      .on("value",cb)
    } catch(x) {
      console.log(x)
    }
}

export const submitInterventionResponse = (viewPersonId, timeLineId, response) => {
  const root = `/interventions/${viewPersonId}/${timeLineId}`
  firebase
  .database()
  .ref(root)
  .push({
    response: response,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  })
}

export const offTimeLine = (viewPersonId) => {
  const root = `/people/${viewPersonId}/timeline`
  firebase.database().ref(root).off()
}


export const getTodaysRed = (viewPersonId, timestamp, cb ) => {
  try {
      const d = getDate(new Date(timestamp) )
        firebase
        .database()
        .ref("/people/" + viewPersonId + "/stats/behaviors/red/date/" + d )
        .once("value", e => {
          cb( Math.abs(e.val() || 0)  )
        })
    } catch(x) {
      console.log(x)
      cb(0)
    }
}
