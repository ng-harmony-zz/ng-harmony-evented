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
```

First, there's the *StateController*, a behavioural convenience machine ...
Write your member foos - controller methods - like this (prefixed with a §, and don't forget the hyphens):

"§listenedToEventTitle::afterBehaviourBroadcastedEvent"(...args) {};

I'll create proper usage examples and demo code later ...

```javascript
	export class StateProxy extends Harmony {
		calculate state $on ... up, down

	}

    export class StateController extends Controller {
        constructor(...args) {
            super(...args);

            for (let [key, fn] of this.iterate(this.constructor.prototype)) {
                if (typeof fn !== "function" ||
                    !!~["constructor", "initialize"].indexOf(key) ||
                    !~["§"].indexOf(key[0])) {
                    continue;
                }
                ((_fn) => {
                    this.$scope.$on(key.match(/w+/)[0], (event, state, ...args) => {
                        if (event.defaultPrevented) {
                            return;
                        }
                        else {
                            event.preventDefault();
                            let _args = _fn();
                            this.$scope.$broadcast(key.match(/w+/)[1], ..._args)
                                .then((title, ...args) => {
                                    this.$scope.$emit(title, ...args);
                                })
                                .then((msg) => {
                                    console.warn({
                                        msg: "Promise not fulfilled in Broadcast-Session",
                                        origin: this
                                    });
                                });
                        }
                    });
                })(fn);
            }
        }
		"§aimedState::originalState" () {
			do your thing honey;
			await broadcast;
			emit;

		}
		_emit (...args) {
			super.emit();
		}

		_collectStates () {
			var p = new Promise((resolve, reject) => {
				this._validate(this._broadcast.bind(this, "§in::states::all"))
					.then((states) => {
						return states;
					})
					.catch((e) => {
						console.log("Couldn't collect states, ... bailing out");
						return false;
					});
			});
		}
		_broadcast (phrase) {
			this._validate(this._parseBehaviour.bind(phrase))
				.then((words) => {

```



```javascript

					this.constructor.LISTENERS.forEach((val, key, map) => {
						if (key.)
					})
				})
				.catch((e) => {
					console.log("Cannot broadcast to subcomponents ... idle");
					return false;
				})
		}
		_parseBehaviour (phrase) {
			if (phrase.charAt(0) !== "§") {
				throw new Error(`Malformed Behaviour: ${phrase}`);
			}
			return phrase.slice(0, 1).split("::");
		}
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
				let tokens = this._getTokens(key);
				if (tokens === false) { continue; }

                for (let [i, el] of (tokens[0] ?
                        zest(tokens[0], this.$element.context).entries() :
                        [this.$element.context].entries())) {
					this.closurize((_fn, _el, _i) => {
						let __fn = (...args) => {
							this._preEventedFunction(args[0], _el, _i, tokens);
							_fn(_el, _i, ...args);
							this._postEventedFunction(_el, _i);
						}
						bean.on(el, tokens[1], tokens[2] || _fn, tokens[2] ? _fn : null);
					}, this, fn, el, i);
					this.digest();
                }
            }
        }
		static get STATES () {
			return this._STATES || (new Map()).set("DEFAULT", 1);
		}
		static set STATES (states) {
			if (this._isEmpty(this._STATES)) {
				let next = (power) => {
					return Math.pow(2, power);
				}
				this._STATES = new Map();
				for (let [i, v] of states.entries()) {
					this._STATES.set(v, next(i));
				}
				return true;
			}
			return false;
		}
		get states () {
			if (this._isEmpty(this.$scope._states)) {
				this.$scope._states = {
					history: [],
					get: (which) => {
						let s = this.constructor.STATES,
							_s = this.$scope._states;
						if (!which) {
							return _s.history[_s.history.length - 1];
						} else {
							return _s.history[s.length - Math.abs(which)];
						}
					}
					set: (which) => {
						this.$scope._states.history.push(which);
					}
				}
			}
			return this.$scope._states;
		}
		static get TOKEN_SEPARATOR () {
			return this._TOKEN_SEPARATOR || "::";
		}
		static set TOKEN_SEPARATOR (s) {
			this._TOKEN_SEPARATOR = s;
		}
		_getTokens (fnName) {
			let t = fnName.split(this.constructor.TOKEN_SEPARATOR);
			return this._validateTokens(t) ? t : false;
		}
		_validateTokens (t) {
			return this._validate(() => {
				if (t.length < 1) {
					throw new Error(`Syntax error: ${key}::${this._name}`);
				}
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
		_isEventedFunction (key, val) {
			return typeof super._isEventedFunction === "undefined" ?
				typeof val === "function" && !~["$"].indexOf(key[0]) :
				super._isEventedFunction(key, val) && !~["$"].indexOf(key[0]);
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
		_postEventedFunction (...args) {
			this._logEventedFunction(...args);
		}
		_logEventedFunction (...args) {
			console.info((new Date()).toJSON());
		}
		_getState (which) {
			return this.constructor.STATES.get(this.$scope._states.get(which || null));
		}
		_emit (...args) {
			this._validate(this._getState)
				.then((state) => {
					this.$scope.$emit(`${this._name}::${state}`, ...args);
				})
				.catch((e) => {
					console.log("Couldn't emit properly ... retrying");
					this.$timeout(this._emit.bind(this, state, ...args), 200);
				}
		}
    }
    EventedController.$inject = ["$element", "$timeout"];
```

## CHANGELOG

*0.1.1*: Since the PowerCtrl is a case for a Mixin and constructors aren't easily mixed in I gave it its own init-function
*0.1.9*: StateController ... now we have a conventioned Controller for inter-component-communication, up to the State-Ctrl.
		 About to battle test and debug, out for beta with the upcoming 0.2.0 ...
*0.1.19*: Avoiding trouble in $scope.i caused by comment nodes (example angular inserting comment nodes and messing with my node-count) by using .children instead of .childNodes, which are element-nodes only by definition
*0.1.20*: Changing delegation syntax to < to symbolize a css - parent-selector
