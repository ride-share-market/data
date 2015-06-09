#!/bin/sh

#includes lsb functions
. /lib/lsb/init-functions

# Start Node app with pm2
log_daemon_msg "Starting RSM Data"
sudo -i -u rsm-data NODE_ENV=$NODE_ENV pm2 start /srv/ride-share-market-data/config/pm2-prd.json --no-daemon
