"use strict";

const Webpay = require('transbank-sdk/lib/soap/webpay');
const Configuration = require("../lib/soap/configuration").Configuration;

const WebpayNormal = require('../lib/soap/webpayNormal/webpayNormal').WebpayNormal;
const express = require('express');
const bodyParser = require('body-parser');
const onError = require('./onError');

let transactions = {};
let transactionsByToken = {};
let app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const cert = require('./cert/normal');

const configuration = Configuration.forTestingWebpayPlusNormal();
const webpay = new Webpay(configuration).getNormalTransaction();

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test webpay-nodejs</title>
    </head>
    <body>
        <h1>Test webpay-nodejs</h1>
        <form action="/pagar" method="post">
            <input type="number" value="1500" min="10" placeholder="Monto a pagar" name="amount">
            <input type="submit" value="Pagar">
        </form>
    </body>
</html>`);
});

app.post('/pagar', (req, res) => {

  let buyOrden = Date.now();
  let amount = req.body.amount;
  transactions[buyOrden] = { amount: amount};
  let url = 'http://' + req.get('host');

  /**
   * 2. Enviamos una petición a Transbank para que genere
   * una transacción, como resultado tendremos un token y una url.
   *
   * Nuestra misión es redireccionar al usuario a dicha url y token.
   */
  webpay.initTransaction(
    amount,
    buyOrden,
    url + '/verificar',
    url + '/comprobante',
    req.sessionId)
  .then((data) => {
    // Al ser un ejemplo, se está usando GET.
    // Transbank recomienda POST, el cual se debe hacer por el lado del cliente, obteniendo
    // esta info por AJAX... al final es lo mismo, así que no estresarse.
    res.redirect(data.url + '?token_ws=' + data.token);
  }).catch(onError(res));

});

app.post('/verificar', (req, res) => {

  let token = req.body.token_ws;
  let transaction;

  // Si toodo está ok, Transbank realizará esta petición para que le vuelvas a confirmar la transacción.

  /**
   * 3. Cuando el usuario ya haya pagado con el banco, Transbank realizará una petición a esta url,
   * porque así se definió en initTransaction
   */
  console.log('pre token', token);
  webpay.getTransactionResult(token).then((transactionResult) => {
    transaction = transactionResult;
    transactions[transaction.buyOrder] = transaction;
    transactionsByToken[token] = transactions[transaction.buyOrder];

    res.redirect(transaction.urlRedirection + '?token_ws=' + token);
    // res.send(WebPay.getHtmlTransitionPage(transaction.urlRedirection, token));

  }).catch(onError(res));

});

app.post('/comprobante', (req, res) => {
  console.log('Mostrar el comprobante');
  const transaction = transactionsByToken[req.body.token_ws];
  let html = JSON.stringify(transaction);
  html += '<hr>';
  html += '<form action="/anular" method="post"><input type="hidden" name="buyOrden" value="' + transaction.buyOrder +
    '"><input type="submit" value="Anular"></form>'
  return res.send(html);
});

app.post('/anular', (req, res) => { // Notar que WebPay no permite anular RedCompra. Solo tarjetas de crédito

  const transaction = transactions[req.body.buyOrden];

  webpay.nullify({
    authorizationCode: transaction.detailOutput.authorizationCode,
    authorizedAmount: transaction.detailOutput.amount,
    nullifyAmount: transaction.detailOutput.amount,
    buyOrder: transaction.buyOrder
  }).then((result) => {
    console.log('anulación:', result);
    return res.send('Bla bla comprobante:' + JSON.stringify(transaction));
  }).catch(onError(res));
});


app.listen(3000, () => {
  console.log('Server OK in http://localhost:3000');
});
