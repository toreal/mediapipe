//javascript/closure/base.js
/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Bootstrap for the Google JS Library (Closure).
 *
 * In uncompiled mode base.js will attempt to load Closure's deps file, unless
 * the global <code>CLOSURE_NO_DEPS</code> is set to true.  This allows projects
 * to include their own deps file(s) from different locations.
 *
 * Avoid including base.js more than once. This is strictly discouraged and not
 * supported. goog.require(...) won't work properly in that case.
 *
 * @provideGoog
 */


/**
 * @define {boolean} Overridden to true by the compiler.
 */
var COMPILED = false;


/**
 * Base namespace for the Closure library.  Checks to see goog is already
 * defined in the current scope before assigning to prevent clobbering if
 * base.js is loaded more than once.
 *
 * @const
 */
var goog = goog || {};

/**
 * Reference to the global object.
 * https://www.ecma-international.org/ecma-262/9.0/index.html#sec-global-object
 *
 * More info on this implementation here:
 * https://docs.google.com/document/d/1NAeW4Wk7I7FV0Y2tcUFvQdGMc89k2vdgSXInw8_nvCI/edit
 *
 * @const
 * @suppress {undefinedVars} self won't be referenced unless `this` is falsy.
 * @type {!Global}
 */
goog.global =
    // Check `this` first for backwards compatibility.
    // Valid unless running as an ES module or in a function wrapper called
    //   without setting `this` properly.
    // Note that base.js can't usefully be imported as an ES module, but it may
    // be compiled into bundles that are loadable as ES modules.
    this ||
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/self
    // For in-page browser environments and workers.
    self;


/**
 * A hook for overriding the define values in uncompiled mode.
 *
 * In uncompiled mode, `CLOSURE_UNCOMPILED_DEFINES` may be defined before
 * loading base.js.  If a key is defined in `CLOSURE_UNCOMPILED_DEFINES`,
 * `goog.define` will use the value instead of the default value.  This
 * allows flags to be overwritten without compilation (this is normally
 * accomplished with the compiler's "define" flag).
 *
 * Example:
 * <pre>
 *   var CLOSURE_UNCOMPILED_DEFINES = {'goog.DEBUG': false};
 * </pre>
 *
 * @type {Object<string, (string|number|boolean)>|undefined}
 */
goog.global.CLOSURE_UNCOMPILED_DEFINES;


/**
 * A hook for overriding the define values in uncompiled or compiled mode,
 * like CLOSURE_UNCOMPILED_DEFINES but effective in compiled code.  In
 * uncompiled code CLOSURE_UNCOMPILED_DEFINES takes precedence.
 *
 * Also unlike CLOSURE_UNCOMPILED_DEFINES the values must be number, boolean or
 * string literals or the compiler will emit an error.
 *
 * While any @define value may be set, only those set with goog.define will be
 * effective for uncompiled code.
 *
 * Example:
 * <pre>
 *   var CLOSURE_DEFINES = {'goog.DEBUG': false} ;
 * </pre>
 *
 * @type {Object<string, (string|number|boolean)>|undefined}
 */
goog.global.CLOSURE_DEFINES;


/**
 * Builds an object structure for the provided namespace path, ensuring that
 * names that already exist are not overwritten. For example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by goog.provide and goog.exportSymbol.
 * @param {string} name The name of the object that this file defines.
 * @param {*=} object The object to expose at the end of the path.
 * @param {boolean=} overwriteImplicit If object is set and a previous call
 *     implicitly constructed the namespace given by name, this parameter
 *     controls whether object should overwrite the implicitly constructed
 *     namespace or be merged into it. Defaults to false.
 * @param {?Object=} objectToExportTo The object to add the path to; if this
 *     field is not specified, its value defaults to `goog.global`.
 * @private
 */
goog.exportPath_ = function(name, object, overwriteImplicit, objectToExportTo) {
  var parts = name.split('.');
  var cur = objectToExportTo || goog.global;

  // Internet Explorer exhibits strange behavior when throwing errors from
  // methods externed in this manner.  See the testExportSymbolExceptions in
  // base_test.html for an example.
  if (!(parts[0] in cur) && typeof cur.execScript != 'undefined') {
    cur.execScript('var ' + parts[0]);
  }

  for (var part; parts.length && (part = parts.shift());) {
    if (!parts.length && object !== undefined) {
      if (!overwriteImplicit && goog.isObject(object) &&
          goog.isObject(cur[part])) {
        // Merge properties on object (the input parameter) with the existing
        // implicitly defined namespace, so as to not clobber previously
        // defined child namespaces.
        for (var prop in object) {
          if (object.hasOwnProperty(prop)) {
            cur[part][prop] = object[prop];
          }
        }
      } else {
        // Either there is no existing implicit namespace, or overwriteImplicit
        // is set to true, so directly assign object (the input parameter) to
        // the namespace.
        cur[part] = object;
      }
    } else if (cur[part] && cur[part] !== Object.prototype[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};


/**
 * Defines a named value. In uncompiled mode, the value is retrieved from
 * CLOSURE_DEFINES or CLOSURE_UNCOMPILED_DEFINES if the object is defined and
 * has the property specified, and otherwise used the defined defaultValue.
 * When compiled the default can be overridden using the compiler options or the
 * value set in the CLOSURE_DEFINES object. Returns the defined value so that it
 * can be used safely in modules. Note that the value type MUST be either
 * boolean, number, or string.
 *
 * @param {string} name The distinguished name to provide.
 * @param {T} defaultValue
 * @return {T} The defined value.
 * @template T
 */
goog.define = function(name, defaultValue) {
  var value = defaultValue;
  if (!COMPILED) {
    var uncompiledDefines = goog.global.CLOSURE_UNCOMPILED_DEFINES;
    var defines = goog.global.CLOSURE_DEFINES;
    if (uncompiledDefines &&
        // Anti DOM-clobbering runtime check (b/37736576).
        /** @type {?} */ (uncompiledDefines).nodeType === undefined &&
        Object.prototype.hasOwnProperty.call(uncompiledDefines, name)) {
      value = uncompiledDefines[name];
    } else if (
        defines &&
        // Anti DOM-clobbering runtime check (b/37736576).
        /** @type {?} */ (defines).nodeType === undefined &&
        Object.prototype.hasOwnProperty.call(defines, name)) {
      value = defines[name];
    }
  }
  return value;
};


/**
 * @define {number} Integer year indicating the set of browser features that are
 * guaranteed to be present.  This is defined to include exactly features that
 * work correctly on all "modern" browsers that are stable on January 1 of the
 * specified year.  For example,
 * ```js
 * if (goog.FEATURESET_YEAR >= 2019) {
 *   // use APIs known to be available on all major stable browsers Jan 1, 2019
 * } else {
 *   // polyfill for older browsers
 * }
 * ```
 * This is intended to be the primary define for removing
 * unnecessary browser compatibility code (such as ponyfills and workarounds),
 * and should inform the default value for most other defines:
 * ```js
 * const ASSUME_NATIVE_PROMISE =
 *     goog.define('ASSUME_NATIVE_PROMISE', goog.FEATURESET_YEAR >= 2016);
 * ```
 *
 * The default assumption is that IE9 is the lowest supported browser, which was
 * first available Jan 1, 2012.
 *
 * TODO(mathiasb): Reference more thorough documentation when it's available.
 */
goog.FEATURESET_YEAR = goog.define('goog.FEATURESET_YEAR', 2012);


/**
 * @define {boolean} DEBUG is provided as a convenience so that debugging code
 * that should not be included in a production. It can be easily stripped
 * by specifying --define goog.DEBUG=false to the Closure Compiler aka
 * JSCompiler. For example, most toString() methods should be declared inside an
 * "if (goog.DEBUG)" conditional because they are generally used for debugging
 * purposes and it is difficult for the JSCompiler to statically determine
 * whether they are used.
 */
goog.DEBUG = goog.define('goog.DEBUG', true);


/**
 * @define {string} LOCALE defines the locale being used for compilation. It is
 * used to select locale specific data to be compiled in js binary. BUILD rule
 * can specify this value by "--define goog.LOCALE=<locale_name>" as a compiler
 * option.
 *
 * Take into account that the locale code format is important. You should use
 * the canonical Unicode format with hyphen as a delimiter. Language must be
 * lowercase, Language Script - Capitalized, Region - UPPERCASE.
 * There are few examples: pt-BR, en, en-US, sr-Latin-BO, zh-Hans-CN.
 *
 * See more info about locale codes here:
 * http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers
 *
 * For language codes you should use values defined by ISO 693-1. See it here
 * http://www.w3.org/WAI/ER/IG/ert/iso639.htm. There is only one exception from
 * this rule: the Hebrew language. For legacy reasons the old code (iw) should
 * be used instead of the new code (he).
 *
 * MOE:begin_intracomment_strip
 * See http://g3doc/i18n/identifiers/g3doc/synonyms.
 * MOE:end_intracomment_strip
 */
goog.LOCALE = goog.define('goog.LOCALE', 'en');  // default to en


/**
 * @define {boolean} Whether this code is running on trusted sites.
 *
 * On untrusted sites, several native functions can be defined or overridden by
 * external libraries like Prototype, Datejs, and JQuery and setting this flag
 * to false forces closure to use its own implementations when possible.
 *
 * If your JavaScript can be loaded by a third party site and you are wary about
 * relying on non-standard implementations, specify
 * "--define goog.TRUSTED_SITE=false" to the compiler.
 */
goog.TRUSTED_SITE = goog.define('goog.TRUSTED_SITE', true);


/**
 * @define {boolean} Whether code that calls {@link goog.setTestOnly} should
 *     be disallowed in the compilation unit.
 */
goog.DISALLOW_TEST_ONLY_CODE =
    goog.define('goog.DISALLOW_TEST_ONLY_CODE', COMPILED && !goog.DEBUG);


/**
 * @define {boolean} Whether to use a Chrome app CSP-compliant method for
 *     loading scripts via goog.require. @see appendScriptSrcNode_.
 */
goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING =
    goog.define('goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING', false);


/**
 * Defines a namespace in Closure.
 *
 * A namespace may only be defined once in a codebase. It may be defined using
 * goog.provide() or goog.module().
 *
 * The presence of one or more goog.provide() calls in a file indicates
 * that the file defines the given objects/namespaces.
 * Provided symbols must not be null or undefined.
 *
 * In addition, goog.provide() creates the object stubs for a namespace
 * (for example, goog.provide("goog.foo.bar") will create the object
 * goog.foo.bar if it does not already exist).
 *
 * Build tools also scan for provide/require/module statements
 * to discern dependencies, build dependency files (see deps.js), etc.
 *
 * @see goog.require
 * @see goog.module
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 * deprecated Use goog.module (see b/159289405)
 */
goog.provide = function(name) {
  if (goog.isInModuleLoader_()) {
    throw new Error('goog.provide cannot be used within a module.');
  }
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice.
    // A goog.module/goog.provide maps a goog.require to a specific file
    if (goog.isProvided_(name)) {
      throw new Error('Namespace "' + name + '" already declared.');
    }
  }

  goog.constructNamespace_(name);
};


/**
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 * @param {?Object=} object The object to embed in the namespace.
 * @param {boolean=} overwriteImplicit If object is set and a previous call
 *     implicitly constructed the namespace given by name, this parameter
 *     controls whether opt_obj should overwrite the implicitly constructed
 *     namespace or be merged into it. Defaults to false.
 * @private
 */
goog.constructNamespace_ = function(name, object, overwriteImplicit) {
  if (!COMPILED) {
    delete goog.implicitNamespaces_[name];

    var namespace = name;
    while ((namespace = namespace.substring(0, namespace.lastIndexOf('.')))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }

  goog.exportPath_(name, object, overwriteImplicit);
};


/**
 * Returns CSP nonce, if set for any script tag.
 * @param {?Window=} opt_window The window context used to retrieve the nonce.
 *     Defaults to global context.
 * @return {string} CSP nonce or empty string if no nonce is present.
 */
goog.getScriptNonce = function(opt_window) {
  if (opt_window && opt_window != goog.global) {
    return goog.getScriptNonce_(opt_window.document);
  }
  if (goog.cspNonce_ === null) {
    goog.cspNonce_ = goog.getScriptNonce_(goog.global.document);
  }
  return goog.cspNonce_;
};


/**
 * According to the CSP3 spec a nonce must be a valid base64 string.
 * @see https://www.w3.org/TR/CSP3/#grammardef-base64-value
 * @private @const
 */
goog.NONCE_PATTERN_ = /^[\w+/_-]+[=]{0,2}$/;


/**
 * @private {?string}
 */
goog.cspNonce_ = null;


/**
 * Returns CSP nonce, if set for any script tag.
 * @param {!Document} doc
 * @return {string} CSP nonce or empty string if no nonce is present.
 * @private
 */
goog.getScriptNonce_ = function(doc) {
  var script = doc.querySelector && doc.querySelector('script[nonce]');
  if (script) {
    // Try to get the nonce from the IDL property first, because browsers that
    // implement additional nonce protection features (currently only Chrome) to
    // prevent nonce stealing via CSS do not expose the nonce via attributes.
    // See https://github.com/whatwg/html/issues/2369
    var nonce = script['nonce'] || script.getAttribute('nonce');
    if (nonce && goog.NONCE_PATTERN_.test(nonce)) {
      return nonce;
    }
  }
  return '';
};


/**
 * Module identifier validation regexp.
 * Note: This is a conservative check, it is very possible to be more lenient,
 *   the primary exclusion here is "/" and "\" and a leading ".", these
 *   restrictions are intended to leave the door open for using goog.require
 *   with relative file paths rather than module identifiers.
 * @private
 */
goog.VALID_MODULE_RE_ = /^[a-zA-Z_$][a-zA-Z0-9._$]*$/;


/**
 * Defines a module in Closure.
 *
 * Marks that this file must be loaded as a module and claims the namespace.
 *
 * A namespace may only be defined once in a codebase. It may be defined using
 * goog.provide() or goog.module().
 *
 * goog.module() has three requirements:
 * - goog.module may not be used in the same file as goog.provide.
 * - goog.module must be the first statement in the file.
 * - only one goog.module is allowed per file.
 *
 * When a goog.module annotated file is loaded, it is enclosed in
 * a strict function closure. This means that:
 * - any variables declared in a goog.module file are private to the file
 * (not global), though the compiler is expected to inline the module.
 * - The code must obey all the rules of "strict" JavaScript.
 * - the file will be marked as "use strict"
 *
 * NOTE: unlike goog.provide, goog.module does not declare any symbols by
 * itself. If declared symbols are desired, use
 * goog.module.declareLegacyNamespace().
 *
 * MOE:begin_intracomment_strip
 * See the goog.module announcement at http://go/goog.module-announce
 * MOE:end_intracomment_strip
 *
 * See the public goog.module proposal: http://goo.gl/Va1hin
 *
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part", is expected but not required.
 * @return {void}
 */
goog.module = function(name) {
  if (typeof name !== 'string' || !name ||
      name.search(goog.VALID_MODULE_RE_) == -1) {
    throw new Error('Invalid module identifier');
  }
  if (!goog.isInGoogModuleLoader_()) {
    throw new Error(
        'Module ' + name + ' has been loaded incorrectly. Note, ' +
        'modules cannot be loaded as normal scripts. They require some kind of ' +
        'pre-processing step. You\'re likely trying to load a module via a ' +
        'script tag or as a part of a concatenated bundle without rewriting the ' +
        'module. For more info see: ' +
        'https://github.com/google/closure-library/wiki/goog.module:-an-ES6-module-like-alternative-to-goog.provide.');
  }
  if (goog.moduleLoaderState_.moduleName) {
    throw new Error('goog.module may only be called once per module.');
  }

  // Store the module name for the loader.
  goog.moduleLoaderState_.moduleName = name;
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice.
    // A goog.module/goog.provide maps a goog.require to a specific file
    if (goog.isProvided_(name)) {
      throw new Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
  }
};


/**
 * @param {string} name The module identifier.
 * @return {?} The module exports for an already loaded module or null.
 *
 * Note: This is not an alternative to goog.require, it does not
 * indicate a hard dependency, instead it is used to indicate
 * an optional dependency or to access the exports of a module
 * that has already been loaded.
 * @suppress {missingProvide}
 */
goog.module.get = function(name) {
  return goog.module.getInternal_(name);
};


/**
 * @param {string} name The module identifier.
 * @return {?} The module exports for an already loaded module or null.
 * @private
 */
goog.module.getInternal_ = function(name) {
  if (!COMPILED) {
    if (name in goog.loadedModules_) {
      return goog.loadedModules_[name].exports;
    } else if (!goog.implicitNamespaces_[name]) {
      var ns = goog.getObjectByName(name);
      return ns != null ? ns : null;
    }
  }
  return null;
};


/**
 * Types of modules the debug loader can load.
 * @enum {string}
 */
goog.ModuleType = {
  ES6: 'es6',
  GOOG: 'goog'
};


/**
 * @private {?{
 *   moduleName: (string|undefined),
 *   declareLegacyNamespace:boolean,
 *   type: ?goog.ModuleType
 * }}
 */
goog.moduleLoaderState_ = null;


/**
 * @private
 * @return {boolean} Whether a goog.module or an es6 module is currently being
 *     initialized.
 */
goog.isInModuleLoader_ = function() {
  return goog.isInGoogModuleLoader_() || goog.isInEs6ModuleLoader_();
};


/**
 * @private
 * @return {boolean} Whether a goog.module is currently being initialized.
 */
goog.isInGoogModuleLoader_ = function() {
  return !!goog.moduleLoaderState_ &&
      goog.moduleLoaderState_.type == goog.ModuleType.GOOG;
};


/**
 * @private
 * @return {boolean} Whether an es6 module is currently being initialized.
 */
goog.isInEs6ModuleLoader_ = function() {
  var inLoader = !!goog.moduleLoaderState_ &&
      goog.moduleLoaderState_.type == goog.ModuleType.ES6;

  if (inLoader) {
    return true;
  }

  var jscomp = goog.global['$jscomp'];

  if (jscomp) {
    // jscomp may not have getCurrentModulePath if this is a compiled bundle
    // that has some of the runtime, but not all of it. This can happen if
    // optimizations are turned on so the unused runtime is removed but renaming
    // and Closure pass are off (so $jscomp is still named $jscomp and the
    // goog.provide/require calls still exist).
    if (typeof jscomp.getCurrentModulePath != 'function') {
      return false;
    }

    // Bundled ES6 module.
    return !!jscomp.getCurrentModulePath();
  }

  return false;
};


/**
 * Provide the module's exports as a globally accessible object under the
 * module's declared name.  This is intended to ease migration to goog.module
 * for files that have existing usages.
 * @suppress {missingProvide}
 */
goog.module.declareLegacyNamespace = function() {
  if (!COMPILED && !goog.isInGoogModuleLoader_()) {
    throw new Error(
        'goog.module.declareLegacyNamespace must be called from ' +
        'within a goog.module');
  }
  if (!COMPILED && !goog.moduleLoaderState_.moduleName) {
    throw new Error(
        'goog.module must be called prior to ' +
        'goog.module.declareLegacyNamespace.');
  }
  goog.moduleLoaderState_.declareLegacyNamespace = true;
};


/**
 * Associates an ES6 module with a Closure module ID so that is available via
 * goog.require. The associated ID  acts like a goog.module ID - it does not
 * create any global names, it is merely available via goog.require /
 * goog.module.get / goog.forwardDeclare / goog.requireType. goog.require and
 * goog.module.get will return the entire module as if it was import *'d. This
 * allows Closure files to reference ES6 modules for the sake of migration.
 *
 * @param {string} namespace
 * @suppress {missingProvide}
 */
goog.declareModuleId = function(namespace) {
  if (!COMPILED) {
    if (!goog.isInEs6ModuleLoader_()) {
      throw new Error(
          'goog.declareModuleId may only be called from ' +
          'within an ES6 module');
    }
    if (goog.moduleLoaderState_ && goog.moduleLoaderState_.moduleName) {
      throw new Error(
          'goog.declareModuleId may only be called once per module.');
    }
    if (namespace in goog.loadedModules_) {
      throw new Error(
          'Module with namespace "' + namespace + '" already exists.');
    }
  }
  if (goog.moduleLoaderState_) {
    // Not bundled - debug loading.
    goog.moduleLoaderState_.moduleName = namespace;
  } else {
    // Bundled - not debug loading, no module loader state.
    var jscomp = goog.global['$jscomp'];
    if (!jscomp || typeof jscomp.getCurrentModulePath != 'function') {
      throw new Error(
          'Module with namespace "' + namespace +
          '" has been loaded incorrectly.');
    }
    var exports = jscomp.require(jscomp.getCurrentModulePath());
    goog.loadedModules_[namespace] = {
      exports: exports,
      type: goog.ModuleType.ES6,
      moduleId: namespace
    };
  }
};


/**
 * Marks that the current file should only be used for testing, and never for
 * live code in production.
 *
 * In the case of unit tests, the message may optionally be an exact namespace
 * for the test (e.g. 'goog.stringTest'). The linter will then ignore the extra
 * provide (if not explicitly defined in the code).
 *
 * @param {string=} opt_message Optional message to add to the error that's
 *     raised when used in production code.
 */
goog.setTestOnly = function(opt_message) {
  if (goog.DISALLOW_TEST_ONLY_CODE) {
    opt_message = opt_message || '';
    throw new Error(
        'Importing test-only code into non-debug environment' +
        (opt_message ? ': ' + opt_message : '.'));
  }
};


/**
 * Forward declares a symbol. This is an indication to the compiler that the
 * symbol may be used in the source yet is not required and may not be provided
 * in compilation.
 *
 * The most common usage of forward declaration is code that takes a type as a
 * function parameter but does not need to require it. By forward declaring
 * instead of requiring, no hard dependency is made, and (if not required
 * elsewhere) the namespace may never be required and thus, not be pulled
 * into the JavaScript binary. If it is required elsewhere, it will be type
 * checked as normal.
 *
 * Before using goog.forwardDeclare, please read the documentation at
 * https://github.com/google/closure-compiler/wiki/Bad-Type-Annotation to
 * understand the options and tradeoffs when working with forward declarations.
 *
 * @param {string} name The namespace to forward declare in the form of
 *     "goog.package.part".
 * @deprecated See go/noforwarddeclaration, Use `goog.requireType` instead.
 */
goog.forwardDeclare = function(name) {};


/**
 * Forward declare type information. Used to assign types to goog.global
 * referenced object that would otherwise result in unknown type references
 * and thus block property disambiguation.
 */
goog.forwardDeclare('Document');
goog.forwardDeclare('HTMLScriptElement');
goog.forwardDeclare('XMLHttpRequest');


if (!COMPILED) {
  /**
   * Check if the given name has been goog.provided. This will return false for
   * names that are available only as implicit namespaces.
   * @param {string} name name of the object to look for.
   * @return {boolean} Whether the name has been provided.
   * @private
   */
  goog.isProvided_ = function(name) {
    return (name in goog.loadedModules_) ||
        (!goog.implicitNamespaces_[name] && goog.getObjectByName(name) != null);
  };

  /**
   * Namespaces implicitly defined by goog.provide. For example,
   * goog.provide('goog.events.Event') implicitly declares that 'goog' and
   * 'goog.events' must be namespaces.
   *
   * @type {!Object<string, (boolean|undefined)>}
   * @private
   */
  goog.implicitNamespaces_ = {'goog.module': true};

  // NOTE: We add goog.module as an implicit namespace as goog.module is defined
  // here and because the existing module package has not been moved yet out of
  // the goog.module namespace. This satisifies both the debug loader and
  // ahead-of-time dependency management.
}


/**
 * Returns an object based on its fully qualified external name.  The object
 * is not found if null or undefined.  If you are using a compilation pass that
 * renames property names beware that using this function will not find renamed
 * properties.
 *
 * @param {string} name The fully qualified name.
 * @param {Object=} opt_obj The object within which to look; default is
 *     |goog.global|.
 * @return {?} The value (object or primitive) or, if not found, null.
 */
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split('.');
  var cur = opt_obj || goog.global;
  for (var i = 0; i < parts.length; i++) {
    cur = cur[parts[i]];
    if (cur == null) {
      return null;
    }
  }
  return cur;
};


/**
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {!Array<string>} provides An array of strings with
 *     the names of the objects this file provides.
 * @param {!Array<string>} requires An array of strings with
 *     the names of the objects this file requires.
 * @param {boolean|!Object<string>=} opt_loadFlags Parameters indicating
 *     how the file must be loaded.  The boolean 'true' is equivalent
 *     to {'module': 'goog'} for backwards-compatibility.  Valid properties
 *     and values include {'module': 'goog'} and {'lang': 'es6'}.
 */
goog.addDependency = function(relPath, provides, requires, opt_loadFlags) {
  if (!COMPILED && goog.DEPENDENCIES_ENABLED) {
    goog.debugLoader_.addDependency(relPath, provides, requires, opt_loadFlags);
  }
};


// MOE:begin_strip
/**
 * Whether goog.require should throw an exception if it fails.
 * @type {boolean}
 */
goog.useStrictRequires = false;


// MOE:end_strip


// NOTE(nnaze): The debug DOM loader was included in base.js as an original way
// to do "debug-mode" development.  The dependency system can sometimes be
// confusing, as can the debug DOM loader's asynchronous nature.
//
// With the DOM loader, a call to goog.require() is not blocking -- the script
// will not load until some point after the current script.  If a namespace is
// needed at runtime, it needs to be defined in a previous script, or loaded via
// require() with its registered dependencies.
//
// User-defined namespaces may need their own deps file. For a reference on
// creating a deps file, see:
// MOE:begin_strip
// Internally: http://go/deps-files and http://go/be#js_deps
// MOE:end_strip
// Externally: https://developers.google.com/closure/library/docs/depswriter
//
// Because of legacy clients, the DOM loader can't be easily removed from
// base.js.  Work was done to make it disableable or replaceable for
// different environments (DOM-less JavaScript interpreters like Rhino or V8,
// for example). See bootstrap/ for more information.


/**
 * @define {boolean} Whether to enable the debug loader.
 *
 * If enabled, a call to goog.require() will attempt to load the namespace by
 * appending a script tag to the DOM (if the namespace has been registered).
 *
 * If disabled, goog.require() will simply assert that the namespace has been
 * provided (and depend on the fact that some outside tool correctly ordered
 * the script).
 */
goog.ENABLE_DEBUG_LOADER = goog.define('goog.ENABLE_DEBUG_LOADER', true);


/**
 * @param {string} msg
 * @private
 */
goog.logToConsole_ = function(msg) {
  if (goog.global.console) {
    goog.global.console['error'](msg);
  }
};


/**
 * Implements a system for the dynamic resolution of dependencies that works in
 * parallel with the BUILD system.
 *
 * Note that all calls to goog.require will be stripped by the compiler.
 *
 * @see goog.provide
 * @param {string} namespace Namespace (as was given in goog.provide,
 *     goog.module, or goog.declareModuleId) in the form
 *     "goog.package.part".
 * @return {?} If called within a goog.module or ES6 module file, the associated
 *     namespace or module otherwise null.
 */
goog.require = function(namespace) {
  if (!COMPILED) {
    // Might need to lazy load on old IE.
    if (goog.ENABLE_DEBUG_LOADER) {
      goog.debugLoader_.requested(namespace);
    }

    // If the object already exists we do not need to do anything.
    if (goog.isProvided_(namespace)) {
      if (goog.isInModuleLoader_()) {
        return goog.module.getInternal_(namespace);
      }
    } else if (goog.ENABLE_DEBUG_LOADER) {
      var moduleLoaderState = goog.moduleLoaderState_;
      goog.moduleLoaderState_ = null;
      try {
        goog.debugLoader_.load_(namespace);
      } finally {
        goog.moduleLoaderState_ = moduleLoaderState;
      }
    }

    return null;
  }
};


/**
 * Requires a symbol for its type information. This is an indication to the
 * compiler that the symbol may appear in type annotations, yet it is not
 * referenced at runtime.
 *
 * When called within a goog.module or ES6 module file, the return value may be
 * assigned to or destructured into a variable, but it may not be otherwise used
 * in code outside of a type annotation.
 *
 * Note that all calls to goog.requireType will be stripped by the compiler.
 *
 * @param {string} namespace Namespace (as was given in goog.provide,
 *     goog.module, or goog.declareModuleId) in the form
 *     "goog.package.part".
 * @return {?}
 */
goog.requireType = function(namespace) {
  // Return an empty object so that single-level destructuring of the return
  // value doesn't crash at runtime when using the debug loader. Multi-level
  // destructuring isn't supported.
  return {};
};


/**
 * Path for included scripts.
 * @type {string}
 */
goog.basePath = '';


/**
 * A hook for overriding the base path.
 * @type {string|undefined}
 */
goog.global.CLOSURE_BASE_PATH;


/**
 * Whether to attempt to load Closure's deps file. By default, when uncompiled,
 * deps files will attempt to be loaded.
 * @type {boolean|undefined}
 */
goog.global.CLOSURE_NO_DEPS;


/**
 * A function to import a single script. This is meant to be overridden when
 * Closure is being run in non-HTML contexts, such as web workers. It's defined
 * in the global scope so that it can be set before base.js is loaded, which
 * allows deps.js to be imported properly.
 *
 * The first parameter the script source, which is a relative URI. The second,
 * optional parameter is the script contents, in the event the script needed
 * transformation. It should return true if the script was imported, false
 * otherwise.
 * @type {(function(string, string=): boolean)|undefined}
 */
goog.global.CLOSURE_IMPORT_SCRIPT;


/**
 * Null function used for default values of callbacks, etc.
 * @return {void} Nothing.
 * @deprecated use '()=>{}' or 'function(){}' instead.
 */
goog.nullFunction = function() {};


/**
 * When defining a class Foo with an abstract method bar(), you can do:
 * Foo.prototype.bar = goog.abstractMethod
 *
 * Now if a subclass of Foo fails to override bar(), an error will be thrown
 * when bar() is invoked.
 *
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be overridden.
 * @deprecated Use "@abstract" annotation instead of goog.abstractMethod in new
 *     code. See
 *     https://github.com/google/closure-compiler/wiki/@abstract-classes-and-methods
 */
goog.abstractMethod = function() {
  throw new Error('unimplemented abstract method');
};


/**
 * Adds a `getInstance` static method that always returns the same
 * instance object.
 * @param {!Function} ctor The constructor for the class to add the static
 *     method to.
 * @suppress {missingProperties} 'instance_' isn't a property on 'Function'
 *     but we don't have a better type to use here.
 */
goog.addSingletonGetter = function(ctor) {
  // instance_ is immediately set to prevent issues with sealed constructors
  // such as are encountered when a constructor is returned as the export object
  // of a goog.module in unoptimized code.
  // Delcare type to avoid conformance violations that ctor.instance_ is unknown
  /** @type {undefined|!Object} @suppress {underscore} */
  ctor.instance_ = undefined;
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    if (goog.DEBUG) {
      // NOTE: JSCompiler can't optimize away Array#push.
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
    }
    // Cast to avoid conformance violations that ctor.instance_ is unknown
    return /** @type {!Object|undefined} */ (ctor.instance_) = new ctor;
  };
};


/**
 * All singleton classes that have been instantiated, for testing. Don't read
 * it directly, use the `goog.testing.singleton` module. The compiler
 * removes this variable if unused.
 * @type {!Array<!Function>}
 * @private
 */
goog.instantiatedSingletons_ = [];


/**
 * @define {boolean} Whether to load goog.modules using `eval` when using
 * the debug loader.  This provides a better debugging experience as the
 * source is unmodified and can be edited using Chrome Workspaces or similar.
 * However in some environments the use of `eval` is banned
 * so we provide an alternative.
 */
goog.LOAD_MODULE_USING_EVAL = goog.define('goog.LOAD_MODULE_USING_EVAL', true);


/**
 * @define {boolean} Whether the exports of goog.modules should be sealed when
 * possible.
 */
goog.SEAL_MODULE_EXPORTS = goog.define('goog.SEAL_MODULE_EXPORTS', goog.DEBUG);


/**
 * The registry of initialized modules:
 * The module identifier or path to module exports map.
 * @private @const {!Object<string, {exports:?,type:string,moduleId:string}>}
 */
goog.loadedModules_ = {};


/**
 * True if the debug loader enabled and used.
 * @const {boolean}
 */
goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;


/**
 * @define {string} How to decide whether to transpile.  Valid values
 * are 'always', 'never', and 'detect'.  The default ('detect') is to
 * use feature detection to determine which language levels need
 * transpilation.
 */
// NOTE(sdh): we could expand this to accept a language level to bypass
// detection: e.g. goog.TRANSPILE == 'es5' would transpile ES6 files but
// would leave ES3 and ES5 files alone.
goog.TRANSPILE = goog.define('goog.TRANSPILE', 'detect');

/**
 * @define {boolean} If true assume that ES modules have already been
 * transpiled by the jscompiler (in the same way that transpile.js would
 * transpile them - to jscomp modules). Useful only for servers that wish to use
 * the debug loader and transpile server side. Thus this is only respected if
 * goog.TRANSPILE is "never".
 */
goog.ASSUME_ES_MODULES_TRANSPILED =
    goog.define('goog.ASSUME_ES_MODULES_TRANSPILED', false);


/**
 * @define {string} If a file needs to be transpiled what the output language
 * should be. By default this is the highest language level this file detects
 * the current environment supports. Generally this flag should not be set, but
 * it could be useful to override. Example: If the current environment supports
 * ES6 then by default ES7+ files will be transpiled to ES6, unless this is
 * overridden.
 *
 * Valid values include: es3, es5, es6, es7, and es8. Anything not recognized
 * is treated as es3.
 *
 * Note that setting this value does not force transpilation. Just if
 * transpilation occurs this will be the output. So this is most useful when
 * goog.TRANSPILE is set to 'always' and then forcing the language level to be
 * something lower than what the environment detects.
 */
goog.TRANSPILE_TO_LANGUAGE = goog.define('goog.TRANSPILE_TO_LANGUAGE', '');


/**
 * @define {string} Path to the transpiler.  Executing the script at this
 * path (relative to base.js) should define a function $jscomp.transpile.
 */
goog.TRANSPILER = goog.define('goog.TRANSPILER', 'transpile.js');


/**
 * @package {?boolean}
 * Visible for testing.
 */
goog.hasBadLetScoping = null;


/**
 * @return {boolean}
 * @package Visible for testing.
 */
goog.useSafari10Workaround = function() {
  if (goog.hasBadLetScoping == null) {
    var hasBadLetScoping;
    try {
      hasBadLetScoping = !eval(
          '"use strict";' +
          'let x = 1; function f() { return typeof x; };' +
          'f() == "number";');
    } catch (e) {
      // Assume that ES6 syntax isn't supported.
      hasBadLetScoping = false;
    }
    goog.hasBadLetScoping = hasBadLetScoping;
  }
  return goog.hasBadLetScoping;
};


/**
 * @param {string} moduleDef
 * @return {string}
 * @package Visible for testing.
 */
goog.workaroundSafari10EvalBug = function(moduleDef) {
  return '(function(){' + moduleDef +
      '\n' +  // Terminate any trailing single line comment.
      ';' +   // Terminate any trailing expression.
      '})();\n';
};


/**
 * @param {function(?):?|string} moduleDef The module definition.
 */
goog.loadModule = function(moduleDef) {
  // NOTE: we allow function definitions to be either in the from
  // of a string to eval (which keeps the original source intact) or
  // in a eval forbidden environment (CSP) we allow a function definition
  // which in its body must call `goog.module`, and return the exports
  // of the module.
  var previousState = goog.moduleLoaderState_;
  try {
    goog.moduleLoaderState_ = {
      moduleName: '',
      declareLegacyNamespace: false,
      type: goog.ModuleType.GOOG
    };
    var origExports = {};
    var exports = origExports;
    if (typeof moduleDef === 'function') {
      exports = moduleDef.call(undefined, exports);
    } else if (typeof moduleDef === 'string') {
      if (goog.useSafari10Workaround()) {
        moduleDef = goog.workaroundSafari10EvalBug(moduleDef);
      }

      exports = goog.loadModuleFromSource_.call(undefined, exports, moduleDef);
    } else {
      throw new Error('Invalid module definition');
    }

    var moduleName = goog.moduleLoaderState_.moduleName;
    if (typeof moduleName === 'string' && moduleName) {
      // Don't seal legacy namespaces as they may be used as a parent of
      // another namespace
      if (goog.moduleLoaderState_.declareLegacyNamespace) {
        // Whether exports was overwritten via default export assignment.
        // This is important for legacy namespaces as it dictates whether
        // previously a previously loaded implicit namespace should be clobbered
        // or not.
        var isDefaultExport = origExports !== exports;
        goog.constructNamespace_(moduleName, exports, isDefaultExport);
      } else if (
          goog.SEAL_MODULE_EXPORTS && Object.seal &&
          typeof exports == 'object' && exports != null) {
        Object.seal(exports);
      }

      var data = {
        exports: exports,
        type: goog.ModuleType.GOOG,
        moduleId: goog.moduleLoaderState_.moduleName
      };
      goog.loadedModules_[moduleName] = data;
    } else {
      throw new Error('Invalid module name \"' + moduleName + '\"');
    }
  } finally {
    goog.moduleLoaderState_ = previousState;
  }
};


/**
 * @private @const
 */
goog.loadModuleFromSource_ =
    /** @type {function(!Object, string):?} */ (function(exports) {
      // NOTE: we avoid declaring parameters or local variables here to avoid
      // masking globals or leaking values into the module definition.
      'use strict';
      eval(arguments[1]);
      return exports;
    });


/**
 * Normalize a file path by removing redundant ".." and extraneous "." file
 * path components.
 * @param {string} path
 * @return {string}
 * @private
 */
goog.normalizePath_ = function(path) {
  var components = path.split('/');
  var i = 0;
  while (i < components.length) {
    if (components[i] == '.') {
      components.splice(i, 1);
    } else if (
        i && components[i] == '..' && components[i - 1] &&
        components[i - 1] != '..') {
      components.splice(--i, 2);
    } else {
      i++;
    }
  }
  return components.join('/');
};


/**
 * Provides a hook for loading a file when using Closure's goog.require() API
 * with goog.modules.  In particular this hook is provided to support Node.js.
 *
 * @type {(function(string):string)|undefined}
 */
goog.global.CLOSURE_LOAD_FILE_SYNC;


/**
 * Loads file by synchronous XHR. Should not be used in production environments.
 * @param {string} src Source URL.
 * @return {?string} File contents, or null if load failed.
 * @private
 */
goog.loadFileSync_ = function(src) {
  if (goog.global.CLOSURE_LOAD_FILE_SYNC) {
    return goog.global.CLOSURE_LOAD_FILE_SYNC(src);
  } else {
    try {
      /** @type {XMLHttpRequest} */
      var xhr = new goog.global['XMLHttpRequest']();
      xhr.open('get', src, false);
      xhr.send();
      // NOTE: Successful http: requests have a status of 200, but successful
      // file: requests may have a status of zero.  Any other status, or a
      // thrown exception (particularly in case of file: requests) indicates
      // some sort of error, which we treat as a missing or unavailable file.
      return xhr.status == 0 || xhr.status == 200 ? xhr.responseText : null;
    } catch (err) {
      // No need to rethrow or log, since errors should show up on their own.
      return null;
    }
  }
};


/**
 * Lazily retrieves the transpiler and applies it to the source.
 * @param {string} code JS code.
 * @param {string} path Path to the code.
 * @param {string} target Language level output.
 * @return {string} The transpiled code.
 * @private
 */
goog.transpile_ = function(code, path, target) {
  var jscomp = goog.global['$jscomp'];
  if (!jscomp) {
    goog.global['$jscomp'] = jscomp = {};
  }
  var transpile = jscomp.transpile;
  if (!transpile) {
    var transpilerPath = goog.basePath + goog.TRANSPILER;
    var transpilerCode = goog.loadFileSync_(transpilerPath);
    if (transpilerCode) {
      // This must be executed synchronously, since by the time we know we
      // need it, we're about to load and write the ES6 code synchronously,
      // so a normal script-tag load will be too slow. Wrapped in a function
      // so that code is eval'd in the global scope.
      (function() {
        (0, eval)(transpilerCode + '\n//# sourceURL=' + transpilerPath);
      }).call(goog.global);
      // Even though the transpiler is optional, if $gwtExport is found, it's
      // a sign the transpiler was loaded and the $jscomp.transpile *should*
      // be there.
      if (goog.global['$gwtExport'] && goog.global['$gwtExport']['$jscomp'] &&
          !goog.global['$gwtExport']['$jscomp']['transpile']) {
        throw new Error(
            'The transpiler did not properly export the "transpile" ' +
            'method. $gwtExport: ' + JSON.stringify(goog.global['$gwtExport']));
      }
      // transpile.js only exports a single $jscomp function, transpile. We
      // grab just that and add it to the existing definition of $jscomp which
      // contains the polyfills.
      goog.global['$jscomp'].transpile =
          goog.global['$gwtExport']['$jscomp']['transpile'];
      jscomp = goog.global['$jscomp'];
      transpile = jscomp.transpile;
    }
  }
  if (!transpile) {
    // The transpiler is an optional component.  If it's not available then
    // replace it with a pass-through function that simply logs.
    var suffix = ' requires transpilation but no transpiler was found.';
    // MOE:begin_strip
    suffix +=  // Provide a more appropriate message internally.
        ' Please add "//javascript/closure:transpiler" as a data ' +
        'dependency to ensure it is included.';
    // MOE:end_strip
    transpile = jscomp.transpile = function(code, path) {
      // TODO(sdh): figure out some way to get this error to show up
      // in test results, noting that the failure may occur in many
      // different ways, including in loadModule() before the test
      // runner even comes up.
      goog.logToConsole_(path + suffix);
      return code;
    };
  }
  // Note: any transpilation errors/warnings will be logged to the console.
  return transpile(code, path, target);
};

//==============================================================================
// Language Enhancements
//==============================================================================


/**
 * This is a "fixed" version of the typeof operator.  It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 * @param {?} value The value to get the type of.
 * @return {string} The name of the type.
 */
goog.typeOf = function(value) {
  var s = typeof value;

  if (s != 'object') {
    return s;
  }

  if (!value) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }
  return s;
};


