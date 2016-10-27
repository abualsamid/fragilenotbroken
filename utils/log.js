
export default function log(...p) {
  try {
    if (process.env.NODE_ENV=="development") {
      console.warn(...p)
    }
  } catch (err) {
    console.log('error in log ', err, p)
  }
}
