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
const internal = require('./fixtures/internal/src/internal')
const knockknock = require('../src/knockknock')

describe('knockknock:fixture:internal', () => {
  context('when asynchronous', () => {
    before(() => knockknock.clearCache())

    it('should return promise for callers (incl. packages) before "knocking" file', () => {
      return internal(helpers.createOptions())
        .then((callers) => {
          expect(callers).to.have.lengthOf(2)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
            column: 17,
            file: 'internal/src/internal.js',
            line: 30,
            name: '<anonymous>',
            package: {
              directory: 'internal',
              main: 'internal/src/internal',
              name: 'internal',
              version: '2.0.1'
            }
          }))
          expect(callers[1]).to.deep.equal(helpers.resolveCallerForFixture({
            column: 30,
            file: 'internal/src/internal.js',
            line: 30,
            name: 'internalFunction',
            package: {
              directory: 'internal',
              main: 'internal/src/internal',
              name: 'internal',
              version: '2.0.1'
            }
          }))
        })
    })

    context('and first call is skipped via "offset"', () => {
      it('should return promise for callers (incl. package) before file before "knocking" file', () => {
        return internal(helpers.createOptions({ offset: 1 }))
          .then((callers) => {
            expect(callers).to.have.lengthOf(1)
            expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
              column: 30,
              file: 'internal/src/internal.js',
              line: 30,
              name: 'internalFunction',
              package: {
                directory: 'internal',
                main: 'internal/src/internal',
                name: 'internal',
                version: '2.0.1'
              }
            }))
          })
      })
    })

    context('and limited to a single caller via "limit"', () => {
      it('should return promise for only caller (incl. package) before "knocking" file', () => {
        return internal(helpers.createOptions({ limit: 1 }))
          .then((callers) => {
            expect(callers).to.have.lengthOf(1)
            expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
              column: 17,
              file: 'internal/src/internal.js',
              line: 30,
              name: '<anonymous>',
              package: {
                directory: 'internal',
                main: 'internal/src/internal',
                name: 'internal',
                version: '2.0.1'
              }
            }))
          })
      })
    })

    context('and file before "knocking" file is excluded via "filterFiles"', () => {
      it('should return promise for empty array', () => {
        return internal(helpers.createOptions({ filterFiles: (filePath) => path.basename(filePath) !== 'internal.js' }))
          .then((callers) => {
            expect(callers).to.be.empty
          })
      })
    })

    context('and all files are excluded via "filterFiles"', () => {
      it('should return promise for empty array', () => {
        return internal(helpers.createOptions({ filterFiles: () => false }))
          .then((callers) => {
            expect(callers).to.be.empty
          })
      })
    })

    context('and package is excluded via "excludes"', () => {
      it('should return promise for empty array', () => {
        return internal(helpers.createOptions({ excludes: 'internal' }))
          .then((callers) => {
            expect(callers).to.be.empty
          })
      })
    })

    context('and package is excluded via "filterPackages"', () => {
      it('should return promise for empty array', () => {
        return internal(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'internal' }))
          .then((callers) => {
            expect(callers).to.be.empty
          })
      })
    })
  })

  context('when synchronous', () => {
    before(() => knockknock.clearCache())

    it('should return callers (incl. packages) before "knocking" file', () => {
      const callers = internal.sync(helpers.createOptions())

      expect(callers).to.have.lengthOf(2)
      expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
        column: 16,
        file: 'internal/src/internal.js',
        line: 34,
        name: '<anonymous>',
        package: {
          directory: 'internal',
          main: 'internal/src/internal',
          name: 'internal',
          version: '2.0.1'
        }
      }))
      expect(callers[1]).to.deep.equal(helpers.resolveCallerForFixture({
        column: 4,
        file: 'internal/src/internal.js',
        line: 35,
        name: 'internalSyncFunction',
        package: {
          directory: 'internal',
          main: 'internal/src/internal',
          name: 'internal',
          version: '2.0.1'
        }
      }))
    })

    context('and first call is skipped via "offset"', () => {
      it('should return callers (incl. package) before file before "knocking" file', () => {
        const callers = internal.sync(helpers.createOptions({ offset: 1 }))

        expect(callers).to.have.lengthOf(1)
        expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
          column: 4,
          file: 'internal/src/internal.js',
          line: 35,
          name: 'internalSyncFunction',
          package: {
            directory: 'internal',
            main: 'internal/src/internal',
            name: 'internal',
            version: '2.0.1'
          }
        }))
      })
    })

    context('and limited to a single caller via "limit"', () => {
      it('should return only caller (incl. package) before "knocking" file', () => {
        const callers = internal.sync(helpers.createOptions({ limit: 1 }))

        expect(callers).to.have.lengthOf(1)
        expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
          column: 16,
          file: 'internal/src/internal.js',
          line: 34,
          name: '<anonymous>',
          package: {
            directory: 'internal',
            main: 'internal/src/internal',
            name: 'internal',
            version: '2.0.1'
          }
        }))
      })
    })

    context('and file before "knocking" file is excluded via "filterFiles"', () => {
      it('should return empty array', () => {
        const callers = internal.sync(helpers.createOptions({
          filterFiles: (filePath) => {
            return path.basename(filePath) !== 'internal.js'
          }
        }))

        expect(callers).to.be.empty
      })
    })

    context('and all files are excluded via "filterFiles"', () => {
      it('should return empty array', () => {
        const callers = internal.sync(helpers.createOptions({ filterFiles: () => false }))

        expect(callers).to.be.empty
      })
    })

    context('and package is excluded via "excludes"', () => {
      it('should return empty array', () => {
        const callers = internal.sync(helpers.createOptions({ excludes: 'internal' }))

        expect(callers).to.be.empty
      })
    })

    context('and package is excluded via "filterPackages"', () => {
      it('should return empty array', () => {
        const callers = internal.sync(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'internal' }))

        expect(callers).to.be.empty
      })
    })
  })
})
