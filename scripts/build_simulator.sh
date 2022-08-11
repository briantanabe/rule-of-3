#!/usr/bin/env bash

cd $( dirname -- "$0"; )
cd ..

eas build --platform ios --profile simulator --non-interactive --no-wait --local