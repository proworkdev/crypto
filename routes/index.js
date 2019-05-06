var express = require('express');
var router = express.Router();

const { RippleAPI } = require('ripple-lib');
const assert = require('assert');

assert.ok(process.env.RIPPLE_FROM_ADDRESS);
assert.ok(process.env.RIPPLE_TO_ADDRESS);
assert.ok(process.env.RIPPLE_FROM_SECRET);

const api = new RippleAPI({
  server: 'wss://s.altnet.rippletest.net:51233' // XRP Test Net
});

router.get('/home', (req, res) => {
  res.render('home');
})

router.get('/getBalance', (req, res) => {
  res.render('balance');
})

router.post('/balance', (req, res) => {

  const { wallet } = req.body;

  async function run() {

    await api.connect();

    const info = await api.getAccountInfo(wallet);

    res.render('showBalance', { data: info.xrpBalance })

  }

  run();

});

router.get('/sendMoney', (req, res) => {

  res.render('moneyDetails');

});

router.post('/transaction', (req, res) => {

  const { sender, receiver, amount } = req.body;

  new_amount = amount / 1000000;

  async function func1() {

    await api.connect();

    const payment = {
      source: {
        address: sender,
        maxAmount: {
          value: amount,
          currency: 'XRP'
        }
      },
      destination: {
        address: receiver,
        amount: {
          value: amount,
          currency: 'XRP'
        }
      }
    };

    // Get ready to submit the payment
    const prepared = await api.preparePayment(sender, payment, {
      maxLedgerVersionOffset: 5
    });

    // Sign the payment using the sender's secret
    const { signedTransaction } = api.sign(prepared.txJSON, process.env.RIPPLE_FROM_SECRET);

    console.log('Signed', signedTransaction);

    // Submit the payment
    const result = await api.submit(signedTransaction);

    // console.log('Checking Result ====> ', result);
    res.render('transactions', { data: result })

  }

  func1();

})
























router.get('/test', (req, res) => {

  var prom1 = new Promise((resolve, reject) => {

    async function func1() {

      await api.connect();

      const payment = {
        source: {
          address: process.env.RIPPLE_FROM_ADDRESS,
          maxAmount: {
            value: '2340',
            currency: 'XRP'
          }
        },
        destination: {
          address: process.env.RIPPLE_TO_ADDRESS,
          amount: {
            value: '2340',
            currency: 'XRP'
          }
        }
      };

      // Get ready to submit the payment
      const prepared = await api.preparePayment(process.env.RIPPLE_FROM_ADDRESS, payment, {
        maxLedgerVersionOffset: 5
      });
      // Sign the payment using the sender's secret
      const { signedTransaction } = api.sign(prepared.txJSON, process.env.RIPPLE_FROM_SECRET);

      resolve(signedTransaction)

      console.log('Signed', signedTransaction)

      // Submit the payment
      const result = await api.submit(signedTransaction);

      res.render('transactions', { data: result })

      // console.log('Done', res);
      resolve(res);
      // process.exit(0);
    }

    func1();
  })

  var prom2 = new Promise((resolve, reject) => {

    prom1.then((result) => {

      console.log('Transaction Result ==> ', result);

      console.log('------------TESTING BALANCE-----------------');

      async function func2() {

        await api.connect();

        const info = await api.getAccountInfo(process.env.RIPPLE_ADDRESS);

        const info2 = await api.getAccountInfo(process.env.RIPPLE_TO_ADDRESS);

        resolve([info.xrpBalance, info2.xrpBalance]);

      }

      func2();

    }).catch((err) => {
      console.log('Transaction Error ==> ', err);
    })

  });

  prom2.then(([obj1, obj2]) => {
    console.log('Balance details ==> ', obj1, obj2);
  }).catch((error) => {
    console.log('Error while fetching balance => ', error);
  })

})








// USER ONE ---------------------------------------
router.get(`/balance/wallet`, function (req, res, next) {

  run().catch(error => console.error(error.stack));

  async function run() {
    await api.connect();
    const info = await api.getAccountInfo(process.env.RIPPLE_ADDRESS);

    console.log('Balance 1 ==> ', info.xrpBalance);

    res.render('index', { data: info.xrpBalance })

  }

});











































// router.get(`/balance/${walletAddress}`, function (req, res, next) {
//   res.send('balance')
// });


// USER 2-------------------------------------------------
router.get(`/balance/wallet2`, function (req, res, next) {

  run().catch(error => console.error(error.stack));

  async function run() {
    await api.connect();
    const info = await api.getAccountInfo(process.env.RIPPLE_TO_ADDRESS);

    console.log('Balance 2 ==> ', info.xrpBalance);
    process.exit(0);
  }

  res.send('balance');
});




// router.get(`/transactions/${walletAddress}`, function (req, res, next) {
//   res.send('transactions')
// });


router.get(`/transactions/wallet`, function (req, res, next) {
  res.send('transactions')
});

module.exports = router;
