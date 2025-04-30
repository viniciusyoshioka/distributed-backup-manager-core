import process from 'node:process'


function loadDotEnv() {
  try {
    const dotenv = require('dotenv')
    dotenv.config()
  } catch (error) {
    const { message } = error as Error
    console.error(`Unexpected error loading .env file: ${message}`)
    process.exit(1)
  }
}


loadDotEnv()
