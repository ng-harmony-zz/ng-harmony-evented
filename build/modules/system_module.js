var _dec, _class;

import bean from 'fat/bean';
import zest from 'zest';
import 'angular-ui-router';
import { Harmony, Controller } from 'ng-harmony/ng-harmony';
import { Mixin } from 'ng-harmony/ng-harmony-annotate';

export let RouteController = class RouteController extends Controller {
	constructor(...args) {
		super(...args);
		initialize();
	}
	initialize() {
		this.$scope.$on("register", (ev, f, t, s, p, d, listener) => {
			s(); //stopPropagation
			p(); //preventDefault
			try {
				this.LISTENERS = listener;
			} catch (e) {
				console.log("Couldn't set listener!");
				console.dir(listener);
			}
		});
		this.$scope.$on("behaviour", (ev, f, t, s, p, d, behaviour) => {
			s(); //stopPropagation
			p(); //preventDefault
			this.behaviourQueue = behaviour;
			this.behaviour();
		});
	}
	get LISTENERS() {
		return this._LISTENERS || [];
	}
	set LISTENERS(o) {
		let _o = [].concat(o);
		for (let [i, l] of _o.entries()) {
			if (this.constructor.LISTENERS.length) {
				throw new Error("No transient definitions found ... not registering listeners");
			}
			let match = this.constructor.LISTENERS.filter((m, i, arr) => {
				let el = zest(m.css, document.body);
				if (el[0] === l.el) {
					if (!el.length) {
						throw new Error("Transient definition doesn't match any element!");
					} else if (el.length > 1) {
						throw new Error("Transient definitions must be describing unique elements!");
					}
					return true;
				}
			});
			this._LISTENERS.push({
				id: l.name.id,
				ctx: l.ctx,
				name: l.name.fn,
				createdAt: l.name.ts,
				el: l.el || null,
				css: match.css,
				uid: match.uid
			});
		}
	}
	get behaviourQueue() {
		return this._behaviourQueue || [];
	}
	set behaviourQueue(behaviour) {
		if (this._isEmpty(this._behaviourQueue)) {
			this._behaviourQueue = [];
		}
		this._behaviourQueue.push(behaviour);
	}
	get idle() {
		if (this._isEmpty(this._idle)) {
			this._idle = true;
		}
		return this._idle;
	}
	set idle(truthy) {
		this._idle = !!truthy;
	}
	static get STATES() {
		return this._STATES || [];
	}
	static set STATES(states) {
		this._STATES = states;
	}
	static get TOKEN_BEHAVIOUR_SEPARATOR() {
		return this._TOKEN_BEHAVIOUR_SEPARATOR || "->";
	}
	static set TOKEN_BEHAVIOUR_SEPARATOR(s) {
		this._TOKEN_BEHAVIOUR_SEPARATOR = s;
	}
	static get TOKEN_LOGIC_SEPARATOR() {
		return this._TOKEN_LOGIC_SEPARATOR || "::";
	}
	static set TOKEN_LOGIC_SEPARATOR(s) {
		this._TOKEN_LOGIC_SEPARATOR = s;
	}
	static get TOKEN_BEHAVIOUR_SYMBOL() {
		return this._TOKEN_BEHAVIOUR_SYMBOL || "§";
	}
	static set TOKEN_BEHAVIOUR_SYMBOL(s) {
		this._TOKEN_BEHAVIOUR_SYMBOL = s;
	}
	static get TOKEN_CHILD_SYMBOL() {
		return this._TOKEN_CHILD_SYMBOL || "<";
	}
	static set TOKEN_CHILD_SYMBOL(s) {
		this._TOKEN_CHILD_SYMBOL = s;
	}
	_mapTransientByEl(o) {
		let m = this.LISTENERS.filter((el, i, arr) => {
			let z = zest(el.css, document.body);
			if (z[0] === o.el) {
				if (z.length > 1) {
					throw new Error(`Your css selection isn't unique ... ${ z.length } elements!`);
				}
				return true;
			}
			return false;
		});
		if (!m.length) {
			throw new Error("Your transient mapping doesn't match any listener!");
		}
		if (m.length > 1) {
			throw new Error(`Your transient mapping isn't unique ... ${ m.length } elements!`);
		}
		return m[0].uid;
	}
	_mapTransientByUID(o) {
		return this.LISTENERS.filter((el, i, arr) => {
			if (el.uid === o.uid) {
				return true;
			}
		})[0];
	}
	behaviour() {
		if (this.idle === false) {
			console.info("Behaviour in progress, hold on fast ...");
			return;
		}
		if (!this.behaviourQueue.length) {
			console.info("Behaviour Queue empty, idling out ...");
			return;
		}
		let b = this.behaviourQueue.unshift();
		this.idle = false;
		this._behaviour(this._mapTransientByEl(b), b.fromState, b.toState).then(this.behaviour).catch(this.behaviour);
	}
	_behaviour(uid, fromState, toState) {
		return new Promise((resolve, reject) => {
			this.__behaviour({
				uid: uid,
				fromState: fromState,
				toState: toState
			}).then((...args) => {
				this.___behaviour(...args).then(() => {
					this.idle = true;
					resolve();
				}).catch(el => {
					this.idle = true;
					console.dir({
						component: el.ctx,
						fromState: el.fromState,
						toState: el.toState
					});
					throw new Error("State Transition malfunction in subcomponent ...");
				});
			}).catch(e => {
				this.idle = true;
				throw new Error("Result of Child Function call unsuccessfull");
			});
		});
	}
	__behaviour(transient) {
		let tbs = this.constructor.TOKEN_BEHAVIOUR_SYMBOL,
		    tcs = this.constructor.TOKEN_CHILD_SYMBOL,
		    tlsep = this.constructor.TOKEN_LOGIC_SEPARATOR,
		    tbsep = this.constructor.TOKEN_BEHAVIOUR_SEPARATOR;
		return new Promise((resolve, reject) => {
			this._validate(this[`${ tbs }${ transient.uid }${ tlsep }${ transient.fromState }${ tbsep }${ transient.toState }`]).then((...args) => {
				resolve(tbs, tcs, tlsep, tbsep, ...args);
			}).catch(e => {
				reject(e);
			});
		});
	}
	___behaviour(tbs, tcs, tlsep, tbsep, transientMapping) {
		let countdown = _transientMapping.length;
		return new Promise((resolve, reject) => {
			for (let [i, el] of _transientMapping.entries()) {
				(_el => {
					this._validate(_el.ctx[`${ tbs }${ tcs }${ _el.fromState }${ tbsep }${ _el.toState }`].bind(_el.ctx)).then(() => {
						if (--countdown < 1) {
							resolve();
						};
					}).catch(() => {
						reject(_el);
					});
				})(this._mapTransientByUID(el));
			}
		});
	}

};

