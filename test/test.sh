#!/usr/bin/env sh
node records/index.js &
server_pid=$!
killserver() {
    kill -9 $server_pid
}
trap killserver EXIT

./node_modules/karma/bin/karma start karma.conf.js --single-run
