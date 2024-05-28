#! /bin/bash

node preventColdStart.js &
yarn build && yarn start