/**
 * Returns true if the object looks like an array. To qualify as array like
 * the value needs to be either a NodeList or an object with a Number length
 * property. Note that for this function neither strings nor functions are
 * considered "array-like".
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  // We do not use goog.isObject here in order to exclude function values.
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};


/**
 * Returns true if the object looks like a Date. To qualify as Date-like the
 * value needs to be an object and have a getFullYear() function.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a like a Date.
 */
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == 'function';
};


/**
 * Returns true if the specified value is an object.  This includes arrays and
 * functions.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
goog.isObject = function(val) {
  var type = typeof val;
  return type == 'object' && val != null || type == 'function';
  // return Object(val) === val also works, but is slower, especially if val is
  // not an object.
};


/**
 * Gets a unique ID for an object. This mutates the object so that further calls
 * with the same object as a parameter returns the same value. The unique ID is
 * guaranteed to be unique across the current session amongst objects that are
 * passed into `getUid`. There is no guarantee that the ID is unique or
 * consistent across sessions. It is unsafe to generate unique ID for function
 * prototypes.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {number} The unique ID for the object.
 */
goog.getUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.
  return Object.prototype.hasOwnProperty.call(obj, goog.UID_PROPERTY_) &&
      obj[goog.UID_PROPERTY_] ||
      (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};


/**
 * Whether the given object is already assigned a unique ID.
 *
 * This does not modify the object.
 *
 * @param {!Object} obj The object to check.
 * @return {boolean} Whether there is an assigned unique id for the object.
 */
goog.hasUid = function(obj) {
  return !!obj[goog.UID_PROPERTY_];
};


/**
 * Removes the unique ID from an object. This is useful if the object was
 * previously mutated using `goog.getUid` in which case the mutation is
 * undone.
 * @param {Object} obj The object to remove the unique ID field from.
 */
goog.removeUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // In IE, DOM nodes are not instances of Object and throw an exception if we
  // try to delete.  Instead we try to use removeAttribute.
  if (obj !== null && 'removeAttribute' in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }

  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};


/**
 * Name for unique ID property. Initialized in a way to help avoid collisions
 * with other closure JavaScript on the same page.
 * @type {string}
 * @private
 */
goog.UID_PROPERTY_ = 'closure_uid_' + ((Math.random() * 1e9) >>> 0);


/**
 * Counter for UID.
 * @type {number}
 * @private
 */
goog.uidCounter_ = 0;


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.cloneObject</code> does not detect reference loops. Objects that
 * refer to themselves will cause infinite recursion.
 *
 * <code>goog.cloneObject</code> is unaware of unique identifiers, and copies
 * UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 * @deprecated goog.cloneObject is unsafe. Prefer the goog.object methods.
 */
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (typeof obj.clone === 'function') {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * A native implementation of goog.bind.
 * @param {?function(this:T, ...)} fn A function to partially apply.
 * @param {T} selfObj Specifies the object which this should point to when the
 *     function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function goog.bind() was
 *     invoked as a method of.
 * @template T
 * @private
 */
goog.bindNative_ = function(fn, selfObj, var_args) {
  return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
};


/**
 * A pure-JS implementation of goog.bind.
 * @param {?function(this:T, ...)} fn A function to partially apply.
 * @param {T} selfObj Specifies the object which this should point to when the
 *     function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function goog.bind() was
 *     invoked as a method of.
 * @template T
 * @private
 */
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error();
  }

  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };

  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};


/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the first
 * function pre-filled and the value of this 'pre-specified'.
 *
 * Remaining arguments specified at call-time are appended to the pre-specified
 * ones.
 *
 * Also see: {@link #partial}.
 *
 * Usage:
 * <pre>var barMethBound = goog.bind(myFunction, myObj, 'arg1', 'arg2');
 * barMethBound('arg3', 'arg4');</pre>
 *
 * @param {?function(this:T, ...)} fn A function to partially apply.
 * @param {T} selfObj Specifies the object which this should point to when the
 *     function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function goog.bind() was
 *     invoked as a method of.
 * @template T
 * @suppress {deprecated} See above.
 * @deprecated use `=> {}` or Function.prototype.bind instead.
 */
goog.bind = function(fn, selfObj, var_args) {
  // TODO(nicksantos): narrow the type signature.
  if (Function.prototype.bind &&
      // NOTE(nicksantos): Somebody pulled base.js into the default Chrome
      // extension environment. This means that for Chrome extensions, they get
      // the implementation of Function.prototype.bind that calls goog.bind
      // instead of the native one. Even worse, we don't want to introduce a
      // circular dependency between goog.bind and Function.prototype.bind, so
      // we have to hack this to make sure it works correctly.
      Function.prototype.bind.toString().indexOf('native code') != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};


/**
 * Like goog.bind(), except that a 'this object' is not required. Useful when
 * the target function is already bound.
 *
 * Usage:
 * var g = goog.partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially applied to fn.
 * @return {!Function} A partially-applied form of the function goog.partial()
 *     was invoked as a method of.
 */
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Clone the array (with slice()) and append additional arguments
    // to the existing arguments.
    var newArgs = args.slice();
    newArgs.push.apply(newArgs, arguments);
    return fn.apply(/** @type {?} */ (this), newArgs);
  };
};


/**
 * Copies all the members of a source object to a target object. This method
 * does not work on all browsers for all objects that contain keys such as
 * toString or hasOwnProperty. Use goog.object.extend for this purpose.
 *
 * NOTE: Some have advocated for the use of goog.mixin to setup classes
 * with multiple inheritence (traits, mixins, etc).  However, as it simply
 * uses "for in", this is not compatible with ES6 classes whose methods are
 * non-enumerable.  Changing this, would break cases where non-enumerable
 * properties are not expected.
 *
 * @param {Object} target Target.
 * @param {Object} source Source.
 * @deprecated Prefer Object.assign
 */
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }

  // For IE7 or lower, the for-in-loop does not contain any properties that are
  // not enumerable on the prototype object (for example, isPrototypeOf from
  // Object.prototype) but also it will not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
};


/**
 * @return {number} An integer value representing the number of milliseconds
 *     between midnight, January 1, 1970 and the current time.
 * @deprecated Use Date.now
 */
goog.now = function() {
  return Date.now();
};


/**
 * Evals JavaScript in the global scope.
 *
 * Throws an exception if neither execScript or eval is defined.
 * @param {string} script JavaScript string.
 */
goog.globalEval = function(script) {
  (0, eval)(script);
};


/**
 * Optional map of CSS class names to obfuscated names used with
 * goog.getCssName().
 * @private {!Object<string, string>|undefined}
 * @see goog.setCssNameMapping
 */
goog.cssNameMapping_;


/**
 * Optional obfuscation style for CSS class names. Should be set to either
 * 'BY_WHOLE' or 'BY_PART' if defined.
 * @type {string|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMappingStyle_;



/**
 * A hook for modifying the default behavior goog.getCssName. The function
 * if present, will receive the standard output of the goog.getCssName as
 * its input.
 *
 * @type {(function(string):string)|undefined}
 */
goog.global.CLOSURE_CSS_NAME_MAP_FN;


/**
 * Handles strings that are intended to be used as CSS class names.
 *
 * This function works in tandem with @see goog.setCssNameMapping.
 *
 * Without any mapping set, the arguments are simple joined with a hyphen and
 * passed through unaltered.
 *
 * When there is a mapping, there are two possible styles in which these
 * mappings are used. In the BY_PART style, each part (i.e. in between hyphens)
 * of the passed in css name is rewritten according to the map. In the BY_WHOLE
 * style, the full css name is looked up in the map directly. If a rewrite is
 * not specified by the map, the compiler will output a warning.
 *
 * When the mapping is passed to the compiler, it will replace calls to
 * goog.getCssName with the strings from the mapping, e.g.
 *     var x = goog.getCssName('foo');
 *     var y = goog.getCssName(this.baseClass, 'active');
 *  becomes:
 *     var x = 'foo';
 *     var y = this.baseClass + '-active';
 *
 * If one argument is passed it will be processed, if two are passed only the
 * modifier will be processed, as it is assumed the first argument was generated
 * as a result of calling goog.getCssName.
 *
 * @param {string} className The class name.
 * @param {string=} opt_modifier A modifier to be appended to the class name.
 * @return {string} The class name or the concatenation of the class name and
 *     the modifier.
 */
goog.getCssName = function(className, opt_modifier) {
  // String() is used for compatibility with compiled soy where the passed
  // className can be non-string objects.
  if (String(className).charAt(0) == '.') {
    throw new Error(
        'className passed in goog.getCssName must not start with ".".' +
        ' You passed: ' + className);
  }

  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };

  var renameByParts = function(cssName) {
    // Remap all the parts individually.
    var parts = cssName.split('-');
    var mapped = [];
    for (var i = 0; i < parts.length; i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join('-');
  };

  var rename;
  if (goog.cssNameMapping_) {
    rename =
        goog.cssNameMappingStyle_ == 'BY_WHOLE' ? getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }

  var result =
      opt_modifier ? className + '-' + rename(opt_modifier) : rename(className);

  // The special CLOSURE_CSS_NAME_MAP_FN allows users to specify further
  // processing of the class name.
  if (goog.global.CLOSURE_CSS_NAME_MAP_FN) {
    return goog.global.CLOSURE_CSS_NAME_MAP_FN(result);
  }

  return result;
};


/**
 * Sets the map to check when returning a value from goog.getCssName(). Example:
 * <pre>
 * goog.setCssNameMapping({
 *   "goog": "a",
 *   "disabled": "b",
 * });
 *
 * var x = goog.getCssName('goog');
 * // The following evaluates to: "a a-b".
 * goog.getCssName('goog') + ' ' + goog.getCssName(x, 'disabled')
 * </pre>
 * When declared as a map of string literals to string literals, the JSCompiler
 * will replace all calls to goog.getCssName() using the supplied map if the
 * --process_closure_primitives flag is set.
 *
 * @param {!Object} mapping A map of strings to strings where keys are possible
 *     arguments to goog.getCssName() and values are the corresponding values
 *     that should be returned.
 * @param {string=} opt_style The style of css name mapping. There are two valid
 *     options: 'BY_PART', and 'BY_WHOLE'.
 * @see goog.getCssName for a description.
 */
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};


/**
 * To use CSS renaming in compiled mode, one of the input files should have a
 * call to goog.setCssNameMapping() with an object literal that the JSCompiler
 * can extract and use to replace all calls to goog.getCssName(). In uncompiled
 * mode, JavaScript code should be loaded before this base.js file that declares
 * a global variable, CLOSURE_CSS_NAME_MAPPING, which is used below. This is
 * to ensure that the mapping is loaded before any calls to goog.getCssName()
 * are made in uncompiled mode.
 *
 * A hook for overriding the CSS name mapping.
 * @type {!Object<string, string>|undefined}
 */
