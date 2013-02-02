ig.module(
    'game.entities.weapon'
)
.requires(
    'impact.entity',
    'impact.sound'
)
.defines(function(){

    var TYPE_BULLET = 'bullet';
    var TYPE_GRENADE = 'grenade';

    EntityWeapon = ig.Entity.extend({

        init: function (x, y, settings) {
            ig.game.env[this.weaponType].inc();
            this.parent(x , y, settings);
        },

        kill : function () {
            ig.game.env[this.weaponType].dec();
            this.parent();
        }

    });

    EntityBullet = EntityWeapon.extend({
        size: {x:5, y:3},
        animSheet: new ig.AnimationSheet(
        'media/bullet.png', 5, 3),
        maxVel: {x:200, y:0},
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.B,
        collides: ig.Entity.COLLIDES.PASSIVE,
        weaponType : TYPE_BULLET,

        init: function (x, y, settings) {
            this.parent(x + (settings.flip ? -4 : 8), y+8, settings);
            this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
            this.addAnim( 'idle', 0.2, [0]);
        },

        handleMovementTrace: function (res) {
            this.parent(res);
            if (res.collision.x || res.collision.y) {
                this.kill();
            }
        },
        check : function (other) {
            other.receiveDamage(3);
            this.kill();
        },


    });

    EntityGrenade = EntityWeapon.extend({
        size: {x:4, y:4},
        offset: {x:2, y:2},
        animSheet: new ig.AnimationSheet(
        'media/grenade.png', 8, 8),
        type: ig.Entity.TYPE.NONE,
        maxVel : {x:200, y: 200},
        bounciness: 0.6,
        bounceCounter: 0,
        checkAgainst: ig.Entity.TYPE.BOTH,
        collides: ig.Entity.COLLIDES.PASSIVE,
        weaponType : TYPE_GRENADE,

        init: function (x, y, settings) {
            this.parent(x + (settings.flip ? -4 : 7), y, settings);
            this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
            this.vel.y = -(50 + (Math.random()*100));
            this.addAnim( 'idle', 0.2, [0,1]);

        },

        handleMovementTrace: function (res) {
            this.parent(res);
            if (res.collision.x || res.collision.y) {
                // bounce three times
                this.bounceCounter+=1;
                if (this.bounceCounter > 3 ) {
                    this.kill();
                }
            }
        },
        check : function (other) {
            other.receiveDamage(10, this);
        },

        kill : function() {
            for (var ii = 0; ii < 20; ii +=1 ) {
                ig.game.spawnEntity(EntityGrenadeParticle, this.pos.x, this.pos.y);
            }
            this.parent();
        }

    });

    EntityGrenadeParticle = ig.Entity.extend({
        size : {x: 1, y: 1},
        maxVel : {x : 160, y : 200 },
        lifetime: 1,
        fadetime: 1,
        bounciness  :0.3,
        vel : {x : 40, y: 50 } ,
        friction : {x : 20, y : 20},
        checkAgainst : ig.Entity.TYPE.B,
        collides : ig.Entity.COLLIDES.LITE,
        animSheet  : new ig.AnimationSheet ('media/explosion.png', 1,1),
        init : function (x,y,settings) {
            this.parent(x,y, settings);
            this.vel.x = (Math.random() * 4 - 1) * this.vel.x;
            this.vel.y = (Math.random() * 10 - 1) * this.vel.y;
            this.idleTimer = new ig.Timer();
            var frameID = Math.round(Math.random()*7);
            this.addAnim('idle', 0.2, [frameID]);
        },

        update : function () {
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                return;
            }
            this.currentAnim.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
            this.parent();
        }


    });
});