export let EventedController = class EventedController extends Controller {
	constructor(...args) {
		super(...args);

		for (let [key, fn] of this.iterate(this.constructor.prototype)) {
			if (!this._isEventedFunction(key, fn)) {
				continue;
			}
			let tokens = this._getTokens(key.slice(1));
			if (tokens === false) {
				continue;
			}

			for (let [i, el] of tokens[0] ? zest(tokens[0], this.$element.context).entries() : [this.$element.context].entries()) {
				this.closurize((_key, _fn, _el, _i) => {
					let __fn = (...args) => {
						this._preEventedFunction(args[0], _el, _i, tokens);
						_fn(_el, _i, ...args);
						this._postEventedFunction(_key, _fn, _el, _i, tokens);
					};
					bean.on(el, tokens[1], tokens[2] || _fn, tokens[2] ? _fn : null);
				}, this, key, fn, el, i);
				this.digest();
			}
		}
	}
	static get TOKEN_EVENT_SEPARATOR() {
		return this._TOKEN_EVENT_SEPARATOR || "::";
	}
	static set TOKEN_EVENT_SEPARATOR(s) {
		this._TOKEN_EVENT_SEPARATOR = s;
	}
	static get TOKEN_EVENT_SYMBOL() {
		return this._TOKEN_EVENT_SYMBOL || "$";
	}
	static set TOKEN_EVENT_SYMBOL(s) {
		this._TOKEN_EVENT_SYMBOL = s;
	}
	_getTokens(fnName) {
		let t = fnName.split(this.constructor.TOKEN_EVENT_SEPARATOR);
		return this._validateTokens(t) ? t : false;
	}
	_validateTokens(t) {
		return this._validate(() => {
			if (t.length < 2) {
				throw new Error(`Syntax error: ${ key }::${ this._name }`);
			}
			return true;
		}).then(truth => {
			if (truth) {
				return true;
			} else {
				return false;
			}
		}).catch(e => {
			console.log("Cannot validate tokens ... bailing out");
			return false;
		});
	}
	_parseEventedFunction(tokens) {
		if (!this._isEmpty(tokens[2]) && !!~tokens[2].indexOf("<")) {
			tokens.splice(2, 1, ...tokens[2].split("<"));
		}
		return tokens;
	}
	_preEventedFunction(tokens, ev, ...args) {
		tokens = this._parseEventedFunction(tokens);
		if (typeof tokens[2] !== "undefined" && tokens[2] !== null) {
			if (typeof tokens[3] !== "undefined" && tokens[3] !== null) {
				let el = ev.currentTarget.parentNode;
				while (!zest.matches(el, tokens[3])) {
					el = el.parentNode;
				}
				let list = Array.prototype.slice.call(el.parentNode.children);
				this.$scope.n = list.indexOf(el);
			} else {
				let el = ev.currentTarget;
				let list = Array.prototype.slice.call(el.parentNode.children);
				this.$scope.n = list.indexOf(el);
			}
		}
	}
	_postEventedFunction(key, fn, el, i, tokens) {
		this._logEventedFunction(...[key, fn, el, i]);
		this._emit(key, tokens);
	}
	_isEventedFunction(key, val) {
		return typeof val === "function" && !~[this.constructor.TOKEN_EVENT_SYMBOL].indexOf(key[0]);
	}
	_emit(triggerFn, tokens) {
		this.$scope.$emit("change", {
			scope: this,
			triggerFn: triggerFn,
			triggerTokens: tokens
		});
	}
};
EventedController.$inject = ["$element", "$timeout"];

