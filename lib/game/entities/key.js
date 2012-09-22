ig.module(
    'game.entities.key'
)
.requires (
    'impact.entity'
)
.defines (function() {
    EntityKey = ig.Entity.extend({
        //_wmDrawBox: true,
        //_wmBoxColor : 'rgba(0, 0, 255, 0.7)',
        size: {x: 8, y: 14},
        offset: {x:4, y: 2},
        animSheet: new ig.AnimationSheet('media/keys.png', 16, 16),
        pickupSFX : new ig.Sound('media/sounds/new/pickup.*'),
        color : null,
        checkAgainst : ig.Entity.TYPE.A,
        init: function (x,y, settings) {
            this.parent(x,y, settings);
            if (ig.game.keyLimit&& (null !== this.color)){
                if (ig.game.keyLimit[this.color] > 0){
                    ig.game.keyLimit[this.color] -= 1;
                    this.addAnim('red', 0, [0]);
                    this.addAnim('blue', 0, [1]);
                    this.addAnim('yellow', 0, [2]);
                    this.addAnim('green', 0, [3]);
                    this.currentAnim = this.anims[this.color];
                } else {
                    this.kill();
                }
            }

        },
        update : function () {},
        check : function (other) {
            if (other instanceof EntityPlayer) {
                this.pickupSFX.play();
                // add to player inventory
                if (-1 === ig.game.items.indexOf(this)) {
                    ig.game.items.push(this);
                    this.kill();
                }
            }
            
        },

    });
});
