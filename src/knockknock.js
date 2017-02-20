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

const debug = require('debug')('knockknock')
const getStack = require('callsite')
const path = require('path')
const pkgDir = require('pkg-dir')

const version = require('../package.json').version

/**
 * A cache containing packages mapped to file paths.
 *
 * The intension of this cache is to speed up package lookups for repeat callers by avoiding file system traversal.
 *
 * @private
 * @type {Map.<string, knockknock~Package>}
 */
const packageCache = new Map()

/**
 * Analyzes each frame in the call stack to find as much information about the caller as possible.
 *
 * @private
 */
class Finder {

  /**
   * Generates the caller information by combining the specified <code>filePath</code> with the <code>pkg</code> and
   * stack <code>frame</code> information provided.
   *
   * @param {string} filePath - the path of the caller file
   * @param {knockknock~Package} pkg - the information for the caller's package
   * @param {CallSite} frame - the current stack frame
   * @return {knockknock~Caller} The combined caller information.
   * @private
   * @static
   */
  static _buildCaller(filePath, pkg, frame) {
    return {
      column: frame.getColumnNumber(),
      file: filePath,
      line: frame.getLineNumber(),
      name: frame.getFunctionName() || '<anonymous>',
      package: pkg ? Object.assign({}, pkg) : null
    }
  }

  /**
   * Asynchronously finds the first parent directory of the specified <code>filePath</code> that contains a
   * <code>package.json</code> file and then returns it to the <code>callback</code> function provided.
   *
   * This method returns a <code>Promise</code> chained using the <code>callback</code> function so that it can be
   * returned by {@link Finder#findNext}. The <code>Promise</code> is resolved with <code>null</code> if no package
   * directory could be found.
   *
   * @param {string} filePath - the path of the file whose package directory is to be found
   * @param {knockknock~FindPackageDirectoryCallback} callback - the function to be called with the path of the package
   * directory
   * @return {Promise.<Error, knockknock~Caller>} The result of calling <code>callback</code>.
   * @private
   * @static
   */
  static _findPackageDirectory(filePath, callback) {
    return pkgDir(filePath).then(callback)
  }

  /**
   * Synchronously finds the first parent directory of the specified <code>filePath</code> that contains a
   * <code>package.json</code> file and passes it to the <code>callback</code> function provided.
   *
   * This method returns the return value of the <code>callback</code> function so that it can be returned by
   * {@link Finder#findNext}. <code>null</code> is returned if no package directory could be found.
   *
   * @param {string} filePath - the path of the file whose package directory is to be found
   * @param {knockknock~FindPackageDirectoryCallback} callback - the function to be called with the path of the package
   * directory
   * @return {?knockknock~Caller} The result of calling <code>callback</code> or <code>null</code> if no package
   * directory was found.
   * @private
   * @static
   */
  static _findPackageDirectorySync(filePath, callback) {
    return callback(pkgDir.sync(filePath))
  }

  /**
   * Returns the information for the package installed at the specified directory path.
   *
   * This information contains <code>dirPath</code> as well as the <code>name</code>, <code>version</code>, and the
   * <code>main</code> file (absolute) read from the <code>package.json</code> file.
   *
   * @param {string} dirPath - the path of the installation directory for the package whose information is to be
   * returned
   * @return {knockknock~Package} The information for the package installed within <code>dirPath</code>.
   * @private
   * @static
   */
  static _getPackage(dirPath) {
    debug('Attempting to retrieve information for package installed in directory: %s', dirPath)

    const pkg = require(path.join(dirPath, 'package.json'))

    return {
      directory: dirPath,
      main: pkg.main ? path.join(dirPath, pkg.main) : null,
      name: pkg.name,
      version: pkg.version
    }
  }

