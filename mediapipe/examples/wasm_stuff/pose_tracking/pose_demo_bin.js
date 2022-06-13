(function() {
    function k(a) {
      var b = 0;
      return function() {
        return b < a.length ? {done:!1, value:a[b++]} : {done:!0};
      };
    }
    function n(a) {
      var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
      return b ? b.call(a) : {next:k(a)};
    }
    var r = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, d) {
      if (a == Array.prototype || a == Object.prototype) {
        return a;
      }
      a[b] = d.value;
      return a;
    };
    function t(a) {
      a = ["object" == typeof globalThis && globalThis, a, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global];
      for (var b = 0; b < a.length; ++b) {
        var d = a[b];
        if (d && d.Math == Math) {
          return d;
        }
      }
      throw Error("Cannot find global object");
    }
    var v = t(this);
    function w(a, b) {
      if (b) {
        a: {
          var d = v;
          a = a.split(".");
          for (var f = 0; f < a.length - 1; f++) {
            var h = a[f];
            if (!(h in d)) {
              break a;
            }
            d = d[h];
          }
          a = a[a.length - 1];
          f = d[a];
          b = b(f);
          b != f && null != b && r(d, a, {configurable:!0, writable:!0, value:b});
        }
      }
    }
    var x;
    if ("function" == typeof Object.setPrototypeOf) {
      x = Object.setPrototypeOf;
    } else {
      var y;
      a: {
        var z = {s:!0}, A = {};
        try {
          A.__proto__ = z;
          y = A.s;
          break a;
        } catch (a) {
        }
        y = !1;
      }
      x = y ? function(a, b) {
        a.__proto__ = b;
        if (a.__proto__ !== b) {
          throw new TypeError(a + " is not extensible");
        }
        return a;
      } : null;
    }
    var B = x;
    function C() {
      this.c = !1;
      this.a = null;
      this.i = void 0;
      this.f = 1;
      this.h = 0;
      this.b = null;
    }
    function D(a) {
      if (a.c) {
        throw new TypeError("Generator is already running");
      }
      a.c = !0;
    }
    C.prototype.g = function(a) {
      this.i = a;
    };
    function H(a, b) {
      a.b = {u:b, v:!0};
      a.f = a.h;
    }
    C.prototype["return"] = function(a) {
      this.b = {"return":a};
      this.f = this.h;
    };
    function I(a) {
      this.a = new C();
      this.b = a;
    }
    function J(a, b) {
      D(a.a);
      var d = a.a.a;
      if (d) {
        return K(a, "return" in d ? d["return"] : function(f) {
          return {value:f, done:!0};
        }, b, a.a["return"]);
      }
      a.a["return"](b);
      return L(a);
    }
    function K(a, b, d, f) {
      try {
        var h = b.call(a.a.a, d);
        if (!(h instanceof Object)) {
          throw new TypeError("Iterator result " + h + " is not an object");
        }
        if (!h.done) {
          return a.a.c = !1, h;
        }
        var m = h.value;
      } catch (c) {
        return a.a.a = null, H(a.a, c), L(a);
      }
      a.a.a = null;
      f.call(a.a, m);
      return L(a);
    }
    function L(a) {
      for (; a.a.f;) {
        try {
          var b = a.b(a.a);
          if (b) {
            return a.a.c = !1, {value:b.value, done:!1};
          }
        } catch (d) {
          a.a.i = void 0, H(a.a, d);
        }
      }
      a.a.c = !1;
      if (a.a.b) {
        b = a.a.b;
        a.a.b = null;
        if (b.v) {
          throw b.u;
        }
        return {value:b["return"], done:!0};
      }
      return {value:void 0, done:!0};
    }
    function M(a) {
      this.next = function(b) {
        D(a.a);
        a.a.a ? b = K(a, a.a.a.next, b, a.a.g) : (a.a.g(b), b = L(a));
        return b;
      };
      this["throw"] = function(b) {
        D(a.a);
        a.a.a ? b = K(a, a.a.a["throw"], b, a.a.g) : (H(a.a, b), b = L(a));
        return b;
      };
      this["return"] = function(b) {
        return J(a, b);
      };
      this[Symbol.iterator] = function() {
        return this;
      };
    }
    function N(a, b) {
      b = new M(new I(b));
      B && a.prototype && B(b, a.prototype);
      return b;
    }
    w("Symbol", function(a) {
      function b(h) {
        if (this instanceof b) {
          throw new TypeError("Symbol is not a constructor");
        }
        return new d("jscomp_symbol_" + (h || "") + "_" + f++, h);
      }
      function d(h, m) {
        this.a = h;
        r(this, "description", {configurable:!0, writable:!0, value:m});
      }
      if (a) {
        return a;
      }
      d.prototype.toString = function() {
        return this.a;
      };
      var f = 0;
      return b;
    });
    w("Symbol.iterator", function(a) {
      if (a) {
        return a;
      }
      a = Symbol("Symbol.iterator");
      for (var b = "Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "), d = 0; d < b.length; d++) {
        var f = v[b[d]];
        "function" === typeof f && "function" != typeof f.prototype[a] && r(f.prototype, a, {configurable:!0, writable:!0, value:function() {
          return O(k(this));
        }});
      }
      return a;
    });
    function O(a) {
      a = {next:a};
      a[Symbol.iterator] = function() {
        return this;
      };
      return a;
    }
    w("Promise", function(a) {
      function b(c) {
        this.b = 0;
        this.c = void 0;
        this.a = [];
        this.i = !1;
        var e = this.f();
        try {
          c(e.resolve, e.reject);
        } catch (g) {
          e.reject(g);
        }
      }
      function d() {
        this.a = null;
      }
      function f(c) {
        return c instanceof b ? c : new b(function(e) {
          e(c);
        });
      }
      if (a) {
        return a;
      }
      d.prototype.b = function(c) {
        if (null == this.a) {
          this.a = [];
          var e = this;
          this.c(function() {
            e.g();
          });
        }
        this.a.push(c);
      };
      var h = v.setTimeout;
      d.prototype.c = function(c) {
        h(c, 0);
      };
      d.prototype.g = function() {
        for (; this.a && this.a.length;) {
          var c = this.a;
          this.a = [];
          for (var e = 0; e < c.length; ++e) {
            var g = c[e];
            c[e] = null;
            try {
              g();
            } catch (l) {
              this.f(l);
            }
          }
        }
        this.a = null;
      };
      d.prototype.f = function(c) {
        this.c(function() {
          throw c;
        });
      };
      b.prototype.f = function() {
        function c(l) {
          return function(p) {
            g || (g = !0, l.call(e, p));
          };
        }
        var e = this, g = !1;
        return {resolve:c(this.D), reject:c(this.g)};
      };
      b.prototype.D = function(c) {
        if (c === this) {
          this.g(new TypeError("A Promise cannot resolve to itself"));
        } else if (c instanceof b) {
          this.m(c);
        } else {
          a: switch(typeof c) {
            case "object":
              var e = null != c;
              break a;
            case "function":
              e = !0;
              break a;
            default:
              e = !1;
          }e ? this.C(c) : this.h(c);
        }
      };
      b.prototype.C = function(c) {
        var e = void 0;
        try {
          e = c.then;
        } catch (g) {
          this.g(g);
          return;
        }
        "function" == typeof e ? this.o(e, c) : this.h(c);
      };
      b.prototype.g = function(c) {
        this.l(2, c);
      };
      b.prototype.h = function(c) {
        this.l(1, c);
      };
      b.prototype.l = function(c, e) {
        if (0 != this.b) {
          throw Error("Cannot settle(" + c + ", " + e + "): Promise already settled in state" + this.b);
        }
        this.b = c;
        this.c = e;
        2 === this.b && this.F();
        this.A();
      };
      b.prototype.F = function() {
        var c = this;
        h(function() {
          if (c.B()) {
            var e = v.console;
            "undefined" !== typeof e && e.error(c.c);
          }
        }, 1);
      };
      b.prototype.B = function() {
        if (this.i) {
          return !1;
        }
        var c = v.CustomEvent, e = v.Event, g = v.dispatchEvent;
        if ("undefined" === typeof g) {
          return !0;
        }
        "function" === typeof c ? c = new c("unhandledrejection", {cancelable:!0}) : "function" === typeof e ? c = new e("unhandledrejection", {cancelable:!0}) : (c = v.document.createEvent("CustomEvent"), c.initCustomEvent("unhandledrejection", !1, !0, c));
        c.promise = this;
        c.reason = this.c;
        return g(c);
      };
      b.prototype.A = function() {
        if (null != this.a) {
          for (var c = 0; c < this.a.length; ++c) {
            m.b(this.a[c]);
          }
          this.a = null;
        }
      };
      var m = new d();
      b.prototype.m = function(c) {
        var e = this.f();
        c.j(e.resolve, e.reject);
      };
      b.prototype.o = function(c, e) {
        var g = this.f();
        try {
          c.call(e, g.resolve, g.reject);
        } catch (l) {
          g.reject(l);
        }
      };
      b.prototype.then = function(c, e) {
        function g(q, u) {
          return "function" == typeof q ? function(E) {
            try {
              l(q(E));
            } catch (F) {
              p(F);
            }
          } : u;
        }
        var l, p, G = new b(function(q, u) {
          l = q;
          p = u;
        });
        this.j(g(c, l), g(e, p));
        return G;
      };
      b.prototype["catch"] = function(c) {
        return this.then(void 0, c);
      };
      b.prototype.j = function(c, e) {
        function g() {
          switch(l.b) {
            case 1:
              c(l.c);
              break;
            case 2:
              e(l.c);
              break;
            default:
              throw Error("Unexpected state: " + l.b);
          }
        }
        var l = this;
        null == this.a ? m.b(g) : this.a.push(g);
        this.i = !0;
      };
      b.resolve = f;
      b.reject = function(c) {
        return new b(function(e, g) {
          g(c);
        });
      };
      b.race = function(c) {
        return new b(function(e, g) {
          for (var l = n(c), p = l.next(); !p.done; p = l.next()) {
            f(p.value).j(e, g);
          }
        });
      };
      b.all = function(c) {
        var e = n(c), g = e.next();
        return g.done ? f([]) : new b(function(l, p) {
          function G(E) {
            return function(F) {
              q[E] = F;
              u--;
              0 == u && l(q);
            };
          }
          var q = [], u = 0;
          do {
            q.push(void 0), u++, f(g.value).j(G(q.length - 1), p), g = e.next();
          } while (!g.done);
        });
      };
      return b;
    });
    w("Array.prototype.fill", function(a) {
      return a ? a : function(b, d, f) {
        var h = this.length || 0;
        0 > d && (d = Math.max(0, h + d));
        if (null == f || f > h) {
          f = h;
        }
        f = Number(f);
        0 > f && (f = Math.max(0, h + f));
        for (d = Number(d || 0); d < f; d++) {
          this[d] = b;
        }
        return this;
      };
    });
    function P(a) {
      return a ? a : Array.prototype.fill;
    }
    w("Int8Array.prototype.fill", P);
    w("Uint8Array.prototype.fill", P);
    w("Uint8ClampedArray.prototype.fill", P);
    w("Int16Array.prototype.fill", P);
    w("Uint16Array.prototype.fill", P);
    w("Int32Array.prototype.fill", P);
    w("Uint32Array.prototype.fill", P);
    w("Float32Array.prototype.fill", P);
    w("Float64Array.prototype.fill", P);
    function Q(a) {
      var b = void 0;
      return new (b || (b = Promise))(function(d, f) {
        function h(e) {
          try {
            c(a.next(e));
          } catch (g) {
            f(g);
          }
        }
        function m(e) {
          try {
            c(a["throw"](e));
          } catch (g) {
            f(g);
          }
        }
        function c(e) {
          e.done ? d(e.value) : (new b(function(g) {
            g(e.value);
          })).then(h, m);
        }
        c((a = a.apply(void 0, void 0)).next());
      });
    }
    var R = window.MediaPipeCamera;
    var S = 2 * Math.PI;
    var aa = window.PoseSolution, ba = window.LANDMARK_CONNECTIONS;
    var T = document.getElementById("video"), U = document.getElementById("canvas"), V = U.getContext("2d"), W = new aa();
    W.onResults(function(a) {
      if (a.pose) {
        var b = a.pose.landmarks;
        a = a.pose.rect;
        V.save();
        V.clearRect(0, 0, U.width, U.height);
        V.save();
        var d = V.canvas;
        V.scale(d.width, d.height);
        V.strokeStyle = "#00FF00";
        V.lineWidth = 4 / d.width;
        d = n(ba);
        for (var f = d.next(); !f.done; f = d.next()) {
          var h = f.value;
          V.beginPath();
          f = b.get(h[0]);
          h = b.get(h[1]);
          V.moveTo(f.x, f.y);
          V.lineTo(h.x, h.y);
          V.stroke();
        }
        V.restore();
        V.save();
        d = V.canvas;
        V.scale(d.width, d.height);
        V.fillStyle = "#FF0000";
        for (f = 0; f < b.size(); ++f) {
          h = b.get(f);
          var m = new Path2D();
          m.arc(h.x, h.y, 2 / d.width, 0, S);
          V.fill(m);
        }
        V.restore();
        b = a.xCenter;
        d = a.yCenter;
        f = a.width;
        h = a.height;
        a = a.rotation;
        V.save();
        m = V.canvas;
        V.scale(m.width, m.height);
        V.fillStyle = "#0000FF30";
        V.translate(b + f / 2, d + f / 2);
        V.rotate(a * Math.PI / 180);
        V.fillRect(-f / 2, -h / 2, f, h);
        V.restore();
        V.restore();
      }
    });
    (new R({video:T, onFrame:function() {
      return Q(function b() {
        return N(b, function(d) {
          var f = W.send({video:T});
          d.f = 0;
          return {value:f};
        });
      });
    }})).start();
    var X = [.2, .8, 10], Y = 0;
    function Z() {
      setTimeout(function() {
        var a = X[Y];
        console.log("switching threshold to " + a);
        W.setOptions({poseThreshold:a});
        Y = (Y + 1) % X.length;
        Z();
      }, 1E4);
    }
    Z();
  }).call(this);
  