    888    d8P                             888      888    d8P                             888
    888   d8P                              888      888   d8P                              888
    888  d8P                               888      888  d8P                               888
    888d88K     88888b.   .d88b.   .d8888b 888  888 888d88K     88888b.   .d88b.   .d8888b 888  888
    8888888b    888 "88b d88""88b d88P"    888 .88P 8888888b    888 "88b d88""88b d88P"    888 .88P
    888  Y88b   888  888 888  888 888      888888K  888  Y88b   888  888 888  888 888      888888K
    888   Y88b  888  888 Y88..88P Y88b.    888 "88b 888   Y88b  888  888 Y88..88P Y88b.    888 "88b
    888    Y88b 888  888  "Y88P"   "Y8888P 888  888 888    Y88b 888  888  "Y88P"   "Y8888P 888  888

Who's there?  
The modules that just called your code.

[KnockKnock](https://github.com/NotNinja/node-knockknock) provides information about the files, functions, and packages
that were responsible for calling your module.

[![Build](https://img.shields.io/travis/NotNinja/node-knockknock/develop.svg?style=flat-square)](https://travis-ci.org/NotNinja/node-knockknock)
[![Coverage](https://img.shields.io/codecov/c/github/NotNinja/node-knockknock/develop.svg?style=flat-square)](https://codecov.io/gh/NotNinja/node-knockknock)
[![Dependencies](https://img.shields.io/david/NotNinja/node-knockknock.svg?style=flat-square)](https://david-dm.org/NotNinja/node-knockknock)
[![Dev Dependencies](https://img.shields.io/david/dev/NotNinja/node-knockknock.svg?style=flat-square)](https://david-dm.org/NotNinja/node-knockknock?type=dev)
[![License](https://img.shields.io/npm/l/knockknock.svg?style=flat-square)](https://github.com/NotNinja/node-knockknock/blob/master/LICENSE.md)
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

Finds all of the available information about the callers asynchronously, returning a `Promise` to retrieve them. The
information for each caller is provided in a format similar to below:

``` javascript
{
  // The column number within the file responsible for calling your module.
  column: 10,
  // The file that called your module
  file: '/path/to/my-example-package/node_modules/example-server/src/start.js',
  // The line number within the file responsible for calling your module
  line: 123,
  // The name of the function within the file responsible for calling your module (or "<anonymous>" where appropriate)
  name: 'startServer',
  // The information for the package containing the file or null if none could be found
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

The `options` parameter is entirely optional and supports the following:

| Option           | Description                                                                                                                               | Default Value |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `excludes`       | The name(s) of packages whose calls should be ignored. Internal calls from KnockKnock and Node.js are always ignored.                     | `[]`          |
| `filterFiles`    | A function called to filter files based on their path. Only called for files whose containing package (if any) is also included.          | N/A           |
| `filterPackages` | A function called to filter files based on the package to which they belong (if any). Only called if package is not listed in `excludes`. | N/A           |
| `limit`          | The maximum number of callers to be included in the results. No limit is applied when `null`.                                             | `null`        |
| `offset`         | The number of frames from call stack to be skipped initially.                                                                             | `0`           |

In most cases, you may want to at least exclude your own package so that your own package-internal calls are ignored via
`excludes` or `filterPackages`.

``` javascript
const whoIsThere = require('knockknock');

module.exports = function() {
  return whoIsThere({ excludes: 'my-example-package' })
    .then((callers) => {
      if (callers.length > 0) {
        console.log(`Called from ${callers.length} modules`);

        // ...
      } else {
        console.log('Called from unknown module');

        // ...
      }
    });
};
```

The `limit` option works great if you only want to know about the last caller:

``` javascript
const whoIsThere = require('knockknock');

module.exports = function() {
  return whoIsThere({ excludes: 'my-example-package', limit: 1 })
    .then((callers) => {
      if (callers.length === 1) {
        console.log(`Called from module "${callers[0].file}" in package "${callers[0].package ? callers[0].package.name : '<unknown>'}"`);

        // ...
      } else {
        console.log('Called from unknown module');

        // ...
      }
    });
};
```

### `knockknock.sync([options])`

A synchronous alternative to `knockknock([options])`.

``` javascript
const whoIsThere = require('knockknock');

module.exports = function() {
  const callers = whoIsThere.sync({ excludes: 'my-example-package' });

  if (callers.length > 0) {
    console.log(`Called from ${callers.length} modules`);

    // ...
  } else {
    console.log('Called from unknown module');

    // ...
  }
};
```

### `knockknock.version`

The current version of KnockKnock.

``` javascript
const whoIsThere = require('knockknock');

whoIsThere.version;
=> "0.3.0"
```

## Bugs

If you have any problems with KnockKnock or would like to see changes currently in development you can do so
[here](https://github.com/NotNinja/node-knockknock/issues).

## Contributors

If you want to contribute, you're a legend! Information on how you can do so can be found in
[CONTRIBUTING.md](https://github.com/NotNinja/node-knockknock/blob/master/CONTRIBUTING.md). We want your suggestions and
pull requests!

A list of KnockKnock contributors can be found in
[AUTHORS.md](https://github.com/NotNinja/node-knockknock/blob/master/AUTHORS.md).

## License

See [LICENSE.md](https://github.com/NotNinja/node-knockknock/raw/master/LICENSE.md) for more information on our MIT
license.

[![Copyright !ninja](https://cdn.rawgit.com/NotNinja/branding/master/assets/copyright/base/not-ninja-copyright-186x25.png)](https://not.ninja)
