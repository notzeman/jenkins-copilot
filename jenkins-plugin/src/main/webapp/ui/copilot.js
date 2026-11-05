// \0rolldown/runtime.js
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (t || (e((t = { exports: {} }).exports, t, t.exports), e = null), t.exports), s = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, c = (n, r, o) => (o = n == null ? {} : e(i(n)), s(r || !n || !n.__esModule || !a.call(n, "default") ? t(o, "default", {
	value: n,
	enumerable: !0
}) : o, n)), l = /* @__PURE__ */ o(((e) => {
	function t(e, t) {
		var n = e.length;
		e.push(t);
		a: for (; 0 < n;) {
			var r = n - 1 >>> 1, a = e[r];
			if (0 < i(a, t)) e[r] = t, e[n] = a, n = r;
			else break a;
		}
	}
	function n(e) {
		return e.length === 0 ? null : e[0];
	}
	function r(e) {
		if (e.length === 0) return null;
		var t = e[0], n = e.pop();
		if (n !== t) {
			e[0] = n;
			a: for (var r = 0, a = e.length, o = a >>> 1; r < o;) {
				var s = 2 * (r + 1) - 1, c = e[s], l = s + 1, u = e[l];
				if (0 > i(c, n)) l < a && 0 > i(u, c) ? (e[r] = u, e[l] = n, r = l) : (e[r] = c, e[s] = n, r = s);
				else if (l < a && 0 > i(u, n)) e[r] = u, e[l] = n, r = l;
				else break a;
			}
		}
		return t;
	}
	function i(e, t) {
		var n = e.sortIndex - t.sortIndex;
		return n === 0 ? e.id - t.id : n;
	}
	if (e.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
		var a = performance;
		e.unstable_now = function() {
			return a.now();
		};
	} else {
		var o = Date, s = o.now();
		e.unstable_now = function() {
			return o.now() - s;
		};
	}
	var c = [], l = [], u = 1, d = null, f = 3, p = !1, m = !1, h = !1, g = !1, _ = typeof setTimeout == "function" ? setTimeout : null, v = typeof clearTimeout == "function" ? clearTimeout : null, y = typeof setImmediate < "u" ? setImmediate : null;
	function b(e) {
		for (var i = n(l); i !== null;) {
			if (i.callback === null) r(l);
			else if (i.startTime <= e) r(l), i.sortIndex = i.expirationTime, t(c, i);
			else break;
			i = n(l);
		}
	}
	function x(e) {
		if (h = !1, b(e), !m) {
			if (n(c) !== null) m = !0, S || (S = !0, te());
			else {
				var t = n(l);
				t !== null && re(x, t.startTime - e);
			}
		}
	}
	var S = !1, C = -1, w = 5, T = -1;
	function ee() {
		return g ? !0 : !(e.unstable_now() - T < w);
	}
	function E() {
		if (g = !1, S) {
			var t = e.unstable_now();
			T = t;
			var i = !0;
			try {
				a: {
					m = !1, h && (h = !1, v(C), C = -1), p = !0;
					var a = f;
					try {
						b: {
							for (b(t), d = n(c); d !== null && !(d.expirationTime > t && ee());) {
								var o = d.callback;
								if (typeof o == "function") {
									d.callback = null, f = d.priorityLevel;
									var s = o(d.expirationTime <= t);
									if (t = e.unstable_now(), typeof s == "function") {
										d.callback = s, b(t), i = !0;
										break b;
									}
									d === n(c) && r(c), b(t);
								} else r(c);
								d = n(c);
							}
							if (d !== null) i = !0;
							else {
								var u = n(l);
								u !== null && re(x, u.startTime - t), i = !1;
							}
						}
						break a;
					} finally {
						d = null, f = a, p = !1;
					}
					i = void 0;
				}
			} finally {
				i ? te() : S = !1;
			}
		}
	}
	var te;
	if (typeof y == "function") te = function() {
		y(E);
	};
	else if (typeof MessageChannel < "u") {
		var ne = new MessageChannel(), D = ne.port2;
		ne.port1.onmessage = E, te = function() {
			D.postMessage(null);
		};
	} else te = function() {
		_(E, 0);
	};
	function re(t, n) {
		C = _(function() {
			t(e.unstable_now());
		}, n);
	}
	e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(e) {
		e.callback = null;
	}, e.unstable_forceFrameRate = function(e) {
		0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : w = 0 < e ? Math.floor(1e3 / e) : 5;
	}, e.unstable_getCurrentPriorityLevel = function() {
		return f;
	}, e.unstable_next = function(e) {
		switch (f) {
			case 1:
			case 2:
			case 3:
				var t = 3;
				break;
			default: t = f;
		}
		var n = f;
		f = t;
		try {
			return e();
		} finally {
			f = n;
		}
	}, e.unstable_requestPaint = function() {
		g = !0;
	}, e.unstable_runWithPriority = function(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: e = 3;
		}
		var n = f;
		f = e;
		try {
			return t();
		} finally {
			f = n;
		}
	}, e.unstable_scheduleCallback = function(r, i, a) {
		var o = e.unstable_now();
		switch (typeof a == "object" && a ? (a = a.delay, a = typeof a == "number" && 0 < a ? o + a : o) : a = o, r) {
			case 1:
				var s = -1;
				break;
			case 2:
				s = 250;
				break;
			case 5:
				s = 1073741823;
				break;
			case 4:
				s = 1e4;
				break;
			default: s = 5e3;
		}
		return s = a + s, r = {
			id: u++,
			callback: i,
			priorityLevel: r,
			startTime: a,
			expirationTime: s,
			sortIndex: -1
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(C), C = -1) : h = !0, re(x, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, S || (S = !0, te()))), r;
	}, e.unstable_shouldYield = ee, e.unstable_wrapCallback = function(e) {
		var t = f;
		return function() {
			var n = f;
			f = t;
			try {
				return e.apply(this, arguments);
			} finally {
				f = n;
			}
		};
	};
})), u = /* @__PURE__ */ o(((e, t) => {
	t.exports = l();
})), d = /* @__PURE__ */ o(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.for("react.view_transition"), m = Symbol.iterator;
	function h(e) {
		return typeof e != "object" || !e ? null : (e = m && e[m] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var g = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, _ = Object.assign, v = {};
	function y(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	y.prototype.isReactComponent = {}, y.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, y.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function b() {}
	b.prototype = y.prototype;
	function x(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	var S = x.prototype = new b();
	S.constructor = x, _(S, y.prototype), S.isPureReactComponent = !0;
	var C = Array.isArray;
	function w() {}
	var T = {
		H: null,
		A: null,
		T: null,
		S: null
	}, ee = Object.prototype.hasOwnProperty;
	function E(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function te(e, t) {
		return E(e.type, t, e.props);
	}
	function ne(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function D(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var re = /\/+/g;
	function O(e, t) {
		return typeof e == "object" && e && e.key != null ? D("" + e.key) : t.toString(36);
	}
	function ie(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(w, w) : (e.status = "pending", e.then(function(t) {
				e.status === "pending" && (e.status = "fulfilled", e.value = t);
			}, function(t) {
				e.status === "pending" && (e.status = "rejected", e.reason = t);
			})), e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
			}
		}
		throw e;
	}
	function k(e, r, i, a, o) {
		var s = typeof e;
		(s === "undefined" || s === "boolean") && (e = null);
		var c = !1;
		if (e === null) c = !0;
		else switch (s) {
			case "bigint":
			case "string":
			case "number":
				c = !0;
				break;
			case "object": switch (e.$$typeof) {
				case t:
				case n:
					c = !0;
					break;
				case d: return c = e._init, k(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + O(e, 0) : a, C(o) ? (i = "", c != null && (i = c.replace(re, "$&/") + "/"), k(o, r, i, "", function(e) {
			return e;
		})) : o != null && (ne(o) && (o = te(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(re, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (C(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + O(a, u), c += k(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + O(a, u++), c += k(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return k(ie(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function ae(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return k(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function A(e) {
		if (e._status === -1) {
			var t = e._result, n = t();
			n.then(function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 1, e._result = t, n.status === void 0 && (n.status = "fulfilled", n.value = t));
			}, function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 2, e._result = t, n.status === void 0 && (n.status = "rejected", n.reason = t));
			}), e._status === -1 && (e._status = 0, e._result = n);
		}
		if (e._status === 1) return e._result.default;
		throw e._result;
	}
	var oe = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	};
	function se(e) {
		var t = T.T, n = {};
		n.types = t === null ? null : t.types, T.T = n;
		try {
			var r = e(), i = T.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(w, oe);
		} catch (e) {
			oe(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), T.T = t;
		}
	}
	function ce(e) {
		var t = T.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else se(ce.bind(null, e));
	}
	var le = {
		map: ae,
		forEach: function(e, t, n) {
			ae(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return ae(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return ae(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!ne(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = le, e.Component = y, e.Fragment = r, e.Profiler = a, e.PureComponent = x, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = T, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return T.H.useMemoCache(e);
		}
	}, e.addTransitionType = ce, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = _({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !ee.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return E(e.type, i, r);
	}, e.createContext = function(e) {
		return e = {
			$$typeof: s,
			_currentValue: e,
			_currentValue2: e,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		}, e.Provider = e, e.Consumer = {
			$$typeof: o,
			_context: e
		}, e;
	}, e.createElement = function(e, t, n) {
		var r, i = {}, a = null;
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) ee.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return E(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = ne, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: A
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = se, e.unstable_useCacheRefresh = function() {
		return T.H.useCacheRefresh();
	}, e.use = function(e) {
		return T.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return T.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return T.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return T.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return T.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return T.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return T.H.useEffectEvent(e);
	}, e.useId = function() {
		return T.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return T.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return T.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return T.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return T.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return T.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return T.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return T.H.useRef(e);
	}, e.useState = function(e) {
		return T.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return T.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return T.H.useTransition();
	}, e.version = "19.3.1";
})), f = /* @__PURE__ */ o(((e, t) => {
	t.exports = d();
})), p = /* @__PURE__ */ o(((e) => {
	var t = f();
	function n(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function r() {}
	var i = {
		d: {
			f: r,
			r: function() {
				throw Error(n(522));
			},
			D: r,
			C: r,
			L: r,
			m: r,
			X: r,
			S: r,
			M: r
		},
		p: 0,
		findDOMNode: null
	}, a = Symbol.for("react.portal"), o = Symbol.for("react.recoverable"), s = Symbol.for("react.optimistic_key");
	function c(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: a,
			key: r == null ? null : r === s ? s : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	var l = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function u(e, t) {
		if (e === "font") return "";
		if (typeof t == "string") return t === "use-credentials" ? t : "";
	}
	e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = i, e.browser = function(e) {
		return {
			$$typeof: o,
			_reason: e
		};
	}, e.createPortal = function(e, t) {
		var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error(n(299));
		return c(e, t, null, r);
	}, e.flushSync = function(e) {
		var t = l.T, n = i.p;
		try {
			if (l.T = null, i.p = 2, e) return e();
		} finally {
			l.T = t, i.p = n, i.d.f();
		}
	}, e.preconnect = function(e, t) {
		typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, i.d.C(e, t));
	}, e.prefetchDNS = function(e) {
		typeof e == "string" && i.d.D(e);
	}, e.preinit = function(e, t) {
		if (typeof e == "string" && t && typeof t.as == "string") {
			var n = t.as, r = u(n, t.crossOrigin), a = typeof t.integrity == "string" ? t.integrity : void 0, o = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
			n === "style" ? i.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o
			}) : n === "script" && i.d.X(e, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0
			});
		}
	}, e.preinitModule = function(e, t) {
		if (typeof e == "string") {
			if (typeof t == "object" && t) {
				if (t.as == null || t.as === "script") {
					var n = u(t.as, t.crossOrigin);
					i.d.M(e, {
						crossOrigin: n,
						integrity: typeof t.integrity == "string" ? t.integrity : void 0,
						nonce: typeof t.nonce == "string" ? t.nonce : void 0,
						fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
					});
				}
			} else t ?? i.d.M(e);
		}
	}, e.preload = function(e, t) {
		if (typeof e == "string" && typeof t == "object" && t && typeof t.as == "string") {
			var n = t.as, r = u(n, t.crossOrigin);
			i.d.L(e, n, {
				crossOrigin: r,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0,
				type: typeof t.type == "string" ? t.type : void 0,
				fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
				referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
				imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
				imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
				media: typeof t.media == "string" ? t.media : void 0
			});
		}
	}, e.preloadModule = function(e, t) {
		if (typeof e == "string") {
			if (t) {
				var n = u(t.as, t.crossOrigin);
				i.d.m(e, {
					as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
					crossOrigin: n,
					integrity: typeof t.integrity == "string" ? t.integrity : void 0,
					nonce: typeof t.nonce == "string" ? t.nonce : void 0,
					fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
				});
			} else i.d.m(e);
		}
	}, e.requestFormReset = function(e) {
		i.d.r(e);
	}, e.unstable_batchedUpdates = function(e, t) {
		return e(t);
	}, e.useFormState = function(e, t, n) {
		return l.H.useFormState(e, t, n);
	}, e.useFormStatus = function() {
		return l.H.useHostTransitionStatus();
	}, e.version = "19.3.1";
})), m = /* @__PURE__ */ o(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = p();
})), h = /* @__PURE__ */ o(((e) => {
	var t = u(), n = f(), r = m();
	function i(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function a(e) {
		return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
	}
	function o(e) {
		for (var t = e, n = t; n && !n.alternate;) t = n, t.flags & 4098 && (e = t.return), n = t.return;
		for (; t.return;) t = t.return;
		return t.tag === 3 ? e : null;
	}
	function s(e) {
		if (e.tag === 13) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function c(e) {
		if (e.tag === 31) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function l(e) {
		if (o(e) !== e) throw Error(i(188));
	}
	function d(e) {
		var t = e.alternate;
		if (!t) {
			if (t = o(e), t === null) throw Error(i(188));
			return t === e ? e : null;
		}
		for (var n = e, r = t;;) {
			var a = n.return;
			if (a === null) break;
			var s = a.alternate;
			if (s === null) {
				if (r = a.return, r !== null) {
					n = r;
					continue;
				}
				break;
			}
			if (a.child === s.child) {
				for (s = a.child; s;) {
					if (s === n) return l(a), e;
					if (s === r) return l(a), t;
					s = s.sibling;
				}
				throw Error(i(188));
			}
			if (n.return !== r.return) n = a, r = s;
			else {
				for (var c = !1, u = a.child; u;) {
					if (u === n) {
						c = !0, n = a, r = s;
						break;
					}
					if (u === r) {
						c = !0, r = a, n = s;
						break;
					}
					u = u.sibling;
				}
				if (!c) {
					for (u = s.child; u;) {
						if (u === n) {
							c = !0, n = s, r = a;
							break;
						}
						if (u === r) {
							c = !0, r = s, n = a;
							break;
						}
						u = u.sibling;
					}
					if (!c) throw Error(i(189));
				}
			}
			if (n.alternate !== r) throw Error(i(190));
		}
		if (n.tag !== 3) throw Error(i(188));
		return n.stateNode.current === n ? e : t;
	}
	function p(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e;
		for (e = e.child; e !== null;) {
			if (t = p(e), t !== null) return t;
			e = e.sibling;
		}
		return null;
	}
	function h(e, t, n, r, i, a) {
		for (; e !== null;) {
			if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && n(e, r, i, a) || (e.tag !== 22 || e.memoizedState === null) && (t || e.tag !== 5 && e.tag !== 27) && h(e.child, t, n, r, i, a)) return !0;
			e = e.sibling;
		}
		return !1;
	}
	function g(e) {
		for (e = e.return; e !== null;) {
			if (e.tag === 3 || e.tag === 5 || e.tag === 27) return e;
			e = e.return;
		}
		return null;
	}
	function _(e) {
		var t = !1;
		for (e = e.return; e !== null && (e.tag === 4 && (t = !0), e.tag !== 3 && e.tag !== 5 && e.tag !== 27);) e = e.return;
		return t;
	}
	function v(e) {
		var t = [null, null], n = g(e);
		return n === null || y(t, e, n.child, { foundSelf: !1 }), t;
	}
	function y(e, t, n, r) {
		for (; n !== null;) {
			if (n === t) r.foundSelf = !0;
			else if (n.tag === 5 || n.tag === 27 || n.tag === 6) {
				if (r.foundSelf) return e[1] = n, !0;
				e[0] = n;
			} else if ((n.tag !== 22 || n.memoizedState === null) && y(e, t, n.child, r)) return !0;
			n = n.sibling;
		}
		return !1;
	}
	function b(e) {
		switch (e.tag) {
			case 5:
			case 27:
			case 6: return e.stateNode;
			case 3: return e.stateNode.containerInfo;
			default: throw Error(i(559));
		}
	}
	var x = null, S = null;
	function C(e, t, n) {
		return e === n || e === t && (x = e, !0);
	}
	function w(e, t, n) {
		return e === n ? (S = e, !1) : e === t && (S !== null && (x = e), !0);
	}
	function T(e) {
		if (e === null) return null;
		do
			e = e === null ? null : e.return;
		while (e && e.tag !== 5 && e.tag !== 27 && e.tag !== 3);
		return e || null;
	}
	function ee(e, t, n) {
		for (var r = 0, i = e; i; i = n(i)) r++;
		i = 0;
		for (var a = t; a; a = n(a)) i++;
		for (; 0 < r - i;) e = n(e), r--;
		for (; 0 < i - r;) t = n(t), i--;
		for (; r--;) {
			if (e === t || t !== null && e === t.alternate) return e;
			e = n(e), t = n(t);
		}
		return null;
	}
	var E = Object.assign, te = Symbol.for("react.element"), ne = Symbol.for("react.transitional.element"), D = Symbol.for("react.portal"), re = Symbol.for("react.fragment"), O = Symbol.for("react.strict_mode"), ie = Symbol.for("react.profiler"), k = Symbol.for("react.consumer"), ae = Symbol.for("react.context"), A = Symbol.for("react.forward_ref"), oe = Symbol.for("react.suspense"), se = Symbol.for("react.suspense_list"), ce = Symbol.for("react.memo"), le = Symbol.for("react.lazy"), ue = Symbol.for("react.activity"), de = Symbol.for("react.legacy_hidden"), fe = Symbol.for("react.memo_cache_sentinel"), pe = Symbol.for("react.view_transition"), me = Symbol.for("react.recoverable"), he = Symbol.iterator;
	function ge(e) {
		return typeof e != "object" || !e ? null : (e = he && e[he] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var _e = Symbol.for("react.client.reference");
	function ve(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === _e ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case re: return "Fragment";
			case ie: return "Profiler";
			case O: return "StrictMode";
			case oe: return "Suspense";
			case se: return "SuspenseList";
			case ue: return "Activity";
			case pe: return "ViewTransition";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case D: return "Portal";
			case ae: return e.displayName || "Context";
			case k: return (e._context.displayName || "Context") + ".Consumer";
			case A:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case ce: return t = e.displayName || null, t === null ? ve(e.type) || "Memo" : t;
			case le:
				t = e._payload, e = e._init;
				try {
					return ve(e(t));
				} catch {}
		}
		return null;
	}
	var ye = Array.isArray, j = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, M = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, be = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, N = [], xe = -1;
	function P(e) {
		return { current: e };
	}
	function Se(e) {
		0 > xe || (e.current = N[xe], N[xe] = null, xe--);
	}
	function F(e, t) {
		xe++, N[xe] = e.current, e.current = t;
	}
	var Ce = P(null), we = P(null), Te = P(null), Ee = P(null);
	function De(e, t) {
		switch (F(Te, t), F(we, e), F(Ce, null), t.nodeType) {
			case 9:
			case 11:
				e = (e = t.documentElement) && (e = e.namespaceURI) ? up(e) : 0;
				break;
			default: if (e = t.tagName, t = t.namespaceURI) t = up(t), e = dp(t, e);
			else switch (e) {
				case "svg":
					e = 1;
					break;
				case "math":
					e = 2;
					break;
				default: e = 0;
			}
		}
		Se(Ce), F(Ce, e);
	}
	function Oe() {
		Se(Ce), Se(we), Se(Te);
	}
	function ke(e) {
		var t = e.memoizedState;
		t !== null && (sh._currentValue = t.memoizedState, F(Ee, e)), t = Ce.current;
		var n = dp(t, e.type);
		t !== n && (F(we, e), F(Ce, n));
	}
	function Ae(e) {
		we.current === e && (Se(Ce), Se(we)), Ee.current === e && (Se(Ee), sh._currentValue = be);
	}
	var je, Me;
	function I(e) {
		if (je === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			je = t && t[1] || "", Me = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + je + e + Me;
	}
	var L = !1;
	function Ne(e, t) {
		if (!e || L) return "";
		L = !0;
		var n = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var r = { DetermineComponentFrameRoot: function() {
				try {
					if (t) {
						var n = function() {
							throw Error();
						};
						if (Object.defineProperty(n.prototype, "props", { set: function() {
							throw Error();
						} }), typeof Reflect == "object" && Reflect.construct) {
							try {
								Reflect.construct(n, []);
							} catch (e) {
								var r = e;
							}
							Reflect.construct(e, [], n);
						} else {
							try {
								n.call();
							} catch (e) {
								r = e;
							}
							n = !1;
							try {
								var i = Object.getOwnPropertyDescriptor(e.prototype, "props");
								Object.defineProperty(e.prototype, "props", {
									configurable: !0,
									set: function() {
										throw Error();
									}
								}), n = !0, new e();
							} finally {
								n && (i === void 0 ? delete e.prototype.props : Object.defineProperty(e.prototype, "props", i));
							}
						}
					} else {
						try {
							throw Error();
						} catch (e) {
							r = e;
						}
						(n = e()) && typeof n.catch == "function" && n.catch(function() {});
					}
				} catch (e) {
					if (e && r && typeof e.stack == "string") return [e.stack, r.stack];
				}
				return [null, null];
			} };
			r.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var i = Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot, "name");
			i && i.configurable && Object.defineProperty(r.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var a = r.DetermineComponentFrameRoot(), o = a[0], s = a[1];
			if (o && s) {
				var c = o.split("\n"), l = s.split("\n");
				for (i = r = 0; r < c.length && !c[r].includes("DetermineComponentFrameRoot");) r++;
				for (; i < l.length && !l[i].includes("DetermineComponentFrameRoot");) i++;
				if (r === c.length || i === l.length) for (r = c.length - 1, i = l.length - 1; 1 <= r && 0 <= i && c[r] !== l[i];) i--;
				for (; 1 <= r && 0 <= i; r--, i--) if (c[r] !== l[i]) {
					if (r !== 1 || i !== 1) do
						if (r--, i--, 0 > i || c[r] !== l[i]) {
							var u = "\n" + c[r].replace(" at new ", " at ");
							return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
						}
					while (1 <= r && 0 <= i);
					break;
				}
			}
		} finally {
			L = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? I(n) : "";
	}
	function Pe(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return I(e.type);
			case 16: return I("Lazy");
			case 13: return e.child !== t && t !== null ? I("Suspense Fallback") : I("Suspense");
			case 19: return I("SuspenseList");
			case 0:
			case 15: return Ne(e.type, !1);
			case 11: return Ne(e.type.render, !1);
			case 1: return Ne(e.type, !0);
			case 31: return I("Activity");
			case 30: return I("ViewTransition");
			default: return "";
		}
	}
	function Fe(e) {
		try {
			var t = "", n = null;
			do
				t += Pe(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var Ie = Object.prototype.hasOwnProperty, Le = t.unstable_scheduleCallback, Re = t.unstable_cancelCallback, ze = t.unstable_shouldYield, Be = t.unstable_requestPaint, Ve = t.unstable_now, He = t.unstable_getCurrentPriorityLevel, Ue = t.unstable_ImmediatePriority, We = t.unstable_UserBlockingPriority, Ge = t.unstable_NormalPriority, Ke = t.unstable_LowPriority, qe = t.unstable_IdlePriority, Je = t.log, Ye = t.unstable_setDisableYieldValue, Xe = null, Ze = null;
	function Qe(e) {
		if (typeof Je == "function" && Ye(e), Ze && typeof Ze.setStrictMode == "function") try {
			Ze.setStrictMode(Xe, e);
		} catch {}
	}
	var $e = Math.clz32 ? Math.clz32 : nt, et = Math.log, tt = Math.LN2;
	function nt(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (et(e) / tt | 0) | 0;
	}
	var rt = 256, it = 262144, R = 4194304;
	function at(e) {
		var t = e & 42;
		if (t !== 0) return t;
		switch (e & -e) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64: return 64;
			case 128: return 128;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072: return e & -e;
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return e & 3932160;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return e & 62914560;
			case 67108864: return 67108864;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 0;
			default: return e;
		}
	}
	function z(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = at(n))) : i = at(o) : i = at(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = at(n))) : i = at(o)) : i = at(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function ot(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function st(e, t) {
		t & 8 && (t |= t & 32);
		var n = e.entangledLanes;
		if (n !== 0) for (e = e.entanglements, n &= t; 0 < n;) {
			var r = 31 - $e(n), i = 1 << r;
			t |= e[r], n &= ~i;
		}
		return t;
	}
	function ct(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 64: return t + 250;
			case 16:
			case 32:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return t + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return -1;
			case 67108864:
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function lt() {
		var e = R;
		return R <<= 1, !(R & 62914560) && (R = 4194304), e;
	}
	function ut(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function dt(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function ft(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - $e(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && pt(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function pt(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - $e(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function mt(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - $e(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function ht(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : gt(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function gt(e) {
		switch (e) {
			case 2:
				e = 1;
				break;
			case 8:
				e = 4;
				break;
			case 32:
				e = 16;
				break;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				e = 128;
				break;
			case 268435456:
				e = 134217728;
				break;
			default: e = 0;
		}
		return e;
	}
	function _t(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function vt() {
		var e = M.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : Ch(e.type)) : e;
	}
	function yt(e, t) {
		var n = M.p;
		try {
			return M.p = e, t();
		} finally {
			M.p = n;
		}
	}
	var bt = Math.random().toString(36).slice(2), xt = "__reactFiber$" + bt, St = "__reactProps$" + bt, Ct = "__reactContainer$" + bt, wt = "__reactEvents$" + bt, Tt = "__reactListeners$" + bt, Et = "__reactHandles$" + bt, Dt = "__reactResources$" + bt, Ot = "__reactMarker$" + bt, kt = "__reactLoad$" + bt;
	function At(e) {
		delete e[xt], delete e[St], delete e[Tt], delete e[Et];
	}
	function jt(e) {
		var t;
		if (t = e[xt]) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[Ct] || n[xt]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = fm(e); e !== null;) {
					if (n = e[xt]) return n;
					e = fm(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function Mt(e) {
		if (e = e[xt] || e[Ct]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function Nt(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(i(33));
	}
	function Pt(e) {
		var t = e[Dt];
		return t ||= e[Dt] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function Ft(e) {
		e[Ot] = !0;
	}
	function It(e) {
		e[kt] = void 0;
	}
	var Lt = /* @__PURE__ */ new Set(), Rt = {};
	function zt(e, t) {
		Bt(e, t), Bt(e + "Capture", t);
	}
	function Bt(e, t) {
		for (Rt[e] = t, e = 0; e < t.length; e++) Lt.add(t[e]);
	}
	var Vt = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), Ht = {}, Ut = {};
	function Wt(e) {
		return Ie.call(Ut, e) ? !0 : Ie.call(Ht, e) ? !1 : Vt.test(e) ? Ut[e] = !0 : (Ht[e] = !0, !1);
	}
	var B = !1;
	function Gt() {
		var e = B;
		return B = !1, e;
	}
	function Kt(e, t, n) {
		if (Wt(t)) {
			if (n === null) e.removeAttribute(t);
			else {
				switch (typeof n) {
					case "undefined":
					case "function":
					case "symbol":
						e.removeAttribute(t);
						return;
					case "boolean":
						var r = t.toLowerCase().slice(0, 5);
						if (r !== "data-" && r !== "aria-") {
							e.removeAttribute(t);
							return;
						}
				}
				e.setAttribute(t, n);
			}
		}
	}
	function qt(e, t, n) {
		if (n === null) e.removeAttribute(t);
		else {
			switch (typeof n) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(t);
					return;
			}
			e.setAttribute(t, n);
		}
	}
	function Jt(e, t, n, r) {
		if (r === null) e.removeAttribute(n);
		else {
			switch (typeof r) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(n);
					return;
			}
			e.setAttributeNS(t, n, r);
		}
	}
	function Yt(e) {
		switch (typeof e) {
			case "bigint":
			case "boolean":
			case "number":
			case "string":
			case "undefined": return e;
			case "object": return e;
			default: return "";
		}
	}
	function V(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function Xt(e, t, n) {
		var r = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
		if (!e.hasOwnProperty(t) && r !== void 0 && typeof r.get == "function" && typeof r.set == "function") {
			var i = r.get, a = r.set;
			return Object.defineProperty(e, t, {
				configurable: !0,
				get: function() {
					return i.call(this);
				},
				set: function(e) {
					n = "" + e, a.call(this, e);
				}
			}), Object.defineProperty(e, t, { enumerable: r.enumerable }), {
				getValue: function() {
					return n;
				},
				setValue: function(e) {
					n = "" + e;
				},
				stopTracking: function() {
					e._valueTracker = null, delete e[t];
				}
			};
		}
	}
	function Zt(e) {
		if (!e._valueTracker) {
			var t = V(e) ? "checked" : "value";
			e._valueTracker = Xt(e, t, "" + e[t]);
		}
	}
	function Qt(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = V(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	var $t = /[\n"\\]/g;
	function en(e) {
		return e.replace($t, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function tn(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Yt(t)) : e.value !== "" + Yt(t) && (e.value = "" + Yt(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : rn(e, Yt(n)) : o === "number" && e.value == t ? rn(e, Yt(e.value)) : rn(e, Yt(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + Yt(s) : e.removeAttribute("name");
	}
	function nn(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				Zt(e);
				return;
			}
			n = n == null ? "" : "" + Yt(n), t = t == null ? n : "" + Yt(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), Zt(e);
	}
	function rn(e, t) {
		e.defaultValue !== "" + t && (e.defaultValue = "" + t);
	}
	function an(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + Yt(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function on(e, t, n) {
		t != null && (t = "" + Yt(t), t !== e.value && (e.value = t), n == null) ? e.defaultValue !== t && (e.defaultValue = t) : e.defaultValue = n == null ? "" : "" + Yt(n);
	}
	function sn(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(i(92));
				if (ye(r)) {
					if (1 < r.length) throw Error(i(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = Yt(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), Zt(e);
	}
	function cn(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var ln = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function un(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || ln.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function dn(e, t, n) {
		if (t != null && typeof t != "object") throw Error(i(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "", B = !0);
			for (var a in t) r = t[a], t.hasOwnProperty(a) && n[a] !== r && (un(e, a, r), B = !0);
		} else for (var o in t) t.hasOwnProperty(o) && un(e, o, t[o]);
	}
	function fn(e) {
		if (e.indexOf("-") === -1) return !1;
		switch (e) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var pn = /* @__PURE__ */ new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["maskType", "mask-type"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]), mn = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function hn(e) {
		return mn.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function gn() {}
	var _n = null;
	function vn(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var yn = null, bn = null;
	function xn(e) {
		var t = Mt(e);
		if (t && (e = t.stateNode)) {
			var n = e[St] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (tn(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + en("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var a = r[St] || null;
								if (!a) throw Error(i(90));
								tn(r, a.value, a.defaultValue, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && Qt(r);
					}
					break a;
				case "textarea":
					on(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && an(e, !!n.multiple, t, !1);
			}
		}
	}
	var Sn = !1;
	function Cn(e, t, n) {
		if (Sn) return e(t, n);
		Sn = !0;
		try {
			return e(t);
		} finally {
			if (Sn = !1, (yn !== null || bn !== null) && (Ld(), yn && (t = yn, e = bn, bn = yn = null, xn(t), e))) for (t = 0; t < e.length; t++) xn(e[t]);
		}
	}
	function wn(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[St] || null;
		if (r === null) return null;
		n = r[t];
		a: switch (t) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(r = !r.disabled) || (e = e.type, r = e !== "button" && e !== "input" && e !== "select" && e !== "textarea"), e = !r;
				break a;
			default: e = !1;
		}
		if (e) return null;
		if (n && typeof n != "function") throw Error(i(231, t, typeof n));
		return n;
	}
	var Tn = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, En = !1;
	if (Tn) try {
		var Dn = {};
		Object.defineProperty(Dn, "passive", { get: function() {
			En = !0;
		} }), window.addEventListener("test", Dn, Dn), window.removeEventListener("test", Dn, Dn);
	} catch {
		En = !1;
	}
	var On = null, kn = null, An = null;
	function jn() {
		if (An) return An;
		var e, t = kn, n = t.length, r, i = "value" in On ? On.value : On.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return An = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function Mn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function Nn() {
		return !0;
	}
	function Pn() {
		return !1;
	}
	function Fn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? Nn : Pn, this.isPropagationStopped = Pn, this;
		}
		return E(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = Nn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = Nn);
			},
			persist: function() {},
			isPersistent: Nn
		}), t;
	}
	var In = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, Ln = Fn(In), Rn = E({}, In, {
		view: 0,
		detail: 0
	}), zn = Fn(Rn), Bn, Vn, Hn, Un = E({}, Rn, {
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		getModifierState: er,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== Hn && (Hn && e.type === "mousemove" ? (Bn = e.screenX - Hn.screenX, Vn = e.screenY - Hn.screenY) : Vn = Bn = 0, Hn = e), Bn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : Vn;
		}
	}), Wn = Fn(Un), Gn = Fn(E({}, Un, { dataTransfer: 0 })), Kn = Fn(E({}, Rn, { relatedTarget: 0 })), qn = Fn(E({}, In, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Jn = Fn(E({}, In, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), Yn = Fn(E({}, In, { data: 0 })), Xn = {
		Esc: "Escape",
		Spacebar: " ",
		Left: "ArrowLeft",
		Up: "ArrowUp",
		Right: "ArrowRight",
		Down: "ArrowDown",
		Del: "Delete",
		Win: "OS",
		Menu: "ContextMenu",
		Apps: "ContextMenu",
		Scroll: "ScrollLock",
		MozPrintableKey: "Unidentified"
	}, Zn = {
		8: "Backspace",
		9: "Tab",
		12: "Clear",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		45: "Insert",
		46: "Delete",
		112: "F1",
		113: "F2",
		114: "F3",
		115: "F4",
		116: "F5",
		117: "F6",
		118: "F7",
		119: "F8",
		120: "F9",
		121: "F10",
		122: "F11",
		123: "F12",
		144: "NumLock",
		145: "ScrollLock",
		224: "Meta"
	}, Qn = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function $n(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = Qn[e]) ? !!t[e] : !1;
	}
	function er() {
		return $n;
	}
	var tr = Fn(E({}, Rn, {
		key: function(e) {
			if (e.key) {
				var t = Xn[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = Mn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Zn[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: er,
		charCode: function(e) {
			return e.type === "keypress" ? Mn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? Mn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), nr = Fn(E({}, Un, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	})), rr = Fn(E({}, In, { submitter: 0 })), ir = Fn(E({}, Rn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: er
	})), ar = Fn(E({}, In, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), or = Fn(E({}, Un, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), sr = Fn(E({}, In, {
		newState: 0,
		oldState: 0,
		source: 0
	})), cr = [
		9,
		13,
		27,
		32
	], lr = Tn && "CompositionEvent" in window, ur = null;
	Tn && "documentMode" in document && (ur = document.documentMode);
	var dr = Tn && "TextEvent" in window && !ur, fr = Tn && (!lr || ur && 8 < ur && 11 >= ur), pr = " ", mr = !1;
	function hr(e, t) {
		switch (e) {
			case "keyup": return cr.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function gr(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var _r = !1;
	function vr(e, t) {
		switch (e) {
			case "compositionend": return gr(t);
			case "keypress": return t.which === 32 ? (mr = !0, pr) : null;
			case "textInput": return e = t.data, e === pr && mr ? null : e;
			default: return null;
		}
	}
	function yr(e, t) {
		if (_r) return e === "compositionend" || !lr && hr(e, t) ? (e = jn(), An = kn = On = null, _r = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return fr && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var br = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};
	function xr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!br[e.type] : t === "textarea";
	}
	function Sr(e, t, n, r) {
		yn ? bn ? bn.push(r) : bn = [r] : yn = r, t = qf(t, "onChange"), 0 < t.length && (n = new Ln("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var Cr = null, wr = null;
	function Tr(e) {
		Bf(e, 0);
	}
	function Er(e) {
		if (Qt(Nt(e))) return e;
	}
	function Dr(e, t) {
		if (e === "change") return t;
	}
	var Or = !1;
	if (Tn) {
		var kr;
		if (Tn) {
			var Ar = "oninput" in document;
			if (!Ar) {
				var jr = document.createElement("div");
				jr.setAttribute("oninput", "return;"), Ar = typeof jr.oninput == "function";
			}
			kr = Ar;
		} else kr = !1;
		Or = kr && (!document.documentMode || 9 < document.documentMode);
	}
	function Mr() {
		Cr && (Cr.detachEvent("onpropertychange", Nr), wr = Cr = null);
	}
	function Nr(e) {
		if (e.propertyName === "value" && Er(wr)) {
			var t = [];
			Sr(t, wr, e, vn(e)), Cn(Tr, t);
		}
	}
	function Pr(e, t, n) {
		e === "focusin" ? (Mr(), Cr = t, wr = n, Cr.attachEvent("onpropertychange", Nr)) : e === "focusout" && Mr();
	}
	function Fr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return Er(wr);
	}
	function Ir(e, t) {
		if (e === "click") return Er(t);
	}
	function H(e, t) {
		if (e === "input" || e === "change") return Er(t);
	}
	function Lr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var U = typeof Object.is == "function" ? Object.is : Lr;
	function Rr(e, t) {
		if (U(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!Ie.call(t, i) || !U(e[i], t[i])) return !1;
		}
		return !0;
	}
	function zr(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	function Br(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function Vr(e, t) {
		var n = Br(e);
		e = 0;
		for (var r; n;) {
			if (n.nodeType === 3) {
				if (r = e + n.textContent.length, e <= t && r >= t) return {
					node: n,
					offset: t - e
				};
				e = r;
			}
			a: {
				for (; n;) {
					if (n.nextSibling) {
						n = n.nextSibling;
						break a;
					}
					n = n.parentNode;
				}
				n = void 0;
			}
			n = Br(n);
		}
	}
	function Hr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Hr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function Ur(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = zr(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = zr(e.document);
		}
		return t;
	}
	function Wr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var Gr = Tn && "documentMode" in document && 11 >= document.documentMode, Kr = null, qr = null, Jr = null, Yr = !1;
	function Xr(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		Yr || Kr == null || Kr !== zr(r) || (r = Kr, "selectionStart" in r && Wr(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), Jr && Rr(Jr, r) || (Jr = r, r = qf(qr, "onSelect"), 0 < r.length && (t = new Ln("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Kr)));
	}
	function Zr(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var Qr = {
		animationend: Zr("Animation", "AnimationEnd"),
		animationiteration: Zr("Animation", "AnimationIteration"),
		animationstart: Zr("Animation", "AnimationStart"),
		transitionrun: Zr("Transition", "TransitionRun"),
		transitionstart: Zr("Transition", "TransitionStart"),
		transitioncancel: Zr("Transition", "TransitionCancel"),
		transitionend: Zr("Transition", "TransitionEnd")
	}, $r = {}, ei = {};
	Tn && (ei = document.createElement("div").style, "AnimationEvent" in window || (delete Qr.animationend.animation, delete Qr.animationiteration.animation, delete Qr.animationstart.animation), "TransitionEvent" in window || delete Qr.transitionend.transition);
	function ti(e) {
		if ($r[e]) return $r[e];
		if (!Qr[e]) return e;
		var t = Qr[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in ei) return $r[e] = t[n];
		return e;
	}
	var ni = ti("animationend"), ri = ti("animationiteration"), ii = ti("animationstart"), ai = ti("transitionrun"), oi = ti("transitionstart"), si = ti("transitioncancel"), ci = ti("transitionend"), li = /* @__PURE__ */ new Map(), ui = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	ui.push("scrollEnd");
	function di(e, t) {
		li.set(e, t), zt(t, [e]);
	}
	var fi = 0;
	function pi(e, t) {
		if (e.name != null && e.name !== "auto") return e.name;
		if (t.autoName !== null) return t.autoName;
		e = vd.identifierPrefix;
		var n = fi++;
		return e = "_" + e + "t_" + n.toString(32) + "_", t.autoName = e;
	}
	function mi(e) {
		if (e == null || typeof e == "string") return e;
		var t = null, n = Ed;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = e[n[r]];
			if (i != null) {
				if (i === "none") return "none";
				t = t == null ? i : t + (" " + i);
			}
		}
		return t ?? e.default;
	}
	function hi(e, t) {
		return e = mi(e), t = mi(t), t == null ? e === "auto" ? null : e : t === "auto" ? null : t;
	}
	var gi = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	}, W = [], _i = 0, vi = 0;
	function yi() {
		for (var e = _i, t = vi = _i = 0; t < e;) {
			var n = W[t];
			W[t++] = null;
			var r = W[t];
			W[t++] = null;
			var i = W[t];
			W[t++] = null;
			var a = W[t];
			if (W[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && Si(n, i, a);
		}
	}
	function G(e, t, n, r) {
		W[_i++] = e, W[_i++] = t, W[_i++] = n, W[_i++] = r, vi |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function bi(e, t, n, r) {
		return G(e, t, n, r), Ci(e);
	}
	function xi(e, t) {
		return G(e, null, null, t), Ci(e);
	}
	function Si(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - $e(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function Ci(e) {
		if (50 < Dd) throw Dd = 0, Od = null, Error(i(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var wi = {};
	function Ti(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function Ei(e, t, n, r) {
		return new Ti(e, t, n, r);
	}
	function Di(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function Oi(e, t) {
		var n = e.alternate;
		return n === null ? (n = Ei(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 1206910976, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function ki(e, t) {
		e.flags &= 1206910978;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function Ai(e, t, n, r, a, o) {
		var s = 0;
		if (r = e, typeof r == "function") Di(r) && (s = 1);
		else if (typeof r == "string") s = qm(e, n, Ce.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (r) {
			case ue: return e = Ei(31, n, t, a), e.elementType = ue, e.lanes = o, e;
			case re: return ji(n.children, a, o, t);
			case O:
				s = 8, a |= 24;
				break;
			case ie: return e = Ei(12, n, t, a | 2), e.elementType = ie, e.lanes = o, e;
			case oe: return e = Ei(13, n, t, a), e.elementType = oe, e.lanes = o, e;
			case se: return e = Ei(19, n, t, a), e.elementType = se, e.lanes = o, e;
			case de:
			case pe: return e = a | 32, e = Ei(30, n, t, e), e.elementType = pe, e.lanes = o, e.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}, e;
			default:
				if (typeof r == "object" && r) switch (r.$$typeof) {
					case ae:
						s = 10;
						break a;
					case k:
						s = 9;
						break a;
					case A:
						s = 11;
						break a;
					case ce:
						s = 14;
						break a;
					case le:
						s = 16, r = null;
						break a;
				}
				s = 29, n = Error(i(130, e === null ? "null" : typeof e, "")), r = null;
		}
		return t = Ei(s, n, t, a), t.elementType = e, t.type = r, t.lanes = o, t;
	}
	function ji(e, t, n, r) {
		return e = Ei(7, e, r, t), e.lanes = n, e;
	}
	function Mi(e, t, n) {
		return e = Ei(6, e, null, t), e.lanes = n, e;
	}
	function Ni(e) {
		var t = Ei(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function Pi(e, t, n) {
		return t = Ei(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var Fi = /* @__PURE__ */ new WeakMap();
	function Ii(e, t) {
		if (typeof e == "object" && e) {
			var n = Fi.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: Fe(t)
			}, Fi.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: Fe(t)
		};
	}
	var Li = [], Ri = 0, zi = null, Bi = 0, Vi = [], Hi = 0, Ui = null, Wi = 1, Gi = "";
	function Ki(e, t) {
		Li[Ri++] = Bi, Li[Ri++] = zi, zi = e, Bi = t;
	}
	function qi(e, t, n) {
		Vi[Hi++] = Wi, Vi[Hi++] = Gi, Vi[Hi++] = Ui, Ui = e;
		var r = Wi;
		e = Gi;
		var i = 32 - $e(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - $e(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, Wi = 1 << 32 - $e(t) + i | n << i | r, Gi = a + e;
		} else Wi = 1 << a | n << i | r, Gi = e;
	}
	function Ji(e) {
		e.return !== null && (Ki(e, 1), qi(e, 1, 0));
	}
	function Yi(e) {
		for (; e === zi;) zi = Li[--Ri], Li[Ri] = null, Bi = Li[--Ri], Li[Ri] = null;
		for (; e === Ui;) Ui = Vi[--Hi], Vi[Hi] = null, Gi = Vi[--Hi], Vi[Hi] = null, Wi = Vi[--Hi], Vi[Hi] = null;
	}
	function Xi(e, t) {
		Vi[Hi++] = Wi, Vi[Hi++] = Gi, Vi[Hi++] = Ui, Wi = t.id, Gi = t.overflow, Ui = e;
	}
	var Zi = null, Qi = null, K = !1, $i = null, ea = !1, ta = Error(i(519));
	function na(e) {
		throw ca(Ii(Error(i(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), ta;
	}
	function ra(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[xt] = e, t[St] = r, n) {
			case "dialog":
				$("cancel", t), $("close", t);
				break;
			case "iframe":
			case "object":
			case "embed":
				$("load", t);
				break;
			case "video":
			case "audio":
				for (n = 0; n < Rf.length; n++) $(Rf[n], t);
				break;
			case "source":
				$("error", t);
				break;
			case "img":
			case "image":
			case "link":
				$("error", t), $("load", t);
				break;
			case "details":
				$("toggle", t);
				break;
			case "input":
				$("invalid", t), nn(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				$("invalid", t);
				break;
			case "textarea": $("invalid", t), sn(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || $f(t.textContent, n) ? (r.popover != null && ($("beforetoggle", t), $("toggle", t)), r.onScroll != null && $("scroll", t), r.onScrollEnd != null && $("scrollend", t), r.onClick != null && (t.onclick = gn), t = !0) : t = !1, t || na(e, !0);
	}
	function ia(e) {
		for (Zi = e.return; Zi;) switch (Zi.tag) {
			case 5:
			case 31:
			case 13:
				ea = !1;
				return;
			case 27:
			case 3:
				ea = !0;
				return;
			default: Zi = Zi.return;
		}
	}
	function aa(e) {
		if (e !== Zi) return !1;
		if (!K) return ia(e), K = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = n === "form" || n === "button" || pp(e.type, e.memoizedProps)), n = !n), n && Qi && na(e), ia(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			Qi = dm(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			Qi = dm(e);
		} else t === 27 ? (t = Qi, Sp(e.type) ? (e = um, um = null, Qi = e) : Qi = t) : Qi = Zi ? lm(e.stateNode.nextSibling) : null;
		return !0;
	}
	function oa() {
		Qi = Zi = null, K = !1;
	}
	function sa() {
		var e = $i;
		return e !== null && (ud === null ? ud = e : ud.push.apply(ud, e), $i = null), e;
	}
	function ca(e) {
		$i === null ? $i = [e] : $i.push(e);
	}
	var la = P(null), ua = null, da = null;
	function fa(e, t, n) {
		F(la, t._currentValue), t._currentValue = n;
	}
	function pa(e) {
		e._currentValue = la.current, Se(la);
	}
	function ma(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function ha(e, t, n, r) {
		var a = e.child;
		for (a !== null && (a.return = e); a !== null;) {
			var o = a.dependencies;
			if (o !== null) {
				var s = a.child;
				o = o.firstContext;
				a: for (; o !== null;) {
					var c = o;
					o = a;
					for (var l = 0; l < t.length; l++) if (c.context === t[l]) {
						o.lanes |= n, c = o.alternate, c !== null && (c.lanes |= n), ma(o.return, n, e), r || (s = null);
						break a;
					}
					o = c.next;
				}
			} else if (a.tag === 18) {
				if (s = a.return, s === null) throw Error(i(341));
				s.lanes |= n, o = s.alternate, o !== null && (o.lanes |= n), ma(s, n, e), s = null;
			} else a.tag === 13 && a.memoizedState !== null && a.memoizedState.dehydrated === null ? (a.lanes |= n, s = a.alternate, s !== null && (s.lanes |= n), ma(a.return, n, e), s = a.child, s = s === null ? null : s.sibling) : s = a.child;
			if (s !== null) s.return = a;
			else for (s = a; s !== null;) {
				if (s === e) {
					s = null;
					break;
				}
				if (a = s.sibling, a !== null) {
					a.return = s.return, s = a;
					break;
				}
				s = s.return;
			}
			a = s;
		}
	}
	function ga(e, t, n, r) {
		e = null;
		for (var a = t, o = !1; a !== null;) {
			if (!o) {
				if (a.flags & 524288) o = !0;
				else if (a.flags & 262144) break;
			}
			if (a.tag === 10) {
				var s = a.alternate;
				if (s === null) throw Error(i(387));
				if (s = s.memoizedProps, s !== null) {
					var c = a.type;
					U(a.pendingProps.value, s.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (a === Ee.current) {
				if (s = a.alternate, s === null) throw Error(i(387));
				s.memoizedState.memoizedState !== a.memoizedState.memoizedState && (e === null ? e = [sh] : e.push(sh));
			}
			a = a.return;
		}
		return e !== null && ha(t, e, n, r), t.flags |= 262144, e !== null;
	}
	function _a(e) {
		for (e = e.firstContext; e !== null;) {
			if (!U(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function va(e) {
		ua = e, da = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function ya(e) {
		return xa(ua, e);
	}
	function ba(e, t) {
		return ua === null && va(e), xa(e, t);
	}
	function xa(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, da === null) {
			if (e === null) throw Error(i(308));
			da = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else da = da.next = t;
		return n;
	}
	var Sa = typeof AbortController < "u" ? AbortController : function() {
		var e = [], t = this.signal = {
			aborted: !1,
			addEventListener: function(t, n) {
				e.push(n);
			}
		};
		this.abort = function() {
			t.aborted = !0, e.forEach(function(e) {
				return e();
			});
		};
	}, Ca = t.unstable_scheduleCallback, wa = t.unstable_NormalPriority, Ta = {
		$$typeof: ae,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function Ea() {
		return {
			controller: new Sa(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function Da(e) {
		e.refCount--, e.refCount === 0 && Ca(wa, function() {
			e.controller.abort();
		});
	}
	function Oa(e, t) {
		if (e.pendingLanes & 4194048) {
			var n = e.transitionTypes;
			for (n === null && (n = e.transitionTypes = []), e = 0; e < t.length; e++) {
				var r = t[e];
				n.indexOf(r) === -1 && n.push(r);
			}
		}
	}
	var ka = null;
	function Aa(e) {
		var t = e.transitionTypes;
		return e.transitionTypes = null, t;
	}
	var ja = null, Ma = 0, Na = 0, Pa = null;
	function Fa(e, t) {
		if (ja === null) {
			var n = ja = [];
			Ma = 0, Na = Nf(), Pa = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return Ma++, t.then(Ia, Ia), t;
	}
	function Ia() {
		if (--Ma === 0 && (ka = null, ja !== null)) {
			Pa !== null && (Pa.status = "fulfilled");
			var e = ja;
			ja = null, Na = 0, Pa = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function La(e, t) {
		var n = [], r = {
			status: "pending",
			value: null,
			reason: null,
			then: function(e) {
				n.push(e);
			}
		};
		return e.then(function() {
			r.status = "fulfilled", r.value = t;
			for (var e = 0; e < n.length; e++) (0, n[e])(t);
		}, function(e) {
			for (r.status = "rejected", r.reason = e, e = 0; e < n.length; e++) (0, n[e])(void 0);
		}), r;
	}
	var Ra = j.S;
	j.S = function(e, t) {
		if (pd = Ve(), typeof t == "object" && t && typeof t.then == "function" && Fa(e, t), ka !== null) for (var n = yf; n !== null;) Oa(n, ka), n = n.next;
		if (n = e.types, n !== null) {
			for (var r = yf; r !== null;) Oa(r, n), r = r.next;
			if (Na !== 0) {
				r = ka, r === null && (r = ka = []);
				for (var i = 0; i < n.length; i++) {
					var a = n[i];
					r.indexOf(a) === -1 && r.push(a);
				}
			}
		}
		Ra !== null && Ra(e, t);
	};
	var za = P(null);
	function Ba() {
		var e = za.current;
		return e === null ? Zu.pooledCache : e;
	}
	function Va(e, t) {
		t === null ? F(za, za.current) : F(za, t.pool);
	}
	function Ha() {
		var e = Ba();
		return e === null ? null : {
			parent: Ta._currentValue,
			pool: e
		};
	}
	var Ua = Error(i(460)), Wa = Error(i(474)), Ga = Error(i(542)), Ka = { then: function() {} };
	function qa(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function Ja(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(gn, gn), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, Qa(e), e === void 0 && !("reason" in t) ? Error(i(600)) : e;
			default:
				if (typeof t.status == "string") t.then(gn, gn);
				else {
					if (e = Zu, e !== null && 100 < e.shellSuspendCounter) throw Error(i(482));
					e = t, e.status = "pending", e.then(function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "fulfilled", n.value = e;
						}
					}, function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "rejected", n.reason = e;
						}
					});
				}
				switch (t.status) {
					case "fulfilled": return t.value;
					case "rejected": throw e = t.reason, Qa(e), e;
				}
				throw Xa = t, Ua;
		}
	}
	function Ya(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (Xa = e, Ua) : e;
		}
	}
	var Xa = null;
	function Za() {
		if (Xa === null) throw Error(i(459));
		var e = Xa;
		return Xa = null, e;
	}
	function Qa(e) {
		if (e === Ua || e === Ga) throw Error(i(483));
	}
	var $a = null, eo = 0;
	function to(e) {
		var t = eo;
		return eo += 1, $a === null && ($a = []), Ja($a, e, t);
	}
	function no(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function ro(e, t) {
		throw t.$$typeof === te ? Error(i(525)) : (e = Object.prototype.toString.call(t), Error(i(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function io(e) {
		function t(t, n) {
			if (e) {
				var r = t.deletions;
				r === null ? (t.deletions = [n], t.flags |= 16) : r.push(n);
			}
		}
		function n(n, r) {
			if (!e) return null;
			for (; r !== null;) t(n, r), r = r.sibling;
			return null;
		}
		function r(e) {
			for (var t = /* @__PURE__ */ new Map(); e !== null;) e.key === null ? t.set(e.index, e) : t.set(e.key, e), e = e.sibling;
			return t;
		}
		function a(e, t) {
			return e = Oi(e, t), e.index = 0, e.sibling = null, e;
		}
		function o(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 134217730, n) : (r = r.index, r < n ? (t.flags |= 2, n) : r)) : (t.flags |= 1048576, n);
		}
		function s(t) {
			return e && t.alternate === null && (t.flags |= 134217730), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = Mi(n, e.mode, r), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var i = n.type;
			return i === re ? (e = d(e, t, n.props.children, r, n.key), no(e, n), e) : t !== null && (t.elementType === i || typeof i == "object" && i && i.$$typeof === le && Ya(i) === t.type) ? (t = a(t, n.props), no(t, n), t.return = e, t) : (t = Ai(n.type, n.key, n.props, null, e.mode, r), no(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = Pi(n, e.mode, r), t.return = e, t) : (t = a(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, i) {
			return t === null || t.tag !== 7 ? (t = ji(n, e.mode, r, i), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = Mi("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case ne: return n = Ai(t.type, t.key, t.props, null, e.mode, n), no(n, t), n.return = e, n;
					case D: return t = Pi(t, e.mode, n), t.return = e, t;
					case le: return t = Ya(t), f(e, t, n);
				}
				if (ye(t) || ge(t)) return t = ji(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, to(t), n);
				if (t.$$typeof === ae) return f(e, ba(e, t), n);
				ro(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number" || typeof n == "bigint") return i === null ? c(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case ne: return n.key === i ? l(e, t, n, r) : null;
					case D: return n.key === i ? u(e, t, n, r) : null;
					case le: return n = Ya(n), p(e, t, n, r);
				}
				if (ye(n) || ge(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, to(n), r);
				if (n.$$typeof === ae) return p(e, t, ba(e, n), r);
				ro(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case ne: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case D: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case le: return r = Ya(r), m(e, t, n, r, i);
				}
				if (ye(r) || ge(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, to(r), i);
				if (r.$$typeof === ae) return m(e, t, n, ba(t, r), i);
				ro(t, r);
			}
			return null;
		}
		function h(i, a, s, c) {
			for (var l = null, u = null, d = a, h = a = 0, g = null; d !== null && h < s.length; h++) {
				d.index > h ? (g = d, d = null) : g = d.sibling;
				var _ = p(i, d, s[h], c);
				if (_ === null) {
					d === null && (d = g);
					break;
				}
				e && d && _.alternate === null && t(i, d), a = o(_, a, h), u === null ? l = _ : u.sibling = _, u = _, d = g;
			}
			if (h === s.length) return n(i, d), K && Ki(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (a = o(d, a, h), u === null ? l = d : u.sibling = d, u = d);
				return K && Ki(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && (_ = g.alternate, _ !== null && d.delete(_.key === null ? h : _.key)), a = o(g, a, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), K && Ki(i, h), l;
		}
		function g(a, s, c, l) {
			if (c == null) throw Error(i(151));
			for (var u = null, d = null, h = s, g = s = 0, _ = null, v = c.next(); h !== null && !v.done; g++, v = c.next()) {
				h.index > g ? (_ = h, h = null) : _ = h.sibling;
				var y = p(a, h, v.value, l);
				if (y === null) {
					h === null && (h = _);
					break;
				}
				e && h && y.alternate === null && t(a, h), s = o(y, s, g), d === null ? u = y : d.sibling = y, d = y, h = _;
			}
			if (v.done) return n(a, h), K && Ki(a, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(a, v.value, l), v !== null && (s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return K && Ki(a, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, a, g, v.value, l), v !== null && (e && (_ = v.alternate, _ !== null && h.delete(_.key === null ? g : _.key)), s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(a, e);
			}), K && Ki(a, g), u;
		}
		function _(e, r, o, c) {
			if (typeof o == "object" && o && o.type === re && o.key === null && o.props.ref === void 0 && (o = o.props.children), typeof o == "object" && o) {
				switch (o.$$typeof) {
					case ne:
						a: {
							for (var l = o.key; r !== null;) {
								if (r.key === l) {
									if (l = o.type, l === re) {
										if (r.tag === 7) {
											n(e, r.sibling), c = a(r, o.props.children), no(c, o), c.return = e, e = c;
											break a;
										}
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === le && Ya(l) === r.type) {
										n(e, r.sibling), c = a(r, o.props), no(c, o), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							o.type === re ? (c = ji(o.props.children, e.mode, c, o.key), no(c, o), c.return = e, e = c) : (c = Ai(o.type, o.key, o.props, null, e.mode, c), no(c, o), c.return = e, e = c);
						}
						return s(e);
					case D:
						a: {
							for (l = o.key; r !== null;) {
								if (r.key === l) {
									if (r.tag === 4 && r.stateNode.containerInfo === o.containerInfo && r.stateNode.implementation === o.implementation) {
										n(e, r.sibling), c = a(r, o.children || []), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							c = Pi(o, e.mode, c), c.return = e, e = c;
						}
						return s(e);
					case le: return o = Ya(o), _(e, r, o, c);
				}
				if (ye(o)) return h(e, r, o, c);
				if (ge(o)) {
					if (l = ge(o), typeof l != "function") throw Error(i(150));
					return o = l.call(o), g(e, r, o, c);
				}
				if (typeof o.then == "function") return _(e, r, to(o), c);
				if (o.$$typeof === ae) return _(e, r, ba(e, o), c);
				ro(e, o);
			}
			return typeof o == "string" && o !== "" || typeof o == "number" || typeof o == "bigint" ? (o = "" + o, r !== null && r.tag === 6 ? (n(e, r.sibling), c = a(r, o), c.return = e, e = c) : (n(e, r), c = Mi(o, e.mode, c), c.return = e, e = c), s(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				eo = 0;
				var i = _(e, t, n, r);
				return $a = null, i;
			} catch (t) {
				if (t === Ua || t === Ga) throw t;
				var a = Ei(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var ao = io(!0), oo = io(!1), so = !1;
	function co(e) {
		e.updateQueue = {
			baseState: e.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				lanes: 0,
				hiddenCallbacks: null
			},
			callbacks: null
		};
	}
	function lo(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function uo(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function fo(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, Y & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = Ci(e), Si(e, null, n), t;
		}
		return G(e, r, t, n), Ci(e);
	}
	function po(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, mt(e, n);
		}
	}
	function mo(e, t) {
		var n = e.updateQueue, r = e.alternate;
		if (r !== null && (r = r.updateQueue, n === r)) {
			var i = null, a = null;
			if (n = n.firstBaseUpdate, n !== null) {
				do {
					var o = {
						lane: n.lane,
						tag: n.tag,
						payload: n.payload,
						callback: null,
						next: null
					};
					a === null ? i = a = o : a = a.next = o, n = n.next;
				} while (n !== null);
				a === null ? i = a = t : a = a.next = t;
			} else i = a = t;
			n = {
				baseState: r.baseState,
				firstBaseUpdate: i,
				lastBaseUpdate: a,
				shared: r.shared,
				callbacks: r.callbacks
			}, e.updateQueue = n;
		} else e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
	}
	var ho = !1;
	function go() {
		if (ho) {
			var e = Pa;
			if (e !== null) throw e;
		}
	}
	function _o(e, t, n, r) {
		ho = !1;
		var i = e.updateQueue;
		so = !1;
		var a = i.firstBaseUpdate, o = i.lastBaseUpdate, s = i.shared.pending;
		if (s !== null) {
			i.shared.pending = null;
			var c = s, l = c.next;
			c.next = null, o === null ? a = l : o.next = l, o = c;
			var u = e.alternate;
			u !== null && (u = u.updateQueue, s = u.lastBaseUpdate, s !== o && (s === null ? u.firstBaseUpdate = l : s.next = l, u.lastBaseUpdate = c));
		}
		if (a !== null) {
			var d = i.baseState;
			o = 0, u = l = c = null, s = a;
			do {
				var f = s.lane & -536870913, p = f !== s.lane;
				if (p ? (Z & f) === f : (r & f) === f) {
					f !== 0 && f === Na && (ho = !0), u !== null && (u = u.next = {
						lane: 0,
						tag: s.tag,
						payload: s.payload,
						callback: null,
						next: null
					});
					a: {
						var m = e, h = s;
						f = t;
						var g = n;
						switch (h.tag) {
							case 1:
								if (m = h.payload, typeof m == "function") {
									d = m.call(g, d, f);
									break a;
								}
								d = m;
								break a;
							case 3: m.flags = m.flags & -65537 | 128;
							case 0:
								if (m = h.payload, f = typeof m == "function" ? m.call(g, d, f) : m, f == null) break a;
								d = E({}, d, f);
								break a;
							case 2: so = !0;
						}
					}
					f = s.callback, f !== null && (e.flags |= 64, p && (e.flags |= 8192), p = i.callbacks, p === null ? i.callbacks = [f] : p.push(f));
				} else p = {
					lane: f,
					tag: s.tag,
					payload: s.payload,
					callback: s.callback,
					next: null
				}, u === null ? (l = u = p, c = d) : u = u.next = p, o |= f;
				if (s = s.next, s === null) {
					if (s = i.shared.pending, s === null) break;
					p = s, s = p.next, p.next = null, i.lastBaseUpdate = p, i.shared.pending = null;
				}
			} while (1);
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), id |= o, e.lanes = o, e.memoizedState = d;
		}
	}
	function vo(e, t) {
		if (typeof e != "function") throw Error(i(191, e));
		e.call(t);
	}
	function yo(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) vo(n[e], t);
	}
	var bo = P(null), xo = P(0);
	function So(e, t) {
		e = nd, F(xo, e), F(bo, t), nd = e | t.baseLanes;
	}
	function Co() {
		F(xo, nd), F(bo, bo.current);
	}
	function wo() {
		nd = xo.current, Se(bo), Se(xo);
	}
	var To = P(null), Eo = null;
	function Do(e) {
		var t = e.alternate;
		F(Mo, Mo.current & 1), F(To, e), Eo === null && (t === null || bo.current !== null || t.memoizedState !== null) && (Eo = e);
	}
	function Oo(e) {
		F(Mo, Mo.current), F(To, e), Eo === null && (Eo = e);
	}
	function ko(e) {
		e.tag === 22 ? (F(Mo, Mo.current), F(To, e), Eo === null && (Eo = e)) : Ao();
	}
	function Ao() {
		F(Mo, Mo.current), F(To, To.current);
	}
	function jo(e) {
		Se(To), Eo === e && (Eo = null), Se(Mo);
	}
	var Mo = P(0);
	function No(e, t) {
		F(To, To.current), F(Mo, t);
	}
	function Po(e) {
		Se(Mo), Se(To), Eo === e && (Eo = null);
	}
	function Fo(e) {
		for (var t = e; t !== null;) {
			if (t.tag === 13) {
				var n = t.memoizedState;
				if (n !== null && (n = n.dehydrated, n === null || om(n) || sm(n))) return t;
			} else if (t.tag === 19 && t.memoizedProps.revealOrder !== "independent") {
				if (t.flags & 128) return t;
			} else if (t.child !== null) {
				t.child.return = t, t = t.child;
				continue;
			}
			if (t === e) break;
			for (; t.sibling === null;) {
				if (t.return === null || t.return === e) return null;
				t = t.return;
			}
			t.sibling.return = t.return, t = t.sibling;
		}
		return null;
	}
	var Io = 0, q = null, Lo = null, Ro = null, zo = !1, Bo = !1, Vo = !1, Ho = 0, Uo = 0, Wo = null, Go = 0;
	function Ko() {
		throw Error(i(321));
	}
	function qo(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!U(e[n], t[n])) return !1;
		return !0;
	}
	function Jo(e, t, n, r, i, a) {
		return Io = a, q = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, j.H = e === null || e.memoizedState === null ? dc : fc, Vo = !1, a = n(r, i), Vo = !1, Bo && (a = Xo(t, n, r, i)), Yo(e), a;
	}
	function Yo(e) {
		j.H = uc;
		var t = Lo !== null && Lo.next !== null;
		if (Io = 0, Ro = Lo = q = null, zo = !1, Uo = 0, Wo = null, t) throw Error(i(300));
		e === null || kc || (e = e.dependencies, e !== null && _a(e) && (kc = !0));
	}
	function Xo(e, t, n, r) {
		q = e;
		var a = 0;
		do {
			if (Bo && (Wo = null), Uo = 0, Bo = !1, 25 <= a) throw Error(i(301));
			if (a += 1, Ro = Lo = null, e.updateQueue != null) {
				var o = e.updateQueue;
				o.lastEffect = null, o.events = null, o.stores = null, o.memoCache != null && (o.memoCache.index = 0);
			}
			j.H = pc, o = t(n, r);
		} while (Bo);
		return o;
	}
	function Zo() {
		var e = j.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? is(t) : t, e = e.useState()[0], (Lo === null ? null : Lo.memoizedState) !== e && (q.flags |= 1024), t;
	}
	function Qo() {
		var e = Ho !== 0;
		return Ho = 0, e;
	}
	function $o(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function es(e) {
		if (zo) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			zo = !1;
		}
		Io = 0, Ro = Lo = q = null, Bo = !1, Uo = Ho = 0, Wo = null;
	}
	function ts() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return Ro === null ? q.memoizedState = Ro = e : Ro = Ro.next = e, Ro;
	}
	function ns() {
		if (Lo === null) {
			var e = q.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = Lo.next;
		var t = Ro === null ? q.memoizedState : Ro.next;
		if (t !== null) Ro = t, Lo = e;
		else {
			if (e === null) throw q.alternate === null ? Error(i(467)) : Error(i(310));
			Lo = e, e = {
				memoizedState: Lo.memoizedState,
				baseState: Lo.baseState,
				baseQueue: Lo.baseQueue,
				queue: Lo.queue,
				next: null
			}, Ro === null ? q.memoizedState = Ro = e : Ro = Ro.next = e;
		}
		return Ro;
	}
	function rs() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function is(e) {
		var t = Uo;
		return Uo += 1, Wo === null && (Wo = []), e = Ja(Wo, e, t), t = q, (Ro === null ? t.memoizedState : Ro.next) === null && (t = t.alternate, j.H = t === null || t.memoizedState === null ? dc : fc), e;
	}
	function as(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return is(e);
			if (e.$$typeof === me) return;
			if (e.$$typeof === ae) return ya(e);
		}
		throw Error(i(438, String(e)));
	}
	function os(e) {
		var t = null, n = q.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = q.alternate;
			r !== null && (r = r.updateQueue, r !== null && (r = r.memoCache, r != null && (t = {
				data: r.data.map(function(e) {
					return e.slice();
				}),
				index: 0
			})));
		}
		if (t ??= {
			data: [],
			index: 0
		}, n === null && (n = rs(), q.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = fe;
		return t.index++, n;
	}
	function ss(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function cs(e) {
		return ls(ns(), Lo, e);
	}
	function ls(e, t, n) {
		var r = e.queue;
		if (r === null) throw Error(i(311));
		r.lastRenderedReducer = n;
		var a = e.baseQueue, o = r.pending;
		if (o !== null) {
			if (a !== null) {
				var s = a.next;
				a.next = o.next, o.next = s;
			}
			t.baseQueue = a = o, r.pending = null;
		}
		if (o = e.baseState, a === null) e.memoizedState = o;
		else {
			t = a.next;
			var c = s = null, l = null, u = t, d = !1;
			do {
				var f = u.lane & -536870913;
				if (f === u.lane ? (Io & f) === f : (Z & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === Na && (d = !0);
					else if ((Io & p) === p) {
						u = u.next, p === Na && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (c = l = f, s = o) : l = l.next = f, q.lanes |= p, id |= p;
					f = u.action, Vo && n(o, f), o = u.hasEagerState ? u.eagerState : n(o, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, s = o) : l = l.next = p, q.lanes |= f, id |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? s = o : l.next = c, !U(o, e.memoizedState) && (kc = !0, d && (n = Pa, n !== null))) throw n;
			e.memoizedState = o, e.baseState = s, e.baseQueue = l, r.lastRenderedState = o;
		}
		return a === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function us(e) {
		var t = ns(), n = t.queue;
		if (n === null) throw Error(i(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, a = n.pending, o = t.memoizedState;
		if (a !== null) {
			n.pending = null;
			var s = a = a.next;
			do
				o = e(o, s.action), s = s.next;
			while (s !== a);
			U(o, t.memoizedState) || (kc = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
		}
		return [o, r];
	}
	function ds(e, t, n) {
		var r = q, a = ns(), o = K;
		if (o) {
			if (n === void 0) throw Error(i(407));
			n = n();
		} else n = t();
		var s = !U((Lo || a).memoizedState, n);
		if (s && (a.memoizedState = n, kc = !0), a = a.queue, Is(ms.bind(null, r, a, e), [e]), e = a.getSnapshot !== t || s || Ro !== null && !!(Ro.memoizedState.tag & 1), js(e ? 9 : 8, { destroy: void 0 }, ps.bind(null, r, a, n, t), null), e) {
			if (r.flags |= 2048, Zu === null) throw Error(i(349));
			o || Io & 127 || fs(r, t, n);
		}
		return n;
	}
	function fs(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = q.updateQueue, t === null ? (t = rs(), q.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function ps(e, t, n, r) {
		t.value = n, t.getSnapshot = r, hs(t) && gs(e);
	}
	function ms(e, t, n) {
		return n(function() {
			hs(t) && gs(e);
		});
	}
	function hs(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !U(e, n);
		} catch {
			return !0;
		}
	}
	function gs(e) {
		var t = xi(e, 2);
		t !== null && Md(t, e, 2);
	}
	function _s(e) {
		var t = ts();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), Vo) {
				Qe(!0);
				try {
					n();
				} finally {
					Qe(!1);
				}
			}
		}
		return t.memoizedState = t.baseState = e, t.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: ss,
			lastRenderedState: e
		}, t;
	}
	function vs(e, t, n, r) {
		return e.baseState = n, ls(e, Lo, typeof r == "function" ? r : ss);
	}
	function ys(e, t, n, r, a) {
		if (sc(e)) throw Error(i(485));
		if (e = t.action, e !== null) {
			var o = {
				payload: a,
				action: e,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(e) {
					o.listeners.push(e);
				}
			};
			j.T === null ? o.isTransition = !1 : n(!0), r(o), n = t.pending, n === null ? (o.next = t.pending = o, bs(t, o)) : (o.next = n.next, t.pending = n.next = o);
		}
	}
	function bs(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = j.T, o = {};
			o.types = a === null ? null : a.types, j.T = o;
			try {
				var s = n(i, r), c = j.S;
				c !== null && c(o, s), xs(e, t, s);
			} catch (n) {
				Cs(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), j.T = a;
			}
		} else try {
			a = n(i, r), xs(e, t, a);
		} catch (n) {
			Cs(e, t, n);
		}
	}
	function xs(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			Ss(e, t, n);
		}, function(n) {
			return Cs(e, t, n);
		}) : Ss(e, t, n);
	}
	function Ss(e, t, n) {
		t.status = "fulfilled", t.value = n, ws(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, bs(e, n)));
	}
	function Cs(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, ws(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function ws(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function Ts(e, t) {
		return t;
	}
	function Es(e, t) {
		if (K) {
			var n = Zu.formState;
			if (n !== null) {
				a: {
					var r = q;
					if (K) {
						if (Qi) {
							b: {
								for (var i = Qi, a = ea; i.nodeType !== 8;) if (!a || (i = lm(i.nextSibling), i === null)) {
									i = null;
									break b;
								}
								a = i.data, i = a === "F!" || a === "F" ? i : null;
							}
							if (i) {
								Qi = lm(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						na(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = ts(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Ts,
			lastRenderedState: t
		}, n.queue = r, n = ic.bind(null, q, r), r.dispatch = n, r = _s(!1), a = oc.bind(null, q, !1, r.queue), r = ts(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = ys.bind(null, q, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function Ds(e) {
		return Os(ns(), Lo, e);
	}
	function Os(e, t, n) {
		if (t = ls(e, t, Ts)[0], e = cs(ss)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = is(t);
		} catch (e) {
			throw e === Ua ? Ga : e;
		}
		else r = t;
		t = ns();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (q.flags |= 2048, js(9, { destroy: void 0 }, ks.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function ks(e, t) {
		e.action = t;
	}
	function As(e) {
		var t = ns(), n = Lo;
		if (n !== null) return Os(t, n, e);
		ns(), t = t.memoizedState, n = ns();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function js(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = q.updateQueue, t === null && (t = rs(), q.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function Ms() {
		return ns().memoizedState;
	}
	function Ns(e, t, n, r) {
		var i = ts();
		q.flags |= e, i.memoizedState = js(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function Ps(e, t, n, r) {
		var i = ns();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		Lo !== null && r !== null && qo(r, Lo.memoizedState.deps) ? i.memoizedState = js(t, a, n, r) : (q.flags |= e, i.memoizedState = js(1 | t, a, n, r));
	}
	function Fs(e, t) {
		Ns(8390656, 8, e, t);
	}
	function Is(e, t) {
		Ps(2048, 8, e, t);
	}
	function Ls(e) {
		q.flags |= 4;
		var t = q.updateQueue;
		if (t === null) t = rs(), q.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function Rs(e) {
		var t = ns().memoizedState;
		return Ls({
			ref: t,
			nextImpl: e
		}), function() {
			if (Y & 2) throw Error(i(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function zs(e, t) {
		return Ps(4, 2, e, t);
	}
	function Bs(e, t) {
		return Ps(4, 4, e, t);
	}
	function Vs(e, t) {
		if (typeof t == "function") {
			e = e();
			var n = t(e);
			return function() {
				typeof n == "function" ? n() : t(null);
			};
		}
		if (t != null) return e = e(), t.current = e, function() {
			t.current = null;
		};
	}
	function Hs(e, t, n) {
		n = n == null ? null : n.concat([e]), Ps(4, 4, Vs.bind(null, t, e), n);
	}
	function Us() {}
	function Ws(e, t) {
		var n = ns();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && qo(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function Gs(e, t) {
		var n = ns();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && qo(t, r[1])) return r[0];
		if (r = e(), Vo) {
			Qe(!0);
			try {
				e();
			} finally {
				Qe(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function Ks(e, t, n) {
		return n === void 0 || Io & 1073741824 && !(Z & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = Ad(), q.lanes |= e, id |= e, n);
	}
	function qs(e, t, n, r) {
		return U(n, t) ? n : bo.current === null ? !(Io & 106) || Io & 1073741824 && !(Z & 261930) ? (kc = !0, e.memoizedState = n) : (e = Ad(), q.lanes |= e, id |= e, t) : (e = Ks(e, n, r), U(e, t) || (kc = !0), e);
	}
	function Js(e, t, n, r, i) {
		var a = M.p;
		M.p = a !== 0 && 8 > a ? a : 8;
		var o = j.T, s = {};
		s.types = o === null ? null : o.types, j.T = s, oc(e, !1, t, n);
		try {
			var c = i(), l = j.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? ac(e, t, La(c, r), kd(e)) : ac(e, t, r, kd(e));
		} catch (n) {
			ac(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, kd());
		} finally {
			M.p = a, o !== null && s.types !== null && (o.types = s.types), j.T = o;
		}
	}
	function Ys() {}
	function Xs(e, t, n, r) {
		if (e.tag !== 5) throw Error(i(476));
		var a = Zs(e).queue;
		Js(e, a, t, be, n === null ? Ys : function() {
			return Qs(e), n(r);
		});
	}
	function Zs(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: be,
			baseState: be,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: ss,
				lastRenderedState: be
			},
			next: null
		};
		var n = {};
		return t.next = {
			memoizedState: n,
			baseState: n,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: ss,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function Qs(e) {
		var t = Zs(e);
		t.next === null && (t = e.alternate.memoizedState), ac(e, t.next.queue, {}, kd());
	}
	function $s() {
		return ya(sh);
	}
	function ec() {
		return ns().memoizedState;
	}
	function tc() {
		return ns().memoizedState;
	}
	function nc(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = kd();
					e = uo(n);
					var r = fo(t, e, n);
					r !== null && (Md(r, t, n), po(r, t, n)), t = { cache: Ea() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function rc(e, t, n) {
		var r = kd();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, sc(e) ? cc(t, n) : (n = bi(e, t, n, r), n !== null && (Md(n, e, r), lc(n, t, r)));
	}
	function ic(e, t, n) {
		ac(e, t, n, kd());
	}
	function ac(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (sc(e)) cc(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, U(s, o)) return G(e, t, i, 0), Zu === null && yi(), !1;
			} catch {}
			if (n = bi(e, t, i, r), n !== null) return Md(n, e, r), lc(n, t, r), !0;
		}
		return !1;
	}
	function oc(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: Nf(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, sc(e)) {
			if (t) throw Error(i(479));
		} else t = bi(e, n, r, 2), t !== null && Md(t, e, 2);
	}
	function sc(e) {
		var t = e.alternate;
		return e === q || t !== null && t === q;
	}
	function cc(e, t) {
		Bo = zo = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function lc(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, mt(e, n);
		}
	}
	var uc = {
		readContext: ya,
		use: as,
		useCallback: Ko,
		useContext: Ko,
		useEffect: Ko,
		useImperativeHandle: Ko,
		useLayoutEffect: Ko,
		useInsertionEffect: Ko,
		useMemo: Ko,
		useReducer: Ko,
		useRef: Ko,
		useState: Ko,
		useDebugValue: Ko,
		useDeferredValue: Ko,
		useTransition: Ko,
		useSyncExternalStore: Ko,
		useId: Ko,
		useHostTransitionStatus: Ko,
		useFormState: Ko,
		useActionState: Ko,
		useOptimistic: Ko,
		useMemoCache: Ko,
		useCacheRefresh: Ko,
		useEffectEvent: Ko
	}, dc = {
		readContext: ya,
		use: as,
		useCallback: function(e, t) {
			return ts().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: ya,
		useEffect: Fs,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), Ns(4194308, 4, Vs.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return Ns(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			Ns(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = ts();
			t = t === void 0 ? null : t;
			var r = e();
			if (Vo) {
				Qe(!0);
				try {
					e();
				} finally {
					Qe(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = ts();
			if (n !== void 0) {
				var i = n(t);
				if (Vo) {
					Qe(!0);
					try {
						n(t);
					} finally {
						Qe(!1);
					}
				}
			} else i = t;
			return r.memoizedState = r.baseState = i, e = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: i
			}, r.queue = e, e = e.dispatch = rc.bind(null, q, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = ts();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = _s(e);
			var t = e.queue, n = ic.bind(null, q, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: Us,
		useDeferredValue: function(e, t) {
			return Ks(ts(), e, t);
		},
		useTransition: function() {
			var e = _s(!1);
			return e = Js.bind(null, q, e.queue, !0, !1), ts().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = q, a = ts();
			if (K) {
				if (n === void 0) throw Error(i(407));
				n = n();
			} else {
				if (n = t(), Zu === null) throw Error(i(349));
				Z & 127 || fs(r, t, n);
			}
			a.memoizedState = n;
			var o = {
				value: n,
				getSnapshot: t
			};
			return a.queue = o, Fs(ms.bind(null, r, o, e), [e]), r.flags |= 2048, js(9, { destroy: void 0 }, ps.bind(null, r, o, n, t), null), n;
		},
		useId: function() {
			var e = ts(), t = Zu.identifierPrefix;
			if (K) {
				var n = Gi, r = Wi;
				n = (r & ~(1 << 32 - $e(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = Ho++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = Go++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: $s,
		useFormState: Es,
		useActionState: Es,
		useOptimistic: function(e) {
			var t = ts();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = oc.bind(null, q, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: os,
		useCacheRefresh: function() {
			return ts().memoizedState = nc.bind(null, q);
		},
		useEffectEvent: function(e) {
			var t = ts(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (Y & 2) throw Error(i(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, fc = {
		readContext: ya,
		use: as,
		useCallback: Ws,
		useContext: ya,
		useEffect: Is,
		useImperativeHandle: Hs,
		useInsertionEffect: zs,
		useLayoutEffect: Bs,
		useMemo: Gs,
		useReducer: cs,
		useRef: Ms,
		useState: function() {
			return cs(ss);
		},
		useDebugValue: Us,
		useDeferredValue: function(e, t) {
			return qs(ns(), Lo.memoizedState, e, t);
		},
		useTransition: function() {
			var e = cs(ss)[0], t = ns().memoizedState;
			return [typeof e == "boolean" ? e : is(e), t];
		},
		useSyncExternalStore: ds,
		useId: ec,
		useHostTransitionStatus: $s,
		useFormState: Ds,
		useActionState: Ds,
		useOptimistic: function(e, t) {
			return vs(ns(), Lo, e, t);
		},
		useMemoCache: os,
		useCacheRefresh: tc,
		useEffectEvent: Rs
	}, pc = {
		readContext: ya,
		use: as,
		useCallback: Ws,
		useContext: ya,
		useEffect: Is,
		useImperativeHandle: Hs,
		useInsertionEffect: zs,
		useLayoutEffect: Bs,
		useMemo: Gs,
		useReducer: us,
		useRef: Ms,
		useState: function() {
			return us(ss);
		},
		useDebugValue: Us,
		useDeferredValue: function(e, t) {
			var n = ns();
			return Lo === null ? Ks(n, e, t) : qs(n, Lo.memoizedState, e, t);
		},
		useTransition: function() {
			var e = us(ss)[0], t = ns().memoizedState;
			return [typeof e == "boolean" ? e : is(e), t];
		},
		useSyncExternalStore: ds,
		useId: ec,
		useHostTransitionStatus: $s,
		useFormState: As,
		useActionState: As,
		useOptimistic: function(e, t) {
			var n = ns();
			return Lo === null ? (n.baseState = e, [e, n.queue.dispatch]) : vs(n, Lo, e, t);
		},
		useMemoCache: os,
		useCacheRefresh: tc,
		useEffectEvent: Rs
	};
	function mc(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : E({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var hc = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = kd(), i = uo(r);
			i.payload = t, n != null && (i.callback = n), t = fo(e, i, r), t !== null && (Md(t, e, r), po(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = kd(), i = uo(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = fo(e, i, r), t !== null && (Md(t, e, r), po(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = kd(), r = uo(n);
			r.tag = 2, t != null && (r.callback = t), t = fo(e, r, n), t !== null && (Md(t, e, n), po(t, e, n));
		}
	};
	function gc(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !Rr(n, r) || !Rr(i, a) : !0;
	}
	function _c(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && hc.enqueueReplaceState(t, t.state, null);
	}
	function vc(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = E({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function yc(e) {
		gi(e);
	}
	function bc(e) {
		console.error(e);
	}
	function xc(e) {
		gi(e);
	}
	function Sc(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Cc(e, t, n) {
		try {
			var r = e.onCaughtError;
			r(n.value, {
				componentStack: n.stack,
				errorBoundary: t.tag === 1 ? t.stateNode : null
			});
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function wc(e, t, n) {
		return n = uo(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			Sc(e, t);
		}, n;
	}
	function Tc(e) {
		return e = uo(e), e.tag = 3, e;
	}
	function Ec(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				Cc(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			Cc(t, n, r), typeof i != "function" && (gd === null ? gd = /* @__PURE__ */ new Set([this]) : gd.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function Dc(e, t, n, r, a) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && ga(t, n, a, !0), n = To.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13:
					case 19: return Eo === null ? Wd() : n.alternate === null && rd === 0 && (rd = 3), n.flags &= -257, n.flags |= 65536, n.lanes = a, r === Ka ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : t.add(r), pf(e, r, a)), !1;
					case 22: return n.flags |= 65536, r === Ka ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([r]) : n.add(r)), pf(e, r, a)), !1;
				}
				throw Error(i(435, n.tag));
			}
			return pf(e, r, a), Wd(), !1;
		}
		if (K) return t = To.current, t === null ? (r !== ta && (t = Error(i(423), { cause: r }), ca(Ii(t, n))), e = e.current.alternate, e.flags |= 65536, a &= -a, e.lanes |= a, r = Ii(r, n), a = wc(e.stateNode, r, a), mo(e, a), rd !== 4 && (rd = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = a, r !== ta && (e = Error(i(422), { cause: r }), ca(Ii(e, n)))), !1;
		var o = Error(i(520), { cause: r });
		if (o = Ii(o, n), ld === null ? ld = [o] : ld.push(o), rd !== 4 && (rd = 2), t === null) return !0;
		r = Ii(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = a & -a, n.lanes |= e, e = wc(n.stateNode, r, e), mo(n, e), !1;
				case 1:
					if (t = n.type, o = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (gd === null || !gd.has(o)))) return n.flags |= 65536, a &= -a, n.lanes |= a, a = Tc(a), Ec(a, e, n, r), mo(n, a), !1;
					break;
				case 22: if (n.memoizedState !== null) return n.flags |= 65536, !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var Oc = Error(i(461)), kc = !1;
	function Ac(e, t, n, r) {
		t.child = e === null ? oo(t, null, n, r) : ao(t, e.child, n, r);
	}
	function jc(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return va(t), r = Jo(e, t, n, o, a, i), s = Qo(), e !== null && !kc ? ($o(e, t, i), al(e, t, i)) : (K && s && Ji(t), t.flags |= 1, Ac(e, t, r, i), t.child);
	}
	function Mc(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !Di(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, Nc(e, t, a, r, i)) : (e = Ai(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !ol(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? Rr : n, n(o, r) && e.ref === t.ref) return al(e, t, i);
		}
		return t.flags |= 1, e = Oi(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function Nc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (Rr(a, r) && e.ref === t.ref) {
				if (kc = !1, t.pendingProps = r = a, ol(e, i)) e.flags & 131072 && (kc = !0);
				else return t.lanes = e.lanes, al(e, t, i);
			}
		}
		return Vc(e, t, n, r, i);
	}
	function Pc(e, t, n, r) {
		var i = r.children, a = e === null ? null : e.memoizedState;
		if (e === null && t.stateNode === null && (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), r.mode === "hidden") {
			if (t.flags & 128) {
				if (a = a === null ? n : a.baseLanes | n, e !== null) {
					for (r = t.child = e.child, i = 0; r !== null;) i = i | r.lanes | r.childLanes, r = r.sibling;
					r = i & ~a;
				} else r = 0, t.child = null;
				return Ic(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && Va(t, a === null ? null : a.cachePool), a === null ? Co() : So(t, a), ko(t);
			else return r = t.lanes = 536870912, Ic(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && Va(t, null), Co(), Ao()) : (Va(t, a.cachePool), So(t, a), Ao(), t.memoizedState = null);
		return Ac(e, t, i, n), t.child;
	}
	function Fc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function Ic(e, t, n, r, i) {
		var a = Ba();
		return a = a === null ? null : {
			parent: Ta._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && Va(t, null), Co(), ko(t), e !== null && ga(e, t, r, !0), t.childLanes = i, null;
	}
	function Lc(e, t) {
		return t = Xc({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function Rc(e, t, n) {
		return ao(t, e.child, null, n), e = Lc(t, t.pendingProps), e.flags |= 2, jo(t), t.memoizedState = null, e;
	}
	function zc(e, t, n) {
		var r = t.pendingProps, a = !!(t.flags & 128);
		if (t.flags &= -129, e === null) {
			if (K) {
				if (r.mode === "hidden") return e = Lc(t, r), t.lanes = 536870912, e.memoizedState = {
					baseLanes: 0,
					cachePool: null
				}, Fc(null, e);
				if (Oo(t), (e = Qi) ? (e = am(e, ea), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Ui === null ? null : {
						id: Wi,
						overflow: Gi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Ni(e), n.return = t, t.child = n, Zi = t, Qi = null)) : e = null, e === null) throw na(t);
				return t.lanes = 536870912, null;
			}
			return Lc(t, r);
		}
		var o = e.memoizedState;
		if (o !== null) {
			var s = o.dehydrated;
			if (Oo(t), a) {
				if (t.flags & 256) t.flags &= -257, t = Rc(e, t, n);
				else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
				else throw Error(i(558));
			} else if (kc || ga(e, t, n, !1), a = (n & e.childLanes) !== 0, kc || a) {
				if (bo.current === null) {
					if (r = Zu, r !== null && (s = ht(r, n), s !== 0 && s !== o.retryLane)) throw o.retryLane = s, xi(e, s), Md(r, e, s), Oc;
					Wd();
				}
				t = Rc(e, t, n);
			} else e = o.treeContext, Qi = lm(s.nextSibling), Zi = t, K = !0, $i = null, ea = !1, e !== null && Xi(t, e), t = Lc(t, r), t.flags |= 134221824;
			return t;
		}
		return e = Oi(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function Bc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(i(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function Vc(e, t, n, r, i) {
		return va(t), n = Jo(e, t, n, r, void 0, i), r = Qo(), e !== null && !kc ? ($o(e, t, i), al(e, t, i)) : (K && r && Ji(t), t.flags |= 1, Ac(e, t, n, i), t.child);
	}
	function Hc(e, t, n, r, i, a) {
		return va(t), t.updateQueue = null, n = Xo(t, r, n, i), Yo(e), r = Qo(), e !== null && !kc ? ($o(e, t, a), al(e, t, a)) : (K && r && Ji(t), t.flags |= 1, Ac(e, t, n, a), t.child);
	}
	function Uc(e, t, n, r, i) {
		if (va(t), t.stateNode === null) {
			var a = wi, o = n.contextType;
			typeof o == "object" && o && (a = ya(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = hc, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, co(t), o = n.contextType, a.context = typeof o == "object" && o ? ya(o) : wi, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (mc(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && hc.enqueueReplaceState(a, a.state, null), _o(t, r, a, i), go(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = vc(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = wi, typeof u == "object" && u && (o = ya(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && _c(t, a, r, o), so = !1;
			var f = t.memoizedState;
			a.state = f, _o(t, r, a, i), go(), l = t.memoizedState, s || f !== l || so ? (typeof d == "function" && (mc(t, n, d, r), l = t.memoizedState), (c = so || gc(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, lo(e, t), o = t.memoizedProps, u = vc(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = wi, typeof l == "object" && l && (c = ya(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && _c(t, a, r, c), so = !1, f = t.memoizedState, a.state = f, _o(t, r, a, i), go();
			var p = t.memoizedState;
			o !== d || f !== p || so || e !== null && e.dependencies !== null && _a(e.dependencies) ? (typeof s == "function" && (mc(t, n, s, r), p = t.memoizedState), (u = so || gc(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && _a(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, Bc(e, t), r = !!(t.flags & 128), a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = ao(t, e.child, null, i), t.child = ao(t, null, n, i)) : Ac(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = al(e, t, i), e;
	}
	function Wc(e, t, n, r) {
		return oa(), t.flags |= 256, Ac(e, t, n, r), t.child;
	}
	var Gc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function Kc(e) {
		return {
			baseLanes: e,
			cachePool: Ha()
		};
	}
	function qc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= sd), e;
	}
	function Jc(e, t, n) {
		var r = t.pendingProps, i = !1, a = !!(t.flags & 128), o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : !!(Mo.current & 2)), o && (i = !0, t.flags &= -129), o = !!(t.flags & 32), t.flags &= -33, e === null) {
			if (K) {
				if (i ? Do(t) : Ao(), (e = Qi) ? (e = am(e, ea), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Ui === null ? null : {
						id: Wi,
						overflow: Gi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Ni(e), n.return = t, t.child = n, Zi = t, Qi = null)) : e = null, e === null) throw na(t);
				return t.lanes = sm(e) ? 32 : 536870912, null;
			}
			return a = r.children, r = r.fallback, i ? (Ao(), i = t.mode, a = Xc({
				mode: "hidden",
				children: a
			}, i), r = ji(r, i, n, null), a.return = t, r.return = t, a.sibling = r, t.child = a, r = t.child, r.memoizedState = Kc(n), r.childLanes = qc(e, o, n), t.memoizedState = Gc, Fc(null, r)) : (Do(t), Yc(t, a));
		}
		var s = e.memoizedState;
		if (s !== null) {
			var c = s.dehydrated;
			if (c !== null) return Qc(e, t, a, o, r, c, s, n);
		}
		return i ? (Ao(), i = r.fallback, a = t.mode, s = e.child, c = s.sibling, r = Oi(s, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = s.subtreeFlags & 1206910976, c === null ? (i = ji(i, a, n, null), i.flags |= 2) : i = Oi(c, i), i.return = t, r.return = t, r.sibling = i, t.child = r, Fc(null, r), r = t.child, i = e.child.memoizedState, i === null ? i = Kc(n) : (a = i.cachePool, a === null ? a = Ha() : (s = Ta._currentValue, a = a.parent === s ? a : {
			parent: s,
			pool: s
		}), i = {
			baseLanes: i.baseLanes | n,
			cachePool: a
		}), r.memoizedState = i, r.childLanes = qc(e, o, n), t.memoizedState = Gc, Fc(e.child, r)) : (Do(t), n = e.child, e = n.sibling, n = Oi(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function Yc(e, t) {
		return t = Xc({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function Xc(e, t) {
		return e = Ei(22, e, null, t), e.lanes = 0, e;
	}
	function Zc(e, t, n) {
		return ao(t, e.child, null, n), e = Yc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function Qc(e, t, n, r, a, o, s, c) {
		if (n) return t.flags & 256 ? (Do(t), t.flags &= -257, Zc(e, t, c)) : t.memoizedState === null ? (Ao(), o = a.fallback, s = t.mode, a = Xc({
			mode: "visible",
			children: a.children
		}, s), o = ji(o, s, c, null), o.flags |= 2, a.return = t, o.return = t, a.sibling = o, t.child = a, ao(t, e.child, null, c), a = t.child, a.memoizedState = Kc(c), a.childLanes = qc(e, r, c), t.memoizedState = Gc, Fc(null, a)) : (Ao(), t.child = e.child, t.flags |= 128, null);
		if (Do(t), sm(o)) {
			if (r = o.nextSibling && o.nextSibling.dataset, r) var l = r.dgst;
			return r = l, r !== "" && (a = Error(i(419)), a.stack = "", a.digest = r, ca({
				value: a,
				source: null,
				stack: null
			})), Zc(e, t, c);
		}
		if (kc || ga(e, t, c, !1), r = (c & e.childLanes) !== 0, kc || r) {
			if (bo.current !== null) return Zc(e, t, c);
			if (r = Zu, r !== null && (a = ht(r, c), a !== 0 && a !== s.retryLane)) throw s.retryLane = a, xi(e, a), Md(r, e, a), Oc;
			return om(o) || Wd(), Zc(e, t, c);
		}
		return om(o) ? (t.flags |= 192, t.child = e.child, null) : (e = s.treeContext, Qi = lm(o.nextSibling), Zi = t, K = !0, $i = null, ea = !1, e !== null && Xi(t, e), t = Yc(t, a.children), t.flags |= 134221824, t);
	}
	function $c(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), ma(e.return, t, n);
	}
	function el(e) {
		for (var t = null; e !== null;) {
			var n = e.alternate;
			n !== null && Fo(n) === null && (t = e), e = e.sibling;
		}
		return t;
	}
	function tl(e, t, n, r, i, a) {
		var o = e.memoizedState;
		o === null ? e.memoizedState = {
			isBackwards: t,
			rendering: null,
			renderingStartTime: 0,
			last: r,
			tail: n,
			tailMode: i,
			treeForkCount: a
		} : (o.isBackwards = t, o.rendering = null, o.renderingStartTime = 0, o.last = r, o.tail = n, o.tailMode = i, o.treeForkCount = a);
	}
	function nl(e) {
		var t = e.child;
		for (e.child = null; t !== null;) {
			var n = t.sibling;
			t.sibling = e.child, e.child = t, t = n;
		}
	}
	function rl(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = Mo.current;
		if (t.flags & 128) return No(t, o), null;
		var s = !!(o & 2);
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, No(t, o), i === "backwards" && e !== null ? (nl(e), Ac(e, t, r, n), nl(e)) : Ac(e, t, r, n), r = K ? Bi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && $c(e, n, t);
			else if (e.tag === 19) $c(e, n, t);
			else if (e.child !== null) {
				e.child.return = e, e = e.child;
				continue;
			}
			if (e === t) break a;
			for (; e.sibling === null;) {
				if (e.return === null || e.return === t) break a;
				e = e.return;
			}
			e.sibling.return = e.return, e = e.sibling;
		}
		switch (i) {
			case "backwards":
				n = el(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null, nl(t)), tl(t, !0, i, null, a, r);
				break;
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && Fo(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				tl(t, !0, n, null, a, r);
				break;
			case "together":
				tl(t, !1, null, null, void 0, r);
				break;
			case "independent":
				t.memoizedState = null;
				break;
			default: n = el(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), tl(t, !1, i, n, a, r);
		}
		return t.child;
	}
	function il(e, t, n) {
		var r = t.pendingProps;
		return fa(t, t.type, r.value), Ac(e, t, r.children, n), t.child;
	}
	function al(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), id |= t.lanes, (n & t.childLanes) === 0) {
			if (e !== null) {
				if (ga(e, t, n, !1), (n & t.childLanes) === 0) return null;
			} else return null;
		}
		if (e !== null && t.child !== e.child) throw Error(i(153));
		if (t.child !== null) {
			for (e = t.child, n = Oi(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = Oi(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function ol(e, t) {
		return (e.lanes & t) !== 0 || (e = e.dependencies, !!(e !== null && _a(e)));
	}
	function sl(e, t, n) {
		switch (t.tag) {
			case 3:
				De(t, t.stateNode.containerInfo), fa(t, Ta, e.memoizedState.cache), oa();
				break;
			case 27:
			case 5:
				ke(t);
				break;
			case 4:
				De(t, t.stateNode.containerInfo);
				break;
			case 10:
				fa(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, Oo(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) {
					if (r.dehydrated !== null) return Do(t), t.flags |= 128, null;
					r = ga(e, t, n, !1);
					var i = t.child.childLanes;
					return r || (n & i) !== 0 ? Jc(e, t, n) : (Do(t), e = al(e, t, n), e === null ? null : e.sibling);
				}
				Do(t);
				break;
			case 19:
				if (t.flags & 128) return rl(e, t, n);
				if (i = !!(e.flags & 128), r = (n & t.childLanes) !== 0, r ||= (ga(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return rl(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), No(t, Mo.current), r) break;
				return null;
			case 22: return t.lanes = 0, Pc(e, t, n, t.pendingProps);
			case 24: fa(t, Ta, e.memoizedState.cache);
		}
		return al(e, t, n);
	}
	function cl(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps) kc = !0;
			else {
				if (!ol(e, n) && !(t.flags & 128)) return kc = !1, sl(e, t, n);
				kc = !!(e.flags & 131072);
			}
		} else kc = !1, K && t.flags & 1048576 && qi(t, Bi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = Ya(t.elementType), t.type = e, typeof e == "function") Di(e) ? (r = vc(e, r), t.tag = 1, t = Uc(null, t, e, r, n)) : (t.tag = 0, t = Vc(null, t, e, r, n));
					else {
						if (e != null) {
							var a = e.$$typeof;
							if (a === A) {
								t.tag = 11, t = jc(null, t, e, r, n);
								break a;
							}
							if (a === ce) {
								t.tag = 14, t = Mc(null, t, e, r, n);
								break a;
							}
							if (a === ae) {
								t.tag = 10, t.type = e, t = il(null, t, n);
								break a;
							}
						}
						throw t = ve(e) || e, Error(i(306, t, ""));
					}
				}
				return t;
			case 0: return Vc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, a = vc(r, t.pendingProps), Uc(e, t, r, a, n);
			case 3:
				a: {
					if (De(t, t.stateNode.containerInfo), e === null) throw Error(i(387));
					r = t.pendingProps;
					var o = t.memoizedState;
					a = o.element, lo(e, t), _o(t, r, null, n);
					var s = t.memoizedState;
					if (r = s.cache, fa(t, Ta, r), r !== o.cache && ha(t, [Ta], n, !0), go(), r = s.element, o.isDehydrated) {
						if (o = {
							element: r,
							isDehydrated: !1,
							cache: s.cache
						}, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
							t = Wc(e, t, r, n);
							break a;
						}
						if (r !== a) {
							a = Ii(Error(i(424)), t), ca(a), t = Wc(e, t, r, n);
							break a;
						}
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (Qi = lm(e.firstChild), Zi = t, K = !0, $i = null, ea = !0, n = oo(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 134221824, n = n.sibling;
					} else {
						if (oa(), r === a) {
							t = al(e, t, n);
							break a;
						}
						Ac(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return Bc(e, t), e === null ? (n = Nm(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : K || (t.stateNode = fp(t.type, t.pendingProps, Te.current, t)) : t.memoizedState = Nm(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return ke(t), e === null && K && (r = t.stateNode = hm(t.type, t.pendingProps, Te.current), Zi = t, ea = !0, a = Qi, Sp(t.type) ? (um = a, Qi = lm(r.firstChild)) : Qi = a), Ac(e, t, t.pendingProps.children, n), Bc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && K && ((a = r = Qi) && (r = rm(r, t.type, t.pendingProps, ea), r === null ? a = !1 : (t.stateNode = r, Zi = t, Qi = lm(r.firstChild), ea = !1, a = !0)), a || na(t)), ke(t), a = t.type, o = t.pendingProps, s = e === null ? null : e.memoizedProps, r = o.children, pp(a, o) ? r = null : s !== null && pp(a, s) && (t.flags |= 32), t.memoizedState !== null && (a = Jo(e, t, Zo, null, null, n), sh._currentValue = a), Bc(e, t), Ac(e, t, r, n), t.child;
			case 6: return e === null && K && ((e = n = Qi) && (n = im(n, t.pendingProps, ea), n === null ? e = !1 : (t.stateNode = n, Zi = t, Qi = null, e = !0)), e || na(t)), null;
			case 13: return Jc(e, t, n);
			case 4: return De(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = ao(t, null, r, n) : Ac(e, t, r, n), t.child;
			case 11: return jc(e, t, t.type, t.pendingProps, n);
			case 7: return r = t.pendingProps, Bc(e, t), Ac(e, t, r, n), t.child;
			case 8: return Ac(e, t, t.pendingProps.children, n), t.child;
			case 12: return Ac(e, t, t.pendingProps.children, n), t.child;
			case 10: return il(e, t, n);
			case 9: return a = t.type._context, r = t.pendingProps.children, va(t), a = ya(a), r = r(a), t.flags |= 1, Ac(e, t, r, n), t.child;
			case 14: return Mc(e, t, t.type, t.pendingProps, n);
			case 15: return Nc(e, t, t.type, t.pendingProps, n);
			case 19: return rl(e, t, n);
			case 31: return zc(e, t, n);
			case 22: return Pc(e, t, n, t.pendingProps);
			case 24: return va(t), r = ya(Ta), e === null ? (a = Ba(), a === null && (a = Zu, o = Ea(), a.pooledCache = o, o.refCount++, o !== null && (a.pooledCacheLanes |= n), a = o), t.memoizedState = {
				parent: r,
				cache: a
			}, co(t), fa(t, Ta, a)) : ((e.lanes & n) !== 0 && (lo(e, t), _o(t, null, null, n), go()), a = e.memoizedState, o = t.memoizedState, a.parent === r ? (r = o.cache, fa(t, Ta, r), r !== a.cache && ha(t, [Ta], n, !0)) : (a = {
				parent: r,
				cache: r
			}, t.memoizedState = a, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = a), fa(t, Ta, r))), Ac(e, t, t.pendingProps.children, n), t.child;
			case 30: return t.stateNode === null && (t.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}), r = t.pendingProps, r.name != null && r.name !== "auto" ? t.flags |= e === null ? 18882560 : 18874368 : K && Ji(t), e !== null && e.memoizedProps.name !== r.name ? t.flags |= 4194816 : Bc(e, t), Ac(e, t, r.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(i(156, t.tag));
	}
	function ll(e) {
		e.flags |= 4;
	}
	function ul(e, t, n, r, i) {
		var a;
		if ((a = !!(e.mode & 32)) && (a = n === null ? Jm(t, r) : Jm(t, r) && (r.src !== n.src || r.srcSet !== n.srcSet)), a) {
			if (e.flags |= 16777216, (i & 335544128) === i) {
				if (e.stateNode.complete) e.flags |= 8192;
				else if (Vd()) e.flags |= 8192;
				else throw Xa = Ka, Wa;
			}
		} else e.flags &= -16777217;
	}
	function dl(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Ym(t)) {
			if (Vd()) e.flags |= 8192;
			else throw Xa = Ka, Wa;
		}
	}
	function fl(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : lt(), e.lanes |= t, cd |= t);
	}
	function pl(e, t) {
		if (!K) switch (e.tailMode) {
			case "visible": break;
			case "collapsed":
				for (var n = e.tail, r = null; n !== null;) n.alternate !== null && (r = n), n = n.sibling;
				r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
				break;
			default:
				for (t = e.tail, n = null; t !== null;) t.alternate !== null && (n = t), t = t.sibling;
				n === null ? e.tail = null : n.sibling = null;
		}
	}
	function ml(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 1206910976, r |= i.flags & 1206910976, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function hl(e, t, n) {
		var r = t.pendingProps;
		switch (Yi(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return ml(t), null;
			case 1: return ml(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), pa(Ta), Oe(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (aa(t) ? ll(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, sa())), ml(t), null;
			case 26:
				var a = t.type, o = t.memoizedState;
				return e === null ? (ll(t), o === null ? (ml(t), ul(t, a, null, r, n)) : (ml(t), dl(t, o))) : o ? o === e.memoizedState ? (ml(t), t.flags &= -16777217) : (ll(t), ml(t), dl(t, o)) : (e = e.memoizedProps, e !== r && ll(t), ml(t), ul(t, a, e, r, n)), null;
			case 27:
				if (Ae(t), n = Te.current, a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && ll(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return ml(t), t.subtreeFlags &= -33554433, null;
					}
					e = Ce.current, aa(t) ? ra(t, e) : (e = hm(a, r, n), t.stateNode = e, ll(t));
				}
				return ml(t), t.subtreeFlags &= -33554433, null;
			case 5:
				if (Ae(t), a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && ll(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return ml(t), t.subtreeFlags &= -33554433, null;
					}
					if (o = Ce.current, aa(t)) ra(t, o);
					else {
						var s = lp(Te.current);
						switch (o) {
							case 1:
								o = s.createElementNS("http://www.w3.org/2000/svg", a);
								break;
							case 2:
								o = s.createElementNS("http://www.w3.org/1998/Math/MathML", a);
								break;
							default: switch (a) {
								case "svg":
									o = s.createElementNS("http://www.w3.org/2000/svg", a);
									break;
								case "math":
									o = s.createElementNS("http://www.w3.org/1998/Math/MathML", a);
									break;
								case "script":
									o = s.createElement("div"), o.innerHTML = "<script><\/script>", o = o.removeChild(o.firstChild);
									break;
								case "select":
									o = typeof r.is == "string" ? s.createElement("select", { is: r.is }) : s.createElement("select"), r.multiple ? o.multiple = !0 : r.size && (o.size = r.size);
									break;
								default: o = typeof r.is == "string" ? s.createElement(a, { is: r.is }) : s.createElement(a);
							}
						}
						o[xt] = t, o[St] = r;
						a: for (s = t.child; s !== null;) {
							if (s.tag === 5 || s.tag === 6) o.appendChild(s.stateNode);
							else if (s.tag !== 4 && s.tag !== 27 && s.child !== null) {
								s.child.return = s, s = s.child;
								continue;
							}
							if (s === t) break a;
							for (; s.sibling === null;) {
								if (s.return === null || s.return === t) break a;
								s = s.return;
							}
							s.sibling.return = s.return, s = s.sibling;
						}
						t.stateNode = o;
						a: switch (np(o, a, r), a) {
							case "button":
							case "input":
							case "select":
							case "textarea":
								r = !!r.autoFocus;
								break a;
							case "img":
								r = !0;
								break a;
							default: r = !1;
						}
						r && ll(t);
					}
				}
				return ml(t), t.subtreeFlags &= -33554433, ul(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && ll(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(i(166));
					if (e = Te.current, aa(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, a = Zi, a !== null) switch (a.tag) {
							case 27:
							case 5: r = a.memoizedProps;
						}
						e[xt] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || $f(e.nodeValue, n)), e || na(t, !0);
					} else e = lp(e).createTextNode(r), e[xt] = t, t.stateNode = e;
				}
				return ml(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = aa(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(i(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(557));
							e[xt] = t;
						} else oa(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						ml(t), e = !1;
					} else n = sa(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (jo(t), t) : (jo(t), null);
					if (t.flags & 128) throw Error(i(558));
				}
				return ml(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (a = aa(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!a) throw Error(i(318));
							if (a = t.memoizedState, a = a === null ? null : a.dehydrated, !a) throw Error(i(317));
							a[xt] = t;
						} else oa(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						ml(t), a = !1;
					} else a = sa(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), a = !0;
					if (!a) return t.flags & 256 ? (jo(t), t) : (jo(t), null);
				}
				return jo(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, a = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (a = r.alternate.memoizedState.cachePool.pool), o = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (o = r.memoizedState.cachePool.pool), o !== a && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), fl(t, t.updateQueue), ml(t), null);
			case 4: return Oe(), e === null && Uf(t.stateNode.containerInfo), t.flags |= 67108864, ml(t), null;
			case 10: return pa(t.type), ml(t), null;
			case 19:
				if (Po(t), r = t.memoizedState, r === null) return ml(t), null;
				if (a = !!(t.flags & 128), o = r.rendering, o === null) {
					if (a) pl(r, !1);
					else {
						if (rd !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (o = Fo(e), o !== null) {
								for (t.flags |= 128, pl(r, !1), e = o.updateQueue, t.updateQueue = e, fl(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) ki(n, e), n = n.sibling;
								return No(t, Mo.current & 1 | 2), K && Ki(t, r.treeForkCount), t.child;
							}
							e = e.sibling;
						}
						r.tail !== null && Ve() > md && (t.flags |= 128, a = !0, pl(r, !1), t.lanes = 4194304);
					}
				} else {
					if (!a) {
						if (e = Fo(o), e !== null) {
							if (t.flags |= 128, a = !0, e = e.updateQueue, t.updateQueue = e, fl(t, e), pl(r, !0), r.tail === null && r.tailMode !== "collapsed" && r.tailMode !== "visible" && !o.alternate && !K) return ml(t), null;
						} else 2 * Ve() - r.renderingStartTime > md && n !== 536870912 && (t.flags |= 128, a = !0, pl(r, !1), t.lanes = 4194304);
					}
					r.isBackwards ? (o.sibling = t.child, t.child = o) : (e = r.last, e === null ? t.child = o : e.sibling = o, r.last = o);
				}
				if (r.tail !== null) {
					e = r.tail;
					a: {
						for (n = e; n !== null;) {
							if (n.alternate !== null) {
								n = !1;
								break a;
							}
							n = n.sibling;
						}
						n = !0;
					}
					return r.rendering = e, r.tail = e.sibling, r.renderingStartTime = Ve(), e.sibling = null, o = Mo.current, o = a ? o & 1 | 2 : o & 1, r.tailMode === "visible" || r.tailMode === "collapsed" || !n || K ? No(t, o) : (n = o, F(To, t), F(Mo, n), Eo === null && (Eo = t)), K && Ki(t, r.treeForkCount), e;
				}
				return ml(t), null;
			case 22:
			case 23: return jo(t), wo(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (ml(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : ml(t), n = t.updateQueue, n !== null && fl(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && Se(za), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), pa(Ta), ml(t), null;
			case 25: return null;
			case 30: return t.flags |= 33554432, ml(t), null;
		}
		throw Error(i(156, t.tag));
	}
	function gl(e, t) {
		switch (Yi(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return pa(Ta), Oe(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return Ae(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (jo(t), t.alternate === null) throw Error(i(340));
					oa();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (jo(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(i(340));
					oa();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return Po(t), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, e = t.memoizedState, e !== null && (e.rendering = null, e.tail = null), t.flags |= 4, t) : null;
			case 4: return Oe(), null;
			case 10: return pa(t.type), null;
			case 22:
			case 23: return jo(t), wo(), e !== null && Se(za), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return pa(Ta), null;
			case 25: return null;
			default: return null;
		}
	}
	function _l(e, t) {
		switch (Yi(t), t.tag) {
			case 3:
				pa(Ta), Oe();
				break;
			case 26:
			case 27:
			case 5:
				Ae(t);
				break;
			case 4:
				Oe();
				break;
			case 31:
				t.memoizedState !== null && jo(t);
				break;
			case 13:
				jo(t);
				break;
			case 19:
				Po(t);
				break;
			case 10:
				pa(t.type);
				break;
			case 22:
			case 23:
				jo(t), wo(), e !== null && Se(za);
				break;
			case 24: pa(Ta);
		}
	}
	function vl(e, t) {
		try {
			var n = t.updateQueue, r = n === null ? null : n.lastEffect;
			if (r !== null) {
				var i = r.next;
				n = i;
				do {
					if ((n.tag & e) === e) {
						r = void 0;
						var a = n.create, o = n.inst;
						r = a(), o.destroy = r;
					}
					n = n.next;
				} while (n !== i);
			}
		} catch (e) {
			ff(t, t.return, e);
		}
	}
	function yl(e, t, n) {
		try {
			var r = t.updateQueue, i = r === null ? null : r.lastEffect;
			if (i !== null) {
				var a = i.next;
				r = a;
				do {
					if ((r.tag & e) === e) {
						var o = r.inst, s = o.destroy;
						if (s !== void 0) {
							o.destroy = void 0, i = t;
							var c = n, l = s;
							try {
								l();
							} catch (e) {
								ff(i, c, e);
							}
						}
					}
					r = r.next;
				} while (r !== a);
			}
		} catch (e) {
			ff(t, t.return, e);
		}
	}
	function bl(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				yo(t, n);
			} catch (t) {
				ff(e, e.return, t);
			}
		}
	}
	function xl(e, t, n) {
		n.props = vc(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			ff(e, t, n);
		}
	}
	function Sl(e, t) {
		try {
			var n = e.ref;
			if (n !== null) {
				switch (e.tag) {
					case 26:
					case 27:
					case 5:
						var r = e.stateNode;
						break;
					case 30:
						var i = e.stateNode, a = pi(e.memoizedProps, i);
						(i.ref === null || i.ref.name !== a) && (i.ref = Pp(a)), r = i.ref;
						break;
					case 7:
						if (e.stateNode === null) {
							var o = new Fp(e);
							h(e.child, !1, Qp, o, void 0, void 0), e.stateNode = o;
						}
						r = e.stateNode;
						break;
					default: r = e.stateNode;
				}
				typeof n == "function" ? e.refCleanup = n(r) : n.current = r;
			}
		} catch (n) {
			ff(e, t, n);
		}
	}
	function Cl(e, t) {
		var n = e.ref, r = e.refCleanup;
		if (n !== null) {
			if (typeof r == "function") try {
				r();
			} catch (n) {
				ff(e, t, n);
			} finally {
				e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
			}
			else if (typeof n == "function") try {
				n(null);
			} catch (n) {
				ff(e, t, n);
			}
			else n.current = null;
		}
	}
	function wl(e, t) {
		if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && e.alternate === null && t !== null) for (var n = 0; n < t.length; n++) em(e.stateNode, t[n]);
	}
	function Tl(e) {
		for (var t = e.return; t !== null && (Ol(t) && em(e.stateNode, t.stateNode), !Dl(t));) t = t.return;
	}
	function El(e) {
		for (var t = e.return; t !== null && (Ol(t) && tm(e.stateNode, t.stateNode), !Dl(t));) t = t.return;
	}
	function Dl(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 27;
	}
	function Ol(e) {
		return e && e.tag === 7 && e.stateNode !== null;
	}
	function kl(e) {
		var t = e.type, n = e.memoizedProps, r = e.stateNode;
		try {
			a: switch (t) {
				case "button":
				case "input":
				case "select":
				case "textarea":
					n.autoFocus && r.focus();
					break a;
				case "img": n.src ? r.src = n.src : n.srcSet && (r.srcset = n.srcSet);
			}
		} catch (t) {
			ff(e, e.return, t);
		}
	}
	function Al(e, t, n) {
		try {
			var r = e.stateNode;
			ip(r, e.type, n, t), r[St] = t;
		} catch (t) {
			ff(e, e.return, t);
		}
	}
	function jl(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Sp(e.type) || e.tag === 4;
	}
	function Ml(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || jl(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Sp(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Nl(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(i, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(i), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = gn)), wl(e, r), B = !0;
		else if (i !== 4 && (i === 27 && (wl(e, r), r = null, Sp(e.type) && (n = e.stateNode, t = null)), e = e.child, e !== null)) for (Nl(e, t, n, r), e = e.sibling; e !== null;) Nl(e, t, n, r), e = e.sibling;
	}
	function Pl(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? n.insertBefore(i, t) : n.appendChild(i), wl(e, r), B = !0;
		else if (i !== 4 && (i === 27 && (wl(e, r), r = null, Sp(e.type) && (n = e.stateNode)), e = e.child, e !== null)) for (Pl(e, t, n, r), e = e.sibling; e !== null;) Pl(e, t, n, r), e = e.sibling;
	}
	function Fl(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			np(t, r, n), t[xt] = e, t[St] = n;
		} catch (t) {
			ff(e, e.return, t);
		}
	}
	var Il = !1, Ll = null;
	function Rl(e) {
		(e.tag === 30 || e.subtreeFlags & 33554432) && (Il = !0);
	}
	var zl = null;
	function Bl() {
		var e = zl;
		return zl = null, e;
	}
	var Vl = 0;
	function Hl(e, t, n, r, i) {
		return Vl = 0, Ul(e.child, t, n, r, i);
	}
	function Ul(e, t, n, r, i) {
		for (var a = !1; e !== null;) {
			if (e.tag === 5) {
				var o = e.stateNode;
				if (r !== null) {
					var s = Op(o);
					r.push(s), s.view && (a = !0);
				} else a || Op(o).view && (a = !0);
				Il = !0, Tp(o, Vl === 0 ? t : t + "_" + Vl, n), Vl++;
			} else e.tag === 22 && e.memoizedState !== null || e.tag === 30 && i || Ul(e.child, t, n, r, i) && (a = !0);
			e = e.sibling;
		}
		return a;
	}
	function Wl(e, t) {
		for (; e !== null;) e.tag === 5 ? Ep(e.stateNode, e.memoizedProps) : e.tag === 22 && e.memoizedState !== null || e.tag === 30 && t || Wl(e.child, t), e = e.sibling;
	}
	function Gl(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if ((e.tag !== 22 || e.memoizedState === null) && (Gl(e), e.tag === 30 && e.flags & 18874368 && e.stateNode.paired)) {
				var t = e.memoizedProps;
				if (t.name == null || t.name === "auto") throw Error(i(544));
				var n = t.name;
				t = hi(t.default, t.share), t !== "none" && (Hl(e, n, t, null, !1) || Wl(e.child, !1));
			}
			e = e.sibling;
		}
	}
	function Kl(e, t) {
		if (e.tag === 30) {
			var n = e.stateNode, r = e.memoizedProps, i = pi(r, n), a = hi(r.default, n.paired ? r.share : r.enter);
			a === "none" ? Gl(e) : Hl(e, i, a, null, !1) ? (Gl(e), n.paired || t || jd(e, r.onEnter)) : Wl(e.child, !1);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Kl(e, t), e = e.sibling;
		else Gl(e);
	}
	function ql(e) {
		if (Ll !== null && Ll.size !== 0) {
			var t = Ll;
			if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
				if (e.tag !== 22 || e.memoizedState === null) {
					if (e.tag === 30 && e.flags & 18874368) {
						var n = e.memoizedProps, r = n.name;
						if (r != null && r !== "auto") {
							var i = t.get(r);
							if (i !== void 0) {
								var a = hi(n.default, n.share);
								if (a !== "none" && (Hl(e, r, a, null, !1) ? (a = e.stateNode, i.paired = a, a.paired = i, jd(e, n.onShare)) : Wl(e.child, !1)), t.delete(r), t.size === 0) break;
							}
						}
					}
					ql(e);
				}
				e = e.sibling;
			}
		}
	}
	function Jl(e) {
		if (e.tag === 30) {
			var t = e.memoizedProps, n = pi(t, e.stateNode), r = Ll === null ? void 0 : Ll.get(n), i = hi(t.default, r === void 0 ? t.exit : t.share);
			i !== "none" && (Hl(e, n, i, null, !1) ? r === void 0 ? jd(e, t.onExit) : (i = e.stateNode, r.paired = i, i.paired = r, Ll.delete(n), jd(e, t.onShare)) : Wl(e.child, !1)), Ll !== null && ql(e);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Jl(e), e = e.sibling;
		else Ll !== null && ql(e);
	}
	function Yl(e) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var t = e.memoizedProps, n = pi(t, e.stateNode);
				t = hi(t.default, t.update), e.flags &= -5, t !== "none" && Hl(e, n, t, e.memoizedState = [], !1);
			} else e.subtreeFlags & 33554432 && Yl(e);
			e = e.sibling;
		}
	}
	function Xl(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if (e.tag !== 22 || e.memoizedState === null) {
				if (e.tag === 30 && e.flags & 18874368) {
					var t = e.stateNode;
					t.paired !== null && (t.paired = null, Wl(e.child, !1));
				}
				Xl(e);
			}
			e = e.sibling;
		}
	}
	function Zl(e) {
		if (e.tag === 30) e.stateNode.paired = null, Wl(e.child, !1), Xl(e);
		else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Zl(e), e = e.sibling;
		else Xl(e);
	}
	function Ql(e) {
		for (e = e.child; e !== null;) e.tag === 30 ? Wl(e.child, !1) : e.subtreeFlags & 33554432 && Ql(e), e = e.sibling;
	}
	function $l(e, t, n, r, i, a, o) {
		for (var s = !1; t !== null;) {
			if (t.tag === 5) {
				var c = t.stateNode;
				if (a !== null && Vl < a.length) {
					var l = a[Vl], u = Op(c);
					(l.view || u.view) && (s = !0);
					var d;
					if (d = !(e.flags & 4)) {
						if (u.clip) d = !0;
						else {
							d = l.rect;
							var f = u.rect;
							d = d.y !== f.y || d.x !== f.x || d.height !== f.height || d.width !== f.width;
						}
					}
					d && (e.flags |= 4), u.abs ? u = !l.abs : (l = l.rect, u = u.rect, u = l.height !== u.height || l.width !== u.width), u && (e.flags |= 32);
				} else e.flags |= 32;
				e.flags & 4 && Tp(c, Vl === 0 ? n : n + "_" + Vl, i), s && e.flags & 4 || (zl === null && (zl = []), zl.push(c, Vl === 0 ? r : r + "_" + Vl, t.memoizedProps)), Vl++;
			} else (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && o ? e.flags |= t.flags & 32 : $l(e, t.child, n, r, i, a, o) && (s = !0));
			t = t.sibling;
		}
		return s;
	}
	function eu(e, t) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var n = e.memoizedProps, r = e.stateNode, i = pi(n, r), a = hi(n.default, n.update);
				if (t) {
					r = r.clones;
					var o = r === null ? null : r.map(kp);
				} else o = e.memoizedState, e.memoizedState = null;
				r = e;
				var s = e.child;
				Vl = 0, i = $l(r, s, i, i, a, o, !1), e.flags & 4 && i && (t || jd(e, n.onUpdate));
			} else e.subtreeFlags & 33554432 && eu(e, t);
			e = e.sibling;
		}
	}
	var tu = !1, J = !1, nu = !1, ru = !1, iu = typeof WeakSet == "function" ? WeakSet : Set, au = null, ou = !1, su = !1, cu = !1, lu = !1;
	function uu(e, t, n) {
		if (e = e.containerInfo, sp = gh, e = Ur(e), Wr(e)) {
			if ("selectionStart" in e) var r = {
				start: e.selectionStart,
				end: e.selectionEnd
			};
			else a: {
				r = (r = e.ownerDocument) && r.defaultView || window;
				var i = r.getSelection && r.getSelection();
				if (i && i.rangeCount !== 0) {
					r = i.anchorNode;
					var a = i.anchorOffset, o = i.focusNode;
					i = i.focusOffset;
					try {
						r.nodeType, o.nodeType;
					} catch {
						r = null;
						break a;
					}
					var s = 0, c = -1, l = -1, u = 0, d = 0, f = e, p = null;
					b: for (;;) {
						for (var m; f !== r || a !== 0 && f.nodeType !== 3 || (c = s + a), f !== o || i !== 0 && f.nodeType !== 3 || (l = s + i), f.nodeType === 3 && (s += f.nodeValue.length), (m = f.firstChild) !== null;) p = f, f = m;
						for (;;) {
							if (f === e) break b;
							if (p === r && ++u === a && (c = s), p === o && ++d === i && (l = s), (m = f.nextSibling) !== null) break;
							f = p, p = f.parentNode;
						}
						f = m;
					}
					r = c === -1 || l === -1 ? null : {
						start: c,
						end: l
					};
				} else r = null;
			}
			r ||= {
				start: 0,
				end: 0
			};
		} else r = null;
		for (cp = {
			focusedElem: e,
			selectionRange: r
		}, gh = !1, n = (n & 335544064) === n, au = t, t = n ? 9270 : 1024; au !== null;) {
			if (e = au, n && (r = e.deletions, r !== null)) for (a = 0; a < r.length; a++) n && Jl(r[a]);
			if (e.alternate === null && e.flags & 2) n && Rl(e), du(n);
			else {
				if (e.tag === 22) {
					if (r = e.alternate, e.memoizedState !== null) {
						r !== null && r.memoizedState === null && n && Jl(r), du(n);
						continue;
					}
					if (r !== null && r.memoizedState !== null) {
						n && Rl(e), du(n);
						continue;
					}
				}
				r = e.child, (e.subtreeFlags & t) !== 0 && r !== null ? (r.return = e, au = r) : (n && Yl(e), du(n));
			}
		}
		Ll = null;
	}
	function du(e) {
		for (; au !== null;) {
			var t = au, n = e, r = t.alternate, a = t.flags;
			switch (t.tag) {
				case 0:
				case 11:
				case 15: break;
				case 1:
					if (a & 1024 && r !== null) {
						n = void 0, a = r.memoizedProps, r = r.memoizedState;
						var o = t.stateNode;
						try {
							var s = vc(t.type, a);
							n = o.getSnapshotBeforeUpdate(s, r), o.__reactInternalSnapshotBeforeUpdate = n;
						} catch (e) {
							ff(t, t.return, e);
						}
					}
					break;
				case 3:
					if (a & 1024) {
						if (r = t.stateNode.containerInfo, n = r.nodeType, n === 9) nm(r);
						else if (n === 1) switch (r.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								nm(r);
								break;
							default: r.textContent = "";
						}
					}
					break;
				case 5:
				case 26:
				case 27:
				case 6:
				case 4:
				case 17: break;
				case 30:
					n && r !== null && (n = pi(r.memoizedProps, r.stateNode), a = t.memoizedProps, a = hi(a.default, a.update), a !== "none" && Hl(r, n, a, r.memoizedState = [], !0));
					break;
				default: if (a & 1024) throw Error(i(163));
			}
			if (r = t.sibling, r !== null) {
				r.return = t.return, au = r;
				break;
			}
			au = t.return;
		}
	}
	function fu(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				Mu(e, n), r & 4 && vl(5, n);
				break;
			case 1:
				if (Mu(e, n), r & 4) {
					if (e = n.stateNode, t === null) try {
						e.componentDidMount();
					} catch (e) {
						ff(n, n.return, e);
					}
					else {
						var i = vc(n.type, t.memoizedProps);
						t = t.memoizedState;
						try {
							e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
						} catch (e) {
							ff(n, n.return, e);
						}
					}
				}
				r & 64 && bl(n), r & 512 && Sl(n, n.return);
				break;
			case 3:
				if (Mu(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
					if (t = null, n.child !== null) switch (n.child.tag) {
						case 27:
						case 5:
							t = n.child.stateNode;
							break;
						case 1: t = n.child.stateNode;
					}
					try {
						yo(e, t);
					} catch (e) {
						ff(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && Fl(n);
			case 26:
			case 5:
				Mu(e, n), t === null && r & 4 && kl(n), r & 512 && Sl(n, n.return);
				break;
			case 12:
				Mu(e, n);
				break;
			case 31:
				Mu(e, n), r & 4 && xu(e, n);
				break;
			case 13:
				Mu(e, n), r & 4 && Su(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = gf.bind(null, n), cm(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || tu, !r) {
					var a = t !== null && t.memoizedState !== null || J;
					t = tu, i = J, tu = r, (J = a) && !i ? (r = 2, n.subtreeFlags & 8772 && (r |= 1), Pu(e, n, r)) : Mu(e, n), tu = t, J = i;
				}
				break;
			case 30:
				Mu(e, n), r & 512 && Sl(n, n.return);
				break;
			case 7: r & 512 && Sl(n, n.return);
			default: Mu(e, n);
		}
	}
	function pu(e, t) {
		for (e = e.child; e !== null;) mu(e, t), e = e.sibling;
	}
	function mu(e, t) {
		switch (e.tag) {
			case 5:
			case 26:
				try {
					var n = e.stateNode;
					if (t) {
						var r = n.style;
						typeof r.setProperty == "function" ? r.setProperty("display", "none", "important") : r.display = "none";
					} else {
						var i = e.stateNode, a = e.memoizedProps.style, o = a != null && a.hasOwnProperty("display") ? a.display : null;
						i.style.display = o == null || typeof o == "boolean" ? "" : ("" + o).trim();
					}
				} catch (t) {
					ff(e, e.return, t);
				}
				hu(e, t);
				break;
			case 6:
				try {
					e.stateNode.nodeValue = t ? "" : e.memoizedProps, B = !0;
				} catch (t) {
					ff(e, e.return, t);
				}
				break;
			case 18:
				try {
					var s = e.stateNode;
					t ? wp(s, !0) : wp(e.stateNode, !1);
				} catch (t) {
					ff(e, e.return, t);
				}
				break;
			case 22:
			case 23:
				e.memoizedState === null && pu(e, t);
				break;
			default: pu(e, t);
		}
	}
	function hu(e, t) {
		if (e.subtreeFlags & 67108864) for (e = e.child; e !== null;) {
			a: {
				var n = e, r = t;
				switch (n.tag) {
					case 4:
						mu(n, r);
						break a;
					case 22:
						n.memoizedState === null && hu(n, r);
						break a;
					default: hu(n, r);
				}
			}
			e = e.sibling;
		}
	}
	function gu(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, gu(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && At(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var _u = null, vu = !1;
	function yu(e, t, n) {
		for (n = n.child; n !== null;) bu(e, t, n), n = n.sibling;
	}
	function bu(e, t, n) {
		if (Ze && typeof Ze.onCommitFiberUnmount == "function") try {
			Ze.onCommitFiberUnmount(Xe, n);
		} catch {}
		switch (n.tag) {
			case 26:
				J || Cl(n, t), yu(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && !J && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				J || Cl(n, t), El(n);
				var r = _u, i = vu;
				Sp(n.type) && (_u = n.stateNode, vu = !1), yu(e, t, n), gm(n.stateNode, n.type, n.memoizedProps), _u = r, vu = i;
				break;
			case 5: J || Cl(n, t), El(n);
			case 6:
				if (n.tag === 6 && El(n), r = _u, i = vu, _u = null, yu(e, t, n), _u = r, vu = i, _u !== null) {
					if (vu) try {
						(_u.nodeType === 9 ? _u.body : _u.nodeName === "HTML" ? _u.ownerDocument.body : _u).removeChild(n.stateNode), B = !0;
					} catch (e) {
						ff(n, t, e);
					}
					else try {
						_u.removeChild(n.stateNode), B = !0;
					} catch (e) {
						ff(n, t, e);
					}
				}
				break;
			case 18:
				_u !== null && (vu ? (e = _u, Cp(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Hh(e)) : Cp(_u, n.stateNode));
				break;
			case 4:
				r = _u, i = vu, _u = n.stateNode.containerInfo, vu = !0, yu(e, t, n), _u = r, vu = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				yl(2, n, t), J || yl(4, n, t), yu(e, t, n);
				break;
			case 1:
				J || (Cl(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && xl(n, t, r)), yu(e, t, n);
				break;
			case 21:
				yu(e, t, n);
				break;
			case 22:
				J = (r = J) || n.memoizedState !== null, yu(e, t, n), J = r;
				break;
			case 30:
				Cl(n, t), yu(e, t, n);
				break;
			case 7:
				J || Cl(n, t), yu(e, t, n);
				break;
			default: yu(e, t, n);
		}
	}
	function xu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Hh(e);
			} catch (e) {
				ff(t, t.return, e);
			}
		}
	}
	function Su(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Hh(e);
		} catch (e) {
			ff(t, t.return, e);
		}
	}
	function Cu(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new iu()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new iu()), t;
			default: throw Error(i(435, e.tag));
		}
	}
	function wu(e, t) {
		var n = Cu(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = _f.bind(null, e, t);
				t.then(r, r);
			}
		});
	}
	function Tu(e, t, n) {
		var r = t.deletions;
		if (r !== null) for (var a = 0; a < r.length; a++) {
			var o = r[a], s = e, c = t, l = c;
			a: for (; l !== null;) {
				switch (l.tag) {
					case 27:
						if (Sp(l.type)) {
							_u = l.stateNode, vu = !1;
							break a;
						}
						break;
					case 5:
						_u = l.stateNode, vu = !1;
						break a;
					case 3:
					case 4:
						_u = l.stateNode.containerInfo, vu = !0;
						break a;
				}
				l = l.return;
			}
			if (_u === null) throw Error(i(160));
			bu(s, c, o), _u = null, vu = !1, s = o.alternate, s !== null && (s.return = null), o.return = null;
		}
		if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) Du(t, e, n), t = t.sibling;
	}
	var Eu = null;
	function Du(e, t, n) {
		var r = e.alternate, a = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				if (a & 4 && (r = e.updateQueue, r = r === null ? null : r.events, r !== null)) for (var o = 0; o < r.length; o++) {
					var s = r[o];
					s.ref.impl = s.nextImpl;
				}
				Tu(t, e, n), Ou(e), a & 4 && (yl(3, e, e.return), vl(3, e), yl(5, e, e.return));
				break;
			case 1:
				Tu(t, e, n), Ou(e), a & 512 && (J || r === null || Cl(r, r.return)), a & 64 && tu && (e = e.updateQueue, e !== null && (t = e.callbacks, t !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? t : n.concat(t))));
				break;
			case 26:
				if (o = Eu, Tu(t, e, n), Ou(e), a & 512 && (J || r === null || Cl(r, r.return)), a & 4) {
					if (a = r === null ? null : r.memoizedState, n = e.memoizedState, r === null) {
						if (n === null) {
							if (e.stateNode === null) {
								if (tu) e.stateNode = fp(e.type, e.memoizedProps, t.containerInfo, e);
								else {
									a: {
										t = e.type, n = e.memoizedProps, a = o.ownerDocument || o;
										b: switch (t) {
											case "title":
												r = a.getElementsByTagName("title")[0], (!r || r[Ot] || r[xt] || r.namespaceURI === "http://www.w3.org/2000/svg" || r.hasAttribute("itemprop")) && (r = a.createElement(t), a.head.insertBefore(r, a.querySelector("head > title"))), np(r, t, n), r[xt] = e, Ft(r), t = r;
												break a;
											case "link":
												if (o = Gm("link", "href", a).get(t + (n.href || ""))) {
													for (s = 0; s < o.length; s++) if (r = o[s], r.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && r.getAttribute("rel") === (n.rel == null ? null : n.rel) && r.getAttribute("title") === (n.title == null ? null : n.title) && r.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
														o.splice(s, 1);
														break b;
													}
												}
												r = a.createElement(t), np(r, t, n), a.head.appendChild(r);
												break;
											case "meta":
												if (o = Gm("meta", "content", a).get(t + (n.content || ""))) {
													for (s = 0; s < o.length; s++) if (r = o[s], r.getAttribute("content") === (n.content == null ? null : "" + n.content) && r.getAttribute("name") === (n.name == null ? null : n.name) && r.getAttribute("property") === (n.property == null ? null : n.property) && r.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && r.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
														o.splice(s, 1);
														break b;
													}
												}
												r = a.createElement(t), np(r, t, n), a.head.appendChild(r);
												break;
											default: throw Error(i(468, t));
										}
										r[xt] = e, Ft(r), t = r;
									}
									e.stateNode = t;
								}
							} else tu || Km(o, e.type, e.stateNode);
						} else e.stateNode = Bm(o, n, e.memoizedProps);
					} else a === n ? n === null && e.stateNode !== null && Al(e, e.memoizedProps, r.memoizedProps) : (a === null ? (t = r.stateNode, t === null || J || t.parentNode.removeChild(t)) : a.count--, n === null ? tu || Km(o, e.type, e.stateNode) : Bm(o, n, e.memoizedProps));
				}
				break;
			case 27:
				Tu(t, e, n), Ou(e), a & 512 && (J || r === null || Cl(r, r.return)), r !== null && a & 4 && Al(e, e.memoizedProps, r.memoizedProps);
				break;
			case 5:
				if (o = nu, nu = !1, Tu(t, e, n), nu = o, Ou(e), a & 512 && (J || r === null || Cl(r, r.return)), e.flags & 32) {
					t = e.stateNode;
					try {
						cn(t, ""), B = !0;
					} catch (t) {
						ff(e, e.return, t);
					}
				}
				a & 4 && e.stateNode != null && (t = e.memoizedProps, Al(e, t, r === null ? t : r.memoizedProps)), a & 1024 && (ru = !0);
				break;
			case 6:
				if (Tu(t, e, n), Ou(e), a & 4) {
					if (e.stateNode === null) throw Error(i(162));
					t = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = t, B = !0;
					} catch (t) {
						ff(e, e.return, t);
					}
				}
				break;
			case 3:
				if (B = !1, Wm = null, o = Eu, Eu = bm(t.containerInfo), Tu(t, e, n), Eu = o, Ou(e), a & 4 && r !== null && r.memoizedState.isDehydrated) try {
					Hh(t.containerInfo);
				} catch (t) {
					ff(e, e.return, t);
				}
				ru && (ru = !1, ku(e)), B = !1;
				break;
			case 4:
				a = nu, nu = tu, r = Gt(), o = Eu, Eu = bm(e.stateNode.containerInfo), Tu(t, e, n), Ou(e), Eu = o, B && su && (cu = !0), B = r, nu = a;
				break;
			case 12:
				Tu(t, e, n), Ou(e);
				break;
			case 31:
				Tu(t, e, n), Ou(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, wu(e, t)));
				break;
			case 13:
				Tu(t, e, n), Ou(e), e.child.flags & 8192 && e.memoizedState !== null != (r !== null && r.memoizedState !== null) && (fd = Ve()), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, wu(e, t)));
				break;
			case 22:
				o = e.memoizedState !== null, s = r !== null && r.memoizedState !== null;
				var c = tu, l = J, u = nu;
				tu = c || o, nu = u || o, J = l || s, Tu(t, e, n), J = l, nu = u, tu = c, Ou(e), a & 8192 && (t = e.stateNode, t._visibility = o ? t._visibility & -2 : t._visibility | 1, !o || r === null || s || tu || J || (t = s || J, n = tu, r = J, tu = o || tu, J = t, Nu(e, 2), tu = n, J = r), !o && nu || pu(e, o)), a & 4 && (t = e.updateQueue, t !== null && (n = t.retryQueue, n !== null && (t.retryQueue = null, wu(e, n))));
				break;
			case 19:
				Tu(t, e, n), Ou(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, wu(e, t)));
				break;
			case 30:
				a & 512 && (J || r === null || Cl(r, r.return)), a = Gt(), o = su, s = (n & 335544064) === n, c = e.memoizedProps, su = s && hi(c.default, c.update) !== "none", Tu(t, e, n), Ou(e), s && r !== null && B && (e.flags |= 4), su = o, B = a;
				break;
			case 21: break;
			case 7: a & 512 && (J || r === null || Cl(r, r.return)), r && r.stateNode !== null && (r.stateNode._fragmentFiber = e);
			default: Tu(t, e, n), Ou(e);
		}
	}
	function Ou(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (jl(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				r = null;
				for (var a = e.return; a !== null;) {
					if (Ol(a)) {
						var o = a.stateNode;
						r === null ? r = [o] : r.push(o);
					}
					if (Dl(a)) break;
					a = a.return;
				}
				var s = r;
				if (n == null) throw Error(i(160));
				switch (n.tag) {
					case 27:
						var c = n.stateNode;
						Pl(e, Ml(e), c, s);
						break;
					case 5:
						var l = n.stateNode;
						n.flags & 32 && (cn(l, ""), n.flags &= -33), Pl(e, Ml(e), l, s);
						break;
					case 3:
					case 4:
						var u = n.stateNode.containerInfo;
						Nl(e, Ml(e), u, s);
						break;
					default: throw Error(i(161));
				}
			} catch (t) {
				ff(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function ku(e) {
		if (e.subtreeFlags & 1024) for (e = e.child; e !== null;) {
			var t = e;
			ku(t), t.tag === 5 && t.flags & 1024 && (t = t.stateNode, gh = !0, t.reset(), gh = !1), e = e.sibling;
		}
	}
	function Au(e, t) {
		if (t.subtreeFlags & 9270) for (t = t.child; t !== null;) ju(t, e), t = t.sibling;
		else eu(t, !1);
	}
	function ju(e, t) {
		var n = e.alternate;
		if (n === null) Kl(e, !1);
		else switch (e.tag) {
			case 3:
				if (lu = ou = !1, Bl(), Au(t, e), !ou && !cu) {
					if (e = zl, e !== null) for (var r = 0; r < e.length; r += 3) {
						n = e[r];
						var i = e[r + 1];
						Ep(n, e[r + 2]), n = n.ownerDocument.documentElement, n !== null && n.animate({
							opacity: [0, 0],
							pointerEvents: ["none", "none"]
						}, {
							duration: 0,
							fill: "forwards",
							pseudoElement: "::view-transition-group(" + i + ")"
						});
					}
					e = t.containerInfo, e = e.nodeType === 9 ? e.documentElement : e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "" && (e.style.viewTransitionName = "none", e.animate({
						opacity: [0, 0],
						pointerEvents: ["none", "none"]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition-group(root)"
					}), e.animate({
						width: [0, 0],
						height: [0, 0]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition"
					})), lu = !0;
				}
				zl = null;
				break;
			case 5:
				Au(t, e);
				break;
			case 4:
				r = ou, ou = !1, Au(t, e), ou && (cu = !0), ou = r;
				break;
			case 22:
				e.memoizedState === null && (n.memoizedState === null ? Au(t, e) : Kl(e, !1));
				break;
			case 30:
				r = ou, i = Bl(), ou = !1, Au(t, e), ou && (e.flags |= 4);
				var a = e.memoizedProps, o = e.stateNode;
				t = pi(a, o), o = pi(n.memoizedProps, o);
				var s = hi(a.default, a.update);
				s === "none" ? t = !1 : (a = n.memoizedState, n.memoizedState = null, n = e.child, Vl = 0, t = $l(e, n, t, o, s, a, !0), Vl !== (a === null ? 0 : a.length) && (e.flags |= 32)), e.flags & 4 && t ? (jd(e, e.memoizedProps.onUpdate), zl = i) : i !== null && (i.push.apply(i, zl), zl = i), ou = e.flags & 32 ? !0 : r;
				break;
			default: Au(t, e);
		}
	}
	function Mu(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) fu(e, t.alternate, t), t = t.sibling;
	}
	function Nu(e, t) {
		for (e = e.child; e !== null;) {
			var n = e, r = t;
			switch (n.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					yl(4, n, n.return), Nu(n, r);
					break;
				case 1:
					Cl(n, n.return);
					var i = n.stateNode;
					typeof i.componentWillUnmount == "function" && xl(n, n.return, i), Nu(n, r);
					break;
				case 27: r & 2 && gm(n.stateNode, n.type, n.memoizedProps);
				case 5:
					Cl(n, n.return), n.tag !== 5 && n.tag !== 27 || El(n), Nu(n, r);
					break;
				case 6:
					El(n);
					break;
				case 26:
					Cl(n, n.return), i = n.stateNode, n.memoizedState !== null || i === null || J || i.parentNode.removeChild(i), Nu(n, r);
					break;
				case 22:
					n.memoizedState === null && Nu(n, r);
					break;
				case 30:
					Cl(n, n.return), Nu(n, r);
					break;
				case 7: Cl(n, n.return);
				default: Nu(n, r);
			}
			e = e.sibling;
		}
	}
	function Pu(e, t, n) {
		for (n = t.subtreeFlags & 8772 ? n : n & -2, t = t.child; t !== null;) {
			var r = t.alternate, i = e, a = t, o = a.flags, s = !!(n & 1);
			switch (a.tag) {
				case 0:
				case 11:
				case 15:
					Pu(i, a, n), vl(4, a);
					break;
				case 1:
					if (Pu(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						ff(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var c = r.stateNode;
						try {
							var l = i.shared.hiddenCallbacks;
							if (l !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < l.length; i++) vo(l[i], c);
						} catch (e) {
							ff(r, r.return, e);
						}
					}
					s && o & 64 && bl(a), Sl(a, a.return);
					break;
				case 27: n & 2 && Fl(a);
				case 5:
					a.tag !== 5 && a.tag !== 27 || Tl(a), Pu(i, a, n), s && r === null && o & 4 && kl(a), Sl(a, a.return);
					break;
				case 6:
					Tl(a);
					break;
				case 26:
					c = a.stateNode, a.memoizedState !== null || c === null || tu || Km(bm(c.ownerDocument), a.type, c), Pu(i, a, n), s && r === null && o & 4 && kl(a), Sl(a, a.return);
					break;
				case 12:
					Pu(i, a, n);
					break;
				case 31:
					Pu(i, a, n), s && o & 4 && xu(i, a);
					break;
				case 13:
					Pu(i, a, n), s && o & 4 && Su(i, a);
					break;
				case 22:
					a.memoizedState === null && Pu(i, a, n), Sl(a, a.return);
					break;
				case 30:
					Pu(i, a, n), Sl(a, a.return);
					break;
				case 7: Sl(a, a.return);
				default: Pu(i, a, n);
			}
			t = t.sibling;
		}
	}
	function Fu(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && Da(n));
	}
	function Iu(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Da(e));
	}
	function Lu(e, t, n, r) {
		var i = (n & 335544064) === n;
		if (t.subtreeFlags & (i ? 10262 : 10256)) for (t = t.child; t !== null;) Ru(e, t, n, r), t = t.sibling;
		else i && Ql(t);
	}
	function Ru(e, t, n, r) {
		var i = (n & 335544064) === n;
		i && t.alternate === null && t.return !== null && t.return.alternate !== null && Zl(t);
		var a = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				Lu(e, t, n, r), a & 2048 && vl(9, t);
				break;
			case 1:
				Lu(e, t, n, r);
				break;
			case 3:
				Lu(e, t, n, r), i && lu && (e = e.containerInfo, e = e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, e.style.viewTransitionName === "root" && (e.style.viewTransitionName = ""), e = e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "none" && (e.style.viewTransitionName = "")), a & 2048 && (a = null, t.alternate !== null && (a = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== a && (t.refCount++, a != null && Da(a)));
				break;
			case 12:
				if (a & 2048) {
					Lu(e, t, n, r), a = t.stateNode;
					try {
						var o = t.memoizedProps, s = o.id, c = o.onPostCommit;
						typeof c == "function" && c(s, t.alternate === null ? "mount" : "update", a.passiveEffectDuration, -0);
					} catch (e) {
						ff(t, t.return, e);
					}
				} else Lu(e, t, n, r);
				break;
			case 31:
				Lu(e, t, n, r);
				break;
			case 13:
				Lu(e, t, n, r);
				break;
			case 23: break;
			case 22:
				o = t.stateNode, s = t.alternate, t.memoizedState === null ? (i && s !== null && s.memoizedState !== null && Zl(t), o._visibility & 2 ? Lu(e, t, n, r) : (o._visibility |= 2, zu(e, t, n, r, !!(t.subtreeFlags & 10256) || !1))) : (i && s !== null && s.memoizedState === null && Zl(s), o._visibility & 2 ? Lu(e, t, n, r) : Bu(e, t)), a & 2048 && Fu(s, t);
				break;
			case 24:
				Lu(e, t, n, r), a & 2048 && Iu(t.alternate, t);
				break;
			case 30:
				i && (a = t.alternate, a !== null && (Wl(a.child, !0), Wl(t.child, !0))), Lu(e, t, n, r);
				break;
			default: Lu(e, t, n, r);
		}
	}
	function zu(e, t, n, r, i) {
		for (i &&= !!(t.subtreeFlags & 10256) || !1, t = t.child; t !== null;) {
			var a = e, o = t, s = n, c = r, l = o.flags;
			switch (o.tag) {
				case 0:
				case 11:
				case 15:
					zu(a, o, s, c, i), vl(8, o);
					break;
				case 23: break;
				case 22:
					var u = o.stateNode;
					o.memoizedState === null ? (u._visibility |= 2, zu(a, o, s, c, i)) : u._visibility & 2 ? zu(a, o, s, c, i) : Bu(a, o), i && l & 2048 && Fu(o.alternate, o);
					break;
				case 24:
					zu(a, o, s, c, i), i && l & 2048 && Iu(o.alternate, o);
					break;
				default: zu(a, o, s, c, i);
			}
			t = t.sibling;
		}
	}
	function Bu(e, t) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
			var n = e, r = t, i = r.flags;
			switch (r.tag) {
				case 22:
					Bu(n, r), i & 2048 && Fu(r.alternate, r);
					break;
				case 24:
					Bu(n, r), i & 2048 && Iu(r.alternate, r);
					break;
				default: Bu(n, r);
			}
			t = t.sibling;
		}
	}
	var Vu = 8192;
	function Hu(e, t, n) {
		if (e.subtreeFlags & Vu) for (e = e.child; e !== null;) Uu(e, t, n), e = e.sibling;
	}
	function Uu(e, t, n) {
		switch (e.tag) {
			case 26:
				Hu(e, t, n), e.flags & Vu && (e.memoizedState === null ? (e = e.stateNode, (t & 335544128) === t && Zm(n, e)) : Qm(n, Eu, e.memoizedState, e.memoizedProps));
				break;
			case 5:
				Hu(e, t, n), e.flags & Vu && (e = e.stateNode, (t & 335544128) === t && Zm(n, e));
				break;
			case 3:
			case 4:
				var r = Eu;
				Eu = bm(e.stateNode.containerInfo), Hu(e, t, n), Eu = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = Vu, Vu = 16777216, Hu(e, t, n), Vu = r) : Hu(e, t, n));
				break;
			case 30:
				if ((e.flags & Vu) !== 0 && (r = e.memoizedProps.name, r != null && r !== "auto")) {
					var i = e.stateNode;
					i.paired = null, Ll === null && (Ll = /* @__PURE__ */ new Map()), Ll.set(r, i);
				}
				Hu(e, t, n);
				break;
			default: Hu(e, t, n);
		}
	}
	function Wu(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function Gu(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				au = r, Ju(r, e);
			}
			Wu(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) Ku(e), e = e.sibling;
	}
	function Ku(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				Gu(e), e.flags & 2048 && yl(9, e, e.return);
				break;
			case 3:
				Gu(e);
				break;
			case 12:
				Gu(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, qu(e)) : Gu(e);
				break;
			default: Gu(e);
		}
	}
	function qu(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				au = r, Ju(r, e);
			}
			Wu(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					yl(8, t, t.return), qu(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, qu(t));
					break;
				default: qu(t);
			}
			e = e.sibling;
		}
	}
	function Ju(e, t) {
		for (; au !== null;) {
			var n = au;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					yl(8, n, t);
					break;
				case 23:
				case 22:
					if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
						var r = n.memoizedState.cachePool.pool;
						r != null && r.refCount++;
					}
					break;
				case 24: Da(n.memoizedState.cache);
			}
			if (r = n.child, r !== null) r.return = n, au = r;
			else a: for (n = e; au !== null;) {
				r = au;
				var i = r.sibling, a = r.return;
				if (gu(r), r === n) {
					au = null;
					break a;
				}
				if (i !== null) {
					i.return = a, au = i;
					break a;
				}
				au = a;
			}
		}
	}
	var Yu = {
		getCacheForType: function(e) {
			var t = ya(Ta), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return ya(Ta).controller.signal;
		}
	}, Xu = typeof WeakMap == "function" ? WeakMap : Map, Y = 0, Zu = null, X = null, Z = 0, Q = 0, Qu = null, $u = !1, ed = !1, td = !1, nd = 0, rd = 0, id = 0, ad = 0, od = 0, sd = 0, cd = 0, ld = null, ud = null, dd = !1, fd = 0, pd = 0, md = Infinity, hd = null, gd = null, _d = 0, vd = null, yd = null, bd = 0, xd = 0, Sd = null, Cd = null, wd = null, Td = null, Ed = null, Dd = 0, Od = null;
	function kd() {
		return Y & 2 && Z !== 0 ? Z & -Z : j.T === null ? vt() : Nf();
	}
	function Ad() {
		if (sd === 0) {
			if (!(Z & 536870912) || K) {
				var e = it;
				it <<= 1, !(it & 3932160) && (it = 262144), sd = e;
			} else sd = 536870912;
		}
		return e = To.current, e !== null && (e.flags |= 32), sd;
	}
	function jd(e, t) {
		if (t != null) {
			var n = e.stateNode, r = n.ref;
			r === null && (r = n.ref = Pp(pi(e.memoizedProps, n))), Td === null && (Td = []), Td.push(t.bind(null, r));
		}
	}
	function Md(e, t, n) {
		(e === Zu && (Q === 2 || Q === 9) || e.cancelPendingCommit !== null) && (zd(e, 0), Id(e, Z, sd, !1)), dt(e, n), Y & 2 && e === Zu || (e === Zu && (!(Y & 2) && (ad |= n), rd === 4 && Id(e, Z, sd, !1)), Tf(e));
	}
	function Nd(e, t, n) {
		if (Y & 6) throw Error(i(327));
		var r = !n && !(t & 127) && (t & e.expiredLanes) === 0 || ot(e, t), a = r ? qd(e, t) : Gd(e, t, !0), o = r;
		do {
			if (a === 0) {
				ed && !r && Id(e, t, 0, !1);
				break;
			}
			if (n = e.current.alternate, o && !Fd(n)) a = Gd(e, t, !1), o = !1;
			else {
				if (a === 2) {
					if (o = t, e.errorRecoveryDisabledLanes & o) var s = 0;
					else s = e.pendingLanes & -536870913, s = s === 0 ? s & 536870912 ? 536870912 : 0 : s;
					if (s !== 0) {
						t = s;
						a: {
							var c = e;
							a = ld;
							var l = c.current.memoizedState.isDehydrated;
							if (l && (zd(c, s).flags |= 256), s = Gd(c, s, !1), s !== 2 && s !== 6) {
								if (td && !l) {
									c.errorRecoveryDisabledLanes |= o, ad |= o, a = 4;
									break a;
								}
								o = ud, ud = a, o !== null && (ud === null ? ud = o : ud.push.apply(ud, o));
							}
							a = s;
						}
						if (o = !1, a !== 2) continue;
					}
				}
				if (a === 1) {
					zd(e, 0), Id(e, t, 0, !0);
					break;
				}
				a: {
					switch (r = e, o = a, o) {
						case 0:
						case 1: throw Error(i(345));
						case 4: if ((t & 4194048) !== t && (t & 62914560) !== t) break;
						case 6:
							Id(r, t, sd, !$u);
							break a;
						case 2:
							ud = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(i(329));
					}
					if ((t & 62914560) === t && (a = fd + 300 - Ve(), 10 < a)) {
						if (Id(r, t, sd, !$u), z(r, 0, !0) !== 0) break a;
						bd = t, r.timeoutHandle = gp(Pd.bind(null, r, n, ud, hd, dd, t, sd, ad, cd, $u, o, "Throttled", -0, 0), a);
						break a;
					}
					Pd(r, n, ud, hd, dd, t, sd, ad, cd, $u, o, null, -0, 0);
				}
				break;
			}
		} while (1);
		Tf(e);
	}
	function Pd(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
		e.timeoutHandle = -1;
		var m = t.subtreeFlags, h = (a & 335544064) === a;
		d = null, (h || m & 8192 || (m & 16785408) == 16785408) && (d = {
			stylesheets: null,
			count: 0,
			imgCount: 0,
			imgBytes: 0,
			suspenseyImages: [],
			waitingForImages: !0,
			waitingForViewTransition: !1,
			unsuspend: gn
		}, Ll = null, Uu(t, a, d), h && (m = d, h = e.containerInfo, h = (h.nodeType === 9 ? h : h.ownerDocument).__reactViewTransition, h != null && (m.count++, m.waitingForViewTransition = !0, m = nh.bind(m), h.finished.then(m, m))), m = (a & 62914560) === a ? fd - Ve() : (a & 4194048) === a ? pd - Ve() : 0, m = eh(d, m), m !== null) ? (bd = a, e.cancelPendingCommit = m(ef.bind(null, e, t, a, n, r, i, o, s, c, l, u, d, null, f, p)), Id(e, a, o, !l)) : ef(e, t, a, n, r, i, o, s, c, l, u, d);
	}
	function Fd(e) {
		for (var t = e;;) {
			var n = t.tag;
			if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null))) for (var r = 0; r < n.length; r++) {
				var i = n[r], a = i.getSnapshot;
				i = i.value;
				try {
					if (!U(a(), i)) return !1;
				} catch {
					return !1;
				}
			}
			if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
			else {
				if (t === e) break;
				for (; t.sibling === null;) {
					if (t.return === null || t.return === e) return !0;
					t = t.return;
				}
				t.sibling.return = t.return, t = t.sibling;
			}
		}
		return !0;
	}
	function Id(e, t, n, r) {
		t = st(e, t), t &= ~od, t &= ~ad, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - $e(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && pt(e, n, t);
	}
	function Ld() {
		return Y & 6 ? !0 : (Ef(0, !1), !1);
	}
	function Rd() {
		if (X !== null) {
			if (Q === 0) var e = X.return;
			else e = X, da = ua = null, es(e), $a = null, eo = 0, e = X;
			for (; e !== null;) _l(e.alternate, e), e = e.return;
			X = null;
		}
	}
	function zd(e, t) {
		var n = e.timeoutHandle;
		return n !== -1 && (e.timeoutHandle = -1, _p(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), bd = 0, Rd(), Zu = e, X = n = Oi(e.current, null), Z = t, Q = 0, Qu = null, $u = !1, ed = ot(e, t), td = !1, cd = sd = od = ad = id = rd = 0, ud = ld = null, dd = !1, nd = st(e, t), yi(), n;
	}
	function Bd(e, t) {
		q = null, j.H = uc, t === Ua || t === Ga ? (t = Za(), Q = 3) : t === Wa ? (t = Za(), Q = 4) : Q = t === Oc ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, Qu = t, X === null && (rd = 1, Sc(e, Ii(t, e.current)));
	}
	function Vd() {
		var e = To.current;
		return e === null ? !0 : (Z & 4194048) === Z ? Eo === null : (Z & 62914560) === Z || Z & 536870912 ? e === Eo : !1;
	}
	function Hd() {
		var e = j.H;
		return j.H = uc, e === null ? uc : e;
	}
	function Ud() {
		var e = j.A;
		return j.A = Yu, e;
	}
	function Wd() {
		rd = 4, $u || (Z & 4194048) !== Z && To.current !== null || (ed = !0), !(id & 134217727) && !(ad & 134217727) || Zu === null || Id(Zu, Z, sd, !1);
	}
	function Gd(e, t, n) {
		var r = Y;
		Y |= 2;
		var i = Hd(), a = Ud();
		(Zu !== e || Z !== t) && (hd = null, zd(e, t)), t = !1;
		var o = rd;
		a: do
			try {
				if (Q !== 0 && X !== null) {
					var s = X, c = Qu;
					switch (Q) {
						case 8:
							Rd(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							To.current === null && (t = !0);
							var l = Q;
							if (Q = 0, Qu = null, Zd(e, s, c, l), n && ed) {
								o = 0;
								break a;
							}
							break;
						default: l = Q, Q = 0, Qu = null, Zd(e, s, c, l);
					}
				}
				Kd(), o = rd;
				break;
			} catch (t) {
				Bd(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, da = ua = null, Y = r, j.H = i, j.A = a, X === null && (Zu = null, Z = 0, yi()), o;
	}
	function Kd() {
		for (; X !== null;) Yd(X);
	}
	function qd(e, t) {
		var n = Y;
		Y |= 2;
		var r = Hd(), a = Ud();
		Zu !== e || Z !== t ? (hd = null, md = Ve() + 500, zd(e, t)) : ed = ot(e, t);
		a: do
			try {
				if (Q !== 0 && X !== null) {
					t = X;
					var o = Qu;
					b: switch (Q) {
						case 1:
							Q = 0, Qu = null, Zd(e, t, o, 1);
							break;
						case 2:
						case 9:
							if (qa(o)) {
								Q = 0, Qu = null, Xd(t);
								break;
							}
							t = function() {
								Q !== 2 && Q !== 9 || Zu !== e || (Q = 7), Tf(e);
							}, o.then(t, t);
							break a;
						case 3:
							Q = 7;
							break a;
						case 4:
							Q = 5;
							break a;
						case 7:
							qa(o) ? (Q = 0, Qu = null, Xd(t)) : (Q = 0, Qu = null, Zd(e, t, o, 7));
							break;
						case 5:
							var s = null;
							switch (X.tag) {
								case 26: s = X.memoizedState;
								case 5:
								case 27:
									var c = X;
									if (s ? Ym(s) : c.stateNode.complete) {
										Q = 0, Qu = null;
										var l = c.sibling;
										if (l !== null) X = l;
										else {
											var u = c.return;
											u === null ? X = null : (X = u, Qd(u));
										}
										break b;
									}
							}
							Q = 0, Qu = null, Zd(e, t, o, 5);
							break;
						case 6:
							Q = 0, Qu = null, Zd(e, t, o, 6);
							break;
						case 8:
							Rd(), rd = 6;
							break a;
						default: throw Error(i(462));
					}
				}
				Jd();
				break;
			} catch (t) {
				Bd(e, t);
			}
		while (1);
		return da = ua = null, j.H = r, j.A = a, Y = n, X === null ? (Zu = null, Z = 0, yi(), rd) : 0;
	}
	function Jd() {
		for (; X !== null && !ze();) Yd(X);
	}
	function Yd(e) {
		var t = cl(e.alternate, e, nd);
		e.memoizedProps = e.pendingProps, t === null ? Qd(e) : X = t;
	}
	function Xd(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = Hc(n, t, t.pendingProps, t.type, void 0, Z);
				break;
			case 11:
				t = Hc(n, t, t.pendingProps, t.type.render, t.ref, Z);
				break;
			case 5:
				es(t);
				var r = t;
				r === Zi && (K ? (ia(r), r.tag === 5 && r.stateNode != null && (Qi = r.stateNode)) : (ia(r), K = !0));
			default: _l(n, t), t = X = ki(t, nd), t = cl(n, t, nd);
		}
		e.memoizedProps = e.pendingProps, t === null ? Qd(e) : X = t;
	}
	function Zd(e, t, n, r) {
		da = ua = null, es(t), $a = null, eo = 0;
		var i = t.return;
		try {
			if (Dc(e, i, t, n, Z)) {
				rd = 1, Sc(e, Ii(n, e.current)), X = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw X = i, t;
			rd = 1, Sc(e, Ii(n, e.current)), X = null;
			return;
		}
		t.flags & 32768 ? (K || r === 1 ? e = !0 : ed || Z & 536870912 ? e = !1 : ($u = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = To.current, r !== null && r.tag === 13 && (r.flags |= 16384))), $d(t, e)) : Qd(t);
	}
	function Qd(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				$d(t, $u);
				return;
			}
			e = t.return;
			var n = hl(t.alternate, t, nd);
			if (n !== null) {
				X = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				X = t;
				return;
			}
			X = t = e;
		} while (t !== null);
		rd === 0 && (rd = 5);
	}
	function $d(e, t) {
		do {
			var n = gl(e.alternate, e);
			if (n !== null) {
				n.flags &= 32767, X = n;
				return;
			}
			if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
				X = e;
				return;
			}
			X = e = n;
		} while (e !== null);
		rd = 6, X = null;
	}
	function ef(e, t, n, r, a, o, s, c, l, u, d, f) {
		e.cancelPendingCommit = null;
		do
			lf();
		while (_d !== 0);
		if (Y & 6) throw Error(i(327));
		if (t !== null) {
			if (t === e.current) throw Error(i(177));
			e === Zu && (X = Zu = null, Z = 0), yd = t, vd = e, bd = n, Sd = a, Cd = r, tf(e, t, n, s, c, l, f);
		}
	}
	function tf(e, t, n, r, i, a, o) {
		var s = t.lanes | t.childLanes;
		if (xd = s, s |= vi, ft(e, n, s, r, i, a), Td = null, (n & 335544064) === n ? (Ed = Aa(e), r = 10262) : (Ed = null, r = 10256), (t.subtreeFlags & r) !== 0 || (t.flags & r) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, vf(Ge, function() {
			return uf(), null;
		})) : (e.callbackNode = null, e.callbackPriority = 0), Il = !1, r = !!(t.flags & 13878), t.subtreeFlags & 13878 || r) {
			r = j.T, j.T = null, i = M.p, M.p = 2, a = Y, Y |= 4;
			try {
				uu(e, t, n);
			} finally {
				Y = a, M.p = i, j.T = r;
			}
		}
		_d = 1, Il ? wd = Mp(o, e.containerInfo, Ed, af, of, rf, sf, uf, nf, null, null) : (af(), of(), sf());
	}
	function nf(e) {
		if (_d !== 0) {
			var t = vd.onRecoverableError;
			t(e, { componentStack: null });
		}
	}
	function rf() {
		_d === 3 && (_d = 0, ju(yd, vd), _d = 4);
	}
	function af() {
		if (_d === 1) {
			_d = 0;
			var e = vd, t = yd, n = bd, r = !!(t.flags & 13878);
			if (t.subtreeFlags & 13878 || r) {
				r = j.T, j.T = null;
				var i = M.p;
				M.p = 2;
				var a = Y;
				Y |= 4;
				try {
					su = cu = !1, Du(t, e, n), n = cp;
					var o = Ur(e.containerInfo), s = n.focusedElem, c = n.selectionRange;
					if (o !== s && s && s.ownerDocument && Hr(s.ownerDocument.documentElement, s)) {
						if (c !== null && Wr(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = Vr(s, h), v = Vr(s, g);
									if (_ && v && (p.rangeCount !== 1 || p.anchorNode !== _.node || p.anchorOffset !== _.offset || p.focusNode !== v.node || p.focusOffset !== v.offset)) {
										var y = d.createRange();
										y.setStart(_.node, _.offset), p.removeAllRanges(), h > g ? (p.addRange(y), p.extend(v.node, v.offset)) : (y.setEnd(v.node, v.offset), p.addRange(y));
									}
								}
							}
						}
						for (d = [], p = s; p = p.parentNode;) p.nodeType === 1 && d.push({
							element: p,
							left: p.scrollLeft,
							top: p.scrollTop
						});
						for (typeof s.focus == "function" && s.focus(), s = 0; s < d.length; s++) {
							var b = d[s];
							b.element.scrollLeft = b.left, b.element.scrollTop = b.top;
						}
					}
					gh = !!sp, cp = sp = null;
				} finally {
					Y = a, M.p = i, j.T = r;
				}
			}
			e.current = t, _d = 2;
		}
	}
	function of() {
		if (_d === 2) {
			_d = 0;
			var e = vd, t = yd, n = !!(t.flags & 8772);
			if (t.subtreeFlags & 8772 || n) {
				n = j.T, j.T = null;
				var r = M.p;
				M.p = 2;
				var i = Y;
				Y |= 4;
				try {
					fu(e, t.alternate, t);
				} finally {
					Y = i, M.p = r, j.T = n;
				}
			}
			_d = 3;
		}
	}
	function sf() {
		if (_d === 4 || _d === 3) {
			_d = 0;
			var e = wd;
			wd = null, Be();
			var t = vd, n = yd, r = bd, i = Cd, a = (r & 335544064) === r ? 10262 : 10256;
			if ((n.subtreeFlags & a) !== 0 || (n.flags & a) !== 0 ? _d = 5 : (_d = 0, yd = vd = null, cf(t, t.pendingLanes)), a = t.pendingLanes, a === 0 && (gd = null), _t(r), n = n.stateNode, Ze && typeof Ze.onCommitFiberRoot == "function") try {
				Ze.onCommitFiberRoot(Xe, n, void 0, (n.current.flags & 128) == 128);
			} catch {}
			if (i !== null) {
				n = j.T, a = M.p, M.p = 2, j.T = null;
				try {
					for (var o = t.onRecoverableError, s = 0; s < i.length; s++) {
						var c = i[s];
						o(c.value, { componentStack: c.stack });
					}
				} finally {
					j.T = n, M.p = a;
				}
			}
			if (i = Td, o = Ed, Ed = null, i !== null && (Td = null, o === null && (o = []), e !== null)) for (c = 0; c < i.length; c++) n = (0, i[c])(o), n !== void 0 && e.finished.finally(n);
			bd & 3 && lf(), Tf(t), a = t.pendingLanes, r & 261930 && a & 42 ? t === Od ? Dd++ : (Dd = 0, Od = t) : (Dd = 0, Od = null), Ef(0, !1);
		}
	}
	function cf(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Da(t)));
	}
	function lf() {
		return wd !== null && (wd.skipTransition(), wd = null), af(), of(), sf(), uf();
	}
	function uf() {
		if (_d !== 5) return !1;
		var e = vd, t = xd;
		xd = 0;
		var n = _t(bd), r = j.T, a = M.p;
		try {
			M.p = 32 > n ? 32 : n, j.T = null, n = Sd, Sd = null;
			var o = vd, s = bd;
			if (_d = 0, yd = vd = null, bd = 0, Y & 6) throw Error(i(331));
			var c = Y;
			if (Y |= 4, Ku(o.current), Ru(o, o.current, s, n), Y = c, Ef(0, !1), Ze && typeof Ze.onPostCommitFiberRoot == "function") try {
				Ze.onPostCommitFiberRoot(Xe, o);
			} catch {}
			return !0;
		} finally {
			M.p = a, j.T = r, cf(e, t);
		}
	}
	function df(e, t, n) {
		t = Ii(n, t), t = wc(e.stateNode, t, 2), e = fo(e, t, 2), e !== null && (dt(e, 2), Tf(e));
	}
	function ff(e, t, n) {
		if (e.tag === 3) df(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				df(t, e, n);
				break;
			}
			if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (gd === null || !gd.has(r))) {
					e = Ii(n, e), n = Tc(2), r = fo(t, n, 2), r !== null && (Ec(n, r, t, e), dt(r, 2), Tf(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function pf(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Xu();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (td = !0, i.add(n), e = mf.bind(null, e, t, n), t.then(e, e));
	}
	function mf(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Zu === e && (Z & n) === n && (rd === 4 || rd === 3 && (Z & 62914560) === Z && 300 > Ve() - fd ? Y & 2 ? od |= n : zd(e, 0) : od |= n, cd === Z && (cd = 0)), Tf(e);
	}
	function hf(e, t) {
		t === 0 && (t = lt()), e = xi(e, t), e !== null && (dt(e, t), Tf(e));
	}
	function gf(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), hf(e, n);
	}
	function _f(e, t) {
		var n = 0;
		switch (e.tag) {
			case 31:
			case 13:
				var r = e.stateNode, a = e.memoizedState;
				a !== null && (n = a.retryLane);
				break;
			case 19:
				r = e.stateNode;
				break;
			case 22:
				r = e.stateNode._retryCache;
				break;
			default: throw Error(i(314));
		}
		r !== null && r.delete(t), hf(e, n);
	}
	function vf(e, t) {
		return Le(e, t);
	}
	var yf = null, bf = null, xf = !1, Sf = !1, Cf = !1, wf = 0;
	function Tf(e) {
		e !== bf && e.next === null && (bf === null ? yf = bf = e : bf = bf.next = e), Sf = !0, xf || (xf = !0, Mf());
	}
	function Ef(e, t) {
		if (!Cf && Sf) {
			Cf = !0;
			do
				for (var n = !1, r = yf; r !== null;) {
					if (!t) {
						if (e !== 0) {
							var i = r.pendingLanes;
							if (i === 0) var a = 0;
							else {
								var o = r.suspendedLanes, s = r.pingedLanes;
								a = (1 << 31 - $e(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
							}
							a !== 0 && (n = !0, jf(r, a));
						} else a = Z, a = z(r, r === Zu ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || ot(r, a) || (n = !0, jf(r, a));
					}
					r = r.next;
				}
			while (n);
			Cf = !1;
		}
	}
	function Df() {
		Of();
	}
	function Of() {
		Sf = xf = !1;
		var e = 0;
		wf !== 0 && hp() && (e = wf);
		for (var t = Ve(), n = null, r = yf; r !== null;) {
			var i = r.next, a = kf(r, t);
			a === 0 ? (r.next = null, n === null ? yf = i : n.next = i, i === null && (bf = n)) : (n = r, (e !== 0 || a & 3) && (Sf = !0)), r = i;
		}
		_d !== 0 && _d !== 5 || Ef(e, !1), wf !== 0 && (wf = 0);
	}
	function kf(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - $e(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = ct(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = Zu, n = Z, n = z(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (Q === 2 || Q === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && Re(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || ot(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && Re(r), _t(n)) {
				case 2:
				case 8:
					n = We;
					break;
				case 32:
					n = Ge;
					break;
				case 268435456:
					n = qe;
					break;
				default: n = Ge;
			}
			return r = Af.bind(null, e), n = Le(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && Re(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function Af(e, t) {
		if (_d !== 0 && _d !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (lf() && e.callbackNode !== n) return null;
		var r = Z;
		return r = z(e, e === Zu ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (Nd(e, r, t), kf(e, Ve()), e.callbackNode != null && e.callbackNode === n ? Af.bind(null, e) : null);
	}
	function jf(e, t) {
		if (lf()) return null;
		Nd(e, t, !0);
	}
	function Mf() {
		bp(function() {
			Y & 6 ? Le(Ue, Df) : Of();
		});
	}
	function Nf() {
		if (wf === 0) {
			var e = Na;
			e === 0 && (e = rt, rt <<= 1, !(rt & 261888) && (rt = 256)), wf = e;
		}
		return wf;
	}
	function Pf(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : hn(e);
	}
	function Ff(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = Pf((i[St] || null).action), o = r.submitter;
			o && (t = (t = o[St] || null) ? Pf(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new Ln("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (wf !== 0) {
								var e = new FormData(i, o);
								Xs(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = new FormData(i, o), Xs(n, {
							pending: !0,
							data: e,
							method: i.method,
							action: a
						}, a, e));
					},
					currentTarget: i
				}]
			});
		}
	}
	for (var If = 0; If < ui.length; If++) {
		var Lf = ui[If];
		di(Lf.toLowerCase(), "on" + (Lf[0].toUpperCase() + Lf.slice(1)));
	}
	di(ni, "onAnimationEnd"), di(ri, "onAnimationIteration"), di(ii, "onAnimationStart"), di("dblclick", "onDoubleClick"), di("focusin", "onFocus"), di("focusout", "onBlur"), di(ai, "onTransitionRun"), di(oi, "onTransitionStart"), di(si, "onTransitionCancel"), di(ci, "onTransitionEnd"), Bt("onMouseEnter", ["mouseout", "mouseover"]), Bt("onMouseLeave", ["mouseout", "mouseover"]), Bt("onPointerEnter", ["pointerout", "pointerover"]), Bt("onPointerLeave", ["pointerout", "pointerover"]), zt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), zt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), zt("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), zt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), zt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), zt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var Rf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), zf = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Rf));
	function Bf(e, t) {
		t = !!(t & 4);
		for (var n = 0; n < e.length; n++) {
			var r = e[n], i = r.event;
			r = r.listeners;
			a: {
				var a = void 0;
				if (t) for (var o = r.length - 1; 0 <= o; o--) {
					var s = r[o], c = s.instance, l = s.currentTarget;
					if (s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						gi(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						gi(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function $(e, t) {
		var n = t[wt];
		n === void 0 && (n = t[wt] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (Wf(t, e, 2, !1), n.add(r));
	}
	function Vf(e, t, n) {
		var r = 0;
		t && (r |= 4), Wf(n, e, r, t);
	}
	var Hf = "_reactListening" + Math.random().toString(36).slice(2);
	function Uf(e) {
		if (!e[Hf]) {
			e[Hf] = !0, Lt.forEach(function(t) {
				t !== "selectionchange" && (zf.has(t) || Vf(t, !1, e), Vf(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[Hf] || (t[Hf] = !0, Vf("selectionchange", !1, t));
		}
	}
	function Wf(e, t, n, r) {
		switch (Ch(t)) {
			case 2:
				var i = _h;
				break;
			case 8:
				i = vh;
				break;
			default: i = yh;
		}
		n = i.bind(null, t, n, e), i = void 0, !En || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function Gf(e, t, n, r, i) {
		var a = r;
		if (!(t & 1) && !(t & 2) && r !== null) a: for (;;) {
			if (r === null) return;
			var s = r.tag;
			if (s === 3 || s === 4) {
				var c = r.stateNode.containerInfo;
				if (c === i) break;
				if (s === 4) for (s = r.return; s !== null;) {
					var l = s.tag;
					if ((l === 3 || l === 4) && s.stateNode.containerInfo === i) return;
					s = s.return;
				}
				for (; c !== null;) {
					if (s = jt(c), s === null) return;
					if (l = s.tag, l === 5 || l === 6 || l === 26 || l === 27) {
						r = a = s;
						continue a;
					}
					c = c.parentNode;
				}
			}
			r = r.return;
		}
		Cn(function() {
			var r = a, i = vn(n), s = [];
			a: {
				var c = li.get(e);
				if (c !== void 0) {
					var l = Ln, u = e;
					switch (e) {
						case "keypress": if (Mn(n) === 0) break a;
						case "keydown":
						case "keyup":
							l = tr;
							break;
						case "focusin":
							u = "focus", l = Kn;
							break;
						case "focusout":
							u = "blur", l = Kn;
							break;
						case "beforeblur":
						case "afterblur":
							l = Kn;
							break;
						case "click": if (n.button === 2) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							l = Wn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							l = Gn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							l = ir;
							break;
						case ni:
						case ri:
						case ii:
							l = qn;
							break;
						case ci:
							l = ar;
							break;
						case "scroll":
						case "scrollend":
							l = zn;
							break;
						case "wheel":
							l = or;
							break;
						case "copy":
						case "cut":
						case "paste":
							l = Jn;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							l = nr;
							break;
						case "submit":
							l = rr;
							break;
						case "toggle":
						case "beforetoggle": l = sr;
					}
					var d = !!(t & 4), f = !d && (e === "scroll" || e === "scrollend"), p = d ? c === null ? null : c + "Capture" : c;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = wn(m, p), g != null && d.push(Kf(m, g, h))), f) break;
						m = m.return;
					}
					0 < d.length && (c = new l(c, u, null, n, i), s.push({
						event: c,
						listeners: d
					}));
				}
			}
			if (!(t & 7)) {
				a: {
					if (l = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", l && n !== _n && (u = n.relatedTarget || n.fromElement) && (jt(u) || u[Ct])) break a;
					(c || l) && (u = i.window === i ? i : (l = i.ownerDocument) ? l.defaultView || l.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? jt(l) : null, l !== null && (f = o(l), d = l.tag, l !== f || d !== 5 && d !== 27 && d !== 6) && (l = null)) : (c = null, l = r), c !== l && (d = Wn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = nr, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? u : Nt(c), h = l == null ? u : Nt(l), u = new d(g, m + "leave", c, n, i), u.target = f, u.relatedTarget = h, g = null, jt(i) === r && (d = new d(p, m + "enter", l, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, d = c && l ? ee(c, l, Jf) : null, c !== null && Yf(s, u, c, d, !1), l !== null && f !== null && Yf(s, f, l, d, !0)));
				}
				a: {
					if (c = r ? Nt(r) : window, l = c.nodeName && c.nodeName.toLowerCase(), l === "select" || l === "input" && c.type === "file") var _ = Dr;
					else if (xr(c)) {
						if (Or) _ = H;
						else {
							_ = Fr;
							var v = Pr;
						}
					} else l = c.nodeName, !l || l.toLowerCase() !== "input" || c.type !== "checkbox" && c.type !== "radio" ? r && fn(r.elementType) && (_ = Dr) : _ = Ir;
					if (_ &&= _(e, r)) {
						Sr(s, _, n, i);
						break a;
					}
					v && v(e, c, r);
				}
				switch (v = r ? Nt(r) : window, e) {
					case "focusin":
						(xr(v) || v.contentEditable === "true") && (Kr = v, qr = r, Jr = null);
						break;
					case "focusout":
						Jr = qr = Kr = null;
						break;
					case "mousedown":
						Yr = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						Yr = !1, Xr(s, n, i);
						break;
					case "selectionchange": if (Gr) break;
					case "keydown":
					case "keyup": Xr(s, n, i);
				}
				var y;
				if (lr) b: {
					switch (e) {
						case "compositionstart":
							var b = "onCompositionStart";
							break b;
						case "compositionend":
							b = "onCompositionEnd";
							break b;
						case "compositionupdate":
							b = "onCompositionUpdate";
							break b;
					}
					b = void 0;
				}
				else _r ? hr(e, n) && (b = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (b = "onCompositionStart");
				b && (fr && n.locale !== "ko" && (_r || b !== "onCompositionStart" ? b === "onCompositionEnd" && _r && (y = jn()) : (On = i, kn = "value" in On ? On.value : On.textContent, _r = !0)), v = qf(r, b), 0 < v.length && (b = new Yn(b, e, null, n, i), s.push({
					event: b,
					listeners: v
				}), y ? b.data = y : (y = gr(n), y !== null && (b.data = y)))), (y = dr ? vr(e, n) : yr(e, n)) && (b = qf(r, "onBeforeInput"), 0 < b.length && (v = new Yn("onBeforeInput", "beforeinput", null, n, i), s.push({
					event: v,
					listeners: b
				}), v.data = y)), Ff(s, e, r, n, i);
			}
			Bf(s, t);
		});
	}
	function Kf(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function qf(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = wn(e, n), i != null && r.unshift(Kf(e, i, a)), i = wn(e, t), i != null && r.push(Kf(e, i, a))), e.tag === 3) return r;
			e = e.return;
		}
		return [];
	}
	function Jf(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5 && e.tag !== 27);
		return e || null;
	}
	function Yf(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (s = s.tag, c !== null && c === r) break;
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = wn(n, a), l != null && o.unshift(Kf(n, l, c))) : i || (l = wn(n, a), l != null && o.push(Kf(n, l, c)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var Xf = /\r\n?/g, Zf = /\u0000|\uFFFD/g;
	function Qf(e) {
		return (typeof e == "string" ? e : "" + e).replace(Xf, "\n").replace(Zf, "");
	}
	function $f(e, t) {
		return t = Qf(t), Qf(e) === t;
	}
	function ep(e, t, n, r, a, o) {
		switch (n) {
			case "children":
				if (typeof r == "string") t === "body" || t === "textarea" && r === "" || cn(e, r);
				else if (typeof r == "number" || typeof r == "bigint") t !== "body" && cn(e, "" + r);
				else return;
				break;
			case "className":
				qt(e, "class", r);
				break;
			case "tabIndex":
				qt(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				qt(e, n, r);
				break;
			case "style":
				dn(e, r, o);
				return;
			case "data": if (t !== "object") {
				qt(e, "data", r);
				break;
			}
			case "src":
			case "href":
				if (r === "" && (t !== "a" || n !== "href") || r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = hn(r), e.setAttribute(n, r);
				break;
			case "action":
			case "formAction":
				if (typeof r == "function") {
					e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				}
				if (typeof o == "function" && (n === "formAction" ? (t !== "input" && ep(e, t, "name", a.name, a, null), ep(e, t, "formEncType", a.formEncType, a, null), ep(e, t, "formMethod", a.formMethod, a, null), ep(e, t, "formTarget", a.formTarget, a, null)) : (ep(e, t, "encType", a.encType, a, null), ep(e, t, "method", a.method, a, null), ep(e, t, "target", a.target, a, null))), r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = hn(r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = gn);
				return;
			case "onScroll":
				r != null && $("scroll", e);
				return;
			case "onScrollEnd":
				r != null && $("scrollend", e);
				return;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(i(61));
					if (n = r.__html, n != null) {
						if (a.children != null) throw Error(i(60));
						o?.__html !== n && (e.innerHTML = n);
					}
				}
				break;
			case "multiple":
				e.multiple = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "muted":
				e.muted = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "ref": break;
			case "autoFocus": break;
			case "xlinkHref":
				if (r == null || typeof r == "function" || typeof r == "boolean" || typeof r == "symbol") {
					e.removeAttribute("xlink:href");
					break;
				}
				n = hn(r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "credentialless":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				r && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, "") : e.removeAttribute(n);
				break;
			case "capture":
			case "download":
				!0 === r ? e.setAttribute(n, "") : !1 !== r && r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				r != null && typeof r != "function" && typeof r != "symbol" && !isNaN(r) && 1 <= r ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "rowSpan":
			case "start":
				r == null || typeof r == "function" || typeof r == "symbol" || isNaN(r) ? e.removeAttribute(n) : e.setAttribute(n, r);
				break;
			case "popover":
				$("beforetoggle", e), $("toggle", e), Kt(e, "popover", r);
				break;
			case "xlinkActuate":
				Jt(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				Jt(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				Jt(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				Jt(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				Jt(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				Jt(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				Jt(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				Jt(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				Jt(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				Kt(e, "is", r);
				break;
			case "innerText":
			case "textContent": return;
			default: if (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") n = pn.get(n) || n, Kt(e, n, r);
			else return;
		}
		B = !0;
	}
	function tp(e, t, n, r, a, o) {
		switch (n) {
			case "style":
				dn(e, r, o);
				return;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(i(61));
					if (n = r.__html, n != null) {
						if (a.children != null) throw Error(i(60));
						o?.__html !== n && (e.innerHTML = n);
					}
				}
				break;
			case "children":
				if (typeof r == "string") cn(e, r);
				else if (typeof r == "number" || typeof r == "bigint") cn(e, "" + r);
				else return;
				break;
			case "onScroll":
				r != null && $("scroll", e);
				return;
			case "onScrollEnd":
				r != null && $("scrollend", e);
				return;
			case "onClick":
				r != null && (e.onclick = gn);
				return;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": return;
			case "innerText":
			case "textContent": return;
			default:
				if (!Rt.hasOwnProperty(n)) a: {
					if (n[0] === "o" && n[1] === "n" && (a = n.endsWith("Capture"), o = n.slice(2, a ? n.length - 7 : void 0), t = e[St] || null, t = t == null ? null : t[n], typeof t == "function" && e.removeEventListener(o, t, a), typeof r == "function")) {
						typeof t != "function" && t !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(o, r, a);
						break a;
					}
					B = !0, n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : Kt(e, n, r);
				}
				return;
		}
		B = !0;
	}
	function np(e, t, n) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "img":
				$("error", e), $("load", e);
				var r = !1, a = !1, o;
				for (o in n) if (n.hasOwnProperty(o)) {
					var s = n[o];
					if (s != null) switch (o) {
						case "src":
							r = !0;
							break;
						case "srcSet":
							a = !0;
							break;
						case "children":
						case "dangerouslySetInnerHTML": throw Error(i(137, t));
						default: ep(e, t, o, s, n, null);
					}
				}
				a && ep(e, t, "srcSet", n.srcSet, n, null), r && ep(e, t, "src", n.src, n, null);
				return;
			case "input":
				$("invalid", e);
				var c = o = s = a = null, l = null, u = null;
				for (r in n) if (n.hasOwnProperty(r)) {
					var d = n[r];
					if (d != null) switch (r) {
						case "name":
							a = d;
							break;
						case "type":
							s = d;
							break;
						case "checked":
							l = d;
							break;
						case "defaultChecked":
							u = d;
							break;
						case "value":
							o = d;
							break;
						case "defaultValue":
							c = d;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (d != null) throw Error(i(137, t));
							break;
						default: ep(e, t, r, d, n, null);
					}
				}
				nn(e, o, c, l, u, s, a, !1);
				return;
			case "select":
				for (a in $("invalid", e), r = s = o = null, n) if (n.hasOwnProperty(a) && (c = n[a], c != null)) switch (a) {
					case "value":
						o = c;
						break;
					case "defaultValue":
						s = c;
						break;
					case "multiple": r = c;
					default: ep(e, t, a, c, n, null);
				}
				t = o, n = s, e.multiple = !!r, t == null ? n != null && an(e, !!r, n, !0) : an(e, !!r, t, !1);
				return;
			case "textarea":
				for (s in $("invalid", e), o = a = r = null, n) if (n.hasOwnProperty(s) && (c = n[s], c != null)) switch (s) {
					case "value":
						r = c;
						break;
					case "defaultValue":
						a = c;
						break;
					case "children":
						o = c;
						break;
					case "dangerouslySetInnerHTML":
						if (c != null) throw Error(i(91));
						break;
					default: ep(e, t, s, c, n, null);
				}
				sn(e, r, a, o);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: ep(e, t, l, r, n, null);
				}
				return;
			case "dialog":
				$("beforetoggle", e), $("toggle", e), $("cancel", e), $("close", e);
				break;
			case "iframe":
			case "object":
				$("load", e);
				break;
			case "video":
			case "audio":
				for (r = 0; r < Rf.length; r++) $(Rf[r], e);
				break;
			case "image":
				$("error", e), $("load", e);
				break;
			case "details":
				$("toggle", e);
				break;
			case "embed":
			case "source":
			case "link": $("error", e), $("load", e);
			case "area":
			case "base":
			case "br":
			case "col":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "track":
			case "wbr":
			case "menuitem":
				for (u in n) if (n.hasOwnProperty(u) && (r = n[u], r != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML": throw Error(i(137, t));
					default: ep(e, t, u, r, n, null);
				}
				return;
			default: if (fn(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && tp(e, t, d, r, n, void 0));
				return;
			}
		}
		for (c in n) n.hasOwnProperty(c) && (r = n[c], r != null && ep(e, t, c, r, n, null));
	}
	var rp = {};
	function ip(e, t, n, r) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "input":
				var a = null, o = null, s = null, c = null, l = null, u = null, d = null;
				for (m in n) {
					var f = n[m];
					if (n.hasOwnProperty(m) && f != null) switch (m) {
						case "checked": break;
						case "value": break;
						case "defaultValue": l = f;
						default: r.hasOwnProperty(m) || ep(e, t, m, null, r, f);
					}
				}
				for (var p in r) {
					var m = r[p];
					if (f = n[p], r.hasOwnProperty(p) && (m != null || f != null)) switch (p) {
						case "type":
							m !== f && (B = !0), o = m;
							break;
						case "name":
							m !== f && (B = !0), a = m;
							break;
						case "checked":
							m !== f && (B = !0), u = m;
							break;
						case "defaultChecked":
							m !== f && (B = !0), d = m;
							break;
						case "value":
							m !== f && (B = !0), s = m;
							break;
						case "defaultValue":
							m !== f && (B = !0), c = m;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (m != null) throw Error(i(137, t));
							break;
						default: m !== f && ep(e, t, p, m, r, f);
					}
				}
				tn(e, s, c, l, u, d, o, a);
				return;
			case "select":
				for (o in m = s = c = p = null, n) if (l = n[o], n.hasOwnProperty(o) && l != null) switch (o) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(o) || ep(e, t, o, null, r, l);
				}
				for (a in r) if (o = r[a], l = n[a], r.hasOwnProperty(a) && (o != null || l != null)) switch (a) {
					case "value":
						o !== l && (B = !0), p = o;
						break;
					case "defaultValue":
						o !== l && (B = !0), c = o;
						break;
					case "multiple": o !== l && (B = !0), s = o;
					default: o !== l && ep(e, t, a, o, r, l);
				}
				t = c, n = s, r = m, p == null ? !!r != !!n && (t == null ? an(e, !!n, n ? [] : "", !1) : an(e, !!n, t, !0)) : an(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (a = n[c], n.hasOwnProperty(c) && a != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: ep(e, t, c, null, r, a);
				}
				for (s in r) if (a = r[s], o = n[s], r.hasOwnProperty(s) && (a != null || o != null)) switch (s) {
					case "value":
						a !== o && (B = !0), p = a;
						break;
					case "defaultValue":
						a !== o && (B = !0), m = a;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (a != null) throw Error(i(91));
						break;
					default: a !== o && ep(e, t, s, a, r, o);
				}
				on(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: ep(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						p !== m && (B = !0), e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: ep(e, t, l, p, r, m);
				}
				return;
			case "img":
			case "link":
			case "area":
			case "base":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "source":
			case "track":
			case "wbr":
			case "menuitem":
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && ep(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(i(137, t));
						break;
					default: ep(e, t, u, p, r, m);
				}
				return;
			default: if (fn(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && tp(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || tp(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && ep(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || ep(e, t, f, p, r, m);
	}
	function ap(e) {
		switch (e) {
			case "css":
			case "script":
			case "font":
			case "img":
			case "image":
			case "input":
			case "link": return !0;
			default: return !1;
		}
	}
	function op() {
		if (typeof performance.getEntriesByType == "function") {
			for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), r = 0; r < n.length; r++) {
				var i = n[r], a = i.transferSize, o = i.initiatorType, s = i.duration;
				if (a && s && ap(o)) {
					for (o = 0, s = i.responseEnd, r += 1; r < n.length; r++) {
						var c = n[r], l = c.startTime;
						if (l > s) break;
						var u = c.transferSize, d = c.initiatorType;
						u && ap(d) && (c = c.responseEnd, o += u * (c < s ? 1 : (s - l) / (c - l)));
					}
					if (--r, t += 8 * (a + o) / (i.duration / 1e3), e++, 10 < e) break;
				}
			}
			if (0 < e) return t / e / 1e6;
		}
		return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
	}
	var sp = null, cp = null;
	function lp(e) {
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	function up(e) {
		switch (e) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function dp(e, t) {
		if (e === 0) switch (t) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return e === 1 && t === "foreignObject" ? 0 : e;
	}
	function fp(e, t, n, r) {
		return n = lp(n).createElement(e), n[xt] = r, n[St] = t, np(n, e, t), Ft(n), n;
	}
	function pp(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var mp = null;
	function hp() {
		var e = window.event;
		return e && e.type === "popstate" ? e !== mp && (mp = e, !0) : (mp = null, !1);
	}
	var gp = typeof setTimeout == "function" ? setTimeout : void 0, _p = typeof clearTimeout == "function" ? clearTimeout : void 0, vp = typeof Promise == "function" ? Promise : void 0, yp = typeof requestAnimationFrame == "function" ? requestAnimationFrame : gp, bp = typeof queueMicrotask == "function" ? queueMicrotask : vp === void 0 ? gp : function(e) {
		return vp.resolve(null).then(e).catch(xp);
	};
	function xp(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function Sp(e) {
		return e === "head";
	}
	function Cp(e, t) {
		var n = t, r = 0;
		do {
			var i = n.nextSibling;
			if (e.removeChild(n), i && i.nodeType === 8) {
				if (n = i.data, n === "/$" || n === "/&") {
					if (r === 0) {
						e.removeChild(i), Hh(t);
						return;
					}
					r--;
				} else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&") r++;
				else if (n === "html") _m(e.ownerDocument.documentElement);
				else if (n === "head") {
					n = e.ownerDocument.head, _m(n);
					for (var a = n.firstChild; a;) {
						var o = a.nextSibling, s = a.nodeName;
						a[Ot] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
					}
				} else n === "body" && _m(e.ownerDocument.body);
			}
			n = i;
		} while (n);
		Hh(t);
	}
	function wp(e, t) {
		var n = e;
		e = 0;
		do {
			var r = n.nextSibling;
			if (n.nodeType === 1 ? t ? (n._stashedDisplay = n.style.display, n.style.display = "none") : (n.style.display = n._stashedDisplay || "", n.getAttribute("style") === "" && n.removeAttribute("style")) : n.nodeType === 3 && (t ? (n._stashedText = n.nodeValue, n.nodeValue = "") : n.nodeValue = n._stashedText || ""), r && r.nodeType === 8) {
				if (n = r.data, n === "/$") {
					if (e === 0) break;
					e--;
				} else n !== "$" && n !== "$?" && n !== "$~" && n !== "$!" || e++;
			}
			n = r;
		} while (n);
	}
	function Tp(e, t, n) {
		if (t = CSS.escape(t) === t ? t : "r-" + btoa(t).replace(/=/g, ""), e.style.viewTransitionName = t, n != null && (e.style.viewTransitionClass = n), n = getComputedStyle(e), n.display === "inline") {
			if (t = e.getClientRects(), t.length === 1) var r = 1;
			else for (var i = r = 0; i < t.length; i++) {
				var a = t[i];
				0 < a.width && 0 < a.height && r++;
			}
			r === 1 && (e = e.style, e.display = t.length === 1 ? "inline-block" : "block", e.marginTop = "-" + n.paddingTop, e.marginBottom = "-" + n.paddingBottom);
		}
	}
	function Ep(e, t) {
		e = e.style, t = t.style;
		var n = t == null ? null : t.hasOwnProperty("viewTransitionName") ? t.viewTransitionName : t.hasOwnProperty("view-transition-name") ? t["view-transition-name"] : null;
		e.viewTransitionName = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), n = t == null ? null : t.hasOwnProperty("viewTransitionClass") ? t.viewTransitionClass : t.hasOwnProperty("view-transition-class") ? t["view-transition-class"] : null, e.viewTransitionClass = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), e.display === "inline-block" && (t == null ? e.display = e.margin = "" : (n = t.display, e.display = n == null || typeof n == "boolean" ? "" : n, n = t.margin, n == null ? (n = t.hasOwnProperty("marginTop") ? t.marginTop : t["margin-top"], e.marginTop = n == null || typeof n == "boolean" ? "" : n, t = t.hasOwnProperty("marginBottom") ? t.marginBottom : t["margin-bottom"], e.marginBottom = t == null || typeof t == "boolean" ? "" : t) : e.margin = n));
	}
	function Dp(e, t, n) {
		return n = n.ownerDocument.defaultView, {
			rect: e,
			abs: t.position === "absolute" || t.position === "fixed",
			clip: t.clipPath !== "none" || t.overflow !== "visible" || t.filter !== "none" || t.mask !== "none" || t.mask !== "none" || t.borderRadius !== "0px",
			view: 0 <= e.bottom && 0 <= e.right && e.top <= n.innerHeight && e.left <= n.innerWidth
		};
	}
	function Op(e) {
		return Dp(e.getBoundingClientRect(), getComputedStyle(e), e);
	}
	function kp(e) {
		var t = e.getBoundingClientRect();
		t = new DOMRect(t.x + 2e4, t.y + 2e4, t.width, t.height);
		var n = getComputedStyle(e);
		return Dp(t, n, e);
	}
	function Ap(e) {
		return e.documentElement.clientHeight;
	}
	function jp(e) {
		this.addEventListener("load", e), this.addEventListener("error", e);
	}
	function Mp(e, t, n, r, i, a, o, s, c) {
		var l = t.nodeType === 9 ? t : t.ownerDocument;
		try {
			var u = l.startViewTransition({
				update: function() {
					var t = l.defaultView, n = t.navigation && t.navigation.transition, o = l.fonts.status;
					r();
					var s = [];
					if (o === "loaded" && (Ap(l), l.fonts.status === "loading" && s.push(l.fonts.ready)), o = s.length, e !== null) for (var c = e.suspenseyImages, u = 0, d = 0; d < c.length; d++) {
						var f = c[d];
						if (!f.complete) {
							var p = f.getBoundingClientRect();
							if (0 < p.bottom && 0 < p.right && p.top < t.innerHeight && p.left < t.innerWidth) {
								if (u += Xm(f), u > $m) {
									s.length = o;
									break;
								}
								f = new Promise(jp.bind(f)), s.push(f);
							}
						}
					}
					if (0 < s.length) return t = Promise.race([Promise.all(s), new Promise(function(e) {
						return setTimeout(e, 500);
					})]).then(i, i), (n ? Promise.allSettled([n.finished, t]) : t).then(a, a);
					if (i(), n) return n.finished.then(a, a);
					a();
				},
				types: n
			});
			l.__reactViewTransition = u;
			var d = [];
			return u.ready.then(function() {
				for (var e = l.documentElement.getAnimations({ subtree: !0 }), t = 0; t < e.length; t++) {
					var n = e[t], r = n.effect, i = r.pseudoElement;
					if (i != null && i.startsWith("::view-transition")) {
						d.push(n), n = r.getKeyframes();
						for (var a = i = void 0, s = !0, c = 0; c < n.length; c++) {
							var u = n[c], f = u.width;
							if (i === void 0) i = f;
							else if (i !== f) {
								s = !1;
								break;
							}
							if (f = u.height, a === void 0) a = f;
							else if (a !== f) {
								s = !1;
								break;
							}
							delete u.width, delete u.height, u.transform === "none" && delete u.transform;
						}
						s && i !== void 0 && a !== void 0 && (r.setKeyframes(n), s = getComputedStyle(r.target, r.pseudoElement), s.width !== i || s.height !== a) && (s = n[0], s.width = i, s.height = a, s = n[n.length - 1], s.width = i, s.height = a, r.setKeyframes(n));
					}
				}
				o();
			}, function(e) {
				l.__reactViewTransition === u && (l.__reactViewTransition = null);
				try {
					if (typeof e == "object" && e) switch (e.name) {
						case "InvalidStateError": (e.message === "View transition was skipped because document visibility state is hidden." || e.message === "Skipping view transition because document visibility state has become hidden." || e.message === "Skipping view transition because viewport size changed." || e.message === "Transition was aborted because of invalid state") && (e = null);
					}
					e !== null && c(e);
				} finally {
					r(), i(), o();
				}
			}), u.finished.finally(function() {
				for (var e = 0; e < d.length; e++) d[e].cancel();
				l.__reactViewTransition === u && (l.__reactViewTransition = null), s();
			}), u;
		} catch {
			return r(), i(), o(), null;
		}
	}
	function Np(e, t) {
		this._scope = document.documentElement, this._selector = "::view-transition-" + e + "(" + t + ")";
	}
	Np.prototype.animate = function(e, t) {
		return t = typeof t == "number" ? { duration: t } : E({}, t), t.pseudoElement = this._selector, this._scope.animate(e, t);
	}, Np.prototype.getAnimations = function() {
		for (var e = this._scope, t = this._selector, n = e.getAnimations({ subtree: !0 }), r = [], i = 0; i < n.length; i++) {
			var a = n[i].effect;
			a !== null && a.target === e && a.pseudoElement === t && r.push(n[i]);
		}
		return r;
	}, Np.prototype.getComputedStyle = function() {
		return getComputedStyle(this._scope, this._selector);
	};
	function Pp(e) {
		return {
			name: e,
			group: new Np("group", e),
			imagePair: new Np("image-pair", e),
			old: new Np("old", e),
			new: new Np("new", e)
		};
	}
	function Fp(e) {
		this._fragmentFiber = e, this._observers = this._eventListeners = null;
	}
	Fp.prototype.addEventListener = function(e, t, n) {
		var r = null, i = null;
		if (!(n != null && typeof n != "boolean" && (r = n.signal || null, r !== null && r.aborted))) {
			this._eventListeners === null && (this._eventListeners = []);
			var a = this._eventListeners;
			if (Bp(a, e, t, n) === -1) {
				var o = this, s = t;
				n != null && typeof n != "boolean" && !0 === n.once && (s = function(r) {
					o.removeEventListener(e, t, n), typeof t == "function" ? t.call(this, r) : t.handleEvent(r);
				}), r !== null && (i = o.removeEventListener.bind(o, e, t, n), r.addEventListener("abort", i, { once: !0 }), i = r.removeEventListener.bind(r, "abort", i)), r = Rp(n), a.push({
					type: e,
					listener: t,
					optionsOrUseCapture: n,
					attachedListener: s,
					cleanup: i
				}), h(this._fragmentFiber.child, !1, Ip, e, s, r);
			}
			this._eventListeners = a;
		}
	};
	function Ip(e, t, n, r) {
		return b(e).addEventListener(t, n, r), !1;
	}
	Fp.prototype.removeEventListener = function(e, t, n) {
		var r = this._eventListeners;
		if (r !== null && (t = Bp(r, e, t, n), t !== -1)) {
			var i = r[t];
			n = i.attachedListener;
			var a = i.cleanup;
			i = Rp(i.optionsOrUseCapture), h(this._fragmentFiber.child, !1, Lp, e, n, i), r.splice(t, 1), a !== null && a();
		}
	};
	function Lp(e, t, n, r) {
		return b(e).removeEventListener(t, n, r), !1;
	}
	function Rp(e) {
		return e != null && typeof e != "boolean" && (!0 === e.once || e.signal instanceof AbortSignal) ? {
			capture: e.capture,
			passive: e.passive
		} : e;
	}
	function zp(e) {
		return e == null ? "c=0" : typeof e == "boolean" ? "c=" + (e ? "1" : "0") : "c=" + (e.capture ? "1" : "0");
	}
	function Bp(e, t, n, r) {
		if (e.length === 0) return -1;
		r = zp(r);
		for (var i = 0; i < e.length; i++) {
			var a = e[i];
			if (a.type === t && a.listener === n && zp(a.optionsOrUseCapture) === r) return i;
		}
		return -1;
	}
	Fp.prototype.dispatchEvent = function(e) {
		var t = g(this._fragmentFiber);
		if (t === null) return !0;
		t = b(t);
		var n = this._eventListeners;
		if (n !== null && 0 < n.length || !e.bubbles) {
			var r = t.nodeType === 9 ? t.createComment("") : document.createTextNode("");
			if (n) for (var i = 0; i < n.length; i++) {
				var a = n[i];
				r.addEventListener(a.type, a.attachedListener, Rp(a.optionsOrUseCapture));
			}
			if (t.appendChild(r), e = r.dispatchEvent(e), n) for (i = 0; i < n.length; i++) a = n[i], r.removeEventListener(a.type, a.attachedListener, Rp(a.optionsOrUseCapture));
			return t.removeChild(r), e;
		}
		return t.dispatchEvent(e);
	}, Fp.prototype.focus = function(e) {
		h(this._fragmentFiber.child, !0, Vp, e, void 0, void 0);
	};
	function Vp(e, t) {
		return e.tag !== 6 && (e = b(e), pm(e, t));
	}
	Fp.prototype.focusLast = function(e) {
		var t = [];
		h(this._fragmentFiber.child, !0, Hp, t, void 0, void 0);
		for (var n = t.length - 1; 0 <= n && !Vp(t[n], e); n--);
	};
	function Hp(e, t) {
		return t.push(e), !1;
	}
	Fp.prototype.blur = function() {
		var e = g(this._fragmentFiber);
		e !== null && (e = b(e), e = lp(e).activeElement, e !== null && h(this._fragmentFiber.child, !1, Up, e, void 0, void 0));
	};
	function Up(e, t) {
		return e.tag !== 6 && (e = b(e), e === t || e.contains(t) ? (t.blur(), !0) : !1);
	}
	Fp.prototype.observeUsing = function(e) {
		this._observers === null && (this._observers = /* @__PURE__ */ new Set()), this._observers.add(e), h(this._fragmentFiber.child, !1, Wp, e, void 0, void 0);
	};
	function Wp(e, t) {
		return e.tag === 6 || (e = b(e), t.observe(e)), !1;
	}
	Fp.prototype.unobserveUsing = function(e) {
		var t = this._observers;
		if (t !== null && t.has(e)) {
			t.delete(e), h(this._fragmentFiber.child, !1, Gp, e, void 0, void 0);
			for (var n = t = 0; n < Kp.length; n++) {
				var r = Kp[n];
				r.fragmentInstance === this && r.observer === e ? e.unobserve(r.instance) : Kp[t++] = r;
			}
			Kp.length = t;
		}
	};
	function Gp(e, t) {
		return e.tag === 6 || (e = b(e), t.unobserve(e)), !1;
	}
	var Kp = [], qp = !1;
	function Jp(e, t, n) {
		Kp.push({
			fragmentInstance: e,
			observer: t,
			instance: n
		}), qp || (qp = !0, mm(function() {
			qp = !1;
			var e = Kp;
			Kp = [];
			for (var t = 0; t < e.length; t++) {
				var n = e[t];
				n.observer.unobserve(n.instance);
			}
		}));
	}
	Fp.prototype.getClientRects = function() {
		var e = [];
		return h(this._fragmentFiber.child, !1, Yp, e, void 0, void 0), e;
	};
	function Yp(e, t) {
		if (e.tag === 6) {
			e = e.stateNode;
			var n = e.ownerDocument.createRange();
			n.selectNodeContents(e), t.push.apply(t, n.getClientRects());
		} else e = b(e), t.push.apply(t, e.getClientRects());
		return !1;
	}
	Fp.prototype.getRootNode = function(e) {
		var t = g(this._fragmentFiber);
		return t === null ? this : b(t).getRootNode(e);
	}, Fp.prototype.compareDocumentPosition = function(e) {
		var t = g(this._fragmentFiber);
		if (t === null) return Node.DOCUMENT_POSITION_DISCONNECTED;
		var n = [];
		h(this._fragmentFiber.child, !1, Hp, n, void 0, void 0);
		var r = b(t);
		if (n.length === 0) {
			if (n = r, _(this._fragmentFiber)) {
				a: {
					for (t = this._fragmentFiber.return; t !== null;) {
						if (t.tag === 4) {
							t = t.stateNode.containerInfo;
							break a;
						}
						if (t.tag === 3 || t.tag === 5 || t.tag === 27) break;
						t = t.return;
					}
					t = null;
				}
				t != null && (n = t);
			}
			t = this._fragmentFiber;
			var i = r = n.compareDocumentPosition(e);
			return n === e ? i = Node.DOCUMENT_POSITION_CONTAINS : r & Node.DOCUMENT_POSITION_CONTAINED_BY && (n = v(t)[1], n === null ? i = Node.DOCUMENT_POSITION_PRECEDING : (e = b(n).compareDocumentPosition(e), i = e === 0 || e & Node.DOCUMENT_POSITION_FOLLOWING ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING)), i |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
		}
		t = b(n[0]), i = b(n[n.length - 1]);
		var a = _(this._fragmentFiber) ? t.parentElement : r;
		if (a == null) return Node.DOCUMENT_POSITION_DISCONNECTED;
		r = a.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_CONTAINED_BY, a = a.compareDocumentPosition(i) & Node.DOCUMENT_POSITION_CONTAINED_BY;
		var o = t.compareDocumentPosition(e), s = i.compareDocumentPosition(e), c = o & Node.DOCUMENT_POSITION_CONTAINED_BY || s & Node.DOCUMENT_POSITION_CONTAINED_BY;
		return s = r && a && o & Node.DOCUMENT_POSITION_FOLLOWING && s & Node.DOCUMENT_POSITION_PRECEDING, t = r && t === e || a && i === e || c || s ? Node.DOCUMENT_POSITION_CONTAINED_BY : !r && t === e || !a && i === e ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : o, t & Node.DOCUMENT_POSITION_DISCONNECTED || t & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || Xp(t, this._fragmentFiber, n[0], n[n.length - 1], e) ? t : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
	};
	function Xp(e, t, n, r, i) {
		var a = jt(i);
		if (e & Node.DOCUMENT_POSITION_CONTAINED_BY) {
			if (n = !!a) a: {
				for (; a !== null;) {
					if (a.tag === 7 && (a === t || a.alternate === t)) {
						n = !0;
						break a;
					}
					a = a.return;
				}
				n = !1;
			}
			return n;
		}
		if (e & Node.DOCUMENT_POSITION_CONTAINS) {
			if (a === null) return a = i.ownerDocument, i === a || i === a.documentElement || i === a.body;
			a: {
				for (a = t, t = g(t); a !== null;) {
					if (!(a.tag !== 5 && a.tag !== 3 && a.tag !== 27 || a !== t && a.alternate !== t)) {
						a = !0;
						break a;
					}
					a = a.return;
				}
				a = !1;
			}
			return a;
		}
		return e & Node.DOCUMENT_POSITION_PRECEDING ? ((t = !!a) && !(t = a === n) && (t = ee(n, a, T), t === null ? t = !1 : (h(t, !0, C, a, n), a = x, x = null, t = a !== null)), t) : e & Node.DOCUMENT_POSITION_FOLLOWING ? ((t = !!a) && !(t = a === r) && (t = ee(r, a, T), t === null ? t = !1 : (h(t, !0, w, a, r), a = x, S = x = null, t = a !== null)), t) : !1;
	}
	function Zp(e, t) {
		var n = e.ownerDocument.createRange();
		n.selectNodeContents(e), e = n.getBoundingClientRect(), window.scrollTo(window.scrollX + e.left, t ? window.scrollY + e.top : window.scrollY + e.bottom - window.innerHeight);
	}
	Fp.prototype.scrollIntoView = function(e) {
		if (typeof e == "object") throw Error(i(566));
		var t = [];
		h(this._fragmentFiber.child, !1, Hp, t, void 0, void 0);
		var n = !1 !== e;
		if (t.length === 0) {
			var r = v(this._fragmentFiber);
			if (r = n ? r[1] || r[0] || g(this._fragmentFiber) : r[0] || r[1], r === null) return;
			if (r.tag === 6) {
				e = b(r), Zp(e, n);
				return;
			}
			if (r = b(r), r.nodeType !== 9) {
				if (r.nodeType === 11) {
					n = "host" in r ? r.host : null, n !== null && n.scrollIntoView(e);
					return;
				}
				r.scrollIntoView(e);
			}
		}
		for (r = n ? t.length - 1 : 0; r !== (n ? -1 : t.length);) {
			var a = t[r];
			a.tag === 6 ? (a = b(a), Zp(a, n)) : b(a).scrollIntoView(e), r += n ? -1 : 1;
		}
	};
	function Qp(e, t) {
		return e = b(e), $p(e, t), !1;
	}
	function $p(e, t) {
		e.reactFragments ??= /* @__PURE__ */ new Set(), e.reactFragments.add(t);
	}
	function em(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.addEventListener(i.type, i.attachedListener, Rp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			for (var r = 0, i = 0; i < Kp.length; i++) {
				var a = Kp[i];
				(a.fragmentInstance !== t || a.observer !== n || a.instance !== e) && (Kp[r++] = a);
			}
			Kp.length = r, n.observe(e);
		}), $p(e, t));
	}
	function tm(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.removeEventListener(i.type, i.attachedListener, Rp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			typeof n.rootMargin == "string" ? Jp(t, n, e) : n.unobserve(e);
		}), e.reactFragments != null && e.reactFragments.delete(t));
	}
	function nm(e) {
		var t = e.firstChild;
		for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
			var n = t;
			switch (t = t.nextSibling, n.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					nm(n), At(n);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if (n.rel.toLowerCase() === "stylesheet") continue;
			}
			e.removeChild(n);
		}
	}
	function rm(e, t, n, r) {
		for (; e.nodeType === 1;) {
			var i = n;
			if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
				if (!r && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
			} else if (!r) {
				if (t === "input" && e.type === "hidden") {
					var a = i.name == null ? null : "" + i.name;
					if (i.type === "hidden" && e.getAttribute("name") === a) return e;
				} else return e;
			} else if (!e[Ot]) switch (t) {
				case "meta":
					if (!e.hasAttribute("itemprop")) break;
					return e;
				case "link":
					if (a = e.getAttribute("rel"), a === "stylesheet" && e.hasAttribute("data-precedence") || a !== i.rel || e.getAttribute("href") !== (i.href == null || i.href === "" ? null : i.href) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin) || e.getAttribute("title") !== (i.title == null ? null : i.title)) break;
					return e;
				case "style":
					if (e.hasAttribute("data-precedence")) break;
					return e;
				case "script":
					if (a = e.getAttribute("src"), (a !== (i.src == null ? null : i.src) || e.getAttribute("type") !== (i.type == null ? null : i.type) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin)) && a && e.hasAttribute("async") && !e.hasAttribute("itemprop")) break;
					return e;
				default: return e;
			}
			if (e = lm(e.nextSibling), e === null) break;
		}
		return null;
	}
	function im(e, t, n) {
		if (t === "") return null;
		for (; e.nodeType !== 3;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = lm(e.nextSibling), e === null)) return null;
		return e;
	}
	function am(e, t) {
		for (; e.nodeType !== 8;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = lm(e.nextSibling), e === null)) return null;
		return e;
	}
	function om(e) {
		return e.data === "$?" || e.data === "$~";
	}
	function sm(e) {
		return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
	}
	function cm(e, t) {
		var n = e.ownerDocument;
		if (e.data === "$~") e._reactRetry = t;
		else if (e.data !== "$?" || n.readyState !== "loading") t();
		else {
			var r = function() {
				t(), n.removeEventListener("DOMContentLoaded", r);
			};
			n.addEventListener("DOMContentLoaded", r), e._reactRetry = r;
		}
	}
	function lm(e) {
		for (; e != null; e = e.nextSibling) {
			var t = e.nodeType;
			if (t === 1 || t === 3) break;
			if (t === 8) {
				if (t = e.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F") break;
				if (t === "/$" || t === "/&") return null;
			}
		}
		return e;
	}
	var um = null;
	function dm(e) {
		e = e.nextSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "/$" || n === "/&") {
					if (t === 0) return lm(e.nextSibling);
					t--;
				} else n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
			}
			e = e.nextSibling;
		}
		return null;
	}
	function fm(e) {
		e = e.previousSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
					if (t === 0) return e;
					t--;
				} else n !== "/$" && n !== "/&" || t++;
			}
			e = e.previousSibling;
		}
		return null;
	}
	function pm(e, t) {
		function n() {
			r = !0;
		}
		if (e.ownerDocument.activeElement === e) return !0;
		var r = !1;
		try {
			e.ownerDocument.addEventListener("focus", n, !0), (e.focus || HTMLElement.prototype.focus).call(e, t);
		} finally {
			e.ownerDocument.removeEventListener("focus", n, !0);
		}
		return r;
	}
	function mm(e) {
		yp(function() {
			yp(function(t) {
				return e(t);
			});
		});
	}
	function hm(e, t, n) {
		switch (t = lp(n), e) {
			case "html":
				if (e = t.documentElement, !e) throw Error(i(452));
				return e;
			case "head":
				if (e = t.head, !e) throw Error(i(453));
				return e;
			case "body":
				if (e = t.body, !e) throw Error(i(454));
				return e;
			default: throw Error(i(451));
		}
	}
	function gm(e, t, n) {
		for (var r in n) {
			var i = n[r];
			n.hasOwnProperty(r) && i != null && ep(e, t, r, null, rp, i);
		}
		n.dangerouslySetInnerHTML != null && (e.textContent = ""), e.onclick === gn && (e.onclick = null), At(e);
	}
	function _m(e) {
		for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
		At(e);
	}
	var vm = /* @__PURE__ */ new Map(), ym = /* @__PURE__ */ new Set();
	function bm(e) {
		if (typeof e.getRootNode == "function") {
			var t = e.getRootNode();
			if (t.nodeType === 9 || t.nodeType === 11) return t;
		}
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	var xm = M.d;
	M.d = {
		f: Sm,
		r: Cm,
		D: Em,
		C: Dm,
		L: Om,
		m: km,
		X: jm,
		S: Am,
		M: Mm
	};
	function Sm() {
		var e = xm.f(), t = Ld();
		return e || t;
	}
	function Cm(e) {
		var t = Mt(e);
		t !== null && t.tag === 5 && t.type === "form" ? Qs(t) : xm.r(e);
	}
	var wm = typeof document > "u" ? null : document;
	function Tm(e, t, n) {
		var r = wm;
		if (r && typeof t == "string" && t) {
			var i = en(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), ym.has(i) || (ym.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), np(t, "link", e), Ft(t), r.head.appendChild(t)));
		}
	}
	function Em(e) {
		xm.D(e), Tm("dns-prefetch", e, null);
	}
	function Dm(e, t) {
		xm.C(e, t), Tm("preconnect", e, t);
	}
	function Om(e, t, n) {
		xm.L(e, t, n);
		var r = wm;
		if (r && e && t) {
			var i = "link[rel=\"preload\"][as=\"" + en(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + en(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + en(n.imageSizes) + "\"]")) : i += "[href=\"" + en(e) + "\"]";
			var a = i;
			switch (t) {
				case "style":
					a = Pm(e);
					break;
				case "script": a = Rm(e);
			}
			if (!(vm.has(a) || (e = E({
				rel: "preload",
				href: t === "image" && n && n.imageSrcSet ? void 0 : e,
				as: t
			}, n), vm.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(Fm(a)) || t === "script" && r.querySelector(zm(a))))) {
				var o = r.createElement("link");
				np(o, "link", e), t === "style" && (o[kt] = !0, o.onload = o.onerror = function() {
					It(o);
				}), Ft(o), r.head.appendChild(o);
			}
		}
	}
	function km(e, t) {
		xm.m(e, t);
		var n = wm;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + en(r) + "\"][href=\"" + en(e) + "\"]", a = i;
			switch (r) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": a = Rm(e);
			}
			if (!vm.has(a) && (e = E({
				rel: "modulepreload",
				href: e
			}, t), vm.set(a, e), n.querySelector(i) === null)) {
				switch (r) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (n.querySelector(zm(a))) return;
				}
				r = n.createElement("link"), np(r, "link", e), Ft(r), n.head.appendChild(r);
			}
		}
	}
	function Am(e, t, n) {
		xm.S(e, t, n);
		var r = wm;
		if (r && e) {
			var i = Pt(r).hoistableStyles, a = Pm(e);
			t ||= "default";
			var o = i.get(a);
			if (!o) {
				var s = {
					loading: 0,
					preload: null
				};
				if (o = r.querySelector(Fm(a))) s.loading = 5;
				else {
					e = E({
						rel: "stylesheet",
						href: e,
						"data-precedence": t
					}, n), (n = vm.get(a)) && Hm(e, n);
					var c = o = r.createElement("link");
					Ft(c), np(c, "link", e), c._p = new Promise(function(e, t) {
						c.onload = e, c.onerror = t;
					}), c.addEventListener("load", function() {
						s.loading |= 1;
					}), c.addEventListener("error", function() {
						s.loading |= 2;
					}), s.loading |= 4, Vm(o, t, r);
				}
				o = {
					type: "stylesheet",
					instance: o,
					count: 1,
					state: s
				}, i.set(a, o);
			}
		}
	}
	function jm(e, t) {
		xm.X(e, t);
		var n = wm;
		if (n && e) {
			var r = Pt(n).hoistableScripts, i = Rm(e), a = r.get(i);
			a || (a = n.querySelector(zm(i)), a || (e = E({
				src: e,
				async: !0
			}, t), (t = vm.get(i)) && Um(e, t), a = n.createElement("script"), Ft(a), np(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Mm(e, t) {
		xm.M(e, t);
		var n = wm;
		if (n && e) {
			var r = Pt(n).hoistableScripts, i = Rm(e), a = r.get(i);
			a || (a = n.querySelector(zm(i)), a || (e = E({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = vm.get(i)) && Um(e, t), a = n.createElement("script"), Ft(a), np(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Nm(e, t, n, r) {
		var a = (a = Te.current) ? bm(a) : null;
		if (!a) throw Error(i(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (n = Pm(n.href), t = Pt(a).hoistableStyles, r = t.get(n), r || (r = {
				type: "style",
				instance: null,
				count: 0,
				state: null
			}, t.set(n, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			case "link":
				if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
					e = Pm(n.href);
					var o = Pt(a).hoistableStyles, s = o.get(e);
					if (s || (a = a.ownerDocument || a, s = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, o.set(e, s), (o = a.querySelector(Fm(e))) ? o._p || (s.instance = o, s.state.loading = 5) : (o = vm.get(e), o || (o = {
						rel: "preload",
						as: "style",
						href: n.href,
						crossOrigin: n.crossOrigin,
						integrity: n.integrity,
						media: n.media,
						hrefLang: n.hrefLang,
						referrerPolicy: n.referrerPolicy
					}, vm.set(e, o)), Lm(a, e, o, s.state))), t && r === null) throw Error(i(528, ""));
					return s;
				}
				if (t && r !== null) throw Error(i(529, ""));
				return null;
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (n = Rm(n), t = Pt(a).hoistableScripts, r = t.get(n), r || (r = {
				type: "script",
				instance: null,
				count: 0,
				state: null
			}, t.set(n, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			default: throw Error(i(444, e));
		}
	}
	function Pm(e) {
		return "href=\"" + en(e) + "\"";
	}
	function Fm(e) {
		return "link[rel=\"stylesheet\"][" + e + "]";
	}
	function Im(e) {
		return E({}, e, {
			"data-precedence": e.precedence,
			precedence: null
		});
	}
	function Lm(e, t, n, r) {
		if (t = e.querySelector("link[rel=\"preload\"][as=\"style\"][" + t + "]")) {
			if (!0 !== t[kt]) {
				r.loading = 1;
				return;
			}
		} else t = e.createElement("link"), t[kt] = !0, t.onload = t.onerror = It.bind(null, t), np(t, "link", n), Ft(t), e.head.appendChild(t);
		r.preload = t, t.addEventListener("load", function() {
			return r.loading |= 1;
		}), t.addEventListener("error", function() {
			return r.loading |= 2;
		});
	}
	function Rm(e) {
		return "[src=\"" + en(e) + "\"]";
	}
	function zm(e) {
		return "script[async]" + e;
	}
	function Bm(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + en(n.href) + "\"]");
				if (r) return t.instance = r, Ft(r), r;
				var a = E({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), Ft(r), np(r, "style", a), Vm(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				a = Pm(n.href);
				var o = e.querySelector(Fm(a));
				if (o) return t.state.loading |= 4, t.instance = o, Ft(o), o;
				r = Im(n), (a = vm.get(a)) && Hm(r, a), o = (e.ownerDocument || e).createElement("link"), Ft(o);
				var s = o;
				return s._p = new Promise(function(e, t) {
					s.onload = e, s.onerror = t;
				}), np(o, "link", r), t.state.loading |= 4, Vm(o, n.precedence, e), t.instance = o;
			case "script": return o = Rm(n.src), (a = e.querySelector(zm(o))) ? (t.instance = a, Ft(a), a) : (r = n, (a = vm.get(o)) && (r = E({}, n), Um(r, a)), e = e.ownerDocument || e, a = e.createElement("script"), Ft(a), np(a, "link", r), e.head.appendChild(a), t.instance = a);
			case "void": return null;
			default: throw Error(i(443, t.type));
		}
		else t.type === "stylesheet" && !(t.state.loading & 4) && (r = t.instance, t.state.loading |= 4, Vm(r, n.precedence, e));
		return t.instance;
	}
	function Vm(e, t, n) {
		for (var r = n.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), i = r.length ? r[r.length - 1] : null, a = i, o = 0; o < r.length; o++) {
			var s = r[o];
			if (s.dataset.precedence === t) a = s;
			else if (a !== i) break;
		}
		a ? a.parentNode.insertBefore(e, a.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
	}
	function Hm(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.title ??= t.title;
	}
	function Um(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.integrity ??= t.integrity;
	}
	var Wm = null;
	function Gm(e, t, n) {
		if (Wm === null) {
			var r = /* @__PURE__ */ new Map(), i = Wm = /* @__PURE__ */ new Map();
			i.set(n, r);
		} else i = Wm, r = i.get(n), r || (r = /* @__PURE__ */ new Map(), i.set(n, r));
		if (r.has(e)) return r;
		for (r.set(e, null), n = n.getElementsByTagName(e), i = 0; i < n.length; i++) {
			var a = n[i];
			if (!(a[Ot] || a[xt] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
				var o = a.getAttribute(t) || "";
				o = e + o;
				var s = r.get(o);
				s ? s.push(a) : r.set(o, [a]);
			}
		}
		return r;
	}
	function Km(e, t, n) {
		e = e.ownerDocument || e, e.head.insertBefore(n, t === "title" ? e.querySelector("head > title") : null);
	}
	function qm(e, t, n) {
		if (n === 1 || t.itemProp != null) return !1;
		switch (e) {
			case "meta":
			case "title": return !0;
			case "style":
				if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "") break;
				return !0;
			case "link":
				if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError) break;
				switch (t.rel) {
					case "stylesheet": return e = t.disabled, typeof t.precedence == "string" && e == null;
					default: return !0;
				}
			case "script": if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string") return !0;
		}
		return !1;
	}
	function Jm(e, t) {
		return e === "img" && t.src != null && t.src !== "" && t.onLoad == null && t.loading !== "lazy";
	}
	function Ym(e) {
		return !(e.type === "stylesheet" && !(e.state.loading & 3));
	}
	function Xm(e) {
		return (e.width || 100) * (e.height || 100) * (typeof devicePixelRatio == "number" ? devicePixelRatio : 1) * .25;
	}
	function Zm(e, t) {
		typeof t.decode == "function" && (e.imgCount++, t.complete || (e.imgBytes += Xm(t), e.suspenseyImages.push(t)), e = rh.bind(e), t.decode().then(e, e));
	}
	function Qm(e, t, n, r) {
		if (n.type === "stylesheet" && (typeof r.media != "string" || !1 !== matchMedia(r.media).matches) && !(n.state.loading & 4)) {
			if (n.instance === null) {
				var i = Pm(r.href), a = t.querySelector(Fm(i));
				if (a) {
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = nh.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, Ft(a);
					return;
				}
				a = t.ownerDocument || t, r = Im(r), (i = vm.get(i)) && Hm(r, i), a = a.createElement("link"), Ft(a);
				var o = a;
				o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), np(a, "link", r), n.instance = a;
			}
			e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && !(n.state.loading & 3) && (e.count++, n = nh.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
		}
	}
	var $m = 0;
	function eh(e, t) {
		return e.stylesheets && e.count === 0 && ah(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
			var r = setTimeout(function() {
				if (e.stylesheets && ah(e, e.stylesheets), e.unsuspend) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, 6e4 + t);
			0 < e.imgBytes && $m === 0 && ($m = 62500 * op());
			var i = setTimeout(function() {
				if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && ah(e, e.stylesheets), e.unsuspend)) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, (e.imgBytes > $m ? 50 : 800) + t);
			return e.unsuspend = n, function() {
				e.unsuspend = null, clearTimeout(r), clearTimeout(i);
			};
		} : null;
	}
	function th(e) {
		if (e.count === 0 && (e.imgCount === 0 || !e.waitingForImages)) {
			if (e.stylesheets) ah(e, e.stylesheets);
			else if (e.unsuspend) {
				var t = e.unsuspend;
				e.unsuspend = null, t();
			}
		}
	}
	function nh() {
		this.count--, th(this);
	}
	function rh() {
		this.imgCount--, th(this);
	}
	var ih = null;
	function ah(e, t) {
		e.stylesheets = null, e.unsuspend !== null && (e.count++, ih = /* @__PURE__ */ new Map(), t.forEach(oh, e), ih = null, nh.call(e));
	}
	function oh(e, t) {
		if (!(t.state.loading & 4)) {
			var n = ih.get(e);
			if (n) var r = n.get(null);
			else {
				n = /* @__PURE__ */ new Map(), ih.set(e, n);
				for (var i = e.querySelectorAll("link[data-precedence],style[data-precedence]"), a = 0; a < i.length; a++) {
					var o = i[a];
					(o.nodeName === "LINK" || o.getAttribute("media") !== "not all") && (n.set(o.dataset.precedence, o), r = o);
				}
				r && n.set(null, r);
			}
			i = t.instance, o = i.getAttribute("data-precedence"), a = n.get(o) || r, a === r && n.set(null, i), n.set(o, i), this.count++, r = nh.bind(this), i.addEventListener("load", r), i.addEventListener("error", r), a ? a.parentNode.insertBefore(i, a.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(i, e.firstChild)), t.state.loading |= 4;
		}
	}
	var sh = {
		$$typeof: ae,
		Provider: null,
		Consumer: null,
		_currentValue: be,
		_currentValue2: be,
		_threadCount: 0
	};
	function ch(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = ut(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = ut(0), this.hiddenUpdates = ut(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.transitionTypes = null, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function lh(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new ch(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = Ei(3, null, null, t), e.current = a, a.stateNode = e, t = Ea(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, co(a), e;
	}
	function uh(e) {
		return e ? (e = wi, e) : wi;
	}
	function dh(e, t, n, r, i, a) {
		i = uh(i), r.context === null ? r.context = i : r.pendingContext = i, r = uo(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = fo(e, r, t), n !== null && (Md(n, e, t), po(n, e, t));
	}
	function fh(e, t) {
		if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
			var n = e.retryLane;
			e.retryLane = n !== 0 && n < t ? n : t;
		}
	}
	function ph(e, t) {
		fh(e, t), (e = e.alternate) && fh(e, t);
	}
	function mh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = xi(e, 67108864);
			t !== null && Md(t, e, 67108864), ph(e, 67108864);
		}
	}
	function hh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = kd();
			t = gt(t);
			var n = xi(e, t);
			n !== null && Md(n, e, t), ph(e, t);
		}
	}
	var gh = !0;
	function _h(e, t, n, r) {
		var i = j.T;
		j.T = null;
		var a = M.p;
		try {
			M.p = 2, yh(e, t, n, r);
		} finally {
			M.p = a, j.T = i;
		}
	}
	function vh(e, t, n, r) {
		var i = j.T;
		j.T = null;
		var a = M.p;
		try {
			M.p = 8, yh(e, t, n, r);
		} finally {
			M.p = a, j.T = i;
		}
	}
	function yh(e, t, n, r) {
		if (gh) {
			var i = bh(r);
			if (i === null) Gf(e, t, r, xh, n), Mh(e, r);
			else if (Ph(i, e, t, n, r)) r.stopPropagation();
			else if (Mh(e, r), t & 4 && -1 < jh.indexOf(e)) {
				for (; i !== null;) {
					var a = Mt(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = at(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - $e(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									Tf(a), !(Y & 6) && (md = Ve() + 500, Ef(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = xi(a, 2), s !== null && Md(s, a, 2), Ld(), ph(a, 2);
					}
					if (a = bh(r), a === null && Gf(e, t, r, xh, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else Gf(e, t, r, null, n);
		}
	}
	function bh(e) {
		return e = vn(e), Sh(e);
	}
	var xh = null;
	function Sh(e) {
		if (xh = null, e = jt(e), e !== null) {
			var t = o(e);
			if (t === null) e = null;
			else {
				var n = t.tag;
				if (n === 13) {
					if (e = s(t), e !== null) return e;
					e = null;
				} else if (n === 31) {
					if (e = c(t), e !== null) return e;
					e = null;
				} else if (n === 3) {
					if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
					e = null;
				} else t !== e && (e = null);
			}
		}
		return xh = e, null;
	}
	function Ch(e) {
		switch (e) {
			case "beforetoggle":
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "seeked":
			case "submit":
			case "toggle":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "fullscreenerror":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart": return 2;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "resize":
			case "scroll":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 8;
			case "message": switch (He()) {
				case Ue: return 2;
				case We: return 8;
				case Ge:
				case Ke: return 32;
				case qe: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var wh = !1, Th = null, Eh = null, Dh = null, Oh = /* @__PURE__ */ new Map(), kh = /* @__PURE__ */ new Map(), Ah = [], jh = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function Mh(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				Th = null;
				break;
			case "dragenter":
			case "dragleave":
				Eh = null;
				break;
			case "mouseover":
			case "mouseout":
				Dh = null;
				break;
			case "pointerover":
			case "pointerout":
				Oh.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": kh.delete(t.pointerId);
		}
	}
	function Nh(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = Mt(t), t !== null && mh(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function Ph(e, t, n, r, i) {
		switch (t) {
			case "focusin": return Th = Nh(Th, e, t, n, r, i), !0;
			case "dragenter": return Eh = Nh(Eh, e, t, n, r, i), !0;
			case "mouseover": return Dh = Nh(Dh, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return Oh.set(a, Nh(Oh.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, kh.set(a, Nh(kh.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function Fh(e) {
		var t = jt(e.target);
		if (t !== null) {
			var n = o(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = s(n), t !== null) {
						e.blockedOn = t, yt(e.priority, function() {
							hh(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = c(n), t !== null) {
						e.blockedOn = t, yt(e.priority, function() {
							hh(n);
						});
						return;
					}
				} else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
					e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
					return;
				}
			}
		}
		e.blockedOn = null;
	}
	function Ih(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = bh(e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				_n = r, n.target.dispatchEvent(r), _n = null;
			} else return t = Mt(n), t !== null && mh(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function Lh(e, t, n) {
		Ih(e) && n.delete(t);
	}
	function Rh() {
		wh = !1, Th !== null && Ih(Th) && (Th = null), Eh !== null && Ih(Eh) && (Eh = null), Dh !== null && Ih(Dh) && (Dh = null), Oh.forEach(Lh), kh.forEach(Lh);
	}
	function zh(e, n) {
		e.blockedOn === n && (e.blockedOn = null, wh || (wh = !0, t.unstable_scheduleCallback(t.unstable_NormalPriority, Rh)));
	}
	var Bh = null;
	function Vh(e) {
		Bh !== e && (Bh = e, t.unstable_scheduleCallback(t.unstable_NormalPriority, function() {
			Bh === e && (Bh = null);
			for (var t = 0; t < e.length; t += 3) {
				var n = e[t], r = e[t + 1], i = e[t + 2];
				if (typeof r != "function") {
					if (Sh(r || n) === null) continue;
					break;
				}
				var a = Mt(n);
				a !== null && (e.splice(t, 3), t -= 3, Xs(a, {
					pending: !0,
					data: i,
					method: n.method,
					action: r
				}, r, i));
			}
		}));
	}
	function Hh(e) {
		function t(t) {
			return zh(t, e);
		}
		Th !== null && zh(Th, e), Eh !== null && zh(Eh, e), Dh !== null && zh(Dh, e), Oh.forEach(t), kh.forEach(t);
		for (var n = 0; n < Ah.length; n++) {
			var r = Ah[n];
			r.blockedOn === e && (r.blockedOn = null);
		}
		for (; 0 < Ah.length && (n = Ah[0], n.blockedOn === null);) Fh(n), n.blockedOn === null && Ah.shift();
		if (n = (e.ownerDocument || e).$$reactFormReplay, n != null) for (r = 0; r < n.length; r += 3) {
			var i = n[r], a = n[r + 1], o = i[St] || null;
			if (typeof a == "function") o || Vh(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[St] || null) s = o.formAction;
					else if (Sh(i) !== null) continue;
				} else s = o.action;
				typeof s == "function" ? n[r + 1] = s : (n.splice(r, 3), r -= 3), Vh(n);
			}
		}
	}
	function Uh() {
		function e(e) {
			e.canIntercept && e.info === "react-transition" && e.intercept({
				handler: function() {
					return new Promise(function(e) {
						return i = e;
					});
				},
				focusReset: "manual",
				scroll: "manual"
			});
		}
		function t() {
			i !== null && (i(), i = null), r || setTimeout(n, 20);
		}
		function n() {
			if (!r && !navigation.transition) {
				var e = navigation.currentEntry;
				e && e.url != null && navigation.navigate(e.url, {
					state: e.getState(),
					info: "react-transition",
					history: "replace"
				});
			}
		}
		if (typeof navigation == "object") {
			var r = !1, i = null;
			return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(n, 100), function() {
				r = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), i !== null && (i(), i = null);
			};
		}
	}
	function Wh(e) {
		this._internalRoot = e;
	}
	Gh.prototype.render = Wh.prototype.render = function(e) {
		var t = this._internalRoot;
		if (t === null) throw Error(i(409));
		var n = t.current;
		dh(n, kd(), e, t, null, null);
	}, Gh.prototype.unmount = Wh.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			dh(e.current, 2, null, e, null, null), Ld(), t[Ct] = null;
		}
	};
	function Gh(e) {
		this._internalRoot = e;
	}
	Gh.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = vt();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < Ah.length && t !== 0 && t < Ah[n].priority; n++);
			Ah.splice(n, 0, e), n === 0 && Fh(e);
		}
	};
	var Kh = n.version;
	if (Kh !== "19.3.1") throw Error(i(527, Kh, "19.3.1"));
	M.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(i(188)) : (e = Object.keys(e).join(","), Error(i(268, e)));
		return e = d(t), e = e === null ? null : p(e), e = e === null ? null : e.stateNode, e;
	};
	var qh = {
		bundleType: 0,
		version: "19.3.1",
		rendererPackageName: "react-dom",
		currentDispatcherRef: j,
		reconcilerVersion: "19.3.1"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Jh = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Jh.isDisabled && Jh.supportsFiber) try {
			Xe = Jh.inject(qh), Ze = Jh;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!a(e)) throw Error(i(299));
		var n = !1, r = "", o = yc, s = bc, c = xc;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (o = t.onUncaughtError), t.onCaughtError !== void 0 && (s = t.onCaughtError), t.onRecoverableError !== void 0 && (c = t.onRecoverableError)), t = lh(e, 1, !1, null, null, n, r, null, o, s, c, Uh), e[Ct] = t.current, Uf(e), new Wh(t);
	};
})), g = /* @__PURE__ */ o(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = h();
})), _ = f(), v = g(), y = document.getElementById("jenkins-ai-copilot-root");
if (!y) throw Error("Copilot root element missing");
var b = {
	baseUrl: y.dataset.baseUrl ?? "/jenkins-ai-copilot/",
	context: x(y.dataset.context ?? "{}"),
	maxSteps: Number(y.dataset.maxSteps ?? 20),
	version: y.dataset.pluginVersion ?? "development"
};
function x(e) {
	try {
		return JSON.parse(e);
	} catch {
		return {};
	}
}
function S() {
	let e = document.head, t = document.documentElement, n = e.dataset.crumbHeader ?? t.dataset.crumbHeader, r = e.dataset.crumbValue ?? t.dataset.crumbValue;
	return n && r ? { [n]: r } : {};
}
async function C(e) {
	let t = await e.text(), n = {};
	try {
		n = t ? JSON.parse(t) : {};
	} catch {
		throw Error(`Invalid server response (${e.status})`);
	}
	if (!e.ok) {
		let t = n.error;
		throw Error(t?.message ?? `Request failed (${e.status})`);
	}
	return n;
}
async function w(e) {
	return C(await fetch(`${b.baseUrl}${e}`, {
		headers: { accept: "application/json" },
		credentials: "same-origin"
	}));
}
async function T(e, t) {
	return C(await fetch(`${b.baseUrl}${e}`, {
		method: "POST",
		credentials: "same-origin",
		headers: {
			"content-type": "application/json",
			...S()
		},
		body: JSON.stringify(t)
	}));
}
function ee() {
	return w("session");
}
async function E() {
	return (await w("conversations")).conversations ?? [];
}
async function te(e, t = {}) {
	return T("createConversation", {
		pipeline: e,
		...t
	});
}
function ne(e, t) {
	return T("renameConversation", {
		id: e,
		title: t
	});
}
function D(e) {
	return T("setApprovalMode", { mode: e });
}
function re() {
	return w("settingsAccounts");
}
function O(e) {
	return T("saveProvider", e);
}
function ie(e) {
	return T("deleteProvider", { id: e });
}
function k(e) {
	return T("defaultProvider", { id: e });
}
function ae(e) {
	return T("providerModels", e);
}
function A(e) {
	return T("saveGithub", e);
}
function oe(e) {
	return T("deleteGithub", { id: e });
}
function se(e) {
	return T("defaultGithub", { id: e });
}
function ce(e) {
	return w(`conversation?id=${encodeURIComponent(e)}`);
}
function le(e) {
	return T("deleteConversation", { id: e });
}
function ue(e, t) {
	return `${b.baseUrl}attachment?conversationId=${encodeURIComponent(e)}&id=${encodeURIComponent(t)}`;
}
function de(e, t, n) {
	return pe("chat", e, t, n);
}
function fe(e, t, n) {
	return pe("decision", e, t, n);
}
async function pe(e, t, n, r) {
	let i = await fetch(`${b.baseUrl}${e}`, {
		method: "POST",
		credentials: "same-origin",
		headers: {
			"content-type": "application/json",
			accept: "text/event-stream",
			...S()
		},
		body: JSON.stringify(t),
		signal: r
	});
	if (!i.ok) {
		let e = await i.text(), t = `Request failed (${i.status})`;
		try {
			t = JSON.parse(e).error?.message ?? t;
		} catch {}
		throw Error(t);
	}
	if (!i.body) throw Error("Streaming is not supported by this browser");
	let a = i.body.getReader(), o = new TextDecoder(), s = "";
	for (;;) {
		let { value: e, done: t } = await a.read();
		if (t) break;
		s += o.decode(e, { stream: !0 }).replace(/\r\n/g, "\n");
		let r = s.indexOf("\n\n");
		for (; r >= 0;) {
			let e = s.slice(0, r);
			s = s.slice(r + 2);
			let t = me(e);
			t && n(t), r = s.indexOf("\n\n");
		}
	}
}
function me(e) {
	let t = "message", n = [];
	for (let r of e.split("\n")) r.startsWith("event:") ? t = r.slice(6).trim() : r.startsWith("data:") && n.push(r.slice(5).trimStart());
	if (n.length === 0) return null;
	try {
		return {
			event: t,
			data: JSON.parse(n.join("\n"))
		};
	} catch {
		return null;
	}
}
function he() {
	return w("settingsSkills");
}
function ge(e) {
	return T("saveSkill", e);
}
function _e(e) {
	return T("deleteSkill", {
		skill: e,
		confirm: !0
	});
}
function ve(e, t) {
	return T("setSkillEnabled", {
		skill: e,
		enabled: t
	});
}
// src/attachments.ts
var ye = [
	"image/png",
	"image/jpeg",
	"image/webp"
];
async function j(e, t) {
	if (!ye.includes(e.type)) throw Error("Only PNG, JPEG, and WebP images are supported");
	if (e.size > t * 1024 * 1024) throw Error(`Image exceeds the ${t} MB limit`);
	let n = await be(await M(e)), r = Math.min(1, 1568 / Math.max(n.width, n.height)), i = Math.max(1, Math.round(n.width * r)), a = Math.max(1, Math.round(n.height * r)), o = document.createElement("canvas");
	o.width = i, o.height = a;
	let s = o.getContext("2d");
	if (!s) throw Error("Could not prepare the image");
	s.drawImage(n, 0, 0, i, a);
	let c = o.toDataURL(e.type, .9);
	c.length > t * 1024 * 1024 * 1.4 && (c = o.toDataURL("image/jpeg", .8));
	let l = c.indexOf(",");
	if (l < 0) throw Error("Could not encode the image");
	return {
		mediaType: c.slice(5, c.indexOf(";")),
		fileName: e.name || "image",
		dataBase64: c.slice(l + 1),
		previewUrl: c,
		size: Math.round((c.length - l - 1) * .75)
	};
}
function M(e) {
	return new Promise((t, n) => {
		let r = new FileReader();
		r.onload = () => t(String(r.result)), r.onerror = () => n(/* @__PURE__ */ Error("Could not read the image")), r.readAsDataURL(e);
	});
}
function be(e) {
	return new Promise((t, n) => {
		let r = new Image();
		r.onload = () => t(r), r.onerror = () => n(/* @__PURE__ */ Error("Could not read the image")), r.src = e;
	});
}
// node_modules/dompurify/dist/purify.es.mjs
function N(e, t) {
	this.v = e, this.k = t;
}
function xe(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function P(e) {
	if (Array.isArray(e)) return e;
}
function Se(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function F() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Ce(e, t) {
	return P(e) || Se(e, t) || we(e, t) || F();
}
function we(e, t) {
	if (e) {
		if (typeof e == "string") return xe(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xe(e, t) : void 0;
	}
}
function Te(e) {
	var t, n;
	function r(t, n) {
		try {
			var a = e[t](n), o = a.value, s = o instanceof N;
			Promise.resolve(s ? o.v : o).then(function(n) {
				if (s) {
					var c = t === "return" && o.k ? t : "next";
					if (!o.k || n.done) return r(c, n);
					n = e[c](n).value;
				}
				i(!!a.done, n);
			}, function(e) {
				r("throw", e);
			});
		} catch (e) {
			i(2, e);
		}
	}
	function i(e, i) {
		e === 2 ? t.reject(i) : t.resolve({
			value: i,
			done: e
		}), (t = t.next) ? r(t.key, t.arg) : n = null;
	}
	this._invoke = function(e, i) {
		return new Promise(function(a, o) {
			var s = {
				key: e,
				arg: i,
				resolve: a,
				reject: o,
				next: null
			};
			n ? n = n.next = s : (t = n = s, r(e, i));
		});
	}, typeof e.return != "function" && (this.return = void 0);
}
Te.prototype[typeof Symbol == "function" && Symbol.asyncIterator || "@@asyncIterator"] = function() {
	return this;
}, Te.prototype.next = function(e) {
	return this._invoke("next", e);
}, Te.prototype.throw = function(e) {
	return this._invoke("throw", e);
}, Te.prototype.return = function(e) {
	return this._invoke("return", e);
};
var Ee = Object.entries, De = Object.setPrototypeOf, Oe = Object.isFrozen, ke = Object.getPrototypeOf, Ae = Object.getOwnPropertyDescriptor, je = Object.freeze, Me = Object.seal, I = Object.create, L = typeof Reflect < "u" && Reflect, Ne = L.apply, Pe = L.construct;
je ||= function(e) {
	return e;
}, Me ||= function(e) {
	return e;
}, Ne ||= function(e, t) {
	var n = [...arguments].slice(2);
	return e.apply(t, n);
}, Pe ||= function(e) {
	return new e(...[...arguments].slice(1));
};
var Fe = R(Array.prototype.forEach);
Array.prototype.indexOf;
var Ie = R(Array.prototype.lastIndexOf), Le = R(Array.prototype.pop), Re = R(Array.prototype.push), ze = R(Array.prototype.slice), Be = R(Array.prototype.splice), Ve = Array.isArray, He = at(Set), Ue = R(Set.prototype.add), We = R(Set.prototype.has), Ge = R(String.prototype.toLowerCase), Ke = R(String.prototype.toString), qe = R(String.prototype.match), Je = R(String.prototype.replace), Ye = R(String.prototype.indexOf), Xe = R(String.prototype.trim), Ze = R(Number.prototype.toString), Qe = R(Boolean.prototype.toString), $e = typeof BigInt > "u" ? null : R(BigInt.prototype.toString), et = typeof Symbol > "u" ? null : R(Symbol.prototype.toString), tt = R(Object.prototype.hasOwnProperty), nt = R(Object.prototype.toString), rt = R(RegExp.prototype.test), it = at(TypeError);
function R(e) {
	return function(t) {
		t instanceof RegExp && (t.lastIndex = 0);
		var n = [...arguments].slice(1);
		return Ne(e, t, n);
	};
}
function at(e) {
	return function() {
		return Pe(e, [...arguments]);
	};
}
function z(e, t) {
	let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Ge;
	if (De && De(e, null), !Ve(t)) return e;
	let r = t.length;
	for (; r--;) {
		let i = t[r];
		if (typeof i == "string") {
			let e = n(i);
			e !== i && (Oe(t) || (t[r] = e), i = e);
		}
		e[i] = !0;
	}
	return e;
}
function ot(e) {
	for (let t = 0; t < e.length; t++) tt(e, t) || (e[t] = null);
	return e;
}
function st(e) {
	let t = I(null);
	for (let r of Ee(e)) {
		var n = Ce(r, 2);
		let i = n[0], a = n[1];
		tt(e, i) && (t[i] = Ve(a) ? ot(a) : a && typeof a == "object" && a.constructor === Object ? st(a) : a);
	}
	return t;
}
function ct(e) {
	switch (typeof e) {
		case "string": return e;
		case "number": return Ze(e);
		case "boolean": return Qe(e);
		case "bigint": return $e ? $e(e) : "0";
		case "symbol": return et ? et(e) : "Symbol()";
		case "undefined": return nt(e);
		case "function":
		case "object": {
			if (e === null) return nt(e);
			let t = e, n = lt(t, "toString");
			if (typeof n == "function") {
				let e = n(t);
				return typeof e == "string" ? e : nt(e);
			}
			return nt(e);
		}
		default: return nt(e);
	}
}
function lt(e, t) {
	for (; e !== null;) {
		let n = Ae(e, t);
		if (n) {
			if (n.get) return R(n.get);
			if (typeof n.value == "function") return R(n.value);
		}
		e = ke(e);
	}
	function n() {
		return null;
	}
	return n;
}
function ut(e, t) {
	for (; e !== null;) {
		let n = Ae(e, t);
		if (n) return n.get ? R(n.get) : null;
		e = ke(e);
	}
	return null;
}
function dt(e) {
	try {
		return rt(e, ""), !0;
	} catch {
		return !1;
	}
}
var ft = je(/* @__PURE__ */ "a.abbr.acronym.address.area.article.aside.audio.b.bdi.bdo.big.blink.blockquote.body.br.button.canvas.caption.center.cite.code.col.colgroup.content.data.datalist.dd.decorator.del.details.dfn.dialog.dir.div.dl.dt.element.em.fieldset.figcaption.figure.font.footer.form.h1.h2.h3.h4.h5.h6.head.header.hgroup.hr.html.i.img.input.ins.kbd.label.legend.li.main.map.mark.marquee.menu.menuitem.meter.nav.nobr.ol.optgroup.option.output.p.picture.pre.progress.q.rp.rt.ruby.s.samp.search.section.select.shadow.slot.small.source.spacer.span.strike.strong.style.sub.summary.sup.table.tbody.td.template.textarea.tfoot.th.thead.time.tr.track.tt.u.ul.var.video.wbr".split(".")), pt = je(/* @__PURE__ */ "svg.a.altglyph.altglyphdef.altglyphitem.animatecolor.animatemotion.animatetransform.circle.clippath.defs.desc.ellipse.enterkeyhint.exportparts.filter.font.g.glyph.glyphref.hkern.image.inputmode.line.lineargradient.marker.mask.metadata.mpath.part.path.pattern.polygon.polyline.radialgradient.rect.stop.style.switch.symbol.text.textpath.title.tref.tspan.view.vkern".split(".")), mt = je([
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feDropShadow",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence"
]), ht = je([
	"animate",
	"color-profile",
	"cursor",
	"discard",
	"font-face",
	"font-face-format",
	"font-face-name",
	"font-face-src",
	"font-face-uri",
	"foreignobject",
	"hatch",
	"hatchpath",
	"mesh",
	"meshgradient",
	"meshpatch",
	"meshrow",
	"missing-glyph",
	"script",
	"set",
	"solidcolor",
	"unknown",
	"use"
]), gt = je(/* @__PURE__ */ "math.menclose.merror.mfenced.mfrac.mglyph.mi.mlabeledtr.mmultiscripts.mn.mo.mover.mpadded.mphantom.mroot.mrow.ms.mspace.msqrt.mstyle.msub.msup.msubsup.mtable.mtd.mtext.mtr.munder.munderover.mprescripts".split(".")), _t = je([
	"maction",
	"maligngroup",
	"malignmark",
	"mlongdiv",
	"mscarries",
	"mscarry",
	"msgroup",
	"mstack",
	"msline",
	"msrow",
	"semantics",
	"annotation",
	"annotation-xml",
	"mprescripts",
	"none"
]), vt = je(["#text"]), yt = je(/* @__PURE__ */ "accept.action.align.alt.autocapitalize.autocomplete.autopictureinpicture.autoplay.background.bgcolor.border.capture.cellpadding.cellspacing.checked.cite.class.clear.color.cols.colspan.command.commandfor.controls.controlslist.coords.crossorigin.datetime.decoding.default.dir.disabled.disablepictureinpicture.disableremoteplayback.download.draggable.enctype.enterkeyhint.exportparts.face.for.headers.height.hidden.high.href.hreflang.id.inert.inputmode.integrity.ismap.kind.label.lang.list.loading.loop.low.max.maxlength.media.method.min.minlength.multiple.muted.name.nonce.noshade.novalidate.nowrap.open.optimum.part.pattern.placeholder.playsinline.popover.popovertarget.popovertargetaction.poster.preload.pubdate.radiogroup.readonly.rel.required.rev.reversed.role.rows.rowspan.spellcheck.scope.selected.shape.size.sizes.slot.span.srclang.start.src.srcset.step.style.summary.tabindex.title.translate.type.usemap.valign.value.width.wrap.xmlns".split(".")), bt = je(/* @__PURE__ */ "accent-height.accumulate.additive.alignment-baseline.amplitude.ascent.attributename.attributetype.azimuth.basefrequency.baseline-shift.begin.bias.by.class.clip.clippathunits.clip-path.clip-rule.color.color-interpolation.color-interpolation-filters.color-profile.color-rendering.cx.cy.d.dx.dy.diffuseconstant.direction.display.divisor.dominant-baseline.dur.edgemode.elevation.end.exponent.fill.fill-opacity.fill-rule.filter.filterunits.flood-color.flood-opacity.font-family.font-size.font-size-adjust.font-stretch.font-style.font-variant.font-weight.fx.fy.g1.g2.glyph-name.glyphref.gradientunits.gradienttransform.height.href.id.image-rendering.in.in2.intercept.k.k1.k2.k3.k4.kerning.keypoints.keysplines.keytimes.lang.lengthadjust.letter-spacing.kernelmatrix.kernelunitlength.lighting-color.local.marker-end.marker-mid.marker-start.markerheight.markerunits.markerwidth.maskcontentunits.maskunits.max.mask.mask-type.media.method.mode.min.name.numoctaves.offset.operator.opacity.order.orient.orientation.origin.overflow.paint-order.path.pathlength.patterncontentunits.patterntransform.patternunits.pointer-events.points.preservealpha.preserveaspectratio.primitiveunits.r.rx.ry.radius.refx.refy.repeatcount.repeatdur.restart.result.rotate.scale.seed.shape-rendering.slope.specularconstant.specularexponent.spreadmethod.startoffset.stddeviation.stitchtiles.stop-color.stop-opacity.stroke-dasharray.stroke-dashoffset.stroke-linecap.stroke-linejoin.stroke-miterlimit.stroke-opacity.stroke.stroke-width.style.surfacescale.systemlanguage.tabindex.tablevalues.targetx.targety.transform.transform-origin.text-anchor.text-decoration.text-orientation.text-rendering.textlength.type.u1.u2.unicode.values.vector-effect.viewbox.visibility.version.vert-adv-y.vert-origin-x.vert-origin-y.width.word-spacing.wrap.writing-mode.xchannelselector.ychannelselector.x.x1.x2.xmlns.y.y1.y2.z.zoomandpan".split(".")), xt = je(/* @__PURE__ */ "accent.accentunder.align.bevelled.close.columnalign.columnlines.columnspacing.columnspan.denomalign.depth.dir.display.displaystyle.encoding.fence.frame.height.href.id.largeop.length.linethickness.lquote.lspace.mathbackground.mathcolor.mathsize.mathvariant.maxsize.minsize.movablelimits.notation.numalign.open.rowalign.rowlines.rowspacing.rowspan.rspace.rquote.scriptlevel.scriptminsize.scriptsizemultiplier.selection.separator.separators.stretchy.subscriptshift.supscriptshift.symmetric.voffset.width.xmlns".split(".")), St = je([
	"xlink:href",
	"xml:id",
	"xlink:title",
	"xml:space",
	"xmlns:xlink"
]), Ct = Me(/{{[\w\W]*|^[\w\W]*}}/g), wt = Me(/<%[\w\W]*|^[\w\W]*%>/g), Tt = Me(/\${[\w\W]*/g), Et = Me(/^data-[\-\w.\u00B7-\uFFFF]+$/), Dt = Me(/^aria-[\-\w]+$/), Ot = Me(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i), kt = Me(/^(?:\w+script|data):/i), At = Me(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g), jt = Me(/^html$/i), Mt = Me(/^[a-z][.\w]*(-[.\w]+)+$/i), Nt = Me(/<[/\w!]/g), Pt = Me(/<[/\w]/g), Ft = Me(/<\/no(script|embed|frames)/i), It = Me(/\/>/i), Lt = {
	element: 1,
	attribute: 2,
	text: 3,
	cdataSection: 4,
	entityReference: 5,
	entityNode: 6,
	processingInstruction: 7,
	comment: 8,
	document: 9,
	documentType: 10,
	documentFragment: 11,
	notation: 12
}, Rt = je(z({}, [
	"style",
	"script",
	"xmp",
	"iframe",
	"noembed",
	"noframes",
	"plaintext",
	"noscript"
])), zt = function() {
	return typeof window > "u" ? null : window;
}, Bt = function(e, t) {
	if (typeof e != "object" || typeof e.createPolicy != "function") return null;
	let n = null, r = "data-tt-policy-suffix";
	t && t.hasAttribute(r) && (n = t.getAttribute(r));
	let i = "dompurify" + (n ? "#" + n : "");
	try {
		return e.createPolicy(i, {
			createHTML(e) {
				return e;
			},
			createScriptURL(e) {
				return e;
			}
		});
	} catch {
		return console.warn("TrustedTypes policy " + i + " could not be created."), null;
	}
}, Vt = function() {
	return {
		afterSanitizeAttributes: [],
		afterSanitizeElements: [],
		afterSanitizeShadowDOM: [],
		beforeSanitizeAttributes: [],
		beforeSanitizeElements: [],
		beforeSanitizeShadowDOM: [],
		uponSanitizeAttribute: [],
		uponSanitizeElement: [],
		uponSanitizeShadowNode: []
	};
}, Ht = function(e, t, n, r) {
	return tt(e, t) && Ve(e[t]) ? z(r.base ? st(r.base) : {}, e[t], r.transform) : n;
}, Ut = function(e, t, n) {
	let r = tt(e, t) ? e[t] : void 0;
	return r && typeof r == "object" ? st(r) : n();
};
function Wt() {
	let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : zt(), t = (e) => Wt(e);
	if (t.version = "3.4.17", t.removed = [], !e || !e.document || e.document.nodeType !== Lt.document || !e.Element) return t.isSupported = !1, t;
	let n = e.document, r = n, i = r.currentScript;
	e.DocumentFragment;
	let a = e.HTMLTemplateElement, o = e.Node, s = e.Element, c = e.NodeFilter;
	e.NamedNodeMap === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
	let l = e.DOMParser, u = e.trustedTypes, d = s.prototype, f = lt(d, "cloneNode"), p = lt(d, "remove"), m = lt(d, "removeAttributeNode"), h = lt(d, "nextSibling"), g = lt(d, "childNodes"), _ = lt(d, "parentNode"), v = lt(d, "shadowRoot"), y = lt(d, "attributes"), b = o && o.prototype ? lt(o.prototype, "nodeType") : null, x = o && o.prototype ? lt(o.prototype, "nodeName") : null, S = o && o.prototype ? lt(o.prototype, "ownerDocument") : null, C = function(e) {
		return b ? b(e) : e.nodeType;
	}, w = function(e) {
		return x ? x(e) : e.nodeName;
	}, T = ut(d, "namespaceURI"), ee = function(e) {
		return T ? T(e) : e.namespaceURI;
	};
	if (typeof a == "function") {
		let e = n.createElement("template");
		e.content && e.content.ownerDocument && (n = e.content.ownerDocument);
	}
	let E, te = "", ne, D = !1, re = 0, O = function() {
		if (re > 0) throw it("A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the \"DOMPurify and Trusted Types\" section of the README.");
	}, ie = function(e) {
		O(), re++;
		try {
			return E.createHTML(e);
		} finally {
			re--;
		}
	}, k = function(e) {
		O(), re++;
		try {
			return E.createScriptURL(e);
		} finally {
			re--;
		}
	}, ae = function() {
		return D ||= (ne = Bt(u, i), !0), ne;
	}, A = n, oe = A.implementation, se = A.createNodeIterator, ce = A.createDocumentFragment, le = A.getElementsByTagName, ue = r.importNode, de = Vt();
	t.isSupported = typeof Ee == "function" && typeof _ == "function" && oe && oe.createHTMLDocument !== void 0;
	let fe = Ct, pe = wt, me = Tt, he = Et, ge = Dt, _e = kt, ve = At, ye = Mt, j = Ot, M = null, be = z({}, [
		...ft,
		...pt,
		...mt,
		...gt,
		...vt
	]), N = null, xe = z({}, [
		...yt,
		...bt,
		...xt,
		...St
	]), P = Object.seal(I(null, {
		tagNameCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		attributeNameCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		allowCustomizedBuiltInElements: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: !1
		}
	})), Se = null, F = null, Ce = Object.seal(I(null, {
		tagCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		attributeCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		}
	})), we = !0, Te = !0, De = !1, Oe = !0, ke = !1, Ae = !0, L = !1, Ne = !1, Pe = null, Ze = null, Qe = !1, $e = !1, et = !1, nt = !1, R = !0, at = !1, ot = "user-content-", B = !0, Gt = !1, Kt = null, qt = {}, Jt = null, Yt = z({}, /* @__PURE__ */ "annotation-xml.audio.colgroup.desc.foreignobject.head.iframe.math.mi.mn.mo.ms.mtext.noembed.noframes.noscript.plaintext.script.selectedcontent.style.svg.template.thead.title.video.xmp".split(".")), V = null, Xt = z({}, [
		"audio",
		"video",
		"img",
		"source",
		"image",
		"track"
	]), Zt = null, Qt = z({}, [
		"alt",
		"class",
		"for",
		"id",
		"label",
		"name",
		"pattern",
		"placeholder",
		"role",
		"summary",
		"title",
		"value",
		"style",
		"xmlns"
	]), $t = "http://www.w3.org/1998/Math/MathML", en = "http://www.w3.org/2000/svg", tn = "http://www.w3.org/1999/xhtml", nn = tn, rn = !1, an = null, on = z({}, [
		$t,
		en,
		tn
	], Ke), sn = je([
		"mi",
		"mo",
		"mn",
		"ms",
		"mtext"
	]), cn = z({}, sn), ln = je(["annotation-xml"]), un = z({}, ln), dn = z({}, [
		"title",
		"style",
		"font",
		"a",
		"script"
	]), fn = null, pn = ["application/xhtml+xml", "text/html"], mn = null, hn = null, gn = n.createElement("form"), _n = function(e) {
		return e instanceof RegExp || e instanceof Function;
	}, vn = function() {
		let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
		if (hn && hn === e) return;
		e && typeof e == "object" || (e = {}), e = st(e), fn = pn.indexOf(e.PARSER_MEDIA_TYPE) === -1 ? "text/html" : e.PARSER_MEDIA_TYPE, mn = fn === "application/xhtml+xml" ? Ke : Ge, M = Ht(e, "ALLOWED_TAGS", be, { transform: mn }), N = Ht(e, "ALLOWED_ATTR", xe, { transform: mn }), an = Ht(e, "ALLOWED_NAMESPACES", on, { transform: Ke }), Zt = Ht(e, "ADD_URI_SAFE_ATTR", Qt, {
			transform: mn,
			base: Qt
		}), V = Ht(e, "ADD_DATA_URI_TAGS", Xt, {
			transform: mn,
			base: Xt
		}), Jt = Ht(e, "FORBID_CONTENTS", Yt, { transform: mn }), Se = Ht(e, "FORBID_TAGS", st({}), { transform: mn }), F = Ht(e, "FORBID_ATTR", st({}), { transform: mn }), qt = tt(e, "USE_PROFILES") ? e.USE_PROFILES && typeof e.USE_PROFILES == "object" ? st(e.USE_PROFILES) : e.USE_PROFILES : !1, we = e.ALLOW_ARIA_ATTR !== !1, Te = e.ALLOW_DATA_ATTR !== !1, De = e.ALLOW_UNKNOWN_PROTOCOLS || !1, Oe = e.ALLOW_SELF_CLOSE_IN_ATTR !== !1, ke = e.SAFE_FOR_TEMPLATES || !1, Ae = e.SAFE_FOR_XML !== !1, L = e.WHOLE_DOCUMENT || !1, $e = e.RETURN_DOM || !1, et = e.RETURN_DOM_FRAGMENT || !1, nt = e.RETURN_TRUSTED_TYPE || !1, Qe = e.FORCE_BODY || !1, R = e.SANITIZE_DOM !== !1, at = e.SANITIZE_NAMED_PROPS || !1, B = e.KEEP_CONTENT !== !1, Gt = e.IN_PLACE || !1, j = dt(e.ALLOWED_URI_REGEXP) ? e.ALLOWED_URI_REGEXP : Ot, nn = typeof e.NAMESPACE == "string" ? e.NAMESPACE : tn, cn = Ut(e, "MATHML_TEXT_INTEGRATION_POINTS", () => z({}, sn)), un = Ut(e, "HTML_INTEGRATION_POINTS", () => z({}, ln));
		let t = Ut(e, "CUSTOM_ELEMENT_HANDLING", () => I(null));
		if (P = I(null), tt(t, "tagNameCheck") && _n(t.tagNameCheck) && (P.tagNameCheck = t.tagNameCheck), tt(t, "attributeNameCheck") && _n(t.attributeNameCheck) && (P.attributeNameCheck = t.attributeNameCheck), tt(t, "allowCustomizedBuiltInElements") && typeof t.allowCustomizedBuiltInElements == "boolean" && (P.allowCustomizedBuiltInElements = t.allowCustomizedBuiltInElements), Me(P), ke && (Te = !1), et && ($e = !0), qt && (M = z({}, vt), N = I(null), qt.html === !0 && (z(M, ft), z(N, yt)), qt.svg === !0 && (z(M, pt), z(N, bt), z(N, St)), qt.svgFilters === !0 && (z(M, mt), z(N, bt), z(N, St)), qt.mathMl === !0 && (z(M, gt), z(N, xt), z(N, St))), Ce.tagCheck = null, Ce.attributeCheck = null, tt(e, "ADD_TAGS") && (typeof e.ADD_TAGS == "function" ? Ce.tagCheck = e.ADD_TAGS : Ve(e.ADD_TAGS) && (M === be && (M = st(M)), z(M, e.ADD_TAGS, mn))), tt(e, "ADD_ATTR") && (typeof e.ADD_ATTR == "function" ? Ce.attributeCheck = e.ADD_ATTR : Ve(e.ADD_ATTR) && (N === xe && (N = st(N)), z(N, e.ADD_ATTR, mn))), tt(e, "ADD_FORBID_CONTENTS") && Ve(e.ADD_FORBID_CONTENTS) && (Jt === Yt && (Jt = st(Jt)), z(Jt, e.ADD_FORBID_CONTENTS, mn)), B && (M["#text"] = !0), L && z(M, [
			"html",
			"head",
			"body"
		]), M.table && (z(M, ["tbody"]), delete Se.tbody), e.TRUSTED_TYPES_POLICY) {
			if (typeof e.TRUSTED_TYPES_POLICY.createHTML != "function") throw it("TRUSTED_TYPES_POLICY configuration option must provide a \"createHTML\" hook.");
			if (typeof e.TRUSTED_TYPES_POLICY.createScriptURL != "function") throw it("TRUSTED_TYPES_POLICY configuration option must provide a \"createScriptURL\" hook.");
			let t = E;
			E = e.TRUSTED_TYPES_POLICY;
			try {
				te = ie("");
			} catch (e) {
				throw E = t, e;
			}
		} else e.TRUSTED_TYPES_POLICY === null ? (E = void 0, te = "") : (E === void 0 && (E = ae()), E && typeof te == "string" && (te = ie("")));
		je && je(e), hn = e;
	}, yn = z({}, [
		...pt,
		...mt,
		...ht
	]), bn = z({}, [...gt, ..._t]), xn = function(e, t, n) {
		return t.namespaceURI === tn ? e === "svg" : t.namespaceURI === $t ? e === "svg" && (n === "annotation-xml" || cn[n]) : !!yn[e];
	}, Sn = function(e, t, n) {
		return t.namespaceURI === tn ? e === "math" : t.namespaceURI === en ? e === "math" && un[n] : !!bn[e];
	}, Cn = function(e, t, n) {
		return t.namespaceURI === en && !un[n] || t.namespaceURI === $t && !cn[n] ? !1 : !bn[e] && (dn[e] || !yn[e]);
	}, wn = function(e) {
		let t = ee(e), n = Ge(w(e)), r = _(e), i, a;
		return r && C(r) === Lt.element ? (i = { namespaceURI: ee(r) }, a = Ge(w(r))) : (i = { namespaceURI: nn }, a = "template"), an[t] ? t === en ? xn(n, i, a) : t === $t ? Sn(n, i, a) : t === tn ? Cn(n, i, a) : !!(fn === "application/xhtml+xml" && an[t]) : !1;
	}, Tn = function(e) {
		Re(t.removed, { element: e });
		try {
			_(e).removeChild(e);
		} catch {
			if (p(e), !_(e)) throw it("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
		}
	}, En = function(e, t, n) {
		try {
			m(e, t);
		} catch {
			try {
				e.removeAttribute(n);
			} catch {}
		}
	}, Dn = function(e) {
		jn(e);
		let t = g(e);
		t && Fe(ze(t), (e) => {
			try {
				p(e);
			} catch {}
		});
		let n = C(e) === Lt.element ? y(e) : null;
		if (n) for (let t = n.length - 1; t >= 0; --t) {
			let r = n[t], i = r && r.name;
			typeof i == "string" && En(e, r, i);
		}
	}, On = function(e, n, r) {
		if (!r) try {
			r = n.getAttributeNode(e);
		} catch {
			r = null;
		}
		Re(t.removed, {
			attribute: r || null,
			from: n
		});
		try {
			r ? m(n, r) : n.removeAttribute(e);
		} catch {
			try {
				n.removeAttribute(e);
			} catch {}
		}
		if (e === "is") {
			if ($e || et) try {
				Tn(n);
			} catch {}
			else try {
				n.setAttribute(e, "");
			} catch {}
		}
	}, kn = function(e) {
		let t = y(e);
		if (t) for (let n = t.length - 1; n >= 0; --n) {
			let r = t[n], i = r && r.name;
			typeof i != "string" || N[mn(i)] || En(e, r, i);
		}
	}, An = function(e, t) {
		let n = arguments.length > 2 && arguments[2] !== void 0 && arguments[2], r = [e];
		for (; r.length > 0;) {
			let e = r.pop();
			if (t(e) === !1) continue;
			if (n && C(e) === Lt.element) {
				let t = v(e);
				Kn(t) && r.push(t);
			}
			let i = g(e);
			if (i) for (let e = i.length - 1; e >= 0; --e) r.push(i[e]);
		}
	}, jn = function(e) {
		An(e, (e) => {
			C(e) === Lt.element && kn(e);
		});
	}, Mn = function(e) {
		let t = [];
		return An(e, (e) => {
			t.push(e);
		}, !0), t;
	}, Nn = function(e, t) {
		let n = He();
		Fe(Mn(e), (e) => {
			C(e) === Lt.element && Ue(n, e);
		}), Fe(t, (e) => {
			C(e) === Lt.element && !We(n, e) && kn(e);
		});
	}, Pn = function(e, n) {
		let r = !1;
		return Fe(t.removed, (t) => {
			t.element && (r ||= t.element === e, jn(t.element));
		}), Nn(e, n), r;
	}, Fn = function(e, t) {
		let n = Kt, r = null, i = () => (r || (r = He(), Fe(t, (e) => {
			Ue(r, e);
		})), r);
		for (let t = 0;; t++) {
			let r = Mn(e), a = [e], o = !1;
			if (Fe(r, (e) => {
				C(e) === Lt.documentFragment ? Re(a, e) : !o && !We(n, e) && (o = We(i(), e));
			}), !o) return;
			if (t >= 8) throw it("the tree kept changing during in-place sanitization; refusing to return it");
			Fe(a, (t, n) => {
				In(t, n > 0, e, i());
			});
		}
	}, In = function(e, t, n, r) {
		let i = Vn(e), a;
		for (; a = i.nextNode();) We(r, a) && !We(Kt, a) && (t && Jn(de.uponSanitizeShadowNode, a, null), er(a, n), sr(a, n), Kn(a.content) && cr(a.content));
	}, Ln = function(e) {
		Kt && Ue(Kt, e);
	}, Rn = function(e, t) {
		return Ae ? e === "patchsrc" || e === "for" && t !== "label" && t !== "output" : !1;
	}, zn = function(e) {
		Ae && An(e, (e) => {
			let t = C(e);
			if (t === Lt.processingInstruction || t === Lt.comment && rt(Pt, e.data)) {
				try {
					p(e);
				} catch {}
				return !1;
			}
			if (t === Lt.element) {
				let t = e, n = mn(w(e));
				try {
					t.hasAttribute && t.hasAttribute("patchsrc") && t.removeAttribute("patchsrc"), t.hasAttribute && t.hasAttribute("for") && Rn("for", n) && t.removeAttribute("for");
				} catch {}
			}
			return !0;
		});
	}, Bn = function(e) {
		let t = null, r = null;
		if (Qe) e = "<remove></remove>" + e;
		else {
			let t = qe(e, /^[\r\n\t ]+/);
			r = t && t[0];
		}
		fn === "application/xhtml+xml" && nn === tn && (e = "<html xmlns=\"http://www.w3.org/1999/xhtml\"><head></head><body>" + e + "</body></html>");
		let i = E ? ie(e) : e;
		if (nn === tn) try {
			t = new l().parseFromString(i, fn);
		} catch {}
		if (!t || !t.documentElement) {
			t = oe.createDocument(nn, "template", null);
			try {
				t.documentElement.innerHTML = rn ? te : i;
			} catch {}
		}
		let a = t.body || t.documentElement;
		return e && r && a.insertBefore(n.createTextNode(r), a.childNodes[0] || null), nn === tn ? le.call(t, L ? "html" : "body")[0] : L ? t.documentElement : a;
	}, Vn = function(e) {
		let t = S ? S(e) : e.ownerDocument;
		return se.call(t || e, e, c.SHOW_ELEMENT | c.SHOW_COMMENT | c.SHOW_TEXT | c.SHOW_PROCESSING_INSTRUCTION | c.SHOW_CDATA_SECTION, null);
	}, Hn = function(e) {
		return e = Je(e, fe, " "), e = Je(e, pe, " "), e = Je(e, me, " "), e;
	}, Un = function(e) {
		Wn(e);
		let t = e.querySelectorAll?.call(e, "template");
		t && Fe(t, (e) => {
			Kn(e.content) && Un(e.content);
		});
	}, Wn = function(e) {
		e.normalize();
		let t = S ? S(e) : e.ownerDocument, n = se.call(t || e, e, c.SHOW_TEXT | c.SHOW_COMMENT | c.SHOW_CDATA_SECTION | c.SHOW_PROCESSING_INSTRUCTION, null), r = n.nextNode();
		for (; r;) r.data = Hn(r.data), r = n.nextNode();
	}, Gn = function(e) {
		let t = x ? x(e) : null;
		return typeof t != "string" || mn(t) !== "form" ? !1 : typeof e.nodeName != "string" || typeof e.textContent != "string" || typeof e.removeChild != "function" || e.attributes !== y(e) || typeof e.removeAttribute != "function" || typeof e.removeAttributeNode != "function" || typeof e.getAttributeNode != "function" || typeof e.setAttribute != "function" || typeof e.namespaceURI != "string" || typeof e.insertBefore != "function" || typeof e.hasChildNodes != "function" || e.nodeType !== b(e) || e.childNodes !== g(e);
	}, Kn = function(e) {
		if (!b || typeof e != "object" || !e) return !1;
		try {
			return b(e) === Lt.documentFragment;
		} catch {
			return !1;
		}
	}, qn = function(e) {
		if (!b || typeof e != "object" || !e) return !1;
		try {
			return typeof b(e) == "number";
		} catch {
			return !1;
		}
	};
	function Jn(e, n, r) {
		e.length !== 0 && Fe(e, (e) => {
			e.call(t, n, r, hn);
		});
	}
	let Yn = function(e, t) {
		return !!(Ae && e.hasChildNodes() && !qn(e.firstElementChild) && rt(Nt, e.textContent) && rt(Nt, e.innerHTML) || Ae && Rt[t] && C(e) === Lt.element && ee(e) === tn && (qn(e.firstElementChild) || typeof e.textContent == "string" && rt(Nt, e.textContent)) || e.nodeType === Lt.processingInstruction || Ae && e.nodeType === Lt.comment && rt(Pt, e.data));
	}, Xn = function(e, t) {
		return e instanceof RegExp ? rt(e, t) : e instanceof Function && !!e(t, ...[...arguments].slice(2));
	}, Zn = function(e, t, n) {
		if (!Se[t] && rr(t) && Xn(P.tagNameCheck, t)) return !1;
		if (B && !Jt[t] && !Jt[Ge(t)]) {
			let t = _(e), r = g(e);
			if (r && t) {
				let i = r.length;
				for (let a = i - 1; a >= 0; --a) {
					let i = e === n ? f(r[a], !0) : r[a];
					t.insertBefore(i, h(e));
				}
			}
		}
		return Tn(e), !0;
	}, Qn = function(e, t, n, r) {
		return e.length === 0 ? t : t === n || t === r ? st(t) : t;
	}, $n = function(e, t) {
		return e === t || _(e) !== null ? !1 : (Gt && jn(e), !0);
	}, er = function(e, n) {
		if (Ln(e), Jn(de.beforeSanitizeElements, e, null), $n(e, n)) return !0;
		if (Gn(e)) return Tn(e), !0;
		let r = mn(w(e));
		if (M = Qn(de.uponSanitizeElement, M, be, Pe), Jn(de.uponSanitizeElement, e, {
			tagName: r,
			allowedTags: M
		}), $n(e, n)) return !0;
		if (Yn(e, r)) return Tn(e), !0;
		if (Se[r] || !(Ce.tagCheck instanceof Function && Ce.tagCheck(r)) && !M[r]) {
			let t = Zn(e, r, n);
			return t === !1 && (Jn(de.afterSanitizeElements, e, null), $n(e, n)) ? !0 : t;
		}
		if (C(e) === Lt.element && !wn(e) || (r === "noscript" || r === "noembed" || r === "noframes") && rt(Ft, e.innerHTML)) return Tn(e), !0;
		if (ke && e.nodeType === Lt.text) {
			let n = Hn(e.textContent);
			e.textContent !== n && (Re(t.removed, { element: e.cloneNode() }), e.textContent = n);
		}
		return Jn(de.afterSanitizeElements, e, null), $n(e, n);
	}, tr = function(e, t, r) {
		if (F[t] || Rn(t, e) || R && (t === "id" || t === "name") && (r in n || r in gn)) return !1;
		let i = N[t] || Ce.attributeCheck instanceof Function && Ce.attributeCheck(t, e);
		return Te && rt(he, t) || we && rt(ge, t) ? !0 : i ? Zt[t] || rt(j, Je(r, ve, "")) || (t === "src" || t === "xlink:href" || t === "href") && e !== "script" && Ye(r, "data:") === 0 && V[e] || De && !rt(_e, Je(r, ve, "")) ? !0 : !r : rr(e) && Xn(P.tagNameCheck, e) && Xn(P.attributeNameCheck, t, e) || t === "is" && P.allowCustomizedBuiltInElements && Xn(P.tagNameCheck, r);
	}, nr = z({}, [
		"annotation-xml",
		"color-profile",
		"font-face",
		"font-face-format",
		"font-face-name",
		"font-face-src",
		"font-face-uri",
		"missing-glyph"
	]), rr = function(e) {
		return !nr[Ge(e)] && rt(ye, e);
	}, ir = function(e, t, n, r) {
		if (E && typeof u == "object" && typeof u.getAttributeType == "function" && !n) switch (u.getAttributeType(e, t)) {
			case "TrustedHTML": return ie(r);
			case "TrustedScriptURL": return k(r);
		}
		return r;
	}, ar = function(e, t, n, r) {
		try {
			return n ? e.setAttributeNS(n, t, r) : e.setAttribute(t, r), !Gn(e) || (Tn(e), !1);
		} catch {
			return On(t, e), !1;
		}
	}, or = function(e, t) {
		return Ae && rt(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, t) ? !0 : Ge(e) === "attributename" && qe(t, "href") !== null;
	}, sr = function(e, n) {
		if (Jn(de.beforeSanitizeAttributes, e, null), $n(e, n)) return;
		let r = e.attributes;
		if (!r || Gn(e)) return;
		N = Qn(de.uponSanitizeAttribute, N, xe, Ze);
		let i = {
			attrName: "",
			attrValue: "",
			keepAttr: !0,
			allowedAttributes: N,
			forceKeepAttr: void 0
		}, a = r.length, o = mn(e.nodeName);
		for (; a--;) {
			let n = r[a], s = n.name, c = n.namespaceURI, l = n.value, u = mn(s), d = l, f = s === "value" ? d : Xe(d), p = !1;
			i.attrName = u, i.attrValue = f, i.keepAttr = !0, i.forceKeepAttr = void 0, Jn(de.uponSanitizeAttribute, e, i), f = i.attrValue, at && (u === "id" || u === "name") && Ye(f, ot) !== 0 && (On(s, e, n), f = ot + f, p = !0), or(s, f) ? On(s, e, n) : i.forceKeepAttr || (i.keepAttr ? !Oe && rt(It, f) ? On(s, e, n) : (ke && (f = Hn(f)), tr(o, u, f) ? (f = ir(o, u, c, f), f !== d && ar(e, s, c, f) && p && Le(t.removed)) : On(s, e, n)) : On(s, e, n));
		}
		Jn(de.afterSanitizeAttributes, e, null), $n(e, n);
	}, cr = function(e) {
		let t = null, n = Vn(e);
		for (Jn(de.beforeSanitizeShadowDOM, e, null); t = n.nextNode();) if (Jn(de.uponSanitizeShadowNode, t, null), er(t, e), sr(t, e), Kn(t.content) && cr(t.content), C(t) === Lt.element) {
			let e = v(t);
			Kn(e) && (lr(e), cr(e));
		}
		ke && Wn(e), Jn(de.afterSanitizeShadowDOM, e, null);
	}, lr = function(e) {
		let t = [{
			node: e,
			shadow: null
		}];
		for (; t.length > 0;) {
			let e = t.pop();
			if (e.shadow) {
				cr(e.shadow);
				continue;
			}
			let n = e.node, r = C(n) === Lt.element, i = g(n);
			if (i) for (let e = i.length - 1; e >= 0; --e) t.push({
				node: i[e],
				shadow: null
			});
			if (r) {
				let e = x ? x(n) : null;
				if (typeof e == "string" && mn(e) === "template") {
					let e = n.content;
					Kn(e) && t.push({
						node: e,
						shadow: null
					});
				}
			}
			if (r) {
				let e = v(n);
				Kn(e) && t.push({
					node: null,
					shadow: e
				}, {
					node: e,
					shadow: null
				});
			}
		}
	};
	return t.sanitize = function(e) {
		let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = null, a = null, o = null, s = null;
		if (rn = !e, rn && (e = "<!-->"), typeof e != "string" && !qn(e) && (e = ct(e), typeof e != "string")) throw it("dirty is not a string, aborting");
		if (!t.isSupported) return e;
		Ne ? (M = Pe, N = Ze) : vn(n), (de.uponSanitizeElement.length > 0 || de.uponSanitizeAttribute.length > 0) && (M = st(M)), de.uponSanitizeAttribute.length > 0 && (N = st(N)), t.removed = [];
		let c = Gt && typeof e != "string" && qn(e), l = [], u = Kt;
		if (c) {
			zn(e);
			let t = w(e);
			if (typeof t == "string") {
				let n = mn(t);
				if (!M[n] || Se[n]) throw Dn(e), it("root node is forbidden and cannot be sanitized in-place");
			}
			if (Gn(e)) throw Dn(e), it("root node is clobbered and cannot be sanitized in-place");
			l = Mn(e), Kt = He();
		} else if (qn(e)) i = Bn("<!---->"), a = i.ownerDocument.importNode(e, !0), a.nodeType === Lt.element && a.nodeName === "BODY" || a.nodeName === "HTML" ? i = a : i.appendChild(a), lr(i);
		else {
			if (!$e && !ke && !L && e.indexOf("<") === -1) return E && nt ? ie(e) : e;
			if (i = Bn(e), !i) return $e ? null : nt ? te : "";
		}
		i && Qe && Tn(i.firstChild);
		let d = c ? e : i;
		try {
			c && lr(e);
			let t = Vn(d);
			for (; o = t.nextNode();) er(o, d), sr(o, d), Kn(o.content) && cr(o.content);
			c && Fn(e, l);
		} catch (t) {
			throw c && (Dn(e), Pn(e, l)), t;
		} finally {
			Kt = u;
		}
		if (c) {
			if (Pn(e, l)) throw it("a node selected for removal could not be safely returned; refusing to sanitize in place");
			return ke && Un(e), e;
		}
		if ($e) {
			if (ke && Un(i), et) for (s = ce.call(i.ownerDocument); i.firstChild;) s.appendChild(i.firstChild);
			else s = i;
			return (N.shadowroot || N.shadowrootmode) && (s = ue.call(r, s, !0)), s;
		}
		let f = L ? i.outerHTML : i.innerHTML;
		return L && M["!doctype"] && i.ownerDocument && i.ownerDocument.doctype && i.ownerDocument.doctype.name && rt(jt, i.ownerDocument.doctype.name) && (f = "<!DOCTYPE " + i.ownerDocument.doctype.name + ">\n" + f), ke && (f = Hn(f)), E && nt ? ie(f) : f;
	}, t.setConfig = function() {
		let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
		vn(e), Ne = !0, Pe = M, Ze = N;
	}, t.clearConfig = function() {
		hn = null, Ne = !1, Pe = null, Ze = null, E = ne, te = "";
	}, t.isValidAttribute = function(e, t, n) {
		hn || vn({});
		let r = mn(e), i = mn(t);
		return typeof n == "string" && (or(t, n) || !Oe && rt(It, n)) ? !1 : tr(r, i, n);
	}, t.addHook = function(e, t) {
		typeof t == "function" && tt(de, e) && Re(de[e], t);
	}, t.removeHook = function(e, t) {
		if (tt(de, e)) {
			if (t !== void 0) {
				let n = Ie(de[e], t);
				return n === -1 ? void 0 : Be(de[e], n, 1)[0];
			}
			return Le(de[e]);
		}
	}, t.removeHooks = function(e) {
		tt(de, e) && (de[e] = []);
	}, t.removeAllHooks = function() {
		de = Vt();
	}, t;
}
var B = Wt();
// node_modules/marked/lib/marked.esm.js
function Gt() {
	return {
		async: !1,
		breaks: !1,
		extensions: null,
		gfm: !0,
		hooks: null,
		pedantic: !1,
		renderer: null,
		silent: !1,
		tokenizer: null,
		walkTokens: null
	};
}
var Kt = Gt();
function qt(e) {
	Kt = e;
}
var Jt = { exec: () => null };
function Yt(e) {
	let t = [];
	return (n) => {
		let r = Math.max(0, Math.min(3, n - 1)), i = t[r];
		return i || (i = e(r), t[r] = i), i;
	};
}
function V(e, t = "") {
	let n = typeof e == "string" ? e : e.source, r = {
		replace: (e, t) => {
			let i = typeof t == "string" ? t : t.source;
			return i = i.replace(Zt.caret, "$1"), n = n.replace(e, i), r;
		},
		getRegex: () => new RegExp(n, t)
	};
	return r;
}
var Xt = ((e = "") => {
	try {
		return !!RegExp("(?<=1)(?<!1)" + e);
	} catch {
		return !1;
	}
})(), Zt = {
	codeRemoveIndent: /^(?: {0,3}\t| {1,4})/gm,
	outputLinkReplace: /\\([\[\]])/g,
	indentCodeCompensation: /^(\s+)(?:```)/,
	beginningSpace: /^\s+/,
	endingHash: /#$/,
	startingSpaceChar: /^ /,
	endingSpaceChar: / $/,
	endingSpaceTabChar: /[ \t]$/,
	nonSpaceChar: /[^ ]/,
	newLineCharGlobal: /\n/g,
	tabCharGlobal: /\t/g,
	leadingSpaceTab: /^[ \t]+/,
	multipleSpaceGlobal: /\s+/g,
	blankLine: /^[ \t]*$/,
	doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
	blockquoteStart: /^ {0,3}>/,
	blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
	blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
	blockquoteMarkerWhitespace: /^( {0,3}>)([ \t]+)/gm,
	listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
	listIsTask: /^\[[ xX]\] +\S/,
	listReplaceTask: /^\[[ xX]\] +/,
	listTaskCheckbox: /\[[ xX]\]/,
	anyLine: /\n.*\n/,
	hrefBrackets: /^<(.*)>$/,
	tableDelimiter: /[:|]/,
	tableAlignChars: /^\||\| *$/g,
	tableRowBlankLine: /\n[ \t]*$/,
	tableAlignRight: /^ *-+: *$/,
	tableAlignCenter: /^ *:-+: *$/,
	tableAlignLeft: /^ *:-+ *$/,
	startATag: /^<a /i,
	endATag: /^<\/a>/i,
	startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
	endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
	startAngleBracket: /^</,
	endAngleBracket: />$/,
	pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
	unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
	numericCharacterReference: /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));/,
	numericCharacterReferenceOrAmpersand: /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
	escapeTest: /[&<>"']/,
	escapeReplace: /[&<>"']/g,
	escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
	escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
	caret: /(^|[^\[])\^/g,
	percentDecode: /%25/g,
	findPipe: /\|/g,
	splitPipe: / \|/,
	slashPipe: /\\\|/g,
	carriageReturn: /\r\n|\r/g,
	spaceLine: /^ +$/gm,
	notSpaceStart: /^\S*/,
	endingNewline: /\n$/,
	listItemRegex: (e) => RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),
	nextBulletRegex: Yt((e) => RegExp(`^ {0,${e}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),
	hrRegex: Yt((e) => RegExp(`^ {0,${e}}((?:-[ 	]*){3,}|(?:_[ 	]*){3,}|(?:\\*[ 	]*){3,})(?:\\n+|$)`)),
	fencesBeginRegex: Yt((e) => RegExp(`^ {0,${e}}(?:\`\`\`|~~~)`)),
	headingBeginRegex: Yt((e) => RegExp(`^ {0,${e}}#{1,6}(?:\\s|$)`)),
	pedanticHeadingBeginRegex: Yt((e) => RegExp(`^ {0,${e}}#`)),
	htmlBeginRegex: Yt((e) => RegExp(`^ {0,${e}}(?:</?(?:${pn})(?: +|$|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`, "i")),
	blockquoteBeginRegex: Yt((e) => RegExp(`^ {0,${e}}>`))
}, Qt = /^(?:[ \t]*(?:\n|$))+/, $t = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, en = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, tn = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, nn = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, rn = / {0,3}(?:[*+-]|\d{1,9}[.)])/, an = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |fences|blockquote|heading|hr|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, on = V(an).replace(/bull/g, rn).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/hr/g, / {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), sn = V(an).replace(/bull/g, rn).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/hr/g, / {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), cn = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/, ln = /^[^\n]+/, un = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/, dn = V(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", un).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), fn = V(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, rn).getRegex(), pn = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", mn = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, hn = V("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?:[ \\t]+|\\n|/?>|$)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!(?:script|pre|style|textarea)(?![a-z0-9-]))([a-z][a-z0-9-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</[a-z][a-z0-9-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", mn).replace("tag", pn).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), gn = (e) => V(cn).replace("hr", tn).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", e).replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", pn).getRegex(), _n = gn(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/), vn = gn(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/), yn = {
	blockquote: V(/^( {0,3}> ?(?:(?![ \t]*(?:\n|$))(paragraph)|[^\n]*)(?:\n|$))+/).replace("paragraph", vn).getRegex(),
	code: $t,
	def: dn,
	fences: en,
	heading: nn,
	hr: tn,
	html: hn,
	lheading: on,
	list: fn,
	newline: Qt,
	paragraph: _n,
	table: Jt,
	text: ln
}, bn = V("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", tn).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", pn).getRegex(), xn = {
	...yn,
	lheading: sn,
	table: bn,
	paragraph: V(cn).replace("hr", tn).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", bn).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", pn).getRegex()
}, Sn = {
	...yn,
	html: V("^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:\"[^\"]*\"|'[^']*'|\\s[^'\"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))").replace("comment", mn).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
	def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
	heading: /^(#{1,6})(.*)(?:\n+|$)/,
	fences: Jt,
	lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
	paragraph: V(cn).replace("hr", tn).replace("heading", " *#{1,6} *[^\n]").replace("lheading", on).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, Cn = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, wn = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Tn = /^( {2,}|\\)\n(?!\s*$)[ \t]*/, En = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, Dn = /[\p{P}\p{S}]/u, On = /[\s\p{P}\p{S}]/u, kn = /[^\s\p{P}\p{S}]/u, An = V(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, On).getRegex(), jn = /[\p{Pi}\p{Ps}"']/u, Mn = /(?!~)[\p{P}\p{S}]/u, Nn = /(?!~)[\s\p{P}\p{S}]/u, Pn = /(?:[^\s\p{P}\p{S}]|~)/u, Fn = V(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", Xt ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex(), In = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/, Ln = V(In, "u").replace(/punct/g, Dn).getRegex(), Rn = V(In, "u").replace(/punct/g, Mn).getRegex(), zn = V(/^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/, "u").replace(/openQuote/g, jn).replace(/punct/g, Dn).getRegex(), Bn = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", Vn = V(Bn, "gu").replace(/notPunctSpace/g, kn).replace(/punctSpace/g, On).replace(/punct/g, Dn).getRegex(), Hn = V(Bn, "gu").replace(/notPunctSpace/g, Pn).replace(/punctSpace/g, Nn).replace(/punct/g, Mn).getRegex(), Un = V("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, kn).replace(/punctSpace/g, On).replace(/punct/g, Dn).getRegex(), Wn = V("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, kn).replace(/punctSpace/g, On).replace(/punct/g, Dn).getRegex(), Gn = V("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, kn).replace(/punctSpace/g, On).replace(/punct/g, Dn).getRegex(), Kn = V(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, Dn).getRegex(), qn = V("^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, kn).replace(/punctSpace/g, On).replace(/punct/g, Dn).getRegex(), Jn = V(/\\(punct)/, "gu").replace(/punct/g, Dn).getRegex(), Yn = V(/(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\(punct)/, "gu").replace(/punct/g, Dn).getRegex(), Xn = V(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), Zn = V(mn).replace("(?:-->|$)", "-->").getRegex(), Qn = V("^comment|^</[a-zA-Z][a-zA-Z0-9-]*\\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", Zn).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), $n = /\[(?:\\[\s\S]|[^\[\]\\])*\]/, er = V(/(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/).replace("brackets", $n).getRegex(), tr = V(/^!?\[(label)\]\([ \t\n]*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?[ \t\n]*\)/).replace("label", er).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), nr = V(/^!?\[(label)\]\[(ref)\]/).replace("label", er).replace("ref", un).getRegex(), rr = V(/^!?\[(ref)\](?:\[\])?/).replace("ref", un).getRegex(), ir = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999}/, ar = V(/(?:[^\[\]\\`]*(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?/).replace("brackets", $n).getRegex(), or = V("reflink|nolink(?!\\()", "g").replace("reflink", V(/^!?\[(label)\]\[(ref)\]/).replace("label", ar).replace("ref", ir).getRegex()).replace("nolink", V(/^!?\[(ref)\](?:\[\])?/).replace("ref", ir).getRegex()).getRegex(), sr = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/, cr = V(/(?:mailto:email|xmpp:email(?:\/[A-Za-z0-9@.]+)?)/).replace(/email/g, /[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(), lr = {
	_backpedal: Jt,
	anyPunctuation: Jn,
	anyPunctuationOutsideCode: Yn,
	autolink: Xn,
	blockSkip: Fn,
	br: Tn,
	code: wn,
	del: Jt,
	delLDelim: Jt,
	delRDelim: Jt,
	emStrongLDelim: Ln,
	emStrongRDelimAst: Vn,
	emStrongRDelimUnd: Wn,
	escape: Cn,
	link: tr,
	nolink: rr,
	punctuation: An,
	reflink: nr,
	reflinkSearch: or,
	tag: Qn,
	text: En,
	url: Jt
}, ur = {
	...lr,
	emStrongLDelim: zn,
	emStrongRDelimAst: Un,
	emStrongRDelimUnd: Gn,
	link: V(/^!?\[(label)\]\((.*?)\)/).replace("label", er).getRegex(),
	reflink: V(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", er).getRegex()
}, dr = {
	...lr,
	emStrongRDelimAst: Hn,
	emStrongLDelim: Rn,
	delLDelim: Kn,
	delRDelim: qn,
	url: V(/^emailProtocol|^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("emailProtocol", cr).replace("protocol", sr).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(),
	_backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
	del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,
	text: V(/^(?:[^a-zA-Z0-9](?=emailProtocol)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=emailProtocol)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))))/).replace("protocol", sr).replace(/emailProtocol/g, /(?:mailto|xmpp):/).getRegex()
}, fr = {
	...dr,
	br: V(Tn).replace("{2,}", "*").getRegex(),
	text: V(dr.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, pr = {
	normal: yn,
	gfm: xn,
	pedantic: Sn
}, mr = {
	normal: lr,
	gfm: dr,
	breaks: fr,
	pedantic: ur
}, hr = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
}, gr = (e) => hr[e];
function _r(e, t) {
	if (t) {
		if (Zt.escapeTest.test(e)) return e.replace(Zt.escapeReplace, gr);
	} else if (Zt.escapeTestNoEncode.test(e)) return e.replace(Zt.escapeReplaceNoEncode, gr);
	return e;
}
function vr(e) {
	return Zt.numericCharacterReference.test(e) ? e.replace(Zt.numericCharacterReferenceOrAmpersand, (e, t, n) => {
		if (t === void 0 && n === void 0) return "&amp;";
		let r = t === void 0 ? Number.parseInt(n, 16) : Number.parseInt(t, 10);
		return r === 0 || r > 1114111 || r >= 55296 && r <= 57343 ? "�" : r === 38 ? "&amp;" : String.fromCodePoint(r);
	}) : e;
}
function yr(e) {
	try {
		e = encodeURI(e).replace(Zt.percentDecode, "%");
	} catch {
		return null;
	}
	return e;
}
function br(e, t) {
	let n = e.replace(Zt.findPipe, (e, t, n) => {
		let r = !1, i = t;
		for (; --i >= 0 && n[i] === "\\";) r = !r;
		return r ? "|" : " |";
	}).split(Zt.splitPipe), r = 0;
	if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), t) {
		if (n.length > t) n.splice(t);
		else for (; n.length < t;) n.push("");
	}
	for (; r < n.length; r++) n[r] = n[r].trim().replace(Zt.slashPipe, "|");
	return n;
}
function xr(e, t, n) {
	let r = e.length;
	if (r === 0) return "";
	let i = 0;
	for (; i < r;) {
		let a = e.charAt(r - i - 1);
		if (a === t && !n) i++;
		else if (a !== t && n) i++;
		else break;
	}
	return e.slice(0, r - i);
}
function Sr(e) {
	let t = e.split("\n"), n = t.length - 1;
	for (; n >= 0 && Zt.blankLine.test(t[n]);) n--;
	return t.length - n <= 2 ? e : t.slice(0, n + 1).join("\n");
}
function Cr(e) {
	return e.trim().toLowerCase().toUpperCase().toLowerCase();
}
function wr(e, t) {
	if (e.indexOf(t[0]) === -1 && e.indexOf(t[1]) === -1) return -1;
	let n = 0;
	for (let r = 0; r < e.length; r++) if (e[r] === "\\") r++;
	else if (e[r] === t[0]) n++;
	else if (e[r] === t[1] && (n--, n < 0)) return r;
	return n > 0 ? -2 : -1;
}
function Tr(e, t = 0) {
	let n = t, r = "";
	for (let t of e) if (t === "	") {
		let e = 4 - n % 4;
		r += " ".repeat(e), n += e;
	} else r += t, n++;
	return r;
}
function Er(e, t, n, r, i) {
	let a = t.href, o = t.title || null, s = e[1].replace(i.other.outputLinkReplace, "$1"), c = e[0].charAt(0) === "!", l = r.state.inLink, u = r.state.linkEmitted, d = r.state.inRawBlock;
	r.state.inLink = !0, r.state.linkEmitted = !1;
	let f = r.inlineTokens(s), p = r.state.linkEmitted;
	if (r.state.linkEmitted = u, r.state.inLink = l, !c) {
		if (p) {
			r.state.inRawBlock = d;
			return;
		}
		r.state.linkEmitted = !0;
	}
	return {
		type: c ? "image" : "link",
		raw: n,
		href: a,
		title: o,
		text: s,
		tokens: f
	};
}
function Dr(e, t, n) {
	let r = e.match(n.other.indentCodeCompensation);
	if (r === null) return t;
	let i = r[1];
	return t.split("\n").map((e) => {
		let t = e.match(n.other.beginningSpace);
		if (t === null) return e;
		let [r] = t;
		return e.slice(Math.min(r.length, i.length));
	}).join("\n");
}
function Or(e, t, n, r) {
	if (!t.includes("<")) return !1;
	for (let i = 0; i < t.length; i++) {
		if (t[i] === "\\") {
			i++;
			continue;
		}
		if (t[i] === "`") {
			let e = r.inline.code.exec(t.slice(i));
			if (e) {
				i += e[0].length - 1;
				continue;
			}
		}
		if (t[i] !== "<") continue;
		let a = e.slice(n + i), o = r.inline.tag.exec(a) || r.inline.autolink.exec(a);
		if (o) {
			if (o[0].length > t.length - i) return !0;
			i += o[0].length - 1;
		}
	}
	return !1;
}
var kr = class {
	options;
	rules;
	lexer;
	constructor(e) {
		this.options = e || Kt;
	}
	space(e) {
		let t = this.rules.block.newline.exec(e);
		if (t && t[0].length > 0) return {
			type: "space",
			raw: t[0]
		};
	}
	code(e) {
		let t = this.rules.block.code.exec(e);
		if (t) {
			let e = this.options.pedantic ? t[0] : Sr(t[0]);
			return {
				type: "code",
				raw: e,
				codeBlockStyle: "indented",
				text: e.replace(this.rules.other.codeRemoveIndent, "")
			};
		}
	}
	fences(e) {
		let t = this.rules.block.fences.exec(e);
		if (t) {
			let e = t[0], n = Dr(e, t[3] || "", this.rules);
			return {
				type: "code",
				raw: e,
				lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2],
				text: n
			};
		}
	}
	heading(e) {
		let t = this.rules.block.heading.exec(e);
		if (t) {
			let e = t[2].trim();
			if (this.rules.other.endingHash.test(e)) {
				let t = xr(e, "#");
				(this.options.pedantic || !t || this.rules.other.endingSpaceTabChar.test(t)) && (e = t.trim());
			}
			return {
				type: "heading",
				raw: xr(t[0], "\n"),
				depth: t[1].length,
				text: e,
				tokens: this.lexer.inline(e)
			};
		}
	}
	hr(e) {
		let t = this.rules.block.hr.exec(e);
		if (t) return {
			type: "hr",
			raw: xr(t[0], "\n")
		};
	}
	blockquote(e) {
		let t = this.rules.block.blockquote.exec(e);
		if (t) {
			let e = xr(t[0], "\n").split("\n"), n = "", r = "", i = [];
			for (; e.length > 0;) {
				let t = !1, a = [], o = 0;
				for (; o < e.length; o++) if (this.rules.other.blockquoteStart.test(e[o])) a.push(e[o]), t = !0;
				else if (!t) a.push(e[o]);
				else break;
				e = e.slice(o);
				let s = a.join("\n"), c = s.replace(this.rules.other.blockquoteMarkerWhitespace, (e, t, n) => t + Tr(n, t.length)).replace(this.rules.other.blockquoteSetextReplace, "\n    $1").replace(this.rules.other.blockquoteSetextReplace2, "");
				n = n ? `${n}
${s}` : s, r = r ? `${r}
${c}` : c;
				let l = this.lexer.state.top;
				if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = l, e.length === 0) break;
				let u = i.at(-1);
				if (u?.type === "code" || u?.type === "heading" || u?.type === "hr" || u?.type === "html") break;
				if (u?.type === "blockquote") {
					let t = u, a = e.join("\n"), o = t.raw + "\n" + a.replace(this.rules.other.blockquoteSetextReplace2, ""), s = this.blockquote(o);
					i[i.length - 1] = s;
					let c = o.substring(s.raw.length).replace(/^\n/, ""), l = c ? c.split("\n").length : 0, d = l ? e.slice(0, -l) : e;
					d.length > 0 && (n = `${n}
${d.join("\n")}`), r = r.substring(0, r.length - t.text.length) + s.text;
					break;
				}
				if (u?.type === "list") {
					let t = u, a = t.raw + "\n" + e.join("\n"), o = this.list(a);
					i[i.length - 1] = o;
					let s = o.raw.length > t.raw.length ? a.slice(t.raw.length + 1, o.raw.length).split("\n").length : 0;
					if (s > 0) {
						let t = e.slice(0, s).join("\n");
						n = `${n}
${t}`, r = `${r}
${t}`;
					}
					e = e.slice(s);
				}
			}
			return {
				type: "blockquote",
				raw: n,
				tokens: i,
				text: r
			};
		}
	}
	list(e) {
		let t = this.rules.block.list.exec(e);
		if (t) {
			let n = e, r = () => n.length - e.length, i = t[1].trim(), a = i.length > 1, o = {
				type: "list",
				raw: "",
				ordered: a,
				start: a ? +i.slice(0, -1) : "",
				loose: !1,
				items: []
			};
			i = a ? `\\d{1,9}\\${i.slice(-1)}` : `\\${i}`, this.options.pedantic && (i = a ? i : "[*+-]");
			let s = this.rules.other.listItemRegex(i), c = !1;
			for (; e;) {
				let i = !1, a = "";
				if (!(t = s.exec(e)) || this.rules.block.hr.test(e)) break;
				let l = r();
				e = e.substring(t[0].length);
				let u = t[2].split("\n", 1)[0], d = t[1].length, f = this.options.pedantic ? Tr(u, d) : u.replace(this.rules.other.leadingSpaceTab, (e) => Tr(e, d)), p = e.split("\n", 1)[0], m = !f.trim(), h = 0;
				if (this.options.pedantic ? (h = 2, a = f.trimStart()) : m ? h = d + 1 : (h = f.search(this.rules.other.nonSpaceChar), h = h > 4 ? 1 : h, a = f.slice(h), h += d), m && this.rules.other.blankLine.test(p) && (e = e.substring(p.length + 1), i = !0), !i) {
					let t = this.rules.other.nextBulletRegex(h), n = this.rules.other.hrRegex(h), r = this.rules.other.fencesBeginRegex(h), i = this.options.pedantic ? this.rules.other.pedanticHeadingBeginRegex(h) : this.rules.other.headingBeginRegex(h), o = this.rules.other.htmlBeginRegex(h), s = this.rules.other.blockquoteBeginRegex(h);
					for (; e;) {
						let c = e.split("\n", 1)[0], l;
						if (p = c, this.options.pedantic ? (p = p.replace(this.rules.other.listReplaceNesting, "  "), l = p) : l = p.replace(this.rules.other.leadingSpaceTab, (e) => Tr(e)), r.test(p) || i.test(p) || o.test(p) || s.test(p) || t.test(p) || n.test(p)) break;
						if (l.search(this.rules.other.nonSpaceChar) >= h || !p.trim()) a += "\n" + l.slice(h);
						else {
							if (m || f.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || r.test(f) || i.test(f) || n.test(f)) break;
							let e = !this.options.pedantic && /^ {0,3}(?:=+|-+) *$/.test(p) && this.rules.block.lheading.test(`${f}
${p}`) ? `    ${l.replace(/^ {0,3}/, "")}` : p;
							a += "\n" + e;
						}
						m = !p.trim(), e = e.substring(c.length + 1), f = l.slice(h);
					}
				}
				let g = n.slice(l, r());
				o.loose || (c ? o.loose = !0 : this.rules.other.doubleBlankLine.test(g) && (c = !0)), o.items.push({
					type: "list_item",
					raw: g,
					task: !!this.options.gfm && this.rules.other.listIsTask.test(a),
					loose: !1,
					text: a,
					tokens: []
				});
			}
			let l = o.items.at(-1);
			if (l) l.raw = l.raw.trimEnd(), l.text = l.text.trimEnd();
			else return;
			o.raw = n.slice(0, r()).trimEnd();
			for (let e of o.items) if (this.lexer.state.top = !1, e.tokens = this.lexer.blockTokens(e.text, []), !o.loose) {
				let t = e.tokens.filter((e) => e.type === "space");
				o.loose = t.length > 0 && t.some((e) => this.rules.other.anyLine.test(e.raw));
			}
			for (let e of o.items) {
				let t = e.tokens[0];
				if (e.task && (t?.type === "text" || t?.type === "paragraph")) {
					e.text = e.text.replace(this.rules.other.listReplaceTask, ""), t.raw = t.raw.replace(this.rules.other.listReplaceTask, ""), t.text = t.text.replace(this.rules.other.listReplaceTask, "");
					for (let e = this.lexer.inlineQueue.length - 1; e >= 0; e--) if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[e].src)) {
						this.lexer.inlineQueue[e].src = this.lexer.inlineQueue[e].src.replace(this.rules.other.listReplaceTask, "");
						break;
					}
					let n = this.rules.other.listTaskCheckbox.exec(e.raw);
					if (n) {
						let t = {
							type: "checkbox",
							raw: n[0] + " ",
							checked: n[0] !== "[ ]"
						};
						e.checked = t.checked, o.loose ? e.tokens[0] && ["paragraph", "text"].includes(e.tokens[0].type) && "tokens" in e.tokens[0] && e.tokens[0].tokens ? (e.tokens[0].raw = t.raw + e.tokens[0].raw, e.tokens[0].text = t.raw + e.tokens[0].text, e.tokens[0].tokens.unshift(t)) : e.tokens.unshift({
							type: "paragraph",
							raw: t.raw,
							text: t.raw,
							tokens: [t]
						}) : e.tokens.unshift(t);
					}
				} else e.task &&= !1;
			}
			if (o.loose) for (let e of o.items) {
				e.loose = !0;
				for (let t of e.tokens) t.type === "text" && (t.type = "paragraph");
			}
			return o;
		}
	}
	html(e) {
		let t = this.rules.block.html.exec(e);
		if (t) {
			let e = Sr(t[0]);
			return {
				type: "html",
				block: !0,
				raw: e,
				pre: t[1] === "pre" || t[1] === "script" || t[1] === "style",
				text: e
			};
		}
	}
	def(e) {
		let t = this.rules.block.def.exec(e);
		if (t) {
			if (!this.rules.other.startAngleBracket.test(t[2]) && wr(t[2], "()") !== -1) return;
			let e = Cr(t[1]).replace(this.rules.other.multipleSpaceGlobal, " "), n = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
			return {
				type: "def",
				tag: e,
				raw: xr(t[0], "\n"),
				href: n,
				title: r
			};
		}
	}
	table(e) {
		let t = this.rules.block.table.exec(e);
		if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
		let n = br(t[1]), r = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), i = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split("\n") : [], a = {
			type: "table",
			raw: xr(t[0], "\n"),
			header: [],
			align: [],
			rows: []
		};
		if (n.length === r.length) {
			for (let e of r) this.rules.other.tableAlignRight.test(e) ? a.align.push("right") : this.rules.other.tableAlignCenter.test(e) ? a.align.push("center") : this.rules.other.tableAlignLeft.test(e) ? a.align.push("left") : a.align.push(null);
			for (let e = 0; e < n.length; e++) a.header.push({
				text: n[e],
				tokens: this.lexer.inline(n[e]),
				header: !0,
				align: a.align[e]
			});
			for (let e of i) a.rows.push(br(e, a.header.length).map((e, t) => ({
				text: e,
				tokens: this.lexer.inline(e),
				header: !1,
				align: a.align[t]
			})));
			return a;
		}
	}
	lheading(e) {
		let t = this.rules.block.lheading.exec(e);
		if (t) {
			let e = t[1].trim();
			return {
				type: "heading",
				raw: xr(t[0], "\n"),
				depth: t[2].charAt(0) === "=" ? 1 : 2,
				text: e,
				tokens: this.lexer.inline(e)
			};
		}
	}
	paragraph(e) {
		let t = this.rules.block.paragraph.exec(e);
		if (t) {
			let e = t[1].charAt(t[1].length - 1) === "\n" ? t[1].slice(0, -1) : t[1];
			return {
				type: "paragraph",
				raw: t[0],
				text: e,
				tokens: this.lexer.inline(e)
			};
		}
	}
	text(e) {
		let t = this.rules.block.text.exec(e);
		if (t) return {
			type: "text",
			raw: t[0],
			text: t[0],
			tokens: this.lexer.inline(t[0])
		};
	}
	escape(e) {
		let t = this.rules.inline.escape.exec(e);
		if (t) return {
			type: "escape",
			raw: t[0],
			text: t[1]
		};
	}
	tag(e) {
		let t = this.rules.inline.tag.exec(e);
		if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = !1), {
			type: "html",
			raw: t[0],
			inLink: this.lexer.state.inLink,
			inRawBlock: this.lexer.state.inRawBlock,
			block: !1,
			text: t[0]
		};
	}
	link(e) {
		if (this.lexer.state.linkParenPossible === !1) return;
		let t = this.rules.inline.link.exec(e);
		if (t) {
			let n = t[0].charAt(0) === "!" ? 2 : 1;
			if (!this.options.pedantic && Or(e, t[1], n, this.rules)) return;
			let r = t[2].trim();
			if (!this.options.pedantic && this.rules.other.startAngleBracket.test(r)) {
				if (!this.rules.other.endAngleBracket.test(r)) return;
				let e = xr(r.slice(0, -1), "\\");
				if ((r.length - e.length) % 2 == 0) return;
			} else {
				let e = wr(t[2], "()");
				if (e === -2) return;
				if (e > -1) {
					let n = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + e;
					t[2] = t[2].substring(0, e), t[0] = t[0].substring(0, n).trim(), t[3] = "";
				}
			}
			let i = t[2], a = "";
			if (this.options.pedantic) {
				let e = this.rules.other.pedanticHrefTitle.exec(i);
				e && (i = e[1], a = e[3]);
			} else a = t[3] ? t[3].slice(1, -1) : "";
			return i = i.trim(), this.rules.other.startAngleBracket.test(i) && (i = this.options.pedantic && !this.rules.other.endAngleBracket.test(r) ? i.slice(1) : i.slice(1, -1)), Er(t, {
				href: i && i.replace(this.rules.inline.anyPunctuation, "$1"),
				title: a && a.replace(this.rules.inline.anyPunctuation, "$1")
			}, t[0], this.lexer, this.rules);
		}
	}
	reflink(e, t) {
		let n;
		if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
			let r = n[0].charAt(0) === "!" ? 2 : 1;
			if (!this.options.pedantic && Or(e, n[1], r, this.rules)) return;
			let i = t[Cr((n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "))];
			if (!i) {
				let e = n[0].charAt(0);
				return {
					type: "text",
					raw: e,
					text: e
				};
			}
			return Er(n, i, n[0], this.lexer, this.rules);
		}
	}
	emStrong(e, t, n = "") {
		let r = this.rules.inline.emStrongLDelim.exec(e);
		if (!r || !r[1] && !r[2] && !r[3] && !r[4]) return;
		let i = r[0][0], a = n === i, o = t.length - e.length, s = o;
		for (; !this.options.pedantic && s > 0 && t[s - 1] === i;) s--;
		let c = [...t.slice(Math.max(0, s - 2), s)].at(-1) ?? "", l = c === "*" || c === "_" || !!this.rules.inline.punctuation.exec(c);
		s < o && (n = c);
		let u = s < o ? l : !!this.rules.inline.punctuation.exec(n);
		if (r[4] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
		let d = r[1] || r[3] || "";
		if (!d || !n || u) {
			let n = [...r[0]].length - 1, u, f, p = n, m = 0, h = o - s + n, g = !this.options.pedantic && !!c.trim() && (!!d || i === "*" && !l), _ = i === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
			for (_.lastIndex = 0, t = t.slice(-1 * e.length + n); (r = _.exec(t)) !== null;) {
				if (u = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !u) continue;
				if (f = [...u].length, r[3] || r[4]) {
					p += f;
					continue;
				}
				if (r[5] || r[6] || g) {
					if (a && (r[5] || r[6])) break;
					if (h % 3 && !((h + f) % 3)) {
						m += f;
						continue;
					}
				}
				if (p -= f, p > 0) continue;
				f = Math.min(f, f + p + m);
				let t = [...r[0]][0].length, i = e.slice(0, n + r.index + t + f);
				if (Math.min(n, f) % 2) {
					let e = i.slice(1, -1);
					return {
						type: "em",
						raw: i,
						text: e,
						tokens: this.lexer.inlineTokens(e)
					};
				}
				let o = i.slice(2, -2);
				return {
					type: "strong",
					raw: i,
					text: o,
					tokens: this.lexer.inlineTokens(o)
				};
			}
		}
	}
	codespan(e) {
		let t = this.rules.inline.code.exec(e);
		if (t) {
			let e = t[2].replace(this.rules.other.newLineCharGlobal, " "), n = this.rules.other.nonSpaceChar.test(e), r = this.rules.other.startingSpaceChar.test(e) && this.rules.other.endingSpaceChar.test(e);
			return n && r && (e = e.substring(1, e.length - 1)), {
				type: "codespan",
				raw: t[0],
				text: e
			};
		}
	}
	br(e) {
		let t = this.rules.inline.br.exec(e);
		if (t) return {
			type: "br",
			raw: t[0]
		};
	}
	del(e, t, n = "") {
		let r = this.rules.inline.delLDelim.exec(e);
		if (r && (!r[1] || !n || this.rules.inline.punctuation.exec(n))) {
			let n = [...r[0]].length - 1, i, a, o = n, s = this.rules.inline.delRDelim;
			for (s.lastIndex = 0, t = t.slice(-1 * e.length + n); (r = s.exec(t)) !== null;) {
				if (i = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !i || (a = [...i].length, a !== n)) continue;
				if (r[3] || r[4]) {
					o += a;
					continue;
				}
				if (o -= a, o > 0) continue;
				a = Math.min(a, a + o);
				let t = [...r[0]][0].length, s = e.slice(0, n + r.index + t + a), c = s.slice(n, -n);
				return {
					type: "del",
					raw: s,
					text: c,
					tokens: this.lexer.inlineTokens(c)
				};
			}
		}
	}
	autolink(e) {
		let t = this.rules.inline.autolink.exec(e);
		if (t) {
			let e, n;
			return t[2] === "@" ? (e = t[1], n = "mailto:" + e) : (e = t[1], n = e), {
				type: "link",
				raw: t[0],
				text: e,
				href: n,
				autolink: !0,
				tokens: [{
					type: "text",
					raw: e,
					text: e
				}]
			};
		}
	}
	url(e) {
		let t;
		if (t = this.rules.inline.url.exec(e)) {
			let e, n;
			if (t[2] === "@") e = t[0], n = "mailto:" + e;
			else {
				let r;
				do
					r = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
				while (r !== t[0]);
				e = t[0], n = t[1] === "www." ? "http://" + t[0] : t[0];
			}
			return {
				type: "link",
				raw: t[0],
				text: e,
				href: n,
				autolink: !0,
				tokens: [{
					type: "text",
					raw: e,
					text: e
				}]
			};
		}
	}
	inlineText(e) {
		let t = this.rules.inline.text.exec(e);
		if (t) {
			let e = this.lexer.state.inRawBlock;
			return {
				type: "text",
				raw: t[0],
				text: e ? t[0] : vr(t[0]),
				escaped: e
			};
		}
	}
}, Ar = class e {
	tokens;
	options;
	state;
	inlineQueue;
	tokenizer;
	constructor(e) {
		this.tokens = [], this.tokens.links = Object.create(null), this.options = e || Kt, this.options.tokenizer = this.options.tokenizer || new kr(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
			inLink: !1,
			inRawBlock: !1,
			linkEmitted: !1,
			linkParenPossible: !0,
			top: !0
		};
		let t = {
			other: Zt,
			block: pr.normal,
			inline: mr.normal
		};
		this.options.pedantic ? (t.block = pr.pedantic, t.inline = mr.pedantic) : this.options.gfm && (t.block = pr.gfm, t.inline = this.options.breaks ? mr.breaks : mr.gfm), this.tokenizer.rules = t;
	}
	static get rules() {
		return {
			block: pr,
			inline: mr
		};
	}
	static lex(t, n) {
		return new e(n).lex(t);
	}
	static lexInline(t, n) {
		return new e(n).inlineTokens(t);
	}
	lex(e) {
		e = e.replace(Zt.carriageReturn, "\n"), this.blockTokens(e, this.tokens);
		for (let e = 0; e < this.inlineQueue.length; e++) {
			let t = this.inlineQueue[e];
			this.state.inRawBlock = !1, this.inlineTokens(t.src, t.tokens);
		}
		return this.inlineQueue = [], this.tokens;
	}
	blockTokens(e, t = [], n = !1) {
		this.tokenizer.lexer = this, this.options.pedantic && (e = e.replace(Zt.tabCharGlobal, "    ").replace(Zt.spaceLine, ""));
		let r = 1 / 0;
		for (; e;) {
			if (e.length < r) r = e.length;
			else {
				this.infiniteLoopError(e.charCodeAt(0));
				break;
			}
			let i;
			if (this.options.extensions?.block?.some((n) => (i = n.call({ lexer: this }, e, t)) ? (e = e.substring(i.raw.length), t.push(i), !0) : !1)) continue;
			if (i = this.tokenizer.space(e)) {
				e = e.substring(i.raw.length);
				let n = t.at(-1);
				i.raw.length === 1 && n !== void 0 ? n.raw += "\n" : t.push(i);
				continue;
			}
			if (i = this.tokenizer.code(e)) {
				e = e.substring(i.raw.length);
				let n = t.at(-1);
				n?.type === "paragraph" || n?.type === "text" ? (n.raw += (n.raw.endsWith("\n") ? "" : "\n") + i.raw, n.text += "\n" + i.text, this.inlineQueue.at(-1).src = n.text) : t.push(i);
				continue;
			}
			if ((i = this.tokenizer.fences(e)) || (i = this.tokenizer.heading(e)) || (i = this.tokenizer.hr(e)) || (i = this.tokenizer.blockquote(e)) || (i = this.tokenizer.list(e)) || (i = this.tokenizer.html(e))) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.def(e)) {
				e = e.substring(i.raw.length);
				let n = t.at(-1);
				n?.type === "paragraph" || n?.type === "text" ? (n.raw += (n.raw.endsWith("\n") ? "" : "\n") + i.raw, n.text += "\n" + i.raw, this.inlineQueue.at(-1).src = n.text) : (this.tokens.links[i.tag] || (this.tokens.links[i.tag] = {
					href: i.href,
					title: i.title
				}), t.push(i));
				continue;
			}
			if ((i = this.tokenizer.table(e)) || (i = this.tokenizer.lheading(e))) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			let a = e;
			if (this.options.extensions?.startBlock) {
				let t = 1 / 0, n = e.slice(1), r;
				this.options.extensions.startBlock.forEach((e) => {
					r = e.call({ lexer: this }, n), typeof r == "number" && r >= 0 && (t = Math.min(t, r));
				}), t < 1 / 0 && t >= 0 && (a = e.substring(0, t + 1));
			}
			if (this.state.top && (i = this.tokenizer.paragraph(a))) {
				let r = t.at(-1);
				n && r?.type === "paragraph" ? (r.raw += (r.raw.endsWith("\n") ? "" : "\n") + i.raw, r.text += "\n" + i.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = r.text) : t.push(i), n = a.length !== e.length, e = e.substring(i.raw.length);
			} else if (i = this.tokenizer.text(e)) {
				e = e.substring(i.raw.length);
				let n = t.at(-1);
				n?.type === "text" ? (n.raw += (n.raw.endsWith("\n") ? "" : "\n") + i.raw, n.text += "\n" + i.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = n.text) : t.push(i);
			} else if (e) {
				this.infiniteLoopError(e.charCodeAt(0));
				break;
			}
		}
		return this.state.top = !0, t;
	}
	inline(e, t = []) {
		return this.inlineQueue.push({
			src: e,
			tokens: t
		}), t;
	}
	linkInText(e) {
		if (!e.includes("[")) return !1;
		let t = this.tokenizer.rules.inline.link;
		for (let n of e.matchAll(this.tokenizer.rules.inline.blockSkip)) if (t.test(n[0]) && e.charAt(n.index - 1) !== "!") return !0;
		for (let t of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)) {
			let e = t[0], n = e.lastIndexOf("[");
			if (e.charAt(0) !== "!" && Object.hasOwn(this.tokens.links, Cr(e.slice(n + 1, -1))) && !(n > 1 && this.linkInText(e.slice(1, n - 1)))) return !0;
		}
		return !1;
	}
	inlineTokens(e, t = []) {
		this.tokenizer.lexer = this;
		let n = this.state.linkParenPossible;
		this.state.linkParenPossible = n && e.includes(")");
		try {
			return this.#e(e, t);
		} finally {
			this.state.linkParenPossible = n;
		}
	}
	#e(e, t) {
		let n = e.includes("*") || e.includes("_") || e.includes("~") || this.options.hooks?.emStrongMask || this.tokenizer.emStrong !== kr.prototype.emStrong || this.tokenizer.del !== kr.prototype.del ? this.#t(e) : e, r = !1, i = "", a = 1 / 0;
		for (; e;) {
			if (e.length < a) a = e.length;
			else {
				this.infiniteLoopError(e.charCodeAt(0));
				break;
			}
			r || (i = ""), r = !1;
			let o;
			if (this.options.extensions?.inline?.some((n) => (o = n.call({ lexer: this }, e, t)) ? (e = e.substring(o.raw.length), t.push(o), !0) : !1)) continue;
			if ((o = this.tokenizer.escape(e)) || (o = this.tokenizer.tag(e)) || (o = this.tokenizer.link(e))) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.reflink(e, this.tokens.links)) {
				e = e.substring(o.raw.length);
				let n = t.at(-1);
				o.type === "text" && n?.type === "text" ? (n.raw += o.raw, n.text += o.text) : t.push(o);
				continue;
			}
			if ((o = this.tokenizer.emStrong(e, n, i)) || (o = this.tokenizer.codespan(e)) || (o = this.tokenizer.br(e)) || (o = this.tokenizer.del(e, n, i)) || (o = this.tokenizer.autolink(e)) || !this.state.inLink && (o = this.tokenizer.url(e))) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			let s = e;
			if (this.options.extensions?.startInline) {
				let t = 1 / 0, n = e.slice(1), r;
				this.options.extensions.startInline.forEach((e) => {
					r = e.call({ lexer: this }, n), typeof r == "number" && r >= 0 && (t = Math.min(t, r));
				}), t < 1 / 0 && t >= 0 && (s = e.substring(0, t + 1));
			}
			if (o = this.tokenizer.inlineText(s)) {
				e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (i = o.raw.slice(-1)), r = !0;
				let n = t.at(-1);
				n?.type === "text" ? (n.raw += o.raw, n.text += o.text) : t.push(o);
			} else if (e) {
				this.infiniteLoopError(e.charCodeAt(0));
				break;
			}
		}
		return t;
	}
	#t(e) {
		let t = e;
		if (this.tokens.links && e.includes("[")) {
			let e = this.tokenizer.rules.inline.reflinkSearch, n = (t) => {
				let r = t.lastIndexOf("[");
				if (!Object.hasOwn(this.tokens.links, Cr(t.slice(r + 1, -1)))) return t;
				if (r > 1 && t.charAt(0) !== "!") {
					let i = t.slice(1, r - 1);
					if (this.linkInText(i)) return "[" + i.replace(e, n) + "][" + "a".repeat(t.length - r - 2) + "]";
				}
				return "[" + "a".repeat(t.length - 2) + "]";
			};
			t = t.replace(e, n);
		}
		return t = t.replace(this.tokenizer.rules.inline.anyPunctuationOutsideCode, (e, t, n) => n ? "+".repeat(e.length) : t ? t + e.slice(t.length, -t.length).replace(/`/g, "+") + t : e), t = t.replace(this.tokenizer.rules.inline.blockSkip, (e, t, n) => {
			let r = n ? n.length : 0;
			return e.slice(0, r) + "[" + "a".repeat(e.length - r - 2) + "]";
		}), t = this.options.hooks?.emStrongMask?.call({ lexer: this }, t) ?? t, t;
	}
	infiniteLoopError(e) {
		let t = "Infinite loop on byte: " + e;
		if (this.options.silent) console.error(t);
		else throw Error(t);
	}
}, jr = class {
	options;
	parser;
	constructor(e) {
		this.options = e || Kt;
	}
	space(e) {
		return "";
	}
	code({ text: e, lang: t, escaped: n }) {
		let r = (t || "").match(Zt.notSpaceStart)?.[0], i = e ? e.replace(Zt.endingNewline, "") + "\n" : "";
		return r ? "<pre><code class=\"language-" + _r(r) + "\">" + (n ? i : _r(i, !0)) + "</code></pre>\n" : "<pre><code>" + (n ? i : _r(i, !0)) + "</code></pre>\n";
	}
	blockquote({ tokens: e }) {
		return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
	}
	html({ text: e }) {
		return e;
	}
	def(e) {
		return "";
	}
	heading({ tokens: e, depth: t }) {
		return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
	}
	hr(e) {
		return "<hr>\n";
	}
	list(e) {
		let t = e.ordered, n = e.start, r = "";
		for (let t = 0; t < e.items.length; t++) {
			let n = e.items[t];
			r += this.listitem(n);
		}
		let i = t ? "ol" : "ul", a = t && n !== 1 ? " start=\"" + n + "\"" : "";
		return "<" + i + a + ">\n" + r + "</" + i + ">\n";
	}
	listitem(e) {
		return `<li>${this.parser.parse(e.tokens)}</li>
`;
	}
	checkbox({ checked: e }) {
		return "<input " + (e ? "checked=\"\" " : "") + "disabled=\"\" type=\"checkbox\"> ";
	}
	paragraph({ tokens: e }) {
		return `<p>${this.parser.parseInline(e)}</p>
`;
	}
	table(e) {
		let t = "", n = "";
		for (let t = 0; t < e.header.length; t++) n += this.tablecell(e.header[t]);
		t += this.tablerow({ text: n });
		let r = "";
		for (let t = 0; t < e.rows.length; t++) {
			let i = e.rows[t];
			n = "";
			for (let e = 0; e < i.length; e++) n += this.tablecell(i[e]);
			r += this.tablerow({ text: n });
		}
		return r &&= `<tbody>${r}</tbody>`, "<table>\n<thead>\n" + t + "</thead>\n" + r + "</table>\n";
	}
	tablerow({ text: e }) {
		return `<tr>
${e}</tr>
`;
	}
	tablecell(e) {
		let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
		return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
	}
	strong({ tokens: e }) {
		return `<strong>${this.parser.parseInline(e)}</strong>`;
	}
	em({ tokens: e }) {
		return `<em>${this.parser.parseInline(e)}</em>`;
	}
	codespan({ text: e }) {
		return `<code>${_r(e, !0)}</code>`;
	}
	br(e) {
		return "<br>";
	}
	del({ tokens: e }) {
		return `<del>${this.parser.parseInline(e)}</del>`;
	}
	link({ href: e, title: t, text: n, tokens: r, autolink: i }) {
		let a = i ? _r(n, !0) : this.parser.parseInline(r), o = yr(e);
		if (o === null) return a;
		e = _r(o, i);
		let s = "<a href=\"" + e + "\"";
		return t && (s += " title=\"" + _r(t) + "\""), s += ">" + a + "</a>", s;
	}
	image({ href: e, title: t, text: n, tokens: r }) {
		r && (n = this.parser.parseInline(r, this.parser.textRenderer));
		let i = yr(e);
		if (i === null) return _r(n);
		e = i;
		let a = `<img src="${_r(e)}" alt="${_r(n)}"`;
		return t && (a += ` title="${_r(t)}"`), a += ">", a;
	}
	text(e) {
		return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : _r(e.text);
	}
}, Mr = class {
	parser;
	strong({ text: e, tokens: t }) {
		return t ? this.parser.parseInline(t, this) : e;
	}
	em({ text: e, tokens: t }) {
		return t ? this.parser.parseInline(t, this) : e;
	}
	codespan({ text: e }) {
		return e;
	}
	del({ text: e, tokens: t }) {
		return t ? this.parser.parseInline(t, this) : e;
	}
	html({ text: e }) {
		return e;
	}
	text({ text: e }) {
		return e;
	}
	link({ text: e, tokens: t }) {
		return t ? this.parser.parseInline(t, this) : e;
	}
	image({ text: e, tokens: t }) {
		return t ? this.parser.parseInline(t, this) : e;
	}
	br() {
		return "";
	}
	checkbox({ raw: e }) {
		return e;
	}
}, Nr = class e {
	options;
	renderer;
	textRenderer;
	constructor(e) {
		this.options = e || Kt, this.options.renderer = this.options.renderer || new jr(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new Mr(), this.textRenderer.parser = this;
	}
	static parse(t, n) {
		return new e(n).parse(t);
	}
	static parseInline(t, n) {
		return new e(n).parseInline(t);
	}
	parse(e) {
		this.renderer.parser = this;
		let t = "";
		for (let n = 0; n < e.length; n++) {
			let r = e[n];
			if (this.options.extensions?.renderers?.[r.type]) {
				let e = r, n = this.options.extensions.renderers[e.type].call({ parser: this }, e);
				if (n !== !1 || ![
					"space",
					"hr",
					"heading",
					"code",
					"table",
					"blockquote",
					"list",
					"checkbox",
					"html",
					"def",
					"paragraph",
					"text"
				].includes(e.type)) {
					t += n || "";
					continue;
				}
			}
			let i = r;
			switch (i.type) {
				case "space":
					t += this.renderer.space(i);
					break;
				case "hr":
					t += this.renderer.hr(i);
					break;
				case "heading":
					t += this.renderer.heading(i);
					break;
				case "code":
					t += this.renderer.code(i);
					break;
				case "table":
					t += this.renderer.table(i);
					break;
				case "blockquote":
					t += this.renderer.blockquote(i);
					break;
				case "list":
					t += this.renderer.list(i);
					break;
				case "checkbox":
					t += this.renderer.checkbox(i);
					break;
				case "html":
					t += this.renderer.html(i);
					break;
				case "def":
					t += this.renderer.def(i);
					break;
				case "paragraph":
					t += this.renderer.paragraph(i);
					break;
				case "text":
					t += this.renderer.text(i);
					break;
				default: {
					let e = "Token with \"" + i.type + "\" type was not found.";
					if (this.options.silent) return console.error(e), "";
					throw Error(e);
				}
			}
		}
		return t;
	}
	parseInline(e, t = this.renderer) {
		this.renderer.parser = this;
		let n = "";
		for (let r = 0; r < e.length; r++) {
			let i = e[r];
			if (this.options.extensions?.renderers?.[i.type]) {
				let e = this.options.extensions.renderers[i.type].call({ parser: this }, i);
				if (e !== !1 || ![
					"escape",
					"html",
					"link",
					"image",
					"checkbox",
					"strong",
					"em",
					"codespan",
					"br",
					"del",
					"text"
				].includes(i.type)) {
					n += e || "";
					continue;
				}
			}
			let a = i;
			switch (a.type) {
				case "escape":
					n += t.text(a);
					break;
				case "html":
					n += t.html(a);
					break;
				case "link":
					n += t.link(a);
					break;
				case "image":
					n += t.image(a);
					break;
				case "checkbox":
					n += t.checkbox(a);
					break;
				case "strong":
					n += t.strong(a);
					break;
				case "em":
					n += t.em(a);
					break;
				case "codespan":
					n += t.codespan(a);
					break;
				case "br":
					n += t.br(a);
					break;
				case "del":
					n += t.del(a);
					break;
				case "text":
					n += t.text(a);
					break;
				default: {
					let e = "Token with \"" + a.type + "\" type was not found.";
					if (this.options.silent) return console.error(e), "";
					throw Error(e);
				}
			}
		}
		return n;
	}
}, Pr = class {
	options;
	block;
	constructor(e) {
		this.options = e || Kt;
	}
	static passThroughHooks = /* @__PURE__ */ new Set([
		"preprocess",
		"postprocess",
		"processAllTokens",
		"emStrongMask"
	]);
	static passThroughHooksRespectAsync = /* @__PURE__ */ new Set([
		"preprocess",
		"postprocess",
		"processAllTokens"
	]);
	preprocess(e) {
		return e;
	}
	postprocess(e) {
		return e;
	}
	processAllTokens(e) {
		return e;
	}
	emStrongMask(e) {
		return e;
	}
	provideLexer(e = this.block) {
		return e ? Ar.lex : Ar.lexInline;
	}
	provideParser(e = this.block) {
		return e ? Nr.parse : Nr.parseInline;
	}
};
function Fr(e, t) {
	if (Array.isArray(t)) for (let n = 0; n < t.length; n++) e.push(t[n]);
	else e.push(t);
}
var Ir = new class {
	defaults = Gt();
	options = this.setOptions;
	parse = this.parseMarkdown(!0);
	parseInline = this.parseMarkdown(!1);
	Parser = Nr;
	Renderer = jr;
	TextRenderer = Mr;
	Lexer = Ar;
	Tokenizer = kr;
	Hooks = Pr;
	constructor(...e) {
		this.use(...e);
	}
	walkTokens(e, t) {
		let n = [];
		for (let r of e) switch (Fr(n, t.call(this, r)), r.type) {
			case "table": {
				let e = r;
				for (let r of e.header) Fr(n, this.walkTokens(r.tokens, t));
				for (let r of e.rows) for (let e of r) Fr(n, this.walkTokens(e.tokens, t));
				break;
			}
			case "list": {
				let e = r;
				Fr(n, this.walkTokens(e.items, t));
				break;
			}
			default: {
				let e = r;
				this.defaults.extensions?.childTokens?.[e.type] ? this.defaults.extensions.childTokens[e.type].forEach((r) => {
					let i = e[r].flat(1 / 0);
					Fr(n, this.walkTokens(i, t));
				}) : e.tokens && Fr(n, this.walkTokens(e.tokens, t));
			}
		}
		return n;
	}
	use(...e) {
		let t = this.defaults.extensions || {
			renderers: {},
			childTokens: {}
		};
		return e.forEach((e) => {
			let n = { ...e };
			if (n.async = this.defaults.async || n.async || !1, e.extensions && (e.extensions.forEach((e) => {
				if (!e.name) throw Error("extension name required");
				if ("renderer" in e) {
					let n = t.renderers[e.name];
					n ? t.renderers[e.name] = function(...t) {
						let r = e.renderer.apply(this, t);
						return r === !1 && (r = n.apply(this, t)), r;
					} : t.renderers[e.name] = e.renderer;
				}
				if ("tokenizer" in e) {
					if (!e.level || e.level !== "block" && e.level !== "inline") throw Error("extension level must be 'block' or 'inline'");
					let n = t[e.level];
					n ? n.unshift(e.tokenizer) : t[e.level] = [e.tokenizer], e.start && (e.level === "block" ? t.startBlock ? t.startBlock.push(e.start) : t.startBlock = [e.start] : e.level === "inline" && (t.startInline ? t.startInline.push(e.start) : t.startInline = [e.start]));
				}
				"childTokens" in e && e.childTokens && (t.childTokens[e.name] = e.childTokens);
			}), n.extensions = t), e.renderer) {
				let t = this.defaults.renderer || new jr(this.defaults);
				for (let n in e.renderer) {
					if (!(n in t)) throw Error(`renderer '${n}' does not exist`);
					if (["options", "parser"].includes(n)) continue;
					let r = n, i = e.renderer[r], a = t[r];
					t[r] = (...e) => {
						let n = i.apply(t, e);
						return n === !1 && (n = a.apply(t, e)), n || "";
					};
				}
				n.renderer = t;
			}
			if (e.tokenizer) {
				let t = this.defaults.tokenizer || new kr(this.defaults);
				for (let n in e.tokenizer) {
					if (!(n in t)) throw Error(`tokenizer '${n}' does not exist`);
					if ([
						"options",
						"rules",
						"lexer"
					].includes(n)) continue;
					let r = n, i = e.tokenizer[r], a = t[r];
					t[r] = (...e) => {
						let n = i.apply(t, e);
						return n === !1 && (n = a.apply(t, e)), n;
					};
				}
				n.tokenizer = t;
			}
			if (e.hooks) {
				let t = this.defaults.hooks || new Pr();
				for (let n in e.hooks) {
					if (!(n in t)) throw Error(`hook '${n}' does not exist`);
					if (["options", "block"].includes(n)) continue;
					let r = n, i = e.hooks[r], a = t[r];
					t[r] = Pr.passThroughHooks.has(n) ? (e) => {
						if (t.options.async && Pr.passThroughHooksRespectAsync.has(n)) return (async () => {
							let n = await i.call(t, e);
							return a.call(t, n);
						})();
						let r = i.call(t, e);
						return a.call(t, r);
					} : (...e) => {
						if (t.options.async) return (async () => {
							let n = await i.apply(t, e);
							return n === !1 && (n = await a.apply(t, e)), n;
						})();
						let n = i.apply(t, e);
						return n === !1 && (n = a.apply(t, e)), n;
					};
				}
				n.hooks = t;
			}
			if (e.walkTokens) {
				let t = this.defaults.walkTokens, r = e.walkTokens;
				n.walkTokens = function(e) {
					let n = [];
					return n.push(r.call(this, e)), t && Fr(n, t.call(this, e)), n;
				};
			}
			this.defaults = {
				...this.defaults,
				...n
			};
		}), this;
	}
	setOptions(e) {
		return this.defaults = {
			...this.defaults,
			...e
		}, this;
	}
	lexer(e, t) {
		return Ar.lex(e, t ?? this.defaults);
	}
	parser(e, t) {
		return Nr.parse(e, t ?? this.defaults);
	}
	parseMarkdown(e) {
		return (t, n) => {
			let r = { ...n }, i = {
				...this.defaults,
				...r
			}, a = this.onError(!!i.silent, !!i.async);
			if (this.defaults.async === !0 && r.async === !1) return a(/* @__PURE__ */ Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
			if (typeof t > "u" || t === null) return a(/* @__PURE__ */ Error("marked(): input parameter is undefined or null"));
			if (typeof t != "string") return a(/* @__PURE__ */ Error("marked(): input parameter is of type " + Object.prototype.toString.call(t) + ", string expected"));
			if (i.hooks && (i.hooks.options = i, i.hooks.block = e), i.async) return (async () => {
				let n = i.hooks ? await i.hooks.preprocess(t) : t, r = await (i.hooks ? await i.hooks.provideLexer(e) : e ? Ar.lex : Ar.lexInline)(n, i), a = i.hooks ? await i.hooks.processAllTokens(r) : r;
				i.walkTokens && await Promise.all(this.walkTokens(a, i.walkTokens));
				let o = await (i.hooks ? await i.hooks.provideParser(e) : e ? Nr.parse : Nr.parseInline)(a, i);
				return i.hooks ? await i.hooks.postprocess(o) : o;
			})().catch(a);
			try {
				i.hooks && (t = i.hooks.preprocess(t));
				let n = (i.hooks ? i.hooks.provideLexer(e) : e ? Ar.lex : Ar.lexInline)(t, i);
				i.hooks && (n = i.hooks.processAllTokens(n)), i.walkTokens && this.walkTokens(n, i.walkTokens);
				let r = (i.hooks ? i.hooks.provideParser(e) : e ? Nr.parse : Nr.parseInline)(n, i);
				return i.hooks && (r = i.hooks.postprocess(r)), r;
			} catch (e) {
				return a(e);
			}
		};
	}
	onError(e, t) {
		return (n) => {
			if (n.message += "\nPlease report this to https://github.com/markedjs/marked.", e) {
				let e = "<p>An error occurred:</p><pre>" + _r(n.message + "", !0) + "</pre>";
				return t ? Promise.resolve(e) : e;
			}
			if (t) return Promise.reject(n);
			throw n;
		};
	}
}();
function H(e, t) {
	return Ir.parse(e, t);
}
H.options = H.setOptions = function(e) {
	return Ir.setOptions(e), H.defaults = Ir.defaults, qt(H.defaults), H;
}, H.getDefaults = Gt, H.defaults = Kt;
function Lr(...e) {
	return Ir.use(...e), H.defaults = Ir.defaults, qt(H.defaults), H;
}
H.use = Lr, H.walkTokens = function(e, t) {
	return Ir.walkTokens(e, t);
}, H.parseInline = Ir.parseInline, H.Parser = Nr, H.parser = Nr.parse, H.Renderer = jr, H.TextRenderer = Mr, H.Lexer = Ar, H.lexer = Ar.lex, H.Tokenizer = kr, H.Hooks = Pr, H.parse = H, H.options, H.setOptions, H.walkTokens, H.parseInline, Nr.parse, Ar.lex;
var U = (/* @__PURE__ */ c((/* @__PURE__ */ o(((e, t) => {
	function n(e) {
		return e instanceof Map ? e.clear = e.delete = e.set = function() {
			throw Error("map is read-only");
		} : e instanceof Set && (e.add = e.clear = e.delete = function() {
			throw Error("set is read-only");
		}), Object.freeze(e), Object.getOwnPropertyNames(e).forEach((t) => {
			let r = e[t], i = typeof r;
			i !== "object" && i !== "function" || Object.isFrozen(r) || n(r);
		}), e;
	}
	var r = class {
		constructor(e) {
			e.data === void 0 && (e.data = {}), this.data = e.data, this.isMatchIgnored = !1;
		}
		ignoreMatch() {
			this.isMatchIgnored = !0;
		}
	};
	function i(e) {
		return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
	}
	function a(e, ...t) {
		let n = Object.create(null);
		for (let t in e) n[t] = e[t];
		return t.forEach(function(e) {
			for (let t in e) n[t] = e[t];
		}), n;
	}
	var o = "</span>", s = (e) => !!e.scope, c = (e, { prefix: t }) => {
		if (e.startsWith("language:")) return e.replace("language:", "language-");
		if (e.includes(".")) {
			let n = e.split(".");
			return [`${t}${n.shift()}`, ...n.map((e, t) => `${e}${"_".repeat(t + 1)}`)].join(" ");
		}
		return `${t}${e}`;
	}, l = class {
		constructor(e, t) {
			this.buffer = "", this.classPrefix = t.classPrefix, e.walk(this);
		}
		addText(e) {
			this.buffer += i(e);
		}
		openNode(e) {
			if (!s(e)) return;
			let t = c(e.scope, { prefix: this.classPrefix });
			this.span(t);
		}
		closeNode(e) {
			s(e) && (this.buffer += o);
		}
		value() {
			return this.buffer;
		}
		span(e) {
			this.buffer += `<span class="${e}">`;
		}
	}, u = (e = {}) => {
		let t = { children: [] };
		return Object.assign(t, e), t;
	}, d = class e {
		constructor() {
			this.rootNode = u(), this.stack = [this.rootNode];
		}
		get top() {
			return this.stack[this.stack.length - 1];
		}
		get root() {
			return this.rootNode;
		}
		add(e) {
			this.top.children.push(e);
		}
		openNode(e) {
			let t = u({ scope: e });
			this.add(t), this.stack.push(t);
		}
		closeNode() {
			if (this.stack.length > 1) return this.stack.pop();
		}
		closeAllNodes() {
			for (; this.closeNode(););
		}
		toJSON() {
			return JSON.stringify(this.rootNode, null, 4);
		}
		walk(e) {
			return this.constructor._walk(e, this.rootNode);
		}
		static _walk(e, t) {
			return typeof t == "string" ? e.addText(t) : t.children && (e.openNode(t), t.children.forEach((t) => this._walk(e, t)), e.closeNode(t)), e;
		}
		static _collapse(t) {
			typeof t != "string" && t.children && (t.children.every((e) => typeof e == "string") ? t.children = [t.children.join("")] : t.children.forEach((t) => {
				e._collapse(t);
			}));
		}
	}, f = class extends d {
		constructor(e) {
			super(), this.options = e;
		}
		addText(e) {
			e !== "" && this.add(e);
		}
		startScope(e) {
			this.openNode(e);
		}
		endScope() {
			this.closeNode();
		}
		__addSublanguage(e, t) {
			let n = e.root;
			t && (n.scope = `language:${t}`), this.add(n);
		}
		toHTML() {
			return new l(this, this.options).value();
		}
		finalize() {
			return this.closeAllNodes(), !0;
		}
	};
	function p(e) {
		return e ? typeof e == "string" ? e : e.source : null;
	}
	function m(e) {
		return _("(?=", e, ")");
	}
	function h(e) {
		return _("(?:", e, ")*");
	}
	function g(e) {
		return _("(?:", e, ")?");
	}
	function _(...e) {
		return e.map((e) => p(e)).join("");
	}
	function v(e) {
		let t = e[e.length - 1];
		return typeof t == "object" && t.constructor === Object ? (e.splice(e.length - 1, 1), t) : {};
	}
	function y(...e) {
		return "(" + (v(e).capture ? "" : "?:") + e.map((e) => p(e)).join("|") + ")";
	}
	function b(e) {
		return RegExp(e.toString() + "|").exec("").length - 1;
	}
	function x(e, t) {
		let n = e && e.exec(t);
		return n && n.index === 0;
	}
	var S = new RegExp(y(/\[(?:[^\\\]]|\\.)*\]/, /\(\?<(?![=!])[^>]+>/, /\(\?'[^']+'/, /\(\??/, /\\([1-9][0-9]*)/, /\\./));
	function C(e, { joinWith: t }) {
		let n = 0;
		return e.map((e) => {
			n += 1;
			let t = n, r = p(e), i = "";
			for (; r.length > 0;) {
				let e = S.exec(r);
				if (!e) {
					i += r;
					break;
				}
				i += r.substring(0, e.index), r = r.substring(e.index + e[0].length), e[0][0] === "\\" && e[1] ? i += "\\" + String(Number(e[1]) + t) : (i += e[0], (e[0] === "(" || /^\(\?[<']/.test(e[0])) && n++);
			}
			return i;
		}).map((e) => `(${e})`).join(t);
	}
	var w = /\b\B/, T = "[a-zA-Z]\\w*", ee = "[a-zA-Z_]\\w*", E = "\\b\\d+(\\.\\d+)?", te = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", ne = "\\b(0b[01]+)", D = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~", re = (e = {}) => {
		let t = /^#![ ]*\//;
		return e.binary && (e.begin = _(t, /.*\b/, e.binary, /\b.*/)), a({
			scope: "meta",
			begin: t,
			end: /$/,
			relevance: 0,
			"on:begin": (e, t) => {
				e.index !== 0 && t.ignoreMatch();
			}
		}, e);
	}, O = {
		begin: "\\\\[\\s\\S]",
		relevance: 0
	}, ie = {
		scope: "string",
		begin: "'",
		end: "'",
		illegal: "\\n",
		contains: [O]
	}, k = {
		scope: "string",
		begin: "\"",
		end: "\"",
		illegal: "\\n",
		contains: [O]
	}, ae = { begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/ }, A = function(e, t, n = {}) {
		let r = a({
			scope: "comment",
			begin: e,
			end: t,
			contains: []
		}, n);
		r.contains.push({
			scope: "doctag",
			begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
			end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
			excludeBegin: !0,
			relevance: 0
		});
		let i = y("I", "a", "is", "so", "us", "to", "at", "if", "in", "it", "on", /[A-Za-z]+['](d|ve|re|ll|t|s|n)/, /[A-Za-z]+[-][a-z]+/, /[A-Za-z][a-z]{2,}/);
		return r.contains.push({ begin: _(/[ ]+/, "(", i, /[.]?[:]?([.][ ]|[ ])/, "){3}") }), r;
	}, oe = A("//", "$"), se = A("/\\*", "\\*/"), ce = A("#", "$"), le = /*#__PURE__*/ Object.freeze({
		__proto__: null,
		APOS_STRING_MODE: ie,
		BACKSLASH_ESCAPE: O,
		BINARY_NUMBER_MODE: {
			scope: "number",
			begin: ne,
			relevance: 0
		},
		BINARY_NUMBER_RE: ne,
		COMMENT: A,
		C_BLOCK_COMMENT_MODE: se,
		C_LINE_COMMENT_MODE: oe,
		C_NUMBER_MODE: {
			scope: "number",
			begin: te,
			relevance: 0
		},
		C_NUMBER_RE: te,
		END_SAME_AS_BEGIN: function(e) {
			return Object.assign(e, {
				"on:begin": (e, t) => {
					t.data._beginMatch = e[1];
				},
				"on:end": (e, t) => {
					t.data._beginMatch !== e[1] && t.ignoreMatch();
				}
			});
		},
		HASH_COMMENT_MODE: ce,
		IDENT_RE: T,
		MATCH_NOTHING_RE: w,
		METHOD_GUARD: {
			begin: "\\.\\s*[a-zA-Z_]\\w*",
			relevance: 0
		},
		NUMBER_MODE: {
			scope: "number",
			begin: E,
			relevance: 0
		},
		NUMBER_RE: E,
		PHRASAL_WORDS_MODE: ae,
		QUOTE_STRING_MODE: k,
		REGEXP_MODE: {
			scope: "regexp",
			begin: /\/(?=[^/\n]*\/)/,
			end: /\/[gimuy]*/,
			contains: [O, {
				begin: /\[/,
				end: /\]/,
				relevance: 0,
				contains: [O]
			}]
		},
		RE_STARTERS_RE: D,
		SHEBANG: re,
		TITLE_MODE: {
			scope: "title",
			begin: T,
			relevance: 0
		},
		UNDERSCORE_IDENT_RE: ee,
		UNDERSCORE_TITLE_MODE: {
			scope: "title",
			begin: ee,
			relevance: 0
		}
	});
	function ue(e, t) {
		e.input[e.index - 1] === "." && t.ignoreMatch();
	}
	function de(e, t) {
		e.className !== void 0 && (e.scope = e.className, delete e.className);
	}
	function fe(e, t) {
		t && e.beginKeywords && (e.begin = "\\b(" + e.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)", e.__beforeBegin = ue, e.keywords = e.keywords || e.beginKeywords, delete e.beginKeywords, e.relevance === void 0 && (e.relevance = 0));
	}
	function pe(e, t) {
		Array.isArray(e.illegal) && (e.illegal = y(...e.illegal));
	}
	function me(e, t) {
		if (e.match) {
			if (e.begin || e.end) throw Error("begin & end are not supported with match");
			e.begin = e.match, delete e.match;
		}
	}
	function he(e, t) {
		e.relevance === void 0 && (e.relevance = 1);
	}
	var ge = (e, t) => {
		if (!e.beforeMatch) return;
		if (e.starts) throw Error("beforeMatch cannot be used with starts");
		let n = Object.assign({}, e);
		Object.keys(e).forEach((t) => {
			delete e[t];
		}), e.keywords = n.keywords, e.begin = _(n.beforeMatch, m(n.begin)), e.starts = {
			relevance: 0,
			contains: [Object.assign(n, { endsParent: !0 })]
		}, e.relevance = 0, delete n.beforeMatch;
	}, _e = [
		"of",
		"and",
		"for",
		"in",
		"not",
		"or",
		"if",
		"then",
		"parent",
		"list",
		"value"
	], ve = "keyword";
	function ye(e, t, n = ve) {
		let r = Object.create(null);
		return typeof e == "string" ? i(n, e.split(" ")) : Array.isArray(e) ? i(n, e) : Object.keys(e).forEach(function(n) {
			Object.assign(r, ye(e[n], t, n));
		}), r;
		function i(e, n) {
			t && (n = n.map((e) => e.toLowerCase())), n.forEach(function(t) {
				let n = t.split("|");
				r[n[0]] = [e, j(n[0], n[1])];
			});
		}
	}
	function j(e, t) {
		return t ? Number(t) : +!M(e);
	}
	function M(e) {
		return _e.includes(e.toLowerCase());
	}
	var be = {}, N = (e) => {
		console.error(e);
	}, xe = (e, ...t) => {
		console.log(`WARN: ${e}`, ...t);
	}, P = (e, t) => {
		be[`${e}/${t}`] || (console.log(`Deprecated as of ${e}. ${t}`), be[`${e}/${t}`] = !0);
	}, Se = /* @__PURE__ */ Error();
	function F(e, t, { key: n }) {
		let r = 0, i = e[n], a = {}, o = {};
		for (let e = 1; e <= t.length; e++) o[e + r] = i[e], a[e + r] = !0, r += b(t[e - 1]);
		e[n] = o, e[n]._emit = a, e[n]._multi = !0;
	}
	function Ce(e) {
		if (Array.isArray(e.begin)) {
			if (e.skip || e.excludeBegin || e.returnBegin) throw N("skip, excludeBegin, returnBegin not compatible with beginScope: {}"), Se;
			if (typeof e.beginScope != "object" || e.beginScope === null) throw N("beginScope must be object"), Se;
			F(e, e.begin, { key: "beginScope" }), e.begin = C(e.begin, { joinWith: "" });
		}
	}
	function we(e) {
		if (Array.isArray(e.end)) {
			if (e.skip || e.excludeEnd || e.returnEnd) throw N("skip, excludeEnd, returnEnd not compatible with endScope: {}"), Se;
			if (typeof e.endScope != "object" || e.endScope === null) throw N("endScope must be object"), Se;
			F(e, e.end, { key: "endScope" }), e.end = C(e.end, { joinWith: "" });
		}
	}
	function Te(e) {
		e.scope && typeof e.scope == "object" && e.scope !== null && (e.beginScope = e.scope, delete e.scope);
	}
	function Ee(e) {
		Te(e), typeof e.beginScope == "string" && (e.beginScope = { _wrap: e.beginScope }), typeof e.endScope == "string" && (e.endScope = { _wrap: e.endScope }), Ce(e), we(e);
	}
	function De(e) {
		function t(t, n) {
			return new RegExp(p(t), "m" + (e.case_insensitive ? "i" : "") + (e.unicodeRegex ? "u" : "") + (n ? "g" : ""));
		}
		class n {
			constructor() {
				this.matchIndexes = {}, this.regexes = [], this.matchAt = 1, this.position = 0;
			}
			addRule(e, t) {
				t.position = this.position++, this.matchIndexes[this.matchAt] = t, this.regexes.push([t, e]), this.matchAt += b(e) + 1;
			}
			compile() {
				this.regexes.length === 0 && (this.exec = () => null);
				let e = this.regexes.map((e) => e[1]);
				this.matcherRe = t(C(e, { joinWith: "|" }), !0), this.lastIndex = 0;
			}
			exec(e) {
				this.matcherRe.lastIndex = this.lastIndex;
				let t = this.matcherRe.exec(e);
				if (!t) return null;
				let n = t.findIndex((e, t) => t > 0 && e !== void 0), r = this.matchIndexes[n];
				return t.splice(0, n), Object.assign(t, r);
			}
		}
		class r {
			constructor() {
				this.rules = [], this.multiRegexes = [], this.count = 0, this.lastIndex = 0, this.regexIndex = 0;
			}
			getMatcher(e) {
				if (this.multiRegexes[e]) return this.multiRegexes[e];
				let t = new n();
				return this.rules.slice(e).forEach(([e, n]) => t.addRule(e, n)), t.compile(), this.multiRegexes[e] = t, t;
			}
			resumingScanAtSamePosition() {
				return this.regexIndex !== 0;
			}
			considerAll() {
				this.regexIndex = 0;
			}
			addRule(e, t) {
				this.rules.push([e, t]), t.type === "begin" && this.count++;
			}
			exec(e) {
				let t = this.getMatcher(this.regexIndex);
				t.lastIndex = this.lastIndex;
				let n = t.exec(e);
				if (this.resumingScanAtSamePosition() && !(n && n.index === this.lastIndex)) {
					let t = this.getMatcher(0);
					t.lastIndex = this.lastIndex + 1, n = t.exec(e);
				}
				return n && (this.regexIndex += n.position + 1, this.regexIndex === this.count && this.considerAll()), n;
			}
		}
		function i(e) {
			let t = new r();
			return e.contains.forEach((e) => t.addRule(e.begin, {
				rule: e,
				type: "begin"
			})), e.terminatorEnd && t.addRule(e.terminatorEnd, { type: "end" }), e.illegal && t.addRule(e.illegal, { type: "illegal" }), t;
		}
		function o(n, r) {
			let a = n;
			if (n.isCompiled) return a;
			[
				de,
				me,
				Ee,
				ge
			].forEach((e) => e(n, r)), e.compilerExtensions.forEach((e) => e(n, r)), n.__beforeBegin = null, [
				fe,
				pe,
				he
			].forEach((e) => e(n, r)), n.isCompiled = !0;
			let s = null;
			return typeof n.keywords == "object" && n.keywords.$pattern && (n.keywords = Object.assign({}, n.keywords), s = n.keywords.$pattern, delete n.keywords.$pattern), s ||= /\w+/, n.keywords &&= ye(n.keywords, e.case_insensitive), a.keywordPatternRe = t(s, !0), r && (n.begin ||= /\B|\b/, a.beginRe = t(a.begin), !n.end && !n.endsWithParent && (n.end = /\B|\b/), n.end && (a.endRe = t(a.end)), a.terminatorEnd = p(a.end) || "", n.endsWithParent && r.terminatorEnd && (a.terminatorEnd += (n.end ? "|" : "") + r.terminatorEnd)), n.illegal && (a.illegalRe = t(n.illegal)), n.contains ||= [], n.contains = [].concat(...n.contains.map(function(e) {
				return ke(e === "self" ? n : e);
			})), n.contains.forEach(function(e) {
				o(e, a);
			}), n.starts && o(n.starts, r), a.matcher = i(a), a;
		}
		if (e.compilerExtensions ||= [], e.contains && e.contains.includes("self")) throw Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
		return e.classNameAliases = a(e.classNameAliases || {}), o(e);
	}
	function Oe(e) {
		return e ? e.endsWithParent || Oe(e.starts) : !1;
	}
	function ke(e) {
		return e.variants && !e.cachedVariants && (e.cachedVariants = e.variants.map(function(t) {
			return a(e, { variants: null }, t);
		})), e.cachedVariants ? e.cachedVariants : Oe(e) ? a(e, { starts: e.starts ? a(e.starts) : null }) : Object.isFrozen(e) ? a(e) : e;
	}
	var Ae = "11.12.0", je = class extends Error {
		constructor(e, t) {
			super(e), this.name = "HTMLInjectionError", this.html = t;
		}
	}, Me = i, I = a, L = Symbol("nomatch"), Ne = 7, Pe = function(e) {
		let t = Object.create(null), i = Object.create(null), a = [], o = !0, s = "Could not find the language '{}', did you forget to load/include a language module?", c = {
			disableAutodetect: !0,
			name: "Plain text",
			contains: []
		}, l = {
			ignoreUnescapedHTML: !1,
			throwUnescapedHTML: !1,
			noHighlightRe: /^(no-?highlight)$/i,
			languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
			classPrefix: "hljs-",
			cssSelector: "pre code",
			languages: null,
			__emitter: f
		};
		function u(e) {
			return l.noHighlightRe.test(e);
		}
		function d(e) {
			let t = e.className + " ";
			t += e.parentNode ? e.parentNode.className : "";
			let n = l.languageDetectRe.exec(t);
			if (n) {
				let t = ie(n[1]);
				return t || (xe(s.replace("{}", n[1])), xe("Falling back to no-highlight mode for this block.", e)), t ? n[1] : "no-highlight";
			}
			return t.split(/\s+/).find((e) => u(e) || ie(e));
		}
		function p(e, t, n) {
			let r = "", i = "";
			typeof t == "object" ? (r = e, n = t.ignoreIllegals, i = t.language) : (P("10.7.0", "highlight(lang, code, ...args) has been deprecated."), P("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277"), i = e, r = t), n === void 0 && (n = !0);
			let a = {
				code: r,
				language: i
			};
			ce("before:highlight", a);
			let o = a.result ? a.result : v(a.language, a.code, n);
			return o.code = a.code, ce("after:highlight", o), o;
		}
		function v(e, n, i, a) {
			let c = Object.create(null);
			function u(e, t) {
				return e.keywords[t];
			}
			function d() {
				if (!D.keywords) {
					O.addText(k);
					return;
				}
				let e = 0;
				D.keywordPatternRe.lastIndex = 0;
				let t = D.keywordPatternRe.exec(k), n = "";
				for (; t;) {
					n += k.substring(e, t.index);
					let r = E.case_insensitive ? t[0].toLowerCase() : t[0], i = u(D, r);
					if (i) {
						let [e, a] = i;
						if (O.addText(n), n = "", c[r] = (c[r] || 0) + 1, c[r] <= Ne && (ae += a), e.startsWith("_")) n += t[0];
						else {
							let n = E.classNameAliases[e] || e;
							m(t[0], n);
						}
					} else n += t[0];
					e = D.keywordPatternRe.lastIndex, t = D.keywordPatternRe.exec(k);
				}
				n += k.substring(e), O.addText(n);
			}
			function f() {
				if (k === "") return;
				let e = null;
				if (typeof D.subLanguage == "string") {
					if (!t[D.subLanguage]) {
						O.addText(k);
						return;
					}
					e = v(D.subLanguage, k, !0, re[D.subLanguage]), re[D.subLanguage] = e._top;
				} else e = S(k, D.subLanguage.length ? D.subLanguage : null);
				D.relevance > 0 && (ae += e.relevance), O.__addSublanguage(e._emitter, e.language);
			}
			function p() {
				D.subLanguage == null ? d() : f(), k = "";
			}
			function m(e, t) {
				e !== "" && (O.startScope(t), O.addText(e), O.endScope());
			}
			function h(e, t) {
				let n = 1, r = t.length - 1;
				for (; n <= r;) {
					if (!e._emit[n]) {
						n++;
						continue;
					}
					let r = E.classNameAliases[e[n]] || e[n], i = t[n];
					r ? m(i, r) : (k = i, d(), k = ""), n++;
				}
			}
			function g(e, t) {
				return e.scope && typeof e.scope == "string" && O.openNode(E.classNameAliases[e.scope] || e.scope), e.beginScope && (e.beginScope._wrap ? (m(k, E.classNameAliases[e.beginScope._wrap] || e.beginScope._wrap), k = "") : e.beginScope._multi && (h(e.beginScope, t), k = "")), D = Object.create(e, { parent: { value: D } }), D;
			}
			function _(e, t, n) {
				let i = x(e.endRe, n);
				if (i) {
					if (e["on:end"]) {
						let n = new r(e);
						e["on:end"](t, n), n.isMatchIgnored && (i = !1);
					}
					if (i) {
						for (; e.endsParent && e.parent;) e = e.parent;
						return e;
					}
				}
				if (e.endsWithParent) return _(e.parent, t, n);
			}
			function y(e) {
				return D.matcher.regexIndex === 0 ? (k += e[0], 1) : (se = !0, 0);
			}
			function b(e) {
				let t = e[0], n = e.rule, i = new r(n), a = [n.__beforeBegin, n["on:begin"]];
				for (let n of a) if (n && (n(e, i), i.isMatchIgnored)) return y(t);
				return n.skip ? k += t : (n.excludeBegin && (k += t), p(), !n.returnBegin && !n.excludeBegin && (k = t)), g(n, e), n.returnBegin ? 0 : t.length;
			}
			function C(e) {
				let t = e[0], r = n.substring(e.index), i = _(D, e, r);
				if (!i) return L;
				let a = D;
				D.endScope && D.endScope._wrap ? (p(), m(t, D.endScope._wrap)) : D.endScope && D.endScope._multi ? (p(), h(D.endScope, e)) : a.skip ? k += t : (a.returnEnd || a.excludeEnd || (k += t), p(), a.excludeEnd && (k = t));
				do
					D.scope && O.closeNode(), !D.skip && !D.subLanguage && (ae += D.relevance), D = D.parent;
				while (D !== i.parent);
				return i.starts && g(i.starts, e), a.returnEnd ? 0 : t.length;
			}
			function w() {
				let e = [];
				for (let t = D; t !== E; t = t.parent) t.scope && e.unshift(t.scope);
				e.forEach((e) => O.openNode(e));
			}
			let T = {};
			function ee(t, r) {
				let a = r && r[0];
				if (k += t, a == null) return p(), 0;
				if (T.type === "begin" && r.type === "end" && T.index === r.index && a === "") {
					if (k += n.slice(r.index, r.index + 1), !o) {
						let t = /* @__PURE__ */ Error(`0 width match regex (${e})`);
						throw t.languageName = e, t.badRule = T.rule, t;
					}
					return 1;
				}
				if (T = r, r.type === "begin") return b(r);
				if (r.type === "illegal" && !i) {
					let e = /* @__PURE__ */ Error("Illegal lexeme \"" + a + "\" for mode \"" + (D.scope || "<unnamed>") + "\"");
					throw e.mode = D, e;
				}
				if (r.type === "end") {
					let e = C(r);
					if (e !== L) return e;
				}
				if (r.type === "illegal" && a === "") return r.index === n.length || (k += "\n"), 1;
				if (oe > 1e5 && oe > r.index * 3) throw /* @__PURE__ */ Error("potential infinite loop, way more iterations than matches");
				return k += a, a.length;
			}
			let E = ie(e);
			if (!E) throw N(s.replace("{}", e)), Error("Unknown language: \"" + e + "\"");
			let te = De(E), ne = "", D = a || te, re = {}, O = new l.__emitter(l);
			w();
			let k = "", ae = 0, A = 0, oe = 0, se = !1;
			try {
				if (E.__emitTokens) E.__emitTokens(n, O);
				else {
					for (D.matcher.considerAll();;) {
						oe++, se ? se = !1 : D.matcher.considerAll(), D.matcher.lastIndex = A;
						let e = D.matcher.exec(n);
						if (!e) break;
						let t = ee(n.substring(A, e.index), e);
						A = e.index + t;
					}
					ee(n.substring(A));
				}
				return O.finalize(), ne = O.toHTML(), {
					language: e,
					value: ne,
					relevance: ae,
					illegal: !1,
					_emitter: O,
					_top: D
				};
			} catch (t) {
				if (t.message && t.message.includes("Illegal")) return {
					language: e,
					value: Me(n),
					illegal: !0,
					relevance: 0,
					_illegalBy: {
						message: t.message,
						index: A,
						context: n.slice(A - 100, A + 100),
						mode: t.mode,
						resultSoFar: ne
					},
					_emitter: O
				};
				if (o) return {
					language: e,
					value: Me(n),
					illegal: !1,
					relevance: 0,
					errorRaised: t,
					_emitter: O,
					_top: D
				};
				throw t;
			}
		}
		function b(e) {
			let t = {
				value: Me(e),
				illegal: !1,
				relevance: 0,
				_top: c,
				_emitter: new l.__emitter(l)
			};
			return t._emitter.addText(e), t;
		}
		function S(e, n) {
			n = n || l.languages || Object.keys(t);
			let r = b(e), i = n.filter(ie).filter(ae).map((t) => v(t, e, !1));
			i.unshift(r);
			let [a, o] = i.sort((e, t) => {
				if (e.relevance !== t.relevance) return t.relevance - e.relevance;
				if (e.language && t.language) {
					if (ie(e.language).supersetOf === t.language) return 1;
					if (ie(t.language).supersetOf === e.language) return -1;
				}
				return 0;
			}), s = a;
			return s.secondBest = o, s;
		}
		function C(e, t, n) {
			let r = t && i[t] || n;
			e.classList.add("hljs"), e.classList.add(`language-${r}`);
		}
		function w(e) {
			let t = null, n = d(e);
			if (u(n)) return;
			if (ce("before:highlightElement", {
				el: e,
				language: n
			}), e.dataset.highlighted) {
				console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", e);
				return;
			}
			if (e.children.length > 0 && (l.ignoreUnescapedHTML || (console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."), console.warn("https://github.com/highlightjs/highlight.js/wiki/security"), console.warn("The element with unescaped HTML:"), console.warn(e)), l.throwUnescapedHTML)) throw new je("One of your code blocks includes unescaped HTML.", e.innerHTML);
			t = e;
			let r = t.textContent, i = n ? p(r, {
				language: n,
				ignoreIllegals: !0
			}) : S(r);
			e.innerHTML = i.value, e.dataset.highlighted = "yes", C(e, n, i.language), e.result = {
				language: i.language,
				re: i.relevance,
				relevance: i.relevance
			}, i.secondBest && (e.secondBest = {
				language: i.secondBest.language,
				relevance: i.secondBest.relevance
			}), ce("after:highlightElement", {
				el: e,
				result: i,
				text: r
			});
		}
		function T(e) {
			l = I(l, e);
		}
		let ee = () => {
			ne(), P("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
		};
		function E() {
			ne(), P("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
		}
		let te = !1;
		function ne() {
			function e() {
				ne();
			}
			document.readyState === "loading" ? (te || window.addEventListener("DOMContentLoaded", e, !1), te = !0) : document.querySelectorAll(l.cssSelector).forEach(w);
		}
		function D(n, r) {
			let i = null;
			try {
				i = r(e);
			} catch (e) {
				if (N("Language definition for '{}' could not be registered.".replace("{}", n)), o) N(e);
				else throw e;
				i = c;
			}
			i.name || (i.name = n), t[n] = i, i.rawDefinition = r.bind(null, e), i.aliases && k(i.aliases, { languageName: n });
		}
		function re(e) {
			delete t[e];
			for (let t of Object.keys(i)) i[t] === e && delete i[t];
		}
		function O() {
			return Object.keys(t);
		}
		function ie(e) {
			return e = (e || "").toLowerCase(), t[e] || t[i[e]];
		}
		function k(e, { languageName: t }) {
			typeof e == "string" && (e = [e]), e.forEach((e) => {
				i[e.toLowerCase()] = t;
			});
		}
		function ae(e) {
			let t = ie(e);
			return t && !t.disableAutodetect;
		}
		function A(e) {
			e["before:highlightBlock"] && !e["before:highlightElement"] && (e["before:highlightElement"] = (t) => {
				e["before:highlightBlock"](Object.assign({ block: t.el }, t));
			}), e["after:highlightBlock"] && !e["after:highlightElement"] && (e["after:highlightElement"] = (t) => {
				e["after:highlightBlock"](Object.assign({ block: t.el }, t));
			});
		}
		function oe(e) {
			A(e), a.push(e);
		}
		function se(e) {
			let t = a.indexOf(e);
			t !== -1 && a.splice(t, 1);
		}
		function ce(e, t) {
			let n = e;
			a.forEach(function(e) {
				e[n] && e[n](t);
			});
		}
		function ue(e) {
			return P("10.7.0", "highlightBlock will be removed entirely in v12.0"), P("10.7.0", "Please use highlightElement now."), w(e);
		}
		Object.assign(e, {
			highlight: p,
			highlightAuto: S,
			highlightAll: ne,
			highlightElement: w,
			highlightBlock: ue,
			configure: T,
			initHighlighting: ee,
			initHighlightingOnLoad: E,
			registerLanguage: D,
			unregisterLanguage: re,
			listLanguages: O,
			getLanguage: ie,
			registerAliases: k,
			autoDetection: ae,
			inherit: I,
			addPlugin: oe,
			removePlugin: se
		}), e.debugMode = function() {
			o = !1;
		}, e.safeMode = function() {
			o = !0;
		}, e.versionString = Ae, e.regex = {
			concat: _,
			lookahead: m,
			either: y,
			optional: g,
			anyNumberOfTimes: h
		};
		for (let e in le) typeof le[e] == "object" && n(le[e]);
		return Object.assign(e, le), e;
	}, Fe = Pe({});
	Fe.newInstance = () => Pe({}), t.exports = Fe, Fe.HighlightJS = Fe, Fe.default = Fe;
})))())).default;
// node_modules/highlight.js/es/languages/bash.js
function Rr(e) {
	let t = e.regex, n = {}, r = {
		begin: /\$\{/,
		end: /\}/,
		contains: ["self", {
			begin: /:-/,
			contains: [n]
		}]
	};
	Object.assign(n, {
		className: "variable",
		variants: [{ begin: t.concat(/\$[\w\d#@][\w\d_]*/, "(?![\\w\\d])(?![$])") }, r]
	});
	let i = {
		className: "subst",
		begin: /\$\(/,
		end: /\)/,
		contains: [e.BACKSLASH_ESCAPE]
	}, a = e.inherit(e.COMMENT(), {
		match: [/(^|\s)/, /#.*$/],
		scope: { 2: "comment" }
	}), o = {
		begin: /<<-?\s*(?=\w+)/,
		starts: { contains: [e.END_SAME_AS_BEGIN({
			begin: /(\w+)/,
			end: /(\w+)/,
			className: "string"
		})] }
	}, s = {
		className: "string",
		begin: /"/,
		end: /"/,
		contains: [
			e.BACKSLASH_ESCAPE,
			n,
			i
		]
	};
	i.contains.push(s);
	let c = { match: /\\"/ }, l = {
		className: "string",
		begin: /'/,
		end: /'/
	}, u = { match: /\\'/ }, d = {
		begin: /\$?\(\(/,
		end: /\)\)/,
		contains: [
			{
				begin: /\d+#[0-9a-f]+/,
				className: "number"
			},
			e.NUMBER_MODE,
			n
		]
	}, f = e.SHEBANG({
		binary: "(fish|bash|zsh|sh|csh|ksh|tcsh|dash|scsh)",
		relevance: 10
	}), p = {
		className: "function",
		begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
		returnBegin: !0,
		contains: [e.inherit(e.TITLE_MODE, { begin: /\w[\w\d_]*/ })],
		relevance: 0
	}, m = [
		"if",
		"then",
		"else",
		"elif",
		"fi",
		"time",
		"for",
		"while",
		"until",
		"in",
		"do",
		"done",
		"case",
		"esac",
		"coproc",
		"function",
		"select"
	], h = ["true", "false"], g = { match: /(\/[a-z._-]+)+/ }, _ = [
		"break",
		"cd",
		"continue",
		"eval",
		"exec",
		"exit",
		"export",
		"getopts",
		"hash",
		"pwd",
		"readonly",
		"return",
		"shift",
		"test",
		"times",
		"trap",
		"umask",
		"unset"
	], v = [
		"alias",
		"bind",
		"builtin",
		"caller",
		"command",
		"declare",
		"echo",
		"enable",
		"help",
		"let",
		"local",
		"logout",
		"mapfile",
		"printf",
		"read",
		"readarray",
		"source",
		"sudo",
		"type",
		"typeset",
		"ulimit",
		"unalias"
	], y = /* @__PURE__ */ "autoload.bg.bindkey.bye.cap.chdir.clone.comparguments.compcall.compctl.compdescribe.compfiles.compgroups.compquote.comptags.comptry.compvalues.dirs.disable.disown.echotc.echoti.emulate.fc.fg.float.functions.getcap.getln.history.integer.jobs.kill.limit.log.noglob.popd.print.pushd.pushln.rehash.sched.setcap.setopt.stat.suspend.ttyctl.unfunction.unhash.unlimit.unsetopt.vared.wait.whence.where.which.zcompile.zformat.zftp.zle.zmodload.zparseopts.zprof.zpty.zregexparse.zsocket.zstyle.ztcp".split("."), b = /* @__PURE__ */ "chcon.chgrp.chown.chmod.cp.dd.df.dir.dircolors.ln.ls.mkdir.mkfifo.mknod.mktemp.mv.realpath.rm.rmdir.shred.sync.touch.truncate.vdir.b2sum.base32.base64.cat.cksum.comm.csplit.cut.expand.fmt.fold.head.join.md5sum.nl.numfmt.od.paste.ptx.pr.sha1sum.sha224sum.sha256sum.sha384sum.sha512sum.shuf.sort.split.sum.tac.tail.tr.tsort.unexpand.uniq.wc.arch.basename.chroot.date.dirname.du.echo.env.expr.factor.groups.hostid.id.link.logname.nice.nohup.nproc.pathchk.pinky.printenv.printf.pwd.readlink.runcon.seq.sleep.stat.stdbuf.stty.tee.test.timeout.tty.uname.unlink.uptime.users.who.whoami.yes".split(".");
	return {
		name: "Bash",
		aliases: ["sh", "zsh"],
		keywords: {
			$pattern: /\b[a-z][a-z0-9._-]+\b/,
			keyword: m,
			literal: h,
			built_in: [
				..._,
				...v,
				"set",
				"shopt",
				...y,
				...b
			]
		},
		contains: [
			f,
			e.SHEBANG(),
			p,
			d,
			a,
			o,
			g,
			s,
			c,
			l,
			u,
			n
		]
	};
}
// node_modules/highlight.js/es/languages/dockerfile.js
function zr(e) {
	return {
		name: "Dockerfile",
		aliases: ["docker"],
		case_insensitive: !0,
		keywords: [
			"from",
			"maintainer",
			"expose",
			"env",
			"arg",
			"user",
			"onbuild",
			"stopsignal"
		],
		contains: [
			e.HASH_COMMENT_MODE,
			e.APOS_STRING_MODE,
			e.QUOTE_STRING_MODE,
			e.NUMBER_MODE,
			{
				beginKeywords: "run cmd entrypoint volume add copy workdir label healthcheck shell",
				starts: {
					end: /[^\\]$/,
					subLanguage: "bash"
				}
			}
		],
		illegal: "</"
	};
}
// node_modules/highlight.js/es/languages/groovy.js
var Br = "[0-9](_*[0-9])*", Vr = `\\.(${Br})`, Hr = "[0-9a-fA-F](_*[0-9a-fA-F])*", Ur = {
	className: "number",
	variants: [
		{ begin: `(\\b(${Br})((${Vr})|\\.)?|(${Vr}))[eE][+-]?(${Br})[fFdD]?\\b` },
		{ begin: `\\b(${Br})((${Vr})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
		{ begin: `(${Vr})[fFdD]?\\b` },
		{ begin: `\\b(${Br})[fFdD]\\b` },
		{ begin: `\\b0[xX]((${Hr})\\.?|(${Hr})?\\.(${Hr}))[pP][+-]?(${Br})[fFdD]?\\b` },
		{ begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
		{ begin: `\\b0[xX](${Hr})[lL]?\\b` },
		{ begin: "\\b0(_*[0-7])*[lL]?\\b" },
		{ begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
	],
	relevance: 0
};
function Wr(e, t = {}) {
	return t.variants = e, t;
}
function Gr(e) {
	let t = e.regex, n = "[A-Za-z0-9_$]+", r = Wr([
		e.C_LINE_COMMENT_MODE,
		e.C_BLOCK_COMMENT_MODE,
		e.COMMENT("/\\*\\*", "\\*/", {
			relevance: 0,
			contains: [{
				begin: /\w+@/,
				relevance: 0
			}, {
				className: "doctag",
				begin: "@[A-Za-z]+"
			}]
		})
	]), i = {
		className: "regexp",
		begin: /~?\/[^\/\n]+\//,
		contains: [e.BACKSLASH_ESCAPE]
	}, a = Ur, o = Wr([
		{
			begin: /"""/,
			end: /"""/
		},
		{
			begin: /'''/,
			end: /'''/
		},
		{
			begin: "\\$/",
			end: "/\\$",
			relevance: 10
		},
		e.APOS_STRING_MODE,
		e.QUOTE_STRING_MODE
	], { className: "string" }), s = {
		match: [
			/(class|interface|trait|enum|record|extends|implements)/,
			/\s+/,
			e.UNDERSCORE_IDENT_RE
		],
		scope: {
			1: "keyword",
			3: "title.class"
		}
	};
	return {
		name: "Groovy",
		keywords: {
			"variable.language": "this super",
			literal: "true false null",
			type: [
				"byte",
				"short",
				"char",
				"int",
				"long",
				"boolean",
				"float",
				"double",
				"void"
			],
			keyword: /* @__PURE__ */ "def.as.in.assert.trait.abstract.static.volatile.transient.public.private.protected.synchronized.final.class.interface.enum.if.else.for.while.switch.case.break.default.continue.throw.throws.try.catch.finally.implements.extends.new.import.package.return.instanceof.var".split(".")
		},
		contains: [
			e.SHEBANG({
				binary: "groovy",
				relevance: 10
			}),
			r,
			o,
			i,
			a,
			s,
			{
				className: "meta",
				begin: "@[A-Za-z]+",
				relevance: 0
			},
			{
				className: "attr",
				begin: n + "[ 	]*:",
				relevance: 0
			},
			{
				begin: /\?/,
				end: /:/,
				relevance: 0,
				contains: [
					r,
					o,
					i,
					a,
					"self"
				]
			},
			{
				className: "symbol",
				begin: "^[ 	]*" + t.lookahead(n + ":"),
				excludeBegin: !0,
				end: n + ":",
				relevance: 0
			}
		],
		illegal: /#|<\//
	};
}
// node_modules/highlight.js/es/languages/ini.js
function Kr(e) {
	let t = e.regex, n = {
		className: "number",
		relevance: 0,
		variants: [{ begin: /([+-]+)?[\d]+_[\d_]+/ }, { begin: e.NUMBER_RE }]
	}, r = e.COMMENT();
	r.variants = [{
		begin: /;/,
		end: /$/
	}, {
		begin: /#/,
		end: /$/
	}];
	let i = {
		className: "variable",
		variants: [{ begin: /\$[\w\d"][\w\d_]*/ }, { begin: /\$\{(.*?)\}/ }]
	}, a = {
		className: "literal",
		begin: /\bon|off|true|false|yes|no\b/
	}, o = {
		className: "string",
		contains: [e.BACKSLASH_ESCAPE],
		variants: [
			{
				begin: "'''",
				end: "'''",
				relevance: 10
			},
			{
				begin: "\"\"\"",
				end: "\"\"\"",
				relevance: 10
			},
			{
				begin: "\"",
				end: "\""
			},
			{
				begin: "'",
				end: "'"
			}
		]
	}, s = {
		begin: /\[/,
		end: /\]/,
		contains: [
			r,
			a,
			i,
			o,
			n,
			"self"
		],
		relevance: 0
	}, c = t.either(/[A-Za-z0-9_-]+/, /"(\\"|[^"])*"/, /'[^']*'/);
	return {
		name: "TOML, also INI",
		aliases: ["toml"],
		case_insensitive: !0,
		illegal: /\S/,
		contains: [
			r,
			{
				className: "section",
				begin: /\[+/,
				end: /\]+/
			},
			{
				begin: t.concat(c, "(\\s*\\.\\s*", c, ")*", t.lookahead(/\s*=\s*[^#\s]/)),
				className: "attr",
				starts: {
					end: /$/,
					contains: [
						r,
						s,
						a,
						i,
						o,
						n
					]
				}
			}
		]
	};
}
// node_modules/highlight.js/es/languages/javascript.js
var qr = "[A-Za-z$_][0-9A-Za-z$_]*", Jr = /* @__PURE__ */ "as.in.of.if.for.while.finally.var.new.function.do.return.void.else.break.catch.instanceof.with.throw.case.default.try.switch.continue.typeof.delete.let.yield.const.class.debugger.async.await.static.import.from.export.extends.using".split("."), Yr = [
	"true",
	"false",
	"null",
	"undefined",
	"NaN",
	"Infinity"
], Xr = /* @__PURE__ */ "Object.Function.Boolean.Symbol.Math.Date.Number.BigInt.String.RegExp.Array.Float32Array.Float64Array.Int8Array.Uint8Array.Uint8ClampedArray.Int16Array.Int32Array.Uint16Array.Uint32Array.BigInt64Array.BigUint64Array.Set.Map.WeakSet.WeakMap.ArrayBuffer.SharedArrayBuffer.Atomics.DataView.JSON.Promise.Generator.GeneratorFunction.AsyncFunction.Reflect.Proxy.Intl.WebAssembly".split("."), Zr = [
	"Error",
	"EvalError",
	"InternalError",
	"RangeError",
	"ReferenceError",
	"SyntaxError",
	"TypeError",
	"URIError"
], Qr = [
	"setInterval",
	"setTimeout",
	"clearInterval",
	"clearTimeout",
	"require",
	"exports",
	"eval",
	"isFinite",
	"isNaN",
	"parseFloat",
	"parseInt",
	"decodeURI",
	"decodeURIComponent",
	"encodeURI",
	"encodeURIComponent",
	"escape",
	"unescape"
], $r = [
	"arguments",
	"this",
	"super",
	"console",
	"window",
	"document",
	"localStorage",
	"sessionStorage",
	"module",
	"self",
	"global"
], ei = [].concat(Qr, Xr, Zr);
function ti(e) {
	let t = e.regex, n = (e, { after: t }) => {
		let n = "</" + e[0].slice(1);
		return e.input.indexOf(n, t) !== -1;
	}, r = qr, i = {
		begin: "<>",
		end: "</>"
	}, a = /<[A-Za-z0-9\\._:-]+\s*\/>/, o = {
		begin: /<[A-Za-z0-9\\._:-]+/,
		end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
		isTrulyOpeningTag: (e, t) => {
			let r = e[0].length + e.index, i = e.input[r];
			if (i === "<" || i === ",") {
				t.ignoreMatch();
				return;
			}
			i === ">" && (n(e, { after: r }) || t.ignoreMatch());
			let a, o = e.input.substring(r);
			((a = o.match(/^\s*=/)) || (a = o.match(/^\s+extends\s+/)) && a.index === 0) && t.ignoreMatch();
		}
	}, s = {
		$pattern: qr,
		keyword: Jr,
		literal: Yr,
		built_in: ei,
		"variable.language": $r
	}, c = "[0-9](_?[0-9])*", l = `\\.(${c})`, u = "0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*", d = {
		className: "number",
		variants: [
			{ begin: `(\\b(${u})((${l})|\\.)?|(${l}))[eE][+-]?(${c})\\b` },
			{ begin: `\\b(${u})\\b((${l})\\b|\\.)?|(${l})\\b` },
			{ begin: "\\b(0|[1-9](_?[0-9])*)n\\b" },
			{ begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
			{ begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
			{ begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
			{ begin: "\\b0[0-7]+n?\\b" }
		],
		relevance: 0
	}, f = {
		className: "subst",
		begin: "\\$\\{",
		end: "\\}",
		keywords: s,
		contains: []
	}, p = {
		begin: ".?html`",
		end: "",
		starts: {
			end: "`",
			returnEnd: !1,
			contains: [e.BACKSLASH_ESCAPE, f],
			subLanguage: "xml"
		}
	}, m = {
		begin: ".?css`",
		end: "",
		starts: {
			end: "`",
			returnEnd: !1,
			contains: [e.BACKSLASH_ESCAPE, f],
			subLanguage: "css"
		}
	}, h = {
		begin: ".?gql`",
		end: "",
		starts: {
			end: "`",
			returnEnd: !1,
			contains: [e.BACKSLASH_ESCAPE, f],
			subLanguage: "graphql"
		}
	}, g = {
		className: "string",
		begin: "`",
		end: "`",
		contains: [e.BACKSLASH_ESCAPE, f]
	}, _ = {
		className: "comment",
		variants: [
			e.COMMENT(/\/\*\*(?!\/)/, "\\*/", {
				relevance: 0,
				contains: [{
					begin: "(?=@[A-Za-z]+)",
					relevance: 0,
					contains: [
						{
							className: "doctag",
							begin: "@[A-Za-z]+"
						},
						{
							className: "type",
							begin: "\\{",
							end: "\\}",
							excludeEnd: !0,
							excludeBegin: !0,
							relevance: 0
						},
						{
							className: "variable",
							begin: r + "(?=\\s*(-)|$)",
							endsParent: !0,
							relevance: 0
						},
						{
							begin: /(?=[^\n])\s/,
							relevance: 0
						}
					]
				}]
			}),
			e.C_BLOCK_COMMENT_MODE,
			e.C_LINE_COMMENT_MODE
		]
	}, v = [
		e.APOS_STRING_MODE,
		e.QUOTE_STRING_MODE,
		p,
		m,
		h,
		g,
		{ match: /\$\d+/ },
		d
	];
	f.contains = v.concat({
		begin: /\{/,
		end: /\}/,
		keywords: s,
		contains: ["self"].concat(v)
	});
	let y = [].concat(_, f.contains), b = y.concat([{
		begin: /(\s*)\(/,
		end: /\)/,
		keywords: s,
		contains: ["self"].concat(y)
	}]), x = {
		className: "params",
		begin: /(\s*)\(/,
		end: /\)/,
		excludeBegin: !0,
		excludeEnd: !0,
		keywords: s,
		contains: b
	}, S = { variants: [{
		match: [
			/class/,
			/\s+/,
			r,
			/\s+/,
			/extends/,
			/\s+/,
			t.concat(r, "(", t.concat(/\./, r), ")*")
		],
		scope: {
			1: "keyword",
			3: "title.class",
			5: "keyword",
			7: "title.class.inherited"
		}
	}, {
		match: [
			/class/,
			/\s+/,
			r
		],
		scope: {
			1: "keyword",
			3: "title.class"
		}
	}] }, C = {
		relevance: 0,
		match: t.either(/\bJSON/, /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/, /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/, /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/),
		className: "title.class",
		keywords: { _: [...Xr, ...Zr] }
	}, w = {
		label: "use_strict",
		className: "meta",
		relevance: 10,
		begin: /^\s*['"]use (strict|asm)['"]/
	}, T = {
		variants: [{ match: [
			/function/,
			/\s+/,
			r,
			/(?=\s*\()/
		] }, { match: [/function/, /\s*(?=\()/] }],
		className: {
			1: "keyword",
			3: "title.function"
		},
		label: "func.def",
		contains: [x],
		illegal: /%/
	}, ee = {
		relevance: 0,
		match: /\b[A-Z][A-Z_0-9]+\b/,
		className: "variable.constant"
	};
	function E(e) {
		return t.concat("(?!", e.join("|"), ")");
	}
	let te = {
		match: t.concat(/\b/, E([
			...Qr,
			"super",
			"import",
			"await"
		].map((e) => `${e}\\s*\\(`)), r, t.lookahead(/\s*\(/)),
		className: "title.function",
		relevance: 0
	}, ne = {
		begin: t.concat(/\./, t.lookahead(t.concat(r, /(?![0-9A-Za-z$_(])/))),
		end: r,
		excludeBegin: !0,
		keywords: "prototype",
		className: "property",
		relevance: 0
	}, D = {
		match: [
			/get|set/,
			/\s+/,
			r,
			/(?=\()/
		],
		className: {
			1: "keyword",
			3: "title.function"
		},
		contains: [{ begin: /\(\)/ }, x]
	}, re = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + e.UNDERSCORE_IDENT_RE + ")\\s*=>", O = {
		match: [
			/const|var|let/,
			/\s+/,
			r,
			/\s*/,
			/=\s*/,
			/(async\s*)?/,
			t.lookahead(re)
		],
		keywords: "async",
		className: {
			1: "keyword",
			3: "title.function"
		},
		contains: [x]
	};
	return {
		name: "JavaScript",
		aliases: [
			"js",
			"jsx",
			"mjs",
			"cjs"
		],
		keywords: s,
		exports: {
			PARAMS_CONTAINS: b,
			CLASS_REFERENCE: C
		},
		illegal: /#(?![$_A-Za-z])/,
		contains: [
			e.SHEBANG({
				label: "shebang",
				binary: "node",
				relevance: 5
			}),
			w,
			e.APOS_STRING_MODE,
			e.QUOTE_STRING_MODE,
			p,
			m,
			h,
			g,
			_,
			{ match: /\$\d+/ },
			d,
			C,
			{
				scope: "attr",
				match: r + t.lookahead(":"),
				relevance: 0
			},
			O,
			{
				begin: "(" + e.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
				keywords: "return throw case",
				relevance: 0,
				contains: [
					_,
					e.REGEXP_MODE,
					{
						className: "function",
						begin: re,
						returnBegin: !0,
						end: "\\s*=>",
						contains: [{
							className: "params",
							variants: [
								{
									begin: e.UNDERSCORE_IDENT_RE,
									relevance: 0
								},
								{
									className: null,
									begin: /\(\s*\)/,
									skip: !0
								},
								{
									begin: /(\s*)\(/,
									end: /\)/,
									excludeBegin: !0,
									excludeEnd: !0,
									keywords: s,
									contains: b
								}
							]
						}]
					},
					{
						begin: /,/,
						relevance: 0
					},
					{
						match: /\s+/,
						relevance: 0
					},
					{
						variants: [
							{
								begin: i.begin,
								end: i.end
							},
							{ match: a },
							{
								begin: o.begin,
								"on:begin": o.isTrulyOpeningTag,
								end: o.end
							}
						],
						subLanguage: "xml",
						contains: [{
							begin: o.begin,
							end: o.end,
							skip: !0,
							contains: ["self"]
						}]
					}
				]
			},
			T,
			{ beginKeywords: "while if switch catch for" },
			{
				begin: "\\b(?!function)" + e.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
				returnBegin: !0,
				label: "func.def",
				contains: [x, e.inherit(e.TITLE_MODE, {
					begin: r,
					className: "title.function"
				})]
			},
			{
				match: /\.\.\./,
				relevance: 0
			},
			ne,
			{
				match: "\\$" + r,
				relevance: 0
			},
			{
				match: [/\bconstructor(?=\s*\()/],
				className: { 1: "title.function" },
				contains: [x]
			},
			te,
			ee,
			S,
			D,
			{ match: /\$[(.]/ }
		]
	};
}
// node_modules/highlight.js/es/languages/json.js
var ni = {
	scope: "number",
	match: "([-+]?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)|NaN|[-+]?Infinity",
	relevance: 0
};
function ri(e) {
	let t = {
		className: "attr",
		begin: /(("(\\.|[^\\"\r\n])*")|('(\\.|[^\\'\r\n])*'))(?=\s*:)/,
		relevance: 1.01
	}, n = {
		match: /[{}[\],:]/,
		className: "punctuation",
		relevance: 0
	}, r = [
		"true",
		"false",
		"null"
	], i = {
		scope: "literal",
		beginKeywords: r.join(" ")
	};
	return {
		name: "JSON",
		aliases: ["jsonc", "json5"],
		keywords: { literal: r },
		contains: [
			t,
			n,
			e.APOS_STRING_MODE,
			e.QUOTE_STRING_MODE,
			i,
			ni,
			e.C_LINE_COMMENT_MODE,
			e.C_BLOCK_COMMENT_MODE
		],
		illegal: "\\S"
	};
}
// node_modules/highlight.js/es/languages/python.js
function ii(e) {
	let t = e.regex, n = /[\p{XID_Start}_]\p{XID_Continue}*/u, r = /* @__PURE__ */ "and.as.assert.async.await.break.case.class.continue.def.del.elif.else.except.finally.for.from.global.if.import.in.is.lambda.lazy.match.nonlocal|10.not.or.pass.raise.return.try.while.with.yield".split("."), i = {
		$pattern: /[A-Za-z]\w+|__\w+__/,
		keyword: r,
		built_in: /* @__PURE__ */ "__import__.abs.aiter.all.anext.any.ascii.bin.bool.breakpoint.bytearray.bytes.callable.chr.classmethod.compile.complex.delattr.dict.dir.divmod.enumerate.eval.exec.filter.float.format.frozendict.frozenset.getattr.globals.hasattr.hash.help.hex.id.input.int.isinstance.issubclass.iter.len.list.locals.map.max.memoryview.min.next.object.oct.open.ord.pow.print.property.range.repr.reversed.round.sentinel.set.setattr.slice.sorted.staticmethod.str.sum.super.tuple.type.vars.zip".split("."),
		literal: [
			"__debug__",
			"Ellipsis",
			"False",
			"None",
			"NotImplemented",
			"True"
		],
		type: [
			"Any",
			"Callable",
			"Coroutine",
			"Dict",
			"List",
			"Literal",
			"Generic",
			"Optional",
			"Sequence",
			"Set",
			"Tuple",
			"Type",
			"Union"
		]
	}, a = {
		className: "meta",
		begin: /^(>>>|\.\.\.) /
	}, o = {
		className: "subst",
		begin: /\{/,
		end: /\}/,
		keywords: i,
		illegal: /#/
	}, s = {
		begin: /\{\{/,
		relevance: 0
	}, c = {
		className: "string",
		contains: [e.BACKSLASH_ESCAPE],
		variants: [
			{
				begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
				end: /'''/,
				contains: [e.BACKSLASH_ESCAPE, a],
				relevance: 10
			},
			{
				begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
				end: /"""/,
				contains: [e.BACKSLASH_ESCAPE, a],
				relevance: 10
			},
			{
				begin: /([fFtT][rR]|[rR][fFtT]|[fFtT])'''/,
				end: /'''/,
				contains: [
					e.BACKSLASH_ESCAPE,
					a,
					s,
					o
				]
			},
			{
				begin: /([fFtT][rR]|[rR][fFtT]|[fFtT])"""/,
				end: /"""/,
				contains: [
					e.BACKSLASH_ESCAPE,
					a,
					s,
					o
				]
			},
			{
				begin: /([uU]|[rR])'/,
				end: /'/,
				relevance: 10
			},
			{
				begin: /([uU]|[rR])"/,
				end: /"/,
				relevance: 10
			},
			{
				begin: /([bB]|[bB][rR]|[rR][bB])'/,
				end: /'/
			},
			{
				begin: /([bB]|[bB][rR]|[rR][bB])"/,
				end: /"/
			},
			{
				begin: /([fFtT][rR]|[rR][fFtT]|[fFtT])'/,
				end: /'/,
				contains: [
					e.BACKSLASH_ESCAPE,
					s,
					o
				]
			},
			{
				begin: /([fFtT][rR]|[rR][fFtT]|[fFtT])"/,
				end: /"/,
				contains: [
					e.BACKSLASH_ESCAPE,
					s,
					o
				]
			},
			e.APOS_STRING_MODE,
			e.QUOTE_STRING_MODE
		]
	}, l = "[0-9](_?[0-9])*", u = `(\\b(${l}))?\\.(${l})|\\b(${l})\\.`, d = `\\b|${r.join("|")}`, f = {
		className: "number",
		relevance: 0,
		variants: [
			{ begin: `(\\b(${l})|(${u}))[eE][+-]?(${l})[jJ]?(?=${d})` },
			{ begin: `(${u})[jJ]?` },
			{ begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${d})` },
			{ begin: `\\b0[bB](_?[01])+[lL]?(?=${d})` },
			{ begin: `\\b0[oO](_?[0-7])+[lL]?(?=${d})` },
			{ begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${d})` },
			{ begin: `\\b(${l})[jJ](?=${d})` }
		]
	}, p = {
		className: "comment",
		begin: t.lookahead(/# type:/),
		end: /$/,
		keywords: i,
		contains: [{ begin: /# type:/ }, {
			begin: /#/,
			end: /\b\B/,
			endsWithParent: !0
		}]
	}, m = {
		className: "params",
		variants: [{
			className: "",
			begin: /\(\s*\)/,
			skip: !0
		}, {
			begin: /\(/,
			end: /\)/,
			excludeBegin: !0,
			excludeEnd: !0,
			keywords: i,
			contains: [
				"self",
				a,
				f,
				c,
				e.HASH_COMMENT_MODE
			]
		}]
	};
	return o.contains = [
		c,
		f,
		a
	], {
		name: "Python",
		aliases: [
			"py",
			"gyp",
			"ipython"
		],
		unicodeRegex: !0,
		keywords: i,
		illegal: /(<\/|\?)|=>/,
		contains: [
			a,
			f,
			{
				scope: "variable.language",
				match: /\bself\b/
			},
			{
				beginKeywords: "if",
				relevance: 0
			},
			{
				match: /\bor\b/,
				scope: "keyword"
			},
			c,
			p,
			e.HASH_COMMENT_MODE,
			{
				match: [
					/\bdef/,
					/\s+/,
					n
				],
				scope: {
					1: "keyword",
					3: "title.function"
				},
				contains: [m]
			},
			{
				variants: [{ match: [
					/\bclass/,
					/\s+/,
					n,
					/\s*/,
					/\(\s*/,
					n,
					/\s*\)/
				] }, { match: [
					/\bclass/,
					/\s+/,
					n
				] }],
				scope: {
					1: "keyword",
					3: "title.class",
					6: "title.class.inherited"
				}
			},
			{
				className: "meta",
				begin: /^[\t ]*@/,
				end: /(?=#)|$/,
				contains: [
					f,
					m,
					c
				]
			}
		]
	};
}
// node_modules/highlight.js/es/languages/typescript.js
var ai = "[A-Za-z$_][0-9A-Za-z$_]*", oi = /* @__PURE__ */ "as.in.of.if.for.while.finally.var.new.function.do.return.void.else.break.catch.instanceof.with.throw.case.default.try.switch.continue.typeof.delete.let.yield.const.class.debugger.async.await.static.import.from.export.extends.using".split("."), si = [
	"true",
	"false",
	"null",
	"undefined",
	"NaN",
	"Infinity"
], ci = /* @__PURE__ */ "Object.Function.Boolean.Symbol.Math.Date.Number.BigInt.String.RegExp.Array.Float32Array.Float64Array.Int8Array.Uint8Array.Uint8ClampedArray.Int16Array.Int32Array.Uint16Array.Uint32Array.BigInt64Array.BigUint64Array.Set.Map.WeakSet.WeakMap.ArrayBuffer.SharedArrayBuffer.Atomics.DataView.JSON.Promise.Generator.GeneratorFunction.AsyncFunction.Reflect.Proxy.Intl.WebAssembly".split("."), li = [
	"Error",
	"EvalError",
	"InternalError",
	"RangeError",
	"ReferenceError",
	"SyntaxError",
	"TypeError",
	"URIError"
], ui = [
	"setInterval",
	"setTimeout",
	"clearInterval",
	"clearTimeout",
	"require",
	"exports",
	"eval",
	"isFinite",
	"isNaN",
	"parseFloat",
	"parseInt",
	"decodeURI",
	"decodeURIComponent",
	"encodeURI",
	"encodeURIComponent",
	"escape",
	"unescape"
], di = [
	"arguments",
	"this",
	"super",
	"console",
	"window",
	"document",
	"localStorage",
	"sessionStorage",
	"module",
	"self",
	"global"
], fi = [].concat(ui, ci, li);
function pi(e) {
	let t = e.regex, n = (e, { after: t }) => {
		let n = "</" + e[0].slice(1);
		return e.input.indexOf(n, t) !== -1;
	}, r = ai, i = {
		begin: "<>",
		end: "</>"
	}, a = /<[A-Za-z0-9\\._:-]+\s*\/>/, o = {
		begin: /<[A-Za-z0-9\\._:-]+/,
		end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
		isTrulyOpeningTag: (e, t) => {
			let r = e[0].length + e.index, i = e.input[r];
			if (i === "<" || i === ",") {
				t.ignoreMatch();
				return;
			}
			i === ">" && (n(e, { after: r }) || t.ignoreMatch());
			let a, o = e.input.substring(r);
			((a = o.match(/^\s*=/)) || (a = o.match(/^\s+extends\s+/)) && a.index === 0) && t.ignoreMatch();
		}
	}, s = {
		$pattern: ai,
		keyword: oi,
		literal: si,
		built_in: fi,
		"variable.language": di
	}, c = "[0-9](_?[0-9])*", l = `\\.(${c})`, u = "0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*", d = {
		className: "number",
		variants: [
			{ begin: `(\\b(${u})((${l})|\\.)?|(${l}))[eE][+-]?(${c})\\b` },
			{ begin: `\\b(${u})\\b((${l})\\b|\\.)?|(${l})\\b` },
			{ begin: "\\b(0|[1-9](_?[0-9])*)n\\b" },
			{ begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
			{ begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
			{ begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
			{ begin: "\\b0[0-7]+n?\\b" }
		],
		relevance: 0
	}, f = {
		className: "subst",
		begin: "\\$\\{",
		end: "\\}",
		keywords: s,
		contains: []
	}, p = {
		begin: ".?html`",
		end: "",
		starts: {
			end: "`",
			returnEnd: !1,
			contains: [e.BACKSLASH_ESCAPE, f],
			subLanguage: "xml"
		}
	}, m = {
		begin: ".?css`",
		end: "",
		starts: {
			end: "`",
			returnEnd: !1,
			contains: [e.BACKSLASH_ESCAPE, f],
			subLanguage: "css"
		}
	}, h = {
		begin: ".?gql`",
		end: "",
		starts: {
			end: "`",
			returnEnd: !1,
			contains: [e.BACKSLASH_ESCAPE, f],
			subLanguage: "graphql"
		}
	}, g = {
		className: "string",
		begin: "`",
		end: "`",
		contains: [e.BACKSLASH_ESCAPE, f]
	}, _ = {
		className: "comment",
		variants: [
			e.COMMENT(/\/\*\*(?!\/)/, "\\*/", {
				relevance: 0,
				contains: [{
					begin: "(?=@[A-Za-z]+)",
					relevance: 0,
					contains: [
						{
							className: "doctag",
							begin: "@[A-Za-z]+"
						},
						{
							className: "type",
							begin: "\\{",
							end: "\\}",
							excludeEnd: !0,
							excludeBegin: !0,
							relevance: 0
						},
						{
							className: "variable",
							begin: r + "(?=\\s*(-)|$)",
							endsParent: !0,
							relevance: 0
						},
						{
							begin: /(?=[^\n])\s/,
							relevance: 0
						}
					]
				}]
			}),
			e.C_BLOCK_COMMENT_MODE,
			e.C_LINE_COMMENT_MODE
		]
	}, v = [
		e.APOS_STRING_MODE,
		e.QUOTE_STRING_MODE,
		p,
		m,
		h,
		g,
		{ match: /\$\d+/ },
		d
	];
	f.contains = v.concat({
		begin: /\{/,
		end: /\}/,
		keywords: s,
		contains: ["self"].concat(v)
	});
	let y = [].concat(_, f.contains), b = y.concat([{
		begin: /(\s*)\(/,
		end: /\)/,
		keywords: s,
		contains: ["self"].concat(y)
	}]), x = {
		className: "params",
		begin: /(\s*)\(/,
		end: /\)/,
		excludeBegin: !0,
		excludeEnd: !0,
		keywords: s,
		contains: b
	}, S = { variants: [{
		match: [
			/class/,
			/\s+/,
			r,
			/\s+/,
			/extends/,
			/\s+/,
			t.concat(r, "(", t.concat(/\./, r), ")*")
		],
		scope: {
			1: "keyword",
			3: "title.class",
			5: "keyword",
			7: "title.class.inherited"
		}
	}, {
		match: [
			/class/,
			/\s+/,
			r
		],
		scope: {
			1: "keyword",
			3: "title.class"
		}
	}] }, C = {
		relevance: 0,
		match: t.either(/\bJSON/, /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/, /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/, /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/),
		className: "title.class",
		keywords: { _: [...ci, ...li] }
	}, w = {
		label: "use_strict",
		className: "meta",
		relevance: 10,
		begin: /^\s*['"]use (strict|asm)['"]/
	}, T = {
		variants: [{ match: [
			/function/,
			/\s+/,
			r,
			/(?=\s*\()/
		] }, { match: [/function/, /\s*(?=\()/] }],
		className: {
			1: "keyword",
			3: "title.function"
		},
		label: "func.def",
		contains: [x],
		illegal: /%/
	}, ee = {
		relevance: 0,
		match: /\b[A-Z][A-Z_0-9]+\b/,
		className: "variable.constant"
	};
	function E(e) {
		return t.concat("(?!", e.join("|"), ")");
	}
	let te = {
		match: t.concat(/\b/, E([
			...ui,
			"super",
			"import",
			"await"
		].map((e) => `${e}\\s*\\(`)), r, t.lookahead(/\s*\(/)),
		className: "title.function",
		relevance: 0
	}, ne = {
		begin: t.concat(/\./, t.lookahead(t.concat(r, /(?![0-9A-Za-z$_(])/))),
		end: r,
		excludeBegin: !0,
		keywords: "prototype",
		className: "property",
		relevance: 0
	}, D = {
		match: [
			/get|set/,
			/\s+/,
			r,
			/(?=\()/
		],
		className: {
			1: "keyword",
			3: "title.function"
		},
		contains: [{ begin: /\(\)/ }, x]
	}, re = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + e.UNDERSCORE_IDENT_RE + ")\\s*=>", O = {
		match: [
			/const|var|let/,
			/\s+/,
			r,
			/\s*/,
			/=\s*/,
			/(async\s*)?/,
			t.lookahead(re)
		],
		keywords: "async",
		className: {
			1: "keyword",
			3: "title.function"
		},
		contains: [x]
	};
	return {
		name: "JavaScript",
		aliases: [
			"js",
			"jsx",
			"mjs",
			"cjs"
		],
		keywords: s,
		exports: {
			PARAMS_CONTAINS: b,
			CLASS_REFERENCE: C
		},
		illegal: /#(?![$_A-Za-z])/,
		contains: [
			e.SHEBANG({
				label: "shebang",
				binary: "node",
				relevance: 5
			}),
			w,
			e.APOS_STRING_MODE,
			e.QUOTE_STRING_MODE,
			p,
			m,
			h,
			g,
			_,
			{ match: /\$\d+/ },
			d,
			C,
			{
				scope: "attr",
				match: r + t.lookahead(":"),
				relevance: 0
			},
			O,
			{
				begin: "(" + e.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
				keywords: "return throw case",
				relevance: 0,
				contains: [
					_,
					e.REGEXP_MODE,
					{
						className: "function",
						begin: re,
						returnBegin: !0,
						end: "\\s*=>",
						contains: [{
							className: "params",
							variants: [
								{
									begin: e.UNDERSCORE_IDENT_RE,
									relevance: 0
								},
								{
									className: null,
									begin: /\(\s*\)/,
									skip: !0
								},
								{
									begin: /(\s*)\(/,
									end: /\)/,
									excludeBegin: !0,
									excludeEnd: !0,
									keywords: s,
									contains: b
								}
							]
						}]
					},
					{
						begin: /,/,
						relevance: 0
					},
					{
						match: /\s+/,
						relevance: 0
					},
					{
						variants: [
							{
								begin: i.begin,
								end: i.end
							},
							{ match: a },
							{
								begin: o.begin,
								"on:begin": o.isTrulyOpeningTag,
								end: o.end
							}
						],
						subLanguage: "xml",
						contains: [{
							begin: o.begin,
							end: o.end,
							skip: !0,
							contains: ["self"]
						}]
					}
				]
			},
			T,
			{ beginKeywords: "while if switch catch for" },
			{
				begin: "\\b(?!function)" + e.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
				returnBegin: !0,
				label: "func.def",
				contains: [x, e.inherit(e.TITLE_MODE, {
					begin: r,
					className: "title.function"
				})]
			},
			{
				match: /\.\.\./,
				relevance: 0
			},
			ne,
			{
				match: "\\$" + r,
				relevance: 0
			},
			{
				match: [/\bconstructor(?=\s*\()/],
				className: { 1: "title.function" },
				contains: [x]
			},
			te,
			ee,
			S,
			D,
			{ match: /\$[(.]/ }
		]
	};
}
function mi(e) {
	let t = e.regex, n = pi(e), r = ai, i = [
		"any",
		"void",
		"number",
		"boolean",
		"string",
		"object",
		"never",
		"symbol",
		"bigint",
		"unknown"
	], a = {
		begin: [
			/namespace/,
			/\s+/,
			e.IDENT_RE
		],
		beginScope: {
			1: "keyword",
			3: "title.class"
		}
	}, o = {
		beginKeywords: "interface",
		end: /\{/,
		excludeEnd: !0,
		keywords: {
			keyword: "interface extends",
			built_in: i
		},
		contains: [n.exports.CLASS_REFERENCE]
	}, s = {
		className: "meta",
		relevance: 10,
		begin: /^\s*['"]use strict['"]/
	}, c = {
		$pattern: ai,
		keyword: oi.concat([
			"type",
			"interface",
			"public",
			"private",
			"protected",
			"implements",
			"declare",
			"abstract",
			"readonly",
			"enum",
			"override",
			"satisfies"
		]),
		literal: si,
		built_in: fi.concat(i),
		"variable.language": di
	}, l = {
		className: "meta",
		begin: "@" + r
	}, u = (e, t, n) => {
		let r = e.contains.findIndex((e) => e.label === t);
		if (r === -1) throw Error("can not find mode to replace");
		e.contains.splice(r, 1, n);
	};
	Object.assign(n.keywords, c), n.exports.PARAMS_CONTAINS.push(l);
	let d = n.contains.find((e) => e.scope === "attr"), f = Object.assign({}, d, { match: t.concat(r, t.lookahead(/\s*\?:/)) });
	n.exports.PARAMS_CONTAINS.push([
		n.exports.CLASS_REFERENCE,
		d,
		f
	]), n.contains = n.contains.concat([
		l,
		a,
		o,
		f
	]), u(n, "shebang", e.SHEBANG()), u(n, "use_strict", s);
	let p = n.contains.find((e) => e.label === "func.def");
	return p.relevance = 0, Object.assign(n, {
		name: "TypeScript",
		aliases: [
			"ts",
			"tsx",
			"mts",
			"cts"
		]
	}), n;
}
// node_modules/highlight.js/es/languages/yaml.js
function hi(e) {
	let t = "true false yes no null", n = "[\\w#;/?:@&=+$,.~*'()[\\]]+", r = {
		className: "attr",
		variants: [
			{ begin: /[\w*@][\w*@ :()\./-]*:(?=[ \t]|$)/ },
			{ begin: /"[\w*@][\w*@ :()\./-]*":(?=[ \t]|$)/ },
			{ begin: /'[\w*@][\w*@ :()\./-]*':(?=[ \t]|$)/ }
		]
	}, i = {
		className: "template-variable",
		variants: [{
			begin: /\{\{/,
			end: /\}\}/
		}, {
			begin: /%\{/,
			end: /\}/
		}]
	}, a = {
		className: "string",
		relevance: 0,
		begin: /'/,
		end: /'/,
		contains: [{
			match: /''/,
			scope: "char.escape",
			relevance: 0
		}]
	}, o = {
		className: "string",
		relevance: 0,
		variants: [{
			begin: /"/,
			end: /"/
		}, { begin: /\S+/ }],
		contains: [e.BACKSLASH_ESCAPE, i]
	}, s = e.inherit(o, { variants: [
		{
			begin: /'/,
			end: /'/,
			contains: [{
				begin: /''/,
				relevance: 0
			}]
		},
		{
			begin: /"/,
			end: /"/
		},
		{ begin: /[^\s,{}[\]]+/ }
	] }), c = {
		className: "number",
		begin: "\\b[0-9]{4}(-[0-9][0-9]){0,2}([Tt \\t][0-9][0-9]?(:[0-9][0-9]){2})?(\\.[0-9]*)?([ \\t])*(Z|[-+][0-9][0-9]?(:[0-9][0-9])?)?\\b"
	}, l = {
		end: ",",
		endsWithParent: !0,
		excludeEnd: !0,
		keywords: t,
		relevance: 0
	}, u = {
		begin: /\{/,
		end: /\}/,
		contains: [l],
		illegal: "\\n",
		relevance: 0
	}, d = {
		begin: "\\[",
		end: "\\]",
		contains: [l],
		illegal: "\\n",
		relevance: 0
	}, f = [
		r,
		{
			className: "meta",
			begin: "^---\\s*$",
			relevance: 10
		},
		{
			className: "string",
			begin: "[\\|>]([1-9]?[+-])?[ ]*\\n( +)[^ ][^\\n]*\\n(\\2[^\\n]+\\n?)*"
		},
		{
			begin: "<%[%=-]?",
			end: "[%-]?%>",
			subLanguage: "ruby",
			excludeBegin: !0,
			excludeEnd: !0,
			relevance: 0
		},
		{
			className: "type",
			begin: "!\\w+!" + n
		},
		{
			className: "type",
			begin: "!<" + n + ">"
		},
		{
			className: "type",
			begin: "!" + n
		},
		{
			className: "type",
			begin: "!!" + n
		},
		{
			className: "meta",
			begin: "&" + e.UNDERSCORE_IDENT_RE + "$"
		},
		{
			className: "meta",
			begin: "\\*" + e.UNDERSCORE_IDENT_RE + "$"
		},
		{
			className: "bullet",
			begin: "-(?=[ ]|$)",
			relevance: 0
		},
		e.HASH_COMMENT_MODE,
		{
			beginKeywords: t,
			keywords: { literal: t }
		},
		c,
		{
			className: "number",
			begin: e.C_NUMBER_RE + "\\b",
			relevance: 0
		},
		u,
		d,
		a,
		o
	], p = [...f];
	return p.pop(), p.push(s), l.contains = p, {
		name: "YAML",
		case_insensitive: !0,
		aliases: ["yml"],
		contains: f
	};
}
U.registerLanguage("bash", Rr), U.registerLanguage("sh", Rr), U.registerLanguage("shell", Rr), U.registerLanguage("dockerfile", zr), U.registerLanguage("docker", zr), U.registerLanguage("groovy", Gr), U.registerLanguage("jenkinsfile", Gr), U.registerLanguage("ini", Kr), U.registerLanguage("properties", Kr), U.registerLanguage("javascript", ti), U.registerLanguage("js", ti), U.registerLanguage("json", ri), U.registerLanguage("python", ii), U.registerLanguage("py", ii), U.registerLanguage("typescript", mi), U.registerLanguage("ts", mi), U.registerLanguage("yaml", hi), U.registerLanguage("yml", hi);
// node_modules/react/cjs/react-jsx-runtime.production.js
var gi = /* @__PURE__ */ o(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
	function r(e, n, r) {
		var i = null;
		if (r !== void 0 && (i = "" + r), n.key !== void 0 && (i = "" + n.key), "key" in n) for (var a in r = {}, n) a !== "key" && (r[a] = n[a]);
		else r = n;
		return n = r.ref, {
			$$typeof: t,
			type: e,
			key: i,
			ref: n === void 0 ? null : n,
			props: r
		};
	}
	e.Fragment = n, e.jsx = r, e.jsxs = r;
})), W = (/* @__PURE__ */ o(((e, t) => {
	t.exports = gi();
})))();
H.setOptions({
	gfm: !0,
	breaks: !0
});
function _i({ text: e }) {
	let t = (0, _.useRef)(null), n = (0, _.useMemo)(() => {
		let t = H.parse(e, { async: !1 });
		return B.sanitize(t, { ADD_ATTR: ["target", "rel"] });
	}, [e]);
	return (0, _.useEffect)(() => {
		let e = t.current;
		e && (e.querySelectorAll("pre > code").forEach((e) => {
			let t = e, n = t.parentElement;
			if (!n || n.parentElement?.classList.contains("cp-code")) return;
			let r = Array.from(t.classList).find((e) => e.startsWith("language-"))?.slice(9) ?? "text";
			try {
				U.highlightElement(t);
			} catch {}
			let i = document.createElement("div");
			i.className = "cp-code";
			let a = document.createElement("div");
			a.className = "cp-code-head";
			let o = document.createElement("span");
			o.textContent = r;
			let s = document.createElement("span");
			s.className = "cp-grow";
			let c = document.createElement("button");
			c.type = "button", c.className = "cp-copy", c.textContent = "copy", c.addEventListener("click", () => {
				navigator.clipboard?.writeText(t.textContent ?? ""), c.textContent = "copied", window.setTimeout(() => {
					c.textContent = "copy";
				}, 1200);
			}), a.append(o, s, c), n.replaceWith(i), i.append(a, n);
		}), e.querySelectorAll("a").forEach((e) => {
			e.setAttribute("target", "_blank"), e.setAttribute("rel", "noreferrer noopener");
		}));
	}, [n]), /* @__PURE__ */ (0, W.jsx)("div", {
		className: "cp-msg-body",
		ref: t,
		dangerouslySetInnerHTML: { __html: n }
	});
}
// src/components/jenkinsSymbols.ts
var vi = {
	add: {
		viewBox: "0 0 512 512",
		body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M256 112v288M400 256H112\"/>"
	},
	"attach-outline": {
		viewBox: "0 0 512 512",
		body: "<path d=\"M216.08 192v143.85a40.08 40.08 0 0080.15 0l.13-188.55a67.94 67.94 0 10-135.87 0v189.82a95.51 95.51 0 10191 0V159.74\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" stroke-width=\"32\"/>"
	},
	"bulb-outline": {
		viewBox: "0 0 512 512",
		body: "<path d=\"M304 384v-24c0-29 31.54-56.43 52-76 28.84-27.57 44-64.61 44-108 0-80-63.73-144-144-144a143.6 143.6 0 00-144 144c0 41.84 15.81 81.39 44 108 20.35 19.21 52 46.7 52 76v24M224 480h64M208 432h96M256 384V256\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path d=\"M294 240s-21.51 16-38 16-38-16-38-16\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	changes: {
		viewBox: "0 0 512 512",
		body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M160 368L32 256l128-112M352 368l128-112-128-112M304 96l-96 320\"/>"
	},
	"chatbubble-outline": {
		viewBox: "0 0 512 512",
		body: "<path d=\"M87.49 380c1.19-4.38-1.44-10.47-3.95-14.86a44.86 44.86 0 00-2.54-3.8 199.81 199.81 0 01-33-110C47.65 139.09 140.73 48 255.83 48 356.21 48 440 117.54 459.58 209.85a199 199 0 014.42 41.64c0 112.41-89.49 204.93-204.59 204.93-18.3 0-43-4.6-56.47-8.37s-26.92-8.77-30.39-10.11a31.09 31.09 0 00-11.12-2.07 30.71 30.71 0 00-12.09 2.43l-67.83 24.48a16 16 0 01-4.67 1.22 9.6 9.6 0 01-9.57-9.74 15.85 15.85 0 01.6-3.29z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" stroke-width=\"32\"/>"
	},
	check: {
		viewBox: "0 0 512 512",
		body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M416 128L192 384l-96-96\"/>"
	},
	"checkmark-circle": {
		viewBox: "0 0 512 512",
		body: "<path d=\"M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm108.25 138.29l-134.4 160a16 16 0 01-12 5.71h-.27a16 16 0 01-11.89-5.3l-57.6-64a16 16 0 1123.78-21.4l45.29 50.32 122.59-145.91a16 16 0 0124.5 20.58z\" fill=\"currentColor\"/>"
	},
	"chevron-down": {
		viewBox: "0 0 512 512",
		body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"48\" d=\"M112 184l144 144 144-144\"/>"
	},
	close: {
		viewBox: "0 0 512 512",
		body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M368 368L144 144M368 144L144 368\"/>"
	},
	"cloud-outline": {
		viewBox: "0 0 512 512",
		body: "<path d=\"M400 240c-8.89-89.54-71-144-144-144-69 0-113.44 48.2-128 96-60 6-112 43.59-112 112 0 66 54 112 120 112h260c55 0 100-27.44 100-88 0-59.82-53-85.76-96-88z\" fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	"color-palette-outline": {
		viewBox: "0 0 512 512",
		body: "<path d=\"M430.11 347.9c-6.6-6.1-16.3-7.6-24.6-9-11.5-1.9-15.9-4-22.6-10-14.3-12.7-14.3-31.1 0-43.8l30.3-26.9c46.4-41 46.4-108.2 0-149.2-34.2-30.1-80.1-45-127.8-45-55.7 0-113.9 20.3-158.8 60.1-83.5 73.8-83.5 194.7 0 268.5 41.5 36.7 97.5 55 152.9 55.4h1.7c55.4 0 110-17.9 148.8-52.4 14.4-12.7 11.99-36.6.1-47.7z\" fill=\"none\" stroke=\"currentColor\" stroke-miterlimit=\"10\" stroke-width=\"32\"/><circle cx=\"144\" cy=\"208\" r=\"32\" fill=\"currentColor\"/><circle cx=\"152\" cy=\"311\" r=\"32\" fill=\"currentColor\"/><circle cx=\"224\" cy=\"144\" r=\"32\" fill=\"currentColor\"/><circle cx=\"256\" cy=\"367\" r=\"48\" fill=\"currentColor\"/><circle cx=\"328\" cy=\"144\" r=\"32\" fill=\"currentColor\"/>"
	},
	computer: {
		viewBox: "0 0 512 512",
		body: "<g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" stroke-linejoin=\"round\"><g id=\"desktop-outline\" transform=\"translate(32.000000, 64.000000)\" stroke=\"currentColor\" stroke-width=\"32\"><rect id=\"Rectangle\" x=\"0\" y=\"0\" width=\"448\" height=\"320\" rx=\"32\"></rect><polygon id=\"Path\" stroke-linecap=\"round\" fill-rule=\"nonzero\" points=\"272 384 264 320 184 320 176 384\"></polygon><line x1=\"336\" y1=\"384\" x2=\"112\" y2=\"384\" id=\"Path\" stroke-linecap=\"round\"></line></g></g>"
	},
	"contract-outline": {
		viewBox: "0 0 512 512",
		body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M304 416V304h112M314.2 314.23L432 432M208 96v112H96M197.8 197.77L80 80M416 208H304V96M314.23 197.8L432 80M96 304h112v112M197.77 314.2L80 432\"/>"
	},
	"copy-outline": {
		viewBox: "0 0 512 512",
		body: "<rect x=\"128\" y=\"128\" width=\"336\" height=\"336\" rx=\"57\" ry=\"57\" fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path d=\"M383.5 128l.5-24a56.16 56.16 0 00-56-56H112a64.19 64.19 0 00-64 64v216a56.16 56.16 0 0056 56h24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	"cube-outline": {
		viewBox: "0 0 512 512",
		body: "<path d=\"M448 341.37V170.61A32 32 0 00432.11 143l-152-88.46a47.94 47.94 0 00-48.24 0L79.89 143A32 32 0 0064 170.61v170.76A32 32 0 0079.89 369l152 88.46a48 48 0 0048.24 0l152-88.46A32 32 0 00448 341.37z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M69 153.99l187 110 187-110M256 463.99v-200\"/>"
	},
	"document-text": {
		viewBox: "0 0 512 512",
		body: "<path d=\"M416 221.25V416a48 48 0 01-48 48H144a48 48 0 01-48-48V96a48 48 0 0148-48h98.75a32 32 0 0122.62 9.37l141.26 141.26a32 32 0 019.37 22.62z\" fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path d=\"M256 56v120a32 32 0 0032 32h120M176 288h160M176 368h160\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	edit: {
		viewBox: "0 0 512 512",
		body: "<g stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\"><path d=\"M399.608914,57 C413.784791,57 427.960684,62.4078333 438.776426,73.2235621 C449.592141,84.0392638 455,98.2149574 455,112.390686 C455,126.566468 449.592105,140.742274 438.776426,151.558078 L438.776426,151.558078 L191.040603,399.293596 C182.232434,408.101755 171.575528,414.840664 159.841736,419.022244 L159.841736,419.022244 L58.9309718,454.983885 C58.3980325,455.005817 57.9083807,454.793595 57.5574476,454.442654 C57.2063668,454.091565 56.9941379,453.601684 57.0161199,453.068522 L57.0161199,453.068522 L92.977296,352.157786 C97.1588787,340.423838 103.897856,329.766792 112.706129,320.958529 L112.706129,320.958529 L360.441401,73.2235621 C371.257143,62.4078333 385.433036,57 399.608914,57 Z\" stroke=\"currentColor\" stroke-width=\"32\" fill-rule=\"nonzero\"></path><polyline fill=\"currentColor\" transform=\"translate(362.692388, 154.192388) rotate(45.000000) translate(-362.692388, -154.192388) \" points=\"308.192388 138.192388 359.945436 138.192388 417.192388 138.192388 417.192388 170.192388 360.652543 170.192388 308.192388 170.192388\"></polyline></g>"
	},
	expand: {
		viewBox: "0 0 20 20",
		body: "<path d=\"M10 4H15C15.5523 4 16 4.44772 16 5V10M10 16H5C4.44772 16 4 15.5523 4 15V10\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\"></path>"
	},
	"expand-outline": {
		viewBox: "0 0 512 512",
		body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M432 320v112H320M421.8 421.77L304 304M80 192V80h112M90.2 90.23L208 208M320 80h112v112M421.77 90.2L304 208M192 432H80V320M90.23 421.8L208 304\"/>"
	},
	"flag-outline": {
		viewBox: "0 0 512 512",
		body: "<path d=\"M80 464V68.14a8 8 0 014-6.9C91.81 56.66 112.92 48 160 48c64 0 145 48 192 48a199.53 199.53 0 0077.23-15.77 2 2 0 012.77 1.85v219.36a4 4 0 01-2.39 3.65C421.37 308.7 392.33 320 352 320c-48 0-128-32-192-32s-80 16-80 16\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" stroke-width=\"32\"/>"
	},
	folder: {
		viewBox: "0 0 512 512",
		body: "<path d=\"M440 432H72a40 40 0 01-40-40V120a40 40 0 0140-40h75.89a40 40 0 0122.19 6.72l27.84 18.56a40 40 0 0022.19 6.72H440a40 40 0 0140 40v240a40 40 0 01-40 40zM32 192h448\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	"git-branch-outline": {
		viewBox: "0 0 512 512",
		body: "<circle cx=\"160\" cy=\"96\" r=\"48\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><circle cx=\"160\" cy=\"416\" r=\"48\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M160 368V144\"/><circle cx=\"352\" cy=\"160\" r=\"48\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path d=\"M352 208c0 128-192 48-192 160\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	"git-compare-outline": {
		viewBox: "0 0 512 512",
		body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M304 160l-64-64 64-64M207 352l64 64-64 64\"/><circle cx=\"112\" cy=\"96\" r=\"48\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><circle cx=\"400\" cy=\"416\" r=\"48\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path d=\"M256 96h84a60 60 0 0160 60v212M255 416h-84a60 60 0 01-60-60V144\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	"git-pull-request-outline": {
		viewBox: "0 0 512 512",
		body: "<circle cx=\"128\" cy=\"416\" r=\"48\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M128 144v224M288 160l-64-64 64-64\"/><circle cx=\"128\" cy=\"96\" r=\"48\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><circle cx=\"384\" cy=\"416\" r=\"48\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path d=\"M240 96h84a60 60 0 0160 60v212\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	hammer: {
		viewBox: "0 0 512 512",
		body: "<path d=\"M277.42 247a24.68 24.68 0 00-4.08-5.47L255 223.44a21.63 21.63 0 00-6.56-4.57 20.93 20.93 0 00-23.28 4.27c-6.36 6.26-18 17.68-39 38.43C146 301.3 71.43 367.89 37.71 396.29a16 16 0 00-1.09 23.54l39 39.43a16.13 16.13 0 0023.67-.89c29.24-34.37 96.3-109 136-148.23 20.39-20.06 31.82-31.58 38.29-37.94a21.76 21.76 0 003.84-25.2zM478.43 201l-34.31-34a5.44 5.44 0 00-4-1.59 5.59 5.59 0 00-4 1.59h0a11.41 11.41 0 01-9.55 3.27c-4.48-.49-9.25-1.88-12.33-4.86-7-6.86 1.09-20.36-5.07-29a242.88 242.88 0 00-23.08-26.72c-7.06-7-34.81-33.47-81.55-52.53a123.79 123.79 0 00-47-9.24c-26.35 0-46.61 11.76-54 18.51-5.88 5.32-12 13.77-12 13.77a91.29 91.29 0 0110.81-3.2 79.53 79.53 0 0123.28-1.49C241.19 76.8 259.94 84.1 270 92c16.21 13 23.18 30.39 24.27 52.83.8 16.69-15.23 37.76-30.44 54.94a7.85 7.85 0 00.4 10.83l21.24 21.23a8 8 0 0011.14.1c13.93-13.51 31.09-28.47 40.82-34.46s17.58-7.68 21.35-8.09a35.71 35.71 0 0121.3 4.62 13.65 13.65 0 013.08 2.38c6.46 6.56 6.07 17.28-.5 23.74l-2 1.89a5.5 5.5 0 000 7.84l34.31 34a5.5 5.5 0 004 1.58 5.65 5.65 0 004-1.58L478.43 209a5.82 5.82 0 000-8z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	jobs: {
		viewBox: "0 0 512 512",
		body: "<rect x=\"64\" y=\"74\" width=\"384\" height=\"70\" rx=\"35\" stroke=\"currentColor\" stroke-width=\"32\"/><rect x=\"64\" y=\"223\" width=\"384\" height=\"70\" rx=\"35\" stroke=\"currentColor\" stroke-width=\"32\"/><rect x=\"64\" y=\"369\" width=\"384\" height=\"70\" rx=\"35\" stroke=\"currentColor\" stroke-width=\"32\"/>"
	},
	key: {
		viewBox: "0 0 512 512",
		body: "<path d=\"M218.1 167.17c0 13 0 25.6 4.1 37.4-43.1 50.6-156.9 184.3-167.5 194.5a20.17 20.17 0 00-6.7 15c0 8.5 5.2 16.7 9.6 21.3 6.6 6.9 34.8 33 40 28 15.4-15 18.5-19 24.8-25.2 9.5-9.3-1-28.3 2.3-36s6.8-9.2 12.5-10.4 15.8 2.9 23.7 3c8.3.1 12.8-3.4 19-9.2 5-4.6 8.6-8.9 8.7-15.6.2-9-12.8-20.9-3.1-30.4s23.7 6.2 34 5 22.8-15.5 24.1-21.6-11.7-21.8-9.7-30.7c.7-3 6.8-10 11.4-11s25 6.9 29.6 5.9c5.6-1.2 12.1-7.1 17.4-10.4 15.5 6.7 29.6 9.4 47.7 9.4 68.5 0 124-53.4 124-119.2S408.5 48 340 48s-121.9 53.37-121.9 119.17zM400 144a32 32 0 11-32-32 32 32 0 0132 32z\" fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	"logo-github": {
		viewBox: "0 0 512 512",
		body: "<path stroke-width=\"32\" fill=\"currentColor\" stroke=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M256 32C132.3 32 32 134.9 32 261.7c0 101.5 64.2 187.5 153.2 217.9a17.56 17.56 0 003.8.4c8.3 0 11.5-6.1 11.5-11.4 0-5.5-.2-19.9-.3-39.1a102.4 102.4 0 01-22.6 2.7c-43.1 0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1 1.4-14.1h.1c22.5 2 34.3 23.8 34.3 23.8 11.2 19.6 26.2 25.1 39.6 25.1a63 63 0 0025.6-6c2-14.8 7.8-24.9 14.2-30.7-49.7-5.8-102-25.5-102-113.5 0-25.1 8.7-45.6 23-61.6-2.3-5.8-10-29.2 2.2-60.8a18.64 18.64 0 015-.5c8.1 0 26.4 3.1 56.6 24.1a208.21 208.21 0 01112.2 0c30.2-21 48.5-24.1 56.6-24.1a18.64 18.64 0 015 .5c12.2 31.6 4.5 55 2.2 60.8 14.3 16.1 23 36.6 23 61.6 0 88.2-52.4 107.6-102.3 113.3 8 7.1 15.2 21.1 15.2 42.5 0 30.7-.3 55.5-.3 63 0 5.4 3.1 11.5 11.4 11.5a19.35 19.35 0 004-.4C415.9 449.2 480 363.1 480 261.7 480 134.9 379.7 32 256 32z\"/>"
	},
	logs: {
		viewBox: "0 0 512 512",
		body: "<path d=\"M336 64h32a48 48 0 0148 48v320a48 48 0 01-48 48H144a48 48 0 01-48-48V112a48 48 0 0148-48h32\" fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"32\"/><rect x=\"176\" y=\"32\" width=\"160\" height=\"64\" rx=\"26.13\" ry=\"26.13\" fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	"moon-outline": {
		viewBox: "0 0 512 512",
		body: "<path d=\"M160 136c0-30.62 4.51-61.61 16-88C99.57 81.27 48 159.32 48 248c0 119.29 96.71 216 216 216 88.68 0 166.73-51.57 200-128-26.39 11.49-57.38 16-88 16-119.29 0-216-96.71-216-216z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	parameters: {
		viewBox: "0 0 512 512",
		body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M368 96h80M64 96h240M368 416h80M64 416h240M208 256h240M64 256h80\"/><circle cx=\"336\" cy=\"96\" r=\"32\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><circle cx=\"176\" cy=\"256\" r=\"32\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><circle cx=\"336\" cy=\"416\" r=\"32\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	people: {
		viewBox: "0 0 512 512",
		body: "<path d=\"M402 168c-2.93 40.67-33.1 72-66 72s-63.12-31.32-66-72c-3-42.31 26.37-72 66-72s69 30.46 66 72z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path d=\"M336 304c-65.17 0-127.84 32.37-143.54 95.41-2.08 8.34 3.15 16.59 11.72 16.59h263.65c8.57 0 13.77-8.25 11.72-16.59C463.85 335.36 401.18 304 336 304z\" fill=\"none\" stroke=\"currentColor\" stroke-miterlimit=\"10\" stroke-width=\"32\"/><path d=\"M200 185.94c-2.34 32.48-26.72 58.06-53 58.06s-50.7-25.57-53-58.06C91.61 152.15 115.34 128 147 128s55.39 24.77 53 57.94z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path d=\"M206 306c-18.05-8.27-37.93-11.45-59-11.45-52 0-102.1 25.85-114.65 76.2-1.65 6.66 2.53 13.25 9.37 13.25H154\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" stroke-width=\"32\"/>"
	},
	plugins: {
		viewBox: "0 0 528 448",
		body: "<path d=\"M461.66 214.1H434C433.47 214.1 432.961 213.889 432.586 213.514C432.211 213.139 432 212.63 432 212.1V134.86C432 124.554 427.906 114.669 420.618 107.382C413.331 100.094 403.446 96 393.14 96H315.9C315.37 96 314.861 95.7893 314.486 95.4142C314.111 95.0391 313.9 94.5304 313.9 94V66.34C313.9 39.2 292.4 16.48 265.26 16.01C258.684 15.8945 252.152 17.0896 246.043 19.5257C239.934 21.9618 234.372 25.5901 229.68 30.1988C224.989 34.8075 221.262 40.3044 218.718 46.3687C216.173 52.4331 214.862 58.9434 214.86 65.52V94C214.86 94.5304 214.649 95.0391 214.274 95.4142C213.899 95.7893 213.39 96 212.86 96H135.62C125.122 96.0317 115.063 100.216 107.639 107.639C100.216 115.063 96.0317 125.122 96 135.62V206C96 206.53 96.2107 207.039 96.5858 207.414C96.9609 207.789 97.4696 208 98 208H124.91C154.28 208 178.59 233.48 179 262.85C179.42 292.72 155.49 320 125.71 320H98C97.4696 320 96.9609 320.211 96.5858 320.586C96.2107 320.961 96 321.47 96 322V392.38C96.0317 402.878 100.216 412.937 107.639 420.361C115.063 427.784 125.122 431.968 135.62 432H206C206.53 432 207.039 431.789 207.414 431.414C207.789 431.039 208 430.53 208 430V409.07C208 378.79 232.75 352.72 263 352.01C293.1 351.31 320 372.32 320 402.29V430C320 430.53 320.211 431.039 320.586 431.414C320.961 431.789 321.47 432 322 432H393.14C403.446 432 413.331 427.906 420.618 420.618C427.906 413.331 432 403.446 432 393.14V315.14C432 314.61 432.211 314.101 432.586 313.726C432.961 313.351 433.47 313.14 434 313.14H462.48C490.11 313.14 512 290.47 512 262.74C512 235.01 488.8 214.1 461.66 214.1V214.1Z\" stroke=\"currentColor\" stroke-width=\"32\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"
	},
	refresh: {
		viewBox: "0 0 512 512",
		body: "<path d=\"M320 146s24.36-12-64-12a160 160 0 10160 160\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" stroke-width=\"32\"/><path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M256 58l80 80-80 80\"/>"
	},
	"ribbon-outline": {
		viewBox: "0 0 512 512",
		body: "<circle cx=\"256\" cy=\"160\" r=\"128\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path d=\"M143.65 227.82L48 400l86.86-.42a16 16 0 0113.82 7.8L192 480l88.33-194.32\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path d=\"M366.54 224L464 400l-86.86-.42a16 16 0 00-13.82 7.8L320 480l-64-140.8\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><circle cx=\"256\" cy=\"160\" r=\"64\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	search: {
		viewBox: "0 0 512 512",
		body: "<path d=\"M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z\" fill=\"none\" stroke=\"currentColor\" stroke-miterlimit=\"10\" stroke-width=\"32\"/><path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" stroke-width=\"32\" d=\"M338.29 338.29L448 448\"/>"
	},
	send: {
		viewBox: "0 0 512 512",
		body: "<path d=\"M476.59 227.05l-.16-.07L49.35 49.84A23.56 23.56 0 0027.14 52 24.65 24.65 0 0016 72.59v113.29a24 24 0 0019.52 23.57l232.93 43.07a4 4 0 010 7.86L35.53 303.45A24 24 0 0016 327v113.31A23.57 23.57 0 0026.59 460a23.94 23.94 0 0013.22 4 24.55 24.55 0 009.52-1.93L476.4 285.94l.19-.09a32 32 0 000-58.8z\" fill=\"currentColor\"/>"
	},
	settings: {
		viewBox: "0 0 512 512",
		body: "<g stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\"><g transform=\"translate(50.378500, 42.000000)\" stroke=\"currentColor\" stroke-width=\"32\"><path d=\"M211.9115,150.31 C185.005783,147.652748 159.332619,162.189611 147.769706,186.628874 C136.206793,211.068138 141.24875,240.137201 160.366525,259.254975 C179.484299,278.37275 208.553362,283.414707 232.992626,271.851794 C257.431889,260.288881 271.968752,234.615717 269.3115,207.71 C266.263249,177.360931 242.260569,153.358251 211.9115,150.31 L211.9115,150.31 Z M410.9165,277.125 C411.707607,281.564887 410.903766,286.141508 408.647035,290.04607 L372.853966,351.97469 C370.607176,355.862053 367.040281,358.81433 362.8015,360.295 C358.482479,361.803699 353.868429,362.272089 349.334332,361.662103 L320.522752,357.785994 C299.879684,355.00882 279.988607,366.61094 272.243485,385.946453 L261.688643,412.296365 C259.969284,416.588704 257.239668,420.402837 253.7315,423.415 C250.285888,426.373452 245.894629,428 241.353189,428 L169.796876,428 C165.308275,428 160.960823,426.431216 157.5065,423.565 C153.996701,420.652754 151.25415,416.924675 149.518855,412.70702 L138.358864,385.582532 C130.453683,366.368896 110.519057,354.968685 89.9503733,357.89869 L61.8696222,361.898788 C57.3434346,362.543543 52.7286498,362.09476 48.4115003,360.59 C44.1729946,359.112652 40.6059709,356.162306 38.3598585,352.276117 L2.56596537,290.34607 C0.309233973,286.441508 -0.494606827,281.864887 0.296500273,277.425 C1.10103427,272.909758 2.99390287,268.65863 5.81124857,265.039618 L23.4896432,242.330895 C36.4067894,225.738218 36.3997393,202.490855 23.4725314,185.906016 L5.73914207,163.155131 C2.93726987,159.560495 1.06449867,155.330725 0.286500273,150.84 C-0.479118527,146.420732 0.330889273,141.87293 2.57525137,137.989769 L38.3890342,76.0253095 C40.6358245,72.1379474 44.2027191,69.1856702 48.4415003,67.705 C52.7614677,66.1959703 57.3747149,65.7192136 61.9119868,66.3128907 L91.2373143,70.1499486 C111.792442,72.839474 131.546967,61.2195013 139.18365,41.9470371 L149.578712,15.7133384 C151.281675,11.4156234 154.004147,7.5964633 157.5115,4.585 C160.957112,1.6265481 165.348371,0 169.889811,0 L241.446124,0 C245.934725,0 250.282177,1.5687841 253.7365,4.435 C257.245602,7.3466683 259.982278,11.0789954 261.704008,15.3012287 L272.612929,42.053395 C280.490247,61.3711009 300.470109,72.8820729 321.133157,70.007291 L349.370217,66.0787615 C353.899388,65.4486329 358.513486,65.904939 362.8315,67.41 C367.070006,68.8873483 370.637029,71.837694 372.883142,75.7238833 L408.677035,137.65393 C410.933766,141.558492 411.737607,146.135113 410.9465,150.575 C410.140427,155.098876 408.314604,159.379748 405.607548,163.092841 L385.561411,190.588825 C373.755974,206.781577 374.583692,228.954539 387.563545,244.222054 L405.168289,264.929585 C408.130553,268.41394 410.114244,272.622543 410.9165,277.125 Z\"></path></g></g>"
	},
	"shield-checkmark-outline": {
		viewBox: "0 0 512 512",
		body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M336 176L225.2 304 176 255.8\"/><path d=\"M463.1 112.37C373.68 96.33 336.71 84.45 256 48c-80.71 36.45-117.68 48.33-207.1 64.37C32.7 369.13 240.58 457.79 256 464c15.42-6.21 223.3-94.87 207.1-351.63z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	"shield-warning": {
		viewBox: "0 0 512 512",
		body: "<path d=\"M250.26 155.39l5.74 122 5.73-121.95a5.74 5.74 0 00-5.79-6h0a5.74 5.74 0 00-5.68 5.95z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path fill=\"currentColor\" d=\"M256 380.25a20 20 0 1120-20 20 20 0 01-20 20z\"/><path d=\"M463.1 112.37C373.68 96.33 336.71 84.45 256 48c-80.71 36.45-117.68 48.33-207.1 64.37C32.7 369.13 240.58 457.79 256 464c15.42-6.21 223.3-94.87 207.1-351.63z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	"source-code-management": {
		viewBox: "0 0 512 512",
		body: "<circle cx=\"160\" cy=\"96\" r=\"48\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><circle cx=\"160\" cy=\"416\" r=\"48\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M160 368V144\"/><circle cx=\"352\" cy=\"160\" r=\"48\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path d=\"M352 208c0 128-192 48-192 160\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	"status-aborted": {
		viewBox: "0 0 512 512",
		body: "<circle cx=\"256\" cy=\"256\" r=\"230\" fill=\"var(--card-background)\"/><circle cx=\"256\" cy=\"256\" r=\"250\" fill=\"var(--skipped-color)\" opacity=\"var(--status-background-opacity)\" style=\"transition: var(--standard-transition);\"/><circle cx=\"256\" cy=\"256\" r=\"240\" fill=\"none\" stroke=\"var(--skipped-color)\" stroke-width=\"20\" stroke-opacity=\"var(--status-border-opacity)\"/><path fill=\"none\" stroke=\"var(--skipped-color)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M192 320l128-128\"/>"
	},
	"status-blue": {
		viewBox: "0 0 512 512",
		body: "<circle cx=\"256\" cy=\"256\" r=\"230\" fill=\"var(--card-background)\"/><circle cx=\"256\" cy=\"256\" r=\"250\" fill=\"var(--success-color)\" opacity=\"var(--status-background-opacity)\" style=\"transition: var(--standard-transition);\"/><circle cx=\"256\" cy=\"256\" r=\"240\" fill=\"none\" stroke=\"var(--success-color)\" stroke-width=\"20\" stroke-opacity=\"var(--status-border-opacity)\"/><path d=\"M336 189L224 323L176 269.4\" fill=\"transparent\" stroke=\"var(--success-color)\" stroke-width=\"32\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"
	},
	"status-blue-anime": {
		viewBox: "0 0 512 512",
		body: "<circle cx=\"256\" cy=\"256\" r=\"230\" fill=\"var(--card-background)\"/><circle cx=\"256\" cy=\"256\" r=\"250\" fill=\"var(--accent-color)\" opacity=\"var(--status-background-opacity)\" style=\"transition: var(--standard-transition);\"/><circle cx=\"256\" cy=\"256\" r=\"240\" fill=\"none\" stroke=\"var(--accent-color)\" stroke-width=\"20\" stroke-opacity=\"var(--status-border-opacity)\"/><circle cx=\"256\" cy=\"256\" r=\"40\" fill=\"var(--accent-color)\" class=\"app-status-icon-running\"/>"
	},
	"status-nobuilt": {
		viewBox: "0 0 512 512",
		body: "<circle cx=\"256\" cy=\"256\" r=\"230\" fill=\"var(--card-background)\"/><circle cx=\"256\" cy=\"256\" r=\"250\" fill=\"var(--skipped-color)\" opacity=\"var(--status-background-opacity)\" style=\"transition: var(--standard-transition);\"/><circle cx=\"256\" cy=\"256\" r=\"240\" fill=\"none\" stroke=\"var(--skipped-color)\" stroke-width=\"20\" stroke-opacity=\"var(--status-border-opacity)\"/><circle cx=\"256\" cy=\"256\" r=\"30\" fill=\"var(--skipped-color)\"/><circle cx=\"352\" cy=\"256\" r=\"30\" fill=\"var(--skipped-color)\"/><circle cx=\"160\" cy=\"256\" r=\"30\" fill=\"var(--skipped-color)\"/>"
	},
	"status-red": {
		viewBox: "0 0 512 512",
		body: "<circle cx=\"256\" cy=\"256\" r=\"230\" fill=\"var(--card-background)\"/><circle cx=\"256\" cy=\"256\" r=\"250\" fill=\"var(--error-color)\" opacity=\"var(--status-background-opacity)\" style=\"transition: var(--standard-transition);\"/><circle cx=\"256\" cy=\"256\" r=\"240\" fill=\"none\" stroke=\"var(--error-color)\" stroke-width=\"20\" stroke-opacity=\"var(--status-border-opacity)\"/><path fill=\"none\" stroke=\"var(--error-color)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M320 320L192 192M192 320l128-128\"/>"
	},
	"status-yellow": {
		viewBox: "0 0 512 512",
		body: "<circle cx=\"256\" cy=\"256\" r=\"230\" fill=\"var(--card-background)\"/><circle cx=\"256\" cy=\"256\" r=\"250\" fill=\"var(--warning-color)\" opacity=\"var(--status-background-opacity)\" style=\"transition: var(--standard-transition);\"/><circle cx=\"256\" cy=\"256\" r=\"240\" fill=\"none\" stroke=\"var(--warning-color)\" stroke-width=\"20\" stroke-opacity=\"var(--status-border-opacity)\"/><path d=\"M250.26 166.05L256 288l5.73-121.95a5.74 5.74 0 00-5.79-6h0a5.74 5.74 0 00-5.68 6z\" fill=\"none\" stroke=\"var(--warning-color)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><ellipse cx=\"256\" cy=\"350\" rx=\"26\" ry=\"26\" fill=\"var(--warning-color)\"/>"
	},
	stop: {
		viewBox: "0 0 512 512",
		body: "<path d=\"M392 432H120a40 40 0 01-40-40V120a40 40 0 0140-40h272a40 40 0 0140 40v272a40 40 0 01-40 40z\" fill=\"currentColor\"/>"
	},
	"sunny-outline": {
		viewBox: "0 0 512 512",
		body: "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" stroke-width=\"32\" d=\"M256 48v48M256 416v48M403.08 108.92l-33.94 33.94M142.86 369.14l-33.94 33.94M464 256h-48M96 256H48M403.08 403.08l-33.94-33.94M142.86 142.86l-33.94-33.94\"/><circle cx=\"256\" cy=\"256\" r=\"80\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" stroke-width=\"32\"/>"
	},
	terminal: {
		viewBox: "0 0 512 512",
		body: "<rect x=\"32\" y=\"48\" width=\"448\" height=\"416\" rx=\"48\" ry=\"48\" fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M96 112l80 64-80 64M192 240h64\"/>"
	},
	trash: {
		viewBox: "0 0 512 512",
		body: "<path d=\"M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path stroke=\"currentColor\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" stroke-width=\"32\" d=\"M80 112h352\"/><path d=\"M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/>"
	},
	view: {
		viewBox: "0 0 512 512",
		body: "<path d=\"M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><circle cx=\"256\" cy=\"256\" r=\"80\" fill=\"none\" stroke=\"currentColor\" stroke-miterlimit=\"10\" stroke-width=\"32\"/>"
	},
	"warning-outline": {
		viewBox: "0 0 512 512",
		body: "<path d=\"M85.57 446.25h340.86a32 32 0 0028.17-47.17L284.18 82.58c-12.09-22.44-44.27-22.44-56.36 0L57.4 399.08a32 32 0 0028.17 47.17z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path d=\"M250.26 195.39l5.74 122 5.73-121.95a5.74 5.74 0 00-5.79-6h0a5.74 5.74 0 00-5.68 5.95z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\"/><path d=\"M256 397.25a20 20 0 1120-20 20 20 0 01-20 20z\" fill=\"currentColor\"/>"
	}
};
// src/components/icons.tsx
function yi({ name: e, className: t }) {
	let n = vi[e];
	return /* @__PURE__ */ (0, W.jsx)("svg", {
		viewBox: n.viewBox,
		className: t,
		"aria-hidden": "true",
		focusable: "false",
		dangerouslySetInnerHTML: { __html: n.body }
	});
}
function G(e) {
	return function({ className: t }) {
		return /* @__PURE__ */ (0, W.jsx)(yi, {
			name: e,
			className: t
		});
	};
}
var bi = G("add"), xi = G("settings"), Si = G("send"), Ci = G("warning-outline"), wi = G("logo-github"), Ti = G("folder"), Ei = G("edit"), Di = G("trash"), Oi = G("sunny-outline"), ki = G("moon-outline"), Ai = G("refresh"), ji = G("close"), Mi = G("shield-checkmark-outline"), Ni = G("shield-warning"), Pi = G("cloud-outline"), Fi = G("cube-outline"), Ii = G("bulb-outline"), Li = G("chevron-down"), Ri = G("stop"), zi = G("flag-outline"), Bi = G("copy-outline"), Vi = G("check"), Hi = G("attach-outline"), Ui = G("color-palette-outline"), Wi = G("ribbon-outline"), Gi = G("checkmark-circle"), Ki = G("document-text");
function qi({ className: e }) {
	return /* @__PURE__ */ (0, W.jsxs)("svg", {
		viewBox: "0 0 256 256",
		className: `cp-mark ${e ?? ""}`,
		fill: "currentColor",
		"aria-hidden": "true",
		focusable: "false",
		children: [/* @__PURE__ */ (0, W.jsx)("path", {
			className: "cp-mark-ring",
			d: "M193.59 50.71A104 104 0 1 0 193.59 205.29A18 18 0 0 0 169.50 178.53A68 68 0 1 1 169.50 77.47A18 18 0 0 0 193.59 50.71Z"
		}), /* @__PURE__ */ (0, W.jsx)("circle", {
			className: "cp-mark-stage",
			cx: "210",
			cy: "128",
			r: "27"
		})]
	});
}
var Ji = {
	success: "status-blue",
	failure: "status-red",
	unstable: "status-yellow",
	aborted: "status-aborted",
	pending: "status-nobuilt",
	running: "status-blue-anime"
};
function Yi({ state: e, label: t, className: n }) {
	return /* @__PURE__ */ (0, W.jsx)("span", {
		className: `cp-statusicon cp-statusicon-${e} ${n ?? ""}`,
		role: "img",
		"aria-label": t,
		"data-tip": t,
		tabIndex: 0,
		children: /* @__PURE__ */ (0, W.jsx)(yi, { name: Ji[e] })
	});
}
function Xi(e) {
	switch (e) {
		case "SUCCESS": return "success";
		case "FAILURE": return "failure";
		case "UNSTABLE": return "unstable";
		case "ABORTED": return "aborted";
		case "NOT_BUILT": return "pending";
		default: return e ? "pending" : "running";
	}
}
// src/components/toolMeta.ts
var Zi = [
	[/console|log/, {
		icon: "logs",
		activity: "Reading the console log"
	}],
	[/failed_stage|stage/, {
		icon: "hammer",
		activity: "Finding the failed stage"
	}],
	[/validate/, {
		icon: "search",
		activity: "Validating the pipeline"
	}],
	[/pipeline|jenkinsfile/, {
		icon: "terminal",
		activity: "Working on the pipeline"
	}],
	[/change|commit|compare|diff/, {
		icon: "git-compare-outline",
		activity: "Comparing changes"
	}],
	[/pull|pr_/, {
		icon: "git-pull-request-outline",
		activity: "Preparing the pull request"
	}],
	[/branch|repo|scm|github|file/, {
		icon: "git-branch-outline",
		activity: "Reading the repository"
	}],
	[/param/, {
		icon: "parameters",
		activity: "Reading build parameters"
	}],
	[/test/, {
		icon: "document-text",
		activity: "Reading test results"
	}],
	[/node|agent|executor/, {
		icon: "computer",
		activity: "Checking agents"
	}],
	[/plugin/, {
		icon: "plugins",
		activity: "Checking plugins"
	}],
	[/credential|secret/, {
		icon: "key",
		activity: "Checking credentials"
	}],
	[/user|permission|matrix/, {
		icon: "people",
		activity: "Checking access"
	}],
	[/view|dashboard/, {
		icon: "view",
		activity: "Working on views"
	}],
	[/queue/, {
		icon: "jobs",
		activity: "Checking the queue"
	}],
	[/build|job|folder/, {
		icon: "jobs",
		activity: "Inspecting jobs and builds"
	}],
	[/controller|system|version/, {
		icon: "settings",
		activity: "Checking the controller"
	}]
];
function Qi(e) {
	let t = Zi.find(([t]) => t.test(e));
	return t ? t[1] : {
		icon: "hammer",
		activity: `Running ${e}`
	};
}
// src/components/ToolCard.tsx
var K = {
	running: {
		state: "running",
		label: "Running"
	},
	succeeded: {
		state: "success",
		label: "Succeeded"
	},
	failed: {
		state: "failure",
		label: "Failed"
	},
	denied: {
		state: "aborted",
		label: "Denied"
	}
};
function $i({ item: e }) {
	let [t, n] = (0, _.useState)(!1), [r, i] = (0, _.useState)(!1), a = K[e.status], o = String(e.args.job ?? e.args.environment ?? e.args.repoUrl ?? e.args.node ?? "");
	return /* @__PURE__ */ (0, W.jsxs)("div", {
		className: `cp-tool cp-tool-${e.status} ${t ? "cp-tool-open" : ""}`,
		children: [/* @__PURE__ */ (0, W.jsxs)("div", {
			className: "cp-tool-head",
			children: [/* @__PURE__ */ (0, W.jsx)(Yi, {
				state: a.state,
				label: a.label,
				className: "cp-tool-status"
			}), /* @__PURE__ */ (0, W.jsxs)("button", {
				type: "button",
				className: "cp-tool-toggle",
				"aria-expanded": t,
				onClick: () => {
					i(!0), n((e) => !e);
				},
				children: [
					/* @__PURE__ */ (0, W.jsx)(yi, {
						name: Qi(e.toolName).icon,
						className: "cp-tool-icon"
					}),
					/* @__PURE__ */ (0, W.jsx)("span", {
						className: "cp-tool-name",
						children: e.toolName
					}),
					o && /* @__PURE__ */ (0, W.jsx)("span", {
						className: "cp-tool-target",
						children: o
					}),
					/* @__PURE__ */ (0, W.jsx)(Li, { className: "cp-tool-chevron" })
				]
			})]
		}), /* @__PURE__ */ (0, W.jsx)("div", {
			className: `cp-fold ${t ? "cp-fold-open" : ""}`,
			children: /* @__PURE__ */ (0, W.jsx)("div", {
				className: "cp-fold-inner",
				children: r && /* @__PURE__ */ (0, W.jsxs)("div", {
					className: "cp-tool-body",
					children: [
						/* @__PURE__ */ (0, W.jsxs)("div", { children: [/* @__PURE__ */ (0, W.jsx)("div", {
							className: "cp-label",
							children: "Arguments"
						}), /* @__PURE__ */ (0, W.jsx)("pre", {
							className: "cp-pre",
							children: JSON.stringify(e.args, null, 2)
						})] }),
						e.error && /* @__PURE__ */ (0, W.jsxs)("div", { children: [/* @__PURE__ */ (0, W.jsx)("div", {
							className: "cp-label",
							children: "Error"
						}), /* @__PURE__ */ (0, W.jsx)("pre", {
							className: "cp-pre",
							children: e.error
						})] }),
						e.output !== void 0 && e.output !== null && /* @__PURE__ */ (0, W.jsxs)("div", { children: [/* @__PURE__ */ (0, W.jsx)("div", {
							className: "cp-label",
							children: "Result"
						}), /* @__PURE__ */ (0, W.jsx)("pre", {
							className: "cp-pre",
							children: ea(e.output)
						})] }),
						e.risk !== void 0 && /* @__PURE__ */ (0, W.jsxs)("div", {
							className: "cp-label",
							children: [
								"Risk level ",
								e.risk,
								e.reason ? ` · ${e.reason}` : ""
							]
						})
					]
				})
			})
		})]
	});
}
function ea(e) {
	let t = typeof e == "string" ? e : JSON.stringify(e, null, 2);
	return t.length > 8e3 ? `${t.slice(0, 8e3)}\n…[truncated]` : t;
}
// src/components/DiffView.tsx
function ta({ diff: e }) {
	let t = e.split("\n").slice(0, 500);
	return /* @__PURE__ */ (0, W.jsxs)("div", {
		className: "cp-diff",
		children: [/* @__PURE__ */ (0, W.jsxs)("div", {
			className: "cp-diff-head",
			children: [
				/* @__PURE__ */ (0, W.jsx)("span", { children: "proposed change" }),
				/* @__PURE__ */ (0, W.jsx)("span", { className: "cp-grow" }),
				/* @__PURE__ */ (0, W.jsxs)("span", { children: [e.split("\n").length, " lines"] })
			]
		}), /* @__PURE__ */ (0, W.jsx)("pre", { children: t.map((e, t) => {
			let n = "cp-line";
			return e.startsWith("+") && !e.startsWith("+++") ? n += " cp-add" : e.startsWith("-") && !e.startsWith("---") ? n += " cp-del" : e.startsWith("@@") && (n += " cp-hunk"), /* @__PURE__ */ (0, W.jsx)("span", {
				className: n,
				children: e || " "
			}, t);
		}) })]
	});
}
// src/components/ApprovalCard.tsx
function na({ item: e, onDecide: t }) {
	let [n, r] = (0, _.useState)(""), [i, a] = (0, _.useState)(!1), o = (0, _.useRef)(null), s = e.status !== "pending";
	(0, _.useEffect)(() => {
		if (s) return;
		let e = o.current;
		if (!e) return;
		let t = () => {
			let t = e.closest(".cp-thread");
			if (!t) return;
			let n = e.getBoundingClientRect(), r = t.getBoundingClientRect();
			t.scrollTop = Math.max(0, t.scrollTop + n.top - r.top - 8);
		};
		t();
		let n = window.requestAnimationFrame(t);
		return () => window.cancelAnimationFrame(n);
	}, [s, e.approvalId]);
	let c = e.risk >= 3 ? "cp-risk3" : "", l = e.validation, u = e.target ?? String(e.args.job ?? e.args.environment ?? "");
	return /* @__PURE__ */ (0, W.jsxs)("div", {
		className: `cp-approval ${c} ${s ? `cp-approval-${e.status}` : ""}`,
		ref: o,
		children: [/* @__PURE__ */ (0, W.jsxs)("div", {
			className: "cp-approval-head",
			children: [/* @__PURE__ */ (0, W.jsx)("span", {
				className: "cp-approval-title",
				children: s ? `Change ${e.status}` : "Approval required"
			}), /* @__PURE__ */ (0, W.jsxs)("span", {
				className: `cp-risk ${e.risk >= 3 ? "cp-r3" : "cp-r2"}`,
				role: "img",
				tabIndex: 0,
				"aria-label": e.risk >= 3 ? "Privileged action" : "Controlled action",
				"data-tip": e.risk >= 3 ? "Privileged action (level 3)" : "Controlled action (level 2)",
				children: [/* @__PURE__ */ (0, W.jsx)(Ni, {}), /* @__PURE__ */ (0, W.jsx)("span", {
					className: "cp-sr",
					children: e.risk >= 3 ? "privileged" : "controlled"
				})]
			})]
		}), /* @__PURE__ */ (0, W.jsxs)("div", {
			className: "cp-approval-body",
			children: [
				/* @__PURE__ */ (0, W.jsxs)("dl", {
					className: "cp-kv",
					children: [
						/* @__PURE__ */ (0, W.jsx)("dt", { children: "Action" }),
						/* @__PURE__ */ (0, W.jsx)("dd", { children: e.toolName }),
						u && /* @__PURE__ */ (0, W.jsxs)(W.Fragment, { children: [/* @__PURE__ */ (0, W.jsx)("dt", { children: "Target" }), /* @__PURE__ */ (0, W.jsx)("dd", { children: u })] }),
						/* @__PURE__ */ (0, W.jsx)("dt", { children: "Why" }),
						/* @__PURE__ */ (0, W.jsx)("dd", {
							style: { fontFamily: "var(--cp-sans)" },
							children: e.reason
						}),
						/* @__PURE__ */ (0, W.jsx)("dt", { children: "Expires" }),
						/* @__PURE__ */ (0, W.jsx)("dd", { children: new Date(e.expiresAt).toLocaleString() })
					]
				}),
				l && /* @__PURE__ */ (0, W.jsxs)("div", {
					className: `cp-validation ${l.validated ? "cp-ok" : "cp-bad"}`,
					children: [/* @__PURE__ */ (0, W.jsx)(Yi, {
						state: l.validated ? "success" : "failure",
						label: l.validated ? "Validation passed" : "Validation failed"
					}), /* @__PURE__ */ (0, W.jsx)("span", { children: l.validated ? `Jenkinsfile validated (${l.kind ?? "declarative"})` : `Validation failed: ${(l.errors ?? []).slice(0, 2).join("; ")}` })]
				}),
				e.diff && /* @__PURE__ */ (0, W.jsxs)(W.Fragment, { children: [/* @__PURE__ */ (0, W.jsxs)("button", {
					type: "button",
					className: `cp-disclose ${i ? "cp-disclose-open" : ""}`,
					"aria-expanded": i,
					onClick: () => a((e) => !e),
					children: [/* @__PURE__ */ (0, W.jsx)(Li, {}), i ? "Hide diff" : "Review diff"]
				}), /* @__PURE__ */ (0, W.jsx)("div", {
					className: `cp-fold ${i ? "cp-fold-open" : ""}`,
					children: /* @__PURE__ */ (0, W.jsx)("div", {
						className: "cp-fold-inner",
						children: i && /* @__PURE__ */ (0, W.jsx)(ta, { diff: e.diff })
					})
				})] }),
				!i && /* @__PURE__ */ (0, W.jsxs)("details", { children: [/* @__PURE__ */ (0, W.jsx)("summary", {
					className: "cp-label",
					style: { cursor: "pointer" },
					children: "Arguments"
				}), /* @__PURE__ */ (0, W.jsx)("pre", {
					className: "cp-pre",
					children: JSON.stringify(e.args, null, 2)
				})] }),
				!s && /* @__PURE__ */ (0, W.jsxs)(W.Fragment, { children: [/* @__PURE__ */ (0, W.jsx)("input", {
					className: "cp-input",
					placeholder: "Optional comment for the audit trail",
					value: n,
					maxLength: 2e3,
					onChange: (e) => r(e.target.value)
				}), /* @__PURE__ */ (0, W.jsxs)("div", {
					className: "cp-actions",
					children: [/* @__PURE__ */ (0, W.jsx)("button", {
						type: "button",
						className: "cp-btn cp-primary",
						onClick: () => t(e, !0, n),
						children: "Approve and run"
					}), /* @__PURE__ */ (0, W.jsx)("button", {
						type: "button",
						className: "cp-btn cp-danger",
						onClick: () => t(e, !1, n),
						children: "Reject"
					})]
				})] })
			]
		})]
	});
}
// src/components/ApprovalDock.tsx
function ra({ approvals: e, onDecide: t }) {
	let n = e[0];
	return n ? /* @__PURE__ */ (0, W.jsxs)("div", {
		className: `cp-approval-dock ${n.risk >= 3 ? "cp-approval-dock-risk3" : ""}`,
		children: [/* @__PURE__ */ (0, W.jsxs)("div", {
			className: "cp-approval-dock-main",
			children: [/* @__PURE__ */ (0, W.jsx)(zi, {}), /* @__PURE__ */ (0, W.jsxs)("div", {
				className: "cp-approval-dock-text",
				children: [/* @__PURE__ */ (0, W.jsx)("div", {
					className: "cp-approval-dock-title",
					children: e.length > 1 ? `${e.length} approvals pending` : "Approval required"
				}), /* @__PURE__ */ (0, W.jsxs)("div", {
					className: "cp-approval-dock-meta",
					children: [n.toolName, n.target ? ` · ${n.target}` : ""]
				})]
			})]
		}), /* @__PURE__ */ (0, W.jsxs)("div", {
			className: "cp-approval-dock-actions",
			children: [/* @__PURE__ */ (0, W.jsx)("button", {
				type: "button",
				className: "cp-btn cp-primary cp-btn-sm",
				onClick: () => t(n, !0, ""),
				children: "Approve"
			}), /* @__PURE__ */ (0, W.jsx)("button", {
				type: "button",
				className: "cp-btn cp-danger cp-btn-sm",
				onClick: () => t(n, !1, ""),
				children: "Reject"
			})]
		})]
	}) : null;
}
// src/components/ReasoningPanel.tsx
function ia({ item: e }) {
	let [t, n] = (0, _.useState)(!e.done), r = (0, _.useRef)(Date.now()), [i, a] = (0, _.useState)(null), o = (0, _.useRef)(null);
	return (0, _.useEffect)(() => {
		e.done && (n(!1), a(Math.max(1, Math.round((Date.now() - r.current) / 1e3))));
	}, [e.done]), (0, _.useEffect)(() => {
		let t = o.current;
		t && !e.done && (t.scrollTop = t.scrollHeight, t.classList.toggle("cp-reasoning-clipped", t.scrollHeight > t.clientHeight));
	}, [e.text, e.done]), /* @__PURE__ */ (0, W.jsxs)("div", {
		className: `cp-reasoning ${t ? "cp-reasoning-open" : ""} ${e.done ? "" : "cp-reasoning-live"}`,
		children: [/* @__PURE__ */ (0, W.jsxs)("button", {
			type: "button",
			className: "cp-reasoning-head",
			"aria-expanded": t,
			onClick: () => n((e) => !e),
			children: [
				/* @__PURE__ */ (0, W.jsx)(qi, { className: e.done ? "cp-mark-still" : "cp-mark-busy" }),
				e.done ? /* @__PURE__ */ (0, W.jsx)("span", {
					className: "cp-reasoning-title",
					children: i ? `Thought for ${i}s` : "Thought process"
				}) : /* @__PURE__ */ (0, W.jsx)("span", {
					className: "cp-shimmer cp-reasoning-title",
					children: "Thinking…"
				}),
				/* @__PURE__ */ (0, W.jsx)(Li, { className: "cp-reasoning-chevron" })
			]
		}), /* @__PURE__ */ (0, W.jsx)("div", {
			className: `cp-fold ${t ? "cp-fold-open" : ""}`,
			children: /* @__PURE__ */ (0, W.jsx)("div", {
				className: "cp-fold-inner",
				children: /* @__PURE__ */ (0, W.jsx)("div", {
					className: "cp-reasoning-body",
					ref: o,
					children: e.text
				})
			})
		})]
	});
}
// src/components/CopyButton.tsx
async function aa(e) {
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(e);
		return;
	}
	let t = document.createElement("textarea");
	t.value = e, t.setAttribute("readonly", ""), t.style.position = "fixed", t.style.opacity = "0", document.body.appendChild(t), t.select();
	let n = document.execCommand("copy");
	if (t.remove(), !n) throw Error("Clipboard is not available");
}
function oa({ text: e, label: t = "Copy response" }) {
	let [n, r] = (0, _.useState)("idle"), i = (0, _.useRef)(null);
	(0, _.useEffect)(() => () => {
		i.current !== null && window.clearTimeout(i.current);
	}, []);
	let a = async () => {
		try {
			await aa(e), r("copied");
		} catch {
			r("failed");
		}
		i.current !== null && window.clearTimeout(i.current), i.current = window.setTimeout(() => r("idle"), 1400);
	};
	return /* @__PURE__ */ (0, W.jsx)("button", {
		type: "button",
		className: `cp-copy-btn ${n === "copied" ? "cp-copy-btn-done" : ""}`,
		"data-tip": n === "failed" ? "Could not copy" : t,
		"aria-label": n === "copied" ? "Copied" : n === "failed" ? "Could not copy" : t,
		onClick: () => void a(),
		disabled: !e.trim(),
		children: n === "copied" ? /* @__PURE__ */ (0, W.jsx)(Vi, {}) : /* @__PURE__ */ (0, W.jsx)(Bi, {})
	});
}
// src/components/Menu.tsx
var sa = m();
function ca() {
	let e = document.getElementById("jenkins-ai-copilot-root")?.shadowRoot;
	if (!e) return null;
	let t = e.getElementById("cp-portal");
	return t || (t = document.createElement("div"), t.id = "cp-portal", t.className = "cp-portal-root", e.appendChild(t)), t;
}
function la({ open: e, anchor: t, onClose: n, children: r, width: i = 300, maxHeight: a = 380, align: o = "end" }) {
	let s = (0, _.useRef)(null), [c, l] = (0, _.useState)({
		left: -9999,
		top: -9999,
		width: i
	}), u = (0, _.useCallback)(() => {
		let e = s.current;
		if (!t || !e) return;
		let n = t.getBoundingClientRect(), r = Math.min(Math.max(i, 220), window.innerWidth - 16), c = o === "end" ? n.right - r : n.left;
		c = Math.min(Math.max(c, 8), window.innerWidth - r - 8);
		let u = Math.min(e.offsetHeight, a), d = n.bottom + 6;
		d + u > window.innerHeight - 8 && (d = Math.max(8, n.top - u - 6)), l((e) => e.left === c && e.top === d && e.width === r ? e : {
			left: c,
			top: d,
			width: r
		});
	}, [
		o,
		t,
		a,
		i
	]);
	if ((0, _.useLayoutEffect)(() => {
		e && u();
	}, [e, u]), (0, _.useEffect)(() => {
		if (!e) return;
		let t = s.current;
		if (!t || typeof ResizeObserver > "u") return;
		let n = new ResizeObserver(() => u());
		return n.observe(t), () => n.disconnect();
	}, [e, u]), (0, _.useEffect)(() => {
		if (!e) return;
		let r = (e) => {
			let r = e.composedPath?.() ?? [];
			r.includes(s.current) || r.includes(t) || n();
		}, i = (e) => {
			e.key === "Escape" && (e.preventDefault(), n());
		}, a = (e) => {
			(e.composedPath?.() ?? []).includes(s.current) || n();
		}, o = () => n();
		return window.addEventListener("pointerdown", r, !0), window.addEventListener("keydown", i), window.addEventListener("scroll", a, !0), window.addEventListener("resize", o), () => {
			window.removeEventListener("pointerdown", r, !0), window.removeEventListener("keydown", i), window.removeEventListener("scroll", a, !0), window.removeEventListener("resize", o);
		};
	}, [
		e,
		t,
		n
	]), !e) return null;
	let d = ca();
	return d ? (0, sa.createPortal)(/* @__PURE__ */ (0, W.jsx)("div", {
		ref: s,
		className: "cp-menu",
		style: {
			position: "fixed",
			left: c.left,
			top: c.top,
			width: c.width,
			maxHeight: a,
			zIndex: 2147483002
		},
		onPointerDown: (e) => e.stopPropagation(),
		children: r
	}), d) : null;
}
// src/components/Pickers.tsx
var ua = [
	{
		value: "AUTO",
		label: "Auto",
		description: "Let the model decide"
	},
	{
		value: "OFF",
		label: "Off",
		description: "No extended reasoning"
	},
	{
		value: "LOW",
		label: "Low",
		description: "Fast reasoning"
	},
	{
		value: "MEDIUM",
		label: "Medium",
		description: "Balanced reasoning"
	},
	{
		value: "HIGH",
		label: "High",
		description: "Deep reasoning"
	}
];
function da({ icon: e, value: t, title: n, muted: r, kind: i, onClick: a, active: o }) {
	let s = (0, _.useRef)(null);
	return /* @__PURE__ */ (0, W.jsxs)("button", {
		ref: s,
		type: "button",
		className: `cp-pill ${i ? `cp-pill-${i}` : ""} ${o ? "cp-pill-active" : ""}`,
		"data-tip": n,
		"aria-label": n ? `${n}: ${t}` : t,
		onClick: () => s.current && a(s.current),
		children: [
			/* @__PURE__ */ (0, W.jsx)("span", {
				className: "cp-pill-icon",
				children: e
			}),
			/* @__PURE__ */ (0, W.jsx)("span", {
				className: `cp-pill-value ${r ? "cp-pill-muted" : ""}`,
				children: t
			}),
			/* @__PURE__ */ (0, W.jsx)(Li, { className: "cp-pill-chevron" })
		]
	});
}
function fa({ accounts: e, value: t, onSelect: n }) {
	let [r, i] = (0, _.useState)(!1), [a, o] = (0, _.useState)(null), s = e.find((e) => e.id === t) ?? e[0];
	return /* @__PURE__ */ (0, W.jsxs)(W.Fragment, { children: [/* @__PURE__ */ (0, W.jsx)(da, {
		icon: /* @__PURE__ */ (0, W.jsx)(Pi, {}),
		value: s ? s.label : "No provider",
		title: "Provider",
		kind: "provider",
		muted: !s,
		active: r,
		onClick: (e) => {
			o(e), i((e) => !e);
		}
	}), /* @__PURE__ */ (0, W.jsxs)(la, {
		open: r,
		anchor: a,
		onClose: () => i(!1),
		width: 260,
		children: [
			/* @__PURE__ */ (0, W.jsx)("div", {
				className: "cp-menu-label",
				children: "Provider accounts"
			}),
			e.length === 0 && /* @__PURE__ */ (0, W.jsx)("div", {
				className: "cp-menu-empty",
				children: "No providers configured"
			}),
			e.map((e) => /* @__PURE__ */ (0, W.jsxs)("button", {
				type: "button",
				className: `cp-menu-item ${e.id === s?.id ? "cp-menu-item-selected" : ""}`,
				onClick: () => {
					n(e), i(!1);
				},
				children: [
					/* @__PURE__ */ (0, W.jsx)(Pi, { className: "cp-menu-item-icon" }),
					/* @__PURE__ */ (0, W.jsxs)("span", {
						className: "cp-menu-item-main",
						children: [/* @__PURE__ */ (0, W.jsx)("span", {
							className: "cp-menu-item-title",
							children: e.label
						}), /* @__PURE__ */ (0, W.jsxs)("span", {
							className: "cp-menu-item-meta",
							children: [e.providerLabel, e.default ? " · default" : ""]
						})]
					}),
					e.id === s?.id && /* @__PURE__ */ (0, W.jsx)(Vi, { className: "cp-menu-check" })
				]
			}, e.id))
		]
	})] });
}
function pa({ accounts: e, accountId: t, model: n, models: r, onOpen: i, onSelect: a, onRefresh: o }) {
	let [s, c] = (0, _.useState)(!1), [l, u] = (0, _.useState)(null), [d, f] = (0, _.useState)(""), [p, m] = (0, _.useState)(0), h = (0, _.useRef)(null), g = (0, _.useRef)(e), v = (0, _.useRef)(r), y = (0, _.useRef)(i);
	g.current = e, v.current = r, y.current = i, (0, _.useEffect)(() => {
		if (!s) return;
		f(""), m(0);
		for (let e of g.current) {
			let t = v.current[e.id];
			(!t || t === "loading" || "error" in t) && y.current(e.id);
		}
		let e = window.setTimeout(() => h.current?.focus(), 20);
		return () => window.clearTimeout(e);
	}, [s]);
	let b = (0, _.useMemo)(() => {
		let t = d.trim().toLowerCase(), n = [];
		for (let i of e) {
			let e = r[i.id];
			if (Array.isArray(e)) for (let r of e) (!t || r.id.toLowerCase().includes(t) || r.label.toLowerCase().includes(t) || i.label.toLowerCase().includes(t)) && n.push({
				account: i,
				model: r
			});
		}
		return n;
	}, [
		e,
		r,
		d
	]);
	(0, _.useEffect)(() => {
		m((e) => Math.min(e, Math.max(0, b.length - 1)));
	}, [b.length]);
	let x = e.find((e) => e.id === t), S = b.find((e) => e.model.id === n && e.account.id === t)?.model.label ?? n, C = S || "Select model", w = (e, t) => {
		a(e.id, t.id), c(!1);
	};
	return /* @__PURE__ */ (0, W.jsxs)(W.Fragment, { children: [/* @__PURE__ */ (0, W.jsx)(da, {
		icon: /* @__PURE__ */ (0, W.jsx)(Fi, {}),
		value: C,
		title: x ? `Model · ${x.label}` : "Model",
		muted: !S,
		active: s,
		onClick: (e) => {
			u(e), c((e) => !e);
		}
	}), /* @__PURE__ */ (0, W.jsxs)(la, {
		open: s,
		anchor: l,
		onClose: () => c(!1),
		width: 340,
		maxHeight: 420,
		children: [/* @__PURE__ */ (0, W.jsxs)("div", {
			className: "cp-menu-search",
			children: [/* @__PURE__ */ (0, W.jsx)("input", {
				ref: h,
				value: d,
				placeholder: "Search models or providers…",
				onChange: (e) => f(e.target.value),
				onKeyDown: (e) => {
					if (e.key === "ArrowDown") e.preventDefault(), m((e) => Math.min(e + 1, b.length - 1));
					else if (e.key === "ArrowUp") e.preventDefault(), m((e) => Math.max(e - 1, 0));
					else if (e.key === "Enter") {
						e.preventDefault();
						let t = b[p];
						t && w(t.account, t.model);
					}
				}
			}), /* @__PURE__ */ (0, W.jsx)("button", {
				type: "button",
				className: "cp-menu-refresh",
				"data-tip": "Refresh models",
				"aria-label": "Refresh models",
				onClick: o,
				children: /* @__PURE__ */ (0, W.jsx)(Ai, {})
			})]
		}), /* @__PURE__ */ (0, W.jsxs)("div", {
			className: "cp-menu-scroll",
			role: "listbox",
			"aria-label": "Models",
			children: [e.map((e) => {
				let i = r[e.id], a = b.filter((t) => t.account.id === e.id);
				return d.trim() && a.length === 0 ? null : /* @__PURE__ */ (0, W.jsxs)("div", {
					className: "cp-menu-group",
					children: [
						/* @__PURE__ */ (0, W.jsxs)("div", {
							className: "cp-menu-label",
							children: [/* @__PURE__ */ (0, W.jsx)("span", { children: e.label }), /* @__PURE__ */ (0, W.jsx)("span", {
								className: "cp-menu-label-meta",
								children: e.providerLabel
							})]
						}),
						i === "loading" && /* @__PURE__ */ (0, W.jsx)("div", {
							className: "cp-menu-empty",
							children: "Loading models…"
						}),
						i && i !== "loading" && "error" in i && /* @__PURE__ */ (0, W.jsx)("div", {
							className: "cp-menu-empty cp-menu-error",
							children: i.error
						}),
						Array.isArray(i) && a.length === 0 && d.trim() === "" && /* @__PURE__ */ (0, W.jsx)("div", {
							className: "cp-menu-empty",
							children: "No models returned"
						}),
						a.map((e) => {
							let r = b.findIndex((t) => t.account.id === e.account.id && t.model.id === e.model.id), i = e.account.id === t && e.model.id === n;
							return /* @__PURE__ */ (0, W.jsxs)("button", {
								type: "button",
								role: "option",
								"aria-selected": i,
								className: `cp-menu-item ${i ? "cp-menu-item-selected" : ""} ${r === p ? "cp-menu-item-active" : ""}`,
								onMouseEnter: () => m(r),
								onClick: () => w(e.account, e.model),
								children: [
									/* @__PURE__ */ (0, W.jsx)(Fi, { className: "cp-menu-item-icon" }),
									/* @__PURE__ */ (0, W.jsxs)("span", {
										className: "cp-menu-item-main",
										children: [/* @__PURE__ */ (0, W.jsx)("span", {
											className: "cp-menu-item-title",
											children: e.model.label || e.model.id
										}), e.model.label && e.model.label !== e.model.id && /* @__PURE__ */ (0, W.jsx)("span", {
											className: "cp-menu-item-meta",
											children: e.model.id
										})]
									}),
									i && /* @__PURE__ */ (0, W.jsx)(Vi, { className: "cp-menu-check" })
								]
							}, `${e.account.id}-${e.model.id}`);
						})
					]
				}, e.id);
			}), b.length === 0 && !e.some((e) => r[e.id] === "loading") && /* @__PURE__ */ (0, W.jsx)("div", {
				className: "cp-menu-empty",
				children: "No matching models"
			})]
		})]
	})] });
}
function ma({ value: e, onChange: t }) {
	let [n, r] = (0, _.useState)(!1), [i, a] = (0, _.useState)(null), o = ua.find((t) => t.value === e) ?? ua[0];
	return /* @__PURE__ */ (0, W.jsxs)(W.Fragment, { children: [/* @__PURE__ */ (0, W.jsx)(da, {
		icon: /* @__PURE__ */ (0, W.jsx)(Ii, {}),
		value: o.label,
		title: "Thinking",
		kind: "thinking",
		active: n,
		onClick: (e) => {
			a(e), r((e) => !e);
		}
	}), /* @__PURE__ */ (0, W.jsxs)(la, {
		open: n,
		anchor: i,
		onClose: () => r(!1),
		width: 230,
		children: [/* @__PURE__ */ (0, W.jsx)("div", {
			className: "cp-menu-label",
			children: "Thinking"
		}), ua.map((n) => /* @__PURE__ */ (0, W.jsxs)("button", {
			type: "button",
			className: `cp-menu-item ${n.value === e ? "cp-menu-item-selected" : ""}`,
			onClick: () => {
				t(n.value), r(!1);
			},
			children: [/* @__PURE__ */ (0, W.jsxs)("span", {
				className: "cp-menu-item-main",
				children: [/* @__PURE__ */ (0, W.jsx)("span", {
					className: "cp-menu-item-title",
					children: n.label
				}), /* @__PURE__ */ (0, W.jsx)("span", {
					className: "cp-menu-item-meta",
					children: n.description
				})]
			}), n.value === e && /* @__PURE__ */ (0, W.jsx)(Vi, { className: "cp-menu-check" })]
		}, n.value))]
	})] });
}
function ha({ value: e, options: t, placeholder: n, onSelect: r, icon: i, title: a }) {
	let [o, s] = (0, _.useState)(!1), [c, l] = (0, _.useState)(null), u = t.find((t) => t.value === e);
	return /* @__PURE__ */ (0, W.jsxs)(W.Fragment, { children: [/* @__PURE__ */ (0, W.jsx)(da, {
		icon: i ?? /* @__PURE__ */ (0, W.jsx)(Fi, {}),
		value: u?.label ?? n,
		title: a,
		muted: !u,
		active: o,
		onClick: (e) => {
			l(e), s((e) => !e);
		}
	}), /* @__PURE__ */ (0, W.jsx)(la, {
		open: o,
		anchor: c,
		onClose: () => s(!1),
		width: 280,
		children: t.map((t) => /* @__PURE__ */ (0, W.jsxs)("button", {
			type: "button",
			className: `cp-menu-item ${t.value === e ? "cp-menu-item-selected" : ""}`,
			onClick: () => {
				r(t.value), s(!1);
			},
			children: [/* @__PURE__ */ (0, W.jsxs)("span", {
				className: "cp-menu-item-main",
				children: [/* @__PURE__ */ (0, W.jsx)("span", {
					className: "cp-menu-item-title",
					children: t.label
				}), t.description && /* @__PURE__ */ (0, W.jsx)("span", {
					className: "cp-menu-item-meta",
					children: t.description
				})]
			}), t.value === e && /* @__PURE__ */ (0, W.jsx)(Vi, { className: "cp-menu-check" })]
		}, t.value))
	})] });
}
// src/components/ConfirmDialog.tsx
function ga() {
	let e = document.getElementById("jenkins-ai-copilot-root")?.shadowRoot;
	if (!e) return null;
	let t = e.getElementById("cp-portal");
	return t || (t = document.createElement("div"), t.id = "cp-portal", t.className = "cp-portal-root", e.appendChild(t)), t;
}
function _a({ open: e, title: t, message: n, confirmLabel: r = "Delete", onCancel: i, onConfirm: a }) {
	let o = (0, _.useRef)(null);
	if ((0, _.useEffect)(() => {
		if (!e) return;
		o.current?.focus();
		let t = (e) => {
			e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), i());
		};
		return window.addEventListener("keydown", t, !0), () => window.removeEventListener("keydown", t, !0);
	}, [i, e]), !e) return null;
	let s = ga();
	return s ? (0, sa.createPortal)(/* @__PURE__ */ (0, W.jsx)("div", {
		className: "cp-confirm-backdrop",
		onPointerDown: (e) => {
			e.target === e.currentTarget && i();
		},
		children: /* @__PURE__ */ (0, W.jsxs)("div", {
			className: "cp-confirm",
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "cp-confirm-title",
			children: [
				/* @__PURE__ */ (0, W.jsx)("h3", {
					id: "cp-confirm-title",
					children: t
				}),
				/* @__PURE__ */ (0, W.jsx)("p", { children: n }),
				/* @__PURE__ */ (0, W.jsxs)("div", {
					className: "cp-confirm-actions",
					children: [/* @__PURE__ */ (0, W.jsx)("button", {
						type: "button",
						className: "cp-btn",
						onClick: i,
						children: "Cancel"
					}), /* @__PURE__ */ (0, W.jsx)("button", {
						ref: o,
						type: "button",
						className: "cp-btn cp-danger",
						onClick: a,
						children: r
					})]
				})
			]
		})
	}), s) : null;
}
// src/components/SkillsPanel.tsx
function va() {
	return {
		name: "",
		kind: "pipeline-create",
		description: "",
		whenToUse: "",
		tags: "",
		sourceJobs: "",
		body: "",
		enabled: !0
	};
}
function ya(e) {
	return {
		id: e.id,
		name: e.name,
		kind: e.kind,
		description: e.description,
		whenToUse: e.whenToUse,
		tags: e.tags.join(", "),
		sourceJobs: e.sourceJobs.join(", "),
		body: e.body,
		enabled: e.enabled
	};
}
function ba(e) {
	return e.split(",").map((e) => e.trim()).filter(Boolean);
}
function xa({ isAdmin: e, onStartDraft: t }) {
	let [n, r] = (0, _.useState)([]), [i, a] = (0, _.useState)(!0), [o, s] = (0, _.useState)(null), [c, l] = (0, _.useState)(null), [u, d] = (0, _.useState)(!1), [f, p] = (0, _.useState)(null), [m, h] = (0, _.useState)("Create a declarative pipeline"), [g, v] = (0, _.useState)(""), [y, b] = (0, _.useState)(25), x = async () => {
		try {
			let e = await he();
			r(e.skills ?? []), s(null);
		} catch (e) {
			s(e instanceof Error ? e.message : "Could not load skills");
		} finally {
			a(!1);
		}
	};
	(0, _.useEffect)(() => {
		e ? x() : a(!1);
	}, [e]);
	let S = async () => {
		if (!c) return;
		if (!c.name.trim() || !c.body.trim()) {
			s("Name and body are required");
			return;
		}
		d(!0), s(null);
		let e = {
			...c.id ? { id: c.id } : {},
			name: c.name.trim(),
			kind: c.kind.trim() || "general",
			description: c.description.trim(),
			whenToUse: c.whenToUse.trim(),
			body: c.body,
			tags: ba(c.tags),
			sourceJobs: ba(c.sourceJobs),
			enabled: c.enabled
		};
		try {
			let t = await ge(e);
			r(t.skills ?? []), l(null);
		} catch (e) {
			s(e instanceof Error ? e.message : "Could not save the skill");
		} finally {
			d(!1);
		}
	}, C = async (e) => {
		try {
			let t = await ve(e.slug, !e.enabled);
			r(t.skills ?? []);
		} catch (e) {
			s(e instanceof Error ? e.message : "Could not change skill state");
		}
	};
	return /* @__PURE__ */ (0, W.jsxs)("section", {
		className: "cp-settings-section cp-skills",
		children: [
			/* @__PURE__ */ (0, W.jsxs)("div", {
				className: "cp-settings-section-head",
				children: [/* @__PURE__ */ (0, W.jsxs)("div", { children: [/* @__PURE__ */ (0, W.jsx)("h3", { children: "Skills" }), /* @__PURE__ */ (0, W.jsx)("p", { children: "Reusable procedures the assistant loads on demand. The catalogue costs a few lines; the full body is fetched only when a skill matches." })] }), e && !c && /* @__PURE__ */ (0, W.jsx)("button", {
					type: "button",
					className: "cp-btn cp-primary",
					onClick: () => l(va()),
					children: "Add skill"
				})]
			}),
			!e && /* @__PURE__ */ (0, W.jsx)("div", {
				className: "cp-settings-note",
				children: "Only administrators can manage skills."
			}),
			o && /* @__PURE__ */ (0, W.jsx)("div", {
				className: "cp-errline",
				children: o
			}),
			e && /* @__PURE__ */ (0, W.jsxs)("div", {
				className: "cp-skill-draft",
				children: [
					/* @__PURE__ */ (0, W.jsxs)("div", {
						className: "cp-skill-draft-head",
						children: [/* @__PURE__ */ (0, W.jsx)(Wi, {}), /* @__PURE__ */ (0, W.jsx)("strong", { children: "Draft a skill from pipelines" })]
					}),
					/* @__PURE__ */ (0, W.jsx)("p", { children: "Copilot scans pipeline structure, distils the repeated pattern, and proposes a skill for approval." }),
					/* @__PURE__ */ (0, W.jsxs)("div", {
						className: "cp-skill-draft-fields",
						children: [
							/* @__PURE__ */ (0, W.jsxs)("label", {
								className: "cp-field",
								children: [/* @__PURE__ */ (0, W.jsx)("span", { children: "Skill name" }), /* @__PURE__ */ (0, W.jsx)("input", {
									value: m,
									onChange: (e) => h(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, W.jsxs)("label", {
								className: "cp-field",
								children: [/* @__PURE__ */ (0, W.jsx)("span", { children: "Folder scope (optional)" }), /* @__PURE__ */ (0, W.jsx)("input", {
									value: g,
									placeholder: "All pipelines",
									onChange: (e) => v(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, W.jsxs)("label", {
								className: "cp-field cp-skill-limit",
								children: [/* @__PURE__ */ (0, W.jsx)("span", { children: "Limit" }), /* @__PURE__ */ (0, W.jsx)("input", {
									type: "number",
									min: 1,
									max: 100,
									value: y,
									onChange: (e) => b(Number(e.target.value) || 25)
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, W.jsx)("button", {
						type: "button",
						className: "cp-btn cp-primary",
						onClick: () => t({
							name: m.trim() || "Create a declarative pipeline",
							folder: g.trim(),
							limit: Math.min(Math.max(y || 25, 1), 100)
						}),
						children: "Analyse pipelines with Copilot"
					})
				]
			}),
			c && /* @__PURE__ */ (0, W.jsxs)("div", {
				className: "cp-settings-form cp-skill-form",
				children: [
					/* @__PURE__ */ (0, W.jsxs)("div", {
						className: "cp-settings-form-head",
						children: [/* @__PURE__ */ (0, W.jsx)("strong", { children: c.id ? "Edit skill" : "Add skill" }), /* @__PURE__ */ (0, W.jsx)("button", {
							type: "button",
							className: "cp-btn",
							onClick: () => l(null),
							children: "Cancel"
						})]
					}),
					/* @__PURE__ */ (0, W.jsxs)("label", {
						className: "cp-field",
						children: [/* @__PURE__ */ (0, W.jsx)("span", { children: "Name" }), /* @__PURE__ */ (0, W.jsx)("input", {
							value: c.name,
							onChange: (e) => l({
								...c,
								name: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, W.jsxs)("label", {
						className: "cp-field",
						children: [/* @__PURE__ */ (0, W.jsx)("span", { children: "Kind" }), /* @__PURE__ */ (0, W.jsx)("input", {
							value: c.kind,
							placeholder: "pipeline-create, failure-triage, release…",
							onChange: (e) => l({
								...c,
								kind: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, W.jsxs)("label", {
						className: "cp-field",
						children: [/* @__PURE__ */ (0, W.jsx)("span", { children: "Description" }), /* @__PURE__ */ (0, W.jsx)("input", {
							value: c.description,
							onChange: (e) => l({
								...c,
								description: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, W.jsxs)("label", {
						className: "cp-field",
						children: [/* @__PURE__ */ (0, W.jsx)("span", { children: "When to use" }), /* @__PURE__ */ (0, W.jsx)("input", {
							value: c.whenToUse,
							onChange: (e) => l({
								...c,
								whenToUse: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, W.jsxs)("label", {
						className: "cp-field",
						children: [/* @__PURE__ */ (0, W.jsx)("span", { children: "Tags (comma separated)" }), /* @__PURE__ */ (0, W.jsx)("input", {
							value: c.tags,
							onChange: (e) => l({
								...c,
								tags: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, W.jsxs)("label", {
						className: "cp-field",
						children: [/* @__PURE__ */ (0, W.jsx)("span", { children: "Source jobs (comma separated)" }), /* @__PURE__ */ (0, W.jsx)("input", {
							value: c.sourceJobs,
							onChange: (e) => l({
								...c,
								sourceJobs: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, W.jsxs)("label", {
						className: "cp-field",
						children: [/* @__PURE__ */ (0, W.jsx)("span", { children: "Body (Markdown)" }), /* @__PURE__ */ (0, W.jsx)("textarea", {
							className: "cp-skill-body",
							value: c.body,
							rows: 12,
							placeholder: "## Procedure\n1. ...\n\n```groovy\npipeline { ... }\n```",
							onChange: (e) => l({
								...c,
								body: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, W.jsxs)("label", {
						className: "cp-skill-enabled",
						children: [/* @__PURE__ */ (0, W.jsx)("input", {
							type: "checkbox",
							checked: c.enabled,
							onChange: (e) => l({
								...c,
								enabled: e.target.checked
							})
						}), "Enabled"]
					}),
					/* @__PURE__ */ (0, W.jsx)("div", {
						className: "cp-settings-actions",
						children: /* @__PURE__ */ (0, W.jsx)("button", {
							type: "button",
							className: "cp-btn cp-primary",
							onClick: () => void S(),
							disabled: u,
							children: u ? "Saving…" : "Save skill"
						})
					})
				]
			}),
			i && /* @__PURE__ */ (0, W.jsx)("div", {
				className: "cp-settings-note",
				children: "Loading skills…"
			}),
			!i && n.length === 0 && !c && /* @__PURE__ */ (0, W.jsx)("div", {
				className: "cp-settings-note",
				children: "No skills yet. Add one manually, or let Copilot analyse your pipelines."
			}),
			n.map((t) => /* @__PURE__ */ (0, W.jsxs)("div", {
				className: `cp-skill-card ${t.enabled ? "" : "cp-skill-disabled"}`,
				children: [
					/* @__PURE__ */ (0, W.jsxs)("div", {
						className: "cp-skill-card-main",
						children: [
							/* @__PURE__ */ (0, W.jsxs)("div", {
								className: "cp-skill-card-title",
								children: [
									/* @__PURE__ */ (0, W.jsx)(Wi, {}),
									/* @__PURE__ */ (0, W.jsx)("span", { children: t.name }),
									/* @__PURE__ */ (0, W.jsx)("span", {
										className: "cp-skill-kind",
										children: t.kind
									}),
									!t.enabled && /* @__PURE__ */ (0, W.jsx)("span", {
										className: "cp-skill-off",
										children: "off"
									})
								]
							}),
							/* @__PURE__ */ (0, W.jsx)("div", {
								className: "cp-skill-card-meta",
								children: t.description || t.whenToUse || "No description"
							}),
							t.tags.length > 0 && /* @__PURE__ */ (0, W.jsx)("div", {
								className: "cp-skill-tags",
								children: t.tags.map((e) => /* @__PURE__ */ (0, W.jsx)("span", { children: e }, e))
							})
						]
					}),
					e && /* @__PURE__ */ (0, W.jsxs)("div", {
						className: "cp-skill-card-actions",
						children: [
							/* @__PURE__ */ (0, W.jsx)("button", {
								type: "button",
								className: "cp-btn cp-btn-sm",
								onClick: () => void C(t),
								children: t.enabled ? "Disable" : "Enable"
							}),
							/* @__PURE__ */ (0, W.jsx)("button", {
								type: "button",
								className: "cp-iconbtn",
								"data-tip": "Edit",
								"aria-label": "Edit skill",
								onClick: () => l(ya(t)),
								children: /* @__PURE__ */ (0, W.jsx)(Ei, {})
							}),
							/* @__PURE__ */ (0, W.jsx)("button", {
								type: "button",
								className: "cp-iconbtn",
								"data-tip": "Delete",
								"aria-label": "Delete skill",
								onClick: () => p(t),
								children: /* @__PURE__ */ (0, W.jsx)(Di, {})
							})
						]
					}),
					/* @__PURE__ */ (0, W.jsxs)("details", {
						className: "cp-skill-preview",
						children: [/* @__PURE__ */ (0, W.jsx)("summary", { children: "Preview body" }), /* @__PURE__ */ (0, W.jsx)("pre", { children: t.body })]
					})
				]
			}, t.id)),
			/* @__PURE__ */ (0, W.jsx)("div", {
				className: "cp-settings-note",
				children: "Skills are global and admin-managed. Enabled skills are offered to every assistant user; writes pause for approval when performed by the agent."
			}),
			/* @__PURE__ */ (0, W.jsx)(_a, {
				open: f !== null,
				title: "Delete skill?",
				message: f ? `"${f.name}" will be permanently deleted. The assistant will stop using it immediately.` : "",
				confirmLabel: "Delete skill",
				onCancel: () => p(null),
				onConfirm: () => {
					let e = f;
					p(null), e && _e(e.slug).then((e) => r(e.skills ?? [])).catch((e) => s(e instanceof Error ? e.message : "Could not delete the skill"));
				}
			})
		]
	});
}
// src/accent.ts
var Sa = [
	{
		id: "navy",
		label: "Navy",
		light: "#2b5874",
		dark: "#86b7d6"
	},
	{
		id: "crimson",
		label: "Crimson",
		light: "#b3322c",
		dark: "#ef8a80"
	},
	{
		id: "amber",
		label: "Amber",
		light: "#85600f",
		dark: "#e0b252"
	},
	{
		id: "green",
		label: "Green",
		light: "#2f7044",
		dark: "#7fca95"
	},
	{
		id: "teal",
		label: "Teal",
		light: "#14676a",
		dark: "#62c6c1"
	},
	{
		id: "violet",
		label: "Violet",
		light: "#5f46a8",
		dark: "#b3a0ec"
	}
], Ca = "jenkins", wa = "navy", Ta = "cp.accent", Ea = {
	light: [
		255,
		255,
		255
	],
	dark: [
		14,
		16,
		22
	]
}, Da = {
	light: [
		20,
		22,
		27
	],
	dark: [
		231,
		233,
		238
	]
}, Oa = "#1f6feb";
function ka() {
	try {
		let e = localStorage.getItem(Ta);
		if (e && (e === "jenkins" || Sa.some((t) => t.id === e))) return e;
	} catch {}
	return wa;
}
function Aa(e) {
	try {
		localStorage.setItem(Ta, e);
	} catch {}
}
function ja() {
	return getComputedStyle(document.documentElement).getPropertyValue("--accent-color").trim() || Oa;
}
function Ma(e) {
	let t = document.createElement("canvas");
	t.width = 1, t.height = 1;
	let n = t.getContext("2d", { willReadFrequently: !0 });
	if (!n) return [
		31,
		111,
		235
	];
	n.fillStyle = Oa, n.fillStyle = e, n.fillRect(0, 0, 1, 1);
	let [r, i, a] = n.getImageData(0, 0, 1, 1).data;
	return [
		r,
		i,
		a
	];
}
function Na([e, t, n]) {
	let r = (e) => {
		let t = e / 255;
		return t <= .03928 ? t / 12.92 : ((t + .055) / 1.055) ** 2.4;
	};
	return .2126 * r(e) + .7152 * r(t) + .0722 * r(n);
}
function Pa(e, t) {
	let [n, r] = [Na(e), Na(t)].sort((e, t) => t - e);
	return (n + .05) / (r + .05);
}
function Fa(e, t, n) {
	return [
		0,
		1,
		2
	].map((r) => Math.round(e[r] + (t[r] - e[r]) * n));
}
function Ia(e, t, n) {
	let r = e;
	for (let i = .1; Pa(r, Ea[t]) < n && i <= 1; i += .1) r = Fa(e, Da[t], i);
	return r;
}
var La = ([e, t, n]) => `rgb(${e} ${t} ${n})`;
function Ra(e, t) {
	if (e === "jenkins") return ja();
	let n = Sa.find((t) => t.id === e);
	return n ? n[t] : e;
}
function za(e) {
	let t = Ma(e);
	return Pa(t, [
		255,
		255,
		255
	]) >= Pa(t, [
		14,
		16,
		22
	]) ? "#fff" : "#0e1016";
}
function Ba(e, t) {
	let n = Ia(Ma(Ra(e, t)), t, 3), r = Ia(n, t, 4.5), i = [
		255,
		255,
		255
	], a = [
		14,
		16,
		22
	], o = Pa(n, i) >= Pa(n, a) ? i : a;
	return {
		"--cp-accent": La(n),
		"--cp-accent-ink": La(r),
		"--cp-on-accent": La(o)
	};
}
// src/components/SettingsPage.tsx
var Va = ["Jenkins AI Copilot is an agentic CI/CD assistant built into Jenkins. It diagnoses failing builds, reviews Jenkinsfiles, prepares fixes, and manages views, folders, jobs, queue items, agents, credentials, permissions, plugins, controller settings, and reusable skills — with privileged actions gated behind explicit approval and provider keys kept encrypted on the controller.", "Works with OpenAI, Claude, opencode go, or any OpenAI-compatible endpoint."], Ha = [
	{
		id: "openai",
		label: "OpenAI"
	},
	{
		id: "anthropic",
		label: "Claude"
	},
	{
		id: "opencode-go",
		label: "opencode go"
	},
	{
		id: "openai-compatible",
		label: "Custom"
	}
];
function Ua(e = "openai") {
	return {
		provider: e,
		label: "",
		apiKey: "",
		baseUrl: e === "opencode-go" ? "https://opencode.ai/inference/go" : "",
		model: "",
		models: [],
		loading: !1,
		error: null
	};
}
function Wa() {
	return {
		label: "",
		token: "",
		apiUrl: "https://api.github.com"
	};
}
function Ga({ accounts: e, isAdmin: t, version: n, theme: r, onThemeChange: i, accent: a, onAccentChange: o, onClose: s, onReload: c, onAccountsChanged: l, onStartSkillDraft: u }) {
	let [d, f] = (0, _.useState)(t ? "providers" : "appearance"), [p, m] = (0, _.useState)(null), [h, g] = (0, _.useState)(null), [v, y] = (0, _.useState)(!1), [b, x] = (0, _.useState)(null), [S, C] = (0, _.useState)(null);
	(0, _.useEffect)(() => {
		x(null);
	}, [d]);
	let w = e?.providers ?? [], T = e?.github ?? [], ee = async (e) => {
		l(e), await c();
	}, E = async () => {
		if (p) {
			if (!p.apiKey.trim() && !p.id) m({
				...p,
				error: "Paste an API key first"
			});
			else {
				m({
					...p,
					loading: !0,
					error: null
				});
				try {
					let e = await ae({
						...p.id && !p.apiKey.trim() ? { id: p.id } : {},
						...p.apiKey.trim() ? {
							provider: p.provider,
							apiKey: p.apiKey.trim(),
							baseUrl: p.baseUrl.trim()
						} : {}
					});
					m((t) => t && {
						...t,
						loading: !1,
						models: e.models,
						model: t.model || e.models[0]?.id || "",
						error: e.models.length === 0 ? "No models returned" : null
					});
				} catch (e) {
					m((t) => t && {
						...t,
						loading: !1,
						error: e instanceof Error ? e.message : "Could not load models"
					});
				}
			}
		}
	}, te = async () => {
		if (p) {
			if (!p.apiKey.trim() && !p.id) m({
				...p,
				error: "Paste an API key first"
			});
			else {
				y(!0), x(null);
				try {
					let e = await O({
						...p.id ? { id: p.id } : {},
						provider: p.provider,
						label: p.label.trim(),
						...p.apiKey.trim() ? { apiKey: p.apiKey.trim() } : {},
						...p.baseUrl.trim() ? { baseUrl: p.baseUrl.trim() } : {},
						...p.model.trim() ? { defaultModel: p.model.trim() } : {}
					});
					m(null), await ee(e.accounts);
				} catch (e) {
					x(e instanceof Error ? e.message : "Could not save the provider");
				} finally {
					y(!1);
				}
			}
		}
	}, ne = (e) => {
		m({
			id: e.id,
			provider: e.provider,
			label: e.label,
			apiKey: "",
			baseUrl: e.baseUrl ?? "",
			model: e.defaultModel ?? "",
			models: [],
			loading: !1,
			error: null
		});
	}, D = async () => {
		if (h) {
			if (!h.token.trim() && !h.id) g({
				...h,
				token: ""
			}), x("Paste a GitHub token first");
			else {
				y(!0), x(null);
				try {
					let e = await A({
						...h.id ? { id: h.id } : {},
						label: h.label.trim(),
						...h.token.trim() ? { token: h.token.trim() } : {},
						apiUrl: h.apiUrl.trim()
					});
					g(null), await ee(e.accounts);
				} catch (e) {
					x(e instanceof Error ? e.message : "Could not save the GitHub token");
				} finally {
					y(!1);
				}
			}
		}
	}, re = w.map((e) => ({
		value: e.id,
		label: e.label,
		description: e.providerLabel
	}));
	return /* @__PURE__ */ (0, W.jsxs)("div", {
		className: "cp-settings",
		children: [
			/* @__PURE__ */ (0, W.jsxs)("div", {
				className: "cp-settings-head",
				children: [
					/* @__PURE__ */ (0, W.jsx)("button", {
						type: "button",
						className: "cp-bar-btn",
						onClick: s,
						"data-tip": "Back",
						"aria-label": "Back",
						children: /* @__PURE__ */ (0, W.jsx)(Li, { className: "cp-back-chevron" })
					}),
					/* @__PURE__ */ (0, W.jsx)("span", {
						className: "cp-settings-title",
						children: "Settings"
					}),
					/* @__PURE__ */ (0, W.jsx)("span", { className: "cp-grow" })
				]
			}),
			/* @__PURE__ */ (0, W.jsx)("div", {
				className: "cp-settings-tabs",
				role: "tablist",
				children: [
					[
						"providers",
						"Providers",
						/* @__PURE__ */ (0, W.jsx)(Pi, {}, "p")
					],
					[
						"github",
						"GitHub",
						/* @__PURE__ */ (0, W.jsx)(wi, {}, "g")
					],
					[
						"appearance",
						"Appearance",
						/* @__PURE__ */ (0, W.jsx)(Ui, {}, "a")
					],
					[
						"skills",
						"Skills",
						/* @__PURE__ */ (0, W.jsx)(Wi, {}, "k")
					],
					[
						"assistant",
						"Assistant",
						/* @__PURE__ */ (0, W.jsx)(xi, {}, "s")
					],
					[
						"about",
						"About",
						/* @__PURE__ */ (0, W.jsx)(Ki, {}, "i")
					]
				].map(([e, t, n]) => /* @__PURE__ */ (0, W.jsxs)("button", {
					type: "button",
					role: "tab",
					"aria-selected": d === e,
					className: `cp-settings-tab ${d === e ? "cp-settings-tab-active" : ""}`,
					onClick: () => f(e),
					children: [n, t]
				}, e))
			}),
			b && /* @__PURE__ */ (0, W.jsx)("div", {
				className: "cp-errline",
				children: b
			}),
			/* @__PURE__ */ (0, W.jsxs)("div", {
				className: "cp-settings-scroll",
				children: [
					d === "providers" && /* @__PURE__ */ (0, W.jsxs)("section", {
						className: "cp-settings-section",
						children: [
							/* @__PURE__ */ (0, W.jsxs)("div", {
								className: "cp-settings-section-head",
								children: [/* @__PURE__ */ (0, W.jsxs)("div", { children: [/* @__PURE__ */ (0, W.jsx)("h3", { children: "Providers" }), /* @__PURE__ */ (0, W.jsx)("p", { children: "Add multiple accounts. The model picker groups models by account." })] }), t && !p && /* @__PURE__ */ (0, W.jsx)("button", {
									type: "button",
									className: "cp-btn cp-primary",
									onClick: () => m(Ua()),
									children: "Add provider"
								})]
							}),
							!t && /* @__PURE__ */ (0, W.jsx)("div", {
								className: "cp-settings-note",
								children: "Only administrators can manage provider accounts."
							}),
							w.map((e) => /* @__PURE__ */ (0, W.jsxs)("div", {
								className: "cp-settings-card",
								children: [
									/* @__PURE__ */ (0, W.jsx)("div", {
										className: "cp-settings-card-icon",
										children: /* @__PURE__ */ (0, W.jsx)(Pi, {})
									}),
									/* @__PURE__ */ (0, W.jsxs)("div", {
										className: "cp-settings-card-main",
										children: [/* @__PURE__ */ (0, W.jsxs)("div", {
											className: "cp-settings-card-title",
											children: [e.label, e.default && /* @__PURE__ */ (0, W.jsx)("span", {
												className: "cp-settings-badge",
												role: "img",
												tabIndex: 0,
												"aria-label": "Default",
												"data-tip": "Default",
												children: /* @__PURE__ */ (0, W.jsx)(Gi, {})
											})]
										}), /* @__PURE__ */ (0, W.jsxs)("div", {
											className: "cp-settings-card-meta",
											children: [
												e.providerLabel,
												e.baseUrl ? ` · ${e.baseUrl}` : "",
												e.defaultModel ? ` · ${e.defaultModel}` : ""
											]
										})]
									}),
									t && /* @__PURE__ */ (0, W.jsxs)("div", {
										className: "cp-settings-card-actions",
										children: [
											!e.default && /* @__PURE__ */ (0, W.jsx)("button", {
												type: "button",
												className: "cp-iconbtn",
												"data-tip": "Make default",
												"aria-label": `Make ${e.label} the default`,
												onClick: () => void k(e.id).then((e) => ee(e.accounts)),
												children: /* @__PURE__ */ (0, W.jsx)(Wi, {})
											}),
											/* @__PURE__ */ (0, W.jsx)("button", {
												type: "button",
												className: "cp-iconbtn",
												"data-tip": "Edit",
												"aria-label": `Edit ${e.label}`,
												onClick: () => ne(e),
												children: /* @__PURE__ */ (0, W.jsx)(Ei, {})
											}),
											S === e.id ? /* @__PURE__ */ (0, W.jsxs)(W.Fragment, { children: [/* @__PURE__ */ (0, W.jsx)("button", {
												type: "button",
												className: "cp-btn cp-danger",
												onClick: () => void ie(e.id).then((e) => (C(null), ee(e.accounts))),
												children: "Confirm"
											}), /* @__PURE__ */ (0, W.jsx)("button", {
												type: "button",
												className: "cp-btn",
												onClick: () => C(null),
												children: "Cancel"
											})] }) : /* @__PURE__ */ (0, W.jsx)("button", {
												type: "button",
												className: "cp-iconbtn",
												"data-tip": "Delete",
												"aria-label": `Delete ${e.label}`,
												onClick: () => C(e.id),
												children: /* @__PURE__ */ (0, W.jsx)(Di, {})
											})
										]
									})
								]
							}, e.id)),
							t && p && /* @__PURE__ */ (0, W.jsxs)("div", {
								className: "cp-settings-form",
								children: [
									/* @__PURE__ */ (0, W.jsxs)("div", {
										className: "cp-settings-form-head",
										children: [/* @__PURE__ */ (0, W.jsx)("strong", { children: p.id ? "Edit provider" : "Add provider" }), /* @__PURE__ */ (0, W.jsx)("button", {
											type: "button",
											className: "cp-btn",
											onClick: () => m(null),
											children: "Cancel"
										})]
									}),
									/* @__PURE__ */ (0, W.jsx)("div", {
										className: "cp-provider-grid",
										children: Ha.map((e) => /* @__PURE__ */ (0, W.jsx)("button", {
											type: "button",
											className: `cp-provider ${p.provider === e.id ? "cp-provider-active" : ""}`,
											onClick: () => m({
												...p,
												provider: e.id,
												baseUrl: e.id === "opencode-go" ? "https://opencode.ai/inference/go" : e.id === "openai-compatible" ? p.baseUrl : ""
											}),
											children: /* @__PURE__ */ (0, W.jsx)("span", {
												className: "cp-provider-name",
												children: e.label
											})
										}, e.id))
									}),
									/* @__PURE__ */ (0, W.jsxs)("label", {
										className: "cp-field",
										children: [/* @__PURE__ */ (0, W.jsx)("span", { children: "Account label" }), /* @__PURE__ */ (0, W.jsx)("input", {
											value: p.label,
											placeholder: "Work, Personal, …",
											onChange: (e) => m({
												...p,
												label: e.target.value
											})
										})]
									}),
									/* @__PURE__ */ (0, W.jsxs)("label", {
										className: "cp-field",
										children: [/* @__PURE__ */ (0, W.jsx)("span", { children: p.id ? "Replace API key (optional)" : "API key" }), /* @__PURE__ */ (0, W.jsx)("input", {
											type: "password",
											value: p.apiKey,
											autoComplete: "off",
											placeholder: p.id ? "Leave blank to keep the stored key" : "sk-…",
											onChange: (e) => m({
												...p,
												apiKey: e.target.value
											})
										})]
									}),
									(p.provider === "opencode-go" || p.provider === "openai-compatible") && /* @__PURE__ */ (0, W.jsxs)("label", {
										className: "cp-field",
										children: [
											/* @__PURE__ */ (0, W.jsx)("span", { children: "Base URL" }),
											/* @__PURE__ */ (0, W.jsx)("input", {
												value: p.baseUrl,
												placeholder: "https://opencode.ai/inference/go",
												onChange: (e) => m({
													...p,
													baseUrl: e.target.value
												})
											}),
											/* @__PURE__ */ (0, W.jsx)("span", {
												className: "cp-field-hint",
												children: "OpenCode Go: https://opencode.ai/inference/go"
											})
										]
									}),
									/* @__PURE__ */ (0, W.jsxs)("div", {
										className: "cp-settings-actions",
										children: [/* @__PURE__ */ (0, W.jsx)("button", {
											type: "button",
											className: "cp-btn",
											onClick: () => void E(),
											disabled: p.loading,
											children: p.loading ? "Loading…" : "Load models"
										}), p.models.length > 0 && /* @__PURE__ */ (0, W.jsx)(ha, {
											icon: /* @__PURE__ */ (0, W.jsx)(Pi, {}),
											title: "Default model",
											value: p.model,
											placeholder: "Select model",
											options: p.models.map((e) => ({
												value: e.id,
												label: e.label || e.id
											})),
											onSelect: (e) => m({
												...p,
												model: e
											})
										})]
									}),
									p.error && /* @__PURE__ */ (0, W.jsx)("div", {
										className: "cp-errline",
										children: p.error
									}),
									/* @__PURE__ */ (0, W.jsx)("div", {
										className: "cp-settings-actions",
										children: /* @__PURE__ */ (0, W.jsx)("button", {
											type: "button",
											className: "cp-btn cp-primary",
											onClick: () => void te(),
											disabled: v,
											children: v ? "Saving…" : "Save provider"
										})
									})
								]
							})
						]
					}),
					d === "github" && /* @__PURE__ */ (0, W.jsxs)("section", {
						className: "cp-settings-section",
						children: [
							/* @__PURE__ */ (0, W.jsxs)("div", {
								className: "cp-settings-section-head",
								children: [/* @__PURE__ */ (0, W.jsxs)("div", { children: [/* @__PURE__ */ (0, W.jsx)("h3", { children: "GitHub" }), /* @__PURE__ */ (0, W.jsx)("p", { children: "Repository tools use the default token. Multiple tokens are stored; one is active." })] }), t && !h && /* @__PURE__ */ (0, W.jsx)("button", {
									type: "button",
									className: "cp-btn cp-primary",
									onClick: () => g(Wa()),
									children: "Add token"
								})]
							}),
							!t && /* @__PURE__ */ (0, W.jsx)("div", {
								className: "cp-settings-note",
								children: "Only administrators can manage GitHub tokens."
							}),
							T.map((e) => /* @__PURE__ */ (0, W.jsxs)("div", {
								className: "cp-settings-card",
								children: [
									/* @__PURE__ */ (0, W.jsx)("div", {
										className: "cp-settings-card-icon",
										children: /* @__PURE__ */ (0, W.jsx)(wi, {})
									}),
									/* @__PURE__ */ (0, W.jsxs)("div", {
										className: "cp-settings-card-main",
										children: [/* @__PURE__ */ (0, W.jsxs)("div", {
											className: "cp-settings-card-title",
											children: [e.label, e.default && /* @__PURE__ */ (0, W.jsx)("span", {
												className: "cp-settings-badge",
												role: "img",
												tabIndex: 0,
												"aria-label": "Default",
												"data-tip": "Default",
												children: /* @__PURE__ */ (0, W.jsx)(Gi, {})
											})]
										}), /* @__PURE__ */ (0, W.jsxs)("div", {
											className: "cp-settings-card-meta",
											children: [e.apiUrl, " · token stored"]
										})]
									}),
									t && /* @__PURE__ */ (0, W.jsxs)("div", {
										className: "cp-settings-card-actions",
										children: [
											!e.default && /* @__PURE__ */ (0, W.jsx)("button", {
												type: "button",
												className: "cp-iconbtn",
												"data-tip": "Make default",
												"aria-label": `Make ${e.label} the default`,
												onClick: () => void se(e.id).then((e) => ee(e.accounts)),
												children: /* @__PURE__ */ (0, W.jsx)(Wi, {})
											}),
											/* @__PURE__ */ (0, W.jsx)("button", {
												type: "button",
												className: "cp-iconbtn",
												"data-tip": "Edit",
												"aria-label": `Edit ${e.label}`,
												onClick: () => g({
													id: e.id,
													label: e.label,
													token: "",
													apiUrl: e.apiUrl
												}),
												children: /* @__PURE__ */ (0, W.jsx)(Ei, {})
											}),
											S === e.id ? /* @__PURE__ */ (0, W.jsxs)(W.Fragment, { children: [/* @__PURE__ */ (0, W.jsx)("button", {
												type: "button",
												className: "cp-btn cp-danger",
												onClick: () => void oe(e.id).then((e) => (C(null), ee(e.accounts))),
												children: "Confirm"
											}), /* @__PURE__ */ (0, W.jsx)("button", {
												type: "button",
												className: "cp-btn",
												onClick: () => C(null),
												children: "Cancel"
											})] }) : /* @__PURE__ */ (0, W.jsx)("button", {
												type: "button",
												className: "cp-iconbtn",
												"data-tip": "Delete",
												"aria-label": `Delete ${e.label}`,
												onClick: () => C(e.id),
												children: /* @__PURE__ */ (0, W.jsx)(Di, {})
											})
										]
									})
								]
							}, e.id)),
							t && h && /* @__PURE__ */ (0, W.jsxs)("div", {
								className: "cp-settings-form",
								children: [
									/* @__PURE__ */ (0, W.jsxs)("div", {
										className: "cp-settings-form-head",
										children: [/* @__PURE__ */ (0, W.jsx)("strong", { children: h.id ? "Edit token" : "Add token" }), /* @__PURE__ */ (0, W.jsx)("button", {
											type: "button",
											className: "cp-btn",
											onClick: () => g(null),
											children: "Cancel"
										})]
									}),
									/* @__PURE__ */ (0, W.jsxs)("label", {
										className: "cp-field",
										children: [/* @__PURE__ */ (0, W.jsx)("span", { children: "Label" }), /* @__PURE__ */ (0, W.jsx)("input", {
											value: h.label,
											placeholder: "Work, Personal, …",
											onChange: (e) => g({
												...h,
												label: e.target.value
											})
										})]
									}),
									/* @__PURE__ */ (0, W.jsxs)("label", {
										className: "cp-field",
										children: [/* @__PURE__ */ (0, W.jsx)("span", { children: h.id ? "Replace token (optional)" : "Personal access token" }), /* @__PURE__ */ (0, W.jsx)("input", {
											type: "password",
											value: h.token,
											autoComplete: "off",
											placeholder: h.id ? "Leave blank to keep the stored token" : "ghp_…",
											onChange: (e) => g({
												...h,
												token: e.target.value
											})
										})]
									}),
									/* @__PURE__ */ (0, W.jsxs)("label", {
										className: "cp-field",
										children: [/* @__PURE__ */ (0, W.jsx)("span", { children: "GitHub API URL" }), /* @__PURE__ */ (0, W.jsx)("input", {
											value: h.apiUrl,
											onChange: (e) => g({
												...h,
												apiUrl: e.target.value
											})
										})]
									}),
									/* @__PURE__ */ (0, W.jsx)("div", {
										className: "cp-settings-actions",
										children: /* @__PURE__ */ (0, W.jsx)("button", {
											type: "button",
											className: "cp-btn cp-primary",
											onClick: () => void D(),
											disabled: v,
											children: v ? "Saving…" : "Save token"
										})
									})
								]
							})
						]
					}),
					d === "appearance" && /* @__PURE__ */ (0, W.jsx)(qa, {
						theme: r,
						onThemeChange: i,
						accent: a,
						onAccentChange: o
					}),
					d === "skills" && /* @__PURE__ */ (0, W.jsx)(xa, {
						isAdmin: t,
						onStartDraft: u
					}),
					d === "assistant" && /* @__PURE__ */ (0, W.jsxs)("section", {
						className: "cp-settings-section",
						children: [
							/* @__PURE__ */ (0, W.jsx)("h3", { children: "Assistant" }),
							/* @__PURE__ */ (0, W.jsx)("p", { children: "Defaults used for new sessions. Each session can switch provider and model." }),
							/* @__PURE__ */ (0, W.jsxs)("div", {
								className: "cp-settings-row",
								children: [/* @__PURE__ */ (0, W.jsx)("span", { children: "Default provider" }), /* @__PURE__ */ (0, W.jsx)(ha, {
									title: "Default provider",
									value: e?.defaultProviderId ?? "",
									placeholder: "No provider",
									options: re,
									icon: /* @__PURE__ */ (0, W.jsx)(Pi, {}),
									onSelect: (e) => {
										t && k(e).then((e) => ee(e.accounts));
									}
								})]
							}),
							/* @__PURE__ */ (0, W.jsx)("div", {
								className: "cp-settings-note",
								children: "Provider keys are stored as Jenkins Secrets. GitHub tools use the default token."
							})
						]
					}),
					d === "about" && /* @__PURE__ */ (0, W.jsxs)("section", {
						className: "cp-settings-section",
						children: [
							/* @__PURE__ */ (0, W.jsxs)("div", {
								className: "cp-about-head",
								children: [/* @__PURE__ */ (0, W.jsx)("h3", { children: "Jenkins AI Copilot" }), /* @__PURE__ */ (0, W.jsxs)("span", {
									className: "cp-settings-version",
									children: ["v", n]
								})]
							}),
							Va.map((e) => /* @__PURE__ */ (0, W.jsx)("p", {
								className: "cp-about-lede",
								children: e
							}, e)),
							/* @__PURE__ */ (0, W.jsxs)("div", {
								className: "cp-settings-note",
								children: [
									"Sessions live under ",
									/* @__PURE__ */ (0, W.jsx)("code", { children: "$JENKINS_HOME/jenkins-ai-copilot" }),
									" and stay scoped to their owner. Provider keys are Jenkins Secrets and only leave the controller for the configured provider."
								]
							}),
							/* @__PURE__ */ (0, W.jsx)("p", { children: /* @__PURE__ */ (0, W.jsx)("a", {
								href: "/manage/configure",
								target: "_blank",
								rel: "noreferrer",
								children: "Advanced configuration"
							}) })
						]
					})
				]
			})
		]
	});
}
var Ka = (e) => ({
	"--cp-swatch": e,
	"--cp-swatch-on": za(e)
});
function qa({ theme: e, onThemeChange: t, accent: n, onAccentChange: r }) {
	let i = Sa.find((e) => e.id === n)?.label ?? "Follow Jenkins";
	return /* @__PURE__ */ (0, W.jsxs)("section", {
		className: "cp-settings-section",
		children: [
			/* @__PURE__ */ (0, W.jsxs)("div", { children: [/* @__PURE__ */ (0, W.jsx)("h3", { children: "Appearance" }), /* @__PURE__ */ (0, W.jsx)("p", { children: "Saved in this browser, for you only." })] }),
			/* @__PURE__ */ (0, W.jsxs)("div", {
				className: "cp-settings-row",
				children: [/* @__PURE__ */ (0, W.jsx)("span", { children: "Theme" }), /* @__PURE__ */ (0, W.jsxs)("div", {
					className: "cp-segment",
					children: [/* @__PURE__ */ (0, W.jsxs)("button", {
						type: "button",
						"aria-pressed": e === "light",
						onClick: () => t("light"),
						children: [/* @__PURE__ */ (0, W.jsx)(Oi, {}), " Light"]
					}), /* @__PURE__ */ (0, W.jsxs)("button", {
						type: "button",
						"aria-pressed": e === "dark",
						onClick: () => t("dark"),
						children: [/* @__PURE__ */ (0, W.jsx)(ki, {}), " Dark"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, W.jsx)("h4", { children: "Primary colour" }),
			/* @__PURE__ */ (0, W.jsxs)("div", {
				className: "cp-swatches",
				role: "group",
				"aria-label": "Primary colour",
				children: [Sa.map((t) => /* @__PURE__ */ (0, W.jsx)("button", {
					type: "button",
					className: `cp-swatch ${n === t.id ? "cp-swatch-active" : ""}`,
					style: Ka(t[e]),
					"data-tip": t.label,
					"aria-label": t.label,
					"aria-pressed": n === t.id,
					onClick: () => r(t.id),
					children: n === t.id && /* @__PURE__ */ (0, W.jsx)(Vi, {})
				}, t.id)), /* @__PURE__ */ (0, W.jsx)("button", {
					type: "button",
					className: `cp-swatch ${n === "jenkins" ? "cp-swatch-active" : ""}`,
					style: Ka(Ra(Ca, e)),
					"data-tip": "Follow Jenkins: uses this controller's accent colour",
					"aria-label": "Follow Jenkins",
					"aria-pressed": n === Ca,
					onClick: () => r(Ca),
					children: n === "jenkins" ? /* @__PURE__ */ (0, W.jsx)(Vi, {}) : /* @__PURE__ */ (0, W.jsx)(qi, {})
				})]
			}),
			/* @__PURE__ */ (0, W.jsx)("div", {
				className: "cp-accent-name",
				children: /* @__PURE__ */ (0, W.jsx)("b", { children: i })
			}),
			/* @__PURE__ */ (0, W.jsxs)("div", {
				className: "cp-accent-preview",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, W.jsx)(qi, { className: "cp-accent-mark" }),
					/* @__PURE__ */ (0, W.jsx)("span", {
						className: "cp-btn cp-primary",
						children: "Approve and run"
					}),
					/* @__PURE__ */ (0, W.jsx)("span", {
						className: "cp-accent-link",
						children: "A link in a reply"
					})
				]
			})
		]
	});
}
// src/components/SessionList.tsx
var Ja = {
	awaiting_approval: {
		state: "unstable",
		label: "Waiting for your approval"
	},
	error: {
		state: "failure",
		label: "Stopped with an error"
	},
	running: {
		state: "running",
		label: "Running"
	}
};
function Ya({ status: e }) {
	let t = Ja[e];
	return /* @__PURE__ */ (0, W.jsx)("span", {
		className: "cp-session-status",
		children: t && /* @__PURE__ */ (0, W.jsx)(Yi, {
			state: t.state,
			label: t.label
		})
	});
}
function Xa(e) {
	let t = Date.now() - e, n = Math.floor(t / 6e4);
	if (n < 1) return "now";
	if (n < 60) return `${n}m`;
	let r = Math.floor(n / 60);
	if (r < 24) return `${r}h`;
	let i = Math.floor(r / 24);
	return i < 7 ? `${i}d` : new Date(e).toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}
function Za(e) {
	if (e === "General") return "General";
	let t = e.split("/").filter(Boolean);
	return t.length > 1 ? `${t[t.length - 2]}/${t[t.length - 1]}` : e;
}
function Qa({ sessions: e, activeId: t, currentPipeline: n, collapsed: r, onToggle: i, onSelect: a, onNew: o, onDelete: s, onRename: c, onClose: l, onSettings: u, onCloseSidebar: d }) {
	let [f, p] = (0, _.useState)(""), [m, h] = (0, _.useState)(null), [g, v] = (0, _.useState)(""), [y, b] = (0, _.useState)(null), x = (0, _.useMemo)(() => {
		let t = f.trim().toLowerCase(), n = e.filter((e) => !t || e.title.toLowerCase().includes(t) || e.pipeline.toLowerCase().includes(t) || e.model.toLowerCase().includes(t)), r = /* @__PURE__ */ new Map();
		for (let e of n) {
			let t = e.pipeline || "General", n = r.get(t) ?? [];
			n.push(e), r.set(t, n);
		}
		return [...r.entries()].map(([e, t]) => ({
			pipeline: e,
			items: t.sort((e, t) => t.updatedAt - e.updatedAt)
		})).sort((e, t) => (t.items[0]?.updatedAt ?? 0) - (e.items[0]?.updatedAt ?? 0));
	}, [e, f]), S = (e) => {
		h(e.id), v(e.title === "New conversation" ? "" : e.title);
	};
	return /* @__PURE__ */ (0, W.jsxs)("div", {
		className: "cp-sessions",
		children: [
			/* @__PURE__ */ (0, W.jsxs)("div", {
				className: "cp-sessions-head",
				children: [/* @__PURE__ */ (0, W.jsxs)("div", {
					className: "cp-sessions-title-row",
					children: [
						d && /* @__PURE__ */ (0, W.jsx)("button", {
							type: "button",
							className: "cp-bar-btn",
							onClick: d,
							"data-tip": "Close sidebar",
							"aria-label": "Close sidebar",
							children: /* @__PURE__ */ (0, W.jsx)(ji, {})
						}),
						/* @__PURE__ */ (0, W.jsx)("span", {
							className: "cp-sessions-title",
							children: "Pipelines"
						}),
						/* @__PURE__ */ (0, W.jsx)("span", {
							className: "cp-sessions-count",
							children: e.length
						}),
						/* @__PURE__ */ (0, W.jsx)("span", { className: "cp-grow" }),
						l && /* @__PURE__ */ (0, W.jsx)("button", {
							type: "button",
							className: "cp-bar-btn",
							onClick: l,
							"data-tip": "Back to chat",
							"aria-label": "Back to chat",
							children: /* @__PURE__ */ (0, W.jsx)(Li, { className: "cp-back-chevron" })
						}),
						u && /* @__PURE__ */ (0, W.jsx)("button", {
							type: "button",
							className: "cp-bar-btn",
							onClick: u,
							"data-tip": "Settings",
							"aria-label": "Settings",
							children: /* @__PURE__ */ (0, W.jsx)(xi, {})
						}),
						/* @__PURE__ */ (0, W.jsx)("button", {
							type: "button",
							className: "cp-bar-btn",
							onClick: () => o(n),
							"data-tip": "New session",
							"aria-label": "New session",
							children: /* @__PURE__ */ (0, W.jsx)(bi, {})
						})
					]
				}), /* @__PURE__ */ (0, W.jsx)("input", {
					className: "cp-session-search",
					value: f,
					onChange: (e) => p(e.target.value),
					placeholder: "Search sessions or pipelines",
					"aria-label": "Search sessions"
				})]
			}),
			/* @__PURE__ */ (0, W.jsxs)("div", {
				className: "cp-sessions-scroll",
				children: [x.length === 0 && /* @__PURE__ */ (0, W.jsx)("div", {
					className: "cp-session-empty",
					children: f ? "No sessions match your search." : "No sessions yet. Start one for a pipeline."
				}), x.map((e) => {
					let n = r.has(e.pipeline);
					return /* @__PURE__ */ (0, W.jsxs)("section", {
						className: "cp-session-group",
						children: [/* @__PURE__ */ (0, W.jsxs)("div", {
							className: "cp-session-group-head",
							children: [/* @__PURE__ */ (0, W.jsxs)("button", {
								type: "button",
								className: "cp-session-group-toggle",
								onClick: () => i(e.pipeline),
								"aria-expanded": !n,
								"data-tip": e.pipeline,
								"data-tip-truncated": !0,
								children: [
									/* @__PURE__ */ (0, W.jsx)(Li, { className: `cp-session-chevron ${n ? "cp-collapsed" : ""}` }),
									/* @__PURE__ */ (0, W.jsx)(Ti, { className: "cp-session-folder" }),
									/* @__PURE__ */ (0, W.jsx)("span", {
										className: "cp-session-pipeline",
										"data-truncates": !0,
										children: Za(e.pipeline)
									}),
									/* @__PURE__ */ (0, W.jsx)("span", {
										className: "cp-session-group-count",
										children: e.items.length
									})
								]
							}), /* @__PURE__ */ (0, W.jsx)("button", {
								type: "button",
								className: "cp-session-new",
								onClick: () => o(e.pipeline),
								"data-tip": `New session in ${e.pipeline}`,
								"aria-label": `New session in ${e.pipeline}`,
								children: /* @__PURE__ */ (0, W.jsx)(bi, {})
							})]
						}), !n && /* @__PURE__ */ (0, W.jsx)("div", {
							className: "cp-session-rows",
							children: e.items.map((e) => {
								let n = e.id === t, r = e.title === "New conversation" || !e.title ? "New session" : e.title;
								return /* @__PURE__ */ (0, W.jsxs)("div", {
									className: `cp-session-row ${n ? "cp-session-row-active" : ""}`,
									children: [m === e.id ? /* @__PURE__ */ (0, W.jsxs)("div", {
										className: "cp-session-row-main",
										children: [/* @__PURE__ */ (0, W.jsx)(Ya, { status: e.status }), /* @__PURE__ */ (0, W.jsx)("input", {
											className: "cp-session-rename",
											value: g,
											autoFocus: !0,
											placeholder: "Session name",
											onChange: (e) => v(e.target.value),
											onKeyDown: (t) => {
												if (t.key === "Enter") {
													t.preventDefault();
													let n = g.trim();
													n && c(e.id, n), h(null);
												} else t.key === "Escape" && h(null);
											},
											onBlur: () => h(null)
										})]
									}) : /* @__PURE__ */ (0, W.jsxs)("div", {
										className: "cp-session-row-main",
										children: [/* @__PURE__ */ (0, W.jsx)(Ya, { status: e.status }), /* @__PURE__ */ (0, W.jsx)("button", {
											type: "button",
											className: "cp-session-open",
											onClick: () => a(e.id),
											"data-tip": e.title,
											"data-tip-truncated": !0,
											children: /* @__PURE__ */ (0, W.jsxs)("span", {
												className: "cp-session-row-text",
												children: [/* @__PURE__ */ (0, W.jsx)("span", {
													className: "cp-session-name",
													"data-truncates": !0,
													children: r
												}), /* @__PURE__ */ (0, W.jsxs)("span", {
													className: "cp-session-meta",
													children: [Xa(e.updatedAt), e.model ? ` · ${e.model}` : ""]
												})]
											})
										})]
									}), m !== e.id && /* @__PURE__ */ (0, W.jsxs)("span", {
										className: "cp-session-actions",
										children: [/* @__PURE__ */ (0, W.jsx)("button", {
											type: "button",
											className: "cp-session-action",
											"data-tip": "Rename session",
											"aria-label": "Rename session",
											onClick: () => S(e),
											children: /* @__PURE__ */ (0, W.jsx)(Ei, {})
										}), /* @__PURE__ */ (0, W.jsx)("button", {
											type: "button",
											className: "cp-session-action",
											"data-tip": "Delete session",
											"aria-label": "Delete session",
											onClick: () => b(e),
											children: /* @__PURE__ */ (0, W.jsx)(Di, {})
										})]
									})]
								}, e.id);
							})
						})]
					}, e.pipeline);
				})]
			}),
			/* @__PURE__ */ (0, W.jsx)(_a, {
				open: y !== null,
				title: "Delete session?",
				message: y ? `"${y.title === "New conversation" || !y.title ? "New session" : y.title}" will be permanently deleted, including its messages and attachments.` : "",
				confirmLabel: "Delete session",
				onCancel: () => b(null),
				onConfirm: () => {
					let e = y;
					b(null), e && s(e.id);
				}
			})
		]
	});
}
// src/components/ThinkingLine.tsx
var $a = [
	"Pondering",
	"Mulling it over",
	"Minding the queue",
	"Deliberating",
	"Weighing the options",
	"Ruminating"
];
function eo({ toolName: e }) {
	let [t, n] = (0, _.useState)(0);
	(0, _.useEffect)(() => {
		let e = window.setInterval(() => n((e) => e + 1), 1e3);
		return () => window.clearInterval(e);
	}, []);
	let r = e ? Qi(e).activity : $a[Math.floor(t / 4) % $a.length];
	return /* @__PURE__ */ (0, W.jsxs)("div", {
		className: "cp-working",
		role: "status",
		"aria-label": "Copilot is working",
		children: [
			/* @__PURE__ */ (0, W.jsx)(qi, { className: "cp-mark-busy" }),
			/* @__PURE__ */ (0, W.jsxs)("span", {
				className: "cp-shimmer",
				"aria-hidden": "true",
				children: [r, "…"]
			}, r),
			t >= 3 && /* @__PURE__ */ (0, W.jsxs)("span", {
				className: "cp-working-time",
				"aria-hidden": "true",
				children: [t, "s"]
			})
		]
	});
}
// src/components/TipLayer.tsx
var to = 280, no = 8;
function ro(e) {
	let t = e.querySelector("[data-truncates]") ?? e;
	return t.scrollWidth > t.clientWidth;
}
function io(e) {
	let t = e.target;
	return t instanceof Element ? t.closest("[data-tip]") : null;
}
function ao() {
	let [e, t] = (0, _.useState)(null), [n, r] = (0, _.useState)(null), i = (0, _.useRef)(null), a = (0, _.useRef)(null);
	return (0, _.useEffect)(() => {
		let e = i.current?.getRootNode();
		if (!e) return;
		let n, a = null, o = 0, s, c = () => {
			window.clearTimeout(n), window.clearInterval(s), a && (o = Date.now()), a = null, t(null), r(null);
		}, l = (e, i) => {
			let o = e.dataset.tip;
			!o || e.hasAttribute("data-tip-truncated") && !ro(e) ? c() : (window.clearTimeout(n), a = e, n = window.setTimeout(() => {
				a === e && e.isConnected && (r(null), t({
					text: o,
					anchor: e.getBoundingClientRect()
				}), window.clearInterval(s), s = window.setInterval(() => {
					e.isConnected && e.dataset.tip === o || c();
				}, 200));
			}, i));
		}, u = (e) => {
			if (e.pointerType === "touch") return;
			let t = io(e);
			t !== a && (t ? l(t, Date.now() - o < 400 || a ? 0 : to) : c());
		}, d = (e) => {
			let t = io(e);
			t && (t.matches(":focus-visible") || t.tagName !== "BUTTON") && l(t, 0);
		}, f = (e) => {
			e.key === "Escape" && c();
		};
		return e.addEventListener("pointerover", u), e.addEventListener("focusin", d), e.addEventListener("focusout", c), e.addEventListener("pointerdown", c), e.addEventListener("keydown", f), e.addEventListener("wheel", c, { passive: !0 }), window.addEventListener("blur", c), () => {
			window.clearTimeout(n), window.clearInterval(s), e.removeEventListener("pointerover", u), e.removeEventListener("focusin", d), e.removeEventListener("focusout", c), e.removeEventListener("pointerdown", c), e.removeEventListener("keydown", f), e.removeEventListener("wheel", c), window.removeEventListener("blur", c);
		};
	}, []), (0, _.useLayoutEffect)(() => {
		let t = a.current;
		if (!e || !t) return;
		let { width: n, height: i } = t.getBoundingClientRect(), o = e.anchor.top - i - no < no, s = e.anchor.left + e.anchor.width / 2;
		r({
			left: Math.max(no, Math.min(s - n / 2, window.innerWidth - n - no)),
			top: o ? e.anchor.bottom + 6 : e.anchor.top - i - 6,
			below: o
		});
	}, [e]), /* @__PURE__ */ (0, W.jsxs)(W.Fragment, { children: [/* @__PURE__ */ (0, W.jsx)("span", {
		ref: i,
		hidden: !0
	}), e && /* @__PURE__ */ (0, W.jsx)("div", {
		ref: a,
		className: `cp-tip ${n ? "cp-tip-show" : ""} ${n?.below ? "cp-tip-below" : ""}`,
		role: "tooltip",
		style: n ? {
			left: n.left,
			top: n.top
		} : {
			left: 0,
			top: 0,
			visibility: "hidden"
		},
		children: e.text
	})] });
}
// src/App.tsx
function oo(e) {
	return { error: e instanceof Error ? e.message : "Could not load models" };
}
function so() {
	let [e, t] = (0, _.useState)(null), [n, r] = (0, _.useState)(!1), [i, a] = (0, _.useState)(() => {
		let e = Number(localStorage.getItem("cp.width"));
		return Number.isFinite(e) && e >= 360 && e <= 760 ? e : 440;
	}), [o, s] = (0, _.useState)("chat"), [c, l] = (0, _.useState)([]), [u, d] = (0, _.useState)(), [f, p] = (0, _.useState)([]), [m, h] = (0, _.useState)(/* @__PURE__ */ new Set()), [g, v] = (0, _.useState)(null), [y, x] = (0, _.useState)(() => localStorage.getItem("cp.account") ?? ""), [S, C] = (0, _.useState)(() => localStorage.getItem("cp.model") ?? ""), [w, T] = (0, _.useState)({}), [O, ie] = (0, _.useState)(""), [k, A] = (0, _.useState)(!1), [oe, se] = (0, _.useState)(null), [ue, pe] = (0, _.useState)(null), [me, he] = (0, _.useState)(!1), [ge, _e] = (0, _.useState)("chat"), [ve, ye] = (0, _.useState)(() => localStorage.getItem("cp.thinking") ?? "AUTO"), [M, be] = (0, _.useState)([]), [N, xe] = (0, _.useState)(() => {
		let e = localStorage.getItem("cp.theme");
		return e === "light" || e === "dark" ? e : "dark";
	}), [P, Se] = (0, _.useState)(ka), F = (0, _.useRef)(null), Ce = (0, _.useRef)(null), we = (0, _.useRef)(null), Te = (0, _.useRef)(null), Ee = (0, _.useRef)(null), De = (0, _.useRef)({}), Oe = (0, _.useRef)(/* @__PURE__ */ new Set()), ke = (0, _.useRef)(!1);
	De.current = w;
	let Ae = (0, _.useCallback)(async () => {
		try {
			p(await E());
		} catch {}
	}, []), je = (0, _.useCallback)(async (e, t = !1) => {
		if (!e || Oe.current.has(e)) return;
		let n = De.current[e];
		if (t || !Array.isArray(n)) {
			Oe.current.add(e), T((t) => ({
				...t,
				[e]: "loading"
			}));
			try {
				let t = await ae({ id: e });
				T((n) => ({
					...n,
					[e]: t.models
				}));
			} catch (t) {
				T((n) => ({
					...n,
					[e]: oo(t)
				}));
			} finally {
				Oe.current.delete(e);
			}
		}
	}, []), Me = (0, _.useCallback)(async () => {
		try {
			let e = await re();
			v(e);
			let n = await ee();
			t(n);
		} catch (e) {
			pe(e instanceof Error ? e.message : "Could not reload settings");
		}
	}, []);
	(0, _.useEffect)(() => {
		(async () => {
			try {
				let e = await ee();
				if (t(e), !e.authenticated) return;
				try {
					let e = await re();
					v(e);
					let t = e.providers.find((t) => t.id === e.defaultProviderId) ?? e.providers[0];
					t && (x((e) => e || t.id), C((e) => e || t.defaultModel || ""));
				} catch {}
				await Ae();
			} catch (e) {
				pe(e instanceof Error ? e.message : "Could not load the assistant");
			}
		})();
	}, [Ae]), (0, _.useEffect)(() => {
		g && g.providers.length !== 0 && x((e) => e && g.providers.some((t) => t.id === e) ? e : (g.providers.find((e) => e.id === g.defaultProviderId) ?? g.providers[0]).id);
	}, [g]), (0, _.useEffect)(() => {
		if (!y) return;
		let e = g?.providers.find((e) => e.id === y);
		C((t) => t || e?.defaultModel || ""), je(y);
	}, [
		g,
		je,
		y
	]), (0, _.useEffect)(() => {
		if (!y || S) return;
		let e = w[y];
		Array.isArray(e) && e[0] && C(e[0].id);
	}, [
		S,
		w,
		y
	]), (0, _.useEffect)(() => {
		localStorage.setItem("cp.account", y);
	}, [y]), (0, _.useEffect)(() => {
		localStorage.setItem("cp.model", S);
	}, [S]), (0, _.useEffect)(() => {
		let e = (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j" && (e.preventDefault(), r((e) => !e)), e.key === "Escape" && n) {
				if ((document.getElementById("jenkins-ai-copilot-root")?.shadowRoot)?.querySelector(".cp-menu")) return;
				r(!1);
			}
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, [n]), (0, _.useEffect)(() => {
		n && window.setTimeout(() => we.current?.focus(), 60);
	}, [n, o]), (0, _.useEffect)(() => {
		let e = Ce.current;
		e && e.scrollHeight - e.scrollTop - e.clientHeight < 140 && (e.scrollTop = e.scrollHeight);
	}, [c, k]);
	let I = (0, _.useMemo)(() => ({
		...b.context,
		...e?.context ?? {}
	}), [e]), L = typeof I.jobFullName == "string" ? I.jobFullName : void 0, Ne = typeof I.buildNumber == "number" ? I.buildNumber : void 0, Pe = typeof I.pipeline == "string" && I.pipeline ? I.pipeline : L ?? "General", Fe = typeof I.buildResult == "string" ? I.buildResult : null, Ie = typeof I.lastBuildResult == "string" ? I.lastBuildResult : Fe, Le = typeof I.lastBuildNumber == "number" ? I.lastBuildNumber : Ne, Re = Ie === "FAILURE" || Ie === "UNSTABLE", ze = g ? g.providers.length === 0 : e?.config.setupRequired ?? !0, Be = f.find((e) => e.id === u), Ve = e?.config.autoApproveAll === !0, He = c.filter((e) => e.kind === "approval" && e.status === "pending");
	(0, _.useEffect)(() => {
		e?.isAdmin && ze && !ke.current && (ke.current = !0, s("settings"));
	}, [e?.isAdmin, ze]);
	let Ue = (0, _.useCallback)((e) => {
		l((t) => [...t, e]);
	}, []), We = (0, _.useCallback)((e, t) => {
		l((n) => n.map((n) => n.kind === "tool" && n.toolCallId === e ? {
			...n,
			...t
		} : n));
	}, []), Ge = (0, _.useCallback)(() => {
		l((e) => e.map((e) => e.kind === "reasoning" && !e.done ? {
			...e,
			done: !0
		} : e));
	}, []), Ke = (0, _.useCallback)((e) => {
		switch (e.event) {
			case "conversation":
				d(e.data.id);
				break;
			case "message.reasoning":
				se("thinking"), l((t) => {
					let n = t[t.length - 1];
					return n && n.kind === "reasoning" && !n.done ? [...t.slice(0, -1), {
						...n,
						text: n.text + e.data.text
					}] : [...t, {
						kind: "reasoning",
						id: `reasoning-${Date.now()}`,
						text: e.data.text,
						done: !1
					}];
				});
				break;
			case "message.delta": {
				se("streaming"), Ge();
				let t = Ee.current;
				if (t) l((n) => n.map((n) => n.kind === "message" && n.id === t ? {
					...n,
					text: n.text + e.data.text,
					streaming: !0
				} : n));
				else {
					let t = `assistant-${Date.now()}`;
					Ee.current = t, l((n) => [...n, {
						kind: "message",
						id: t,
						role: "assistant",
						text: e.data.text,
						streaming: !0
					}]);
				}
				break;
			}
			case "message.completed": {
				Ge();
				let t = Ee.current;
				Ee.current = null, se(null), t ? l((n) => n.map((n) => n.kind === "message" && n.id === t ? {
					...n,
					text: n.text || e.data.text,
					streaming: !1
				} : n)) : e.data.text.trim() && l((t) => [...t, {
					kind: "message",
					id: `assistant-${Date.now()}`,
					role: "assistant",
					text: e.data.text,
					streaming: !1
				}]);
				break;
			}
			case "tool.start": {
				se("tools"), Ge();
				let t = Ee.current;
				Ee.current = null, t && l((e) => e.map((e) => e.kind === "message" && e.id === t ? {
					...e,
					streaming: !1,
					narration: !0
				} : e)), Ue({
					kind: "tool",
					id: `tool-${e.data.toolCallId}`,
					toolCallId: e.data.toolCallId,
					toolName: e.data.toolName,
					args: e.data.args,
					status: "running",
					risk: e.data.risk,
					reason: e.data.reason
				});
				break;
			}
			case "tool.result":
				We(e.data.toolCallId, {
					status: "succeeded",
					output: e.data.output
				});
				break;
			case "tool.error":
				We(e.data.toolCallId, {
					status: "failed",
					error: e.data.error
				});
				break;
			case "approval.required": {
				let t = {
					kind: "approval",
					id: `approval-${e.data.approvalId}`,
					approvalId: e.data.approvalId,
					toolCallId: e.data.toolCallId,
					toolName: e.data.toolName,
					target: e.data.target,
					args: e.data.args,
					risk: e.data.risk,
					reason: e.data.reason,
					diff: e.data.diff,
					validation: e.data.validation,
					expiresAt: e.data.expiresAt,
					status: "pending"
				};
				l((e) => e.some((e) => e.kind === "approval" && e.approvalId === t.approvalId) ? e.map((e) => e.kind === "approval" && e.approvalId === t.approvalId ? t : e) : [...e, t]);
				break;
			}
			case "error":
				Ue({
					kind: "error",
					id: `error-${Date.now()}`,
					text: e.data.message
				});
				break;
			case "done": Ge(), A(!1), se(null), Ae();
		}
	}, [
		Ue,
		Ge,
		Ae,
		We
	]), qe = (0, _.useCallback)(async (t) => {
		let n = e?.config.maxAttachmentMb ?? 5, r = [];
		for (let e of t.slice(0, Math.max(0, 4 - M.length))) try {
			r.push(await j(e, n));
		} catch (e) {
			pe(e instanceof Error ? e.message : "Could not attach the image");
		}
		r.length > 0 && be((e) => [...e, ...r].slice(0, 4));
	}, [M.length, e?.config.maxAttachmentMb]), Je = (0, _.useCallback)(async (t, n) => {
		let r = t.trim();
		if (k || !r && M.length === 0 || !e) return;
		if (ze) {
			e.isAdmin && s("settings");
			return;
		}
		if (!y) {
			pe("Choose a provider account first");
			return;
		}
		if (!S) {
			pe("Choose a model first");
			return;
		}
		let i = n?.conversationId ?? u;
		pe(null), ie(""), Ue({
			kind: "message",
			id: `user-${Date.now()}`,
			role: "user",
			text: r,
			images: M.map((e) => ({
				url: e.previewUrl,
				fileName: e.fileName
			}))
		});
		let a = M;
		be([]);
		let o = new AbortController();
		F.current = o, Ee.current = null, A(!0), se("thinking");
		try {
			await de({
				...i ? { conversationId: i } : { pipeline: Pe },
				message: r,
				providerAccountId: y,
				model: S,
				thinking: ve,
				context: I,
				...a.length > 0 ? { attachments: a.map((e) => ({
					mediaType: e.mediaType,
					fileName: e.fileName,
					dataBase64: e.dataBase64
				})) } : {}
			}, Ke, o.signal);
		} catch (e) {
			o.signal.aborted || Ue({
				kind: "error",
				id: `error-${Date.now()}`,
				text: e instanceof Error ? e.message : "Request failed"
			});
		} finally {
			A(!1), se(null), F.current = null;
		}
	}, [
		Ue,
		M,
		k,
		I,
		u,
		Ke,
		S,
		Pe,
		y,
		e,
		ze,
		ve
	]), Ye = (0, _.useCallback)(async (e) => {
		F.current?.abort(), A(!1);
		try {
			let t = await te(e || Pe || "General", {
				providerAccountId: y,
				model: S,
				thinking: ve
			});
			Ee.current = null, d(t.id), l([]), pe(null), ie(""), be([]), se(null), t.providerAccountId && x(t.providerAccountId), t.model && C(t.model), s("chat"), await Ae(), window.setTimeout(() => we.current?.focus(), 60);
		} catch (e) {
			pe(e instanceof Error ? e.message : "Could not create a session");
		}
	}, [
		S,
		Pe,
		y,
		Ae,
		ve
	]), Xe = (0, _.useCallback)(async (e) => {
		if (!k) try {
			let t = await te("Skills", {
				providerAccountId: y,
				model: S,
				thinking: ve
			});
			Ee.current = null, d(t.id), l([]), pe(null), ie(""), be([]), se(null), s("chat"), await Ae();
			let n = e.folder ? `the folder "${e.folder}"` : "all visible pipelines";
			await Je(`Analyse ${n} with scan_pipelines using a limit of ${e.limit}. Identify the repeated stage structure, agents, options, checkout/build/test/deploy patterns, and failure handling. Then create a reusable skill named "${e.name}" with create_skill. The skill body must be concise Markdown: when to use it, inputs, procedure, checks, and a declarative Jenkinsfile template with placeholders. Record sourceJobs. Do not include secrets or full raw pipeline source. For SCM-backed pipelines, inspect representative repository Jenkinsfiles only when GitHub tools are configured.`, { conversationId: t.id });
		} catch (e) {
			pe(e instanceof Error ? e.message : "Could not start the skill analysis");
		}
	}, [
		k,
		S,
		y,
		Ae,
		Je,
		ve
	]), Ze = (0, _.useCallback)(async () => {
		if (!k && L) try {
			let e = await te(Pe || L, {
				providerAccountId: y,
				model: S,
				thinking: ve
			});
			Ee.current = null, d(e.id), l([]), be([]), s("chat"), await Ae();
			let t = Le ? ` #${Le}` : " latest build";
			await Je(`Investigate the failing${t} of ${L}. Pull the console log and recent changes, identify the failing stage and root cause, then propose the smallest safe fix. Do not change anything without approval.`, { conversationId: e.id });
		} catch (e) {
			pe(e instanceof Error ? e.message : "Could not start the analysis");
		}
	}, [
		k,
		L,
		Le,
		S,
		Pe,
		y,
		Ae,
		Je,
		ve
	]), Qe = (0, _.useCallback)(async (e, t, n) => {
		if (!u) return;
		l((n) => n.map((n) => n.kind === "approval" && n.approvalId === e.approvalId ? {
			...n,
			status: t ? "approved" : "rejected"
		} : n));
		let r = new AbortController();
		F.current = r, Ee.current = null, A(!0), se("thinking"), pe(null);
		try {
			await fe({
				conversationId: u,
				approvalId: e.approvalId,
				approved: t,
				comment: n,
				context: I
			}, Ke, r.signal);
		} catch (t) {
			l((t) => t.map((t) => t.kind === "approval" && t.approvalId === e.approvalId ? {
				...t,
				status: "pending"
			} : t)), Ue({
				kind: "error",
				id: `error-${Date.now()}`,
				text: t instanceof Error ? t.message : "Decision failed"
			});
		} finally {
			A(!1), se(null), F.current = null;
		}
	}, [
		Ue,
		k,
		I,
		u,
		Ke
	]), $e = (0, _.useCallback)(() => {
		F.current?.abort(), Ge(), A(!1), se(null), l((e) => e.map((e) => e.kind === "message" && e.streaming ? {
			...e,
			streaming: !1
		} : e));
	}, [Ge]), et = (0, _.useCallback)(() => {
		F.current?.abort(), Ee.current = null, d(void 0), l([]), pe(null), ie(""), be([]), A(!1), se(null);
	}, []), tt = (0, _.useCallback)(async (e) => {
		if (!e) et(), s("chat");
		else {
			F.current?.abort(), Ee.current = null, A(!1);
			try {
				let t = await ce(e);
				l(co(t, e)), d(e), ye(t.conversation.thinking || "AUTO"), C(t.conversation.model || ""), t.conversation.providerAccountId && (x(t.conversation.providerAccountId), je(t.conversation.providerAccountId)), pe(null), s("chat");
			} catch (e) {
				pe(e instanceof Error ? e.message : "Could not load the conversation");
			}
		}
	}, [je, et]), nt = (0, _.useCallback)(async (e, t) => {
		try {
			await ne(e, t), await Ae();
		} catch (e) {
			pe(e instanceof Error ? e.message : "Could not rename the session");
		}
	}, [Ae]), rt = (0, _.useCallback)(async (e) => {
		try {
			await le(e), e === u && et(), await Ae();
		} catch (e) {
			pe(e instanceof Error ? e.message : "Could not delete the session");
		}
	}, [
		u,
		Ae,
		et
	]), it = (0, _.useCallback)((e) => {
		e.preventDefault();
		let t = e.currentTarget;
		t.setPointerCapture(e.pointerId);
		let n = (e) => {
			let t = Math.min(Math.max(window.innerWidth - e.clientX, 360), 760);
			a(t);
		}, r = () => {
			a((e) => (localStorage.setItem("cp.width", String(e)), e)), t.releasePointerCapture(e.pointerId), window.removeEventListener("pointermove", n), window.removeEventListener("pointerup", r);
		};
		window.addEventListener("pointermove", n), window.addEventListener("pointerup", r);
	}, []), R = (0, _.useCallback)(async () => {
		if (e?.isAdmin && !me) {
			he(!0);
			try {
				let e = await D(Ve ? "ask" : "bypass");
				t((t) => t && {
					...t,
					config: {
						...t.config,
						autoApproveLevel2: e.autoApproveLevel2,
						autoApproveAll: e.autoApproveAll
					}
				}), pe(null);
			} catch (e) {
				pe(e instanceof Error ? e.message : "Could not change the approval mode");
			} finally {
				he(!1);
			}
		}
	}, [
		me,
		Ve,
		e?.isAdmin
	]), at = (0, _.useCallback)((e) => {
		xe(e), localStorage.setItem("cp.theme", e);
	}, []), z = (0, _.useCallback)((e) => {
		Se(e), Aa(e);
	}, []), ot = (0, _.useCallback)((e) => {
		ye(e), localStorage.setItem("cp.thinking", e);
	}, []), st = i, ct = (0, _.useMemo)(() => {
		let e = [
			"List my agents and executor usage",
			"Show the jobs with failing builds",
			"Analyze my pipelines for build-time and Docker storage improvements"
		];
		return L && e.unshift(`Why did the latest build of ${L} fail?`, `Analyze the pipeline for ${L}`), e.slice(0, 4);
	}, [L]), lt = c[c.length - 1], ut = [...c].reverse().find((e) => e.kind === "tool" && e.status === "running"), dt = lt?.kind === "reasoning" && !lt.done, ft = k && oe !== "streaming" && !dt, pt = (0, _.useMemo)(() => Ba(P, N), [P, N]), mt = k ? "Copilot is working…" : ze ? "Finish provider setup first…" : L ? `Ask about ${L}…` : "Ask about a job, build, pipeline, or deployment…";
	return /* @__PURE__ */ (0, W.jsxs)("div", {
		className: "cp-shell",
		"data-theme": N,
		style: pt,
		children: [
			!n && /* @__PURE__ */ (0, W.jsx)("button", {
				type: "button",
				className: `cp-fab ${Re ? "cp-fab-alert" : ""}`,
				"aria-label": Re ? "Open Jenkins Copilot — latest build failed" : "Open Jenkins Copilot",
				"data-tip": Re ? `Latest build ${Ie ?? "failed"}. Open Copilot` : "Jenkins Copilot (Ctrl+J)",
				onClick: () => r(!0),
				children: /* @__PURE__ */ (0, W.jsx)(qi, {})
			}),
			/* @__PURE__ */ (0, W.jsxs)("aside", {
				className: `cp-drawer ${n ? "cp-open" : ""}`,
				style: { width: st },
				"aria-label": "Jenkins Copilot",
				"aria-hidden": !n,
				children: [/* @__PURE__ */ (0, W.jsx)("div", {
					className: "cp-resize",
					role: "separator",
					"aria-orientation": "vertical",
					"aria-label": "Resize assistant",
					onPointerDown: it
				}), o === "settings" && e ? /* @__PURE__ */ (0, W.jsx)(Ga, {
					accounts: g,
					isAdmin: e.isAdmin,
					version: b.version,
					theme: N,
					onThemeChange: at,
					accent: P,
					onAccentChange: z,
					onClose: () => s(ge),
					onReload: Me,
					onAccountsChanged: v,
					onStartSkillDraft: (e) => void Xe(e)
				}) : o === "sessions" ? /* @__PURE__ */ (0, W.jsx)(Qa, {
					sessions: f,
					activeId: u,
					currentPipeline: Pe,
					collapsed: m,
					onToggle: (e) => h((t) => {
						let n = new Set(t);
						return n.has(e) ? n.delete(e) : n.add(e), n;
					}),
					onSelect: (e) => void tt(e),
					onNew: (e) => void Ye(e),
					onDelete: (e) => void rt(e),
					onRename: (e, t) => void nt(e, t),
					onClose: () => s("chat"),
					onSettings: () => {
						_e("sessions"), s("settings");
					},
					onCloseSidebar: () => r(!1)
				}) : /* @__PURE__ */ (0, W.jsxs)(W.Fragment, { children: [
					/* @__PURE__ */ (0, W.jsxs)("header", {
						className: "cp-head",
						children: [/* @__PURE__ */ (0, W.jsxs)("div", {
							className: "cp-head-row",
							children: [
								/* @__PURE__ */ (0, W.jsx)("button", {
									type: "button",
									className: "cp-iconbtn",
									"data-tip": "Sessions",
									"aria-label": "Back to sessions",
									onClick: () => s("sessions"),
									children: /* @__PURE__ */ (0, W.jsx)(Li, { className: "cp-back-chevron" })
								}),
								/* @__PURE__ */ (0, W.jsx)("div", {
									className: `cp-logo ${Re ? "cp-logo-alert" : ""}`,
									children: /* @__PURE__ */ (0, W.jsx)(qi, { className: k ? "cp-mark-busy" : "" })
								}),
								/* @__PURE__ */ (0, W.jsx)("div", {
									className: "cp-head-text",
									children: /* @__PURE__ */ (0, W.jsx)("div", {
										className: "cp-title",
										children: "Copilot"
									})
								}),
								/* @__PURE__ */ (0, W.jsx)("div", { className: "cp-grow" }),
								/* @__PURE__ */ (0, W.jsx)("button", {
									type: "button",
									className: "cp-iconbtn",
									"data-tip": "New session",
									"aria-label": "New session",
									onClick: () => void Ye(Pe),
									children: /* @__PURE__ */ (0, W.jsx)(bi, {})
								}),
								/* @__PURE__ */ (0, W.jsx)("button", {
									type: "button",
									className: "cp-iconbtn",
									"data-tip": "Settings",
									"aria-label": "Settings",
									onClick: () => {
										_e("chat"), s("settings");
									},
									children: /* @__PURE__ */ (0, W.jsx)(xi, {})
								}),
								/* @__PURE__ */ (0, W.jsx)("button", {
									type: "button",
									className: "cp-iconbtn",
									"data-tip": N === "dark" ? "Switch to light theme" : "Switch to dark theme",
									"aria-label": "Toggle theme",
									onClick: () => at(N === "dark" ? "light" : "dark"),
									children: N === "dark" ? /* @__PURE__ */ (0, W.jsx)(Oi, {}) : /* @__PURE__ */ (0, W.jsx)(ki, {})
								}),
								/* @__PURE__ */ (0, W.jsx)("button", {
									type: "button",
									className: "cp-iconbtn",
									"data-tip": "Close (Ctrl+J)",
									"aria-label": "Close assistant",
									onClick: () => r(!1),
									children: /* @__PURE__ */ (0, W.jsx)(ji, {})
								})
							]
						}), /* @__PURE__ */ (0, W.jsxs)("div", {
							className: "cp-context",
							children: [
								Le !== void 0 && /* @__PURE__ */ (0, W.jsx)(Yi, {
									state: Xi(Ie),
									label: `Build #${Le}: ${Ie ?? "in progress"}`
								}),
								/* @__PURE__ */ (0, W.jsx)("span", {
									className: "cp-context-job",
									"data-tip": L,
									"data-tip-truncated": !0,
									children: L ?? "All of Jenkins"
								}),
								Le !== void 0 && /* @__PURE__ */ (0, W.jsxs)("span", {
									className: "cp-context-build",
									children: ["#", Le]
								}),
								Be && /* @__PURE__ */ (0, W.jsx)("span", {
									className: "cp-context-session",
									"data-tip": Be.title,
									"data-tip-truncated": !0,
									children: Be.title
								}),
								/* @__PURE__ */ (0, W.jsxs)("span", {
									className: "cp-context-flags",
									children: [
										ze && /* @__PURE__ */ (0, W.jsx)("span", {
											className: "cp-flag cp-flag-danger",
											role: "img",
											tabIndex: 0,
											"aria-label": "Setup required",
											"data-tip": "Setup required: add a provider",
											children: /* @__PURE__ */ (0, W.jsx)(Ci, {})
										}),
										Ve && /* @__PURE__ */ (0, W.jsx)("span", {
											className: "cp-flag cp-flag-danger",
											role: "img",
											tabIndex: 0,
											"aria-label": "Approvals are bypassed",
											"data-tip": "Approvals are bypassed",
											children: /* @__PURE__ */ (0, W.jsx)(Ni, {})
										}),
										e && !e.config.githubConfigured && /* @__PURE__ */ (0, W.jsx)("span", {
											className: "cp-flag",
											role: "img",
											tabIndex: 0,
											"aria-label": "GitHub is not configured",
											"data-tip": "GitHub is not configured",
											children: /* @__PURE__ */ (0, W.jsx)(wi, {})
										})
									]
								})
							]
						})]
					}),
					ue && /* @__PURE__ */ (0, W.jsx)("div", {
						className: "cp-banner",
						children: ue
					}),
					/* @__PURE__ */ (0, W.jsxs)("div", {
						className: "cp-thread",
						ref: Ce,
						children: [
							c.length === 0 && /* @__PURE__ */ (0, W.jsxs)("div", {
								className: "cp-empty",
								children: [Re && /* @__PURE__ */ (0, W.jsxs)("div", {
									className: "cp-alert",
									children: [
										/* @__PURE__ */ (0, W.jsxs)("div", {
											className: "cp-alert-title",
											children: [/* @__PURE__ */ (0, W.jsx)(Yi, {
												state: Xi(Ie),
												label: `Latest build: ${Ie ?? "failed"}`
											}), `Build ${Le ? `#${Le} ` : ""}${Ie === "UNSTABLE" ? "is unstable" : "failed"}`]
										}),
										/* @__PURE__ */ (0, W.jsxs)("p", { children: [L ?? "This pipeline", " did not finish cleanly. I can read the console log, compare recent changes, and point at the failing stage before proposing a fix."] }),
										/* @__PURE__ */ (0, W.jsxs)("div", {
											className: "cp-alert-actions",
											children: [/* @__PURE__ */ (0, W.jsx)("button", {
												type: "button",
												className: "cp-btn cp-primary",
												onClick: () => void Ze(),
												disabled: k || !L,
												children: "Quickly analyse"
											}), /* @__PURE__ */ (0, W.jsx)("button", {
												type: "button",
												className: "cp-btn",
												onClick: () => void Je(`Show me the console log of the latest build of ${L ?? "this job"}.`),
												disabled: k,
												children: "Show log"
											})]
										})
									]
								}), ze ? /* @__PURE__ */ (0, W.jsxs)(W.Fragment, { children: [
									/* @__PURE__ */ (0, W.jsx)("h3", { children: "Finish setup" }),
									/* @__PURE__ */ (0, W.jsx)("p", { children: "An administrator needs to add a provider account before the assistant can answer questions." }),
									e?.isAdmin && /* @__PURE__ */ (0, W.jsx)("button", {
										type: "button",
										className: "cp-btn cp-primary",
										onClick: () => s("settings"),
										children: "Open settings"
									})
								] }) : /* @__PURE__ */ (0, W.jsxs)(W.Fragment, { children: [
									/* @__PURE__ */ (0, W.jsx)("h3", { children: Re ? "Let’s get this build green" : "What are we fixing?" }),
									/* @__PURE__ */ (0, W.jsx)("p", { children: "I can inspect jobs and builds, diagnose failures, generate and review Jenkinsfiles, and prepare approved pipeline or deployment recovery changes." }),
									Be && /* @__PURE__ */ (0, W.jsxs)("p", {
										className: "cp-empty-session",
										children: [
											"Continuing ",
											/* @__PURE__ */ (0, W.jsx)("b", { children: Be.title }),
											" ·",
											" ",
											Be.messageCount,
											" message",
											Be.messageCount === 1 ? "" : "s"
										]
									}),
									/* @__PURE__ */ (0, W.jsx)("div", {
										className: "cp-quick",
										children: ct.map((e) => /* @__PURE__ */ (0, W.jsx)("button", {
											type: "button",
											onClick: () => void Je(e),
											children: e
										}, e))
									})
								] })]
							}),
							c.map((e) => e.kind === "reasoning" ? /* @__PURE__ */ (0, W.jsx)(ia, { item: e }, e.id) : e.kind === "message" ? /* @__PURE__ */ (0, W.jsxs)("div", {
								className: `cp-msg ${e.role === "user" ? "cp-user" : ""} ${e.role === "assistant" && e.narration ? "cp-narration-msg" : ""}`,
								children: [e.role === "user" ? /* @__PURE__ */ (0, W.jsxs)(W.Fragment, { children: [/* @__PURE__ */ (0, W.jsx)("div", {
									className: "cp-msg-body",
									style: { whiteSpace: "pre-wrap" },
									children: e.text
								}), e.images && e.images.length > 0 && /* @__PURE__ */ (0, W.jsx)("div", {
									className: "cp-thumbs",
									children: e.images.map((e) => /* @__PURE__ */ (0, W.jsx)("span", {
										className: "cp-thumb",
										children: /* @__PURE__ */ (0, W.jsx)("img", {
											src: e.url,
											alt: e.fileName ?? "attachment"
										})
									}, e.url))
								})] }) : e.streaming || e.narration ? /* @__PURE__ */ (0, W.jsx)(W.Fragment, { children: /* @__PURE__ */ (0, W.jsxs)("div", {
									className: `cp-msg-body ${e.narration ? "cp-narration" : ""}`,
									style: { whiteSpace: "pre-wrap" },
									children: [e.text, e.streaming && /* @__PURE__ */ (0, W.jsx)("span", {
										className: "cp-cursor",
										role: "img",
										"aria-label": "Streaming"
									})]
								}) }) : /* @__PURE__ */ (0, W.jsx)(_i, { text: e.text }), e.role === "assistant" && !e.streaming && !e.narration && /* @__PURE__ */ (0, W.jsx)("div", {
									className: "cp-msg-foot",
									children: /* @__PURE__ */ (0, W.jsx)(oa, {
										text: e.text,
										label: "Copy response"
									})
								})]
							}, e.id) : e.kind === "tool" ? /* @__PURE__ */ (0, W.jsx)($i, { item: e }, e.id) : e.kind === "approval" ? /* @__PURE__ */ (0, W.jsx)(na, {
								item: e,
								onDecide: Qe
							}, e.id) : /* @__PURE__ */ (0, W.jsx)("div", {
								className: "cp-errline",
								role: "alert",
								children: e.text
							}, e.id)),
							ft && /* @__PURE__ */ (0, W.jsx)(eo, { toolName: ut?.toolName })
						]
					}),
					/* @__PURE__ */ (0, W.jsx)(ra, {
						approvals: He,
						onDecide: Qe
					}),
					/* @__PURE__ */ (0, W.jsxs)("div", {
						className: "cp-composer",
						onDragOver: (e) => e.preventDefault(),
						onDrop: (e) => {
							e.preventDefault();
							let t = Array.from(e.dataTransfer.files).filter((e) => e.type.startsWith("image/"));
							t.length > 0 && qe(t);
						},
						children: [M.length > 0 && /* @__PURE__ */ (0, W.jsx)("div", {
							className: "cp-thumbs",
							children: M.map((e, t) => /* @__PURE__ */ (0, W.jsxs)("span", {
								className: "cp-thumb",
								children: [/* @__PURE__ */ (0, W.jsx)("img", {
									src: e.previewUrl,
									alt: e.fileName
								}), /* @__PURE__ */ (0, W.jsx)("button", {
									type: "button",
									"aria-label": `Remove ${e.fileName}`,
									onClick: () => be((e) => e.filter((e, n) => n !== t)),
									children: /* @__PURE__ */ (0, W.jsx)(ji, {})
								})]
							}, `${e.fileName}-${t}`))
						}), /* @__PURE__ */ (0, W.jsxs)("div", {
							className: "cp-composer-box",
							children: [/* @__PURE__ */ (0, W.jsx)("textarea", {
								ref: we,
								className: "cp-textarea",
								placeholder: mt,
								value: O,
								rows: 1,
								disabled: k,
								onChange: (e) => {
									ie(e.target.value), e.target.style.height = "auto", e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
								},
								onPaste: (e) => {
									let t = Array.from(e.clipboardData.files).filter((e) => e.type.startsWith("image/"));
									t.length > 0 && (e.preventDefault(), qe(t));
								},
								onKeyDown: (e) => {
									e.key === "Enter" && !e.shiftKey && (e.preventDefault(), Je(O));
								},
								"aria-label": "Message"
							}), /* @__PURE__ */ (0, W.jsxs)("div", {
								className: "cp-composer-bar",
								children: [/* @__PURE__ */ (0, W.jsxs)("div", {
									className: "cp-bar-left",
									children: [
										/* @__PURE__ */ (0, W.jsx)("button", {
											type: "button",
											className: "cp-bar-btn",
											"data-tip": "Attach image",
											"aria-label": "Attach image",
											onClick: () => Te.current?.click(),
											children: /* @__PURE__ */ (0, W.jsx)(Hi, {})
										}),
										/* @__PURE__ */ (0, W.jsx)("input", {
											ref: Te,
											type: "file",
											accept: "image/png,image/jpeg,image/webp",
											multiple: !0,
											hidden: !0,
											onChange: (e) => {
												let t = Array.from(e.target.files ?? []);
												e.target.value = "", t.length > 0 && qe(t);
											}
										}),
										/* @__PURE__ */ (0, W.jsx)("span", {
											className: "cp-shield-wrap",
											"data-tip": e?.isAdmin ? Ve ? "Approvals are bypassed. Click to require approval again" : "Privileged actions need your approval. Click to bypass all approvals" : "Only administrators can bypass approvals",
											children: /* @__PURE__ */ (0, W.jsx)("button", {
												type: "button",
												className: `cp-shield ${Ve ? "cp-shield-bypass" : ""}`,
												"aria-label": Ve ? "Restore human approval" : "Bypass approvals",
												"aria-pressed": Ve,
												disabled: !e?.isAdmin || me,
												onClick: () => void R(),
												children: Ve ? /* @__PURE__ */ (0, W.jsx)(Ni, {}) : /* @__PURE__ */ (0, W.jsx)(Mi, {})
											})
										})
									]
								}), /* @__PURE__ */ (0, W.jsxs)("div", {
									className: "cp-bar-right",
									children: [
										g && g.providers.length > 0 && /* @__PURE__ */ (0, W.jsx)(fa, {
											accounts: g.providers,
											value: y,
											onSelect: (e) => {
												x(e.id), C(e.defaultModel || ""), je(e.id);
											}
										}),
										/* @__PURE__ */ (0, W.jsx)(pa, {
											accounts: g?.providers ?? [],
											accountId: y,
											model: S,
											models: w,
											onOpen: (e) => void je(e),
											onSelect: (e, t) => {
												x(e), C(t);
											},
											onRefresh: () => void je(y, !0)
										}),
										/* @__PURE__ */ (0, W.jsx)(ma, {
											value: ve,
											onChange: ot
										}),
										k ? /* @__PURE__ */ (0, W.jsx)("button", {
											type: "button",
											className: "cp-send",
											onClick: $e,
											"aria-label": "Stop",
											"data-tip": "Stop",
											children: /* @__PURE__ */ (0, W.jsx)(Ri, {})
										}) : /* @__PURE__ */ (0, W.jsx)("button", {
											type: "button",
											className: "cp-send",
											onClick: () => void Je(O),
											disabled: !O.trim() && M.length === 0,
											"aria-label": "Send",
											"data-tip": "Send (Enter)",
											children: /* @__PURE__ */ (0, W.jsx)(Si, {})
										})
									]
								})]
							})]
						})]
					})
				] })]
			}),
			/* @__PURE__ */ (0, W.jsx)("div", {
				id: "cp-portal",
				className: "cp-portal-root"
			}),
			/* @__PURE__ */ (0, W.jsx)(ao, {})
		]
	});
}
function co(e, t) {
	let n = [], r = /* @__PURE__ */ new Map();
	for (let t of e.messages) t.role === "TOOL" && t.toolCallId && r.set(t.toolCallId, t);
	for (let i of e.messages) if (i.role === "USER") n.push({
		kind: "message",
		id: `user-${n.length}-${i.content.slice(0, 12)}`,
		role: "user",
		text: i.content,
		images: (i.images ?? []).map((e) => ({
			id: e.id,
			url: ue(t, e.id),
			fileName: e.fileName
		}))
	});
	else if (i.role === "ASSISTANT") {
		i.content && i.content.trim() && n.push({
			kind: "message",
			id: `assistant-${n.length}`,
			role: "assistant",
			text: i.content
		});
		for (let e of i.toolCalls ?? []) {
			let t = r.get(e.id), i = {};
			try {
				i = JSON.parse(e.arguments);
			} catch {
				i = { raw: e.arguments };
			}
			let a = t?.content, o = "running";
			if (t) {
				o = "succeeded";
				try {
					let e = JSON.parse(t.content);
					typeof e.error == "string" && (o = "failed"), a = e;
				} catch {
					a = t.content;
				}
			}
			n.push({
				kind: "tool",
				id: `tool-${e.id}`,
				toolCallId: e.id,
				toolName: e.name,
				args: i,
				status: o,
				output: a
			});
		}
	}
	for (let t of e.pendingApprovals ?? []) {
		if (t.status !== "pending") continue;
		let e = {}, r = null;
		try {
			e = JSON.parse(t.argsJson);
		} catch {
			e = { raw: t.argsJson };
		}
		try {
			r = t.validationJson ? JSON.parse(t.validationJson) : null;
		} catch {
			r = null;
		}
		n.push({
			kind: "approval",
			id: `approval-${t.approvalId}`,
			approvalId: t.approvalId,
			toolCallId: t.toolCallId,
			toolName: t.toolName,
			target: t.target,
			args: e,
			risk: t.risk,
			reason: t.reason,
			diff: t.diff,
			validation: r,
			expiresAt: t.expiresAt,
			status: "pending"
		});
	}
	return n;
}
// src/styles.ts
var lo = "\n.cp-reset { all: initial; }\n.cp-shell {\n  --cp-bg: #f5f6f8;\n  --cp-panel: #ffffff;\n  --cp-panel-2: #f5f6f8;\n  --cp-text: #14161b;\n  --cp-muted: #5c6370;\n  --cp-faint: #858b97;\n  --cp-border: #e4e6eb;\n  --cp-border-strong: #cdd1d9;\n  --cp-success: #1f8a4c;\n  --cp-warning: #a8620a;\n  --cp-danger: #c0342c;\n  --cp-danger-soft: color-mix(in srgb, var(--cp-danger) 8%, transparent);\n  --cp-warning-soft: color-mix(in srgb, var(--cp-warning) 9%, transparent);\n  --cp-accent-soft: color-mix(in srgb, var(--cp-accent) 9%, transparent);\n  --cp-code: #14161b;\n  --cp-code-text: #e7e9ee;\n  --cp-code-muted: #9ba1ad;\n  --cp-tip-bg: #14161b;\n  --cp-tip-text: #ffffff;\n  --cp-shadow: -18px 0 50px rgba(15, 18, 28, .14);\n  --cp-pop: 0 10px 30px rgba(15, 18, 28, .18);\n  --cp-mono: ui-monospace, SFMono-Regular, \"SF Mono\", Menlo, Consolas, \"Liberation Mono\", monospace;\n  --cp-sans: var(--font-family-sans, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif);\n  --cp-serif: Georgia, \"Times New Roman\", \"Noto Serif\", serif;\n  --cp-ease: cubic-bezier(.22, .8, .24, 1);\n\n  /* Variables read by Jenkins' own status symbols. */\n  --card-background: var(--cp-panel);\n  --accent-color: var(--cp-accent);\n  --success-color: var(--cp-success);\n  --error-color: var(--cp-danger);\n  --warning-color: var(--cp-warning);\n  --skipped-color: var(--cp-faint);\n  --status-background-opacity: .12;\n  --status-border-opacity: .3;\n  --standard-transition: none;\n\n  position: fixed;\n  inset: 0;\n  z-index: 2147483000;\n  pointer-events: none;\n  font-family: var(--cp-sans);\n  color: var(--cp-text);\n  font-size: 13px;\n  line-height: 1.5;\n  -webkit-font-smoothing: antialiased;\n}\n.cp-shell[data-theme=\"dark\"] {\n  --cp-bg: #0e1016;\n  --cp-panel: #0e1016;\n  --cp-panel-2: #161922;\n  --cp-text: #e7e9ee;\n  --cp-muted: #a0a6b3;\n  --cp-faint: #7a8190;\n  --cp-border: #232733;\n  --cp-border-strong: #343a48;\n  --cp-success: #6fc48d;\n  --cp-warning: #e2a64b;\n  --cp-danger: #f0837a;\n  --cp-code: #090b10;\n  --cp-tip-bg: #e7e9ee;\n  --cp-tip-text: #0e1016;\n  --cp-shadow: -18px 0 60px rgba(0, 0, 0, .5);\n  --cp-pop: 0 12px 34px rgba(0, 0, 0, .5);\n}\n.cp-shell * { box-sizing: border-box; }\n.cp-shell svg { display: block; }\n.cp-shell button { font-family: var(--cp-sans); }\n.cp-shell :focus-visible { outline: 2px solid var(--cp-accent-ink); outline-offset: 1px; }\n.cp-sr {\n  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; border: 0;\n  overflow: hidden; clip-path: inset(50%); white-space: nowrap;\n}\n.cp-grow { flex: 1; }\n\n/* Copilot mark: ring and stage turn as one, so the mark keeps its shape */\n.cp-mark { width: 18px; height: 18px; flex: 0 0 auto; overflow: visible; }\n.cp-mark-ring, .cp-mark-stage { transform-box: view-box; transform-origin: 124px 128px; }\n.cp-mark-busy { color: var(--cp-accent-ink); }\n.cp-mark-busy .cp-mark-ring { animation: cp-mark-turn 1.7s cubic-bezier(.62, .04, .3, 1) infinite; }\n.cp-mark-busy .cp-mark-stage { animation: cp-mark-turn 1.7s cubic-bezier(.62, .04, .3, 1) infinite, cp-mark-hold 1.7s ease-in-out infinite; }\n.cp-mark-still { color: var(--cp-faint); }\n@keyframes cp-mark-turn { to { transform: rotate(360deg); } }\n@keyframes cp-mark-hold {\n  0%, 100% { opacity: 1; }\n  50% { opacity: .45; }\n}\n\n/* Shimmering text, for anything in progress */\n.cp-shimmer {\n  color: var(--cp-muted);\n  background: linear-gradient(100deg, var(--cp-muted) 35%, var(--cp-accent-ink) 50%, var(--cp-muted) 65%);\n  background-size: 260% 100%;\n  -webkit-background-clip: text;\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n  animation: cp-shimmer 2.2s linear infinite, cp-fade .3s ease-out;\n}\n@keyframes cp-shimmer {\n  from { background-position: 130% 0; }\n  to { background-position: -130% 0; }\n}\n@keyframes cp-fade { from { opacity: 0; } }\n@keyframes cp-rise { from { opacity: 0; transform: translateY(5px); } }\n@keyframes cp-pop-in { from { opacity: 0; transform: translateY(3px) scale(.985); } }\n\n/* Height animation that works for content of any size */\n.cp-fold {\n  display: grid; grid-template-rows: 0fr; min-width: 0;\n  transition: grid-template-rows .24s var(--cp-ease);\n}\n.cp-fold-open { grid-template-rows: 1fr; }\n.cp-fold-inner {\n  min-height: 0; min-width: 0; overflow: hidden; visibility: hidden;\n  transition: visibility 0s linear .24s, opacity .2s ease; opacity: 0;\n}\n.cp-fold-open > .cp-fold-inner { visibility: visible; opacity: 1; transition-delay: 0s; }\n\n/* Tooltip */\n.cp-tip {\n  position: fixed; z-index: 2147483004; pointer-events: none; max-width: 280px;\n  padding: 4px 8px; border-radius: 5px; background: var(--cp-tip-bg); color: var(--cp-tip-text);\n  font-family: var(--cp-sans); font-size: 11.5px; line-height: 1.4; overflow-wrap: anywhere;\n}\n.cp-tip-show { animation: cp-tip-in .12s ease-out; }\n@keyframes cp-tip-in { from { opacity: 0; transform: translateY(2px); } }\n.cp-tip-below.cp-tip-show { animation-name: cp-tip-in-below; }\n@keyframes cp-tip-in-below { from { opacity: 0; transform: translateY(-2px); } }\n\n/* Status icons */\n.cp-statusicon { display: inline-flex; width: 16px; height: 16px; flex: 0 0 auto; border-radius: 50%; cursor: default; }\n.cp-statusicon svg { width: 100%; height: 100%; }\n.cp-statusicon .app-status-icon-running { transform-box: fill-box; transform-origin: center; animation: cp-status-run 1.2s ease-in-out infinite; }\n@keyframes cp-status-run {\n  0%, 100% { transform: scale(.7); opacity: .55; }\n  50% { transform: scale(2.1); opacity: 1; }\n}\n\n/* Floating button */\n.cp-fab {\n  pointer-events: auto; position: fixed; right: 22px; bottom: 22px;\n  width: 46px; height: 46px; border-radius: 50%; border: 0;\n  background: var(--cp-accent); color: var(--cp-on-accent);\n  display: grid; place-items: center; cursor: pointer;\n  box-shadow: 0 6px 18px rgba(15, 18, 28, .3);\n  transition: transform .2s var(--cp-ease), box-shadow .2s ease;\n  animation: cp-pop-in .25s var(--cp-ease);\n}\n.cp-fab:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(15, 18, 28, .36); }\n.cp-fab .cp-mark { width: 24px; height: 24px; }\n.cp-fab:hover .cp-mark-ring, .cp-fab:hover .cp-mark-stage { animation: cp-mark-turn .7s cubic-bezier(.62, .04, .3, 1); }\n.cp-fab-alert { background: var(--cp-danger); color: #fff; }\n.cp-shell[data-theme=\"dark\"] .cp-fab-alert { background: #b3322c; }\n.cp-fab-alert::after {\n  content: ''; position: absolute; inset: 0; border-radius: 50%;\n  border: 2px solid #d9443d; animation: cp-fab-ring 2s var(--cp-ease) infinite;\n}\n@keyframes cp-fab-ring {\n  from { transform: scale(1); opacity: .8; }\n  to { transform: scale(1.65); opacity: 0; }\n}\n\n/* Drawer */\n.cp-drawer {\n  pointer-events: auto; position: fixed; top: 0; right: 0; bottom: 0;\n  width: 440px; max-width: 100vw; background: var(--cp-panel);\n  border-left: 1px solid var(--cp-border); box-shadow: var(--cp-shadow);\n  display: flex; flex-direction: column; transform: translateX(100%); visibility: hidden;\n  transition: transform .28s var(--cp-ease), visibility 0s linear .28s;\n}\n.cp-drawer.cp-open { transform: translateX(0); visibility: visible; transition-delay: 0s; }\n.cp-resize { position: absolute; left: -3px; top: 0; bottom: 0; width: 6px; cursor: col-resize; z-index: 2; transition: background .15s ease; }\n.cp-resize:hover { background: color-mix(in srgb, var(--cp-accent) 40%, transparent); }\n\n/* Header */\n.cp-head { padding: 10px 12px 9px 8px; border-bottom: 1px solid var(--cp-border); display: flex; flex-direction: column; gap: 5px; }\n.cp-head-row { display: flex; align-items: center; gap: 1px; }\n.cp-logo { color: var(--cp-accent-ink); display: grid; place-items: center; flex: 0 0 auto; margin: 0 7px 0 3px; }\n.cp-logo .cp-mark { width: 20px; height: 20px; }\n.cp-logo-alert { color: var(--cp-danger); }\n.cp-title { font-family: var(--cp-serif); font-weight: 700; font-size: 16px; letter-spacing: -.005em; white-space: nowrap; }\n.cp-head-text { min-width: 0; overflow: hidden; }\n.cp-context {\n  display: flex; align-items: center; gap: 6px; min-width: 0; min-height: 20px;\n  padding-left: 7px; color: var(--cp-muted); font-size: 12px;\n}\n.cp-context-job { font-weight: 600; color: var(--cp-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 0 1 auto; }\n.cp-context-build { font-variant-numeric: tabular-nums; flex: 0 0 auto; }\n.cp-context-session { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; flex: 1 1 0; color: var(--cp-muted); }\n.cp-context-session::before { content: '/'; margin-right: 6px; color: var(--cp-faint); }\n.cp-context-flags { display: flex; align-items: center; gap: 4px; margin-left: auto; flex: 0 0 auto; }\n.cp-flag { display: grid; place-items: center; width: 18px; height: 18px; color: var(--cp-faint); border-radius: 4px; cursor: default; }\n.cp-flag svg { width: 14px; height: 14px; }\n.cp-flag-danger { color: var(--cp-danger); }\n\n.cp-iconbtn, .cp-bar-btn, .cp-session-new, .cp-session-action, .cp-menu-refresh {\n  border: 0; background: transparent; color: var(--cp-muted); cursor: pointer;\n  width: 28px; height: 28px; padding: 0; border-radius: 5px;\n  display: grid; place-items: center; flex: 0 0 auto;\n  transition: background .14s ease, color .14s ease;\n}\n.cp-iconbtn:hover, .cp-bar-btn:hover, .cp-session-new:hover, .cp-session-action:hover, .cp-menu-refresh:hover {\n  background: color-mix(in srgb, var(--cp-text) 8%, transparent); color: var(--cp-text);\n}\n.cp-iconbtn:active, .cp-bar-btn:active { transform: scale(.94); }\n.cp-iconbtn svg, .cp-bar-btn svg { width: 16px; height: 16px; }\n.cp-back-chevron { transform: rotate(90deg); }\n\n/* Thread */\n.cp-thread {\n  flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; padding: 16px 16px 10px;\n  display: flex; flex-direction: column; gap: 12px;\n  scrollbar-width: thin; scrollbar-color: var(--cp-border-strong) transparent;\n}\n.cp-thread > * { flex: 0 0 auto; animation: cp-rise .26s var(--cp-ease); }\n.cp-thread::-webkit-scrollbar, .cp-sessions-scroll::-webkit-scrollbar, .cp-settings-scroll::-webkit-scrollbar, .cp-menu-scroll::-webkit-scrollbar, .cp-reasoning-body::-webkit-scrollbar { width: 8px; }\n.cp-thread::-webkit-scrollbar-thumb, .cp-sessions-scroll::-webkit-scrollbar-thumb, .cp-settings-scroll::-webkit-scrollbar-thumb, .cp-menu-scroll::-webkit-scrollbar-thumb, .cp-reasoning-body::-webkit-scrollbar-thumb { background: var(--cp-border-strong); border-radius: 8px; }\n\n/* Empty state */\n.cp-empty { margin: auto 0; display: flex; flex-direction: column; gap: 9px; max-width: 420px; }\n.cp-empty h3 { margin: 0; font-family: var(--cp-serif); font-size: 21px; font-weight: 400; letter-spacing: -.01em; line-height: 1.25; }\n.cp-empty p { margin: 0; color: var(--cp-muted); font-size: 12.5px; }\n.cp-empty-session { font-size: 12px; }\n.cp-quick { display: flex; flex-direction: column; margin-top: 6px; border-top: 1px solid var(--cp-border); }\n.cp-quick button {\n  display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;\n  border: 0; border-bottom: 1px solid var(--cp-border); background: transparent;\n  color: var(--cp-text); padding: 9px 2px; font-size: 12.5px; cursor: pointer;\n  transition: color .14s ease, padding .18s var(--cp-ease);\n}\n.cp-quick button::after { content: '→'; margin-left: auto; color: var(--cp-faint); opacity: 0; transform: translateX(-4px); transition: opacity .14s ease, transform .18s var(--cp-ease); }\n.cp-quick button:hover { color: var(--cp-accent-ink); padding-left: 6px; }\n.cp-quick button:hover::after { opacity: 1; transform: none; color: var(--cp-accent-ink); }\n\n.cp-alert { display: flex; flex-direction: column; gap: 8px; padding-bottom: 14px; margin-bottom: 8px; border-bottom: 1px solid var(--cp-border); }\n.cp-alert-title { display: flex; align-items: center; gap: 8px; font-family: var(--cp-serif); font-size: 18px; line-height: 1.25; }\n.cp-alert-title .cp-statusicon { width: 22px; height: 22px; }\n.cp-alert p { color: var(--cp-text); font-size: 12.5px; line-height: 1.55; }\n.cp-alert-actions { display: flex; gap: 6px; flex-wrap: wrap; }\n\n/* Messages */\n.cp-msg { display: flex; flex-direction: column; gap: 3px; min-width: 0; }\n.cp-msg-body { overflow-wrap: anywhere; line-height: 1.6; font-size: 13.5px; min-width: 0; animation: cp-fade .22s ease-out; }\n.cp-msg.cp-user { align-self: flex-end; max-width: 88%; }\n.cp-msg.cp-user .cp-msg-body {\n  padding: 7px 11px; background: var(--cp-accent-soft); border-radius: 8px 8px 2px 8px; line-height: 1.5; font-size: 13px;\n}\n.cp-msg.cp-user .cp-thumbs { justify-content: flex-end; }\n.cp-narration-msg .cp-msg-body { color: var(--cp-muted); font-size: 12.5px; line-height: 1.5; }\n.cp-msg-body > :first-child { margin-top: 0; }\n.cp-msg-body > :last-child { margin-bottom: 0; }\n.cp-msg-body p { margin: 0 0 9px; }\n.cp-msg-body h1, .cp-msg-body h2, .cp-msg-body h3, .cp-msg-body h4 { margin: 14px 0 6px; font-family: var(--cp-serif); font-size: 15px; font-weight: 700; }\n.cp-msg-body ul, .cp-msg-body ol { margin: 4px 0 9px; padding-left: 20px; }\n.cp-msg-body li { margin: 3px 0; }\n.cp-msg-body li::marker { color: var(--cp-faint); }\n.cp-msg-body code {\n  font-family: var(--cp-mono); font-size: .86em; background: color-mix(in srgb, var(--cp-text) 7%, transparent);\n  border-radius: 3px; padding: 1px 4px;\n}\n.cp-msg-body a { color: var(--cp-accent-ink); text-decoration: underline; text-underline-offset: 2px; }\n.cp-msg-body blockquote { margin: 7px 0; padding: 1px 0 1px 11px; border-left: 2px solid var(--cp-accent); color: var(--cp-muted); }\n.cp-msg-body table { border-collapse: collapse; width: 100%; margin: 7px 0; font-size: 12px; display: block; overflow-x: auto; }\n.cp-msg-body th, .cp-msg-body td { border-bottom: 1px solid var(--cp-border); padding: 5px 10px 5px 0; text-align: left; }\n.cp-msg-body th { font-weight: 600; border-bottom-color: var(--cp-border-strong); }\n.cp-msg-foot { display: flex; height: 22px; align-items: center; justify-content: flex-end; }\n.cp-copy-btn {\n  width: 24px; height: 22px; padding: 0; margin-left: 0; border: 0; border-radius: 4px; background: transparent; color: var(--cp-faint);\n  display: grid; place-items: center; cursor: pointer; opacity: .55;\n  transition: opacity .14s ease, background .14s ease, color .14s ease;\n}\n.cp-msg:hover .cp-copy-btn, .cp-copy-btn:focus-visible, .cp-copy-btn-done { opacity: 1; }\n.cp-copy-btn:hover { background: color-mix(in srgb, var(--cp-text) 8%, transparent); color: var(--cp-text); }\n.cp-copy-btn:disabled { opacity: 0; cursor: not-allowed; }\n.cp-copy-btn svg { width: 14px; height: 14px; }\n.cp-copy-btn-done, .cp-copy-btn-done:hover { color: var(--cp-success); }\n@media (hover: none) { .cp-copy-btn { opacity: 1; } }\n\n.cp-code { margin: 9px 0; border-radius: 6px; overflow: hidden; background: var(--cp-code); }\n.cp-code-head {\n  display: flex; align-items: center; gap: 8px; padding: 4px 6px 4px 11px;\n  border-bottom: 1px solid rgba(255,255,255,.07); color: var(--cp-code-muted); font-size: 11px; font-family: var(--cp-mono);\n}\n.cp-copy { border: 0; background: transparent; color: var(--cp-code-muted); cursor: pointer; font-size: 11px; font-family: var(--cp-mono); padding: 2px 6px; border-radius: 4px; }\n.cp-copy:hover { color: #fff; background: rgba(255,255,255,.08); }\n.cp-code pre { margin: 0; padding: 10px 11px; overflow-x: auto; color: var(--cp-code-text); font-family: var(--cp-mono); font-size: 12px; line-height: 1.55; }\n.cp-code pre code { background: transparent; padding: 0; color: inherit; font-size: inherit; }\n.hljs-keyword, .hljs-selector-tag, .hljs-built_in, .hljs-name { color: #e6a06f; }\n.hljs-string, .hljs-attr, .hljs-symbol, .hljs-bullet { color: #a9c98a; }\n.hljs-comment, .hljs-quote { color: #7c8494; font-style: italic; }\n.hljs-number, .hljs-literal, .hljs-variable, .hljs-template-variable { color: #8fbcd4; }\n.hljs-title, .hljs-section, .hljs-type { color: #e3c678; }\n.cp-cursor {\n  display: inline-block; width: 2px; height: 1.05em; margin-left: 2px; vertical-align: -.16em;\n  background: var(--cp-accent-ink); border-radius: 1px; animation: cp-caret 1s ease-in-out infinite;\n}\n@keyframes cp-caret { 0%, 100% { opacity: 1; } 50% { opacity: .15; } }\n\n/* Working line */\n.cp-working { display: flex; align-items: center; gap: 8px; min-height: 22px; font-size: 12.5px; color: var(--cp-muted); }\n.cp-working-time { font-family: var(--cp-mono); font-size: 11px; color: var(--cp-faint); font-variant-numeric: tabular-nums; }\n\n/* Thought process */\n.cp-reasoning { display: flex; flex-direction: column; min-width: 0; }\n.cp-reasoning-head {\n  display: inline-flex; align-items: center; gap: 8px; align-self: flex-start;\n  border: 0; background: transparent; color: var(--cp-muted); cursor: pointer;\n  padding: 2px 4px 2px 0; font-size: 12.5px; text-align: left; border-radius: 4px;\n  transition: color .14s ease;\n}\n.cp-reasoning-head:hover { color: var(--cp-text); }\n.cp-reasoning-chevron { width: 12px; height: 12px; opacity: .7; transition: transform .22s var(--cp-ease); }\n.cp-reasoning-open .cp-reasoning-chevron { transform: rotate(180deg); }\n.cp-reasoning-body {\n  margin: 5px 0 2px 8px; padding: 1px 0 1px 17px; border-left: 1px solid var(--cp-border-strong);\n  color: var(--cp-muted); font-size: 12.5px; line-height: 1.6;\n  white-space: pre-wrap; overflow-wrap: anywhere; max-height: 240px; overflow-y: auto; scrollbar-width: thin;\n}\n.cp-reasoning-live .cp-reasoning-clipped {\n  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 22px);\n  mask-image: linear-gradient(to bottom, transparent 0, #000 22px);\n}\n\n/* Tool ledger: consecutive tools share a rail */\n.cp-tool { position: relative; min-width: 0; }\n.cp-tool + .cp-tool { margin-top: -10px; }\n.cp-tool + .cp-tool::before {\n  content: ''; position: absolute; left: 8px; top: -3px; height: 9px; width: 1px; background: var(--cp-border-strong);\n}\n.cp-tool-head { display: flex; align-items: center; gap: 2px; min-height: 26px; }\n.cp-tool-toggle {\n  flex: 1; min-width: 0; display: flex; align-items: center; gap: 7px; height: 26px; padding: 0 5px;\n  border: 0; border-radius: 4px; background: transparent; color: var(--cp-text); cursor: pointer; text-align: left;\n  transition: background .14s ease;\n}\n.cp-tool-toggle:hover { background: color-mix(in srgb, var(--cp-text) 6%, transparent); }\n.cp-tool-icon { width: 14px; height: 14px; color: var(--cp-faint); flex: 0 0 auto; }\n.cp-tool-name { font-family: var(--cp-mono); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 0 1 auto; min-width: 0; }\n.cp-tool-running .cp-tool-name { color: var(--cp-accent-ink); }\n.cp-tool-failed .cp-tool-name { color: var(--cp-danger); }\n.cp-tool-target { color: var(--cp-muted); font-size: 11.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 0 2 auto; min-width: 0; }\n.cp-tool-chevron { width: 12px; height: 12px; margin-left: auto; color: var(--cp-faint); opacity: 0; flex: 0 0 auto; transition: transform .22s var(--cp-ease), opacity .14s ease; }\n.cp-tool-toggle:hover .cp-tool-chevron, .cp-tool-toggle:focus-visible .cp-tool-chevron, .cp-tool-open .cp-tool-chevron { opacity: 1; }\n.cp-tool-open .cp-tool-chevron { transform: rotate(180deg); }\n.cp-tool-body { margin: 3px 0 6px 8px; padding: 2px 0 2px 17px; border-left: 1px solid var(--cp-border-strong); display: flex; flex-direction: column; gap: 7px; }\n.cp-label { font-size: 11px; color: var(--cp-muted); margin-bottom: 3px; }\n.cp-pre {\n  margin: 0; padding: 8px 9px; background: var(--cp-code); color: var(--cp-code-text); border-radius: 5px;\n  font-family: var(--cp-mono); font-size: 11.5px; line-height: 1.5; max-height: 220px; overflow: auto;\n  white-space: pre-wrap; overflow-wrap: anywhere;\n}\n\n/* Approvals */\n.cp-approval {\n  border-left: 3px solid var(--cp-warning); background: var(--cp-warning-soft); border-radius: 0 6px 6px 0; padding: 10px 12px 12px;\n  display: flex; flex-direction: column; gap: 8px; transition: border-color .2s ease, background .2s ease;\n}\n.cp-approval.cp-risk3 { border-left-color: var(--cp-danger); background: var(--cp-danger-soft); }\n.cp-approval-approved, .cp-approval-approved.cp-risk3 { border-left-color: var(--cp-success); background: color-mix(in srgb, var(--cp-success) 8%, transparent); }\n.cp-approval-rejected, .cp-approval-rejected.cp-risk3 { border-left-color: var(--cp-faint); background: color-mix(in srgb, var(--cp-text) 4%, transparent); }\n.cp-approval-head { display: flex; align-items: center; gap: 8px; }\n.cp-approval-title { font-family: var(--cp-serif); font-size: 15px; font-weight: 700; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cp-risk { position: relative; display: grid; place-items: center; width: 22px; height: 22px; margin-left: auto; border-radius: 4px; cursor: default; }\n.cp-risk svg { width: 17px; height: 17px; }\n.cp-risk.cp-r2 { color: var(--cp-warning); }\n.cp-risk.cp-r3 { color: var(--cp-danger); }\n.cp-approval-body { display: flex; flex-direction: column; gap: 9px; }\n.cp-kv { display: grid; grid-template-columns: 58px 1fr; gap: 3px 8px; margin: 0; font-size: 12.5px; }\n.cp-kv dt { color: var(--cp-muted); }\n.cp-kv dd { margin: 0; font-family: var(--cp-mono); font-size: 12px; overflow-wrap: anywhere; }\n.cp-validation { display: flex; gap: 7px; align-items: center; font-size: 12.5px; }\n.cp-disclose {\n  display: inline-flex; align-items: center; gap: 5px; align-self: flex-start; padding: 2px 4px 2px 0;\n  border: 0; background: transparent; color: var(--cp-text); font-size: 12.5px; font-weight: 600; cursor: pointer; border-radius: 4px;\n}\n.cp-disclose svg { width: 12px; height: 12px; transform: rotate(-90deg); transition: transform .22s var(--cp-ease); }\n.cp-disclose:hover { color: var(--cp-accent-ink); }\n.cp-disclose-open svg { transform: none; }\n.cp-approval details summary { font-size: 12px; color: var(--cp-muted); margin: 0; }\n.cp-approval details .cp-pre { margin-top: 5px; }\n.cp-actions { display: flex; gap: 6px; align-items: center; }\n.cp-input {\n  flex: 1; min-width: 0; background: var(--cp-panel); border: 1px solid var(--cp-border-strong);\n  border-radius: 5px; padding: 6px 8px; color: var(--cp-text); font-size: 12.5px; font-family: var(--cp-sans);\n  transition: border-color .14s ease;\n}\n.cp-input:focus { outline: none; border-color: var(--cp-accent-ink); }\n.cp-input::placeholder, .cp-field input::placeholder, .cp-session-search::placeholder { color: var(--cp-faint); }\n.cp-btn {\n  border: 1px solid var(--cp-border-strong); background: transparent; color: var(--cp-text);\n  border-radius: 5px; padding: 5px 11px; font-size: 12.5px; font-weight: 600; cursor: pointer;\n  font-family: var(--cp-sans); white-space: nowrap;\n  transition: background .14s ease, border-color .14s ease, color .14s ease, transform .1s ease;\n}\n.cp-btn:hover { background: color-mix(in srgb, var(--cp-text) 6%, transparent); }\n.cp-btn:active { transform: translateY(1px); }\n.cp-btn.cp-primary { background: var(--cp-accent); border-color: var(--cp-accent); color: var(--cp-on-accent); }\n.cp-btn.cp-primary:hover { background: color-mix(in srgb, var(--cp-accent) 88%, var(--cp-text)); }\n.cp-btn.cp-danger { color: var(--cp-danger); border-color: color-mix(in srgb, var(--cp-danger) 50%, var(--cp-border)); }\n.cp-btn.cp-danger:hover { background: var(--cp-danger-soft); }\n.cp-btn:disabled { opacity: .5; cursor: not-allowed; }\n.cp-btn.cp-btn-sm { padding: 3px 9px; font-size: 12px; }\n.cp-diff { border-radius: 5px; overflow: hidden; background: var(--cp-code); }\n.cp-diff-head { display: flex; align-items: center; gap: 6px; padding: 5px 10px; border-bottom: 1px solid rgba(255,255,255,.07); color: var(--cp-code-muted); font-size: 11px; font-family: var(--cp-mono); }\n.cp-diff pre { margin: 0; padding: 6px 0; overflow: auto; max-height: 300px; font-family: var(--cp-mono); font-size: 11.5px; line-height: 1.55; color: var(--cp-code-text); }\n.cp-diff .cp-line { display: block; padding: 0 10px; white-space: pre; width: max-content; min-width: 100%; }\n.cp-diff .cp-add { background: rgba(111, 196, 141, .14); color: #a6dcb7; }\n.cp-diff .cp-del { background: rgba(236, 128, 119, .14); color: #f0a9a2; }\n.cp-diff .cp-hunk { color: var(--cp-code-muted); }\n.cp-errline { padding: 7px 10px; border-left: 3px solid var(--cp-danger); background: var(--cp-danger-soft); color: var(--cp-danger); border-radius: 0 5px 5px 0; font-size: 12.5px; }\n.cp-banner { padding: 6px 14px; background: var(--cp-warning-soft); color: var(--cp-warning); font-size: 12px; border-bottom: 1px solid var(--cp-border); animation: cp-fade .2s ease-out; }\n\n/* Approval dock */\n.cp-approval-dock {\n  flex: 0 0 auto; display: flex; align-items: center; gap: 8px; padding: 7px 14px;\n  border-top: 1px solid var(--cp-border); background: var(--cp-warning-soft); animation: cp-rise .24s var(--cp-ease);\n}\n.cp-approval-dock-risk3 { background: var(--cp-danger-soft); }\n.cp-approval-dock-main { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }\n.cp-approval-dock-main svg { width: 15px; height: 15px; color: var(--cp-warning); flex: 0 0 auto; }\n.cp-approval-dock-risk3 .cp-approval-dock-main svg { color: var(--cp-danger); }\n.cp-approval-dock-text { min-width: 0; }\n.cp-approval-dock-title { font-size: 12.5px; font-weight: 600; }\n.cp-approval-dock-meta { font-size: 11.5px; font-family: var(--cp-mono); color: var(--cp-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cp-approval-dock-actions { display: flex; align-items: center; gap: 4px; flex: 0 0 auto; }\n\n/* Composer */\n.cp-composer { border-top: 1px solid var(--cp-border); padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }\n.cp-composer-box {\n  border: 1px solid var(--cp-border-strong); border-radius: 8px; background: var(--cp-panel-2);\n  padding: 6px 6px 5px; display: flex; flex-direction: column; gap: 2px;\n  transition: border-color .16s ease; container-type: inline-size;\n}\n.cp-composer-box:focus-within { border-color: var(--cp-accent-ink); }\n.cp-textarea {\n  border: 0; background: transparent; outline: none; resize: none; width: 100%; padding: 4px 6px; min-height: 30px; max-height: 160px;\n  color: var(--cp-text); font-family: var(--cp-sans); font-size: 13.5px; line-height: 1.45;\n}\n.cp-shell .cp-textarea:focus-visible { outline: none; }\n.cp-textarea::placeholder { color: var(--cp-faint); }\n.cp-composer-bar { display: flex; align-items: center; gap: 2px; min-width: 0; }\n.cp-bar-left { display: flex; align-items: center; gap: 1px; }\n.cp-bar-right { display: flex; align-items: center; gap: 1px; margin-left: auto; min-width: 0; }\n.cp-shield-wrap { display: inline-flex; border-radius: 5px; }\n.cp-shield {\n  width: 28px; height: 28px; padding: 0; display: grid; place-items: center; color: var(--cp-success);\n  cursor: pointer; border: 0; background: transparent; border-radius: 5px; transition: background .14s ease, color .14s ease;\n}\n.cp-shield:hover { background: color-mix(in srgb, var(--cp-text) 8%, transparent); }\n.cp-shield:disabled { pointer-events: none; opacity: .5; }\n.cp-shield svg { width: 16px; height: 16px; }\n.cp-shield-bypass { color: var(--cp-danger); background: var(--cp-danger-soft); }\n.cp-pill {\n  display: inline-flex; align-items: center; gap: 4px; height: 28px; padding: 0 5px; border-radius: 5px; border: 0;\n  background: transparent; color: var(--cp-muted); min-width: 0; cursor: pointer; font-family: var(--cp-sans);\n  transition: background .14s ease, color .14s ease;\n}\n.cp-pill:hover, .cp-pill-active { background: color-mix(in srgb, var(--cp-text) 8%, transparent); color: var(--cp-text); }\n.cp-pill-icon { display: block; width: 14px; height: 14px; flex: 0 0 auto; }\n.cp-pill-icon svg { width: 100%; height: 100%; }\n.cp-pill-chevron { width: 10px; height: 10px; opacity: .55; flex: 0 0 auto; }\n.cp-pill-value { font-size: 11.5px; max-width: 124px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cp-pill-thinking { flex: 0 0 auto; }\n@container (max-width: 470px) {\n  .cp-pill-provider { flex: 0 0 auto; }\n  .cp-pill-provider .cp-pill-value { display: none; }\n}\n@container (max-width: 330px) {\n  .cp-pill-thinking .cp-pill-value { display: none; }\n}\n.cp-composer .cp-send {\n  width: 30px; height: 30px; border-radius: 6px; border: 0; background: var(--cp-accent); color: var(--cp-on-accent);\n  display: grid; place-items: center; cursor: pointer; padding: 0; margin-left: 3px; flex: 0 0 auto;\n  transition: opacity .16s ease, transform .16s var(--cp-ease), background .14s ease;\n}\n.cp-composer .cp-send:hover:not(:disabled) { transform: translateY(-1px); }\n.cp-composer .cp-send svg { width: 14px; height: 14px; }\n.cp-composer .cp-send:disabled { background: color-mix(in srgb, var(--cp-text) 12%, transparent); color: var(--cp-faint); cursor: not-allowed; }\n.cp-thumbs { display: flex; gap: 6px; flex-wrap: wrap; }\n.cp-thumb { position: relative; width: 54px; height: 54px; border-radius: 6px; overflow: hidden; background: var(--cp-panel-2); display: inline-flex; animation: cp-pop-in .2s var(--cp-ease); }\n.cp-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }\n.cp-thumb button { position: absolute; top: 2px; right: 2px; width: 17px; height: 17px; padding: 0; border-radius: 50%; border: 0; background: rgba(14, 16, 22, .78); color: #fff; cursor: pointer; display: grid; place-items: center; }\n.cp-thumb button svg { width: 10px; height: 10px; }\n\n/* Dialog */\n.cp-confirm-backdrop {\n  position: fixed; inset: 0; z-index: 2147483003; display: grid; place-items: center; padding: 20px;\n  background: rgba(9, 11, 16, .5); pointer-events: auto; animation: cp-fade .16s ease-out;\n}\n.cp-confirm {\n  width: min(360px, 100%); background: var(--cp-panel); color: var(--cp-text);\n  border-radius: 8px; box-shadow: var(--cp-pop); padding: 18px; animation: cp-pop-in .2s var(--cp-ease);\n}\n.cp-confirm h3 { margin: 0 0 7px; font-family: var(--cp-serif); font-size: 17px; font-weight: 700; }\n.cp-confirm p { margin: 0; color: var(--cp-muted); font-size: 12.5px; line-height: 1.55; overflow-wrap: anywhere; }\n.cp-confirm-actions { display: flex; justify-content: flex-end; gap: 7px; margin-top: 16px; }\n\n/* Menus */\n.cp-portal-root { position: fixed; inset: 0; pointer-events: none; z-index: 2147483001; }\n.cp-menu {\n  pointer-events: auto; display: flex; flex-direction: column; min-height: 0; overflow: hidden;\n  background: var(--cp-panel); color: var(--cp-text); border: 1px solid var(--cp-border);\n  border-radius: 7px; box-shadow: var(--cp-pop); padding: 4px; font-family: var(--cp-sans); font-size: 12.5px;\n  animation: cp-pop-in .14s var(--cp-ease);\n}\n.cp-menu-search { display: flex; align-items: center; gap: 4px; padding: 2px 2px 5px; border-bottom: 1px solid var(--cp-border); margin-bottom: 4px; }\n.cp-menu-search input { flex: 1; min-width: 0; height: 28px; border: 0; background: transparent; color: var(--cp-text); padding: 0 6px; font-size: 12.5px; font-family: var(--cp-sans); }\n.cp-shell .cp-menu-search input:focus-visible { outline: none; }\n.cp-menu-refresh svg { width: 14px; height: 14px; }\n.cp-menu-scroll { overflow-y: auto; min-height: 0; scrollbar-width: thin; }\n.cp-menu-label { display: flex; align-items: center; gap: 6px; padding: 7px 8px 3px; font-size: 11.5px; font-weight: 600; color: var(--cp-muted); }\n.cp-menu-label-meta { margin-left: auto; font-weight: 400; font-size: 11px; color: var(--cp-faint); }\n.cp-menu-group + .cp-menu-group { border-top: 1px solid var(--cp-border); margin-top: 3px; }\n.cp-menu-empty { padding: 8px; color: var(--cp-muted); font-size: 12px; }\n.cp-menu-error { color: var(--cp-danger); overflow-wrap: anywhere; }\n.cp-menu-item {\n  display: flex; align-items: center; gap: 8px; width: 100%; border: 0; background: transparent; color: var(--cp-text);\n  padding: 6px 8px; border-radius: 4px; cursor: pointer; text-align: left; font-family: var(--cp-sans); font-size: 12.5px;\n}\n.cp-menu-item:hover, .cp-menu-item-active { background: color-mix(in srgb, var(--cp-text) 7%, transparent); }\n.cp-menu-item-selected, .cp-menu-item-selected:hover, .cp-menu-item-selected.cp-menu-item-active { background: var(--cp-accent-soft); }\n.cp-menu-item-icon { width: 14px; height: 14px; color: var(--cp-muted); flex: 0 0 auto; }\n.cp-menu-item-selected .cp-menu-item-icon { color: var(--cp-accent-ink); }\n.cp-menu-item-main { display: flex; flex-direction: column; min-width: 0; flex: 1; }\n.cp-menu-item-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cp-menu-item-meta { color: var(--cp-muted); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cp-menu-check { width: 14px; height: 14px; color: var(--cp-accent-ink); flex: 0 0 auto; }\n\n/* Session manager */\n.cp-sessions, .cp-settings { display: flex; flex-direction: column; min-height: 0; flex: 1; animation: cp-fade .18s ease-out; }\n.cp-sessions-head { padding: 10px 12px 10px 14px; border-bottom: 1px solid var(--cp-border); display: flex; flex-direction: column; gap: 8px; }\n.cp-sessions-title-row { display: flex; align-items: baseline; gap: 7px; }\n.cp-sessions-title-row .cp-bar-btn { align-self: center; }\n.cp-sessions-title { font-family: var(--cp-serif); font-weight: 700; font-size: 16px; }\n.cp-sessions-count { font-size: 12px; color: var(--cp-faint); font-variant-numeric: tabular-nums; }\n.cp-session-search {\n  width: 100%; height: 30px; border: 1px solid var(--cp-border-strong); border-radius: 5px; background: var(--cp-panel-2);\n  color: var(--cp-text); padding: 0 9px; font-size: 12.5px; font-family: var(--cp-sans); transition: border-color .14s ease;\n}\n.cp-session-search:focus { outline: none; border-color: var(--cp-accent-ink); }\n.cp-sessions-scroll { flex: 1; overflow-y: auto; padding: 8px 8px 18px; scrollbar-width: thin; }\n.cp-session-empty { padding: 28px 12px; text-align: center; color: var(--cp-muted); font-size: 12.5px; }\n.cp-session-group { margin-bottom: 8px; }\n.cp-session-group-head { display: flex; align-items: center; gap: 2px; border-radius: 5px; }\n.cp-session-group-toggle {\n  flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; border: 0; background: transparent; color: var(--cp-text);\n  cursor: pointer; padding: 5px 6px; border-radius: 5px; font-size: 12.5px; text-align: left;\n}\n.cp-session-group-toggle:hover { background: color-mix(in srgb, var(--cp-text) 5%, transparent); }\n.cp-session-chevron { width: 12px; height: 12px; color: var(--cp-faint); transition: transform .2s var(--cp-ease); flex: 0 0 auto; }\n.cp-session-chevron.cp-collapsed { transform: rotate(-90deg); }\n.cp-session-folder { width: 15px; height: 15px; color: var(--cp-muted); flex: 0 0 auto; }\n.cp-session-pipeline { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cp-session-group-count { font-size: 11.5px; color: var(--cp-faint); font-variant-numeric: tabular-nums; }\n.cp-session-new { width: 24px; height: 24px; opacity: 0; }\n.cp-session-group-head:hover .cp-session-new, .cp-session-new:focus-visible { opacity: 1; }\n.cp-session-new svg { width: 14px; height: 14px; }\n.cp-session-rows { display: flex; flex-direction: column; padding: 1px 0 2px 10px; animation: cp-fade .18s ease-out; }\n.cp-session-row { display: flex; align-items: center; gap: 2px; border-radius: 5px; transition: background .12s ease; }\n.cp-session-row:hover { background: color-mix(in srgb, var(--cp-text) 5%, transparent); }\n.cp-session-row-active, .cp-session-row-active:hover { background: var(--cp-accent-soft); }\n.cp-session-row-main { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; padding-left: 6px; }\n.cp-session-open { flex: 1; min-width: 0; border: 0; background: transparent; color: inherit; text-align: left; padding: 5px 2px; cursor: pointer; border-radius: 4px; }\n.cp-session-status { display: inline-flex; width: 16px; flex: 0 0 auto; justify-content: center; }\n.cp-session-row-text { display: flex; flex-direction: column; min-width: 0; flex: 1; }\n.cp-session-name { font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cp-session-meta { color: var(--cp-faint); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cp-session-rename { flex: 1; min-width: 0; height: 26px; margin: 3px 4px 3px 0; border: 1px solid var(--cp-accent-ink); border-radius: 4px; background: var(--cp-panel); color: var(--cp-text); padding: 0 6px; font-size: 12.5px; font-family: var(--cp-sans); }\n.cp-session-rename:focus { outline: none; }\n.cp-session-actions { display: none; align-items: center; gap: 1px; padding-right: 4px; }\n.cp-session-row:hover .cp-session-actions, .cp-session-row:focus-within .cp-session-actions { display: flex; }\n.cp-session-action { width: 24px; height: 24px; }\n.cp-session-action svg { width: 14px; height: 14px; }\n@media (hover: none) { .cp-session-actions { display: flex; } .cp-session-new { opacity: 1; } }\n\n/* Settings */\n.cp-settings-head { display: flex; align-items: center; gap: 5px; padding: 10px 12px 8px 8px; }\n.cp-settings-title { font-family: var(--cp-serif); font-weight: 700; font-size: 16px; }\n.cp-settings-tabs { display: flex; gap: 12px; padding: 0 14px; border-bottom: 1px solid var(--cp-border); overflow-x: auto; scrollbar-width: none; }\n.cp-settings-tab {\n  display: inline-flex; align-items: center; gap: 5px; border: 0; background: transparent; color: var(--cp-muted); cursor: pointer;\n  padding: 6px 1px 8px; font-size: 12.5px; font-weight: 600; white-space: nowrap;\n  box-shadow: inset 0 0 0 transparent; transition: color .14s ease, box-shadow .18s var(--cp-ease);\n}\n.cp-settings-tab svg { width: 14px; height: 14px; }\n.cp-settings-tab:hover { color: var(--cp-text); }\n.cp-settings-tab-active { color: var(--cp-text); box-shadow: inset 0 -2px 0 var(--cp-accent-ink); }\n.cp-settings-scroll { flex: 1; overflow-y: auto; padding: 14px 14px 24px; scrollbar-width: thin; }\n.cp-settings-section { display: flex; flex-direction: column; gap: 10px; animation: cp-fade .18s ease-out; }\n.cp-settings-section h3 { margin: 0; font-family: var(--cp-serif); font-size: 17px; font-weight: 700; }\n.cp-settings-section p { margin: 3px 0 0; color: var(--cp-muted); font-size: 12.5px; line-height: 1.5; }\n.cp-settings-section a { color: var(--cp-accent-ink); }\n.cp-settings-section h4 { margin: 8px 0 0; font-size: 12.5px; font-weight: 600; }\n.cp-about-head { display: flex; align-items: baseline; gap: 8px; }\n.cp-settings-version { font-family: var(--cp-mono); font-size: 11.5px; color: var(--cp-faint); }\n.cp-settings-section .cp-about-lede { color: var(--cp-text); font-size: 13px; line-height: 1.6; }\n.cp-settings-section-head { display: flex; align-items: flex-start; gap: 8px; justify-content: space-between; }\n.cp-settings-note { color: var(--cp-muted); font-size: 12px; line-height: 1.55; padding-top: 10px; border-top: 1px solid var(--cp-border); }\n.cp-settings-note code { font-family: var(--cp-mono); font-size: 11.5px; }\n.cp-settings-list { display: flex; flex-direction: column; border-top: 1px solid var(--cp-border); }\n.cp-settings-card { display: flex; align-items: center; gap: 10px; padding: 9px 2px; border-bottom: 1px solid var(--cp-border); }\n.cp-settings-card-icon { color: var(--cp-muted); display: grid; place-items: center; flex: 0 0 auto; }\n.cp-settings-card-icon svg { width: 18px; height: 18px; }\n.cp-settings-card-main { min-width: 0; flex: 1; }\n.cp-settings-card-title { display: flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 600; }\n.cp-settings-card-meta { color: var(--cp-muted); font-size: 11.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cp-settings-card-actions { display: flex; align-items: center; gap: 1px; flex: 0 0 auto; }\n.cp-settings-badge { display: grid; place-items: center; color: var(--cp-accent-ink); border-radius: 50%; cursor: default; }\n.cp-settings-badge svg { width: 14px; height: 14px; }\n.cp-settings-form { padding: 12px; border-radius: 6px; display: flex; flex-direction: column; gap: 10px; background: var(--cp-panel-2); animation: cp-rise .2s var(--cp-ease); }\n.cp-settings-form-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; }\n.cp-settings-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }\n.cp-settings-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--cp-border); }\n.cp-settings-row > span { font-size: 12.5px; font-weight: 600; }\n.cp-provider-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px; }\n.cp-provider {\n  border: 1px solid var(--cp-border-strong); background: transparent; border-radius: 5px; padding: 7px 9px; cursor: pointer; text-align: left;\n  display: flex; flex-direction: column; gap: 2px; color: var(--cp-text); transition: border-color .14s ease, background .14s ease;\n}\n.cp-provider:hover { border-color: var(--cp-accent-ink); }\n.cp-provider-active { border-color: var(--cp-accent-ink); background: var(--cp-accent-soft); }\n.cp-provider-name { font-weight: 600; font-size: 12.5px; }\n.cp-provider-state { font-size: 11px; color: var(--cp-muted); }\n.cp-provider-state.cp-configured { color: var(--cp-success); }\n.cp-field { display: flex; flex-direction: column; gap: 4px; }\n.cp-field > span { font-size: 12px; font-weight: 600; color: var(--cp-text); }\n.cp-field > span.cp-field-hint { font-size: 11.5px; font-weight: 400; color: var(--cp-muted); }\n.cp-field input, .cp-field select {\n  width: 100%; height: 32px; border: 1px solid var(--cp-border-strong); border-radius: 5px; background: var(--cp-panel);\n  color: var(--cp-text); padding: 0 9px; font-size: 12.5px; font-family: var(--cp-sans); transition: border-color .14s ease;\n}\n.cp-field input:focus, .cp-field select:focus { outline: none; border-color: var(--cp-accent-ink); }\n.cp-setup { display: flex; flex-direction: column; gap: 12px; }\n.cp-setup h3 { margin: 0; font-family: var(--cp-serif); font-size: 17px; }\n.cp-setup p { margin: 0; color: var(--cp-muted); font-size: 12.5px; }\n.cp-setup-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }\n.cp-setup-note { color: var(--cp-muted); font-size: 12px; }\n\n\n/* Skills */\n.cp-skills { gap: 12px; }\n.cp-skill-draft {\n  border: 1px solid var(--cp-border-strong); border-radius: 6px; padding: 12px;\n  display: flex; flex-direction: column; gap: 8px; background: var(--cp-panel-2);\n}\n.cp-skill-draft-head { display: flex; align-items: center; gap: 7px; font-size: 13px; }\n.cp-skill-draft-head svg { width: 16px; height: 16px; color: var(--cp-accent-ink); }\n.cp-skill-draft p { margin: 0; color: var(--cp-muted); font-size: 12px; line-height: 1.5; }\n.cp-skill-draft-fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 60px; gap: 8px; }\n.cp-skill-draft-fields .cp-field > span { font-size: 11px; }\n.cp-skill-limit input { padding: 0 6px; }\n.cp-skill-form .cp-field textarea, .cp-skill-body {\n  width: 100%; min-height: 140px; resize: vertical; border: 1px solid var(--cp-border-strong); border-radius: 5px;\n  background: var(--cp-panel); color: var(--cp-text); padding: 8px 9px; font-size: 12px; line-height: 1.5;\n  font-family: var(--cp-mono);\n}\n.cp-skill-form .cp-field textarea:focus { outline: none; border-color: var(--cp-accent-ink); }\n.cp-skill-enabled { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: var(--cp-text); }\n.cp-skill-enabled input { accent-color: var(--cp-accent-ink); }\n.cp-skill-card {\n  border: 1px solid var(--cp-border); border-radius: 6px; padding: 10px 11px;\n  display: flex; flex-wrap: wrap; align-items: flex-start; gap: 8px; background: var(--cp-panel);\n}\n.cp-skill-card-main { min-width: 0; flex: 1 1 220px; display: flex; flex-direction: column; gap: 3px; }\n.cp-skill-card-title { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; }\n.cp-skill-card-title svg { width: 16px; height: 16px; color: var(--cp-accent-ink); flex: 0 0 auto; }\n.cp-skill-kind { font-family: var(--cp-mono); font-size: 10.5px; color: var(--cp-muted); border: 1px solid var(--cp-border); border-radius: 3px; padding: 0 4px; }\n.cp-skill-off { font-size: 10px; color: var(--cp-muted); text-transform: uppercase; letter-spacing: .06em; }\n.cp-skill-card-meta { font-size: 12px; color: var(--cp-muted); line-height: 1.45; }\n.cp-skill-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }\n.cp-skill-tags span { font-size: 10.5px; color: var(--cp-accent-ink); background: var(--cp-accent-soft); border-radius: 3px; padding: 1px 5px; }\n.cp-skill-card-actions { display: flex; align-items: center; gap: 2px; flex: 0 0 auto; }\n.cp-skill-card-actions .cp-btn { padding: 3px 7px; font-size: 11px; }\n.cp-skill-disabled { opacity: .58; }\n.cp-skill-preview { flex: 1 0 100%; }\n.cp-skill-preview summary { cursor: pointer; color: var(--cp-muted); font-size: 11.5px; }\n.cp-skill-preview pre {\n  margin: 7px 0 0; max-height: 260px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere;\n  background: var(--cp-code); color: var(--cp-code-text); border-radius: 5px; padding: 9px;\n  font-family: var(--cp-mono); font-size: 11px; line-height: 1.5;\n}\n\n/* Appearance */\n.cp-swatches { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; }\n.cp-swatch {\n  position: relative; width: 34px; height: 34px; padding: 0; border: 0; border-radius: 50%; cursor: pointer; display: grid; place-items: center;\n  background: var(--cp-swatch); color: var(--cp-swatch-on);\n  transition: transform .18s var(--cp-ease), box-shadow .16s ease;\n}\n.cp-swatch:hover { transform: scale(1.08); }\n.cp-swatch-active { box-shadow: 0 0 0 2px var(--cp-panel), 0 0 0 4px var(--cp-swatch); }\n.cp-swatch svg { width: 15px; height: 15px; animation: cp-pop-in .18s var(--cp-ease); }\n.cp-swatch .cp-mark { width: 18px; height: 18px; }\n.cp-accent-name { font-size: 12.5px; color: var(--cp-muted); }\n.cp-accent-name b { color: var(--cp-text); font-weight: 600; }\n.cp-accent-preview { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 12px 0 4px; }\n.cp-accent-link { color: var(--cp-accent-ink); font-size: 12.5px; text-decoration: underline; text-underline-offset: 2px; }\n.cp-accent-mark { color: var(--cp-accent-ink); }\n.cp-segment { display: inline-flex; border: 1px solid var(--cp-border-strong); border-radius: 5px; overflow: hidden; }\n.cp-segment button {\n  display: inline-flex; align-items: center; gap: 5px; border: 0; background: transparent; color: var(--cp-muted); cursor: pointer;\n  padding: 4px 10px; font-size: 12.5px; font-weight: 600; transition: background .14s ease, color .14s ease;\n}\n.cp-segment button + button { border-left: 1px solid var(--cp-border-strong); }\n.cp-segment button svg { width: 14px; height: 14px; }\n.cp-segment button:hover { color: var(--cp-text); }\n.cp-segment button[aria-pressed=\"true\"] { background: var(--cp-accent-soft); color: var(--cp-accent-ink); }\n\n@media (max-width: 640px) {\n  .cp-drawer { width: 100vw !important; }\n  .cp-fab { right: 14px; bottom: 14px; }\n}\n@media (prefers-reduced-motion: reduce) {\n  .cp-shell *, .cp-shell *::before, .cp-shell *::after { animation: none !important; transition: none !important; }\n  .cp-shimmer { background: none; -webkit-text-fill-color: currentColor; }\n}\n", uo = document.getElementById("jenkins-ai-copilot-root");
if (uo && !uo.shadowRoot) {
	document.body.appendChild(uo);
	let e = uo.attachShadow({ mode: "open" }), t = document.createElement("style");
	t.textContent = lo;
	let n = document.createElement("div");
	n.className = "cp-reset", e.append(t, n), (0, v.createRoot)(n).render(/* @__PURE__ */ (0, W.jsx)(so, {}));
}