goog.global.CLOSURE_CSS_NAME_MAPPING;


if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  // This does not call goog.setCssNameMapping() because the JSCompiler
  // requires that goog.setCssNameMapping() be called with an object literal.
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}


/**
 * Gets a localized message.
 *
 * This function is a compiler primitive. If you give the compiler a localized
 * message bundle, it will replace the string at compile-time with a localized
 * version, and expand goog.getMsg call to a concatenated string.
 *
 * Messages must be initialized in the form:
 * <code>
 * var MSG_NAME = goog.getMsg('Hello {$placeholder}', {'placeholder': 'world'});
 * </code>
 *
 * This function produces a string which should be treated as plain text. Use
 * {@link goog.html.SafeHtmlFormatter} in conjunction with goog.getMsg to
 * produce SafeHtml.
 *
 * @param {string} str Translatable string, places holders in the form {$foo}.
 * @param {Object<string, string>=} opt_values Maps place holder name to value.
 * @param {{html: (boolean|undefined),
 *         unescapeHtmlEntities: (boolean|undefined)}=} opt_options Options:
 *     html: Escape '<' in str to '&lt;'. Used by Closure Templates where the
 *     generated code size and performance is critical which is why {@link
 *     goog.html.SafeHtmlFormatter} is not used. The value must be literal true
 *     or false.
 *     unescapeHtmlEntities: Unescape common html entities: &gt;, &lt;, &apos;,
 *     &quot; and &amp;. Used for messages not in HTML context, such as with
 *     `textContent` property.
 * @return {string} message with placeholders filled.
 */
goog.getMsg = function(str, opt_values, opt_options) {
  if (opt_options && opt_options.html) {
    // Note that '&' is not replaced because the translation can contain HTML
    // entities.
    str = str.replace(/</g, '&lt;');
  }
  if (opt_options && opt_options.unescapeHtmlEntities) {
    // Note that "&amp;" must be the last to avoid "creating" new entities.
    str = str.replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&apos;/g, '\'')
              .replace(/&quot;/g, '"')
              .replace(/&amp;/g, '&');
  }
  if (opt_values) {
    str = str.replace(/\{\$([^}]+)}/g, function(match, key) {
      return (opt_values != null && key in opt_values) ? opt_values[key] :
                                                         match;
    });
  }
  return str;
};


/**
 * Gets a localized message. If the message does not have a translation, gives a
 * fallback message.
 *
 * This is useful when introducing a new message that has not yet been
 * translated into all languages.
 *
 * This function is a compiler primitive. Must be used in the form:
 * <code>var x = goog.getMsgWithFallback(MSG_A, MSG_B);</code>
 * where MSG_A and MSG_B were initialized with goog.getMsg.
 *
 * @param {string} a The preferred message.
 * @param {string} b The fallback message.
 * @return {string} The best translated message.
 */
goog.getMsgWithFallback = function(a, b) {
  return a;
};


/**
 * Exposes an unobfuscated global namespace path for the given object.
 * Note that fields of the exported object *will* be obfuscated, unless they are
 * exported in turn via this function or goog.exportProperty.
 *
 * Also handy for making public items that are defined in anonymous closures.
 *
 * ex. goog.exportSymbol('public.path.Foo', Foo);
 *
 * ex. goog.exportSymbol('public.path.Foo.staticFunction', Foo.staticFunction);
 *     public.path.Foo.staticFunction();
 *
 * ex. goog.exportSymbol('public.path.Foo.prototype.myMethod',
 *                       Foo.prototype.myMethod);
 *     new public.path.Foo().myMethod();
 *
 * @param {string} publicPath Unobfuscated name to export.
 * @param {*} object Object the name should point to.
 * @param {?Object=} objectToExportTo The object to add the path to; default
 *     is goog.global.
 */
goog.exportSymbol = function(publicPath, object, objectToExportTo) {
  goog.exportPath_(
      publicPath, object, /* overwriteImplicit= */ true, objectToExportTo);
};


/**
 * Exports a property unobfuscated into the object's namespace.
 * ex. goog.exportProperty(Foo, 'staticFunction', Foo.staticFunction);
 * ex. goog.exportProperty(Foo.prototype, 'myMethod', Foo.prototype.myMethod);
 * @param {Object} object Object whose static property is being exported.
 * @param {string} publicName Unobfuscated name to export.
 * @param {*} symbol Object the name should point to.
 */
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { };
 *
 * function ChildClass(a, b, c) {
 *   ChildClass.base(this, 'constructor', a, b);
 * }
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // This works.
 * </pre>
 *
 * @param {!Function} childCtor Child class.
 * @param {!Function} parentCtor Parent class.
 * @suppress {strictMissingProperties} superClass_ and base is not defined on
 *    Function.
 * @deprecated Use ECMAScript class syntax instead.
 */
goog.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {}
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;

  /**
   * Calls superclass constructor/method.
   *
   * This function is only available if you use goog.inherits to
   * express inheritance relationships between classes.
   *
   * NOTE: This is a replacement for goog.base and for superClass_
   * property defined in childCtor.
   *
   * @param {!Object} me Should always be "this".
   * @param {string} methodName The method name to call. Calling
   *     superclass constructor can be done with the special string
   *     'constructor'.
   * @param {...*} var_args The arguments to pass to superclass
   *     method/constructor.
   * @return {*} The return value of the superclass method/constructor.
   */
  childCtor.base = function(me, methodName, var_args) {
    // Copying using loop to avoid deop due to passing arguments object to
    // function. This is faster in many JS engines as of late 2014.
    var args = new Array(arguments.length - 2);
    for (var i = 2; i < arguments.length; i++) {
      args[i - 2] = arguments[i];
    }
    return parentCtor.prototype[methodName].apply(me, args);
  };
};


/**
 * Allow for aliasing within scope functions.  This function exists for
 * uncompiled code - in compiled code the calls will be inlined and the aliases
 * applied.  In uncompiled code the function is simply run since the aliases as
 * written are valid JavaScript.
 *
 * MOE:begin_intracomment_strip
 * See the goog.scope document at http://go/goog.scope
 *
 * For more on goog.scope deprecation, see the style guide entry:
 * http://go/jsstyle#appendices-legacy-exceptions-goog-scope
 * MOE:end_intracomment_strip
 *
 * @param {function()} fn Function to call.  This function can contain aliases
 *     to namespaces (e.g. "var dom = goog.dom") or classes
 *     (e.g. "var Timer = goog.Timer").
 * @deprecated Use goog.module instead.
 */
goog.scope = function(fn) {
  if (goog.isInModuleLoader_()) {
    throw new Error('goog.scope is not supported within a module.');
  }
  fn.call(goog.global);
};


/*
 * To support uncompiled, strict mode bundles that use eval to divide source
 * like so:
 *    eval('someSource;//# sourceUrl sourcefile.js');
 * We need to export the globally defined symbols "goog" and "COMPILED".
 * Exporting "goog" breaks the compiler optimizations, so we required that
 * be defined externally.
 * NOTE: We don't use goog.exportSymbol here because we don't want to trigger
 * extern generation when that compiler option is enabled.
 */
if (!COMPILED) {
  goog.global['COMPILED'] = COMPILED;
}


//==============================================================================
// goog.defineClass implementation
//==============================================================================


/**
 * Creates a restricted form of a Closure "class":
 *   - from the compiler's perspective, the instance returned from the
 *     constructor is sealed (no new properties may be added).  This enables
 *     better checks.
 *   - the compiler will rewrite this definition to a form that is optimal
 *     for type checking and optimization (initially this will be a more
 *     traditional form).
 *
 * @param {Function} superClass The superclass, Object or null.
 * @param {goog.defineClass.ClassDescriptor} def
 *     An object literal describing
 *     the class.  It may have the following properties:
 *     "constructor": the constructor function
 *     "statics": an object literal containing methods to add to the constructor
 *        as "static" methods or a function that will receive the constructor
 *        function as its only parameter to which static properties can
 *        be added.
 *     all other properties are added to the prototype.
 * @return {!Function} The class constructor.
 * @deprecated Use ECMAScript class syntax instead.
 */
goog.defineClass = function(superClass, def) {
  // TODO(johnlenz): consider making the superClass an optional parameter.
  var constructor = def.constructor;
  var statics = def.statics;
  // Wrap the constructor prior to setting up the prototype and static methods.
  if (!constructor || constructor == Object.prototype.constructor) {
    constructor = function() {
      throw new Error(
          'cannot instantiate an interface (no constructor defined).');
    };
  }

  var cls = goog.defineClass.createSealingConstructor_(constructor, superClass);
  if (superClass) {
    goog.inherits(cls, superClass);
  }

  // Remove all the properties that should not be copied to the prototype.
  delete def.constructor;
  delete def.statics;

  goog.defineClass.applyProperties_(cls.prototype, def);
  if (statics != null) {
    if (statics instanceof Function) {
      statics(cls);
    } else {
      goog.defineClass.applyProperties_(cls, statics);
    }
  }

  return cls;
};


/**
 * @typedef {{
 *   constructor: (!Function|undefined),
 *   statics: (Object|undefined|function(Function):void)
 * }}
 */
goog.defineClass.ClassDescriptor;


/**
 * @define {boolean} Whether the instances returned by goog.defineClass should
 *     be sealed when possible.
 *
 * When sealing is disabled the constructor function will not be wrapped by
 * goog.defineClass, making it incompatible with ES6 class methods.
 */
goog.defineClass.SEAL_CLASS_INSTANCES =
    goog.define('goog.defineClass.SEAL_CLASS_INSTANCES', goog.DEBUG);


/**
 * If goog.defineClass.SEAL_CLASS_INSTANCES is enabled and Object.seal is
 * defined, this function will wrap the constructor in a function that seals the
 * results of the provided constructor function.
 *
 * @param {!Function} ctr The constructor whose results maybe be sealed.
 * @param {Function} superClass The superclass constructor.
 * @return {!Function} The replacement constructor.
 * @private
 */
goog.defineClass.createSealingConstructor_ = function(ctr, superClass) {
  if (!goog.defineClass.SEAL_CLASS_INSTANCES) {
    // Do now wrap the constructor when sealing is disabled. Angular code
    // depends on this for injection to work properly.
    return ctr;
  }

  // NOTE: The sealing behavior has been removed

  /**
   * @this {Object}
   * @return {?}
   */
  var wrappedCtr = function() {
    // Don't seal an instance of a subclass when it calls the constructor of
    // its super class as there is most likely still setup to do.
    var instance = ctr.apply(this, arguments) || this;
    instance[goog.UID_PROPERTY_] = instance[goog.UID_PROPERTY_];

    return instance;
  };

  return wrappedCtr;
};



// TODO(johnlenz): share these values with the goog.object
/**
 * The names of the fields that are defined on Object.prototype.
 * @type {!Array<string>}
 * @private
 * @const
 */
goog.defineClass.OBJECT_PROTOTYPE_FIELDS_ = [
  'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
  'toLocaleString', 'toString', 'valueOf'
];


// TODO(johnlenz): share this function with the goog.object
/**
 * @param {!Object} target The object to add properties to.
 * @param {!Object} source The object to copy properties from.
 * @private
 */
goog.defineClass.applyProperties_ = function(target, source) {
  // TODO(johnlenz): update this to support ES5 getters/setters

  var key;
  for (key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }

  // For IE the for-in-loop does not contain any properties that are not
  // enumerable on the prototype object (for example isPrototypeOf from
  // Object.prototype) and it will also not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
  for (var i = 0; i < goog.defineClass.OBJECT_PROTOTYPE_FIELDS_.length; i++) {
    key = goog.defineClass.OBJECT_PROTOTYPE_FIELDS_[i];
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }
};


