(function() {
    function n(a) {
      var b = 0;
      return function() {
        return b < a.length ? {done:!1, value:a[b++]} : {done:!0};
      };
    }
    function q(a) {
      var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
      return b ? b.call(a) : {next:n(a)};
    }
    function r(a) {
      for (var b, d = []; !(b = a.next()).done;) {
        d.push(b.value);
      }
      return d;
    }
    var t = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, d) {
      if (a == Array.prototype || a == Object.prototype) {
        return a;
      }
      a[b] = d.value;
      return a;
    };
    function u(a) {
      a = ["object" == typeof globalThis && globalThis, a, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global];
      for (var b = 0; b < a.length; ++b) {
        var d = a[b];
        if (d && d.Math == Math) {
          return d;
        }
      }
      throw Error("Cannot find global object");
    }
    var w = u(this);
    function x(a, b) {
      if (b) {
        a: {
          var d = w;
          a = a.split(".");
          for (var c = 0; c < a.length - 1; c++) {
            var g = a[c];
            if (!(g in d)) {
              break a;
            }
            d = d[g];
          }
          a = a[a.length - 1];
          c = d[a];
          b = b(c);
          b != c && null != b && t(d, a, {configurable:!0, writable:!0, value:b});
        }
      }
    }
    var y;
    if ("function" == typeof Object.setPrototypeOf) {
      y = Object.setPrototypeOf;
    } else {
      var z;
      a: {
        var A = {v:!0}, B = {};
        try {
          B.__proto__ = A;
          z = B.v;
          break a;
        } catch (a) {
        }
        z = !1;
      }
      y = z ? function(a, b) {
        a.__proto__ = b;
        if (a.__proto__ !== b) {
          throw new TypeError(a + " is not extensible");
        }
        return a;
      } : null;
    }
    var C = y;
    function D() {
      this.f = !1;
      this.b = null;
      this.g = void 0;
      this.a = 1;
      this.i = 0;
      this.c = null;
    }
    function E(a) {
      if (a.f) {
        throw new TypeError("Generator is already running");
      }
      a.f = !0;
    }
    D.prototype.h = function(a) {
      this.g = a;
    };
    function F(a, b) {
      a.c = {A:b, B:!0};
      a.a = a.i;
    }
    D.prototype["return"] = function(a) {
      this.c = {"return":a};
      this.a = this.i;
    };
    function G(a, b, d) {
      a.a = d;
      return {value:b};
    }
    function K(a) {
      this.a = new D();
      this.b = a;
    }
    function L(a, b) {
      E(a.a);
      var d = a.a.b;
      if (d) {
        return M(a, "return" in d ? d["return"] : function(c) {
          return {value:c, done:!0};
        }, b, a.a["return"]);
      }
      a.a["return"](b);
      return N(a);
    }
    function M(a, b, d, c) {
      try {
        var g = b.call(a.a.b, d);
        if (!(g instanceof Object)) {
          throw new TypeError("Iterator result " + g + " is not an object");
        }
        if (!g.done) {
          return a.a.f = !1, g;
        }
        var l = g.value;
      } catch (e) {
        return a.a.b = null, F(a.a, e), N(a);
      }
      a.a.b = null;
      c.call(a.a, l);
      return N(a);
    }
    function N(a) {
      for (; a.a.a;) {
        try {
          var b = a.b(a.a);
          if (b) {
            return a.a.f = !1, {value:b.value, done:!1};
          }
        } catch (d) {
          a.a.g = void 0, F(a.a, d);
        }
      }
      a.a.f = !1;
      if (a.a.c) {
        b = a.a.c;
        a.a.c = null;
        if (b.B) {
          throw b.A;
        }
        return {value:b["return"], done:!0};
      }
      return {value:void 0, done:!0};
    }
    function O(a) {
      this.next = function(b) {
        E(a.a);
        a.a.b ? b = M(a, a.a.b.next, b, a.a.h) : (a.a.h(b), b = N(a));
        return b;
      };
      this["throw"] = function(b) {
        E(a.a);
        a.a.b ? b = M(a, a.a.b["throw"], b, a.a.h) : (F(a.a, b), b = N(a));
        return b;
      };
      this["return"] = function(b) {
        return L(a, b);
      };
      this[Symbol.iterator] = function() {
        return this;
      };
    }
    function P(a, b) {
      b = new O(new K(b));
      C && a.prototype && C(b, a.prototype);
      return b;
    }
    x("Symbol", function(a) {
      function b(g) {
        if (this instanceof b) {
          throw new TypeError("Symbol is not a constructor");
        }
        return new d("jscomp_symbol_" + (g || "") + "_" + c++, g);
      }
      function d(g, l) {
        this.a = g;
        t(this, "description", {configurable:!0, writable:!0, value:l});
      }
      if (a) {
        return a;
      }
      d.prototype.toString = function() {
        return this.a;
      };
      var c = 0;
      return b;
    });
    x("Symbol.iterator", function(a) {
      if (a) {
        return a;
      }
      a = Symbol("Symbol.iterator");
      for (var b = "Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "), d = 0; d < b.length; d++) {
        var c = w[b[d]];
        "function" === typeof c && "function" != typeof c.prototype[a] && t(c.prototype, a, {configurable:!0, writable:!0, value:function() {
          return Q(n(this));
        }});
      }
      return a;
    });
    function Q(a) {
      a = {next:a};
      a[Symbol.iterator] = function() {
        return this;
      };
      return a;
    }
    var R = "function" == typeof Object.assign ? Object.assign : function(a, b) {
      for (var d = 1; d < arguments.length; d++) {
        var c = arguments[d];
        if (c) {
          for (var g in c) {
            Object.prototype.hasOwnProperty.call(c, g) && (a[g] = c[g]);
          }
        }
      }
      return a;
    };
    x("Object.assign", function(a) {
      return a || R;
    });
    x("Promise", function(a) {
      function b(e) {
        this.b = 0;
        this.c = void 0;
        this.a = [];
        this.i = !1;
        var f = this.f();
        try {
          e(f.resolve, f.reject);
        } catch (h) {
          f.reject(h);
        }
      }
      function d() {
        this.a = null;
      }
      function c(e) {
        return e instanceof b ? e : new b(function(f) {
          f(e);
        });
      }
      if (a) {
        return a;
      }
      d.prototype.b = function(e) {
        if (null == this.a) {
          this.a = [];
          var f = this;
          this.c(function() {
            f.g();
          });
        }
        this.a.push(e);
      };
      var g = w.setTimeout;
      d.prototype.c = function(e) {
        g(e, 0);
      };
      d.prototype.g = function() {
        for (; this.a && this.a.length;) {
          var e = this.a;
          this.a = [];
          for (var f = 0; f < e.length; ++f) {
            var h = e[f];
            e[f] = null;
            try {
              h();
            } catch (k) {
              this.f(k);
            }
          }
        }
        this.a = null;
      };
      d.prototype.f = function(e) {
        this.c(function() {
          throw e;
        });
      };
      b.prototype.f = function() {
        function e(k) {
          return function(m) {
            h || (h = !0, k.call(f, m));
          };
        }
        var f = this, h = !1;
        return {resolve:e(this.F), reject:e(this.g)};
      };
      b.prototype.F = function(e) {
        if (e === this) {
          this.g(new TypeError("A Promise cannot resolve to itself"));
        } else if (e instanceof b) {
          this.s(e);
        } else {
          a: switch(typeof e) {
            case "object":
              var f = null != e;
              break a;
            case "function":
              f = !0;
              break a;
            default:
              f = !1;
          }f ? this.D(e) : this.h(e);
        }
      };
      b.prototype.D = function(e) {
        var f = void 0;
        try {
          f = e.then;
        } catch (h) {
          this.g(h);
          return;
        }
        "function" == typeof f ? this.u(f, e) : this.h(e);
      };
      b.prototype.g = function(e) {
        this.l(2, e);
      };
      b.prototype.h = function(e) {
        this.l(1, e);
      };
      b.prototype.l = function(e, f) {
        if (0 != this.b) {
          throw Error("Cannot settle(" + e + ", " + f + "): Promise already settled in state" + this.b);
        }
        this.b = e;
        this.c = f;
        2 === this.b && this.G();
        this.o();
      };
      b.prototype.G = function() {
        var e = this;
        g(function() {
          if (e.C()) {
            var f = w.console;
            "undefined" !== typeof f && f.error(e.c);
          }
        }, 1);
      };
      b.prototype.C = function() {
        if (this.i) {
          return !1;
        }
        var e = w.CustomEvent, f = w.Event, h = w.dispatchEvent;
        if ("undefined" === typeof h) {
          return !0;
        }
        "function" === typeof e ? e = new e("unhandledrejection", {cancelable:!0}) : "function" === typeof f ? e = new f("unhandledrejection", {cancelable:!0}) : (e = w.document.createEvent("CustomEvent"), e.initCustomEvent("unhandledrejection", !1, !0, e));
        e.promise = this;
        e.reason = this.c;
        return h(e);
      };
      b.prototype.o = function() {
        if (null != this.a) {
          for (var e = 0; e < this.a.length; ++e) {
            l.b(this.a[e]);
          }
          this.a = null;
        }
      };
      var l = new d();
      b.prototype.s = function(e) {
        var f = this.f();
        e.j(f.resolve, f.reject);
      };
      b.prototype.u = function(e, f) {
        var h = this.f();
        try {
          e.call(f, h.resolve, h.reject);
        } catch (k) {
          h.reject(k);
        }
      };
      b.prototype.then = function(e, f) {
        function h(p, v) {
          return "function" == typeof p ? function(H) {
            try {
              k(p(H));
            } catch (I) {
              m(I);
            }
          } : v;
        }
        var k, m, J = new b(function(p, v) {
          k = p;
          m = v;
        });
        this.j(h(e, k), h(f, m));
        return J;
      };
      b.prototype["catch"] = function(e) {
        return this.then(void 0, e);
      };
      b.prototype.j = function(e, f) {
        function h() {
          switch(k.b) {
            case 1:
              e(k.c);
              break;
            case 2:
              f(k.c);
              break;
            default:
              throw Error("Unexpected state: " + k.b);
          }
        }
        var k = this;
        null == this.a ? l.b(h) : this.a.push(h);
        this.i = !0;
      };
      b.resolve = c;
      b.reject = function(e) {
        return new b(function(f, h) {
          h(e);
        });
      };
      b.race = function(e) {
        return new b(function(f, h) {
          for (var k = q(e), m = k.next(); !m.done; m = k.next()) {
            c(m.value).j(f, h);
          }
        });
      };
      b.all = function(e) {
        var f = q(e), h = f.next();
        return h.done ? c([]) : new b(function(k, m) {
          function J(H) {
            return function(I) {
              p[H] = I;
              v--;
              0 == v && k(p);
            };
          }
          var p = [], v = 0;
          do {
            p.push(void 0), v++, c(h.value).j(J(p.length - 1), m), h = f.next();
          } while (!h.done);
        });
      };
      return b;
    });
    function S(a, b) {
      a instanceof String && (a += "");
      var d = 0, c = !1, g = {next:function() {
        if (!c && d < a.length) {
          var l = d++;
          return {value:b(l, a[l]), done:!1};
        }
        c = !0;
        return {done:!0, value:void 0};
      }};
      g[Symbol.iterator] = function() {
        return g;
      };
      return g;
    }
    x("Array.prototype.keys", function(a) {
      return a ? a : function() {
        return S(this, function(b) {
          return b;
        });
      };
    });
    var T = this || self;
    function U(a, b) {
      a = a.split(".");
      var d = T;
      a[0] in d || "undefined" == typeof d.execScript || d.execScript("var " + a[0]);
      for (var c; a.length && (c = a.shift());) {
        a.length || void 0 === b ? d[c] && d[c] !== Object.prototype[c] ? d = d[c] : d = d[c] = {} : d[c] = b;
      }
    }
    function V(a, b) {
      var d = void 0;
      return new (d || (d = Promise))(function(c, g) {
        function l(h) {
          try {
            f(b.next(h));
          } catch (k) {
            g(k);
          }
        }
        function e(h) {
          try {
            f(b["throw"](h));
          } catch (k) {
            g(k);
          }
        }
        function f(h) {
          h.done ? c(h.value) : (new d(function(k) {
            k(h.value);
          })).then(l, e);
        }
        f((b = b.apply(a, void 0)).next());
      });
    }
    function aa(a, b) {
      return b + a;
    }
    function W(a, b) {
      window[a] = b;
    }
    function ba(a) {
      var b = document.createElement("script");
      b.setAttribute("src", a);
      b.setAttribute("crossorigin", "anonymous");
      document.body.appendChild(b);
      return new Promise(function(d) {
        b.addEventListener("load", function() {
          d();
        }, !1);
      });
    }
    function X(a, b, d) {
      this.graph = a;
      this.locateFile = b;
      this.m = d;
    }
    X.prototype.toArrayBuffer = function() {
      return V(this, function b() {
        var d = this, c;
        return P(b, function(g) {
          return 1 == g.a ? (d.graph.url ? g = G(g, fetch(d.locateFile(d.graph.url, d.m)), 3) : (g.a = 2, g = void 0), g) : 2 != g.a && (c = g.g, c.body) ? g["return"](c.arrayBuffer()) : g["return"](new ArrayBuffer(0));
        });
      });
    };
    function Y(a) {
      this.b = a;
      this.g = this.i = !0;
      this.locateFile = a && a.locateFile || aa;
      if ("object" === typeof window) {
        a = window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/";
      } else if ("undefined" !== typeof location) {
        a = location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/";
      } else {
        throw Error("solutions can only be loaded on a web page or in a web worker");
      }
      this.m = a;
    }
    Y.prototype.close = function() {
      this.a && this.a["delete"]();
      return Promise.resolve();
    };
    function ca(a) {
      return V(a, function d() {
        var c = this, g, l, e, f, h;
        return P(d, function(k) {
          switch(k.a) {
            case 1:
              g = c;
              if (!c.i) {
                return k["return"]();
              }
              W("createMediapipeSolutionsWasm", {locateFile:c.locateFile});
              W("createMediapipeSolutionsPackedAssets", {locateFile:c.locateFile});
              l = c.b.files || [];
              return G(k, Promise.all(l.map(function(m) {
                return ba(g.locateFile(m, g.m));
              })), 2);
            case 2:
              return e = window.createMediapipeSolutionsWasm, f = window.createMediapipeSolutionsPackedAssets, G(k, e(f), 3);
            case 3:
              return c.c = k.g, c.f = document.createElement("canvas"), c.c.canvas = c.f, c.c.createContext(c.f, !0, !0, {}), c.a = new c.c.SolutionWasm(), h = new X(c.b.graph, c.locateFile, c.m), G(k, c.loadGraph(h), 4);
            case 4:
              c.i = !1, k.a = 0;
          }
        });
      });
    }
    Y.prototype.setOptions = function(a) {
      if (this.b.options) {
        for (var b = [], d = q(Object.keys(a)), c = d.next(); !c.done; c = d.next()) {
          var g = c.value;
          (c = this.b.options[g]) && c.graphOptionXref && (g = {valueNumber:0 === c.type ? a[g] : void 0}, c = Object.assign(Object.assign({}, c.graphOptionXref), g), b.push(c));
        }
        0 !== b.length && (this.g = !0, this.h = b);
      }
    };
    function da(a) {
      return V(a, function d() {
        var c = this, g, l, e, f, h;
        return P(d, function(k) {
          if (!c.g) {
            return k["return"]();
          }
          c.a.bindTextureToCanvas();
          g = c.f.getContext("webgl2");
          if (!g) {
            return alert("Failed to create WebGL canvas context when passing video frame."), k["return"]();
          }
          c.l = g;
          if (c.h) {
            l = new c.c.GraphOptionChangeRequestList();
            e = q(c.h);
            for (f = e.next(); !f.done; f = e.next()) {
              h = f.value, l.push_back(h);
            }
            c.a.changeOptions(l);
            l["delete"]();
            c.h = void 0;
          }
          if (c.b.onRegisterListeners) {
            c.b.onRegisterListeners(c.o.bind(c));
          }
          c.g = !1;
          k.a = 0;
        });
      });
    }
    Y.prototype.initialize = function() {
      return V(this, function b() {
        var d = this;
        return P(b, function(c) {
          return 1 == c.a ? G(c, ca(d), 2) : G(c, da(d), 0);
        });
      });
    };
    Y.prototype.loadGraph = function(a) {
      return V(this, function d() {
        var c, g = this;
        return P(d, function(l) {
          if (1 == l.a) {
            return G(l, a.toArrayBuffer(), 2);
          }
          c = l.g;
          g.a.loadGraph(c);
          l.a = 0;
        });
      });
    };
    Y.prototype.processFrame = function(a, b, d) {
      return V(this, function g() {
        var l = this, e;
        return P(g, function(f) {
          if (1 == f.a) {
            return G(f, l.initialize(), 2);
          }
          e = l.l;
          l.a.bindTextureToCanvas();
          e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, d.video);
          l.a.processFrame(a, {width:d.video.videoWidth, height:d.video.videoHeight, timestampMs:performance.now()});
          f.a = 0;
        });
      });
    };
    Y.prototype.o = function(a, b) {
      for (var d = (a instanceof Array ? a : r(q(a))).concat(), c = new this.c.StringList(), g = q(a), l = g.next(); !l.done; l = g.next()) {
        c.push_back(l.value);
      }
      g = this.c.PacketListener.implement({onResults:function(e) {
        for (var f = {}, h = 0; h < a.length; ++h) {
          var k = d[h];
          var m = e.get(h);
          m = m.isNumber() ? m.getNumber() : m.isRect() ? m.getRect() : m.isLandmarks() ? m.getLandmarks() : void 0;
          f[k] = m;
        }
        b(f);
      }});
      this.a.attachMultiListener(c, g);
      c["delete"]();
    };
    U("Solution", Y);
    function Z(a) {
      var b = this;
      a = a || {};
      this.a = new Y({locateFile:a.locateFile, files:["pose_tracking_solution_packed_assets_loader.js", "pose_tracking_solution_wasm_bin.js"], graph:{url:"pose_web.binarypb"}, onRegisterListeners:function(d) {
        d(["pose_landmarks", "pose_rect"], function(c) {
          b.b && b.b({pose:{landmarks:c.pose_landmarks, rect:c.pose_rect}});
        });
      }, options:{poseThreshold:{type:0, graphOptionXref:{calculatorType:"ThresholdingCalculator", calculatorIndex:1, fieldName:"threshold"}}}});
    }
    Z.prototype.close = function() {
      this.a.close();
      return Promise.resolve();
    };
    Z.prototype.onResults = function(a) {
      this.b = a;
    };
    Z.prototype.initialize = function() {
      return V(this, function b() {
        var d = this;
        return P(b, function(c) {
          return G(c, d.a.initialize(), 0);
        });
      });
    };
    Z.prototype.send = function(a) {
      return V(this, function d() {
        var c, g = this;
        return P(d, function(l) {
          if (a.video) {
            return c = a.video, G(l, g.a.processFrame("input_frames_gpu", {height:c.videoHeight, width:c.videoWidth, timestampMs:performance.now()}, {video:c}), 0);
          }
          l.a = 0;
        });
      });
    };
    Z.prototype.setOptions = function(a) {
      this.a.setOptions(a);
    };
    U("LANDMARK_CONNECTIONS", [[0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19], [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], [11, 23], [12, 24], [23, 24]]);
    U("PoseSolution", Z);
  }).call(this);