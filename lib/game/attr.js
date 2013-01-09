ig.module(
    'game.attr'
)
.requires(
)
.defines(function(){ "use strict";

    ig.Attr = ig.Class.extend({

        min : null,
        max : null,
        value : null,   // current number of this attr/entity in play
        default : null, // value to reset it to
        count : null,   // number in inventory
        _class : null,  // (Entity)Class name

        init : function (cfg) {
            var p;
            for (p in cfg) {
                if (this.hasOwnProperty(p)) {
                    this[p] = cfg[p];
                }
            }
        },

        inc : function (value) {

            // Default Increment to 1
            value = value || 1;

            var lessThanMax = ((null === this.max) || ((this.value + value) <= this.max));

            if ((0 < value) && lessThanMax) {
               this.value += value;
            }

            var greaterThanMin = ((null === this.min) || ((this.value + value) >= this.min));

            if ((0 > value) && greaterThanMin) {
               this.value += value;
            }
            return this.value;
        },

        dec : function (value) {
            value = (value || 1) * -1;
            this.inc(value);
        },

        isMax : function () {
            return (this.value >= this.max);
        },

        notEmpty : function () {
            return (0 < this.count || null === this.count);
        },

        useAttr : function () {
            if (null !== this.count && 0 < this.count) {
                this.count -= 1;
            }
        },

        reset : function () {
            this.value = this.default;
        }
    });
});
