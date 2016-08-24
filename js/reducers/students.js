
const initialState = {
  student: null,
}
export default function students(state = initialState, action) {
  switch(action.type) {
    case "selectStudent":
      log('selecting student ', action.student )
      return { ...state, student: action.student}
  }
  return state
}
