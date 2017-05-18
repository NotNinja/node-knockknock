/*
 * Copyright (C) 2017 Alasdair Mercer, !ninja
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

const path = require('path');

/**
 * Creates options to be used by tests.
 *
 * This is just a convenient method for ensuring that mocha calls are always excluded.
 *
 * @param {knockknock~Options} [options] - the options to be used (may be <code>null</code>)
 * @return {knockknock~Options} The created options.
 * @public
 */
exports.createOptions = function createOptions(options) {
  if (!options) {
    options = {};
  }

  options.excludes = [ 'mocha' ].concat(options.excludes || []);

  return options;
};

/**
 * Resolves all file paths on the specified <code>caller</code> to the <code>fixtures</code> directory so that they are
 * absolute.
 *
 * @param {knockknock~Caller} caller - the expected caller information whose file paths are to eb resolved
 * @return {knockknock~Caller} A reference to <code>caller</code>.
 * @public
 */
exports.resolveCallerForFixture = function resolveCallerForFixture(caller) {
  const dirPath = path.join(__dirname, 'fixtures');
  const pkg = caller.package;

  caller.file = path.resolve(dirPath, caller.file);

  if (pkg) {
    pkg.directory = path.resolve(dirPath, pkg.directory);
    if (pkg.main) {
      pkg.main = path.resolve(dirPath, pkg.main);
    }
  }

  return caller;
};
