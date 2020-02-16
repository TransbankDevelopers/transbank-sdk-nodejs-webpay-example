const express = require("express")
const bodyParser = require("body-parser")
const Transbank = require("tbk_sdk")
const { getRandomInt } = require("./helpers")

const app = express()
const port = 3000
// set the view engine to ejs
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", (req, res) => {
  res.render("home")
})

const transactions = {}

/*
 |--------------------------------------------------------------------------
 | Webpay Plus Normal
 |--------------------------------------------------------------------------
 */
app.get("/webpay-normal/init", (req, res) => {
  const configuration = Transbank.Configuration.forTestingWebpayPlusNormal()
  let Webpay = new Transbank.Webpay(configuration).getNormalTransaction()
  let url = "http://" + req.get("host")
  let amount = 1500
  Webpay.initTransaction(
    amount,
    "Orden" + getRandomInt(10000, 99999),
    req.sessionId,
    url + "/webpay-normal/response",
    url + "/webpay-normal/finish",).then((data) => {
    transactions[data.token] = { amount: amount }
    res.render("redirect-transbank",
      { url: data.url, token: data.token, inputName: "TBK_TOKEN" })
  })

})

app.post("/webpay-normal/response", (req, res) => {
  // Esta inicialización que se repite, es mejor llevarla a nu lugar en donde se
  // pueda reutilizar. Por simplicidad, en este ejemplo está el código duplicado
  const configuration = Transbank.Configuration.forTestingWebpayPlusNormal()
  let Webpay = new Transbank.Webpay(configuration).getNormalTransaction()

  let token = req.body.token_ws

  Webpay.getTransactionResult(token).then(response => {
    transactions[token] = response
    res.render("redirect-transbank",
      { url: response.urlRedirection, token, inputName: "token_ws" })
  }).catch((e) => {
    console.log(e)
    res.send("Error")
  })

})

app.post("/webpay-normal/finish", (req, res) => {
  // Esta inicialización que se repite, es mejor llevarla a nu lugar en donde se
  // pueda reutilizar. Por simplicidad, en este ejemplo está el código duplicado
  let transaction = transactions[req.body.token_ws];
  res.render('webpay-normal/finish', {transaction})


})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
