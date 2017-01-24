import {getDate} from './index'
import log from '../log'

export const getMediaModels = (viewPersonId) => {
  const root = `/models/${viewPersonId}`

  return  firebase 
          .database()
          .ref(root)
          .once("value")
}
export const addMedialModel = (uid, viewPersonId, timeLineId,caption,  url) => {
  const root =`/models/${viewPersonId}/${timeLineId}`

  return firebase
  .database()
  .ref(root)
  .set({
    url: url,
    caption: caption,
    uid: uid,
    isDeleted: false,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  })
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

export const postViewPersonId = (uid, viewPersonId) => {
  const key=`/state/${uid}/viewPersonId`
  firebase
  .database()
  .ref(key)
  .transaction(
    current => {
      if(current) {
        try {
          offTimeLine(current)
        } catch(x) {console.log(x)}
      }
      return viewPersonId || current
    }
  )
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
