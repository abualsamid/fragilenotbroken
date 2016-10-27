import log from '../utils/log'
const initialState = {
  user: null,
  isAuthenticated: false,
  credentials: null,
  personId: null,
  isSuperAdmin: false,
  isBDFL: false,
  viewPersonId: "",
  viewPerson: null,
  displayName: "",
  photoURL: "",
  list_behaviors: {},
  timeLine: {},
  isLoading: false
}


export default function auth(state = initialState, action) {

  switch(action.type) {
    case "login":
      return  { ...state,
                user: action.user,
                isAuthenticated: action.isAuthenticated,
                credentials: action.credentials,
                personId: action.personId,
                displayName: action.displayName || "",
                photoURL: action.photoURL || "",
                isSuperAdmin: action.isSuperAdmin,
                isBDFL: action.isBDFL,
                viewPersonId: action.viewPersonId,
                viewPerson: action.viewPerson
              }
    case "loadTimeLine":
      log('loading timeline ', action )
      var f = {...state.timeLine }
      f[action.viewPersonId] = action.timeLine
      return {
        ...state,
        timeLine: f
      }
    case "auth":
      return { ...state, user: action.user, isAuthenticated: action.isAuthenticated}
    case "selectViewPerson":
      log('reducing selectViewPerson ', action, action.person.key, action.person.val())
      return { ...state, viewPersonId: action.person.key, viewPerson: action.person.val()}
    case "onListBehaviors":
      return { ...state, list_behaviors: action.list_behaviors}
    case "isLoading" :
      return { ...state, isLoading: true }
    case "doneLoading": 
      return { ...state, isLoading: false }
    case "logout":
      return initialState
  }
  return state
}