  /**
   * Returns whether the specified <code>filePath</code> is internal.
   *
   * A file is considered to be internal if it is either this module (i.e. <code>knockknock.js</code>) or is not
   * absolute. The latter case is a quick and dirty way of identifying Node.js internal files as they are not given
   * absolute file paths in stack traces, without the need for a call to <code>fs</code> to determine whether the file
   * actually exists in the current working directory.
   *
   * @param {string} filePath - the path of the file to be checked
   * @return {boolean} <code>true</code> if <code>filePath</code> is internal; otherwise <code>false</code>.
   * @private
   * @static
   */
  static _isInternal(filePath) {
    return filePath === module.filename || !path.isAbsolute(filePath)
  }

  /**
   * Parses the optional input <code>options</code> provided, normalizing options and applying default values where
   * needed.
   *
   * @param {?knockknock~Options} options - the input options to be parsed (may be <code>null</code> if none were
   * provided)
   * @return {knockknock~Options} A new options object based on <code>options</code>.
   * @private
   * @static
   */
  static _parseOptions(options) {
    if (!options) {
      options = {}
    }

    let excludes = [ 'knockknock' ]
    if (options.excludes) {
      excludes = excludes.concat(options.excludes)
    }

    return {
      excludes,
      filterFiles: options.filterFiles,
      filterPackages: options.filterPackages
    }
  }

  /**
   * Creates an instance of {@link Finder} using the optional <code>options</code> provided.
   *
   * <code>sync</code> can be used to control whether package directory searches are performed synchronously or
   * asynchronously.
   *
   * @param {boolean} [sync] - <code>true</code> if package directory searches should be synchronous or
   * <code>false</code> if they should be asynchronous (may be <code>null</code>)
   * @param {knockknock~Options} [options] - the optional options to be used (may be <code>null</code>)
   * @public
   */
  constructor(sync, options) {
    /**
     * The call stack captured by this {@link Finder}.
     *
     * The first 3 frames are excluded from the stack as these will always relate to either this module (i.e.
     * <code>knockknock.js</code>) or the module that is trying to determine its caller.
     *
     * @private
     * @type {CallSite[]}
     */
    this._stack = getStack().slice(3)

    /**
     * The parsed options for this {@link Finder}.
     *
     * @private
     * @type {knockknock~Options}
     */
    this._options = Finder._parseOptions(options)

    /**
     * Whether package directory searches initiated by this {@link Finder} should be made synchronously.
     *
     * @private
     * @type {boolean}
     */
    this._sync = sync
  }

  /**
   * Removes the first frame from the call stack of this {@link Finder} and attempts to find information on the file
   * responsible for that call as well as the package that owns it.
   *
   * If there are no more frames in the call stack then this method will return <code>null</code>. If the file
   * responsible for the call but no package could be found for the responsible file, then the caller information will
   * only include the path of the file.
   *
   * This method will directly return the caller information if this {@link Finder} is synchronous. Otherwise, this
   * method will return a <code>Promise</code> which will be resolved with the caller information once it has been
   * found.
   *
   * @return {?knockknock~Caller|Promise.<Error, knockknock~Caller>} The caller information (or a <code>Promise</code>
   * resolved with it when asynchronous) or <code>null</code> if there are no more frames in the call stack.
   * @public
   */
  findNext() {
    const frame = this._stack.shift()
    if (!frame) {
      debug('Unable to find calling package')

      return null
    }

    const filePath = frame.getFileName()
    if (Finder._isInternal(filePath)) {
      debug('Skipping call from internal file: %s', filePath)

      return this.findNext()
    }

    if (packageCache.has(filePath)) {
      return this._handlePackage(packageCache.get(filePath), filePath, frame)
    }

    debug('Attempting to find installation directory for package containing file: %s', filePath)

    const packageDirFinder = Finder[this._sync ? '_findPackageDirectorySync' : '_findPackageDirectory']
    return packageDirFinder(filePath, (dirPath) => {
      const pkg = dirPath != null ? Finder._getPackage(dirPath) : null

      packageCache.set(filePath, pkg)

      return this._handlePackage(pkg, filePath, frame)
    })
  }

