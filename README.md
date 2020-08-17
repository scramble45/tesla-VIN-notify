# tesla-VIN-notify
Notifies when a VIN has been assigned on your tesla reservation

## Getting started:
Edit the `config.yml` file. Add your creds and reservation number. This includes twillio creds. If you dont have twillio you can sign up and use their free credits to SMS you when the vin is found. You can configure the interval of when it tries to go out in find your vin in our Tesla account but editing the config.

- I would recommend making a systemd job to run this or something like that.


Example systemd:
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