// There's a bug in the compiler where without collapse properties the
// Closure namespace defines do not guard code correctly. To help reduce code
// size also check for !COMPILED even though it redundant until this is fixed.
if (!COMPILED && goog.DEPENDENCIES_ENABLED) {
  // MOE:begin_strip
  // TODO(b/67050526) This object is obsolete but some people are relying on
  // it internally. Keep it around until we migrate them.
  /**
   * @private
   * @type {{
   *   loadFlags: !Object<string, !Object<string, string>>,
   *   nameToPath: !Object<string, string>,
   *   requires: !Object<string, !Object<string, boolean>>,
   *   visited: !Object<string, boolean>,
   *   written: !Object<string, boolean>,
   *   deferred: !Object<string, string>
   * }}
   */
  goog.dependencies_ = {
    loadFlags: {},  // 1 to 1

    nameToPath: {},  // 1 to 1

    requires: {},  // 1 to many

    // Used when resolving dependencies to prevent us from visiting file
    // twice.
    visited: {},

    written: {},  // Used to keep track of script files we have written.

    deferred: {}  // Used to track deferred module evaluations in old IEs
  };

  /**
   * @return {!Object}
   * @private
   */
  goog.getLoader_ = function() {
    return {
      dependencies_: goog.dependencies_,
      writeScriptTag_: goog.writeScriptTag_
    };
  };


  /**
   * @param {string} src The script url.
   * @param {string=} opt_sourceText The optionally source text to evaluate
   * @return {boolean} True if the script was imported, false otherwise.
   * @private
   */
  goog.writeScriptTag_ = function(src, opt_sourceText) {
    if (goog.inHtmlDocument_()) {
      /** @type {!HTMLDocument} */
      var doc = goog.global.document;

      // If the user tries to require a new symbol after document load,
      // something has gone terribly wrong. Doing a document.write would
      // wipe out the page. This does not apply to the CSP-compliant method
      // of writing script tags.
      if (!goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING &&
          doc.readyState == 'complete') {
        // Certain test frameworks load base.js multiple times, which tries
        // to write deps.js each time. If that happens, just fail silently.
        // These frameworks wipe the page between each load of base.js, so this
        // is OK.
        var isDeps = /\bdeps.js$/.test(src);
        if (isDeps) {
          return false;
        } else {
          throw Error('Cannot write "' + src + '" after document load');
        }
      }

      var nonceAttr = '';
      var nonce = goog.getScriptNonce();
      if (nonce) {
        nonceAttr = ' nonce="' + nonce + '"';
      }

      if (opt_sourceText === undefined) {
        var script = '<script src="' + src + '"' + nonceAttr + '></' +
            'script>';
        doc.write(
            goog.TRUSTED_TYPES_POLICY_ ?
                goog.TRUSTED_TYPES_POLICY_.createHTML(script) :
                script);
      } else {
        var script = '<script' + nonceAttr + '>' +
            goog.protectScriptTag_(opt_sourceText) + '</' +
            'script>';
        doc.write(
            goog.TRUSTED_TYPES_POLICY_ ?
                goog.TRUSTED_TYPES_POLICY_.createHTML(script) :
                script);
      }
      return true;
    } else {
      return false;
    }
  };
  // MOE:end_strip


  /**
   * Tries to detect whether is in the context of an HTML document.
   * @return {boolean} True if it looks like HTML document.
   * @private
   */
  goog.inHtmlDocument_ = function() {
    /** @type {!Document} */
    var doc = goog.global.document;
    return doc != null && 'write' in doc;  // XULDocument misses write.
  };


  /**
   * We'd like to check for if the document readyState is 'loading'; however
   * there are bugs on IE 10 and below where the readyState being anything other
   * than 'complete' is not reliable.
   * @return {boolean}
   * @private
   */
  goog.isDocumentLoading_ = function() {
    // attachEvent is available on IE 6 thru 10 only, and thus can be used to
    // detect those browsers.
    /** @type {!HTMLDocument} */
    var doc = goog.global.document;
    return doc.attachEvent ? doc.readyState != 'complete' :
                             doc.readyState == 'loading';
  };


  /**
   * Tries to detect the base path of base.js script that bootstraps Closure.
   * @private
   */
  goog.findBasePath_ = function() {
    if (goog.global.CLOSURE_BASE_PATH != undefined &&
        // Anti DOM-clobbering runtime check (b/37736576).
        typeof goog.global.CLOSURE_BASE_PATH === 'string') {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else if (!goog.inHtmlDocument_()) {
      return;
    }
    /** @type {!Document} */
    var doc = goog.global.document;
    // If we have a currentScript available, use it exclusively.
    var currentScript = doc.currentScript;
    if (currentScript) {
      var scripts = [currentScript];
    } else {
      var scripts = doc.getElementsByTagName('SCRIPT');
    }
    // Search backwards since the current script is in almost all cases the one
    // that has base.js.
    for (var i = scripts.length - 1; i >= 0; --i) {
      var script = /** @type {!HTMLScriptElement} */ (scripts[i]);
      var src = script.src;
      var qmark = src.lastIndexOf('?');
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == 'base.js') {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };

  goog.findBasePath_();

  /** @struct @constructor @final */
  goog.Transpiler = function() {
    /** @private {?Object<string, boolean>} */
    this.requiresTranspilation_ = null;
    /** @private {string} */
    this.transpilationTarget_ = goog.TRANSPILE_TO_LANGUAGE;
  };


  // MOE:begin_strip
  // LINT.IfChange
  // MOE:end_strip
  /**
   * Returns a newly created map from language mode string to a boolean
   * indicating whether transpilation should be done for that mode as well as
   * the highest level language that this environment supports.
   *
   * Guaranteed invariant:
   * For any two modes, l1 and l2 where l2 is a newer mode than l1,
   * `map[l1] == true` implies that `map[l2] == true`.
   *
   * Note this method is extracted and used elsewhere, so it cannot rely on
   * anything external (it should easily be able to be transformed into a
   * standalone, top level function).
   *
   * @private
   * @return {{
   *   target: string,
   *   map: !Object<string, boolean>
   * }}
   */
  goog.Transpiler.prototype.createRequiresTranspilation_ = function() {
    var transpilationTarget = 'es3';
    var /** !Object<string, boolean> */ requiresTranspilation = {'es3': false};
    var transpilationRequiredForAllLaterModes = false;

    /**
     * Adds an entry to requiresTranspliation for the given language mode.
     *
     * IMPORTANT: Calls must be made in order from oldest to newest language
     * mode.
     * @param {string} modeName
     * @param {function(): boolean} isSupported Returns true if the JS engine
     *     supports the given mode.
     */
    function addNewerLanguageTranspilationCheck(modeName, isSupported) {
      if (transpilationRequiredForAllLaterModes) {
        requiresTranspilation[modeName] = true;
      } else if (isSupported()) {
        transpilationTarget = modeName;
        requiresTranspilation[modeName] = false;
      } else {
        requiresTranspilation[modeName] = true;
        transpilationRequiredForAllLaterModes = true;
      }
    }

    /**
     * Does the given code evaluate without syntax errors and return a truthy
     * result?
     */
    function /** boolean */ evalCheck(/** string */ code) {
      try {
        return !!eval(code);
      } catch (ignored) {
        return false;
      }
    }

    var userAgent = goog.global.navigator && goog.global.navigator.userAgent ?
        goog.global.navigator.userAgent :
        '';

    // Identify ES3-only browsers by their incorrect treatment of commas.
    addNewerLanguageTranspilationCheck('es5', function() {
      return evalCheck('[1,].length==1');
    });
    addNewerLanguageTranspilationCheck('es6', function() {
      // Edge has a non-deterministic (i.e., not reproducible) bug with ES6:
      // https://github.com/Microsoft/ChakraCore/issues/1496.
      // MOE:begin_strip
      // TODO(joeltine): Our internal web-testing version of Edge will need to
      // be updated before we can remove this check. See http://b/34945376.
      // MOE:end_strip
      var re = /Edge\/(\d+)(\.\d)*/i;
      var edgeUserAgent = userAgent.match(re);
      if (edgeUserAgent) {
        // The Reflect.construct test below is flaky on Edge. It can sometimes
        // pass or fail on 40 15.15063, so just exit early for Edge and treat
        // it as ES5. Until we're on a more up to date version just always use
        // ES5. See https://github.com/Microsoft/ChakraCore/issues/3217.
        return false;
      }
      // Test es6: [FF50 (?), Edge 14 (?), Chrome 50]
      //   (a) default params (specifically shadowing locals),
      //   (b) destructuring, (c) block-scoped functions,
      //   (d) for-of (const), (e) new.target/Reflect.construct
      var es6fullTest =
          'class X{constructor(){if(new.target!=String)throw 1;this.x=42}}' +
          'let q=Reflect.construct(X,[],String);if(q.x!=42||!(q instanceof ' +
          'String))throw 1;for(const a of[2,3]){if(a==2)continue;function ' +
          'f(z={a}){let a=0;return z.a}{function f(){return 0;}}return f()' +
          '==3}';

      return evalCheck('(()=>{"use strict";' + es6fullTest + '})()');
    });
    // ** and **= are the only new features in 'es7'
    addNewerLanguageTranspilationCheck('es7', function() {
      return evalCheck('2 ** 2 == 4');
    });
    // async functions are the only new features in 'es8'
    addNewerLanguageTranspilationCheck('es8', function() {
      return evalCheck('async () => 1, true');
    });
    addNewerLanguageTranspilationCheck('es9', function() {
      return evalCheck('({...rest} = {}), true');
    });
    addNewerLanguageTranspilationCheck('es_next', function() {
      return false;  // assume it always need to transpile
    });
    return {target: transpilationTarget, map: requiresTranspilation};
  };
  // MOE:begin_strip
  // LINT.ThenChange(//depot/google3/java/com/google/testing/web/devtools/updatebrowserinfo/requires_transpilation.js)
  // MOE:end_strip


  /**
   * Determines whether the given language needs to be transpiled.
   * @param {string} lang
   * @param {string|undefined} module
   * @return {boolean}
   */
  goog.Transpiler.prototype.needsTranspile = function(lang, module) {
    if (goog.TRANSPILE == 'always') {
      return true;
    } else if (goog.TRANSPILE == 'never') {
      return false;
    } else if (!this.requiresTranspilation_) {
      var obj = this.createRequiresTranspilation_();
      this.requiresTranspilation_ = obj.map;
      this.transpilationTarget_ = this.transpilationTarget_ || obj.target;
    }
    if (lang in this.requiresTranspilation_) {
      if (this.requiresTranspilation_[lang]) {
        return true;
      } else if (
          goog.inHtmlDocument_() && module == 'es6' &&
          !('noModule' in goog.global.document.createElement('script'))) {
        return true;
      } else {
        return false;
      }
    } else {
      throw new Error('Unknown language mode: ' + lang);
    }
  };


  /**
   * Lazily retrieves the transpiler and applies it to the source.
   * @param {string} code JS code.
   * @param {string} path Path to the code.
   * @return {string} The transpiled code.
   */
  goog.Transpiler.prototype.transpile = function(code, path) {
    // TODO(johnplaisted): We should delete goog.transpile_ and just have this
    // function. But there's some compile error atm where goog.global is being
    // stripped incorrectly without this.
    return goog.transpile_(code, path, this.transpilationTarget_);
  };


  /** @private @final {!goog.Transpiler} */
  goog.transpiler_ = new goog.Transpiler();

  /**
   * Rewrites closing script tags in input to avoid ending an enclosing script
   * tag.
   *
   * @param {string} str
   * @return {string}
   * @private
   */
  goog.protectScriptTag_ = function(str) {
    return str.replace(/<\/(SCRIPT)/ig, '\\x3c/$1');
  };


  /**
   * A debug loader is responsible for downloading and executing javascript
   * files in an unbundled, uncompiled environment.
   *
   * This can be custimized via the setDependencyFactory method, or by
   * CLOSURE_IMPORT_SCRIPT/CLOSURE_LOAD_FILE_SYNC.
   *
   * @struct @constructor @final @private
   */
  goog.DebugLoader_ = function() {
    /** @private @const {!Object<string, !goog.Dependency>} */
    this.dependencies_ = {};
    /** @private @const {!Object<string, string>} */
    this.idToPath_ = {};
    /** @private @const {!Object<string, boolean>} */
    this.written_ = {};
    /** @private @const {!Array<!goog.Dependency>} */
    this.loadingDeps_ = [];
    /** @private {!Array<!goog.Dependency>} */
    this.depsToLoad_ = [];
    /** @private {boolean} */
    this.paused_ = false;
    /** @private {!goog.DependencyFactory} */
    this.factory_ = new goog.DependencyFactory(goog.transpiler_);
    /** @private @const {!Object<string, !Function>} */
    this.deferredCallbacks_ = {};
    /** @private @const {!Array<string>} */
    this.deferredQueue_ = [];
  };

  /**
   * @param {!Array<string>} namespaces
   * @param {function(): undefined} callback Function to call once all the
   *     namespaces have loaded.
   */
  goog.DebugLoader_.prototype.bootstrap = function(namespaces, callback) {
    var cb = callback;
    function resolve() {
      if (cb) {
        goog.global.setTimeout(cb, 0);
        cb = null;
      }
    }

    if (!namespaces.length) {
      resolve();
      return;
    }

    var deps = [];
    for (var i = 0; i < namespaces.length; i++) {
      var path = this.getPathFromDeps_(namespaces[i]);
      if (!path) {
        throw new Error('Unregonized namespace: ' + namespaces[i]);
      }
      deps.push(this.dependencies_[path]);
    }

    var require = goog.require;
    var loaded = 0;
    for (var i = 0; i < namespaces.length; i++) {
      require(namespaces[i]);
      deps[i].onLoad(function() {
        if (++loaded == namespaces.length) {
          resolve();
        }
      });
    }
  };


  /**
   * Loads the Closure Dependency file.
   *
   * Exposed a public function so CLOSURE_NO_DEPS can be set to false, base
   * loaded, setDependencyFactory called, and then this called. i.e. allows
   * custom loading of the deps file.
   */
  goog.DebugLoader_.prototype.loadClosureDeps = function() {
    // Circumvent addDependency, which would try to transpile deps.js if
    // transpile is set to always.
    var relPath = 'deps.js';
    this.depsToLoad_.push(this.factory_.createDependency(
        goog.normalizePath_(goog.basePath + relPath), relPath, [], [], {},
        false));
    this.loadDeps_();
  };


  /**
   * Notifies the debug loader when a dependency has been requested.
   *
   * @param {string} absPathOrId Path of the dependency or goog id.
   * @param {boolean=} opt_force
   */
  goog.DebugLoader_.prototype.requested = function(absPathOrId, opt_force) {
    var path = this.getPathFromDeps_(absPathOrId);
    if (path &&
        (opt_force || this.areDepsLoaded_(this.dependencies_[path].requires))) {
      var callback = this.deferredCallbacks_[path];
      if (callback) {
        delete this.deferredCallbacks_[path];
        callback();
      }
    }
  };


  /**
   * Sets the dependency factory, which can be used to create custom
   * goog.Dependency implementations to control how dependencies are loaded.
   *
   * @param {!goog.DependencyFactory} factory
   */
  goog.DebugLoader_.prototype.setDependencyFactory = function(factory) {
    this.factory_ = factory;
  };


  /**
   * Travserses the dependency graph and queues the given dependency, and all of
   * its transitive dependencies, for loading and then starts loading if not
   * paused.
   *
   * @param {string} namespace
   * @private
   */
  goog.DebugLoader_.prototype.load_ = function(namespace) {
    if (!this.getPathFromDeps_(namespace)) {
      var errorMessage = 'goog.require could not find: ' + namespace;

      goog.logToConsole_(errorMessage);
      // MOE:begin_strip

      // NOTE(nicksantos): We could always throw an error, but this would
      // break legacy users that depended on this failing silently. Instead,
      // the compiler should warn us when there are invalid goog.require
      // calls. For now, we simply give clients a way to turn strict mode on.
      if (goog.useStrictRequires) {
        throw Error(errorMessage);
      }

      // In external Closure, always error.
      // MOE:end_strip
      // MOE:insert throw Error(errorMessage);
    } else {
      var loader = this;

      var deps = [];

      /** @param {string} namespace */
      var visit = function(namespace) {
        var path = loader.getPathFromDeps_(namespace);

        if (!path) {
          throw new Error('Bad dependency path or symbol: ' + namespace);
        }

        if (loader.written_[path]) {
          return;
        }

        loader.written_[path] = true;

        var dep = loader.dependencies_[path];
        // MOE:begin_strip
        if (goog.dependencies_.written[dep.relativePath]) {
          return;
        }
        // MOE:end_strip
        for (var i = 0; i < dep.requires.length; i++) {
          if (!goog.isProvided_(dep.requires[i])) {
            visit(dep.requires[i]);
          }
        }

        deps.push(dep);
      };

      visit(namespace);

      var wasLoading = !!this.depsToLoad_.length;
      this.depsToLoad_ = this.depsToLoad_.concat(deps);

      if (!this.paused_ && !wasLoading) {
        this.loadDeps_();
      }
    }
  };


  /**
   * Loads any queued dependencies until they are all loaded or paused.
   *
   * @private
   */
  goog.DebugLoader_.prototype.loadDeps_ = function() {
    var loader = this;
    var paused = this.paused_;

    while (this.depsToLoad_.length && !paused) {
      (function() {
        var loadCallDone = false;
        var dep = loader.depsToLoad_.shift();

        var loaded = false;
        loader.loading_(dep);

        var controller = {
          pause: function() {
            if (loadCallDone) {
              throw new Error('Cannot call pause after the call to load.');
            } else {
              paused = true;
            }
          },
          resume: function() {
            if (loadCallDone) {
              loader.resume_();
            } else {
              // Some dep called pause and then resume in the same load call.
              // Just keep running this same loop.
              paused = false;
            }
          },
          loaded: function() {
            if (loaded) {
              throw new Error('Double call to loaded.');
            }

            loaded = true;
            loader.loaded_(dep);
          },
          pending: function() {
            // Defensive copy.
            var pending = [];
            for (var i = 0; i < loader.loadingDeps_.length; i++) {
              pending.push(loader.loadingDeps_[i]);
            }
            return pending;
          },
          /**
           * @param {goog.ModuleType} type
           */
          setModuleState: function(type) {
            goog.moduleLoaderState_ = {
              type: type,
              moduleName: '',
              declareLegacyNamespace: false
            };
          },
          /** @type {function(string, string, string=)} */
          registerEs6ModuleExports: function(
              path, exports, opt_closureNamespace) {
            if (opt_closureNamespace) {
              goog.loadedModules_[opt_closureNamespace] = {
                exports: exports,
                type: goog.ModuleType.ES6,
                moduleId: opt_closureNamespace || ''
              };
            }
          },
          /** @type {function(string, ?)} */
          registerGoogModuleExports: function(moduleId, exports) {
            goog.loadedModules_[moduleId] = {
              exports: exports,
              type: goog.ModuleType.GOOG,
              moduleId: moduleId
            };
          },
          clearModuleState: function() {
            goog.moduleLoaderState_ = null;
          },
          defer: function(callback) {
            if (loadCallDone) {
              throw new Error(
                  'Cannot register with defer after the call to load.');
            }
            loader.defer_(dep, callback);
          },
          areDepsLoaded: function() {
            return loader.areDepsLoaded_(dep.requires);
          }
        };

        try {
          dep.load(controller);
        } finally {
          loadCallDone = true;
        }
      })();
    }

    if (paused) {
      this.pause_();
    }
  };


  /** @private */
  goog.DebugLoader_.prototype.pause_ = function() {
    this.paused_ = true;
  };


  /** @private */
  goog.DebugLoader_.prototype.resume_ = function() {
    if (this.paused_) {
      this.paused_ = false;
      this.loadDeps_();
    }
  };


  /**
   * Marks the given dependency as loading (load has been called but it has not
   * yet marked itself as finished). Useful for dependencies that want to know
   * what else is loading. Example: goog.modules cannot eval if there are
   * loading dependencies.
   *
   * @param {!goog.Dependency} dep
   * @private
   */
  goog.DebugLoader_.prototype.loading_ = function(dep) {
    this.loadingDeps_.push(dep);
  };


  /**
   * Marks the given dependency as having finished loading and being available
   * for require.
   *
   * @param {!goog.Dependency} dep
   * @private
   */
  goog.DebugLoader_.prototype.loaded_ = function(dep) {
    for (var i = 0; i < this.loadingDeps_.length; i++) {
      if (this.loadingDeps_[i] == dep) {
        this.loadingDeps_.splice(i, 1);
        break;
      }
    }

    for (var i = 0; i < this.deferredQueue_.length; i++) {
      if (this.deferredQueue_[i] == dep.path) {
        this.deferredQueue_.splice(i, 1);
        break;
      }
    }

    if (this.loadingDeps_.length == this.deferredQueue_.length &&
        !this.depsToLoad_.length) {
      // Something has asked to load these, but they may not be directly
      // required again later, so load them now that we know we're done loading
      // everything else. e.g. a goog module entry point.
      while (this.deferredQueue_.length) {
        this.requested(this.deferredQueue_.shift(), true);
      }
    }

    dep.loaded();
  };


  /**
   * @param {!Array<string>} pathsOrIds
   * @return {boolean}
   * @private
   */
  goog.DebugLoader_.prototype.areDepsLoaded_ = function(pathsOrIds) {
    for (var i = 0; i < pathsOrIds.length; i++) {
      var path = this.getPathFromDeps_(pathsOrIds[i]);
      if (!path ||
          (!(path in this.deferredCallbacks_) &&
           !goog.isProvided_(pathsOrIds[i]))) {
        return false;
      }
    }

    return true;
  };


  /**
   * @param {string} absPathOrId
   * @return {?string}
   * @private
   */
  goog.DebugLoader_.prototype.getPathFromDeps_ = function(absPathOrId) {
    if (absPathOrId in this.idToPath_) {
      return this.idToPath_[absPathOrId];
    } else if (absPathOrId in this.dependencies_) {
      return absPathOrId;
    } else {
      return null;
    }
  };


  /**
   * @param {!goog.Dependency} dependency
   * @param {!Function} callback
   * @private
   */
  goog.DebugLoader_.prototype.defer_ = function(dependency, callback) {
    this.deferredCallbacks_[dependency.path] = callback;
    this.deferredQueue_.push(dependency.path);
  };


  /**
   * Interface for goog.Dependency implementations to have some control over
   * loading of dependencies.
   *
   * @record
   */
  goog.LoadController = function() {};


  /**
   * Tells the controller to halt loading of more dependencies.
   */
  goog.LoadController.prototype.pause = function() {};


  /**
   * Tells the controller to resume loading of more dependencies if paused.
   */
  goog.LoadController.prototype.resume = function() {};


  /**
   * Tells the controller that this dependency has finished loading.
   *
   * This causes this to be removed from pending() and any load callbacks to
   * fire.
   */
  goog.LoadController.prototype.loaded = function() {};


  /**
   * List of dependencies on which load has been called but which have not
   * called loaded on their controller. This includes the current dependency.
   *
   * @return {!Array<!goog.Dependency>}
   */
  goog.LoadController.prototype.pending = function() {};


  /**
   * Registers an object as an ES6 module's exports so that goog.modules may
   * require it by path.
   *
   * @param {string} path Full path of the module.
   * @param {?} exports
   * @param {string=} opt_closureNamespace Closure namespace to associate with
   *     this module.
   */
  goog.LoadController.prototype.registerEs6ModuleExports = function(
      path, exports, opt_closureNamespace) {};


  /**
   * Sets the current module state.
   *
   * @param {goog.ModuleType} type Type of module.
   */
  goog.LoadController.prototype.setModuleState = function(type) {};


  /**
   * Clears the current module state.
   */
  goog.LoadController.prototype.clearModuleState = function() {};


  /**
   * Registers a callback to call once the dependency is actually requested
   * via goog.require + all of the immediate dependencies have been loaded or
   * all other files have been loaded. Allows for lazy loading until
   * require'd without pausing dependency loading, which is needed on old IE.
   *
   * @param {!Function} callback
   */
  goog.LoadController.prototype.defer = function(callback) {};


  /**
   * @return {boolean}
   */
  goog.LoadController.prototype.areDepsLoaded = function() {};


  /**
   * Basic super class for all dependencies Closure Library can load.
   *
   * This default implementation is designed to load untranspiled, non-module
   * scripts in a web broswer.
   *
   * For transpiled non-goog.module files {@see goog.TranspiledDependency}.
   * For goog.modules see {@see goog.GoogModuleDependency}.
   * For untranspiled ES6 modules {@see goog.Es6ModuleDependency}.
   *
   * @param {string} path Absolute path of this script.
   * @param {string} relativePath Path of this script relative to goog.basePath.
   * @param {!Array<string>} provides goog.provided or goog.module symbols
   *     in this file.
   * @param {!Array<string>} requires goog symbols or relative paths to Closure
   *     this depends on.
   * @param {!Object<string, string>} loadFlags
   * @struct @constructor
   */
  goog.Dependency = function(
      path, relativePath, provides, requires, loadFlags) {
    /** @const */
    this.path = path;
    /** @const */
    this.relativePath = relativePath;
    /** @const */
    this.provides = provides;
    /** @const */
    this.requires = requires;
    /** @const */
    this.loadFlags = loadFlags;
    /** @private {boolean} */
    this.loaded_ = false;
    /** @private {!Array<function()>} */
    this.loadCallbacks_ = [];
  };


  /**
   * @return {string} The pathname part of this dependency's path if it is a
   *     URI.
   */
  goog.Dependency.prototype.getPathName = function() {
    var pathName = this.path;
    var protocolIndex = pathName.indexOf('://');
    if (protocolIndex >= 0) {
      pathName = pathName.substring(protocolIndex + 3);
      var slashIndex = pathName.indexOf('/');
      if (slashIndex >= 0) {
        pathName = pathName.substring(slashIndex + 1);
      }
    }
    return pathName;
  };


  /**
   * @param {function()} callback Callback to fire as soon as this has loaded.
   * @final
   */
  goog.Dependency.prototype.onLoad = function(callback) {
    if (this.loaded_) {
      callback();
    } else {
      this.loadCallbacks_.push(callback);
    }
  };


  /**
   * Marks this dependency as loaded and fires any callbacks registered with
   * onLoad.
   * @final
   */
  goog.Dependency.prototype.loaded = function() {
    this.loaded_ = true;
    var callbacks = this.loadCallbacks_;
    this.loadCallbacks_ = [];
    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i]();
    }
  };


  /**
   * Whether or not document.written / appended script tags should be deferred.
   *
   * @private {boolean}
   */
  goog.Dependency.defer_ = false;


  /**
   * Map of script ready / state change callbacks. Old IE cannot handle putting
   * these properties on goog.global.
   *
   * @private @const {!Object<string, function(?):undefined>}
   */
  goog.Dependency.callbackMap_ = {};


  /**
   * @param {function(...?):?} callback
   * @return {string}
   * @private
   */
  goog.Dependency.registerCallback_ = function(callback) {
    var key = Math.random().toString(32);
    goog.Dependency.callbackMap_[key] = callback;
    return key;
  };


  /**
   * @param {string} key
   * @private
   */
  goog.Dependency.unregisterCallback_ = function(key) {
    delete goog.Dependency.callbackMap_[key];
  };


  /**
   * @param {string} key
   * @param {...?} var_args
   * @private
   * @suppress {unusedPrivateMembers}
   */
  goog.Dependency.callback_ = function(key, var_args) {
    if (key in goog.Dependency.callbackMap_) {
      var callback = goog.Dependency.callbackMap_[key];
      var args = [];
      for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      callback.apply(undefined, args);
    } else {
      var errorMessage = 'Callback key ' + key +
          ' does not exist (was base.js loaded more than once?).';
      // MOE:begin_strip
      // TODO(johnplaisted): Some people internally are mistakenly loading
      // base.js twice, and this can happen while a dependency is loading,
      // wiping out state.
      goog.logToConsole_(errorMessage);
      // MOE:end_strip
      // MOE:insert throw Error(errorMessage);
    }
  };


  /**
   * Starts loading this dependency. This dependency can pause loading if it
   * needs to and resume it later via the controller interface.
   *
   * When this is loaded it should call controller.loaded(). Note that this will
   * end up calling the loaded method of this dependency; there is no need to
   * call it explicitly.
   *
   * @param {!goog.LoadController} controller
   */
  goog.Dependency.prototype.load = function(controller) {
    if (goog.global.CLOSURE_IMPORT_SCRIPT) {
      if (goog.global.CLOSURE_IMPORT_SCRIPT(this.path)) {
        controller.loaded();
      } else {
        controller.pause();
      }
      return;
    }

    if (!goog.inHtmlDocument_()) {
      goog.logToConsole_(
          'Cannot use default debug loader outside of HTML documents.');
      if (this.relativePath == 'deps.js') {
        // Some old code is relying on base.js auto loading deps.js failing with
        // no error before later setting CLOSURE_IMPORT_SCRIPT.
        // CLOSURE_IMPORT_SCRIPT should be set *before* base.js is loaded, or
        // CLOSURE_NO_DEPS set to true.
        goog.logToConsole_(
            'Consider setting CLOSURE_IMPORT_SCRIPT before loading base.js, ' +
            'or setting CLOSURE_NO_DEPS to true.');
        controller.loaded();
      } else {
        controller.pause();
      }
      return;
    }

    /** @type {!HTMLDocument} */
    var doc = goog.global.document;

    // If the user tries to require a new symbol after document load,
    // something has gone terribly wrong. Doing a document.write would
    // wipe out the page. This does not apply to the CSP-compliant method
    // of writing script tags.
    if (doc.readyState == 'complete' &&
        !goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING) {
      // Certain test frameworks load base.js multiple times, which tries
      // to write deps.js each time. If that happens, just fail silently.
      // These frameworks wipe the page between each load of base.js, so this
      // is OK.
      var isDeps = /\bdeps.js$/.test(this.path);
      if (isDeps) {
        controller.loaded();
        return;
      } else {
        throw Error('Cannot write "' + this.path + '" after document load');
      }
    }

    var nonce = goog.getScriptNonce();
    if (!goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING &&
        goog.isDocumentLoading_()) {
      var key;
      var callback = function(script) {
        if (script.readyState && script.readyState != 'complete') {
          script.onload = callback;
          return;
        }
        goog.Dependency.unregisterCallback_(key);
        controller.loaded();
      };
      key = goog.Dependency.registerCallback_(callback);

      var defer = goog.Dependency.defer_ ? ' defer' : '';
      var nonceAttr = nonce ? ' nonce="' + nonce + '"' : '';
      var script = '<script src="' + this.path + '"' + nonceAttr + defer +
          ' id="script-' + key + '"><\/script>';

      script += '<script' + nonceAttr + '>';

      if (goog.Dependency.defer_) {
        script += 'document.getElementById(\'script-' + key +
            '\').onload = function() {\n' +
            '  goog.Dependency.callback_(\'' + key + '\', this);\n' +
            '};\n';
      } else {
        script += 'goog.Dependency.callback_(\'' + key +
            '\', document.getElementById(\'script-' + key + '\'));';
      }

      script += '<\/script>';

      doc.write(
          goog.TRUSTED_TYPES_POLICY_ ?
              goog.TRUSTED_TYPES_POLICY_.createHTML(script) :
              script);
    } else {
      var scriptEl =
          /** @type {!HTMLScriptElement} */ (doc.createElement('script'));
      scriptEl.defer = goog.Dependency.defer_;
      scriptEl.async = false;

      // If CSP nonces are used, propagate them to dynamically created scripts.
      // This is necessary to allow nonce-based CSPs without 'strict-dynamic'.
      if (nonce) {
        scriptEl.nonce = nonce;
      }

      if (goog.DebugLoader_.IS_OLD_IE_) {
        // Execution order is not guaranteed on old IE, halt loading and write
        // these scripts one at a time, after each loads.
        controller.pause();
        scriptEl.onreadystatechange = function() {
          if (scriptEl.readyState == 'loaded' ||
              scriptEl.readyState == 'complete') {
            controller.loaded();
            controller.resume();
          }
        };
      } else {
        scriptEl.onload = function() {
          scriptEl.onload = null;
          controller.loaded();
        };
      }

      scriptEl.src = goog.TRUSTED_TYPES_POLICY_ ?
          goog.TRUSTED_TYPES_POLICY_.createScriptURL(this.path) :
          this.path;
      doc.head.appendChild(scriptEl);
    }
  };


  /**
   * @param {string} path Absolute path of this script.
   * @param {string} relativePath Path of this script relative to goog.basePath.
   * @param {!Array<string>} provides Should be an empty array.
   *     TODO(johnplaisted) add support for adding closure namespaces to ES6
   *     modules for interop purposes.
   * @param {!Array<string>} requires goog symbols or relative paths to Closure
   *     this depends on.
   * @param {!Object<string, string>} loadFlags
   * @struct @constructor
   * @extends {goog.Dependency}
   */
  goog.Es6ModuleDependency = function(
      path, relativePath, provides, requires, loadFlags) {
    goog.Es6ModuleDependency.base(
        this, 'constructor', path, relativePath, provides, requires, loadFlags);
  };
  goog.inherits(goog.Es6ModuleDependency, goog.Dependency);


  /** @override */
  goog.Es6ModuleDependency.prototype.load = function(controller) {
    if (goog.global.CLOSURE_IMPORT_SCRIPT) {
      if (goog.global.CLOSURE_IMPORT_SCRIPT(this.path)) {
        controller.loaded();
      } else {
        controller.pause();
      }
      return;
    }

    if (!goog.inHtmlDocument_()) {
      goog.logToConsole_(
          'Cannot use default debug loader outside of HTML documents.');
      controller.pause();
      return;
    }

    /** @type {!HTMLDocument} */
    var doc = goog.global.document;

    var dep = this;

    // TODO(johnplaisted): Does document.writing really speed up anything? Any
    // difference between this and just waiting for interactive mode and then
    // appending?
    function write(src, contents) {
      var nonceAttr = '';
      var nonce = goog.getScriptNonce();
      if (nonce) {
        nonceAttr = ' nonce="' + nonce + '"';
      }

      if (contents) {
        var script = '<script type="module" crossorigin' + nonceAttr + '>' +
            contents + '</' +
            'script>';
        doc.write(
            goog.TRUSTED_TYPES_POLICY_ ?
                goog.TRUSTED_TYPES_POLICY_.createHTML(script) :
                script);
      } else {
        var script = '<script type="module" crossorigin src="' + src + '"' +
            nonceAttr + '></' +
            'script>';
        doc.write(
            goog.TRUSTED_TYPES_POLICY_ ?
                goog.TRUSTED_TYPES_POLICY_.createHTML(script) :
                script);
      }
    }

    function append(src, contents) {
      var scriptEl =
          /** @type {!HTMLScriptElement} */ (doc.createElement('script'));
      scriptEl.defer = true;
      scriptEl.async = false;
      scriptEl.type = 'module';
      scriptEl.setAttribute('crossorigin', true);

      // If CSP nonces are used, propagate them to dynamically created scripts.
      // This is necessary to allow nonce-based CSPs without 'strict-dynamic'.
      var nonce = goog.getScriptNonce();
      if (nonce) {
        scriptEl.nonce = nonce;
      }

      if (contents) {
        scriptEl.text = goog.TRUSTED_TYPES_POLICY_ ?
            goog.TRUSTED_TYPES_POLICY_.createScript(contents) :
            contents;
      } else {
        scriptEl.src = goog.TRUSTED_TYPES_POLICY_ ?
            goog.TRUSTED_TYPES_POLICY_.createScriptURL(src) :
            src;
      }

      doc.head.appendChild(scriptEl);
    }

    var create;

    if (goog.isDocumentLoading_()) {
      create = write;
      // We can ONLY call document.write if we are guaranteed that any
      // non-module script tags document.written after this are deferred.
      // Small optimization, in theory document.writing is faster.
      goog.Dependency.defer_ = true;
    } else {
      create = append;
    }

    // Write 4 separate tags here:
    // 1) Sets the module state at the correct time (just before execution).
    // 2) A src node for this, which just hopefully lets the browser load it a
    //    little early (no need to parse #3).
    // 3) Import the module and register it.
    // 4) Clear the module state at the correct time. Guaranteed to run even
    //    if there is an error in the module (#3 will not run if there is an
    //    error in the module).
    var beforeKey = goog.Dependency.registerCallback_(function() {
      goog.Dependency.unregisterCallback_(beforeKey);
      controller.setModuleState(goog.ModuleType.ES6);
    });
    create(undefined, 'goog.Dependency.callback_("' + beforeKey + '")');

    // TODO(johnplaisted): Does this really speed up anything?
    create(this.path, undefined);

    var registerKey = goog.Dependency.registerCallback_(function(exports) {
      goog.Dependency.unregisterCallback_(registerKey);
      controller.registerEs6ModuleExports(
          dep.path, exports, goog.moduleLoaderState_.moduleName);
    });
    create(
        undefined,
        'import * as m from "' + this.path + '"; goog.Dependency.callback_("' +
            registerKey + '", m)');

    var afterKey = goog.Dependency.registerCallback_(function() {
      goog.Dependency.unregisterCallback_(afterKey);
      controller.clearModuleState();
      controller.loaded();
    });
    create(undefined, 'goog.Dependency.callback_("' + afterKey + '")');
  };


  /**
   * Superclass of any dependency that needs to be loaded into memory,
   * transformed, and then eval'd (goog.modules and transpiled files).
   *
   * @param {string} path Absolute path of this script.
   * @param {string} relativePath Path of this script relative to goog.basePath.
   * @param {!Array<string>} provides goog.provided or goog.module symbols
   *     in this file.
   * @param {!Array<string>} requires goog symbols or relative paths to Closure
   *     this depends on.
   * @param {!Object<string, string>} loadFlags
   * @struct @constructor @abstract
   * @extends {goog.Dependency}
   */
  goog.TransformedDependency = function(
      path, relativePath, provides, requires, loadFlags) {
    goog.TransformedDependency.base(
        this, 'constructor', path, relativePath, provides, requires, loadFlags);
    /** @private {?string} */
    this.contents_ = null;

    /**
     * Whether to lazily make the synchronous XHR (when goog.require'd) or make
     * the synchronous XHR when initially loading. On FireFox 61 there is a bug
     * where an ES6 module cannot make a synchronous XHR (rather, it can, but if
     * it does then no other ES6 modules will load after).
     *
     * tl;dr we lazy load due to bugs on older browsers and eager load due to
     * bugs on newer ones.
     *
     * https://bugzilla.mozilla.org/show_bug.cgi?id=1477090
     *
     * @private @const {boolean}
     */
    this.lazyFetch_ = !goog.inHtmlDocument_() ||
        !('noModule' in goog.global.document.createElement('script'));
  };
  goog.inherits(goog.TransformedDependency, goog.Dependency);


  /** @override */
  goog.TransformedDependency.prototype.load = function(controller) {
    var dep = this;

    function fetch() {
      dep.contents_ = goog.loadFileSync_(dep.path);

      if (dep.contents_) {
        dep.contents_ = dep.transform(dep.contents_);
        if (dep.contents_) {
          dep.contents_ += '\n//# sourceURL=' + dep.path;
        }
      }
    }

    if (goog.global.CLOSURE_IMPORT_SCRIPT) {
      fetch();
      if (this.contents_ &&
          goog.global.CLOSURE_IMPORT_SCRIPT('', this.contents_)) {
        this.contents_ = null;
        controller.loaded();
      } else {
        controller.pause();
      }
      return;
    }


    var isEs6 = this.loadFlags['module'] == goog.ModuleType.ES6;

    if (!this.lazyFetch_) {
      fetch();
    }

    function load() {
      if (dep.lazyFetch_) {
        fetch();
      }

      if (!dep.contents_) {
        // loadFileSync_ or transform are responsible. Assume they logged an
        // error.
        return;
      }

      if (isEs6) {
        controller.setModuleState(goog.ModuleType.ES6);
      }

      var namespace;

      try {
        var contents = dep.contents_;
        dep.contents_ = null;
        goog.globalEval(contents);
        if (isEs6) {
          namespace = goog.moduleLoaderState_.moduleName;
        }
      } finally {
        if (isEs6) {
          controller.clearModuleState();
        }
      }

      if (isEs6) {
        // Due to circular dependencies this may not be available for require
        // right now.
        goog.global['$jscomp']['require']['ensure'](
            [dep.getPathName()], function() {
              controller.registerEs6ModuleExports(
                  dep.path,
                  goog.global['$jscomp']['require'](dep.getPathName()),
                  namespace);
            });
      }

      controller.loaded();
    }

    // Do not fetch now; in FireFox 47 the synchronous XHR doesn't block all
    // events. If we fetched now and then document.write'd the contents the
    // document.write would be an eval and would execute too soon! Instead write
    // a script tag to fetch and eval synchronously at the correct time.
    function fetchInOwnScriptThenLoad() {
      /** @type {!HTMLDocument} */
      var doc = goog.global.document;

      var key = goog.Dependency.registerCallback_(function() {
        goog.Dependency.unregisterCallback_(key);
        load();
      });

      var nonce = goog.getScriptNonce();
      var nonceAttr = nonce ? ' nonce="' + nonce + '"' : '';
      var script = '<script' + nonceAttr + '>' +
          goog.protectScriptTag_('goog.Dependency.callback_("' + key + '");') +
          '</' +
          'script>';
      doc.write(
          goog.TRUSTED_TYPES_POLICY_ ?
              goog.TRUSTED_TYPES_POLICY_.createHTML(script) :
              script);
    }

    // If one thing is pending it is this.
    var anythingElsePending = controller.pending().length > 1;

    // If anything else is loading we need to lazy load due to bugs in old IE.
    // Specifically script tags with src and script tags with contents could
    // execute out of order if document.write is used, so we cannot use
    // document.write. Do not pause here; it breaks old IE as well.
    var useOldIeWorkAround =
        anythingElsePending && goog.DebugLoader_.IS_OLD_IE_;

    // Additionally if we are meant to defer scripts but the page is still
    // loading (e.g. an ES6 module is loading) then also defer. Or if we are
    // meant to defer and anything else is pending then defer (those may be
    // scripts that did not need transformation and are just script tags with
    // defer set to true, and we need to evaluate after that deferred script).
    var needsAsyncLoading = goog.Dependency.defer_ &&
        (anythingElsePending || goog.isDocumentLoading_());

    if (useOldIeWorkAround || needsAsyncLoading) {
      // Note that we only defer when we have to rather than 100% of the time.
      // Always defering would work, but then in theory the order of
      // goog.require calls would then matter. We want to enforce that most of
      // the time the order of the require calls does not matter.
      controller.defer(function() {
        load();
      });
      return;
    }
    // TODO(johnplaisted): Externs are missing onreadystatechange for
    // HTMLDocument.
    /** @type {?} */
    var doc = goog.global.document;

    var isInternetExplorer =
        goog.inHtmlDocument_() && 'ActiveXObject' in goog.global;

    // Don't delay in any version of IE. There's bug around this that will
    // cause out of order script execution. This means that on older IE ES6
    // modules will load too early (while the document is still loading + the
    // dom is not available). The other option is to load too late (when the
    // document is complete and the onload even will never fire). This seems
    // to be the lesser of two evils as scripts already act like the former.
    if (isEs6 && goog.inHtmlDocument_() && goog.isDocumentLoading_() &&
        !isInternetExplorer) {
      goog.Dependency.defer_ = true;
      // Transpiled ES6 modules still need to load like regular ES6 modules,
      // aka only after the document is interactive.
      controller.pause();
      var oldCallback = doc.onreadystatechange;
      doc.onreadystatechange = function() {
        if (doc.readyState == 'interactive') {
          doc.onreadystatechange = oldCallback;
          load();
          controller.resume();
        }
        if (typeof oldCallback === 'function') {
          oldCallback.apply(undefined, arguments);
        }
      };
    } else {
      // Always eval on old IE.
      if (goog.DebugLoader_.IS_OLD_IE_ || !goog.inHtmlDocument_() ||
          !goog.isDocumentLoading_()) {
        load();
      } else {
        fetchInOwnScriptThenLoad();
      }
    }
  };


  /**
   * @param {string} contents
   * @return {string}
   * @abstract
   */
  goog.TransformedDependency.prototype.transform = function(contents) {};


  /**
   * Any non-goog.module dependency which needs to be transpiled before eval.
   *
   * @param {string} path Absolute path of this script.
   * @param {string} relativePath Path of this script relative to goog.basePath.
   * @param {!Array<string>} provides goog.provided or goog.module symbols
   *     in this file.
   * @param {!Array<string>} requires goog symbols or relative paths to Closure
   *     this depends on.
   * @param {!Object<string, string>} loadFlags
   * @param {!goog.Transpiler} transpiler
   * @struct @constructor
   * @extends {goog.TransformedDependency}
   */
  goog.TranspiledDependency = function(
      path, relativePath, provides, requires, loadFlags, transpiler) {
    goog.TranspiledDependency.base(
        this, 'constructor', path, relativePath, provides, requires, loadFlags);
    /** @protected @const*/
    this.transpiler = transpiler;
  };
  goog.inherits(goog.TranspiledDependency, goog.TransformedDependency);


  /** @override */
  goog.TranspiledDependency.prototype.transform = function(contents) {
    // Transpile with the pathname so that ES6 modules are domain agnostic.
    return this.transpiler.transpile(contents, this.getPathName());
  };


  /**
   * An ES6 module dependency that was transpiled to a jscomp module outside
   * of the debug loader, e.g. server side.
   *
   * @param {string} path Absolute path of this script.
   * @param {string} relativePath Path of this script relative to goog.basePath.
   * @param {!Array<string>} provides goog.provided or goog.module symbols
   *     in this file.
   * @param {!Array<string>} requires goog symbols or relative paths to Closure
   *     this depends on.
   * @param {!Object<string, string>} loadFlags
   * @struct @constructor
   * @extends {goog.TransformedDependency}
   */
  goog.PreTranspiledEs6ModuleDependency = function(
      path, relativePath, provides, requires, loadFlags) {
    goog.PreTranspiledEs6ModuleDependency.base(
        this, 'constructor', path, relativePath, provides, requires, loadFlags);
  };
  goog.inherits(
      goog.PreTranspiledEs6ModuleDependency, goog.TransformedDependency);


  /** @override */
  goog.PreTranspiledEs6ModuleDependency.prototype.transform = function(
      contents) {
    return contents;
  };


  /**
   * A goog.module, transpiled or not. Will always perform some minimal
   * transformation even when not transpiled to wrap in a goog.loadModule
   * statement.
   *
   * @param {string} path Absolute path of this script.
   * @param {string} relativePath Path of this script relative to goog.basePath.
   * @param {!Array<string>} provides goog.provided or goog.module symbols
   *     in this file.
   * @param {!Array<string>} requires goog symbols or relative paths to Closure
   *     this depends on.
   * @param {!Object<string, string>} loadFlags
   * @param {boolean} needsTranspile
   * @param {!goog.Transpiler} transpiler
   * @struct @constructor
   * @extends {goog.TransformedDependency}
   */
  goog.GoogModuleDependency = function(
      path, relativePath, provides, requires, loadFlags, needsTranspile,
      transpiler) {
    goog.GoogModuleDependency.base(
        this, 'constructor', path, relativePath, provides, requires, loadFlags);
    /** @private @const */
    this.needsTranspile_ = needsTranspile;
    /** @private @const */
    this.transpiler_ = transpiler;
  };
  goog.inherits(goog.GoogModuleDependency, goog.TransformedDependency);


  /** @override */
  goog.GoogModuleDependency.prototype.transform = function(contents) {
    if (this.needsTranspile_) {
      contents = this.transpiler_.transpile(contents, this.getPathName());
    }

    if (!goog.LOAD_MODULE_USING_EVAL || goog.global.JSON === undefined) {
      return '' +
          'goog.loadModule(function(exports) {' +
          '"use strict";' + contents +
          '\n' +  // terminate any trailing single line comment.
          ';return exports' +
          '});' +
          '\n//# sourceURL=' + this.path + '\n';
    } else {
      return '' +
          'goog.loadModule(' +
          goog.global.JSON.stringify(
              contents + '\n//# sourceURL=' + this.path + '\n') +
          ');';
    }
  };


  /**
   * Whether the browser is IE9 or earlier, which needs special handling
   * for deferred modules.
   * @const @private {boolean}
   */
  goog.DebugLoader_.IS_OLD_IE_ = !!(
      !goog.global.atob && goog.global.document && goog.global.document['all']);


  /**
   * @param {string} relPath
   * @param {!Array<string>|undefined} provides
   * @param {!Array<string>} requires
   * @param {boolean|!Object<string>=} opt_loadFlags
   * @see goog.addDependency
   */
  goog.DebugLoader_.prototype.addDependency = function(
      relPath, provides, requires, opt_loadFlags) {
    provides = provides || [];
    relPath = relPath.replace(/\\/g, '/');
    var path = goog.normalizePath_(goog.basePath + relPath);
    if (!opt_loadFlags || typeof opt_loadFlags === 'boolean') {
      opt_loadFlags = opt_loadFlags ? {'module': goog.ModuleType.GOOG} : {};
    }
    var dep = this.factory_.createDependency(
        path, relPath, provides, requires, opt_loadFlags,
        goog.transpiler_.needsTranspile(
            opt_loadFlags['lang'] || 'es3', opt_loadFlags['module']));
    this.dependencies_[path] = dep;
    for (var i = 0; i < provides.length; i++) {
      this.idToPath_[provides[i]] = path;
    }
    this.idToPath_[relPath] = path;
  };


  /**
   * Creates goog.Dependency instances for the debug loader to load.
   *
   * Should be overridden to have the debug loader use custom subclasses of
   * goog.Dependency.
   *
   * @param {!goog.Transpiler} transpiler
   * @struct @constructor
   */
  goog.DependencyFactory = function(transpiler) {
    /** @protected @const */
    this.transpiler = transpiler;
  };


  /**
   * @param {string} path Absolute path of the file.
   * @param {string} relativePath Path relative to closure’s base.js.
   * @param {!Array<string>} provides Array of provided goog.provide/module ids.
   * @param {!Array<string>} requires Array of required goog.provide/module /
   *     relative ES6 module paths.
   * @param {!Object<string, string>} loadFlags
   * @param {boolean} needsTranspile True if the file needs to be transpiled
   *     per the goog.Transpiler.
   * @return {!goog.Dependency}
   */
  goog.DependencyFactory.prototype.createDependency = function(
      path, relativePath, provides, requires, loadFlags, needsTranspile) {
    // MOE:begin_strip
    var provide, require;
    for (var i = 0; provide = provides[i]; i++) {
      goog.dependencies_.nameToPath[provide] = relativePath;
      goog.dependencies_.loadFlags[relativePath] = loadFlags;
    }
    for (var j = 0; require = requires[j]; j++) {
      if (!(relativePath in goog.dependencies_.requires)) {
        goog.dependencies_.requires[relativePath] = {};
      }
      goog.dependencies_.requires[relativePath][require] = true;
    }
    // MOE:end_strip

    if (loadFlags['module'] == goog.ModuleType.GOOG) {
      return new goog.GoogModuleDependency(
          path, relativePath, provides, requires, loadFlags, needsTranspile,
          this.transpiler);
    } else if (needsTranspile) {
      return new goog.TranspiledDependency(
          path, relativePath, provides, requires, loadFlags, this.transpiler);
    } else {
      if (loadFlags['module'] == goog.ModuleType.ES6) {
        if (goog.TRANSPILE == 'never' && goog.ASSUME_ES_MODULES_TRANSPILED) {
          return new goog.PreTranspiledEs6ModuleDependency(
              path, relativePath, provides, requires, loadFlags);
        } else {
          return new goog.Es6ModuleDependency(
              path, relativePath, provides, requires, loadFlags);
        }
      } else {
        return new goog.Dependency(
            path, relativePath, provides, requires, loadFlags);
      }
    }
  };


  /** @private @const */
  goog.debugLoader_ = new goog.DebugLoader_();


  /**
   * Loads the Closure Dependency file.
   *
   * Exposed a public function so CLOSURE_NO_DEPS can be set to false, base
   * loaded, setDependencyFactory called, and then this called. i.e. allows
   * custom loading of the deps file.
   */
  goog.loadClosureDeps = function() {
    goog.debugLoader_.loadClosureDeps();
  };


  /**
   * Sets the dependency factory, which can be used to create custom
   * goog.Dependency implementations to control how dependencies are loaded.
   *
   * Note: if you wish to call this function and provide your own implemnetation
   * it is a wise idea to set CLOSURE_NO_DEPS to true, otherwise the dependency
   * file and all of its goog.addDependency calls will use the default factory.
   * You can call goog.loadClosureDeps to load the Closure dependency file
   * later, after your factory is injected.
   *
   * @param {!goog.DependencyFactory} factory
   */
  goog.setDependencyFactory = function(factory) {
    goog.debugLoader_.setDependencyFactory(factory);
  };


  /**
   * Trusted Types policy for the debug loader.
   * @private @const {?TrustedTypePolicy}
   */
  goog.TRUSTED_TYPES_POLICY_ = goog.TRUSTED_TYPES_POLICY_NAME ?
      goog.createTrustedTypesPolicy(goog.TRUSTED_TYPES_POLICY_NAME + '#base') :
      null;

  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.debugLoader_.loadClosureDeps();
  }


  /**
   * Bootstraps the given namespaces and calls the callback once they are
   * available either via goog.require. This is a replacement for using
   * `goog.require` to bootstrap Closure JavaScript. Previously a `goog.require`
   * in an HTML file would guarantee that the require'd namespace was available
   * in the next immediate script tag. With ES6 modules this no longer a
   * guarantee.
   *
   * @param {!Array<string>} namespaces
   * @param {function(): ?} callback Function to call once all the namespaces
   *     have loaded. Always called asynchronously.
   */
  goog.bootstrap = function(namespaces, callback) {
    goog.debugLoader_.bootstrap(namespaces, callback);
  };
}


