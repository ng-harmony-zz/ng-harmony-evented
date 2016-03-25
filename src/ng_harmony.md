# Ng-Harmony-Evented
====================

## Development

![Harmony = 6 + 7;](logo.png "Harmony - Fire in my eyes")

The controllers in this package allow for event listening by convention from within the Controller,
where all the real action happens.
I am tempted to call it programmatic eventing, since the declarative html4-like style of angular is not too much to my liking

## Concept

You write your member foos - controller method - names within hyphens and separate conventioned parts with "::".
Like this we write declarative method-names that will be auto hooked to zepto (jQuery-like) js-events, or, to angular events.
The methods might have default interceptors, or post-processing features such as auto triggering a digest-cycle ...

Like this, we can see our controllers come to life and keep the control (-flow) in the - tata - controller.
Use it in conjunction with

* [literate-programming](http://npmjs.org/packages/literate-programming "click for npm-package-homepage") to write markdown-flavored literate JS, HTML and CSS
* [jspm](https://www.npmjs.com/package/jspm "click for npm-package-homepage") for a nice solution to handle npm-modules with ES6-Module-Format-Loading ...

## Files

This serves as literate-programming compiler-directive

[build/index.js](#Compilation "save:")

You can extend these literate-programming directives here ... the manual is (on jostylr@github/literate-programming)[https://github.com/jostylr/literate-programming]

## Compilation

Bring Angulars html4-like event-handling back into the Controller

Iterating over the prototype, filtering private properties and initialization, we look for evented methods and hook em up using bean, the eventing lib, and zest, the selector engine

* It "shims" programmatic eventing
* Provides one or two convenience methods, like triggering the ng-digest-cycle

Import bean, a dependency-less eventing lib, and zest, a tiny and fast selector-engine.

```javascript

	import bean from 'fat/bean';
	import zest from 'zest';
	import { Harmony, Controller } from 'ng-harmony/ng-harmony';
	import { Mixin } from 'ng-harmony/ng-harmony-annotate';
```

First, there's the *StateController*, a behavioural convenience machine ...
Write your member foos - controller methods - like this (prefixed with a §, and don't forget the hyphens):

"§listenedToEventTitle->afterBehaviourBroadcastedEvent"(...args) {};

I'll create proper usage examples and demo code later ...

The StateController

```javascript
export class RouteController extends Controller {
	constructor(...args) {
		super(...args);

		this.$scope.$on("register",
			(ev, f, t, s, p, d, listener) => {
				s(); //stopPropagation
				p(); //preventDefault
				try {
					this.LISTENERS = listener;
				} catch (e) {
					console.log("Couldn't set listener!");
					console.dir(listener);
				}
			}
		);
		this.$scope.$on("behaviour",
			(ev, f, t, s, p, d, behaviour) => {
				s(); //stopPropagation
				p(); //preventDefault
				this.behaviourQueue = behaviour;
				this.behaviour();
			}
		);
	}
	get LISTENERS () {
		return this._LISTENERS || [];
	}
	set LISTENERS (o) {
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
			})
			this._LISTENERS.push({
				id: l.name.id,
				ctx: l.ctx,
				name: l.name.fn,
				createdAt: l.name.ts
				el: l.el || null,
				css: match.css,
				uid: match.uid
			})
		}
	}
	get behaviourQueue () {
		return this._behaviourQueue || [];
	}
	set behaviourQueue (behaviour) {
		if (this._isEmpty(this._behaviourQueue)) {
			this._behaviourQueue = [];
		}
		this._behaviourQueue.push(behaviour);
	}
	get idle () {
		if (this._isEmpty(this._idle)) {
			this._idle = true;
		}
		return this._idle;
	}
	set idle (truthy) {
		this._idle = !!truthy;
	}
	static get STATES () {
		return this._STATES || [];
	}
	static set STATES (states) {
		this._STATES = states;
	}
	static get TOKEN_BEHAVIOUR_SEPARATOR () {
		return this._TOKEN_BEHAVIOUR_SEPARATOR || "->";
	}
	static set TOKEN_BEHAVIOUR_SEPARATOR (s) {
		this._TOKEN_BEHAVIOUR_SEPARATOR = s;
	}
	static get TOKEN_LOGIC_SEPARATOR () {
		return this._TOKEN_LOGIC_SEPARATOR || "::";
	}
	static set TOKEN_LOGIC_SEPARATOR (s) {
		this._TOKEN_LOGIC_SEPARATOR = s;
	}
	static get TOKEN_BEHAVIOUR_SYMBOL () {
		return this._TOKEN_BEHAVIOUR_SYMBOL || "§";
	}
	static set TOKEN_BEHAVIOUR_SYMBOL (s) {
		this._TOKEN_BEHAVIOUR_SYMBOL = s;
	}
	static get TOKEN_CHILD_SYMBOL () {
		return this._TOKEN_CHILD_SYMBOL || "<";
	}
	static set TOKEN_CHILD_SYMBOL (s) {
		this._TOKEN_CHILD_SYMBOL = s;
	}
	_mapTransientByEl (o) {
		let m = this.LISTENERS.filter((el, i, arr) => {
			let z = zest(el.css, document.body);
			if (z[0] === o.el) {
				if (z.length > 1) {
					throw new Error(`Your css selection isn't unique ... ${z.length} elements!`);
				}
				return true;
			}
			return false;
		});
		if (!m.length) {
			throw new Error("Your transient mapping doesn't match any listener!");
		}
		if (m.length >) {
			throw new Error(`Your transient mapping isn't unique ... ${m.length} elements!`);
		}
		return m[0].uid;
	}
	_mapTransientByUID (o) {
		return this.LISTENERS.filter((el, i, arr) => {
			if (el.uid === o.uid) {
				return true;
			}
		})[0];
	}
	behaviour () {
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
		this._behaviour(this._mapTransientByEl(b), b.fromState, b.toState)
			.then(this.behaviour)
			.catch(this.behaviour);
	}
	_behaviour (uid, fromState, toState) {
		return new Promise((resolve, reject) => {
			this.__behaviour({
				uid: uid,
				fromState: fromState,
				toState: toState
			})
				.then((...args) {
					this.___behaviour(...args)
						.then(() => {
							this.idle = true;
							resolve();
						})
						.catch((el) => {
							this.idle = true;
							console.dir({
								component: el.ctx,
								fromState: el.fromState,
								toState: el.toState
							});
						throw new Error("State Transition malfunction in subcomponent ...");						
					})
				})
				.catch((e) {
					this.idle = true;
					throw new Error("Result of Child Function call unsuccessfull");
				})
		});
	}
	__behaviour (transient) {
		let tbs = this.constructor.TOKEN_BEHAVIOUR_SYMBOL,
			tcs = this.constructor.TOKEN_CHILD_SYMBOL,
			tlsep = this.constructor.TOKEN_LOGIC_SEPARATOR,
			tbsep = this.constructor.TOKEN_BEHAVIOUR_SEPARATOR,
		return new Promise((resolve, reject) => {
			this._validate(this[`${tbs}${transient.uid}${tlsep}${transient.fromState}${tbsep}${transient.toState}`])
				.then((...args) => resolve(tbs, tcs, tlsep, tbsep, ...args);)
				.catch((e) => { reject(e); })
		});
	}
	___behaviour (tbs, tcs, tlsep, tbsep, transientMapping) {
		let countdown = _transientMapping.length;
		return new Promise((resolve, reject) => {
			for (let [i, el] of _transientMapping.entries()) {
				((_el) => {
					this._validate(_el.ctx[`${tbs}${tcs}${_el.fromState}${tbsep}${_el.toState}`].bind(_el.ctx))
						.then(() => {
							if (--countdown < 1) {
								resolve();
							};
						})
						.catch(() => {
							reject(_el);
						});
				})(this._mapTransientByUID(el));
			}
		});
	}
