
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
  list_behaviors: {}
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
    case "auth":
      return { ...state, user: action.user, isAuthenticated: action.isAuthenticated}
    case "selectViewPerson":
      return { ...state, viewPersonId: action.person.key, viewPerson: action.person.val()}
    case "onListBehaviors":
      console.log('reducing ',action.list_behaviors)
      return { ...state, list_behaviors: action.list_behaviors}
    case "logout":
      return initialState
  }
  return state
}
