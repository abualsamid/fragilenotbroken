
export const speak = (msg) => {
  window.speechSynthesis.speak( new SpeechSynthesisUtterance( msg) );
}