/**
 * @define {string} Trusted Types policy name. If non-empty then Closure will
 * use Trusted Types.
 */
goog.TRUSTED_TYPES_POLICY_NAME =
    goog.define('goog.TRUSTED_TYPES_POLICY_NAME', 'goog');


/**
 * Returns the parameter.
 * @param {string} s
 * @return {string}
 * @private
 */
goog.identity_ = function(s) {
  return s;
};


/**
 * Creates Trusted Types policy if Trusted Types are supported by the browser.
 * The policy just blesses any string as a Trusted Type. It is not visibility
 * restricted because anyone can also call trustedTypes.createPolicy directly.
 * However, the allowed names should be restricted by a HTTP header and the
 * reference to the created policy should be visibility restricted.
 * @param {string} name
 * @return {?TrustedTypePolicy}
 */
goog.createTrustedTypesPolicy = function(name) {
  var policy = null;
  var policyFactory = goog.global.trustedTypes;
  if (!policyFactory || !policyFactory.createPolicy) {
    return policy;
  }
  // trustedTypes.createPolicy throws if called with a name that is already
  // registered, even in report-only mode. Until the API changes, catch the
  // error not to break the applications functionally. In such case, the code
  // will fall back to using regular Safe Types.
  // TODO(koto): Remove catching once createPolicy API stops throwing.
  try {
    policy = policyFactory.createPolicy(name, {
      createHTML: goog.identity_,
      createScript: goog.identity_,
      createScriptURL: goog.identity_
    });
  } catch (e) {
    goog.logToConsole_(e.message);
  }
  return policy;
};

//third_party/javascript/tslib/tslib_closure.js
goog.loadModule(function(exports) {'use strict';/**
 * @fileoverview
 * Hand-modified Closure version of tslib.js.
 * These use the literal space optimized code from TypeScript for
 * compatibility.
 *
 * @suppress {undefinedVars}
 */

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

goog.module('google3.third_party.javascript.tslib.tslib');

/** @suppress {missingPolyfill} the code below intentionally feature-tests. */
var extendStatics = Object.setPrototypeOf ||
    ({__proto__: []} instanceof Array && function(d, b) {d.__proto__ = b;}) ||
    function(d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

/**
 * @param {?} d
 * @param {?} b
 */
exports.__extends = function(d, b) {
    extendStatics(d, b);
    // LOCAL MODIFICATION: Add jsdoc annotation here:
    /** @constructor */
    function __() { /** @type {?} */ (this).constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

exports.__assign = Object.assign || /** @return {?} */ function (/** ? */ t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};

/**
 * @param {?} s
 * @param {?} e
 * @return {?}
 */
exports.__rest = function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};

/**
 * @param {?} decorators
 * @param {T} target
 * @param {?=} key
 * @param {?=} desc
 * @return {T}
 * @template T
 */
exports.__decorate = function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    // google3 local modification: use quoted property access to work around
    // https://b.corp.google.com/issues/77140019.
    if (typeof Reflect === "object" && Reflect && typeof Reflect['decorate'] === "function") r = Reflect['decorate'](decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * @param {?} metadataKey
 * @param {?} metadataValue
 * @return {?}
 */
exports.__metadata = function (metadataKey, metadataValue) {
  // google3 local modification: use quoted property access to work around
  // https://b.corp.google.com/issues/77140019.
  if (typeof Reflect === "object" && Reflect && typeof Reflect['metadata'] === "function") return Reflect['metadata'](metadataKey, metadataValue);
};

/**
 * @param {?} paramIndex
 * @param {?} decorator
 * @return {?}
 */
exports.__param = function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); };
};

/**
 * @template T
 * @param {T} thisArg
 * @param {?} _arguments
 * @param {?} P
 * @param {function(this:T)} generator
 * @return {?}
 */
exports.__awaiter = function(thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function(resolve, reject) {
    // LOCAL MODIFICATION: Cannot express the function + keys pattern in
    // closure, so we escape generator.next with ? type.
    function fulfilled(value) {
      try {
        step((/** @type {?} */ (generator)).next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator['throw'](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : new P(function(resolve) {
                                              resolve(result.value);
                                            }).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments)).next());
  });
};

/**
 * @param {?} thisArg
 * @param {?} body
 * @return {?}
 */
exports.__generator = function(thisArg, body) {
  var _ = {
    label: 0,
    sent: function() {
      if (t[0] & 1) throw (/** @type {!Error} */ (t[1]));
      return t[1];
    },
    trys: [],
    ops: []
  },
      f, y, t, g;
  // LOCAL MODIFICATION: Originally iterator body was "return this", but it
  // doesn't compile as this is unknown. Changed to g, which is equivalent.
  return g = {next: verb(0), "throw": verb(1), "return": verb(2)},
         typeof Symbol === "function" && (g[Symbol.iterator] = function() {
           return g;
         }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
        if (f = 1,
            y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) &&
                !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t) op = [0, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return {value: op[1], done: false};
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) &&
                (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5) throw (/** @type {!Error} */ (op[1]));
    return {value: op[0] ? op[1] : void 0, done: true};
  }
};

/**
 * @param {?} m
 * @param {?} e
 */
exports.__exportStar = function (m, e) {
    for (var p in m) if (!e.hasOwnProperty(p)) e[p] = m[p];
};

/**
 * @param {?} o
 * @return {?}
 */
exports.__values = function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};

/**
 * @param {?} o
 * @param {?=} n
 * @return {?}
 */
exports.__read = function(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = {error: error};
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw (/** @type {!Error} */ (e.error));
    }
  }
  return ar;
};

/**
 * @return {!Array}
 */
exports.__spread = function() {
  for (var ar = [], i = 0; i < arguments.length; i++)
    ar = ar.concat(exports.__read(arguments[i]));
  return ar;
};

/**
 * @constructor
 * LOCAL MODIFICATION: Originally used "this" in function body,
 * @this {?}
 * END LOCAL MODIFICATION
 * @param {?} v
 * @return {?}
 */
exports.__await = function(v) {
  return this instanceof exports.__await ? (this.v = v, this) :
                                           new exports.__await(v);
};

/**
 * @template T
 * @param {T} thisArg
 * @param {?} _arguments
 * @param {function(this:T)} generator
 * @return {?}
 */
exports.__asyncGenerator = function __asyncGenerator(
    thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator)
    throw new TypeError('Symbol.asyncIterator is not defined.');
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = {}, verb('next'), verb('throw'), verb('return'),
         i[Symbol.asyncIterator] = function() {
           return (/** @type {?} */ (this));
         }, i;
  function verb(n) {
    if (g[n])
      i[n] = function(v) {
        return new Promise(function(a, b) {
          q.push([n, v, a, b]) > 1 || resume(n, v);
        });
      };
  }
  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }
  function step(r) {
    r.value instanceof exports.__await ?
        Promise.resolve(/** @type {?} */ (r.value).v).then(fulfill, reject) :
        settle(q[0][2], r);
  }
  function fulfill(value) {
    resume('next', value);
  }
  function reject(value) {
    resume('throw', value);
  }
  function settle(f, v) {
    if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
  }
};

/**
 * @param {?} o
 * @return {?}
 */
exports.__asyncDelegator = function(o) {
  var i, p;
  // LOCAL MODIFICATION: Originally iterator body was "return this", but it
  // doesn't compile in some builds, as this is unknown. Changed to i, which is
  // equivalent.
  return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return i; }, i;
  /**
   * @param {?} n
   * @param {?=} f
   * @return {?}
   */
  function verb(n, f) { if (o[n]) i[n] = function (v) { return (p = !p) ? { value: new exports.__await(o[n](v)), done: n === "return" } : f ? f(v) : v; }; }
};

/**
 * @param {?} o
 * @return {?}
 */
exports.__asyncValues = function(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator];
  return m ? m.call(o) : typeof __values === "function" ? __values(o) : o[Symbol.iterator]();
};

/**
 * @param {?=} cooked
 * @param {?=} raw
 * @return {?}
 */
exports.__makeTemplateObject = function(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};


/**
 * @param {?} receiver
 * @param {!WeakMap} privateMap
 * @return {?}
 */
exports.__classPrivateFieldGet = function (receiver, privateMap) {
  if (!privateMap.has(receiver)) {
      throw new TypeError("attempted to get private field on non-instance");
  }
  return privateMap.get(receiver);
};

/**
 * @param {?} receiver
 * @param {!WeakMap} privateMap
 * @param {?} value
 * @return {?}
 */
exports.__classPrivateFieldSet = function (receiver, privateMap, value) {
  if (!privateMap.has(receiver)) {
      throw new TypeError("attempted to set private field on non-instance");
  }
  privateMap.set(receiver, value);
  return value;
};

;return exports;});

//third_party/mediapipe/web/solutions/solutions_api.closure.js
goog.loadModule(function(exports) {'use strict';/**
 * @fileoverview added by tsickle
 * Generated from: third_party/mediapipe/web/solutions/solutions_api.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('google3.third_party.mediapipe.web.solutions.solutions_api');
var module = module || { id: 'third_party/mediapipe/web/solutions/solutions_api.closure.js' };
const tslib_1 = goog.require('google3.third_party.javascript.tslib.tslib');
const tsickle_solutions_wasm_1 = goog.requireType("google3.third_party.mediapipe.web.solutions.solutions_wasm");
/**
 * Required data to process turn the input frame into a packet.
 * @typedef {!tsickle_solutions_wasm_1.FrameMetadataWasm}
 */
exports.FrameMetadata;
/**
 * Represents a normalized rectangle that can be passed to a StreamListener.
 * @typedef {!tsickle_solutions_wasm_1.NormalizedRect}
 */
exports.NormalizedRect;
/**
 * Represents a detected landmark.
 * @typedef {!tsickle_solutions_wasm_1.NormalizedLandmark}
 */
exports.NormalizedLandmark;
/**
 * Represents a list of landmarks.
 * @typedef {!tsickle_solutions_wasm_1.ReadOnlySimpleVector<!tsickle_solutions_wasm_1.NormalizedLandmark>}
 */
exports.NormalizedLandmarkList;
/**
 * Represents one of the possible results that can be passed to the listener.
 * TODO(mhays): Surface a typename so that someone who is coming at solutions
 * API directly can figure our which type they are looking at.
 * @typedef {(undefined|number|!tsickle_solutions_wasm_1.NormalizedRect|!tsickle_solutions_wasm_1.ReadOnlySimpleVector<!tsickle_solutions_wasm_1.NormalizedLandmark>)}
 */
exports.RecognizedResult;
/**
 * Represents a single result of a multi result listener.
 * @record
 */
function ResultMap() { }
exports.ResultMap = ResultMap;
/**
 * This represents the callbacks from the graph's stream listeners.
 * @typedef {function(!ResultMap): void}
 */
exports.ResultMapListener;
/**
 * Option descriptions that describe where to change an option in a graph.
 * @typedef {!tsickle_solutions_wasm_1.GraphOptionXRef}
 */
exports.GraphOptionXRef;
/**
 * If your files are organized in some weird structure, you can customize how
 * the path is constructed by sending this to the config options for Solution.
 * @typedef {function(string, string): string}
 */
exports.FileLocatorFn;
/**
 * During configuration, the user can specify streams and callbacks to be
 * attached to the graph. These will get reregistered on the user's behalf if
 * the graph gets reset.
 * @typedef {function(!Array<string>, function(!ResultMap): void): void}
 */
exports.AttachListenerFn;
/**
 * Users of the solution set options using a key-value map. However, specific
 * solutions will constrain the options with an exported interface.
 *
 * e.g.
 *
 * generalSolution.setOptions({"myKey": myValue}) becomes
 * specificSolution.setOptions({ myKey: myValue }}
 *
 * declare interface SpecificSolutionOptionList {
 *   myKey: number
 * };
 *
 * This works because `Object`s in JavaScript are just hashmaps, and we fit
 * meaning on top of those hashmaps with our type declarations.
 * @record
 */
function OptionList() { }
exports.OptionList = OptionList;
/**
 * Used in the constructor of Graph.
 * @record
 */
function Graph() { }
exports.Graph = Graph;
/* istanbul ignore if */
if (false) {
    /** @type {string} */
    Graph.prototype.url;
}
/** @enum {number} */
const OptionType = {
    NUMBER: 0,
};
exports.OptionType = OptionType;
OptionType[OptionType.NUMBER] = 'NUMBER';
/**
 * Used to register keys with the solution. Right now it is limited to
 * graphOptionXref, which is specifically for options that will be fed to the
 * MediaPipe graph, but we'll also need options that are handled by the specific
 * solution to do work (e.g., selfie-flipping).
 * @record
 */
function OptionConfig() { }
exports.OptionConfig = OptionConfig;
/* istanbul ignore if */
if (false) {
    /** @type {!OptionType} */
    OptionConfig.prototype.type;
    /** @type {(undefined|!tsickle_solutions_wasm_1.GraphOptionXRef)} */
    OptionConfig.prototype.graphOptionXref;
}
/**
 * The collection of option configuration entries, arranged by option name.
 * @record
 */
function OptionConfigMap() { }
exports.OptionConfigMap = OptionConfigMap;
/**
 * Options to configure the solution.
 * @record
 */
function SolutionConfig() { }
exports.SolutionConfig = SolutionConfig;
/* istanbul ignore if */
if (false) {
    /**
     * The pack loader and the wasm loader need to be here. A file loader will be
     * provided to them, and They will get loaded asynchronously. We won't
     * continue initialization until they've completely loaded and run.
     * @type {!Array<string>}
     */
    SolutionConfig.prototype.files;
    /**
     * The binary graph. Can support multiple ways of getting that graph.
     * @type {!Graph}
     */
    SolutionConfig.prototype.graph;
    /**
     * See FileLocatorFn. Any file loading done on the user's behalf will use
     * locateFile if its profived. This includes WASM blobs and graph urls.
     * @type {(undefined|function(string, string): string)}
     */
    SolutionConfig.prototype.locateFile;
    /**
     * Specifies how to interpret options fed to setOptions.
     * @type {(undefined|!OptionConfigMap)}
     */
    SolutionConfig.prototype.options;
    /**
     * Whenever the graph is reset, this callback will be invoked. It is here that
     * you can attach listeners to the graph.
     * @type {(undefined|function(function(!Array<string>, function(!ResultMap): void): void): void)}
     */
    SolutionConfig.prototype.onRegisterListeners;
}
/**
 * Represents a graph that can be fed to mediapipe Solution.
 * @record
 */
function GraphData() { }
exports.GraphData = GraphData;
/* istanbul ignore if */
if (false) {
    /**
     * @return {!Promise<!ArrayBuffer>}
     */
    GraphData.prototype.toArrayBuffer = function () { };
}
// These export names come from wasm_cc_binary BUILD rules. They belong to two
// different scripts that are loaded in parallel (see Promise.all, below).
// Because they mutate their respective variables, there is a race condition
// where they will stomp on each other if they choose the same name. Users
// won't normally see this race condition because they put script tags in the
// HTML, and HTML guarantees that the scripts will be run in order.
/** @type {string} */
const API_EXPORT_NAME = 'createMediapipeSolutionsWasm';
/** @type {string} */
const PACK_EXPORT_NAME = 'createMediapipeSolutionsPackedAssets';
/**
 * Extracts the result from a collection of results.
 * @param {!tsickle_solutions_wasm_1.ResultWasm} result
 * @return {(undefined|number|!tsickle_solutions_wasm_1.NormalizedRect|!tsickle_solutions_wasm_1.ReadOnlySimpleVector<!tsickle_solutions_wasm_1.NormalizedLandmark>)}
 */
function extractWasmResult(result) {
    if (result.isNumber()) {
        return result.getNumber();
    }
    if (result.isRect()) {
        return result.getRect();
    }
    if (result.isLandmarks()) {
        return result.getLandmarks();
    }
    return undefined;
}
/**
 * Returns the default path to a resource if the user did not overload the
 * locateFile parameter in SolutionConfig.
 * @param {string} file
 * @param {string} prefix
 * @return {string}
 */
function defaultLocateFile(file, prefix) {
    return prefix + file;
}
/**
 * Sets an arbitrary value on `window`. This is a typing wrapper to prevent
 * errors for using `window` improperly.
 * @template T
 * @param {string} key
 * @param {T} value
 * @return {void}
 */
function setWindow(key, value) {
    ((/** @type {!Object<string,T>} */ ((/** @type {*} */ (window)))))[key] = value;
}
/**
 * Gets an arbitrary value from `window`. This is a typing wrapper to prevent
 * errors for using `window` improperly.
 * @param {string} key
 * @return {*}
 */
function getWindow(key) {
    return ((/** @type {!Object<string,*>} */ ((/** @type {*} */ (window)))))[key];
}
/**
 * Dynamically loads a ascript into the current page and returns a `Promise`
 * that resolves when its loading is complete.
 * @param {string} url
 * @return {!Promise<void>}
 */
function loadScript(url) {
    /** @type {!HTMLScriptElement} */
    const script = document.createElement('script');
    script.setAttribute('src', url);
    script.setAttribute('crossorigin', 'anonymous');
    document.body.appendChild(script);
    return new Promise((/**
     * @param {function((undefined|void|!PromiseLike<void>)=): void} resolve
     * @return {void}
     */
    (resolve) => {
        script.addEventListener('load', (/**
         * @return {void}
         */
        () => {
            resolve();
        }), false);
    }));
}
/**
 * @return {string}
 */
function getPackagePath() {
    if (typeof window === 'object') {
        return window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) +
            '/';
    }
    else if (typeof location !== 'undefined') {
        // worker
        return location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) +
            '/';
    }
    else {
        throw new Error('solutions can only be loaded on a web page or in a web worker');
    }
}
class GraphDataImpl {
    /**
     * @param {!Graph} graph
     * @param {function(string, string): string} locateFile
     * @param {string} packagePath
     */
    constructor(graph, locateFile, packagePath) {
        this.graph = graph;
        this.locateFile = locateFile;
        this.packagePath = packagePath;
    }
    /**
     * @return {!Promise<!ArrayBuffer>}
     */
    toArrayBuffer() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.graph.url) {
                /** @type {!Response} */
                const fetched = yield fetch(this.locateFile(this.graph.url, this.packagePath));
                if (fetched.body) {
                    return fetched.arrayBuffer();
                }
            }
            return new ArrayBuffer(0);
        });
    }
}
/* istanbul ignore if */
if (false) {
    /**
     * @type {!Graph}
     * @private
     */
    GraphDataImpl.prototype.graph;
    /**
     * @type {function(string, string): string}
     * @private
     */
    GraphDataImpl.prototype.locateFile;
    /**
     * @type {string}
     * @private
     */
    GraphDataImpl.prototype.packagePath;
}
/**
 * Inputs to the graph. Currently only one input, a video frame, is
 * permitted, but this should encompass any input data to a solution.
 * @record
 */
