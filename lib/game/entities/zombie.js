ig.module(
    'game.entities.zombie'
)
.requires(
    'impact.entity'
)
.defines(function(){
    EntityZombie = ig.Entity.extend({
        animSheet: new ig.AnimationSheet('media/zombie.png', 16, 16),
        deathSFX : new ig.Sound('media/sounds/new/deathzombie.*'),
        size: {x: 8, y: 14},
        offset: {x:4, y: 2},
        flip: false,
        maxVel: {x: 100, y: 100},
        friction: {x: 150, y: 0},
        speed: 14,
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,


        init: function (x,y, settings) {
            this.parent(x,y, settings);
            this.addAnim('walk', 0.7, [0,1,2,3,4,5]);
        },

        update: function () {
            // near edge? 
            if (!ig.game.collisionMap.getTile(
                this.pos.x + (this.flip ? +4 : this.size.x -4),
                this.pos.y + this.size.y +1
                )
            ) {
                this.flip = !this.flip;
            }
            var xdir = this.flip ? -1: 1;
            this.vel.x = this.speed * xdir;
            this.currentAnim.flip.x = this.flip;

            this.parent();
        },

        handleMovementTrace: function (res) {
            this.parent(res);
            if (res.collision.x) {
                this.flip = !this.flip;
            }
        },
        check : function (other) {
            other.receiveDamage(10, this);
        },

        receiveDamage : function (value) {
            ig.game.stats.score += value;
            this.parent(value);
            if (this.health > 0) {
                ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, {particles : 2, colorOffset: 1} );
            }
        },

        kill : function () {
            this.deathSFX.play();
            this.parent();
            ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, {particles : 10, colorOffset: 1} );

            ig.game.stats.kills += 1;
            ig.game.stats.score += 100;
        }

    });
});
