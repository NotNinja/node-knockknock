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
const nested = require('./fixtures/nested/src/nested')

describe('knockknock:fixture:nested', () => {
  context('when asynchronous', () => {
    before(() => knockknock.clearCache())

    context('and module calls "knocking" module directly', () => {
      it('should return promise for callers (incl. packages) before "knocking" file', () => {
        return nested.foo(helpers.createOptions())
          .then((callers) => {
            expect(callers).to.have.lengthOf(1)
            expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and first call is skipped via "offset"', () => {
        it('should return promise for empty array', () => {
          return nested.foo(helpers.createOptions({ offset: 1 }))
            .then((callers) => {
              expect(callers).to.be.empty
            })
        })
      })

      context('and limited to a single caller via "limit"', () => {
        it('should return promise for only caller (incl. package) before "knocking" file', () => {
          return nested.foo(helpers.createOptions({ limit: 1 }))
            .then((callers) => {
              expect(callers).to.have.lengthOf(1)
              expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
      })

      context('and file before "knocking" file is excluded via "filterFiles"', () => {
        it('should return promise for empty array', () => {
          return nested.foo(helpers.createOptions({
            filterFiles: (filePath) => {
              return path.basename(filePath) !== 'nested.js'
            }
          }))
            .then((callers) => {
              expect(callers).to.be.empty
            })
        })
      })

      context('and all files are excluded via "filterFiles"', () => {
        it('should return promise for empty array', () => {
          return nested.foo(helpers.createOptions({ filterFiles: () => false }))
            .then((callers) => {
              expect(callers).to.be.empty
            })
        })
      })

      context('and package for file before "knocking" file is excluded via "excludes"', () => {
        it('should return promise for empty array', () => {
          return nested.foo(helpers.createOptions({ excludes: 'nested' }))
            .then((callers) => {
              expect(callers).to.be.empty
            })
        })
      })

      context('and package for file before "knocking" file is excluded via "filterPackages"', () => {
        it('should return promise for empty array', () => {
          return nested.foo(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'nested' }))
            .then((callers) => {
              expect(callers).to.be.empty
            })
        })
      })
    })

    context('and module calls "knocking" module indirectly', () => {
      it('should return promise for callers (incl. packages) before "knocking" file', () => {
        return nested.bar(helpers.createOptions())
          .then((callers) => {
            expect(callers).to.have.lengthOf(2)
            expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
            expect(callers[1]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and first call is skipped via "offset"', () => {
        it('should return promise for callers (incl. package) before file before "knocking" file', () => {
          return nested.bar(helpers.createOptions({ offset: 1 }))
            .then((callers) => {
              expect(callers).to.have.lengthOf(1)
              expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and limited to a single caller via "limit"', () => {
        it('should return promise for only caller (incl. package) before "knocking" file', () => {
          return nested.bar(helpers.createOptions({ limit: 1 }))
            .then((callers) => {
              expect(callers).to.have.lengthOf(1)
              expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and file before "knocking" file is excluded via "filterFiles"', () => {
        it('should return promise for callers (incl. packages) before file before "knocking" file', () => {
          return nested.bar(helpers.createOptions({ filterFiles: (filePath) => path.basename(filePath) !== 'bar.js' }))
            .then((callers) => {
              expect(callers).to.have.lengthOf(1)
              expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and all files are excluded via "filterFiles"', () => {
        it('should return promise for empty array', () => {
          return nested.bar(helpers.createOptions({ filterFiles: () => false }))
            .then((callers) => {
              expect(callers).to.be.empty
            })
        })
      })

      context('and package for file before "knocking" file is excluded via "excludes"', () => {
        it('should return promise for callers (incl. packages) before file before "knocking" file', () => {
          return nested.bar(helpers.createOptions({ excludes: 'bar' }))
            .then((callers) => {
              expect(callers).to.have.lengthOf(1)
              expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and package for file before "knocking" file is excluded via "filterPackages"', () => {
        it('should return promise for callers (incl. packages) before file before "knocking" file', () => {
          return nested.bar(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'bar' }))
            .then((callers) => {
              expect(callers).to.have.lengthOf(1)
              expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and package for 2 files before "knocking" file package is excluded via "excludes"', () => {
        it('should return promise for callers (incl. packages) before "knocking" file', () => {
          return nested.bar(helpers.createOptions({ excludes: 'nested' }))
            .then((callers) => {
              expect(callers).to.have.lengthOf(1)
              expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and package for 2 files before "knocking" file package is excluded via "filterPackages"', () => {
        it('should return promise for callers (incl. packages) before "knocking" file', () => {
          return nested.bar(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'nested' }))
            .then((callers) => {
              expect(callers).to.have.lengthOf(1)
              expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and packages for files before "knocking" file are excluded via "excludes"', () => {
        it('should return promise for empty array', () => {
          return nested.bar(helpers.createOptions({ excludes: [ 'bar', 'nested' ] }))
            .then((callers) => {
              expect(callers).to.be.empty
            })
        })
      })

      context('and packages for files before "knocking" file are excluded via "filterPackages"', () => {
        it('should return promise for empty array', () => {
          return nested.bar(helpers.createOptions({
            filterPackages: (pkg) => {
              return [ 'bar', 'nested' ].indexOf(pkg.name) < 0
            }
          }))
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
        const callers = nested.foo.sync(helpers.createOptions())

        expect(callers).to.have.lengthOf(1)
        expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and first call is skipped via "offset"', () => {
        it('should return empty array', () => {
          const callers = nested.foo.sync(helpers.createOptions({ offset: 1 }))

          expect(callers).to.be.empty
        })
      })

      context('and limited to a single caller via "limit"', () => {
        it('should return only caller (incl. package) before "knocking" file', () => {
          const callers = nested.foo.sync(helpers.createOptions({ limit: 1 }))

          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
      })

      context('and file before "knocking" file is excluded via "filterFiles"', () => {
        it('should return empty array', () => {
          const callers = nested.foo.sync(helpers.createOptions({
            filterFiles: (filePath) => {
              return path.basename(filePath) !== 'nested.js'
            }
          }))

          expect(callers).to.be.empty
        })
      })

      context('and all files are excluded via "filterFiles"', () => {
        it('should return empty array', () => {
          const callers = nested.foo.sync(helpers.createOptions({ filterFiles: () => false }))

          expect(callers).to.be.empty
        })
      })

      context('and package for file before "knocking" file is excluded via "excludes"', () => {
        it('should return empty array', () => {
          const callers = nested.foo.sync(helpers.createOptions({ excludes: 'nested' }))

          expect(callers).to.be.empty
        })
      })

      context('and package for file before "knocking" file is excluded via "filterPackages"', () => {
        it('should return empty array', () => {
          const callers = nested.foo.sync(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'nested' }))

          expect(callers).to.be.empty
        })
      })
    })

    context('and module calls "knocking" module indirectly', () => {
      it('should return callers (incl. packages) before "knocking" file', () => {
        const callers = nested.bar.sync(helpers.createOptions())

        expect(callers).to.have.lengthOf(2)
        expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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
        expect(callers[1]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and first call is skipped via "offset"', () => {
        it('should return callers (incl. package) before file before "knocking" file', () => {
          const callers = nested.bar.sync(helpers.createOptions({ offset: 1 }))

          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and limited to a single caller via "limit"', () => {
        it('should return only caller (incl. package) before "knocking" file', () => {
          const callers = nested.bar.sync(helpers.createOptions({ limit: 1 }))

          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and file before "knocking" file is excluded via "filterFiles"', () => {
        it('should return callers (incl. packages) before file before "knocking" file', () => {
          const callers = nested.bar.sync(helpers.createOptions({
            filterFiles: (filePath) => {
              return path.basename(filePath) !== 'bar.js'
            }
          }))

          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and all files are excluded via "filterFiles"', () => {
        it('should return empty array', () => {
          const callers = nested.bar.sync(helpers.createOptions({ filterFiles: () => false }))

          expect(callers).to.be.empty
        })
      })

      context('and package for file before "knocking" file is excluded via "excludes"', () => {
        it('should return callers (incl. packages) before file before "knocking" file', () => {
          const callers = nested.bar.sync(helpers.createOptions({ excludes: 'bar' }))

          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and package for file before "knocking" file is excluded via "filterPackages"', () => {
        it('should return callers (incl. packages) before file before "knocking" file', () => {
          const callers = nested.bar.sync(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'bar' }))

          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and package for 2 files before "knocking" file package is excluded via "excludes"', () => {
        it('should return callers (incl. packages) before "knocking" file', () => {
          const callers = nested.bar.sync(helpers.createOptions({ excludes: 'nested' }))

          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and package for 2 files before "knocking" file package is excluded via "filterPackages"', () => {
        it('should return callers (incl. packages) before "knocking" file', () => {
          const callers = nested.bar.sync(helpers.createOptions({ filterPackages: (pkg) => pkg.name !== 'nested' }))

          expect(callers).to.have.lengthOf(1)
          expect(callers[0]).to.deep.equal(helpers.resolveCallerForFixture({
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

      context('and packages for files before "knocking" file are excluded via "excludes"', () => {
        it('should return empty array', () => {
          const callers = nested.bar.sync(helpers.createOptions({ excludes: [ 'bar', 'nested' ] }))

          expect(callers).to.be.empty
        })
      })

      context('and packages for files before "knocking" file are excluded via "filterPackages"', () => {
        it('should return empty array', () => {
          const callers = nested.bar.sync(helpers.createOptions({
            filterPackages: (pkg) => {
              return [ 'bar', 'nested' ].indexOf(pkg.name) < 0
            }
          }))

          expect(callers).to.be.empty
        })
      })
    })
  })
})
