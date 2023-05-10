const db = require('./queries')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.json())
app.set('port', (process.env.PORT || 5000))

const REQUIRE_AUTH = false
const AUTH_TOKEN = 'an-example-token'

app.get('/', function (req, res) {
  res.send('Use the /webhook endpoint.')
})
app.get('/webhook', function (req, res) {
  res.send('You must POST your request')
})

// app.get('/users', db.getUsers)
// app.get('/users/:id', db.getUserById)
// app.post('/webhook',db.createUser)
// app.put('/users/:id', db.updateUser)
// app.delete('/users/:id', db.deleteUser)

app.post('/webhook',db.createUser, function (req, res) {
  // we expect to receive JSON data from api.ai here.
  // the payload is stored on req.body
  console.log(req.body)
  // if (req.body.type == "open_short"){
  //   app.post('/webhook',db.createUser)
  // }
  

  // and some validation too
  if (!req.body ) {
    return res.status(400).send('Bad Request')
  }

  // var webhookReply = 'Ok'

  // the most basic response

  res.status(200).send('Ok')
})


app.listen(app.get('port'), function () {
  console.log('* Webhook service is listening on port:' + app.get('port'))
})
