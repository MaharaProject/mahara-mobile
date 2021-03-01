# Mahara Mobile

A Mahara app for offline use.

The technology is JavaScript ES6, React, Redux, and Phonegap.

**This codebase is not maintained any more as it was superceded by [Mahara Mobile built on React Native](https://github.com/MaharaProject/mahara-mobile-react-native).**

**The codebase is provided solely for historical purposes.**

## Requirements

* Mahara 16.10+
  * The Mahara site you're connecting to must have activated the new "mobileapi" module added in Mahara 16.10: https://reviews.mahara.org/#/c/7039/
  * Once that's added, you'll need to activate the plugin by going to "Administration -> Extensions -> Plugin configuration -> module/mobileapi" and using the auto-configure tool.
* Node.js (version 4 or later)
  * Ubuntu 16.04: ``apt-get node-js``
  * Ubuntu 14.04: The apt "node-js" package for 14.04 is way too old (version 0.10). If you already have it installed, you'll need to uninstall it. Then install a modern version of Node.js from here: https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions


## Dev Install

To install all the NPM and Cordova dependencies:

    npm install

## Running in a browser

For basic debugging and development, the site can be run in a Chromium browser on your local machine. (Note: Some Cordova plugins don't work in the browser, so some functionality may be missing.) To launch the browser, just run:

    npm start

To rebuild the app in the browser, after you've made changes:

    npm run build-browser

... and then refresh the browser.

## Running in an Android emulator or USB-connected device

To build the Android app, you'll need the Oracle version of Java 8. Here's how to install it on Ubuntu:

    sudo add-apt-repository -y ppa:webupd8team/java
    sudo apt-get update
    sudo apt-get install oracle-java8-installer oracle-java8-set-default

Then download and install Android studio from https://developer.android.com/studio/index.html

Launch Android Studio and run through the first-time wizard. Then from the tools menu, launch the SDK Manager. Install:

    Android SDK Tools
    Android SDK Platform-tools
    Android 6.0 -> SDK Platform
    Android 6.0 -> Intel x86 Atom_64 System Image

Once those are installed, close the SDK Manager and launch the AVD Manager. Create an Android 6 (API 23) virtual device, and launch it. (Or alternately, you could connect up a physical Android device via USB, and put it in development mode.)

Then finally, run:

    npm run android

To update the app in Android after you've made changes to the code, run ```npm run android``` again.

## Compiling the Android executable

You can use the cordova command-line tool. To produce an APK that can run on a normal Android device, you'll need an Java keystore to sign it with. See the Android documentation for instructions on how to generate an acceptable keystore.

    `npm bin`/cordova build \
        --release \
        --device android \
        -- \
        --keystore=/PATH/TO/YOUR/KEYSTORE.keystore \
        --alias=YOURKEYALEAS

## Running on IOS

  npm run build-ios

## TODO:

* The app currently does everything in redux using the basic synchronous data flow
  * For a GUI app, it's recommended to instead use redux-thunk or redux-promise in order to improve UI responsiveness: http://redux.js.org/docs/advanced/AsyncFlow.html).
* Data is stored in LocalStorage, which is not guaranteed to be persistent in iOS! https://cordova.apache.org/docs/en/latest/cordova/storage/storage.html#disadvantages
  * The best solution seems to be to move the data storage into a SQLite database file, placed in a location where iOS won't delete it.
* Camera support (instead of just gallery support)
* Tags on images
* More informative error messages
* Better control flow for situations where the user's token is no longer valid.
* Testing on iOS

## Copyright

Copyright (C) 2015-2019 Catalyst IT and others; see:
https://wiki.mahara.org/wiki/Contributors
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3 or later of the License.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.  If not, see https://www.gnu.org/licenses/.