  /**
   * Handles the specified package containing the <code>filePath</code> provided.
   *
   * <code>pkg</code> will be <code>null</code> if no parent package could be found for <code>filePath</code>, in which
   * case this method will return the caller information without the package information.
   *
   * If <code>pkg</code> has been excluded, this method will call {@link Finder#findNext} to try and find the
   * information for the next caller and, as such, shares the same return values. Otherwise, this method will return the
   * caller information complete with details on the containing package.
   *
   * The given stack <code>frame</code> is used to build the caller information, where necessary.
   *
   * @param {?knockknock~Package} pkg - the information for the package responsible for the current call in the stack
   * (may be <code>null</code> if none could be found)
   * @param {string} filePath - the path of the file responsible for the current call in the stack
   * @param {CallSite} frame - the current stack frame
   * @return {?knockknock~Caller|Promise.<Error, knockknock~Caller>} The caller information (or a <code>Promise</code>
   * resolved with it when asynchronous) or <code>null</code> if there are no more frames in the call stack.
   * @private
   */
  _handlePackage(pkg, filePath, frame) {
    if (pkg == null) {
      debug('Unable to find package containing file: %s', filePath)

      return Finder._buildCaller(filePath, null, frame)
    }

    debug('Found package "%s" containing file: %s', pkg.name, filePath)

    if (!this._isPackageIncluded(pkg)) {
      debug('Skipping call within package "%s" from file: %s', pkg.name, filePath)

      return this.findNext()
    } else if (!this._isFileIncluded(filePath)) {
      debug('Skipping call from file: %s', filePath)

      return this.findNext()
    }

    return Finder._buildCaller(filePath, pkg, frame)
  }

  /**
   * Returns whether a call originating from the specifed <code>filePath</code> should be included.
   *
   * This is determined using the runtime options that were passed in.
   *
   * @param {string} filePath - the path of the file responsible for the current call in the stack
   * @return {boolean} <code>true</code> if the call from <code>filePath</code> should be included; otherwise
   * <code>false</code>.
   * @private
   */
  _isFileIncluded(filePath) {
    return !this._options.filterFiles || this._options.filterFiles(filePath)
  }

  /**
   * Returns whether a call originating from a file contained within the <code>pkg</code> provided should be included.
   *
   * This is determined using the runtime options that were passed in.
   *
   * @param {?knockknock~Package} pkg - the information for the package responsible for the current call in the stack
   * (may be <code>null</code> if none could be found)
   * @return {boolean} <code>true</code> if the call from within <code>pkg</code> should be included; otherwise
   * <code>false</code>.
   * @private
   */
  _isPackageIncluded(pkg) {
    // TODO: #7 Only perform this check when pkg is not null
    if (this._options.excludes.indexOf(pkg.name) >= 0) {
      return false
    }

    return !this._options.filterPackages || this._options.filterPackages(Object.assign({}, pkg))
  }

}

/**
 * Generates a call stack and analyzes each frame to find as much information as possible on the file responsible for
 * calling the code that invoked this method.
 *
 * This information includes the path of the file responsible as well as some basic information on the package it is
 * contained within, where applicable. The package information is retrieved from its <code>package.json</code> file
 * <b>asynchronously</b>.
 *
 * Calls made internally from within knockknock and Node.js are always ignored and calls from within specific packages
 * can be excluded via <code>options.excludes</code>. The returned <code>Promise</code> will be resolved with
 * <code>null</code> if no call could be found or all calls were skipped for reasons just mentioned.
 *
 * @param {knockknock~Options} [options] - the options to be used (may be <code>null</code>)
 * @return {Promise.<Error, knockknock~Caller>} A <code>Promise</code> for retrieving the information for the caller of
 * the request origin, which may be <code>null</code> if none could be found.
 * @public
 * @static
 */
module.exports = function whoIsThere(options) {
  return Promise.resolve(new Finder(false, options).findNext())
}

/**
 * Clears the cache containing packages mapped to file paths which is used to speed up package lookups for repeat
 * callers by avoiding file system traversal.
 *
 * @return {void}
 * @protected
 * @static
 */
module.exports.clearCache = function clearCache() {
  packageCache.clear()
}