```

Example:
	"§>TransientMappingChildUID::fromState->toState" () {

Now, in here:
If, eg., a dynamic dropdown subcomponent = directive, changed and emitte the
§behaviour event with it's params, namely, this.$element.context to find out the UID,
and also the fromState and toState ...
We might want to change the highlight on our other subcomponent, a map, from country
<previouslySelected> to country <currentlySelected> ...
After that we need to return the transientMapping for eventual sub-components, which need
to change as well, if so:

		return {
			uid: "MYTransientSubComponentUID",
			fromState: "SOME_STATE",
			toState: "ANOTHER_STATE"
		}
	}

```javascript

}

```

The EventedController allows for kinda 'evil(tm)' dom-stuff from within your controller.
Basically, you decouple the event-listening from your html and put it into your controller, right where the action is.

Conventions apply, examples at a later point in time ...

```javascript
	export class EventedController extends Controller {
		constructor(...args) {
			super(...args);

			for (let [key, fn] of this.iterate(this.constructor.prototype)) {
				if (!this._isEventedFunction(key, fn)) {
					continue;
				}
				let tokens = this._getTokens(key.slice(1));
				if (tokens === false) { continue; }

				for (let [i, el] of (tokens[0] ?
						zest(tokens[0], this.$element.context).entries() :
						[this.$element.context].entries())) {
					this.closurize((_key, _fn, _el, _i) => {
						let __fn = (...args) => {
							this._preEventedFunction(args[0], _el, _i, tokens);
							_fn(_el, _i, ...args);
							this._postEventedFunction(_key, _fn, _el, _i, tokens);
						}
						bean.on(el, tokens[1], tokens[2] || _fn, tokens[2] ? _fn : null);
					}, this, key, fn, el, i);
					this.digest();
				}
			}
		}
		static get TOKEN_EVENT_SEPARATOR () {
			return this._TOKEN_EVENT_SEPARATOR || "::";
		}
		static set TOKEN_EVENT_SEPARATOR (s) {
			this._TOKEN_EVENT_SEPARATOR = s;
		}
		static get TOKEN_EVENT_SYMBOL () {
			return this._TOKEN_EVENT_SYMBOL || "$";
		}
		static set TOKEN_EVENT_SYMBOL (s) {
			this._TOKEN_EVENT_SYMBOL = s;
		}
		_getTokens (fnName) {
			let t = fnName.split(this.constructor.TOKEN_EVENT_SEPARATOR);
			return this._validateTokens(t) ? t : false;
		}
		_validateTokens (t) {
			return this._validate(() => {
				if (t.length < 2) {
					throw new Error(`Syntax error: ${key}::${this._name}`);
				}
				return true;
			}).then((truth) => {
				if (truth) {
					return true;
				} else {
					return false;
				}
			}).catch((e) => {
				console.log("Cannot validate tokens ... bailing out");
				return false;
			});
		}
		_parseEventedFunction (tokens) {
			if (!this._isEmpty(tokens[2]) && !!~tokens[2].indexOf("<")) {
				tokens.splice(2, 1, ...tokens[2].split("<"));
			}
			return tokens;
		}
		_preEventedFunction (tokens, ev, ...args) {
			tokens = this._parseEventedFunction(tokens);
			if (typeof tokens[2] !== "undefined" && tokens[2] !== null) {
				if (typeof tokens[3] !== "undefined" && tokens[3] !== null) {
					let el = ev.currentTarget.parentNode;
					while (!zest.matches(el, tokens[3])) { el = el.parentNode; }
					let list = Array.prototype.slice.call(el.parentNode.children);
					this.$scope.n = list.indexOf(el);
				} else {
					let el = ev.currentTarget;
					let list = Array.prototype.slice.call(el.parentNode.children);
					this.$scope.n = list.indexOf(el);
				}
			}
		}
		_postEventedFunction (key, fn, el, i, tokens) {
			this._logEventedFunction(...[key, fn, el, i]);
			this._emit(key, tokens)
		}
		_isEventedFunction (key, val) {
			return (typeof val === "function" &&
				!~[this.constructor.TOKEN_EVENT_SYMBOL].indexOf(key[0]));
		}
		_emit (triggerFn, tokens) {
			this.$scope.$emit("change", {
				scope: this,
				triggerFn: triggerFn,
				triggerTokens: tokens
			});
		}
	}
	EventedController.$inject = ["$element", "$timeout"];

