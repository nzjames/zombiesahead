ig.module(
    'game.environment'
)
.requires(
    'game.attr'
)
.defines(function(){ "use strict";

    ig.Environment = ig.Class.extend({

        bullet : new ig.Attr({
            _class : 'EntityBullet',
            max : 3,
            min : 0,
            value : 0,
            default : 0
        }),

        grenade : new ig.Attr({
            _class : 'EntityGrenade',
            max : 10,
            min : 0,
            value : 0,
            default : 0,
            count : 5

        }),

        staticInstantiate : function () {
            return this;
        },

        getAttrForClass : function (_class) {
            var p;
            for (p in this) {
                if ((this[p]._class) && (this[p]._class === _class)) {
                    return this[p];
                }
            }
            return null;
        }


    });

});

