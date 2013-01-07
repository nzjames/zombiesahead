ig.module(
    'plugins.devcontrol'
)
.requires(
)
.defines(function(){ "use strict";

ig.DevControl = ig.Class.extend({

    /*
     * Object to keep a reference to all the dom inputs
     * not used at the moment, will be useful to destroy the 
     * event listeners if we need to destroy the dom nodes
     */
    controls : {},

    /*
     * Generate the container for the dev controls 
     * and add to the DOM.
     * Takes a target and an optional title
     */
    setupContainer : function (cfg) {
        var target = cfg.target || 'body';

        var container = ig.$new('div');
        container.id = 'dev-controls';

        var title = ig.$new('b');
        title.innerHTML = cfg.title || 'Dev Controls';

        var list = ig.$new('ul');
        list.id = 'dev-control-list';

        container.appendChild(title);
        container.appendChild(list);

        ig.$(target)[0].appendChild(container);
    },

    add : function (cfg){

        var labelText = cfg.id +':';
        var id = cfg.id.replace(/[^a-z0-9]+/gi,'');
        var li = ig.$new('li');
        var input = ig.$new('input');
        var label = ig.$new('label');
        var value = ig.$new('span');

        label.setAttribute('for', id);
        label.innerHTML = labelText;

        input.type = cfg.type || 'range';
        input.id = id;
        input.name = id;
        input.min = cfg.min || 0;
        input.max = cfg.max || 10;
        input.step = cfg.step || 1;
        input.value = cfg.value || 0;
        input.callback = cfg.callback || ig.log;
        this.controls[cfg.id] = input;

        value.innerHTML =input.value;

        li.appendChild(label);
        li.appendChild(input);
        li.appendChild(value);
        ig.$('#dev-control-list').appendChild(li);
        input.addEventListener('change', function(e) {
            input.callback(input.value);
            value.innerHTML = input.value;
        });
    }

});

ig.devControls = new ig.DevControl();
ig.devControls.setupContainer({});


});

