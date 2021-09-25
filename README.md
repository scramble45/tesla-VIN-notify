# tesla-VIN-notify
Notifies when a VIN has been assigned on your tesla reservation

## Getting started:

You'll need NodeJS 11.6+ in order to use this tool.

Edit the `config.yml` file. Add your `username`, `password` and `reservation` number. This also includes Twilio creds. If you don't have [Twilio](https://www.twilio.com/) you can sign up and use their free credits to SMS you when the VIN is found. You can configure the interval of when it tries to go out in find your VIN in your Tesla account by editing the config.

You can also be notified via a Discord Webhook by providing a webhook `id` and `token`.

- I would recommend making a systemd job to run this or something like that.


## Example systemd:
`/etc/systemd/system/tesla.service`
```
[Unit]
Description=Tesla VIN BOT
After=network.target

[Service]
Environment="DEBUG=tesla-VIN-notify"
WorkingDirectory=/node_code/tesla-VIN-notify/
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=telsa-vin-bot
User=root

[Install]
WantedBy=multi-user.target
```

`sudo sytemctl enable tesla`

`sudo journalctl -u tesla.service -f`

##Debug

You can get more debug information by setting the debug flag when you run the tool:

`DEBUG=tesla-VIN-notify node index.js`
