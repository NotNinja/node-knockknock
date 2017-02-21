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

const helpers = require('./helpers')
const knockknock = require('../src/knockknock')
const server = require('./fixtures/server/server')

describe('knockknock:fixture:server', () => {
  context('when asynchronous', () => {
    before(() => knockknock.clearCache())

    it('should return promise for callers (incl. packages) before "knocking" file', () => {
      return server(helpers.createOptions())
        .then((callers) => {
          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
            column: 10,
            file: 'server/server.js',
            line: 28,
            name: 'serverFunction',
            package: {
              directory: 'server',
              main: null,
              name: 'server',
              version: '4.0.1'
            }
          }))
        })
    })

    context('and limited to a single caller via "limit"', () => {
      it('should return promise for only caller (excl. package) before "knocking" file', () => {
        return server(helpers.createOptions({ limit: 1 }))
          .then((callers) => {
            expect(callers).to.have.lengthOf(1)
            expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
              column: 10,
              file: 'server/server.js',
              line: 28,
              name: 'serverFunction',
              package: {
                directory: 'server',
                main: null,
                name: 'server',
                version: '4.0.1'
              }
            }))
          })
      })
    })

    context('and file before "knocking" file is excluded via "filterFiles"', () => {
      it('should return promise for empty array', () => {
        return server(helpers.createOptions({ filterFiles: (filePath) => path.basename(filePath) !== 'server.js' }))
          .then((callers) => {
            expect(callers).to.be.empty
          })
      })
    })

    context('and all files are excluded via "filterFiles"', () => {
      it('should return promise for empty array', () => {
        return server(helpers.createOptions({ filterFiles: () => false }))
          .then((callers) => {
            expect(callers).to.be.empty
          })
      })
    })

    context('and package is excluded via "excludes"', () => {
      it('should return promise for empty array', () => {
        return server(helpers.createOptions({ excludes: 'server' }))
          .then((callers) => {
            expect(callers).to.be.empty
          })
      })
    })

    context('and package is excluded via "filterPackages"', () => {
      it('should return promise for empty array', () => {
        return server(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'server' }))
          .then((callers) => {
            expect(callers).to.be.empty
          })
      })
    })
  })

  context('when synchronous', () => {
    before(() => knockknock.clearCache())

    it('should return callers (incl. packages) before "knocking" file', () => {
      const callers = server.sync(helpers.createOptions())

      expect(callers).to.have.lengthOf(1)
      expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
        column: 14,
        file: 'server/server.js',
        line: 31,
        name: 'serverSyncFunction',
        package: {
          directory: 'server',
          main: null,
          name: 'server',
          version: '4.0.1'
        }
      }))
    })

    context('and limited to a single caller via "limit"', () => {
      it('should return only caller (excl. package) before "knocking" file', () => {
        const callers = server.sync(helpers.createOptions({ limit: 1 }))

        expect(callers).to.have.lengthOf(1)
        expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
          column: 14,
          file: 'server/server.js',
          line: 31,
          name: 'serverSyncFunction',
          package: {
            directory: 'server',
            main: null,
            name: 'server',
            version: '4.0.1'
          }
        }))
      })
    })

    context('and file before "knocking" file is excluded via "filterFiles"', () => {
      it('should return empty array', () => {
        const callers = server.sync(helpers.createOptions({
          filterFiles: (filePath) => {
            return path.basename(filePath) !== 'server.js'
          }
        }))

        expect(callers).to.be.empty
      })
    })

    context('and all files are excluded via "filterFiles"', () => {
      it('should return empty array', () => {
        const callers = server.sync(helpers.createOptions({ filterFiles: () => false }))

        expect(callers).to.be.empty
      })
    })

    context('and package is excluded via "excludes"', () => {
      it('should return empty array', () => {
        const callers = server.sync(helpers.createOptions({ excludes: 'server' }))

        expect(callers).to.be.empty
      })
    })

    context('and package is excluded via "filterPackages"', () => {
      it('should return empty array', () => {
        const callers = server.sync(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'server' }))

        expect(callers).to.be.empty
      })
    })
  })
})
