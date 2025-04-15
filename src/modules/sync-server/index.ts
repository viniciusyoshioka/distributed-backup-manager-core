import { createServer } from './server'


function startServer() {
  const port = process.env.PORT

  const app = createServer()
  app.listen(port, () => {
    console.log(`sync-server listening at port ${port}`)
  })
}


startServer()
