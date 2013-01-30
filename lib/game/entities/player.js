ig.module(
    'game.entities.player'
)
.requires(
    'impact.entity',
    'impact.sound',
    'game.entities.weapon'
)
.defines(function(){

    PlayerInventory = ig.Class.extend({

        weapon: 0,
        activeWeapon: 'EntityBullet',

        weapons :{
            bullet : {

            },
            grenade : {

            }
        },

        keys : {},

        ammo : {},

        totalWeapons : function () {
            var count = 0;
            var p;
            for (p in this.weapons) {
                if (this.weapons.hasOwnProperty(p)) {
                    count += 1;
                }
            }
            return count;
        }
    });

    EntityPlayer = ig.Entity.extend({

        inv : new PlayerInventory(),

        weapon: 0,
        totalWeapons : 2,
        activeWeapon: 'EntityBullet',

        animSheet: new ig.AnimationSheet('media/player.png', 16, 16),
        size: {x: 8, y: 14},
        offset: {x:4, y: 2},
        flip: false,
        maxVel: {x: 100, y: 150},
        friction: {x: 600, y: 0},
        accelGround: 400,
        accelAir: 200,
        jump: 200,
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.PASSIVE,
        startPosition : null,
        invincible : true,
        invincibleDelay: 2,
        invincibleTimer: null,
        // Sound / SFX 
        jumpSFX : new ig.Sound('media/sounds/new/jump.*'),
        shootSFX : new ig.Sound('media/sounds/new/shoot.*'),
        deathSFX : new ig.Sound('media/sounds/new/death.*'),

        init: function (x,y, settings) {
            console.log('EntityPlayer.init:'+x+','+y, 'info');
            this.parent(x,y, settings);
            this.setupAnimation(this.weapon);
            this.startPosition = {x:x, y:y};
            this.invincibleTimer = new ig.Timer();
            this.makeInvincible();
        },
        update: function () {
            // move left or right
            var accel = this.standing ? this.accelGround : this.accelAir;
            if (ig.input.state('left')) {
                this.accel.x = -accel;
                this.flip = true;
            } else if (ig.input.state('right')){
                this.accel.x = accel;
                this.flip = false;
            } else {
                this.accel.x = 0;
            }
            // Jump
            if (this.standing && ig.input.pressed('jump')){
                this.vel.y = -this.jump;
                this.jumpSFX.play();
            }
            if (ig.input.pressed('shoot')) {
                var activeWeaponEnvAttr = ig.game.env.getAttrForClass(this.activeWeapon);
                if (!activeWeaponEnvAttr.isMax() && activeWeaponEnvAttr.notEmpty()) {
                    ig.game.spawnEntity(this.activeWeapon, this.pos.x, this.pos.y, {flip: this.flip});
                    this.shootSFX.play();
                }
            }
            if (ig.input.pressed('switch')) {
                this.weapon +=1;
                if (this.weapon >= this.totalWeapons) {
                    this.weapon = 0;
                }
                switch (this.weapon) {
                    case (0) : this.activeWeapon = 'EntityBullet';
                        break;
                    case (1) : this.activeWeapon = 'EntityGrenade';
                        break;
                }
                this.setupAnimation(this.weapon);
            }

            //set the current  animation bsed on theplayers speed
            if (this.vel.y < 0 ) { 
                this.currentAnim = this.anims.jump;
            } else if (this.vel.y > 0) {
                this.currentAnim = this.anims.fall;
            } else if (this.vel.x != 0) {
                this.currentAnim = this.anims.run;
            } else {
                this.currentAnim = this.anims.idle;
            }

            this.currentAnim.flip.x = this.flip;


            if ( this.invincibleTimer.delta() > this.invincibleDelay ) {
                this.invincible = false;
                this.currentAnim.alpha = 1;
            }

            // move
            this.parent();
        },

        setupAnimation : function (o) {
            o *= 10;
            this.addAnim('idle', 1, [0+o]);
            this.addAnim('run', 0.07, [0+o,1+o,2+o,3+o,4+o,5+o]);
            this.addAnim('jump', 1, [9+o]);
            this.addAnim('fall', 0.4, [6+o,7+o]);
        },

        kill : function () {
            this.deathSFX.play();
            this.parent();
            ig.game.respawnPosition = this.startPosition;
            ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, { callBack : this.onDeath});
            /*
            var x = this.startPosition.x;
            var y = this.startPosition.y;
            ig.game.stats.deaths += 1;
            ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, { callBack : function () {
                ig.game.spawnEntity(EntityPlayer, x, y);
            }});
            */

        },

        onDeath : function () {
            ig.game.stats.deaths += 1;
            ig.game.lives -= 1;
            if (ig.game.lives <= 0) {
                ig.game.gameOver();
            } else {
                ig.game.spawnEntity(EntityPlayer, ig.game.respawnPosition.x, ig.game.respawnPosition.y);
            }

        },

        makeInvincible: function () {
            this.invincible = true;
            this.invincibleTimer.reset();
        },

        receiveDamage : function (amount, from) {
            if (!this.invincible){
                this.parent(amount, from);
            }
        },

        draw : function () {
            if (this.invincible) {
                this.currentAnim.alpha = this.invincibleTimer.delta() / this.invincibleDelay * 1;
            }
            this.parent();
        },

    });
    EntityDeathExplosion = ig.Entity.extend({
        lifetime : 1,
        callback : null,
        particles : 25,
        init : function (x, y, settings) { 
            this.parent(x, y, settings);
            for (var ii = 0; ii < this.particles; ii +=1) {
                ig.game.spawnEntity(EntityDeathExplosionParticle, x, y, {colorOffset: settings.colorOffset ? settings.colorOffset : 0 });
                this.idleTimer = new ig.Timer();
            }
        },

        update : function () {
            if (this.idleTimer.delta() > this.lifetime) { 
                this.kill();
                if (this.callBack) { 
                    this.callBack();
                }
                return;
            }
        }
    });

    EntityDeathExplosionParticle = ig.Entity.extend({
        size : {x: 2, y: 2},
        maxVel : {x : 160, y : 200 },
        lifetime: 2,
        fadetime: 1,
        bounciness  :0,
        vel : {x : 100, y: 30 } ,
        friction : {x : 100, y : 0},
        collides : ig.Entity.COLLIDES.LITE,
        colorOffset : 0,
        totalColors : 7,
        animSheet  : new ig.AnimationSheet ('media/blood.png', 2,2),

        init : function (x,y, settings) {
            this.parent(x,y, settings);
            var frameID = Math.random(Math.random() * this.totalColors) + (this.colorOffset * (this.totalColors + 1));
            this.addAnim('idle', 0.2, [frameID]);
            this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
            this.vel.y = (Math.random() * 2 - 1) * this.vel.y;
            this.idleTimer = new ig.Timer();
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
