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
    import { Controller  } from 'ng-harmony/ng-harmony';
```

First, there's the *StateController*, a behavioural convenience machine ...
Write your member foos - controller methods - like this (prefixed with a §, and don't forget the hyphens):

"§listenedToEventTitle::afterBehaviourBroadcastedEvent"(...args) {};

I'll create proper usage examples and demo code later ...

```javascript
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
                if (typeof fn !== "function" ||
                    !!~["constructor", "initialize"].indexOf(key) ||
                    !!~["_", "§", "$"].indexOf(key[0])) {
                    continue;
                }
                if (key.match("::")) {
                    let tokens = key.split("::");
                    if ((typeof tokens[2] !== "undefined" && tokens[2] !== null) && !!~tokens[2].indexOf(">")) {
                        tokens = tokens.splice(3, 0, ...tokens[2].split(">"));
                    }
                    let element = this.$element ? this.$element.context : document.body;
                    for (let [i, el] of (tokens[0] ?
                            zest(tokens[0], element).entries() :
                            [element].entries())) {
                        ((_i, _el, _fn) => {
                            let __fn = (ev, ...args) => {
                                if (typeof tokens[2] !== "undefined" && tokens[2] !== null) {
                                    if (typeof tokens[3] !== "undefined" && tokens[3] !== null) {
                                        let __el = ev.currentTarget.parentNode;
                                        while (!zest.matches(__el, tokens[3])) { __el = __el.parentNode; }
                                        let list = Array.prototype.slice.call(__el.parentNode.children);
                                        this.$scope.i = list.indexOf(__el);
                                    } else {
                                        let __el = ev.currentTarget;
                                        let list = Array.prototype.slice.call(__el.parentNode.children);
                                        this.$scope.i = list.indexOf(__el);
                                    }
                                }
                                _fn.call(this, ev, ...args);
                                this.digest();
                            }
                            bean.on(_el, tokens[1], tokens[2] || __fn, tokens[2] ? __fn : null);
                        })(i, el, fn);
                    }
                }
            }
        }
    }
    EventedController.$inject = "$element";
```

## CHANGELOG

*0.1.1*: Since the PowerCtrl is a case for a Mixin and constructors aren't easily mixed in I gave it its own init-function
*0.1.9*: StateController ... now we have a conventioned Controller for inter-component-communication, up to the State-Ctrl.
		 About to battle test and debug, out for beta with the upcoming 0.2.0 ...
*0.1.19*: Avoiding trouble in $scope.i caused by comment nodes (example angular inserting comment nodes and messing with my node-count) by using .children instead of .childNodes, which are element-nodes only by definition
*0.1.20*: Changing delegation syntax to < to symbolize a css - parent-selector