function FrameInputs() { }
exports.FrameInputs = FrameInputs;
/* istanbul ignore if */
if (false) {
    /** @type {!HTMLVideoElement} */
    FrameInputs.prototype.video;
}
/**
 * MediaPipe Solution upon which all specific solutions will be built.
 */
class Solution {
    /**
     * @param {!SolutionConfig} config
     */
    constructor(config) {
        this.config = config;
        this.needToInitializeWasm = true;
        this.needToInitializeGraph = true;
        this.locateFile = (config && config.locateFile) || defaultLocateFile;
        this.packagePath = getPackagePath();
    }
    /**
     * @return {!Promise<void>}
     */
    close() {
        if (this.solutionWasm) {
            this.solutionWasm.delete();
        }
        return Promise.resolve();
    }
    /**
     * Loads all of the dependent WASM files. This is heavy, so we make sure to
     * only do this once.
     * @private
     * @return {!Promise<void>}
     */
    tryToInitializeWasm() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.needToInitializeWasm) {
                return;
            }
            // Set up the file loader for both external loaders.
            setWindow(API_EXPORT_NAME, { locateFile: this.locateFile });
            setWindow(PACK_EXPORT_NAME, { locateFile: this.locateFile });
            /** @type {!Array<string>} */
            const files = (this.config.files) || [];
            yield Promise.all(files.map((/**
             * @param {string} x
             * @return {!Promise<void>}
             */
            x => loadScript(this.locateFile(x, this.packagePath)))));
            // The variables we set earlier will not be mutated, each according to its
            // related loader.
            /** @type {function(!tsickle_solutions_wasm_1.PackLoader): !Promise<!tsickle_solutions_wasm_1.MediapipeWasm>} */
            const apiFn = (/** @type {function(!tsickle_solutions_wasm_1.PackLoader): !Promise<!tsickle_solutions_wasm_1.MediapipeWasm>} */ (getWindow(API_EXPORT_NAME)));
            /** @type {!tsickle_solutions_wasm_1.PackLoader} */
            const packFn = (/** @type {!tsickle_solutions_wasm_1.PackLoader} */ (getWindow(PACK_EXPORT_NAME)));
            // Now that everything is loaded and mutated, we can finally initialize
            // the WASM loader with the pack loader. The WASM loader will wait until
            // all of the files in the pack loader are complete before resolving its
            // Promise.
            this.wasm = yield apiFn(packFn);
            // TODO(mhays): Developer should be able to explicitly load/unload a
            // solution to prevent stealing all of the WebGL resources (e.g., Chrome
            // may limit the number of WebGL contexts by domain).
            this.glCanvas = document.createElement('canvas');
            this.wasm.canvas = this.glCanvas;
            this.wasm.createContext(this.glCanvas, /* useWebGl= */ true, 
            /* setInModule= */ true, {});
            // The graph only needs to be loaded once into the solution, but the WASM
            // might re-initialize the solution, and that will specifically happen
            // during wasm.ProcessFrame.
            this.solutionWasm = new this.wasm.SolutionWasm();
            /** @type {!GraphDataImpl} */
            const graphData = new GraphDataImpl(this.config.graph, this.locateFile, this.packagePath);
            yield this.loadGraph(graphData);
            this.needToInitializeWasm = false;
        });
    }
    /**
     * Sets the options for the graph, potentially triggering a reinitialize.
     * The triggering is contingent upon the options matching those set up in
     * the solution configuration. If a match is found, initialize is set to run
     * on the next processFrame.
     *
     * We do not create a WASM object here, because it's possible (likely) that
     * WASM has not loaded yet (i.e., the user calls setOptions before calling
     * processFrame / initialize).  We'll do that during initialize when we know
     * it's safe.
     * @param {!OptionList} options
     * @return {void}
     */
    setOptions(options) {
        if (!this.config.options) {
            return;
        }
        /** @type {!Array<!tsickle_solutions_wasm_1.GraphOptionChangeRequest>} */
        const pendingChanges = [];
        for (const option of Object.keys(options)) {
            // Look each option in the option config.
            /** @type {!OptionConfig} */
            const optionConfig = this.config.options[option];
            if (optionConfig) {
                if (optionConfig.graphOptionXref) {
                    /** @type {{valueNumber: (undefined|number)}} */
                    const optionValue = {
                        valueNumber: optionConfig.type === OptionType.NUMBER ?
                            (/** @type {number} */ (options[option])) :
                            undefined
                    };
                    // Combine the xref with the value. This is what the WASM will be
                    // expecting.
                    /** @type {*} */
                    const request = Object.assign(Object.assign({}, optionConfig.graphOptionXref), optionValue);
                    pendingChanges.push(request);
                }
            }
        }
        if (pendingChanges.length !== 0) {
            this.needToInitializeGraph = true;
            this.pendingChanges = pendingChanges;
        }
    }
    /**
     * Initializes the graph is it has not been loaded, or has been triggered to
     * reload (setOptions was called while the graph was running).
     * @private
     * @return {!Promise<void>}
     */
    tryToInitializeGraph() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.needToInitializeGraph) {
                return;
            }
            this.solutionWasm.bindTextureToCanvas();
            // Move the video frame into the texture.
            /** @type {(null|!WebGL2RenderingContext)} */
            const gl = this.glCanvas.getContext('webgl2');
            if (!gl) {
                alert('Failed to create WebGL canvas context when passing video frame.');
                return;
            }
            this.gl = gl;
            // Changing options on the graph will mutate the graph config.
            if (this.pendingChanges) {
                /** @type {!tsickle_solutions_wasm_1.GraphOptionChangeRequestList} */
                const changeList = new this.wasm.GraphOptionChangeRequestList();
                for (const change of this.pendingChanges) {
                    changeList.push_back(change);
                }
                this.solutionWasm.changeOptions(changeList);
                changeList.delete();
                this.pendingChanges = undefined;
            }
            if (this.config.onRegisterListeners) {
                this.config.onRegisterListeners(this.attachListener.bind(this));
            }
            this.needToInitializeGraph = false;
        });
    }
    /**
     * @return {!Promise<void>}
     */
    initialize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.tryToInitializeWasm();
            yield this.tryToInitializeGraph();
        });
    }
    /**
     * @param {!GraphData} graph
     * @return {!Promise<void>}
     */
    loadGraph(graph) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            /** @type {!ArrayBuffer} */
            const graphData = yield graph.toArrayBuffer();
            this.solutionWasm.loadGraph(graphData);
        });
    }
    /**
     * TODO(mhays): frame inputs will be an array of {name, packet}.
     * @param {string} inputStreamName
     * @param {!tsickle_solutions_wasm_1.FrameMetadataWasm} metadata
     * @param {!FrameInputs} inputs
     * @return {!Promise<void>}
     */
    processFrame(inputStreamName, metadata, inputs) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.initialize();
            /** @type {!WebGL2RenderingContext} */
            const gl = this.gl;
            this.solutionWasm.bindTextureToCanvas();
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, inputs.video);
            this.solutionWasm.processFrame(inputStreamName, {
                width: inputs.video.videoWidth,
                height: inputs.video.videoHeight,
                timestampMs: performance.now()
            });
        });
    }
    /**
     * Attaches a listener that will be called when the graph produces
     * compatible packets on the named stream.
     * @private
     * @param {!Array<string>} wants
     * @param {function(!ResultMap): void} listener
     * @return {void}
     */
    attachListener(wants, listener) {
        /** @type {!Array<string>} */
        const wantsCopy = [...wants];
        /** @type {!tsickle_solutions_wasm_1.SimpleVector<string>} */
        const wantsVector = new this.wasm.StringList();
        for (const want of wants) {
            wantsVector.push_back(want);
        }
        /** @type {{onResults: function(!tsickle_solutions_wasm_1.ReadOnlySimpleVector<!tsickle_solutions_wasm_1.ResultWasm>): void}} */
        const wasmListener = {
            onResults: (/**
             * @param {!tsickle_solutions_wasm_1.ReadOnlySimpleVector<!tsickle_solutions_wasm_1.ResultWasm>} values
             * @return {void}
             */
            (values) => {
                /** @type {!ResultMap} */
                const results = {};
                for (let index = 0; index < wants.length; ++index) {
                    results[wantsCopy[index]] = extractWasmResult(values.get(index));
                }
                listener(results);
            })
        };
        /** @type {!tsickle_solutions_wasm_1.PacketListener} */
        const packetListener = this.wasm.PacketListener.implement(wasmListener);
        this.solutionWasm.attachMultiListener(wantsVector, packetListener);
        wantsVector.delete();
    }
}
exports.Solution = Solution;
/* istanbul ignore if */
if (false) {
    /**
     * @type {string}
     * @private
     */
    Solution.prototype.packagePath;
    /**
     * @type {function(string, string): string}
     * @private
     */
    Solution.prototype.locateFile;
    /**
     * @type {!HTMLCanvasElement}
     * @private
     */
    Solution.prototype.glCanvas;
    /**
     * @type {!WebGL2RenderingContext}
     * @private
     */
    Solution.prototype.gl;
    /**
     * @type {!tsickle_solutions_wasm_1.MediapipeWasm}
     * @private
     */
    Solution.prototype.wasm;
    /**
     * @type {!tsickle_solutions_wasm_1.SolutionWasm}
     * @private
     */
    Solution.prototype.solutionWasm;
    /**
     * @type {(undefined|!Array<!tsickle_solutions_wasm_1.GraphOptionChangeRequest>)}
     * @private
     */
    Solution.prototype.pendingChanges;
    /**
     * @type {boolean}
     * @private
     */
    Solution.prototype.needToInitializeWasm;
    /**
     * @type {boolean}
     * @private
     */
    Solution.prototype.needToInitializeGraph;
    /**
     * @type {!SolutionConfig}
     * @private
     */
    Solution.prototype.config;
}
goog.exportSymbol('Solution', Solution);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29sdXRpb25zX2FwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3RoaXJkX3BhcnR5L21lZGlhcGlwZS93ZWIvc29sdXRpb25zL3NvbHV0aW9uc19hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUtBLHNCQUE0RDs7Ozs7QUFLNUQsdUJBQTBEOzs7OztBQUsxRCwyQkFBa0U7Ozs7O0FBS2xFLCtCQUEwRTs7Ozs7OztBQU8xRSx5QkFDMkQ7Ozs7O0FBSzNELHdCQUVDOzs7Ozs7QUFLRCwwQkFBeUQ7Ozs7O0FBS3pELHdCQUE0RDs7Ozs7O0FBTTVELHNCQUFxRTs7Ozs7OztBQVFyRSx5QkFDc0U7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCdEUseUJBRUM7Ozs7OztBQUtELG9CQUVDOzs7OztJQURDLG9CQUFZOzs7QUFRZCxNQUFZLFVBQVU7SUFDcEIsTUFBTSxHQUFBO0VBQ1A7Ozs7Ozs7Ozs7QUFRRCwyQkFHQzs7Ozs7SUFGQyw0QkFBaUI7O0lBQ2pCLHVDQUFrQzs7Ozs7O0FBTXBDLDhCQUVDOzs7Ozs7QUFLRCw2QkE2QkM7Ozs7Ozs7Ozs7SUF2QkMsK0JBQWdCOzs7OztJQUtoQiwrQkFBYTs7Ozs7O0lBTWIsb0NBQTJCOzs7OztJQUszQixpQ0FBMEI7Ozs7OztJQU0xQiw2Q0FBMkQ7Ozs7OztBQU03RCx3QkFFQzs7Ozs7OztJQURDLG9EQUFzQzs7Ozs7Ozs7O01BU2xDLGVBQWUsR0FBRyw4QkFBOEI7O01BQ2hELGdCQUFnQixHQUFHLHNDQUFzQzs7Ozs7O0FBSy9ELFNBQVMsaUJBQWlCLENBQUMsTUFBZ0M7SUFDekQsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUU7UUFDckIsT0FBTyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7S0FDM0I7SUFDRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRTtRQUNuQixPQUFPLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN6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QUM7UUFDdkUsSUFBSSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDbkUsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3ZCLENBQUM7Q0FDRjtBQTNNRCw0QkEyTUM7Ozs7Ozs7SUExTUMsK0JBQXFDOzs7OztJQUNyQyw4QkFBMkM7Ozs7O0lBRzNDLDRCQUFxQzs7Ozs7SUFDckMsc0JBQW9DOzs7OztJQUNwQyx3QkFBMkM7Ozs7O0lBQzNDLGdDQUFrRDs7Ozs7SUFHbEQsa0NBQWtFOzs7OztJQUVsRSx3Q0FBb0M7Ozs7O0lBQ3BDLHlDQUFxQzs7Ozs7SUFFekIsMEJBQXVDOztBQTZMckQsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzb2x1dGlvbnNXYXNtIGZyb20gJy4vc29sdXRpb25zX3dhc20nO1xuXG4vKipcbiAqIFJlcXVpcmVkIGRhdGEgdG8gcHJvY2VzcyB0dXJuIHRoZSBpbnB1dCBmcmFtZSBpbnRvIGEgcGFja2V0LlxuICovXG5leHBvcnQgdHlwZSBGcmFtZU1ldGFkYXRhID0gc29sdXRpb25zV2FzbS5GcmFtZU1ldGFkYXRhV2FzbTtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgbm9ybWFsaXplZCByZWN0YW5nbGUgdGhhdCBjYW4gYmUgcGFzc2VkIHRvIGEgU3RyZWFtTGlzdGVuZXIuXG4gKi9cbmV4cG9ydCB0eXBlIE5vcm1hbGl6ZWRSZWN0ID0gc29sdXRpb25zV2FzbS5Ob3JtYWxpemVkUmVjdDtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgZGV0ZWN0ZWQgbGFuZG1hcmsuXG4gKi9cbmV4cG9ydCB0eXBlIE5vcm1hbGl6ZWRMYW5kbWFyayA9IHNvbHV0aW9uc1dhc20uTm9ybWFsaXplZExhbmRtYXJrO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBsaXN0IG9mIGxhbmRtYXJrcy5cbiAqL1xuZXhwb3J0IHR5cGUgTm9ybWFsaXplZExhbmRtYXJrTGlzdCA9IHNvbHV0aW9uc1dhc20uTm9ybWFsaXplZExhbmRtYXJrTGlzdDtcblxuLyoqXG4gKiBSZXByZXNlbnRzIG9uZSBvZiB0aGUgcG9zc2libGUgcmVzdWx0cyB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gdGhlIGxpc3RlbmVyLlxuICogVE9ETyhtaGF5cyk6IFN1cmZhY2UgYSB0eXBlbmFtZSBzbyB0aGF0IHNvbWVvbmUgd2hvIGlzIGNvbWluZyBhdCBzb2x1dGlvbnNcbiAqIEFQSSBkaXJlY3RseSBjYW4gZmlndXJlIG91ciB3aGljaCB0eXBlIHRoZXkgYXJlIGxvb2tpbmcgYXQuXG4gKi9cbmV4cG9ydCB0eXBlIFJlY29nbml6ZWRSZXN1bHQgPVxuICAgIE5vcm1hbGl6ZWRMYW5kbWFya0xpc3R8Tm9ybWFsaXplZFJlY3R8bnVtYmVyfHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgc2luZ2xlIHJlc3VsdCBvZiBhIG11bHRpIHJlc3VsdCBsaXN0ZW5lci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXN1bHRNYXAge1xuICBba2V5OiBzdHJpbmddOiBSZWNvZ25pemVkUmVzdWx0O1xufVxuXG4vKipcbiAqIFRoaXMgcmVwcmVzZW50cyB0aGUgY2FsbGJhY2tzIGZyb20gdGhlIGdyYXBoJ3Mgc3RyZWFtIGxpc3RlbmVycy5cbiAqL1xuZXhwb3J0IHR5cGUgUmVzdWx0TWFwTGlzdGVuZXIgPSAobWFwOiBSZXN1bHRNYXApID0+IHZvaWQ7XG5cbi8qKlxuICogT3B0aW9uIGRlc2NyaXB0aW9ucyB0aGF0IGRlc2NyaWJlIHdoZXJlIHRvIGNoYW5nZSBhbiBvcHRpb24gaW4gYSBncmFwaC5cbiAqL1xuZXhwb3J0IHR5cGUgR3JhcGhPcHRpb25YUmVmID0gc29sdXRpb25zV2FzbS5HcmFwaE9wdGlvblhSZWY7XG5cbi8qKlxuICogSWYgeW91ciBmaWxlcyBhcmUgb3JnYW5pemVkIGluIHNvbWUgd2VpcmQgc3RydWN0dXJlLCB5b3UgY2FuIGN1c3RvbWl6ZSBob3dcbiAqIHRoZSBwYXRoIGlzIGNvbnN0cnVjdGVkIGJ5IHNlbmRpbmcgdGhpcyB0byB0aGUgY29uZmlnIG9wdGlvbnMgZm9yIFNvbHV0aW9uLlxuICovXG5leHBvcnQgdHlwZSBGaWxlTG9jYXRvckZuID0gKGZpbGU6IHN0cmluZywgcHJlZml4OiBzdHJpbmcpID0+IHN0cmluZztcblxuXG4vKipcbiAqIER1cmluZyBjb25maWd1cmF0aW9uLCB0aGUgdXNlciBjYW4gc3BlY2lmeSBzdHJlYW1zIGFuZCBjYWxsYmFja3MgdG8gYmVcbiAqIGF0dGFjaGVkIHRvIHRoZSBncmFwaC4gVGhlc2Ugd2lsbCBnZXQgcmVyZWdpc3RlcmVkIG9uIHRoZSB1c2VyJ3MgYmVoYWxmIGlmXG4gKiB0aGUgZ3JhcGggZ2V0cyByZXNldC5cbiAqL1xuZXhwb3J0IHR5cGUgQXR0YWNoTGlzdGVuZXJGbiA9XG4gICAgKHdhbnRzOiBzdHJpbmdbXSwgbGlzdGVuZXI6IChyZXN1bHRzOiBSZXN1bHRNYXApID0+IHZvaWQpID0+IHZvaWQ7XG5cbi8qKlxuICogVXNlcnMgb2YgdGhlIHNvbHV0aW9uIHNldCBvcHRpb25zIHVzaW5nIGEga2V5LXZhbHVlIG1hcC4gSG93ZXZlciwgc3BlY2lmaWNcbiAqIHNvbHV0aW9ucyB3aWxsIGNvbnN0cmFpbiB0aGUgb3B0aW9ucyB3aXRoIGFuIGV4cG9ydGVkIGludGVyZmFjZS5cbiAqXG4gKiBlLmcuXG4gKlxuICogZ2VuZXJhbFNvbHV0aW9uLnNldE9wdGlvbnMoe1wibXlLZXlcIjogbXlWYWx1ZX0pIGJlY29tZXNcbiAqIHNwZWNpZmljU29sdXRpb24uc2V0T3B0aW9ucyh7IG15S2V5OiBteVZhbHVlIH19XG4gKlxuICogZGVjbGFyZSBpbnRlcmZhY2UgU3BlY2lmaWNTb2x1dGlvbk9wdGlvbkxpc3Qge1xuICogICBteUtleTogbnVtYmVyXG4gKiB9O1xuICpcbiAqIFRoaXMgd29ya3MgYmVjYXVzZSBgT2JqZWN0YHMgaW4gSmF2YVNjcmlwdCBhcmUganVzdCBoYXNobWFwcywgYW5kIHdlIGZpdFxuICogbWVhbmluZyBvbiB0b3Agb2YgdGhvc2UgaGFzaG1hcHMgd2l0aCBvdXIgdHlwZSBkZWNsYXJhdGlvbnMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9uTGlzdCB7XG4gIFtrZXk6IHN0cmluZ106IHVua25vd247XG59XG5cbi8qKlxuICogVXNlZCBpbiB0aGUgY29uc3RydWN0b3Igb2YgR3JhcGguXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR3JhcGgge1xuICB1cmw6IHN0cmluZztcbn1cblxuLyoqXG4gKiBEZXNjcmliZXMgaG93IHRvIGludGVycHJldCBPcHRpb25Db25maWcuIEBzZWUgR3JhcGhPcHRpb25DaGFuZ2VSZXF1ZXN0LlxuICogZS5nLiwgQSBOVU1CRVIgdGVsbHMgdXMgdG8gZmlsbCBvdXQgdmFsdWVOdW1iZXIgKHdoaWNoIGdldHMgaW50ZXJwcmV0ZWQgYXNcbiAqIGEgZG91YmxlIG9uIHRoZSBDKysgc2lkZSkuIFdlIHdpbGwgYWRkIG90aGVyIHR5cGVzIGhlcmUgYXMgdGhlIG5lZWQgYXJpc2VzLlxuICovXG5leHBvcnQgZW51bSBPcHRpb25UeXBlIHtcbiAgTlVNQkVSLFxufVxuXG4vKipcbiAqIFVzZWQgdG8gcmVnaXN0ZXIga2V5cyB3aXRoIHRoZSBzb2x1dGlvbi4gUmlnaHQgbm93IGl0IGlzIGxpbWl0ZWQgdG9cbiAqIGdyYXBoT3B0aW9uWHJlZiwgd2hpY2ggaXMgc3BlY2lmaWNhbGx5IGZvciBvcHRpb25zIHRoYXQgd2lsbCBiZSBmZWQgdG8gdGhlXG4gKiBNZWRpYVBpcGUgZ3JhcGgsIGJ1dCB3ZSdsbCBhbHNvIG5lZWQgb3B0aW9ucyB0aGF0IGFyZSBoYW5kbGVkIGJ5IHRoZSBzcGVjaWZpY1xuICogc29sdXRpb24gdG8gZG8gd29yayAoZS5nLiwgc2VsZmllLWZsaXBwaW5nKS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBPcHRpb25Db25maWcge1xuICB0eXBlOiBPcHRpb25UeXBlO1xuICBncmFwaE9wdGlvblhyZWY/OiBHcmFwaE9wdGlvblhSZWY7XG59XG5cbi8qKlxuICogVGhlIGNvbGxlY3Rpb24gb2Ygb3B0aW9uIGNvbmZpZ3VyYXRpb24gZW50cmllcywgYXJyYW5nZWQgYnkgb3B0aW9uIG5hbWUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9uQ29uZmlnTWFwIHtcbiAgW29wdGlvbk5hbWU6IHN0cmluZ106IE9wdGlvbkNvbmZpZztcbn1cblxuLyoqXG4gKiBPcHRpb25zIHRvIGNvbmZpZ3VyZSB0aGUgc29sdXRpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU29sdXRpb25Db25maWcge1xuICAvKipcbiAgICogVGhlIHBhY2sgbG9hZGVyIGFuZCB0aGUgd2FzbSBsb2FkZXIgbmVlZCB0byBiZSBoZXJlLiBBIGZpbGUgbG9hZGVyIHdpbGwgYmVcbiAgICogcHJvdmlkZWQgdG8gdGhlbSwgYW5kIFRoZXkgd2lsbCBnZXQgbG9hZGVkIGFzeW5jaHJvbm91c2x5LiBXZSB3b24ndFxuICAgKiBjb250aW51ZSBpbml0aWFsaXphdGlvbiB1bnRpbCB0aGV5J3ZlIGNvbXBsZXRlbHkgbG9hZGVkIGFuZCBydW4uXG4gICAqL1xuICBmaWxlczogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIFRoZSBiaW5hcnkgZ3JhcGguIENhbiBzdXBwb3J0IG11bHRpcGxlIHdheXMgb2YgZ2V0dGluZyB0aGF0IGdyYXBoLlxuICAgKi9cbiAgZ3JhcGg6IEdyYXBoO1xuXG4gIC8qKlxuICAgKiBTZWUgRmlsZUxvY2F0b3JGbi4gQW55IGZpbGUgbG9hZGluZyBkb25lIG9uIHRoZSB1c2VyJ3MgYmVoYWxmIHdpbGwgdXNlXG4gICAqIGxvY2F0ZUZpbGUgaWYgaXRzIHByb2ZpdmVkLiBUaGlzIGluY2x1ZGVzIFdBU00gYmxvYnMgYW5kIGdyYXBoIHVybHMuXG4gICAqL1xuICBsb2NhdGVGaWxlPzogRmlsZUxvY2F0b3JGbjtcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGhvdyB0byBpbnRlcnByZXQgb3B0aW9ucyBmZWQgdG8gc2V0T3B0aW9ucy5cbiAgICovXG4gIG9wdGlvbnM/OiBPcHRpb25Db25maWdNYXA7XG5cbiAgLyoqXG4gICAqIFdoZW5ldmVyIHRoZSBncmFwaCBpcyByZXNldCwgdGhpcyBjYWxsYmFjayB3aWxsIGJlIGludm9rZWQuIEl0IGlzIGhlcmUgdGhhdFxuICAgKiB5b3UgY2FuIGF0dGFjaCBsaXN0ZW5lcnMgdG8gdGhlIGdyYXBoLlxuICAgKi9cbiAgb25SZWdpc3Rlckxpc3RlbmVycz86IChhdHRhY2hGbjogQXR0YWNoTGlzdGVuZXJGbikgPT4gdm9pZDtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgZ3JhcGggdGhhdCBjYW4gYmUgZmVkIHRvIG1lZGlhcGlwZSBTb2x1dGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBHcmFwaERhdGEge1xuICB0b0FycmF5QnVmZmVyKCk6IFByb21pc2U8QXJyYXlCdWZmZXI+O1xufVxuXG4vLyBUaGVzZSBleHBvcnQgbmFtZXMgY29tZSBmcm9tIHdhc21fY2NfYmluYXJ5IEJVSUxEIHJ1bGVzLiBUaGV5IGJlbG9uZyB0byB0d29cbi8vIGRpZmZlcmVudCBzY3JpcHRzIHRoYXQgYXJlIGxvYWRlZCBpbiBwYXJhbGxlbCAoc2VlIFByb21pc2UuYWxsLCBiZWxvdykuXG4vLyBCZWNhdXNlIHRoZXkgbXV0YXRlIHRoZWlyIHJlc3BlY3RpdmUgdmFyaWFibGVzLCB0aGVyZSBpcyBhIHJhY2UgY29uZGl0aW9uXG4vLyB3aGVyZSB0aGV5IHdpbGwgc3RvbXAgb24gZWFjaCBvdGhlciBpZiB0aGV5IGNob29zZSB0aGUgc2FtZSBuYW1lLiBVc2Vyc1xuLy8gd29uJ3Qgbm9ybWFsbHkgc2VlIHRoaXMgcmFjZSBjb25kaXRpb24gYmVjYXVzZSB0aGV5IHB1dCBzY3JpcHQgdGFncyBpbiB0aGVcbi8vIEhUTUwsIGFuZCBIVE1MIGd1YXJhbnRlZXMgdGhhdCB0aGUgc2NyaXB0cyB3aWxsIGJlIHJ1biBpbiBvcmRlci5cbmNvbnN0IEFQSV9FWFBPUlRfTkFNRSA9ICdjcmVhdGVNZWRpYXBpcGVTb2x1dGlvbnNXYXNtJztcbmNvbnN0IFBBQ0tfRVhQT1JUX05BTUUgPSAnY3JlYXRlTWVkaWFwaXBlU29sdXRpb25zUGFja2VkQXNzZXRzJztcblxuLyoqXG4gKiBFeHRyYWN0cyB0aGUgcmVzdWx0IGZyb20gYSBjb2xsZWN0aW9uIG9mIHJlc3VsdHMuXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3RXYXNtUmVzdWx0KHJlc3VsdDogc29sdXRpb25zV2FzbS5SZXN1bHRXYXNtKTogUmVjb2duaXplZFJlc3VsdCB7XG4gIGlmIChyZXN1bHQuaXNOdW1iZXIoKSkge1xuICAgIHJldHVybiByZXN1bHQuZ2V0TnVtYmVyKCk7XG4gIH1cbiAgaWYgKHJlc3VsdC5pc1JlY3QoKSkge1xuICAgIHJldHVybiByZXN1bHQuZ2V0UmVjdCgpO1xuICB9XG4gIGlmIChyZXN1bHQuaXNMYW5kbWFya3MoKSkge1xuICAgIHJldHVybiByZXN1bHQuZ2V0TGFuZG1hcmtzKCk7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkZWZhdWx0IHBhdGggdG8gYSByZXNvdXJjZSBpZiB0aGUgdXNlciBkaWQgbm90IG92ZXJsb2FkIHRoZVxuICogbG9jYXRlRmlsZSBwYXJhbWV0ZXIgaW4gU29sdXRpb25Db25maWcuXG4gKi9cbmZ1bmN0aW9uIGRlZmF1bHRMb2NhdGVGaWxlKGZpbGU6IHN0cmluZywgcHJlZml4OiBzdHJpbmcpIHtcbiAgcmV0dXJuIHByZWZpeCArIGZpbGU7XG59XG5cbi8qKlxuICogU2V0cyBhbiBhcmJpdHJhcnkgdmFsdWUgb24gYHdpbmRvd2AuIFRoaXMgaXMgYSB0eXBpbmcgd3JhcHBlciB0byBwcmV2ZW50XG4gKiBlcnJvcnMgZm9yIHVzaW5nIGB3aW5kb3dgIGltcHJvcGVybHkuXG4gKi9cbmZ1bmN0aW9uIHNldFdpbmRvdzxUPihrZXk6IHN0cmluZywgdmFsdWU6IFQpOiB2b2lkIHtcbiAgKHdpbmRvdyBhcyB1bmtub3duIGFzIHtba2V5OiBzdHJpbmddOiBUfSlba2V5XSA9IHZhbHVlO1xufVxuXG4vKipcbiAqIEdldHMgYW4gYXJiaXRyYXJ5IHZhbHVlIGZyb20gYHdpbmRvd2AuIFRoaXMgaXMgYSB0eXBpbmcgd3JhcHBlciB0byBwcmV2ZW50XG4gKiBlcnJvcnMgZm9yIHVzaW5nIGB3aW5kb3dgIGltcHJvcGVybHkuXG4gKi9cbmZ1bmN0aW9uIGdldFdpbmRvdyhrZXk6IHN0cmluZyk6IHVua25vd24ge1xuICByZXR1cm4gKHdpbmRvdyBhcyB1bmtub3duIGFzIHtba2V5OiBzdHJpbmddOiB1bmtub3dufSlba2V5XTtcbn1cblxuLyoqXG4gKiBEeW5hbWljYWxseSBsb2FkcyBhIGFzY3JpcHQgaW50byB0aGUgY3VycmVudCBwYWdlIGFuZCByZXR1cm5zIGEgYFByb21pc2VgXG4gKiB0aGF0IHJlc29sdmVzIHdoZW4gaXRzIGxvYWRpbmcgaXMgY29tcGxldGUuXG4gKi9cbmZ1bmN0aW9uIGxvYWRTY3JpcHQodXJsOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gIHNjcmlwdC5zZXRBdHRyaWJ1dGUoJ3NyYycsIHVybCk7XG4gIHNjcmlwdC5zZXRBdHRyaWJ1dGUoJ2Nyb3Nzb3JpZ2luJywgJ2Fub255bW91cycpO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHNjcmlwdC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0sIGZhbHNlKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFBhY2thZ2VQYXRoKCk6IHN0cmluZyB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUudG9TdHJpbmcoKS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAwLCB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUudG9TdHJpbmcoKS5sYXN0SW5kZXhPZignLycpKSArXG4gICAgICAgICcvJztcbiAgfSBlbHNlIGlmICh0eXBlb2YgbG9jYXRpb24gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gd29ya2VyXG4gICAgcmV0dXJuIGxvY2F0aW9uLnBhdGhuYW1lLnRvU3RyaW5nKCkuc3Vic3RyaW5nKFxuICAgICAgICAgICAgICAgMCwgbG9jYXRpb24ucGF0aG5hbWUudG9TdHJpbmcoKS5sYXN0SW5kZXhPZignLycpKSArXG4gICAgICAgICcvJztcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdzb2x1dGlvbnMgY2FuIG9ubHkgYmUgbG9hZGVkIG9uIGEgd2ViIHBhZ2Ugb3IgaW4gYSB3ZWIgd29ya2VyJyk7XG4gIH1cbn1cblxuY2xhc3MgR3JhcGhEYXRhSW1wbCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSByZWFkb25seSBncmFwaDogR3JhcGgsIHByaXZhdGUgcmVhZG9ubHkgbG9jYXRlRmlsZTogRmlsZUxvY2F0b3JGbixcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgcGFja2FnZVBhdGg6IHN0cmluZykge31cblxuICBhc3luYyB0b0FycmF5QnVmZmVyKCk6IFByb21pc2U8QXJyYXlCdWZmZXI+IHtcbiAgICBpZiAodGhpcy5ncmFwaC51cmwpIHtcbiAgICAgIGNvbnN0IGZldGNoZWQgPVxuICAgICAgICAgIGF3YWl0IGZldGNoKHRoaXMubG9jYXRlRmlsZSh0aGlzLmdyYXBoLnVybCwgdGhpcy5wYWNrYWdlUGF0aCkpO1xuICAgICAgaWYgKGZldGNoZWQuYm9keSkge1xuICAgICAgICByZXR1cm4gZmV0Y2hlZC5hcnJheUJ1ZmZlcigpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IEFycmF5QnVmZmVyKDApO1xuICB9XG59XG5cbi8qKlxuICogSW5wdXRzIHRvIHRoZSBncmFwaC4gQ3VycmVudGx5IG9ubHkgb25lIGlucHV0LCBhIHZpZGVvIGZyYW1lLCBpc1xuICogcGVybWl0dGVkLCBidXQgdGhpcyBzaG91bGQgZW5jb21wYXNzIGFueSBpbnB1dCBkYXRhIHRvIGEgc29sdXRpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRnJhbWVJbnB1dHMge1xuICB2aWRlbzogSFRNTFZpZGVvRWxlbWVudDtcbn1cblxuXG5cbi8qKlxuICogTWVkaWFQaXBlIFNvbHV0aW9uIHVwb24gd2hpY2ggYWxsIHNwZWNpZmljIHNvbHV0aW9ucyB3aWxsIGJlIGJ1aWx0LlxuICovXG5leHBvcnQgY2xhc3MgU29sdXRpb24ge1xuICBwcml2YXRlIHJlYWRvbmx5IHBhY2thZ2VQYXRoOiBzdHJpbmc7XG4gIHByaXZhdGUgcmVhZG9ubHkgbG9jYXRlRmlsZTogRmlsZUxvY2F0b3JGbjtcblxuICAvLyBCRUdJTjogQXNzaWduZWQgZHVyaW5nIGluaXRpYWxpemVXYXNtLi4uXG4gIHByaXZhdGUgZ2xDYW52YXMhOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgcHJpdmF0ZSBnbCE6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQ7XG4gIHByaXZhdGUgd2FzbSE6IHNvbHV0aW9uc1dhc20uTWVkaWFwaXBlV2FzbTtcbiAgcHJpdmF0ZSBzb2x1dGlvbldhc20hOiBzb2x1dGlvbnNXYXNtLlNvbHV0aW9uV2FzbTtcbiAgLy8gRU5EOiBBc3NpZ25lZCBkdXJpbmcgaW5pdGlhbGl6ZVdhc20uLi5cblxuICBwcml2YXRlIHBlbmRpbmdDaGFuZ2VzPzogc29sdXRpb25zV2FzbS5HcmFwaE9wdGlvbkNoYW5nZVJlcXVlc3RbXTtcblxuICBwcml2YXRlIG5lZWRUb0luaXRpYWxpemVXYXNtID0gdHJ1ZTtcbiAgcHJpdmF0ZSBuZWVkVG9Jbml0aWFsaXplR3JhcGggPSB0cnVlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgY29uZmlnOiBTb2x1dGlvbkNvbmZpZykge1xuICAgIHRoaXMubG9jYXRlRmlsZSA9IChjb25maWcgJiYgY29uZmlnLmxvY2F0ZUZpbGUpIHx8IGRlZmF1bHRMb2NhdGVGaWxlO1xuICAgIHRoaXMucGFja2FnZVBhdGggPSBnZXRQYWNrYWdlUGF0aCgpO1xuICB9XG5cbiAgY2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuc29sdXRpb25XYXNtKSB7XG4gICAgICB0aGlzLnNvbHV0aW9uV2FzbS5kZWxldGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWRzIGFsbCBvZiB0aGUgZGVwZW5kZW50IFdBU00gZmlsZXMuIFRoaXMgaXMgaGVhdnksIHNvIHdlIG1ha2Ugc3VyZSB0b1xuICAgKiBvbmx5IGRvIHRoaXMgb25jZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgdHJ5VG9Jbml0aWFsaXplV2FzbSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMubmVlZFRvSW5pdGlhbGl6ZVdhc20pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gU2V0IHVwIHRoZSBmaWxlIGxvYWRlciBmb3IgYm90aCBleHRlcm5hbCBsb2FkZXJzLlxuICAgIHNldFdpbmRvdyhBUElfRVhQT1JUX05BTUUsIHtsb2NhdGVGaWxlOiB0aGlzLmxvY2F0ZUZpbGV9KTtcbiAgICBzZXRXaW5kb3coUEFDS19FWFBPUlRfTkFNRSwge2xvY2F0ZUZpbGU6IHRoaXMubG9jYXRlRmlsZX0pO1xuXG4gICAgY29uc3QgZmlsZXMgPSAodGhpcy5jb25maWcuZmlsZXMpIHx8IFtdO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgICBmaWxlcy5tYXAoeCA9PiBsb2FkU2NyaXB0KHRoaXMubG9jYXRlRmlsZSh4LCB0aGlzLnBhY2thZ2VQYXRoKSkpKTtcblxuICAgIC8vIFRoZSB2YXJpYWJsZXMgd2Ugc2V0IGVhcmxpZXIgd2lsbCBub3QgYmUgbXV0YXRlZCwgZWFjaCBhY2NvcmRpbmcgdG8gaXRzXG4gICAgLy8gcmVsYXRlZCBsb2FkZXIuXG4gICAgY29uc3QgYXBpRm4gPSBnZXRXaW5kb3coQVBJX0VYUE9SVF9OQU1FKSBhcyBzb2x1dGlvbnNXYXNtLkFwaVByb21pc2VGbjtcbiAgICBjb25zdCBwYWNrRm4gPSBnZXRXaW5kb3coUEFDS19FWFBPUlRfTkFNRSkgYXMgc29sdXRpb25zV2FzbS5QYWNrTG9hZGVyO1xuXG4gICAgLy8gTm93IHRoYXQgZXZlcnl0aGluZyBpcyBsb2FkZWQgYW5kIG11dGF0ZWQsIHdlIGNhbiBmaW5hbGx5IGluaXRpYWxpemVcbiAgICAvLyB0aGUgV0FTTSBsb2FkZXIgd2l0aCB0aGUgcGFjayBsb2FkZXIuIFRoZSBXQVNNIGxvYWRlciB3aWxsIHdhaXQgdW50aWxcbiAgICAvLyBhbGwgb2YgdGhlIGZpbGVzIGluIHRoZSBwYWNrIGxvYWRlciBhcmUgY29tcGxldGUgYmVmb3JlIHJlc29sdmluZyBpdHNcbiAgICAvLyBQcm9taXNlLlxuICAgIHRoaXMud2FzbSA9IGF3YWl0IGFwaUZuKHBhY2tGbik7XG5cbiAgICAvLyBUT0RPKG1oYXlzKTogRGV2ZWxvcGVyIHNob3VsZCBiZSBhYmxlIHRvIGV4cGxpY2l0bHkgbG9hZC91bmxvYWQgYVxuICAgIC8vIHNvbHV0aW9uIHRvIHByZXZlbnQgc3RlYWxpbmcgYWxsIG9mIHRoZSBXZWJHTCByZXNvdXJjZXMgKGUuZy4sIENocm9tZVxuICAgIC8vIG1heSBsaW1pdCB0aGUgbnVtYmVyIG9mIFdlYkdMIGNvbnRleHRzIGJ5IGRvbWFpbikuXG4gICAgdGhpcy5nbENhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHRoaXMud2FzbS5jYW52YXMgPSB0aGlzLmdsQ2FudmFzO1xuXG4gICAgdGhpcy53YXNtLmNyZWF0ZUNvbnRleHQoXG4gICAgICAgIHRoaXMuZ2xDYW52YXMsIC8qIHVzZVdlYkdsPSAqLyB0cnVlLFxuICAgICAgICAvKiBzZXRJbk1vZHVsZT0gKi8gdHJ1ZSwge30pO1xuXG4gICAgLy8gVGhlIGdyYXBoIG9ubHkgbmVlZHMgdG8gYmUgbG9hZGVkIG9uY2UgaW50byB0aGUgc29sdXRpb24sIGJ1dCB0aGUgV0FTTVxuICAgIC8vIG1pZ2h0IHJlLWluaXRpYWxpemUgdGhlIHNvbHV0aW9uLCBhbmQgdGhhdCB3aWxsIHNwZWNpZmljYWxseSBoYXBwZW5cbiAgICAvLyBkdXJpbmcgd2FzbS5Qcm9jZXNzRnJhbWUuXG4gICAgdGhpcy5zb2x1dGlvbldhc20gPSBuZXcgdGhpcy53YXNtLlNvbHV0aW9uV2FzbSgpO1xuICAgIGNvbnN0IGdyYXBoRGF0YSA9XG4gICAgICAgIG5ldyBHcmFwaERhdGFJbXBsKHRoaXMuY29uZmlnLmdyYXBoLCB0aGlzLmxvY2F0ZUZpbGUsIHRoaXMucGFja2FnZVBhdGgpO1xuICAgIGF3YWl0IHRoaXMubG9hZEdyYXBoKGdyYXBoRGF0YSk7XG5cbiAgICB0aGlzLm5lZWRUb0luaXRpYWxpemVXYXNtID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgb3B0aW9ucyBmb3IgdGhlIGdyYXBoLCBwb3RlbnRpYWxseSB0cmlnZ2VyaW5nIGEgcmVpbml0aWFsaXplLlxuICAgKiBUaGUgdHJpZ2dlcmluZyBpcyBjb250aW5nZW50IHVwb24gdGhlIG9wdGlvbnMgbWF0Y2hpbmcgdGhvc2Ugc2V0IHVwIGluXG4gICAqIHRoZSBzb2x1dGlvbiBjb25maWd1cmF0aW9uLiBJZiBhIG1hdGNoIGlzIGZvdW5kLCBpbml0aWFsaXplIGlzIHNldCB0byBydW5cbiAgICogb24gdGhlIG5leHQgcHJvY2Vzc0ZyYW1lLlxuICAgKlxuICAgKiBXZSBkbyBub3QgY3JlYXRlIGEgV0FTTSBvYmplY3QgaGVyZSwgYmVjYXVzZSBpdCdzIHBvc3NpYmxlIChsaWtlbHkpIHRoYXRcbiAgICogV0FTTSBoYXMgbm90IGxvYWRlZCB5ZXQgKGkuZS4sIHRoZSB1c2VyIGNhbGxzIHNldE9wdGlvbnMgYmVmb3JlIGNhbGxpbmdcbiAgICogcHJvY2Vzc0ZyYW1lIC8gaW5pdGlhbGl6ZSkuICBXZSdsbCBkbyB0aGF0IGR1cmluZyBpbml0aWFsaXplIHdoZW4gd2Uga25vd1xuICAgKiBpdCdzIHNhZmUuXG4gICAqL1xuICBzZXRPcHRpb25zKG9wdGlvbnM6IE9wdGlvbkxpc3QpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuY29uZmlnLm9wdGlvbnMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGVuZGluZ0NoYW5nZXM6IHNvbHV0aW9uc1dhc20uR3JhcGhPcHRpb25DaGFuZ2VSZXF1ZXN0W10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBPYmplY3Qua2V5cyhvcHRpb25zKSkge1xuICAgICAgLy8gTG9vayBlYWNoIG9wdGlvbiBpbiB0aGUgb3B0aW9uIGNvbmZpZy5cbiAgICAgIGNvbnN0IG9wdGlvbkNvbmZpZyA9IHRoaXMuY29uZmlnLm9wdGlvbnNbb3B0aW9uXTtcbiAgICAgIGlmIChvcHRpb25Db25maWcpIHtcbiAgICAgICAgaWYgKG9wdGlvbkNvbmZpZy5ncmFwaE9wdGlvblhyZWYpIHtcbiAgICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IHtcbiAgICAgICAgICAgIHZhbHVlTnVtYmVyOiBvcHRpb25Db25maWcudHlwZSA9PT0gT3B0aW9uVHlwZS5OVU1CRVIgP1xuICAgICAgICAgICAgICAgIG9wdGlvbnNbb3B0aW9uXSBhcyBudW1iZXIgOlxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZFxuICAgICAgICAgIH07XG4gICAgICAgICAgLy8gQ29tYmluZSB0aGUgeHJlZiB3aXRoIHRoZSB2YWx1ZS4gVGhpcyBpcyB3aGF0IHRoZSBXQVNNIHdpbGwgYmVcbiAgICAgICAgICAvLyBleHBlY3RpbmcuXG4gICAgICAgICAgY29uc3QgcmVxdWVzdCA9IHsuLi5vcHRpb25Db25maWcuZ3JhcGhPcHRpb25YcmVmLCAuLi5vcHRpb25WYWx1ZX07XG4gICAgICAgICAgcGVuZGluZ0NoYW5nZXMucHVzaChyZXF1ZXN0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwZW5kaW5nQ2hhbmdlcy5sZW5ndGggIT09IDApIHtcbiAgICAgIHRoaXMubmVlZFRvSW5pdGlhbGl6ZUdyYXBoID0gdHJ1ZTtcbiAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMgPSBwZW5kaW5nQ2hhbmdlcztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGdyYXBoIGlzIGl0IGhhcyBub3QgYmVlbiBsb2FkZWQsIG9yIGhhcyBiZWVuIHRyaWdnZXJlZCB0b1xuICAgKiByZWxvYWQgKHNldE9wdGlvbnMgd2FzIGNhbGxlZCB3aGlsZSB0aGUgZ3JhcGggd2FzIHJ1bm5pbmcpLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyB0cnlUb0luaXRpYWxpemVHcmFwaCgpIHtcbiAgICBpZiAoIXRoaXMubmVlZFRvSW5pdGlhbGl6ZUdyYXBoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc29sdXRpb25XYXNtLmJpbmRUZXh0dXJlVG9DYW52YXMoKTtcbiAgICAvLyBNb3ZlIHRoZSB2aWRlbyBmcmFtZSBpbnRvIHRoZSB0ZXh0dXJlLlxuICAgIGNvbnN0IGdsID0gdGhpcy5nbENhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbDInKTtcbiAgICBpZiAoIWdsKSB7XG4gICAgICBhbGVydCgnRmFpbGVkIHRvIGNyZWF0ZSBXZWJHTCBjYW52YXMgY29udGV4dCB3aGVuIHBhc3NpbmcgdmlkZW8gZnJhbWUuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZ2wgPSBnbDtcblxuICAgIC8vIENoYW5naW5nIG9wdGlvbnMgb24gdGhlIGdyYXBoIHdpbGwgbXV0YXRlIHRoZSBncmFwaCBjb25maWcuXG4gICAgaWYgKHRoaXMucGVuZGluZ0NoYW5nZXMpIHtcbiAgICAgIGNvbnN0IGNoYW5nZUxpc3QgPSBuZXcgdGhpcy53YXNtLkdyYXBoT3B0aW9uQ2hhbmdlUmVxdWVzdExpc3QoKTtcbiAgICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIHRoaXMucGVuZGluZ0NoYW5nZXMpIHtcbiAgICAgICAgY2hhbmdlTGlzdC5wdXNoX2JhY2soY2hhbmdlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc29sdXRpb25XYXNtLmNoYW5nZU9wdGlvbnMoY2hhbmdlTGlzdCk7XG4gICAgICBjaGFuZ2VMaXN0LmRlbGV0ZSgpO1xuICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jb25maWcub25SZWdpc3Rlckxpc3RlbmVycykge1xuICAgICAgdGhpcy5jb25maWcub25SZWdpc3Rlckxpc3RlbmVycyh0aGlzLmF0dGFjaExpc3RlbmVyLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHRoaXMubmVlZFRvSW5pdGlhbGl6ZUdyYXBoID0gZmFsc2U7XG4gIH1cblxuICBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMudHJ5VG9Jbml0aWFsaXplV2FzbSgpO1xuICAgIGF3YWl0IHRoaXMudHJ5VG9Jbml0aWFsaXplR3JhcGgoKTtcbiAgfVxuXG4gIGFzeW5jIGxvYWRHcmFwaChncmFwaDogR3JhcGhEYXRhKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZ3JhcGhEYXRhID0gYXdhaXQgZ3JhcGgudG9BcnJheUJ1ZmZlcigpO1xuICAgIHRoaXMuc29sdXRpb25XYXNtLmxvYWRHcmFwaChncmFwaERhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRPRE8obWhheXMpOiBmcmFtZSBpbnB1dHMgd2lsbCBiZSBhbiBhcnJheSBvZiB7bmFtZSwgcGFja2V0fS5cbiAgICovXG4gIGFzeW5jIHByb2Nlc3NGcmFtZShcbiAgICAgIGlucHV0U3RyZWFtTmFtZTogc3RyaW5nLCBtZXRhZGF0YTogRnJhbWVNZXRhZGF0YSxcbiAgICAgIGlucHV0czogRnJhbWVJbnB1dHMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmluaXRpYWxpemUoKTtcbiAgICBjb25zdCBnbCA9IHRoaXMuZ2w7XG4gICAgdGhpcy5zb2x1dGlvbldhc20uYmluZFRleHR1cmVUb0NhbnZhcygpO1xuICAgIGdsLnRleEltYWdlMkQoXG4gICAgICAgIGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGlucHV0cy52aWRlbyk7XG5cbiAgICB0aGlzLnNvbHV0aW9uV2FzbS5wcm9jZXNzRnJhbWUoaW5wdXRTdHJlYW1OYW1lLCB7XG4gICAgICB3aWR0aDogaW5wdXRzLnZpZGVvLnZpZGVvV2lkdGgsXG4gICAgICBoZWlnaHQ6IGlucHV0cy52aWRlby52aWRlb0hlaWdodCxcbiAgICAgIHRpbWVzdGFtcE1zOiBwZXJmb3JtYW5jZS5ub3coKVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIGEgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSBncmFwaCBwcm9kdWNlc1xuICAgKiBjb21wYXRpYmxlIHBhY2tldHMgb24gdGhlIG5hbWVkIHN0cmVhbS5cbiAgICovXG4gIHByaXZhdGUgYXR0YWNoTGlzdGVuZXIod2FudHM6IHN0cmluZ1tdLCBsaXN0ZW5lcjogUmVzdWx0TWFwTGlzdGVuZXIpOiB2b2lkIHtcbiAgICBjb25zdCB3YW50c0NvcHkgPSBbLi4ud2FudHNdO1xuICAgIGNvbnN0IHdhbnRzVmVjdG9yID0gbmV3IHRoaXMud2FzbS5TdHJpbmdMaXN0KCk7XG4gICAgZm9yIChjb25zdCB3YW50IG9mIHdhbnRzKSB7XG4gICAgICB3YW50c1ZlY3Rvci5wdXNoX2JhY2sod2FudCk7XG4gICAgfVxuICAgIGNvbnN0IHdhc21MaXN0ZW5lciA9IHtcbiAgICAgIG9uUmVzdWx0czogKHZhbHVlczogc29sdXRpb25zV2FzbS5SZXN1bHRXYXNtTGlzdCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHRzOiBSZXN1bHRNYXAgPSB7fTtcbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHdhbnRzLmxlbmd0aDsgKytpbmRleCkge1xuICAgICAgICAgIHJlc3VsdHNbd2FudHNDb3B5W2luZGV4XV0gPSBleHRyYWN0V2FzbVJlc3VsdCh2YWx1ZXMuZ2V0KGluZGV4KSk7XG4gICAgICAgIH1cbiAgICAgICAgbGlzdGVuZXIocmVzdWx0cyk7XG4gICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBwYWNrZXRMaXN0ZW5lciA9IHRoaXMud2FzbS5QYWNrZXRMaXN0ZW5lci5pbXBsZW1lbnQod2FzbUxpc3RlbmVyKTtcbiAgICB0aGlzLnNvbHV0aW9uV2FzbS5hdHRhY2hNdWx0aUxpc3RlbmVyKHdhbnRzVmVjdG9yLCBwYWNrZXRMaXN0ZW5lcik7XG4gICAgd2FudHNWZWN0b3IuZGVsZXRlKCk7XG4gIH1cbn1cblxuZ29vZy5leHBvcnRTeW1ib2woJ1NvbHV0aW9uJywgU29sdXRpb24pO1xuIl19
;return exports;});

