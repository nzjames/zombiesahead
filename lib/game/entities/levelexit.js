ig.module(
    'game.entities.levelexit'
)
.requires (
    'impact.entity'
)
.defines (function() {
    EntityLevelexit = ig.Entity.extend({
        _wmDrawBox: true,
        _wmBoxColor : 'rgba(0, 0, 255, 0.7)',
        size : {x : 8, y : 8 },
        level : null,
        completed : false,
        requiredKey : null,
        checkAgainst : ig.Entity.TYPE.A,
        update : function () {},

        nextLevel : function () {
            if (this.level) {
                var levelName = this.level.replace(/^(Level)?(\w)(\w*)/, function (m, l, a, b) {
                    return a.toUpperCase() + b;
                });
                ig.game.loadLevelDeferred(ig.global['Level'+levelName]);
                var player = ig.game.getEntitiesByType(EntityPlayer)[0];
                player.pos.x = 200;

            }
        },
        check : function (other) {
            if (other instanceof EntityPlayer) {
                if (ig.input.state('continue') && this.checkKeyRequired()){
                    ig.game.message = '';
                    ig.game.toggleStats(this);
                } else {
                    if ((null === this.requiredKey) || ig.game.hasKey(this.requiredKey)) {
                        ig.game.message = 'press space to open door';
                    } else {
                        ig.game.message = 'you need the ' + this.requiredKey + ' key to open this door.' ; //+ "\n" + 'press space to open door';
                    }
                    ig.game.showStartMessage = true;
                    ig.game.instructMessage();
                }
            }
            
        },
        checkKeyRequired : function () {
            if (null === this.requiredKey) {
                return true;
            } else {
                return ig.game.useItem(this.requiredKey);
            }
        }

    });
});
