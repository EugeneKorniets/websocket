const fs = require('fs')
const http = require('http')
const ws = require('ws')

const wss = new ws.Server({
  noServer: true
})

function sendPage (res) {
  const indexPage = fs.readFileSync('./index.html')
  res.setHeader('Content-Type', 'text/html')
  res.end(indexPage)
}

function accept(req, res) {
  // если запрос не к вебсокету, отдаем страницу
  if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() !== 'websocket') {
    sendPage(res)
    return
  }

  // заголовок может быть Connection: keep-alive, Upgrade - тоже отдаем страницу
  if (!req.headers.connection.match(/\bupgrade\b/i)) {
    sendPage(res)
    return
  }

  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onConnect)
}

function onConnect(ws) {
  console.info('client connect')
  ws.on('message', message => {
    console.info(`Message from client: "${message}"`)

    ws.send('Hello, WebSocket Client')

    setTimeout(() => ws.close(1000, 'Bye, WebSocket Client'), 3000)
  })
}

http.createServer(accept).listen(8080, () => {
  console.info('HTTP Server started on http://localhost:8080')
  console.info('WebSocket Server started on ws://localhost:8080')
})
