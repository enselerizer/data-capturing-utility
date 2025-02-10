# Data Capturing Utility

A simple Node.js app for capturing multichannel data from different sensors. 

🚧 Currently in early development 🚧

Technology stack:
* Written completely in TypeScript
* [Angular](https://angular.dev/) for UI
* [Electron](https://www.electronjs.org/) for displaying web UI as a desktop app
* Node.js drivers for device communication

---

## Build & Run

#### Step 1 - Install required software

Currently only Windows platform is supported for both building and running the application.

You'll need to install the following software:

- Node.js
- NPM (Node Package Manager)
- Latest version of Python 3 (3.12 or newer) ⚠️
- Visual Studio 2017 or newer with C/C++ tools ⚠️

⚠️ **Note:** We use [Serialport package](https://github.com/serialport/node-serialport) for serial communication with sensors, which builds native binaries upon application build process using [node-gyp](https://github.com/nodejs/node-gyp). For this you currently need specified software.

#### Step 2 - Install dependencies

Install project dependencies using `npm`:

```bash
npm install
```

#### Step 3 - Fix bindings.cpp bug

At the time of writing, Serialport's bindings.cpp [has a bug](https://github.com/serialport/node-serialport/issues/2957) which prevents the application from compiling. Until the bug is fixed in newer versions of Serialport, a workaround must be used.

Open `node_modules / @serialport / bindings-cpp / binding.gyp` and find the following:

```
{
  ...
  'targets': [{
    ...
    'conditions': [
      ['OS=="win"',
        {
          'defines': ['CHECK_NODE_MODULE_VERSION'],
    ...
}

```

Then change:

```
'defines': ['CHECK_NODE_MODULE_VERSION'],
```

To:

```
'defines': ['CHECK_NODE_MODULE_VERSION', 'NOMINMAX'],
```

#### Step 4 - Run the app

Use `npm` to build and start the application:

```bash
npm start
```
---

## Generate distributables

This project uses [Electron Forge](https://www.electronforge.io/) for packaging and distributing the application.

Build Angular frontend and compile TypeScript:
```bash
npm run build
```

Package the application:
```bash
npm run package
```

Generate .zip distributables (will automatically package the application):
```bash
npm run make
```

You also can build and package the app with a single command:
```bash
npm run build-package
```

Similarly for generating distributables:
```bash
npm run build-make
```

Generated distributables can be found in the `/out` directory.

Directories `/dist` and `/dist-electron` are used for building Angular frontend and for TypeSript transpiling respectively.
