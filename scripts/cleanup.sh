#!/usr/bin/env bash

# Install dependencies and install pods
cd $( dirname -- "$0"; )
rm -rf ../node_modules
yarn install
cp /dev/null ../node_modules/react-native/scripts/find-node.sh
cd ../ios
rm -rf Pods
rm Podfile.lock
pod cache clean --all
arch -x86_64 pod install --repo-update
cd ../android
./gradlew clean
