    888    d8P                             888      888    d8P                             888
    888   d8P                              888      888   d8P                              888
    888  d8P                               888      888  d8P                               888
    888d88K     88888b.   .d88b.   .d8888b 888  888 888d88K     88888b.   .d88b.   .d8888b 888  888
    8888888b    888 "88b d88""88b d88P"    888 .88P 8888888b    888 "88b d88""88b d88P"    888 .88P
    888  Y88b   888  888 888  888 888      888888K  888  Y88b   888  888 888  888 888      888888K
    888   Y88b  888  888 Y88..88P Y88b.    888 "88b 888   Y88b  888  888 Y88..88P Y88b.    888 "88b
    888    Y88b 888  888  "Y88P"   "Y8888P 888  888 888    Y88b 888  888  "Y88P"   "Y8888P 888  888

Who's there?  
The module that just called your code.

[KnockKnock](https://github.com/Skelp/knockknock) provides information about the file, function, and package that was
responsible for calling your module.

[![Build](https://img.shields.io/travis/Skelp/knockknock/develop.svg?style=flat-square)](https://travis-ci.org/Skelp/knockknock)
[![Coverage](https://img.shields.io/coveralls/Skelp/knockknock/develop.svg?style=flat-square)](https://coveralls.io/github/Skelp/knockknock)
[![Dependencies](https://img.shields.io/david/Skelp/knockknock.svg?style=flat-square)](https://david-dm.org/Skelp/knockknock)
[![Dev Dependencies](https://img.shields.io/david/dev/Skelp/knockknock.svg?style=flat-square)](https://david-dm.org/Skelp/knockknock#info=devDependencies)
[![License](https://img.shields.io/npm/l/knockknock.svg?style=flat-square)](https://github.com/Skelp/knockknock/blob/master/LICENSE.md)
[![Release](https://img.shields.io/npm/v/knockknock.svg?style=flat-square)](https://www.npmjs.com/package/knockknock)

* [Install](#install)
* [API](#api)
* [Bugs](#bugs)
* [Contributors](#contributors)
* [License](#license)

## Install

``` bash
$ npm install --save knockknock
```

You'll need to have at least [Node.js](https://nodejs.org) 4 or newer.

## API

### `knockknock([options])`

Finds all of the available information about the caller asynchronously, returning a `Promise` to retrieve it. The caller
information is provided in a format similar to below:

``` javascript
{
  // The file that called your module
  file: '/path/to/my-example-package/node_modules/example-server/src/start.js',
  // The line number within that file responsible for calling your module
  line: 123,
  // The name of the function within that file responsible for calling your module (or "<anonymous>" where appropriate)
  name: 'startServer',
  // The information for the package containing that file or null if none could be found
  package: {
    // The directory of the package
    directory: '/path/to/my-example-package/node_modules/example-server',
    // The file path of the "main" file for the package or null if it has none
    main: '/path/to/my-example-package/node_modules/example-server/server.js',
    // The name of the package
    name: 'example-server',
    // The version of the package
    version: '3.2.1'
  }
}
```

If no caller can be determined (or all belong to excluded packages), then the `Promise` is resolved with `null`.

The `options` parameter is entirely optional and supports the following:

| Option           | Description                                                                                                                               | Default Value |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `excludes`       | The name(s) of packages whose calls should be ignored. Internal calls from KnockKnock and Node.js are always ignored.                     | `[]`          |
| `filterFiles`    | A function called to filter files based on their path. Only called for files whose containing package (if any) is also included.          | N/A           |
| `filterPackages` | A function called to filter files based on the package to which they belong (if any). Only called if package is not listed in `excludes`. | N/A           |

In most cases you'll want to at least exclude your own package so that your own internal calls are ignored via
`excludes` or `filterPackages`.

``` javascript
const whoIsThere = require('knockknock')

module.exports = function() {
  return whoIsThere({ excludes: 'my-example-package' })
    .then((caller) => {
      if (!caller) {
        console.log('Module was called from unknown source')

        // ...
      } else {
        console.log(`Module was called from file "${caller.file}" in package "${caller.package ? caller.package.name : '<unknown>'}"`)

        // ...
      }
    })
}
```

### `knockknock.sync([options])`

A synchronous alternative to `knockknock([options])`.

``` javascript
const whoIsThere = require('knockknock')

module.exports = function() {
  const caller = whoIsThere.sync({ excludes: 'my-example-package' })

  if (!caller) {
    console.log('Module was called from unknown source')

    // ...
  } else {
    console.log(`Module was called from file "${caller.file}" in package "${caller.package ? caller.package.name : '<unknown>'}"`)

    // ...
  }
}
```

### `knockknock.version`

The current version of KnockKnock.

``` javascript
const whoIsThere = require('knockknock')

whoIsThere.version
=> "0.2.0"
```

## Bugs

If you have any problems with KnockKnock or would like to see changes currently in development you can do so
[here](https://github.com/Skelp/knockknock/issues).

## Contributors

If you want to contribute, you're a legend! Information on how you can do so can be found in
[CONTRIBUTING.md](https://github.com/Skelp/knockknock/blob/master/CONTRIBUTING.md). We want your suggestions and pull
requests!

A list of KnockKnock contributors can be found in
[AUTHORS.md](https://github.com/Skelp/knockknock/blob/master/AUTHORS.md).

## License

See [LICENSE.md](https://github.com/Skelp/knockknock/raw/master/LICENSE.md) for more information on our MIT license.

© 2017 [Skelp](https://skelp.io)
<img align="right" width="16" height="16" src="https://cdn.rawgit.com/Skelp/skelp-branding/master/assets/logo/base/skelp-logo-16x16.png">
