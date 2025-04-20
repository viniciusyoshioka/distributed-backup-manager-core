function loadDotEnv() {
  try {
    const dotenv = require('dotenv')
    dotenv.config()
  } catch (error) {
    const isInstanceOfError = error instanceof Error
    if (!isInstanceOfError) {
      const stringifiedError = String(error)
      console.log(`Error loading dotenv: ${stringifiedError}\n`)
      return
    }

    console.log('Error loading dotenv')
    console.log(error.stack)
    console.log()
  }
}


loadDotEnv()
