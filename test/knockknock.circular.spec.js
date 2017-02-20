/*
 * Copyright (C) 2017 Alasdair Mercer, Skelp
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

'use strict'

const expect = require('chai').expect
const path = require('path')

const circular = require('./fixtures/circular/src/circular')
const helpers = require('./helpers')
const knockknock = require('../src/knockknock')

describe('knockknock:fixture:circular', () => {
  context('when asynchronous', () => {
    before(() => knockknock.clearCache())

    it('should return promise for caller & package information for fixture file', () => {
      return circular(helpers.createOptions())
        .then((caller) => {
          expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
            column: 32,
            file: 'circular/src/bar.js',
            line: 26,
            name: 'circularBarFunction',
            package: {
              directory: 'circular',
              main: 'circular/src/circular.js',
              name: 'circular',
              version: '0.0.1'
            }
          }))
        })
    })

    context('and file is excluded via "filterFiles"', () => {
      it('should return promise for caller & package information for "knocking" file', () => {
        return circular(helpers.createOptions({ filterFiles: (filePath) => path.basename(filePath) !== 'bar.js' }))
          .then((caller) => {
            expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
              column: 26,
              file: 'circular/src/foo.js',
              line: 26,
              name: 'circularFooFunction',
              package: {
                directory: 'circular',
                main: 'circular/src/circular.js',
                name: 'circular',
                version: '0.0.1'
              }
            }))
          })
      })
    })

    context('and both file and "knocking" file is excluded via "filterFiles"', () => {
      it('should return promise for caller & package information for original "knocking" file', () => {
        return circular(helpers.createOptions({
          filterFiles: (filePath) => {
            return [ 'bar.js', 'foo.js' ].indexOf(path.basename(filePath)) < 0
          }
        }))
          .then((caller) => {
            expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
              column: 26,
              file: 'circular/src/circular.js',
              line: 28,
              name: 'circularFunction',
              package: {
                directory: 'circular',
                main: 'circular/src/circular.js',
                name: 'circular',
                version: '0.0.1'
              }
            }))
          })
      })
    })

    context('and all files are excluded via "filterFiles"', () => {
      it('should return promise for null', () => {
        return circular(helpers.createOptions({ filterFiles: () => false }))
          .then((caller) => {
            expect(caller).to.be.null
          })
      })
    })

    context('and package is excluded via "excludes"', () => {
      it('should return promise for null', () => {
        return circular(helpers.createOptions({ excludes: 'circular' }))
          .then((caller) => {
            expect(caller).to.be.null
          })
      })
    })

    context('and package is excluded via "filterPackages"', () => {
      it('should return promise for null', () => {
        return circular(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'circular' }))
          .then((caller) => {
            expect(caller).to.be.null
          })
      })
    })
  })

  context('when synchronous', () => {
    before(() => knockknock.clearCache())

    it('should return caller & package information for fixture file', () => {
      const caller = circular.sync(helpers.createOptions())

      expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
        column: 41,
        file: 'circular/src/bar.js',
        line: 29,
        name: 'circularBarSyncFunction',
        package: {
          directory: 'circular',
          main: 'circular/src/circular.js',
          name: 'circular',
          version: '0.0.1'
        }
      }))
    })

    context('and file is excluded via "filterFiles"', () => {
      it('should return caller & package information for "knocking" file', () => {
        const caller = circular.sync(helpers.createOptions({
          filterFiles: (filePath) => {
            return path.basename(filePath) !== 'bar.js'
          }
        }))

        expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
          column: 27,
          file: 'circular/src/foo.js',
          line: 29,
          name: 'circularFooSyncFunction',
          package: {
            directory: 'circular',
            main: 'circular/src/circular.js',
            name: 'circular',
            version: '0.0.1'
          }
        }))
      })
    })

    context('and both file and "knocking" file is excluded via "filterFiles"', () => {
      it('should return caller & package information for original "knocking" file', () => {
        const caller = circular.sync(helpers.createOptions({
          filterFiles: (filePath) => {
            return [ 'bar.js', 'foo.js' ].indexOf(path.basename(filePath)) < 0
          }
        }))

        expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
          column: 27,
          file: 'circular/src/circular.js',
          line: 31,
          name: 'circularSyncFunction',
          package: {
            directory: 'circular',
            main: 'circular/src/circular.js',
            name: 'circular',
            version: '0.0.1'
          }
        }))
      })
    })

    context('and all files are excluded via "filterFiles"', () => {
      it('should return null', () => {
        const caller = circular.sync(helpers.createOptions({ filterFiles: () => false }))

        expect(caller).to.be.null
      })
    })

    context('and package is excluded via "excludes"', () => {
      it('should return null', () => {
        const caller = circular.sync(helpers.createOptions({ excludes: 'circular' }))

        expect(caller).to.be.null
      })
    })

    context('and package is excluded via "filterPackages"', () => {
      it('should return null', () => {
        const caller = circular.sync(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'circular' }))

        expect(caller).to.be.null
      })
    })
  })
})
