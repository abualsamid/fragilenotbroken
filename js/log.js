
export default function log(...p)  {
  try {
    console.log(...p)
  } catch (err) {
    console.log('error in log ', err, p)
  }
}
