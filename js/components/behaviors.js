export const redStyle="btn  btn-danger "
export const greenStyle="btn  btn-success"
export const redStyleSelected="btn  btn-danger selected"
export const greenStyleSelected="btn  btn-success selected"


let behaviors =  [
        {
          caption: "",
          value: 0
        },
        {
          caption: "Excited",
          style: redStyle,
          defaultStyle: redStyle,
          txtStyle: "bg-danger",
          selected: false,
          value: 1
        },
        {
          caption: "Messy Eating",
          style: redStyle,
          defaultStyle: redStyle,
          txtStyle: "bg-danger",
          selected: false,
          value: 2
        },
        {
          caption: "Calm",
          style: greenStyle,
          defaultStyle: greenStyle,
          txtStyle: "bg-success",
          selected: false,
          value: 3
        },
        {
          caption: "Proper Eating",
          style: greenStyle,
          defaultStyle: greenStyle,
          txtStyle: "bg-success",
          selected: false,
          value: 4
        }
      ]

export default behaviors
// export redStyle, greenStyle, redStyleSelected, greenStyleSelected