//third_party/mediapipe/web/solutions/pose_tracking/pose_tracking.closure.js
goog.loadModule(function(exports) {'use strict';/**
 * @fileoverview added by tsickle
 * Generated from: third_party/mediapipe/web/solutions/pose_tracking/pose_tracking.ts
 * @suppress {checkTypes,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
goog.module('google3.third_party.mediapipe.web.solutions.pose_tracking.pose_tracking');
var module = module || { id: 'third_party/mediapipe/web/solutions/pose_tracking/pose_tracking.closure.js' };
const tslib_1 = goog.require('google3.third_party.javascript.tslib.tslib');
const tsickle_solutions_api_1 = goog.requireType("google3.third_party.mediapipe.web.solutions.solutions_api");
const tsickle_solutions_wasm_2 = goog.requireType("google3.third_party.mediapipe.web.solutions.solutions_wasm");
const solutionsApi = goog.require('google3.third_party.mediapipe.web.solutions.solutions_api');
/**
 * PoseEvent.onPose returns an array of landmarks. This array provides the
 * edges to connect those landmarks to one another.
 * @type {!Array<!Array<number>>}
 */
exports.LANDMARK_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6],
    [6, 8], [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19],
    [15, 21], [17, 19], [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
    [18, 20], [11, 23], [12, 24], [23, 24]
];
/**
 * Represents a single normalized landmark.
 * @record
 */
function NormalizedLandmark() { }
exports.NormalizedLandmark = NormalizedLandmark;
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    NormalizedLandmark.prototype.x;
    /** @type {number} */
    NormalizedLandmark.prototype.y;
    /** @type {number} */
    NormalizedLandmark.prototype.visibility;
}
/**
 * Description of pose. A possible reults from PoseSolution.
 * @record
 */
