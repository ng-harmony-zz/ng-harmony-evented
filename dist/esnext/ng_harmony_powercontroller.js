import bean from 'bean';
import zest from 'zest';
import {
    Ctrl
}
from 'ng-harmony';
class PowerCtrl extends Ctrl {
    constructor(...args) {
        super(...args);
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
                for (let [i, el] of(tokens[0] ?
                        zest(tokens[0], el).entries() : [el].entries())) {
                    ((_i, _el, _fn) => {
                        __fn = (ev, ...args) => {
                            if (tokens[2] !== undefined && tokens[2] !== null) {
                                if (tokens[3] !== undefined && tokens[3] !== null) {
                                    let __el = ev.currentTarget.parentNode;
                                    while (!zest.matches(__el, tokens[3])) {
                                        __el = __el.parentNode;
                                    }
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
    }
}