export let StatefulController = (_dec = Mixin([RouteController]), _dec(_class = class StatefulController extends EventedController {
	constructor(...args) {
		super(...args);

		this.initialize();

		this.$scope.$emit("register", {
			name: this._name,
			ctx: this,
			el: this.$element.context
		});

		for (let [key, fn] of this.iterate(this.constructor.prototype)) {
			if (!this._isEventedFunction(key, fn)) {
				continue;
			}
			let keys = key.split(",");

			let hook = phrase => {
				let type = key.charAt(0),
				    ancestryType = key.charAt(1),
				    tokens = null;
				this._validate(this._getTokens(key)).then(t => {
					tokens = t;
					if (type === this.constructor.TOKEN_EVENT_SYMBOL) {
						for (let [i, el] of tokens[0] ? zest(tokens[0], this.$element.context).entries() : [this.$element.context].entries()) {
							this.closurize((_key, _fn, _el, _i) => {
								let __fn = (...args) => {
									this._preEventedFunction(args[0], _el, _i, tokens);
									let transientMap = _fn(_el, _i, ...args);
									this._postEventedFunction(_key, _fn, _el, _i, mapping, transientMap);
								};
								bean.on(el, tokens[1], tokens[2] || _fn, tokens[2] ? _fn : null);
							}, this, key, fn, el, i);
							this.digest();
						}
					} else if (type === this.constructor.TOKEN_BEHAVIOUR_SYMBOL) {
						if (ancestryType === this.constructor.TOKEN_PARENT_SYMBOL) {
							this[key] = ((that, _key, _fn, _el, _i) => {
								return this.closurize((__key, __fn, __el, __i) => {
									let transientMap = __fn(__el, __i);
									return this._postEventedFunction(__key, __fn, __el, __i, null, transientMap);
								}, that, _key, _fn, _el, _i);
							}).bind(this, key, fn, el, i);
						} else {
							this[key] = fn;
						}
					}
				}).catch(e => {
					throw new Error(`Couldn't validate/parse tokens of given behaviour symbols ${ key }`);
				});
			};
			if (keys.length > 1) {
				let tbs = this.constructor.TOKEN_BEHAVIOUR_SYMBOL,
				    tlsep = this.constructor.TOKEN_LOGIC_SEPARATOR,
				    tss = this.constructor.TOKEN_SELF_SYMBOL,
				    index = -1,
				    mapping = null;
				if (!!keys.filter((el, i, arr) => {
					if (el.indexOf(`${ tbs }${ tbsep }`) === 0) {
						index = i;
						mapping = el.slice(tbs.length + tss.length);
						return true;
					};
					return false;
				}).length) {
					keys.splice(index, 1);
				}
				for (let [i, curKey] of keys.entries()) {
					this._validate(hook.bind(this, curKey));
				}
			} else {
				this._validate(hook.bind(this, keys[0]));
			}
		}
	}
	static get TOKEN_PARENT_SYMBOL() {
		return this._TOKEN_PARENT_SYMBOL || ">";
	}
	static set TOKEN_PARENT_SYMBOL(s) {
		this._TOKEN_PARENT_SYMBOL = s;
	}
	static get TOKEN_SELF_SYMBOL() {
		return this._TOKEN_SELF_SYMBOL || "!";
	}
	static set TOKEN_SELF_SYMBOL(s) {
		this._TOKEN_SELF_SYMBOL = s;
	}
	_isEventedFunction(key, val) {
		if (!this._isFunction(val)) {
			return false;
		}
		if (key.charAt(0) === this.constructor.TOKEN_EVENT_SYMBOL || key.charAt(0) === this.constructor.TOKEN_BEHAVIOUR_SYMBOL) {
			return true;
		}
		return false;
	}
	_getTokens(fn) {
		let _fn = null;
		if (fn.charAt(0) === this.constructor.TOKEN_EVENT_SYMBOL) {
			_fn = fn.slice(1);
			let t = _fn.split(this.constructor.TOKEN_EVENT_SEPARATOR);
			return this._validateTokens(t) ? t : false;
		} else if (fn.charAt(0) === this.constructor.TOKEN_BEHAVIOUR_SYMBOL) {
			if (fn.charAt(1) === this.constructor.TOKEN_CHILD_SYMBOL || fn.charAt(1) === this.constructor.TOKEN_PARENT_SYMBOL) {
				_fn = fn.slice(2);
				let __fn = _fn.split(this.constructor.TOKEN_LOGIC_SEPARATOR);
				__fn.concat(__fn[1].split(this.constructor.TOKEN_BEHAVIOUR_SEPARATOR));
				return this._validateTokens(__fn) ? __fn : false;
			} else {
				throw new Error(`Child Behaviour needs to be prefixed by ${ this.constructor.TOKEN_CHILD_SYMBOL }`);
			}
		}
	}
	_postEventedFunction(key, fn, el, i, tokens, transientMap) {
		let _tokens = tokens.split(this.constructor.TOKEN_BEHAVIOUR_SEPARATOR),
		    tbs = this.constructor.TOKEN_BEHAVIOUR_SYMBOL,
		    tps = this.constructor.TOKEN_PARENT_SYMBOL,
		    tbsep = this.constructor.TOKEN_BEHAVIOUR_SEPARATOR;
		this._logEventedFunction(...[key, fn, el, i, transientMap]);
		return new Promise((resolve, reject) => {
			this.___behaviour(tbs, tps, null, tbsep, transientMap).then(() => {
				if (!this._isEmpty(tokens)) {
					this._emit(key, {
						from: _tokens[0],
						to: _tokens[1]
					});
				} else {
					resolve();
				}
			}).catch(e => {
				console.warn("Call to child behaviour resulted in unsuccessfull state.");
				console.warn(e);
				reject();
			});
		});
	}
	_emit(triggerFn, tokens) {
		this.$scope.$emit("behaviour", {
			el: this.$element.context,
			fromState: tokens.from,
			toState: tokens.to
		});
	}
}) || _class);

//# sourceMappingURL=system_module.js.map