function Pose() { }
exports.Pose = Pose;
/* istanbul ignore if */
if (false) {
    /** @type {!ReadOnlySimpleVector<!NormalizedLandmark>} */
    Pose.prototype.landmarks;
    /** @type {!NormalizedRect} */
    Pose.prototype.rect;
}
/**
 * Legal inputs for PoseSolution.
 * @record
 */
function Inputs() { }
exports.Inputs = Inputs;
/* istanbul ignore if */
if (false) {
    /** @type {!HTMLVideoElement} */
    Inputs.prototype.video;
}
/**
 * Possible results from PoseSolution.
 * @record
 */
function Results() { }
exports.Results = Results;
/* istanbul ignore if */
if (false) {
    /** @type {!Pose} */
    Results.prototype.pose;
}
/**
 * Configurable options for PoseSolution.
 * @record
 */
function Options() { }
exports.Options = Options;
/* istanbul ignore if */
if (false) {
    /** @type {number} */
    Options.prototype.poseThreshold;
}
/**
 * Listener for any results from PoseSolution.
 * @typedef {function(!Results): (void|!Promise<void>)}
 */
exports.ResultsListener;
/**
 * Contains all of the setup config for the pose solution.
 * @record
 */
function PoseSolutionConfig() { }
exports.PoseSolutionConfig = PoseSolutionConfig;
/* istanbul ignore if */
if (false) {
    /** @type {(undefined|function(string, (undefined|string)=): string)} */
    PoseSolutionConfig.prototype.locateFile;
}
/**
 * Encapsulates the entire Pose solution. All that is needed from the developer
 * is the source of the image data. The user will call `send` repeatedly, and if
 * a pose is detected, then the user can receive callbacks with this metadata.
 */
class PoseSolution {
    /**
     * @param {(undefined|!PoseSolutionConfig)=} config
     */
    constructor(config) {
        config = config || {};
        this.solution = new solutionsApi.Solution({
            locateFile: config.locateFile,
            files: [
                'pose_tracking_solution_packed_assets_loader.js',
                'pose_tracking_solution_wasm_bin.js'
            ],
            graph: { url: 'pose_web.binarypb' },
            onRegisterListeners: (/**
             * @param {function(!Array<string>, function(!tsickle_solutions_api_1.ResultMap): void): void} attachFn
             * @return {void}
             */
            (attachFn) => {
                /** @type {!PoseSolution} */
                const thiz = this;
                // The listeners can be attached before or after the graph is loaded.
                // We will eventually hide these inside the pose api so that a
                // developer doesn't have to know the stream names.
                attachFn(['pose_landmarks', 'pose_rect'], (/**
                 * @param {!tsickle_solutions_api_1.ResultMap} results
                 * @return {void}
                 */
                (results) => {
                    if (thiz.listener) {
                        thiz.listener({
                            pose: {
                                landmarks: (/** @type {!tsickle_solutions_wasm_2.ReadOnlySimpleVector<!tsickle_solutions_wasm_2.NormalizedLandmark>} */ (results['pose_landmarks'])),
                                rect: (/** @type {!tsickle_solutions_wasm_2.NormalizedRect} */ (results['pose_rect']))
                            }
                        });
                    }
                }));
            }),
            options: {
                'poseThreshold': {
                    type: solutionsApi.OptionType.NUMBER,
                    graphOptionXref: {
                        calculatorType: 'ThresholdingCalculator',
                        calculatorIndex: 1,
                        fieldName: 'threshold'
                    }
                }
            }
        });
    }
    /**
     * Shuts down the object. Call before creating a new instance.
     * @return {!Promise<void>}
     */
    close() {
        this.solution.close();
        return Promise.resolve();
    }
    /**
     * Registers a single callback that will carry any results that occur
     * after calling Send().
     * @param {function(!Results): (void|!Promise<void>)} listener
     * @return {void}
     */
    onResults(listener) {
        this.listener = listener;
    }
    /**
     * Initializes the solution. This includes loading ML models and mediapipe
     * configurations, as well as setting up potential listeners for metadata. If
     * `initialize` is not called manually, then it will be called the first time
     * the developer calls `send`.
     * @return {!Promise<void>}
     */
    initialize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.solution.initialize();
        });
    }
    /**
     * Sends inputs to the solution. The developer can await the results, which
     * resolves when the graph and any listeners have completed.
     * @param {!Inputs} inputs
     * @return {!Promise<void>}
     */
    send(inputs) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (inputs.video) {
                /** @type {!HTMLVideoElement} */
                const video = inputs.video;
                yield this.solution.processFrame('input_frames_gpu', {
                    height: video.videoHeight,
                    width: video.videoWidth,
                    timestampMs: performance.now()
                }, { video });
            }
        });
    }
    /**
     * Adjusts options in the solution. This may trigger a graph reload the next
     * time the graph tries to run.
     * @param {!Options} options
     * @return {void}
     */
    setOptions(options) {
        this.solution.setOptions((/** @type {!tsickle_solutions_api_1.OptionList} */ ((/** @type {*} */ (options)))));
    }
}
exports.PoseSolution = PoseSolution;
/* istanbul ignore if */
if (false) {
    /**
     * @type {!tsickle_solutions_api_1.Solution}
     * @private
     */
    PoseSolution.prototype.solution;
    /**
     * @type {(undefined|function(!Results): (void|!Promise<void>))}
     * @private
     */
    PoseSolution.prototype.listener;
}
goog.exportSymbol('LANDMARK_CONNECTIONS', exports.LANDMARK_CONNECTIONS);
goog.exportSymbol('PoseSolution', PoseSolution);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zZV90cmFja2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3RoaXJkX3BhcnR5L21lZGlhcGlwZS93ZWIvc29sdXRpb25zL3Bvc2VfdHJhY2tpbmcvcG9zZV90cmFja2luZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsK0ZBQTBGOzs7Ozs7QUFNN0UsUUFBQSxvQkFBb0IsR0FBRztJQUNsQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO0lBQ3BFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUNwRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFB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ekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMscURBQUEsbUJBQUEsT0FBTyxFQUFXLEVBQTJCLENBQUMsQ0FBQztJQUMxRSxDQUFDO0NBQ0Y7QUEvRkQsb0NBK0ZDOzs7Ozs7O0lBOUZDLGdDQUFpRDs7Ozs7SUFDakQsZ0NBQW1DOztBQStGckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsRUFBRSw0QkFBb0IsQ0FBQyxDQUFDO0FBQ2hFLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc29sdXRpb25zQXBpIGZyb20gJ2dvb2dsZTMvdGhpcmRfcGFydHkvbWVkaWFwaXBlL3dlYi9zb2x1dGlvbnMvc29sdXRpb25zX2FwaSc7XG5cbi8qKlxuICogUG9zZUV2ZW50Lm9uUG9zZSByZXR1cm5zIGFuIGFycmF5IG9mIGxhbmRtYXJrcy4gVGhpcyBhcnJheSBwcm92aWRlcyB0aGVcbiAqIGVkZ2VzIHRvIGNvbm5lY3QgdGhvc2UgbGFuZG1hcmtzIHRvIG9uZSBhbm90aGVyLlxuICovXG5leHBvcnQgY29uc3QgTEFORE1BUktfQ09OTkVDVElPTlMgPSBbXG4gIFswLCAxXSwgICBbMSwgMl0sICAgWzIsIDNdLCAgIFszLCA3XSwgICBbMCwgNF0sICAgWzQsIDVdLCAgIFs1LCA2XSxcbiAgWzYsIDhdLCAgIFs5LCAxMF0sICBbMTEsIDEyXSwgWzExLCAxM10sIFsxMywgMTVdLCBbMTUsIDE3XSwgWzE1LCAxOV0sXG4gIFsxNSwgMjFdLCBbMTcsIDE5XSwgWzEyLCAxNF0sIFsxNCwgMTZdLCBbMTYsIDE4XSwgWzE2LCAyMF0sIFsxNiwgMjJdLFxuICBbMTgsIDIwXSwgWzExLCAyM10sIFsxMiwgMjRdLCBbMjMsIDI0XVxuXTtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgV0FTTSBiYWNrZWQsIHJlYWQtb25seSB2ZWN0b3IuXG4gKi9cbmRlY2xhcmUgaW50ZXJmYWNlIFJlYWRPbmx5U2ltcGxlVmVjdG9yPFQ+IHtcbiAgZ2V0KGluZGV4OiBudW1iZXIpOiBUO1xuICBzaXplKCk6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgbm9ybWFsaXplZCByZWN0YW5nbGUuIEhhcyBhbiBJRCB0aGF0IHNob3VsZCBiZSBjb25zaXN0ZW50XG4gKiBhY3Jvc3MgY2FsbHMuXG4gKi9cbmRlY2xhcmUgaW50ZXJmYWNlIE5vcm1hbGl6ZWRSZWN0IHtcbiAgeENlbnRlcjogbnVtYmVyO1xuICB5Q2VudGVyOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xuICB3aWR0aDogbnVtYmVyO1xuICByb3RhdGlvbjogbnVtYmVyO1xuICByZWN0SWQ6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgc2luZ2xlIG5vcm1hbGl6ZWQgbGFuZG1hcmsuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTm9ybWFsaXplZExhbmRtYXJrIHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG4gIHZpc2liaWxpdHk6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBEZXNjcmlwdGlvbiBvZiBwb3NlLiBBIHBvc3NpYmxlIHJldWx0cyBmcm9tIFBvc2VTb2x1dGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQb3NlIHtcbiAgbGFuZG1hcmtzOiBSZWFkT25seVNpbXBsZVZlY3RvcjxOb3JtYWxpemVkTGFuZG1hcms+O1xuICByZWN0OiBOb3JtYWxpemVkUmVjdDtcbn1cblxuLyoqXG4gKiBMZWdhbCBpbnB1dHMgZm9yIFBvc2VTb2x1dGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbnB1dHMge1xuICB2aWRlbzogSFRNTFZpZGVvRWxlbWVudDtcbn1cblxuLyoqXG4gKiBQb3NzaWJsZSByZXN1bHRzIGZyb20gUG9zZVNvbHV0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlc3VsdHMge1xuICBwb3NlOiBQb3NlO1xufVxuXG4vKipcbiAqIENvbmZpZ3VyYWJsZSBvcHRpb25zIGZvciBQb3NlU29sdXRpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9ucyB7XG4gIHBvc2VUaHJlc2hvbGQ6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBMaXN0ZW5lciBmb3IgYW55IHJlc3VsdHMgZnJvbSBQb3NlU29sdXRpb24uXG4gKi9cbmV4cG9ydCB0eXBlIFJlc3VsdHNMaXN0ZW5lciA9IChyZXN1bHRzOiBSZXN1bHRzKSA9PiAoUHJvbWlzZTx2b2lkPnx2b2lkKTtcblxuLyoqXG4gKiBDb250YWlucyBhbGwgb2YgdGhlIHNldHVwIGNvbmZpZyBmb3IgdGhlIHBvc2Ugc29sdXRpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUG9zZVNvbHV0aW9uQ29uZmlnIHtcbiAgbG9jYXRlRmlsZT86IChwYXRoOiBzdHJpbmcsIHByZWZpeD86IHN0cmluZykgPT4gc3RyaW5nO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyB0aGUgZW50aXJlIFBvc2Ugc29sdXRpb24uIEFsbCB0aGF0IGlzIG5lZWRlZCBmcm9tIHRoZSBkZXZlbG9wZXJcbiAqIGlzIHRoZSBzb3VyY2Ugb2YgdGhlIGltYWdlIGRhdGEuIFRoZSB1c2VyIHdpbGwgY2FsbCBgc2VuZGAgcmVwZWF0ZWRseSwgYW5kIGlmXG4gKiBhIHBvc2UgaXMgZGV0ZWN0ZWQsIHRoZW4gdGhlIHVzZXIgY2FuIHJlY2VpdmUgY2FsbGJhY2tzIHdpdGggdGhpcyBtZXRhZGF0YS5cbiAqL1xuZXhwb3J0IGNsYXNzIFBvc2VTb2x1dGlvbiB7XG4gIHByaXZhdGUgcmVhZG9ubHkgc29sdXRpb246IHNvbHV0aW9uc0FwaS5Tb2x1dGlvbjtcbiAgcHJpdmF0ZSBsaXN0ZW5lcj86IFJlc3VsdHNMaXN0ZW5lcjtcblxuICBjb25zdHJ1Y3Rvcihjb25maWc/OiBQb3NlU29sdXRpb25Db25maWcpIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gICAgdGhpcy5zb2x1dGlvbiA9IG5ldyBzb2x1dGlvbnNBcGkuU29sdXRpb24oe1xuICAgICAgbG9jYXRlRmlsZTogY29uZmlnLmxvY2F0ZUZpbGUsXG4gICAgICBmaWxlczogW1xuICAgICAgICAncG9zZV90cmFja2luZ19zb2x1dGlvbl9wYWNrZWRfYXNzZXRzX2xvYWRlci5qcycsXG4gICAgICAgICdwb3NlX3RyYWNraW5nX3NvbHV0aW9uX3dhc21fYmluLmpzJ1xuICAgICAgXSxcbiAgICAgIGdyYXBoOiB7dXJsOiAncG9zZV93ZWIuYmluYXJ5cGInfSxcbiAgICAgIG9uUmVnaXN0ZXJMaXN0ZW5lcnM6IChhdHRhY2hGbjogc29sdXRpb25zQXBpLkF0dGFjaExpc3RlbmVyRm4pID0+IHtcbiAgICAgICAgY29uc3QgdGhpeiA9IHRoaXM7XG4gICAgICAgIC8vIFRoZSBsaXN0ZW5lcnMgY2FuIGJlIGF0dGFjaGVkIGJlZm9yZSBvciBhZnRlciB0aGUgZ3JhcGggaXMgbG9hZGVkLlxuICAgICAgICAvLyBXZSB3aWxsIGV2ZW50dWFsbHkgaGlkZSB0aGVzZSBpbnNpZGUgdGhlIHBvc2UgYXBpIHNvIHRoYXQgYVxuICAgICAgICAvLyBkZXZlbG9wZXIgZG9lc24ndCBoYXZlIHRvIGtub3cgdGhlIHN0cmVhbSBuYW1lcy5cbiAgICAgICAgYXR0YWNoRm4oXG4gICAgICAgICAgICBbJ3Bvc2VfbGFuZG1hcmtzJywgJ3Bvc2VfcmVjdCddLFxuICAgICAgICAgICAgKHJlc3VsdHM6IHNvbHV0aW9uc0FwaS5SZXN1bHRNYXApID0+IHtcbiAgICAgICAgICAgICAgaWYgKHRoaXoubGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICB0aGl6Lmxpc3RlbmVyKHtcbiAgICAgICAgICAgICAgICAgIHBvc2U6IHtcbiAgICAgICAgICAgICAgICAgICAgbGFuZG1hcmtzOiByZXN1bHRzWydwb3NlX2xhbmRtYXJrcyddIGFzXG4gICAgICAgICAgICAgICAgICAgICAgICBzb2x1dGlvbnNBcGkuTm9ybWFsaXplZExhbmRtYXJrTGlzdCxcbiAgICAgICAgICAgICAgICAgICAgcmVjdDogcmVzdWx0c1sncG9zZV9yZWN0J10gYXMgc29sdXRpb25zQXBpLk5vcm1hbGl6ZWRSZWN0XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgJ3Bvc2VUaHJlc2hvbGQnOiB7XG4gICAgICAgICAgdHlwZTogc29sdXRpb25zQXBpLk9wdGlvblR5cGUuTlVNQkVSLFxuICAgICAgICAgIGdyYXBoT3B0aW9uWHJlZjoge1xuICAgICAgICAgICAgY2FsY3VsYXRvclR5cGU6ICdUaHJlc2hvbGRpbmdDYWxjdWxhdG9yJyxcbiAgICAgICAgICAgIGNhbGN1bGF0b3JJbmRleDogMSxcbiAgICAgICAgICAgIGZpZWxkTmFtZTogJ3RocmVzaG9sZCdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaHV0cyBkb3duIHRoZSBvYmplY3QuIENhbGwgYmVmb3JlIGNyZWF0aW5nIGEgbmV3IGluc3RhbmNlLlxuICAgKi9cbiAgY2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5zb2x1dGlvbi5jbG9zZSgpO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBzaW5nbGUgY2FsbGJhY2sgdGhhdCB3aWxsIGNhcnJ5IGFueSByZXN1bHRzIHRoYXQgb2NjdXJcbiAgICogYWZ0ZXIgY2FsbGluZyBTZW5kKCkuXG4gICAqL1xuICBvblJlc3VsdHMobGlzdGVuZXI6IFJlc3VsdHNMaXN0ZW5lcik6IHZvaWQge1xuICAgIHRoaXMubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgc29sdXRpb24uIFRoaXMgaW5jbHVkZXMgbG9hZGluZyBNTCBtb2RlbHMgYW5kIG1lZGlhcGlwZVxuICAgKiBjb25maWd1cmF0aW9ucywgYXMgd2VsbCBhcyBzZXR0aW5nIHVwIHBvdGVudGlhbCBsaXN0ZW5lcnMgZm9yIG1ldGFkYXRhLiBJZlxuICAgKiBgaW5pdGlhbGl6ZWAgaXMgbm90IGNhbGxlZCBtYW51YWxseSwgdGhlbiBpdCB3aWxsIGJlIGNhbGxlZCB0aGUgZmlyc3QgdGltZVxuICAgKiB0aGUgZGV2ZWxvcGVyIGNhbGxzIGBzZW5kYC5cbiAgICovXG4gIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5zb2x1dGlvbi5pbml0aWFsaXplKCk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZHMgaW5wdXRzIHRvIHRoZSBzb2x1dGlvbi4gVGhlIGRldmVsb3BlciBjYW4gYXdhaXQgdGhlIHJlc3VsdHMsIHdoaWNoXG4gICAqIHJlc29sdmVzIHdoZW4gdGhlIGdyYXBoIGFuZCBhbnkgbGlzdGVuZXJzIGhhdmUgY29tcGxldGVkLlxuICAgKi9cbiAgYXN5bmMgc2VuZChpbnB1dHM6IElucHV0cyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChpbnB1dHMudmlkZW8pIHtcbiAgICAgIGNvbnN0IHZpZGVvID0gaW5wdXRzLnZpZGVvO1xuICAgICAgYXdhaXQgdGhpcy5zb2x1dGlvbi5wcm9jZXNzRnJhbWUoXG4gICAgICAgICAgJ2lucHV0X2ZyYW1lc19ncHUnLCB7XG4gICAgICAgICAgICBoZWlnaHQ6IHZpZGVvLnZpZGVvSGVpZ2h0LFxuICAgICAgICAgICAgd2lkdGg6IHZpZGVvLnZpZGVvV2lkdGgsXG4gICAgICAgICAgICB0aW1lc3RhbXBNczogcGVyZm9ybWFuY2Uubm93KClcbiAgICAgICAgICB9LFxuICAgICAgICAgIHt2aWRlb30pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGp1c3RzIG9wdGlvbnMgaW4gdGhlIHNvbHV0aW9uLiBUaGlzIG1heSB0cmlnZ2VyIGEgZ3JhcGggcmVsb2FkIHRoZSBuZXh0XG4gICAqIHRpbWUgdGhlIGdyYXBoIHRyaWVzIHRvIHJ1bi5cbiAgICovXG4gIHNldE9wdGlvbnMob3B0aW9uczogT3B0aW9ucyk6IHZvaWQge1xuICAgIHRoaXMuc29sdXRpb24uc2V0T3B0aW9ucyhvcHRpb25zIGFzIHVua25vd24gYXMgc29sdXRpb25zQXBpLk9wdGlvbkxpc3QpO1xuICB9XG59XG5cbmdvb2cuZXhwb3J0U3ltYm9sKCdMQU5ETUFSS19DT05ORUNUSU9OUycsIExBTkRNQVJLX0NPTk5FQ1RJT05TKTtcbmdvb2cuZXhwb3J0U3ltYm9sKCdQb3NlU29sdXRpb24nLCBQb3NlU29sdXRpb24pO1xuIl19
;return exports;});

