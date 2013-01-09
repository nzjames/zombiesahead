ig.module(
    'game.main'
)
.requires(
    'impact.game',
    'impact.font',
    'impact.debug.debug',
    'game.environment',
    'game.levels.map',
    'game.levels.e1m1',
    'game.levels.e1m2',
    'game.levels.e1m3',
    'plugins.devcontrol'
)
.defines(function(){

MyGame = ig.Game.extend({


    env : new ig.Environment(),

    gravity: 300,
    instructText : new ig.Font('media/04b03.font.png'),
    showStartMessage : true,
    message : 'Left/Right Moves, X Jumps, C Fires and TAB switches weapons',

    statText : new ig.Font('media/04b03.font.png'),
    showStats : false,
    statMatte : new ig.Image('media/stat-matte.png'),
    levelTimer : new ig.Timer(),
    levelExit : null,
    stats : { time: 0, kills : 0, deaths : 0, score : 0 },
    lives : 3,
    items : [],
    keyLimit : {
        red : 1,
        yellow :1,
        green : 1,
        blue : 1
    },
    lifeSprite : new ig.Image('media/life-sprite.png'),
    // Not really fully implemented
    levels : {
        0 : { name : 'Map',
            level : LevelMap,
            completed : false, },
        1 : { name : 'Jump',
            level : LevelE1m1,
            completed : false, },
        2 : { name : 'Shoot',
            level : LevelE1m2,
            completed : false, },
        3 : { name : 'Don\'t fall',
            level : LevelE1m3,
            completed : false, }
    },

    init: function() {
       // Bind Keys
        ig.input.bind( ig.KEY.LEFT_ARROW, 'left');
        ig.input.bind( ig.KEY.RIGHT_ARROW, 'right');
        ig.input.bind( ig.KEY.X, 'jump');
        ig.input.bind( ig.KEY.C, 'shoot');
        ig.input.bind( ig.KEY.TAB, 'switch');
        ig.input.bind( ig.KEY.SPACE, 'continue');

        //ig.music.add('media/sounds/new/8bp043-08-gasman-norwegian_blue.*');
        //ig.music.volume = 0.25;
        //ig.music.play()

        // Load the sandbox
        this.loadLevel(this.levels[0].level);
    },

    update: function() {
        this.trackScreen();
        // Update all entities and backgroundMaps
        // If we are not showing the Stats screen just fire the parent
        if (!this.showStats) {
            this.parent();
        } else {
            // When showing the stats screen wait for continue (SPACE) to be pressed.
            // If we are on the street continue automatically
            if (ig.input.state('continue') || (this.levelExit.level !== 'sandbox')) {
                this.showStats = false;
                this.levelExit.nextLevel();
                this.parent();
                if (this.levelExit.exit) {
                    this.levelExitPos = this.levelExit.pos;
                }

            }
        }


        // Add your own, additional update code here
    },

    trackScreen : function () {
        //  follow the player
        var player = this.getEntitiesByType(EntityPlayer)[0];
        var screenX = null;
        var screenY = null;
        var w = null;
        var h = null;

        if (player) {
            /* * * * A bit of debug info
            ig.show('p.x', player.pos.x.round());
            ig.show('p.y', player.pos.y.round());
            ig.show('s.x', this.screen.x.round());
            ig.show('s.y', this.screen.y.round());
            ig.show('mw', ig.game.collisionMap.width * ig.game.collisionMap.tilesize);
            */
            screenX = player.pos.x - ig.system.width/2;
            screenY = player.pos.y - ig.system.height/2;
            w = this.mapWidth - ig.system.width;
            y = this.mapHeight - ig.system.height;

            if (screenX <= 0) {
                this.screen.x = 0;
            } else if (screenX >= w) {
                this.screen.x = w;
            } else {
                this.screen.x = screenX;
            }

            if (screenY <= 0) {
                this.screen.y = 0;
            } else if (screenY >= y) {
                this.screen.y = y;
            } else {
                this.screen.y = screenY;
            }

            if (player.accel.x > 0 && this.showStartMessage) {
                this.showStartMessage = false;
                this.message = '';
            }
        }

    },

    draw: function() {
        // Draw all entities and backgroundMaps
        this.parent();

        if (this.showStats) {
            this.statMatte.draw(0,0);
            var x = ig.system.width/2;
            var y = ig.system.height/2 - 20;
            this.statText.draw('Level Complete', x, y, ig.Font.ALIGN.CENTER);
            this.statText.draw('Time: ' + this.stats.time, x, y+30, ig.Font.ALIGN.CENTER);
            this.statText.draw('Kills: ' + this.stats.kills, x, y+40, ig.Font.ALIGN.CENTER);
            this.statText.draw('Deaths: ' + this.stats.deaths, x, y+50, ig.Font.ALIGN.CENTER);
            this.statText.draw('Press Spacebar to continue', x, ig.system.height - 10, ig.Font.ALIGN.CENTER);
        } else {
            this.statText.draw(' Score: ' + this.stats.score, ig.system.width - 5, 5, ig.Font.ALIGN.RIGHT);
        }

        this.instructMessage();

        this.statText.draw('Lives', 5, 5);
        for (var ii = 0; ii < this.lives; ii += 1) {
            this.lifeSprite.draw(((this.lifeSprite.width + 2) * ii) + 5, 15);
        }

        for (var ii = 0; ii < this.items.length; ii += 1) {
            this.items[ii].pos.x = this.screen.x + (7+(ii*16));
            this.items[ii].pos.y = this.screen.y + 27;
            this.items[ii].draw();
            //this.lifeSprite.draw(((this.lifeSprite.width + 2) * ii) + 5, 15);
        }
    },

    instructMessage : function () {
        if (this.instructText && ('' !== this.message)) {
            var x = ig.system.width/2,
                y = ig.system.height -10;
            this.instructText.draw(this.message, x, y, ig.Font.ALIGN.CENTER);
        }
    },

    toggleStats: function (levelExit) {
        this.showStats = true;
        this.stats.time = Math.round(this.levelTimer.delta());
        this.levelExit = levelExit;
    },

    loadLevel : function (data) {
        this.parent(data);
        if ( this.levelExitPos ) {
            var player = this.getEntitiesByType(EntityPlayer)[0];
            player.pos = this.levelExitPos;
            this.levelExitPos = null;
        }
        this.levelTimer.reset();
        this.stats.time = 0;
        this.stats.kills = 0;
        this.stats.deaths = 0 ;
        this.mapWidth = ig.game.collisionMap.width * ig.game.collisionMap.tilesize;
        this.mapHeight = ig.game.collisionMap.height * ig.game.collisionMap.tilesize;
    },

    gameOver : function () {
        ig.finalStats = ig.game.stats;
        ig.system.setGame(GameOverScreen);
    },

    useItem : function (item) {
        var usable = false;
        var ii = null;
        for (ii in this.items) { 
            if (this.items.hasOwnProperty(ii)) {
                if (this.items[ii].color === item) {
                    usable = true;
                    this.items.splice(ii, 1);
                    break;
                }
            }
        }
        return usable;
    },

    hasKey : function (item) {
        for (ii in this.items) { 
            if (this.items.hasOwnProperty(ii)) {
                if (this.items[ii].color === item) {
                    return true;
                    break;
                }
            }
        }
        return false;

    }

});

StartScreen = ig.Game.extend({
    instructText : new ig.Font('media/04b03.font.png'),
    background : new ig.Image('media/splash.png'),
    //mainCharacter: new ig.Image('media/screen-bg2.png'),
    title : new ig.Image('media/game-title.png'),

    init: function () {
        ig.input.bind(ig.KEY.SPACE, 'start');
        ig.input.bind(ig.KEY._0, 'level0');

    },
    update : function() {
        if(ig.input.pressed('start') || ig.input.pressed('level0')) {
            ig.system.setGame(MyGame);
        }
        this.parent();
    },
    draw : function () {
        this.parent();
        this.background.draw(0,0);
        //this.mainCharacter.draw(0,0);
        this.title.draw(ig.system.width - this.title.width, 10);
        var x = ig.system.width/2,
            y = ig.system.height -10;
        this.instructText.draw('Press Spacebar To Start', x, y, ig.Font.ALIGN.CENTER);
    }
});

GameOverScreen = ig.Game.extend({
    instructText : new ig.Font('media/04b03.font.png'),
    background : new ig.Image('media/screen-bg.png'),
    gameOver : new ig.Image('media/game-over.png'),
    stats : {},
    init : function () {
        ig.input.bind(ig.KEY.SPACE, 'start');
        this.stats = ig.finalStats;
    },
    update : function () {
        if (ig.input.pressed('start')){
            ig.system.setGame(StartScreen);
        }
        this.parent();
    },

    draw : function () {
        this.parent();
        this.background.draw(0,0);
        var x = ig.system.width/2;
        var y = ig.system.height/2 - 20;
        this.gameOver.draw(x-(this.gameOver.width * .5), y - 30);
        var score = this.stats.score - (this.stats.deaths * 50);

        //this.instructText.draw('Total Kills: ' + this.stats.kills, x, y+30, ig.Font.ALIGN.CENTER);
        //this.instructText.draw('Total Deaths: ' + this.stats.deaths, x, y+40, ig.Font.ALIGN.CENTER);
        this.instructText.draw('Score: ' + this.stats.score, x, y+30, ig.Font.ALIGN.CENTER);
        this.instructText.draw('Press Spacebar to continue', x, ig.system.height - 10, ig.Font.ALIGN.CENTER);
    },
});

// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', StartScreen, 60, 320, 240, 2 );


ig.devControls.add({
    id: 'Gravity',
    min: -300,
    max: 500,
    step : 100,
    value : 300,
    callback : function (n) {
        ig.game.gravity = n;
    }
});

ig.devControls.add({
    id: 'Lives',
    min: 0,
    max: 10,
    step : 1,
    value : 3,
    callback : function (n) {
        ig.game.lives = n;
    }
});

ig.devControls.add({
    id: 'Zombie Speed',
    min: 0,
    max: 100,
    step : 5,
    value : 15,
    callback : function (n) {
        var zombies = ig.game.getEntitiesByType(EntityZombie);
        var ii;

        for (ii in zombies) {
            if (zombies.hasOwnProperty(ii)) {
                zombies[ii].speed = n;
            }
        }
    }
});

ig.devControls.add({
    id: 'Player Speed',
    min: 0, max: 500, step : 50, value : 100,
    callback : function (n) {
        ig.game.getEntitiesByType(EntityPlayer)[0].maxVel.x = n;
    }
});


/*
ig.devControls.add({
    id: 'Bullet Speed',
    min: 0, max: 500, step : 50, value : 200,
    callback : function (n) {
        EntityBullet.inject({maxVel: {x : n, y : 0}});
    }
});
*/
});
