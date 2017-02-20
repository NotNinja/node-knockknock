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

const flat = require('./fixtures/flat/src/flat')
const helpers = require('./helpers')
const knockknock = require('../src/knockknock')

describe('knockknock:fixture:flat', () => {
  context('when asynchronous', () => {
    before(() => knockknock.clearCache())

    context('and module calls "knocking" module directly', () => {
      it('should return promise for caller & package information for fixture file', () => {
        return flat.foo(helpers.createOptions())
          .then((caller) => {
            expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
              column: 10,
              file: 'flat/src/flat.js',
              line: 36,
              name: 'flatFooFunction',
              package: {
                directory: 'flat',
                main: 'flat/src/flat.js',
                name: 'flat',
                version: '1.0.1'
              }
            }))
          })
      })

      context('and file package is excluded via "excludes"', () => {
        it('should return promise for null', () => {
          return flat.foo(helpers.createOptions({ excludes: 'flat' }))
            .then((caller) => {
              expect(caller).to.be.null
            })
        })
      })

      context('and file package is excluded via "filterPackages"', () => {
        it('should return promise for null', () => {
          return flat.foo(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'flat' }))
            .then((caller) => {
              expect(caller).to.be.null
            })
        })
      })
    })

    context('and module calls "knocking" module indirectly', () => {
      it('should return promise for caller & package information for indirect fixture file', () => {
        return flat.bar(helpers.createOptions())
          .then((caller) => {
            expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
              column: 10,
              file: 'flat/node_modules/bar/src/bar.js',
              line: 28,
              name: 'barFunction',
              package: {
                directory: 'flat/node_modules/bar',
                main: 'flat/node_modules/bar/src/bar.js',
                name: 'bar',
                version: '1.1.2'
              }
            }))
          })
      })

      context('and "knocking" package is excluded via "excludes"', () => {
        it('should return promise for caller & package information for fixture file', () => {
          return flat.bar(helpers.createOptions({ excludes: 'bar' }))
            .then((caller) => {
              expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
                column: 10,
                file: 'flat/src/flat.js',
                line: 29,
                name: 'flatBarFunction',
                package: {
                  directory: 'flat',
                  main: 'flat/src/flat.js',
                  name: 'flat',
                  version: '1.0.1'
                }
              }))
            })
        })
      })

      context('and "knocking" package is excluded via "filterPackages"', () => {
        it('should return promise for caller & package information for fixture file', () => {
          return flat.bar(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'bar' }))
            .then((caller) => {
              expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
                column: 10,
                file: 'flat/src/flat.js',
                line: 29,
                name: 'flatBarFunction',
                package: {
                  directory: 'flat',
                  main: 'flat/src/flat.js',
                  name: 'flat',
                  version: '1.0.1'
                }
              }))
            })
        })
      })

      context('and file package is excluded via "excludes"', () => {
        it('should return promise for caller & package information for indirect fixture file', () => {
          return flat.bar(helpers.createOptions({ excludes: 'flat' }))
            .then((caller) => {
              expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
                column: 10,
                file: 'flat/node_modules/bar/src/bar.js',
                line: 28,
                name: 'barFunction',
                package: {
                  directory: 'flat/node_modules/bar',
                  main: 'flat/node_modules/bar/src/bar.js',
                  name: 'bar',
                  version: '1.1.2'
                }
              }))
            })
        })
      })

      context('and file package is excluded via "filterPackages"', () => {
        it('should return promise for caller & package information for indirect fixture file', () => {
          return flat.bar(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'flat' }))
            .then((caller) => {
              expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
                column: 10,
                file: 'flat/node_modules/bar/src/bar.js',
                line: 28,
                name: 'barFunction',
                package: {
                  directory: 'flat/node_modules/bar',
                  main: 'flat/node_modules/bar/src/bar.js',
                  name: 'bar',
                  version: '1.1.2'
                }
              }))
            })
        })
      })

      context('and both package and "knocking" package are excluded via "excludes"', () => {
        it('should return promise for null', () => {
          return flat.bar(helpers.createOptions({ excludes: [ 'bar', 'flat' ] }))
            .then((caller) => {
              expect(caller).to.be.null
            })
        })
      })

      context('and both package and "knocking" package are excluded via "filterPackages"', () => {
        it('should return promise for null', () => {
          return flat.bar(helpers.createOptions({ filterPackages: (pkg) => [ 'bar', 'flat' ].indexOf(pkg.name) < 0 }))
            .then((caller) => {
              expect(caller).to.be.null
            })
        })
      })
    })
  })

  context('when synchronous', () => {
    before(() => knockknock.clearCache())

    context('and module calls "knocking" module directly', () => {
      it('should return caller & package information for fixture file', () => {
        const caller = flat.foo.sync(helpers.createOptions())

        expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
          column: 14,
          file: 'flat/src/flat.js',
          line: 39,
          name: 'flatFooSyncFunction',
          package: {
            directory: 'flat',
            main: 'flat/src/flat.js',
            name: 'flat',
            version: '1.0.1'
          }
        }))
      })

      context('and package is excluded via "excludes"', () => {
        it('should return null', () => {
          const caller = flat.foo.sync(helpers.createOptions({ excludes: 'flat' }))

          expect(caller).to.be.null
        })
      })

      context('and package is excluded via "filterPackages"', () => {
        it('should return null', () => {
          const caller = flat.foo.sync(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'flat' }))

          expect(caller).to.be.null
        })
      })
    })

    context('and module calls "knocking" module indirectly', () => {
      it('should return caller & package information for indirect fixture file', () => {
        const caller = flat.bar.sync(helpers.createOptions())

        expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
          column: 14,
          file: 'flat/node_modules/bar/src/bar.js',
          line: 31,
          name: 'barSyncFunction',
          package: {
            directory: 'flat/node_modules/bar',
            main: 'flat/node_modules/bar/src/bar.js',
            name: 'bar',
            version: '1.1.2'
          }
        }))
      })

      context('and "knocking" package is excluded via "excludes"', () => {
        it('should return caller & package information for fixture file', () => {
          const caller = flat.bar.sync(helpers.createOptions({ excludes: 'bar' }))

          expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
            column: 14,
            file: 'flat/src/flat.js',
            line: 32,
            name: 'flatBarSyncFunction',
            package: {
              directory: 'flat',
              main: 'flat/src/flat.js',
              name: 'flat',
              version: '1.0.1'
            }
          }))
        })
      })

      context('and "knocking" package is excluded via "filterPackages"', () => {
        it('should return caller & package information for fixture file', () => {
          const caller = flat.bar.sync(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'bar' }))

          expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
            column: 14,
            file: 'flat/src/flat.js',
            line: 32,
            name: 'flatBarSyncFunction',
            package: {
              directory: 'flat',
              main: 'flat/src/flat.js',
              name: 'flat',
              version: '1.0.1'
            }
          }))
        })
      })

      context('and package is excluded via "excludes"', () => {
        it('should return caller & package information for indirect fixture file', () => {
          const caller = flat.bar.sync(helpers.createOptions({ excludes: 'flat' }))

          expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
            column: 14,
            file: 'flat/node_modules/bar/src/bar.js',
            line: 31,
            name: 'barSyncFunction',
            package: {
              directory: 'flat/node_modules/bar',
              main: 'flat/node_modules/bar/src/bar.js',
              name: 'bar',
              version: '1.1.2'
            }
          }))
        })
      })

      context('and package is excluded via "filterPackages"', () => {
        it('should return caller & package information for indirect fixture file', () => {
          const caller = flat.bar.sync(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'flat' }))

          expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
            column: 14,
            file: 'flat/node_modules/bar/src/bar.js',
            line: 31,
            name: 'barSyncFunction',
            package: {
              directory: 'flat/node_modules/bar',
              main: 'flat/node_modules/bar/src/bar.js',
              name: 'bar',
              version: '1.1.2'
            }
          }))
        })
      })

      context('and both package and "knocking" package are excluded via "excludes"', () => {
        it('should return null', () => {
          const caller = flat.bar.sync(helpers.createOptions({ excludes: [ 'bar', 'flat' ] }))

          expect(caller).to.be.null
        })
      })

      context('and both package and "knocking" package are excluded via "filterPackages"', () => {
        it('should return null', () => {
          const caller = flat.bar.sync(helpers.createOptions({
            filterPackages: (pkg) => {
              return [ 'bar', 'flat' ].indexOf(pkg.name) < 0
            }
          }))

          expect(caller).to.be.null
        })
      })
    })
  })
})
