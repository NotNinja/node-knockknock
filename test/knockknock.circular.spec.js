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

    it('should return promise for callers (incl. packages) before "knocking" file', () => {
      return circular(helpers.createOptions())
        .then((callers) => {
          expect(callers).to.have.lengthOf(3)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
          expect(callers[1]).to.deep.equal(helpers.resolveCallerForFixture({
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
          expect(callers[2]).to.deep.equal(helpers.resolveCallerForFixture({
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

    context('and first call is skipped via "offset"', () => {
      it('should return promise for callers (incl. package) before file before "knocking" file', () => {
        return circular(helpers.createOptions({ offset: 1 }))
          .then((callers) => {
            expect(callers).to.have.lengthOf(2)
            expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
            expect(callers[1]).to.deep.equal(helpers.resolveCallerForFixture({
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

    context('and limited to a single caller via "limit"', () => {
      it('should return promise for only caller (incl. package) before "knocking" file', () => {
        return circular(helpers.createOptions({ limit: 1 }))
          .then((callers) => {
            expect(callers).to.have.lengthOf(1)
            expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
    })

    context('and file before "knocking" file is excluded via "filterFiles"', () => {
      it('should return promise for callers (incl. packages) before file before "knocking" file', () => {
        return circular(helpers.createOptions({ filterFiles: (filePath) => path.basename(filePath) !== 'bar.js' }))
          .then((callers) => {
            expect(callers).to.have.lengthOf(2)
            expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
            expect(callers[1]).to.deep.equal(helpers.resolveCallerForFixture({
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

    context('and "knocking" file and file before are excluded via "filterFiles"', () => {
      it('should return promise for callers (incl. packages) before 2 files before "knocking" file', () => {
        return circular(helpers.createOptions({
          filterFiles: (filePath) => {
            return [ 'bar.js', 'foo.js' ].indexOf(path.basename(filePath)) < 0
          }
        }))
          .then((callers) => {
            expect(callers).to.have.lengthOf(1)
            expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
      it('should return promise for empty array', () => {
        return circular(helpers.createOptions({ filterFiles: () => false }))
          .then((callers) => {
            expect(callers).to.be.empty
          })
      })
    })

    context('and package is excluded via "excludes"', () => {
      it('should return promise for empty array', () => {
        return circular(helpers.createOptions({ excludes: 'circular' }))
          .then((callers) => {
            expect(callers).to.be.empty
          })
      })
    })

    context('and package is excluded via "filterPackages"', () => {
      it('should return promise for empty array', () => {
        return circular(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'circular' }))
          .then((callers) => {
            expect(callers).to.be.empty
          })
      })
    })
  })

  context('when synchronous', () => {
    before(() => knockknock.clearCache())

    it('should return callers (incl. packages) before "knocking" file', () => {
      const callers = circular.sync(helpers.createOptions())

      expect(callers).to.have.lengthOf(3)
      expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
      expect(callers[1]).to.deep.equal(helpers.resolveCallerForFixture({
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
      expect(callers[2]).to.deep.equal(helpers.resolveCallerForFixture({
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

    context('and first call is skipped via "offset"', () => {
      it('should return promise for callers (incl. package) before file before "knocking" file', () => {
        const callers = circular.sync(helpers.createOptions({ offset: 1 }))

        expect(callers).to.have.lengthOf(2)
        expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
        expect(callers[1]).to.deep.equal(helpers.resolveCallerForFixture({
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

    context('and limited to a single caller via "limit"', () => {
      it('should return promise for only caller (incl. package) before "knocking" file', () => {
        const callers = circular.sync(helpers.createOptions({ limit: 1 }))

        expect(callers).to.have.lengthOf(1)
        expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
    })

    context('and file before "knocking" file is excluded via "filterFiles"', () => {
      it('should return callers (incl. packages) before file before "knocking" file', () => {
        const callers = circular.sync(helpers.createOptions({
          filterFiles: (filePath) => {
            return path.basename(filePath) !== 'bar.js'
          }
        }))

        expect(callers).to.have.lengthOf(2)
        expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
        expect(callers[1]).to.deep.equal(helpers.resolveCallerForFixture({
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

    context('and "knocking" file and file before are excluded via "filterFiles"', () => {
      it('should return callers (incl. packages) before 2 files before "knocking" file', () => {
        const callers = circular.sync(helpers.createOptions({
          filterFiles: (filePath) => {
            return [ 'bar.js', 'foo.js' ].indexOf(path.basename(filePath)) < 0
          }
        }))

        expect(callers).to.have.lengthOf(1)
        expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
      it('should return empty array', () => {
        const callers = circular.sync(helpers.createOptions({ filterFiles: () => false }))

        expect(callers).to.be.empty
      })
    })

    context('and package is excluded via "excludes"', () => {
      it('should return empty array', () => {
        const callers = circular.sync(helpers.createOptions({ excludes: 'circular' }))

        expect(callers).to.be.empty
      })
    })

    context('and package is excluded via "filterPackages"', () => {
      it('should return empty array', () => {
        const callers = circular.sync(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'circular' }))

        expect(callers).to.be.empty
      })
    })
  })
})
