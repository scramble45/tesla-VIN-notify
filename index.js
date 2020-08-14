const debug     = require('debug')('tesla-VIN-notify')
const fs        = require('fs')
const path      = require('path')
const puppeteer = require('puppeteer')
const yaml      = require('js-yaml')

const configSrc = path.join(__dirname, './config.yml')
const config    = yaml.safeLoad(fs.readFileSync(configSrc), 'utf8')
const minutes   = config.interval.minutes, interval = minutes * 60 * 1000

if (!config.login.username || !config.login.password || !config.login.username.length || !config.login.password.length){
  console.error(`You will need to specify a Tesla username and password in: ${configSrc}`)
  process.exit(1)
}

if (!config.tesla.reservation || !config.tesla.reservation.length){
  console.error(`You will need to specify a Tesla reservation number in: ${configSrc}`)
  process.exit(1)
}

if (!config.twillio.accountSid || !config.twillio.authToken || !config.twillio.accountSid.length || !config.twillio.authToken.length){
  console.error(`You will need to specify Twillio SID, Token in: ${configSrc}`)
  process.exit(1)
}

if (!config.twillio.phoneTo || !config.twillio.phoneFrom || !config.twillio.phoneTo.length || !config.twillio.phoneFrom.length) {
  console.error(`You will need to specify Twillio SMS Phone 'From' and 'To' in: ${configSrc}`)
}

const twillio = require('twilio')(config.twillio.accountSid, config.twillio.authToken)

debug('Loaded config file...')
debug(`Current VIN fetch interval: ${config.interval.minutes}`)

async function notifier(config) {
  const browser = await puppeteer.launch({
    headless: config.puppet.headless,
    args: config.puppet.args
  })

  const page = await browser.newPage()

  // Login Page
  await page.goto(config.urls.userLogin, {waitUntil: 'domcontentloaded'})

  debug('Logging In...')
  await page.type('div.control.email > input', config.login.username, {delay: 15})
  await page.type('div.control.password > input', config.login.password, {delay: 15})
  await page.waitForSelector('.login-button', {timeout: 3000})
  await page.click('.login-button')
  debug('Login successful. Waiting for account page to load...')
  await page.waitFor('.rn-vin')
  await page.click(`a[href$='${config.tesla.reservation}']`)
  debug('Waiting on vehicle page to load...')
  await page.waitFor('#page')

  const {DeliveryDetails, Vin} = await page.evaluate(
    () => Tesla.ProductF.Data
  )

  const {DeliveryEstimateDate: estimateDeliveryDate} = DeliveryDetails
  debug('Delivery Details:', JSON.stringify({ DeliveryDetails, Vin }))

  await page.goto(config.urls.userLogout)
  await page.close()
  await browser.close()

  debug({
    estimateDeliveryDate,
    vin: Vin,
  })

  if (vin) {}
    twillio.messages
      .create({
        body: `Hey congrats! You got a VIN: ${Vin} on step closer to delivery`,
        from: config.twillio.phoneFrom,
        to: config.twillio.phoneTo
      })
      .then(message =>
        debug(message.sid)
      )
  }
}

notifier(config)

setInterval(() => {
  debug('Going to try to get your VIN...')
  notifier(config)
}, interval)
