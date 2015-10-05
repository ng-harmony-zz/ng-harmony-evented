# Ng-Harmony-PowerCtrl
======================

[![Join the chat at https://gitter.im/ng-harmony/ng-harmony](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ng-harmony/ng_harmony?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Concept

A base-class collection for OO _eventing_ with angular.
Use it in conjunction with

* [literate-programming](http://npmjs.org/packages/literate-programming "click for npm-package-homepage") to write markdown-flavored literate JS, HTML and CSS
* [jspm](https://www.npmjs.com/package/jspm "click for npm-package-homepage") for a nice solution to handle npm-modules with ES6-Module-Format-Loading ...

* * *

## Files

This serves as literate-programming compiler-directive

[./dist/raw/ng_harmony_powercontroller.js](#Compilation "save:")

## Compilation

Bring Angulars html4-like event-handling back into the Controller

Iterating over the prototype, filtering private properties and initialization, we look for evented methods and hook em up using bean, the eventing lib, and zest, the selector engine

* It "shims" programmatic eventing
* Provides one or two convenience methods, like triggering the ng-digest-cycle

Import bean, a dependency-less eventing lib, and zest, a tiny and fast selector-engine.
```javascript

    import bean from 'fat/bean';
    import zest from 'zest';
    import { Ctrl } from 'ng-harmonyng-harmony';

    class PowerCtrl extends Ctrl {
        constructor(...args) {
            super(...args);
        }
        initialize() {
            for (let [key, fn] of this.iterate(this.constructor.prototype)) {
                if (typeof fn !== "function" ||
                    !!~["constructor", "initialize"].indexOf(key) ||
                    key[0] === '_') {
                    continue;
                }
                if (key.match("::")) {
                    let tokens = key.split("::");
                    if ((tokens[2] !== undefined && tokens[2] !== null) && !!~tokens[2].indexOf(">")) {
                        tokens = tokens.splice(0, 2).concat(tokens[0].split(">"));
                    }
                    el = this.$element ? this.$element.context : zest("[ng-app]", document.body)[0];
                    for (let [i, el] of (tokens[0] ?
                            zest(tokens[0], el).entries() :
                            [el].entries())) {
                        ((_i, _el, _fn) => {
                            __fn = (ev, ...args) => {
                                if (tokens[2] !== undefined && tokens[2] !== null) {
                                    if (tokens[3] !== undefined && tokens[3] !== null) {
                                        let __el = ev.currentTarget.parentNode;
                                        while (!zest.matches(__el, tokens[3])) { __el = __el.parentNode; }
                                        let list = Array.prototype.slice.call(__el.parentNode.childNodes);
                                        this.$scope.i = list.indexOf(__el);
                                    } else {
                                        let __el = ev.currentTarget;
                                        let list = Array.prototype.slice.call(__el.parentNode.childNodes);
                                        this.$scope.i = list.indexOf(__el);
                                    }
                                }
                                _fn.call(this, ev, ...args);
                                this._digest();
                            }
                            bean.on(_el, tokens[1], tokens[2] || __fn, tokens[2] ? __fn : null);
                        })(i, el, fn);
                    }
                }
            }
            if (typeof super.initialize === "function") {
                super.initialize();
            }
        }
    }
```

## CHANGELOG

*0.1.1*: Since the PowerCtrl is a case for a Mixin and constructors aren't easily mixed in I gave it its own init-function