export class StatefulController extends @Mixin([EventedController]) RouteController {
	constructor (...args) {
		super(...args);

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

			let hook = (phrase) => {
				let type = key.charAt(0),
					ancestryType = key.charAt(1),
					tokens = null;
				this._validate(this._getTokens(key))
					.then((t) => {
						tokens = t;
						if (type === this.constructor.TOKEN_EVENT_SYMBOL) {
							for (let [i, el] of (tokens[0] ?
									zest(tokens[0], this.$element.context).entries() :
									[this.$element.context].entries())) {
								this.closurize((_key, _fn, _el, _i) => {
									let __fn = (...args) => {
										this._preEventedFunction(args[0], _el, _i, tokens);
										let transientMap = _fn(_el, _i, ...args);
										this._postEventedFunction(_key, _fn, _el, _i, mapping, transientMap);
									}
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
								}).bind(this, key, fn, el, i)
							} else {
								this[key] = fn;
							}
						}

					})
					.catch((e) => {
						throw new Error(`Couldn't validate/parse tokens of given behaviour symbols ${key}`);
					})
			}
			if (keys.length > 1) {
				let tbs = this.constructor.TOKEN_BEHAVIOUR_SYMBOL,
					tlsep = this.constructor.TOKEN_LOGIC_SEPARATOR,
					tss = this.constructor.TOKEN_SELF_SYMBOL,
					index = -1,
					mapping = null;
				if (!!keys.filter((el, i, arr) => {
					if (el.indexOf(`${tbs}${tbsep}`) === 0) {
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
				this._validate(hook.bind(this, keys[0]))
			}
		}
	}
	static get TOKEN_PARENT_SYMBOL () {
		return this._TOKEN_PARENT_SYMBOL || ">";
	}
	static set TOKEN_PARENT_SYMBOL (s) {
		this._TOKEN_PARENT_SYMBOL = s;
	}
	static get TOKEN_SELF_SYMBOL () {
		return this._TOKEN_SELF_SYMBOL || "!";
	}
	static set TOKEN_SELF_SYMBOL (s) {
		this._TOKEN_SELF_SYMBOL = s;
	}
	_isEventedFunction (key, val) {
		if (!this._isFunction(val)) {
			return false;
		}
		if (key.charAt(0) === this.constructor.TOKEN_EVENT_SYMBOL ||
			key.charAt(0) === this.constructor.TOKEN_BEHAVIOUR_SYMBOL) {
			return true;
		}
		return false;
	}
	_getTokens (fn) {
		let _fn = null;
		if (fn.charAt(0) === this.constructor.TOKEN_EVENT_SYMBOL) {
			_fn = fn.slice(1);
			let t = _fn.split(this.constructor.TOKEN_EVENT_SEPARATOR);
			return this._validateTokens(t) ? t : false;
		} else if (fn.charAt(0) === this.constructor.TOKEN_BEHAVIOUR_SYMBOL) {
			if (fn.charAt(1) === this.constructor.TOKEN_CHILD_SYMBOL ||
				fn.charAt(1) === this.constructor.TOKEN_PARENT_SYMBOL) {
				_fn = fn.slice(2);
				let __fn = _fn.split(this.constructor.TOKEN_LOGIC_SEPARATOR);
				__fn.concat(__fn[1].split(this.constructor.TOKEN_BEHAVIOUR_SEPARATOR);
				return this._validateTokens(__fn) ? __fn : false;
			}
			else {
				throw new Error(`Child Behaviour needs to be prefixed by ${this.constructor.TOKEN_CHILD_SYMBOL}`);
			}
		}
	}
	_postEventedFunction (key, fn, el, i, tokens, transientMap) {
		let _tokens = tokens.split(this.constructor.TOKEN_BEHAVIOUR_SEPARATOR),
			tbs = this.constructor.TOKEN_BEHAVIOUR_SYMBOL,
			tps = this.constructor.TOKEN_PARENT_SYMBOL,
			tbsep = this.constructor.TOKEN_BEHAVIOUR_SEPARATOR;
		this._logEventedFunction(...[key, fn, el, i, transientMap]);
		return new Promise((resolve, reject) => {
			this.___behaviour(tbs, tps, null, tbsep, transientMap)
				.then(() => {
					if (!this._isEmpty(tokens)) {
						this._emit(key, {
							from: _tokens[0],
							to: _tokens[1]
						});
					} else {
						resolve();
					}
				})
				.catch((e) => {
					console.warn("Call to child behaviour resulted in unsuccessfull state.");
					console.warn(e);
					reject();
				});
		});
	}
	_emit (triggerFn, tokens) {
		this.$scope.$emit("behaviour", {
			el: this.$element.context,
			fromState: tokens.from,
			toState: tokens.to
		});
	}
}


```

NEXT STEPS
Logger
literature (programming, documentation!)


## CHANGELOG

*0.1.1*: Since the PowerCtrl is a case for a Mixin and constructors aren't easily mixed in I gave it its own init-function
*0.1.9*: StateController ... now we have a conventioned Controller for inter-component-communication, up to the State-Ctrl.
		 About to battle test and debug, out for beta with the upcoming 0.2.0 ...
*0.1.19*: Avoiding trouble in $scope.i caused by comment nodes (example angular inserting comment nodes and messing with my node-count) by using .children instead of .childNodes, which are element-nodes only by definition
*0.1.20*: Changing delegation syntax to < to symbolize a css - parent-selector
