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

const flat = require('./fixtures/flat/src/flat')
const helpers = require('./helpers')
const knockknock = require('../src/knockknock')

describe('knockknock:fixture:flat', () => {
  context('when asynchronous', () => {
    before(() => knockknock.clearCache())

    context('and module calls "knocking" module directly', () => {
      it('should return promise for callers (incl. packages) before "knocking" file', () => {
        return flat.foo(helpers.createOptions())
        .then((callers) => {
          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and first call is skipped via "offset"', () => {
        it('should return promise for empty array', () => {
          return flat.foo(helpers.createOptions({ offset: 1 }))
            .then((callers) => {
              expect(callers).to.be.empty
            })
        })
      })

      context('and limited to a single caller via "limit"', () => {
        it('should return promise for only caller (incl. package) before "knocking" file', () => {
          return flat.foo(helpers.createOptions({ limit: 1 }))
            .then((callers) => {
              expect(callers).to.have.lengthOf(1)
              expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
      })

      context('and file before "knocking" file is excluded via "filterFiles"', () => {
        it('should return promise for empty array', () => {
          return flat.foo(helpers.createOptions({ filterFiles: (filePath) => path.basename(filePath) !== 'flat.js' }))
            .then((callers) => {
              expect(callers).to.be.empty
            })
        })
      })

      context('and all files are excluded via "filterFiles"', () => {
        it('should return promise for empty array', () => {
          return flat.foo(helpers.createOptions({ filterFiles: () => false }))
            .then((callers) => {
              expect(callers).to.be.empty
            })
        })
      })

      context('and package for file before "knocking" file is excluded via "excludes"', () => {
        it('should return promise for empty array', () => {
          return flat.foo(helpers.createOptions({ excludes: 'flat' }))
            .then((callers) => {
              expect(callers).to.be.empty
            })
        })
      })

      context('and package for file before "knocking" file is excluded via "filterPackages"', () => {
        it('should return promise for empty array', () => {
          return flat.foo(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'flat' }))
            .then((callers) => {
              expect(callers).to.be.empty
            })
        })
      })
    })

    context('and module calls "knocking" module indirectly', () => {
      it('should return promise for callers (incl. packages) before "knocking" file', () => {
        return flat.bar(helpers.createOptions())
          .then((callers) => {
            expect(callers).to.have.lengthOf(2)
            expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
            expect(callers[1]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and first call is skipped via "offset"', () => {
        it('should return promise for callers (incl. package) before file before "knocking" file', () => {
          return flat.bar(helpers.createOptions({ offset: 1 }))
            .then((callers) => {
              expect(callers).to.have.lengthOf(1)
              expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and limited to a single caller via "limit"', () => {
        it('should return promise for only caller (incl. package) before "knocking" file', () => {
          return flat.bar(helpers.createOptions({ limit: 1 }))
            .then((callers) => {
              expect(callers).to.have.lengthOf(1)
              expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and file before "knocking" file is excluded via "filterFiles"', () => {
        it('should return promise for callers (incl. packages) before file before "knocking" file', () => {
          return flat.bar(helpers.createOptions({ filterFiles: (filePath) => path.basename(filePath) !== 'bar.js' }))
            .then((callers) => {
              expect(callers).to.have.lengthOf(1)
              expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and all files are excluded via "filterFiles"', () => {
        it('should return promise for empty array', () => {
          return flat.bar(helpers.createOptions({ filterFiles: () => false }))
            .then((callers) => {
              expect(callers).to.be.empty
            })
        })
      })

      context('and package for file before "knocking" file is excluded via "excludes"', () => {
        it('should return promise for callers (incl. packages) before file before "knocking" file', () => {
          return flat.bar(helpers.createOptions({ excludes: 'bar' }))
            .then((callers) => {
              expect(callers).to.have.lengthOf(1)
              expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and package for file before "knocking" file is excluded via "filterPackages"', () => {
        it('should return promise for callers (incl. packages) before file before "knocking" file', () => {
          return flat.bar(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'bar' }))
            .then((callers) => {
              expect(callers).to.have.lengthOf(1)
              expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and package for 2 files before "knocking" file package is excluded via "excludes"', () => {
        it('should return promise for callers (incl. packages) before "knocking" file', () => {
          return flat.bar(helpers.createOptions({ excludes: 'flat' }))
            .then((callers) => {
              expect(callers).to.have.lengthOf(1)
              expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and package for 2 files before "knocking" file package is excluded via "filterPackages"', () => {
        it('should return promise for callers (incl. packages) before "knocking" file', () => {
          return flat.bar(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'flat' }))
            .then((callers) => {
              expect(callers).to.have.lengthOf(1)
              expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and packages for files before "knocking" file are excluded via "excludes"', () => {
        it('should return promise for empty array', () => {
          return flat.bar(helpers.createOptions({ excludes: [ 'bar', 'flat' ] }))
            .then((callers) => {
              expect(callers).to.be.empty
            })
        })
      })

      context('and packages for files before "knocking" file are excluded via "filterPackages"', () => {
        it('should return promise for empty array', () => {
          return flat.bar(helpers.createOptions({ filterPackages: (pkg) => [ 'bar', 'flat' ].indexOf(pkg.name) < 0 }))
            .then((callers) => {
              expect(callers).to.be.empty
            })
        })
      })
    })
  })

  context('when synchronous', () => {
    before(() => knockknock.clearCache())

    context('and module calls "knocking" module directly', () => {
      it('should return callers (incl. packages) before "knocking" file', () => {
        const callers = flat.foo.sync(helpers.createOptions())

        expect(callers).to.have.lengthOf(1)
        expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and first call is skipped via "offset"', () => {
        it('should return empty array', () => {
          const callers = flat.foo.sync(helpers.createOptions({ offset: 1 }))

          expect(callers).to.be.empty
        })
      })

      context('and limited to a single caller via "limit"', () => {
        it('should return only caller (incl. package) before "knocking" file', () => {
          const callers = flat.foo.sync(helpers.createOptions({ limit: 1 }))

          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
      })

      context('and file before "knocking" file is excluded via "filterFiles"', () => {
        it('should return empty array', () => {
          const callers = flat.foo.sync(helpers.createOptions({
            filterFiles: (filePath) => {
              return path.basename(filePath) !== 'flat.js'
            }
          }))

          expect(callers).to.be.empty
        })
      })

      context('and all files are excluded via "filterFiles"', () => {
        it('should return empty array', () => {
          const callers = flat.foo.sync(helpers.createOptions({ filterFiles: () => false }))

          expect(callers).to.be.empty
        })
      })

      context('and package for file before "knocking" file is excluded via "excludes"', () => {
        it('should return empty array', () => {
          const callers = flat.foo.sync(helpers.createOptions({ excludes: 'flat' }))

          expect(callers).to.be.empty
        })
      })

      context('and package for file before "knocking" file is excluded via "filterPackages"', () => {
        it('should return empty array', () => {
          const callers = flat.foo.sync(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'flat' }))

          expect(callers).to.be.empty
        })
      })
    })

    context('and module calls "knocking" module indirectly', () => {
      it('should return callers (incl. packages) before "knocking" file', () => {
        const callers = flat.bar.sync(helpers.createOptions())

        expect(callers).to.have.lengthOf(2)
        expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
        expect(callers[1]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and first call is skipped via "offset"', () => {
        it('should return callers (incl. package) before file before "knocking" file', () => {
          const callers = flat.bar.sync(helpers.createOptions({ offset: 1 }))

          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and limited to a single caller via "limit"', () => {
        it('should return only caller (incl. package) before "knocking" file', () => {
          const callers = flat.bar.sync(helpers.createOptions({ limit: 1 }))

          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and file before "knocking" file is excluded via "filterFiles"', () => {
        it('should return callers (incl. packages) before file before "knocking" file', () => {
          const callers = flat.bar.sync(helpers.createOptions({
            filterFiles: (filePath) => {
              return path.basename(filePath) !== 'bar.js'
            }
          }))

          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and all files are excluded via "filterFiles"', () => {
        it('should return empty array', () => {
          const callers = flat.bar.sync(helpers.createOptions({ filterFiles: () => false }))

          expect(callers).to.be.empty
        })
      })

      context('and package for file before "knocking" file is excluded via "excludes"', () => {
        it('should return callers (incl. packages) before file before "knocking" file', () => {
          const callers = flat.bar.sync(helpers.createOptions({ excludes: 'bar' }))

          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and package for file before "knocking" file is excluded via "filterPackages"', () => {
        it('should return callers (incl. packages) before file before "knocking" file', () => {
          const callers = flat.bar.sync(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'bar' }))

          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and package for 2 files before "knocking" file package is excluded via "excludes"', () => {
        it('should return callers (incl. packages) before "knocking" file', () => {
          const callers = flat.bar.sync(helpers.createOptions({ excludes: 'flat' }))

          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and package for 2 files before "knocking" file package is excluded via "filterPackages"', () => {
        it('should return callers (incl. packages) before "knocking" file', () => {
          const callers = flat.bar.sync(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'flat' }))

          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and packages for files before "knocking" file are excluded via "excludes"', () => {
        it('should return empty array', () => {
          const callers = flat.bar.sync(helpers.createOptions({ excludes: [ 'bar', 'flat' ] }))

          expect(callers).to.be.empty
        })
      })

      context('and packages for files before "knocking" file are excluded via "filterPackages"', () => {
        it('should return empty array', () => {
          const callers = flat.bar.sync(helpers.createOptions({
            filterPackages: (pkg) => {
              return [ 'bar', 'flat' ].indexOf(pkg.name) < 0
            }
          }))

          expect(callers).to.be.empty
        })
      })
    })
  })
})