/**
 * Generates a call stack and analyzes each frame to find as much information as possible on the file responsible for
 * calling the code that invoked this method.
 *
 * This information includes the path of the file responsible as well as some basic information on the package it is
 * contained within, where applicable. The package information is retrieved from its <code>package.json</code> file
 * <b>synchronously</b>.
 *
 * Calls made internally from within knockknock and Node.js are always ignored and calls from within specific packages
 * can be excluded via <code>options.excludes</code>. This method will return <code>null</code> if no call could be
 * found or all calls were skipped for reasons just mentioned.
 *
 * @param {knockknock~Options} [options] - the options to be used (may be <code>null</code>)
 * @return {?knockknock~Caller} The information for the caller of the request origin or <code>null</code> if none could
 * be found.
 * @public
 * @static
 */
module.exports.sync = function whoIsThereSync(options) {
  return new Finder(true, options).findNext()
}

/**
 * The current version of KnockKnock.
 *
 * @public
 * @static
 * @type {string}
 */
module.exports.version = version

/**
 * Called with path of the current file that is being processed to allow consumers to make a decision on whether the
 * file is to be included.
 *
 * @callback knockknock~FilterFilesCallback
 * @param {string} filePath - the path of the current file being processed
 * @return {boolean} <code>true</code> to include calls originating from <code>filePath</code>; otherwise
 * <code>false</code>.
 */

/**
 * Called with the information for the package containing the current file that is being processed to allow consumers to
 * make a decision on whether files within the specified package are to be included.
 *
 * If the current file being processed does not belong to a package, then the decision returned will apply to <b>all</b>
 * unpackaged files.
 *
 * @callback knockknock~FilterPackagesCallback
 * @param {?knockknock~Package} pkg - the package information for the current file being processed (may be
 * <code>null</code> if no package was found)
 * @return {boolean} <code>true</code> to include calls originating from files within the package (or all unpackaged
 * files, if <code>pkg</code> is <code>null</code>); otherwise <code>false</code>.
 */

/**
 * Called with the installation directory of a package containing the calling file.
 *
 * @callback knockknock~FindPackageDirectoryCallback
 * @param {?string} dirPath - the path to the package installation directory (may be <code>null</code> if none could be
 * found)
 * @return {?knockknock~Caller|Promise.<Error, knockknock~Caller>} The caller information (or a <code>Promise</code>
 * resolved with it when asynchronous) or <code>null</code> if there are no more frames in the call stack.
 */

/**
 * Contains information for the caller of the origin.
 *
 * Information about the package containing the file responsible for calling the origin is only included where possible.
 *
 * @typedef {Object} knockknock~Caller
 * @property {string} file - The path of the file responsible for calling the origin.
 * @property {number} line - The line number within <code>file</code> that was responsible for calling the origin.
 * @property {string} name - The name of the function within <code>file</code> that was responsible for calling the
 * origin or <code>&lt;anonymous&gt;</code> if the function was anonymous.
 * @property {?knockknock~Package} package - The information for the package responsible for calling the origin (may be
 * <code>null</code> if no package could be found).
 */

/**
 * Contains some basic information for an individual package.
 *
 * @typedef {Object} knockknock~Package
 * @property {string} directory - The path to the installation directory of the package.
 * @property {?string} main - The path to the main file for the package (may be <code>null</code> if it has no
 * <code>main</code> entry).
 * @property {string} name - The name of the package.
 * @property {string} version - The version of the package.
 */

/**
 * The options to be used to find the caller of the origin.
 *
 * @typedef {Object} knockknock~Options
 * @property {string|string[]} [excludes] - The names of packages whose calls should be ignored when trying to find the
 * caller.
 * @property {knockknock~FilterFilesCallback} [filterFiles] - A function to be called to filter files based on their
 * path. This is only called for files contained within included packages (if any).
 * @property {knockknock~FilterPackagesCallback} [filterPackages] - A function to be called to filter files based on the
 * package to which they belong (if any). This is only called for packages whose names are not listed in
 * <code>excludes</code>.
 */
