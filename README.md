# home-consumption


## Temperature monitor
In case of this error message
```bash
noble warning: adapter state unauthorized, please run as root or with sudo
kvě 02 09:56:01 raspberryPi3b.local node[27278]:                or see README for information on running without root/sudo:
kvě 02 09:56:01 raspberryPi3b.local node[27278]:                https://github.com/sandeepmistry/noble#running-on-linux
kvě 02 09:56:01 raspberryPi3b.local node[27278]: Stopping scanning...
```


Run the following command:

```bash
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```
