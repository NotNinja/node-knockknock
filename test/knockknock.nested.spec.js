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

const helpers = require('./helpers')
const knockknock = require('../src/knockknock')
const nested = require('./fixtures/nested/src/nested')

describe('knockknock:fixture:nested', () => {
  context('when asynchronous', () => {
    before(() => knockknock.clearCache())

    context('and module calls "knocking" module directly', () => {
      it('should return promise for caller & package information for fixture file', () => {
        return nested.foo(helpers.createOptions())
          .then((caller) => {
            expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
              column: 10,
              file: 'nested/src/nested.js',
              line: 36,
              name: 'nestedFooFunction',
              package: {
                directory: 'nested',
                main: 'nested/src/nested.js',
                name: 'nested',
                version: '3.0.1'
              }
            }))
          })
      })

      context('and package is excluded', () => {
        it('should return promise for null', () => {
          return nested.foo(helpers.createOptions({ excludes: 'nested' }))
            .then((caller) => {
              expect(caller).to.be.null
            })
        })
      })
    })

    context('and module calls "knocking" module indirectly', () => {
      it('should return promise for caller & package information for indirect fixture file', () => {
        return nested.bar(helpers.createOptions())
          .then((caller) => {
            expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
              column: 10,
              file: 'nested/node_modules/foo/node_modules/bar/src/bar.js',
              line: 28,
              name: 'barFunction',
              package: {
                directory: 'nested/node_modules/foo/node_modules/bar',
                main: 'nested/node_modules/foo/node_modules/bar/src/bar.js',
                name: 'bar',
                version: '3.2.1'
              }
            }))
          })
      })

      context('and "knocking" package is excluded', () => {
        it('should return promise for caller & package information for fixture file', () => {
          return nested.bar(helpers.createOptions({ excludes: 'bar' }))
            .then((caller) => {
              expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
                column: 10,
                file: 'nested/src/nested.js',
                line: 29,
                name: 'nestedBarFunction',
                package: {
                  directory: 'nested',
                  main: 'nested/src/nested.js',
                  name: 'nested',
                  version: '3.0.1'
                }
              }))
            })
        })
      })

      context('and package is excluded', () => {
        it('should return promise for caller & package information for indirect fixture file', () => {
          return nested.bar(helpers.createOptions({ excludes: 'nested' }))
            .then((caller) => {
              expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
                column: 10,
                file: 'nested/node_modules/foo/node_modules/bar/src/bar.js',
                line: 28,
                name: 'barFunction',
                package: {
                  directory: 'nested/node_modules/foo/node_modules/bar',
                  main: 'nested/node_modules/foo/node_modules/bar/src/bar.js',
                  name: 'bar',
                  version: '3.2.1'
                }
              }))
            })
        })
      })

      context('and both package and "knocking" package are excluded', () => {
        it('should return promise for null', () => {
          return nested.bar(helpers.createOptions({ excludes: [ 'bar', 'nested' ] }))
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
        const caller = nested.foo.sync(helpers.createOptions())

        expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
          column: 14,
          file: 'nested/src/nested.js',
          line: 39,
          name: 'nestedFooSyncFunction',
          package: {
            directory: 'nested',
            main: 'nested/src/nested.js',
            name: 'nested',
            version: '3.0.1'
          }
        }))
      })

      context('and package is excluded', () => {
        it('should return null', () => {
          const caller = nested.foo.sync(helpers.createOptions({ excludes: 'nested' }))

          expect(caller).to.be.null
        })
      })
    })

    context('and module calls "knocking" module indirectly', () => {
      it('should return caller & package information for indirect fixture file', () => {
        const caller = nested.bar.sync(helpers.createOptions())

        expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
          column: 14,
          file: 'nested/node_modules/foo/node_modules/bar/src/bar.js',
          line: 31,
          name: 'barSyncFunction',
          package: {
            directory: 'nested/node_modules/foo/node_modules/bar',
            main: 'nested/node_modules/foo/node_modules/bar/src/bar.js',
            name: 'bar',
            version: '3.2.1'
          }
        }))
      })

      context('and "knocking" package is excluded', () => {
        it('should return caller & package information for fixture file', () => {
          const caller = nested.bar.sync(helpers.createOptions({ excludes: 'bar' }))

          expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
            column: 14,
            file: 'nested/src/nested.js',
            line: 32,
            name: 'nestedBarSyncFunction',
            package: {
              directory: 'nested',
              main: 'nested/src/nested.js',
              name: 'nested',
              version: '3.0.1'
            }
          }))
        })
      })

      context('and package is excluded', () => {
        it('should return caller & package information for indirect fixture file', () => {
          const caller = nested.bar.sync(helpers.createOptions({ excludes: 'nested' }))

          expect(caller).to.deep.equal(helpers.resolveCallerForFixture({
            column: 14,
            file: 'nested/node_modules/foo/node_modules/bar/src/bar.js',
            line: 31,
            name: 'barSyncFunction',
            package: {
              directory: 'nested/node_modules/foo/node_modules/bar',
              main: 'nested/node_modules/foo/node_modules/bar/src/bar.js',
              name: 'bar',
              version: '3.2.1'
            }
          }))
        })
      })

      context('and both package and "knocking" package are excluded', () => {
        it('should return null', () => {
          const caller = nested.bar.sync(helpers.createOptions({ excludes: [ 'bar', 'nested' ] }))

          expect(caller).to.be.null
        })
      })
    })
  })
})
