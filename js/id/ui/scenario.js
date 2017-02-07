iD.ui.ScenarioViewer = function(context) {
    var dispatch = d3.dispatch('choose'),
        state = 'select',
        base,
        id,
        preset,
        reference,
        selectedScenario;

    /**
     * Add Simulate Button
     */
    function scenarioViewer(selection) {
        var entity = context.entity(id),
            tags = _.clone(entity.tags);

        selection.selectAll('.simulateContainer').remove();

        var body = selection.selectAll('.inspector-body')
            .data([0]);

        if (entity.tags.type === 'scenario') {
            var outer = prepend('div', body)
                .attr('class', 'inspector-inner simulateContainer')

            outer.insert('button', ':first-child')
                .attr('class', 'simulateButton')
                .html('Simulate')
                .on('click', function() {
                    var pane = d3.select('div.entity-editor-pane');
                    var parameters = prompt(
                        'Specify arguments with which to run the "' +
                        entity.tags.name + '" scenario.',
                        'key-1=value-1&key-2=value-2');
                    if (parameters != null) {
                        console.log(entity);
                        d3.xhr('/simulate?scenario=' + entity.id + '&' +
                                parameters)
                            .on('load', function(xhr) {
                                window.open('/simulation/' + xhr.response)
                            })
                            .send('PUT');
                    };
                });
        }
    }

    /** 
     * Init Selectbox 
     */
    scenarioViewer.initScenarioSelection = function(parent) {
        var outer = prepend('div', parent)
            .attr('class', 'foobar inspector-inner fillL cf')
            .append('span');
        outer.html('');
        var input = outer.append('input')
            .attr('class', 'value combobox-input')
            .attr('type', 'text')
            .attr('placeholder', 'Getting scenarios');
        outer.append('div').attr('class', 'combobox-caret');

        d3.xhr('/scenario')
            .on('load', function(xhr) {
                if (xhr.response === '') {
                    input.attr('placeholder', 'Select a scenario');
                } else {
                    var e = JSON.parse(xhr.response);
                    prepend('span', outer).text('Selected scenario: ' + e.value);
                    selectedScenario = 'r' + e.title;

                    input.attr('placeholder', 'Change selected scenario');
                    outer.append('a')
                        .attr('class', 'value combobox-input')
                        .attr('href', '#')
                        .text(e.value)
                        .on('click', function() {
                            context.enter(iD.modes.Select(context, ['r' + e.title]))
                        });
                    drawColors();
                };
            })
            .send('GET');

        d3.xhr('/scenarios')
            .on('load', function(xhr) {
                var data = JSON.parse(xhr.response);
                input.call(d3.combobox()
                    .data(data)
                    .minItems(1)
                    .on('accept', function(e) {
                        d3.xhr('/scenario/' + e.title)
                            .on('load', function(_) {
                                if (e.title === null) {
                                    window.location.reload(true);
                                    return;
                                };
                                try {
                                    context.enter(iD.modes.Select(context, ['r' + e.title]));
                                    window.location.reload(true);
                                } catch (err) {
                                    window.location.reload(true);
                                }
                            })
                            .send('PUT')
                    }));
                input.attr('defaultValue', data[0]);
            })
            .send('GET');

        return input;
    }

    function drawColors() {
        try {
            var scenarioEntity = context.entity(selectedScenario);
        } catch (e) {
            console.log(e);
            window.setTimeout(drawColors, 500);
            return;
        }

        var entitys = {
            node: [],
            ways: [],
            relation: []
        };


        if (entitysLoaded()) {
            for (var i = 0; i < scenarioEntity.members.length; i++) {
                switch (scenarioEntity.members[i].type) {
                    case "node":
                        entitys.node.push(context.entity(scenarioEntity.members[i].id));
                        break;
                    case "way":
                        var way = context.entity(scenarioEntity.members[i].id);
                        if(way.tags.type != 'hub_area')
                            entitys.ways.push(way);
                        break;
                    case "relation": 
                        entitys.relation.push(context.entity(scenarioEntity.members[i].id));
                        break;
                }
            }
        } else {
            window.setTimeout(drawColors, 400);
            return;
        }


        console.log(scenarioEntity);
        console.log(entitys.ways);
        console.log(entitys.relation);
        var maxNode = getMaxTagValue(entitys.node);
        var maxWay = getMaxTagValue(entitys.ways);
        var maxRelation = getMaxTagValue(entitys.relation);
        console.log(maxWay);
        console.log(maxRelation);

        // Draw Node
        for (var i = 0; i < entitys.node.length; i++) {
            var color = getColor(entitys.node[i].tags.value / maxNode);

            createClass(".layer-hit .stroke ." + entitys.node[i].id, "fill: " + color);
        }


        // Draw Relation
        for (var i = 0; i < entitys.relation.length; i++) {
            var color = getColor(entitys.relation[i].tags.value / maxRelation);

            createClass(".area-fill .w" + entitys.relation[i].id.substr(1, entitys.relation[i].id.length), "fill: " + color);
        }

        // Draw Ways
        for (var i = 0; i < entitys.ways.length; i++) {
            var color = getColor(entitys.ways[i].tags.value / maxWay);
            console.log(color);

            createClass(".layer-lines .line-stroke ." + entitys.ways[i].id, "stroke: " + color);
        }


        function entitysLoaded() {
            for (var i = 0; i < scenarioEntity.members.length; i++) {
                if (!context.hasEntity(scenarioEntity.members[i].id)) {
                    return false;
                } else {
                    console.log("has " + scenarioEntity.members[i].id);
                }
            }
            return true;
        }
    }

    scenarioViewer.state = function(_) {
        if (!arguments.length) return state;
        state = _;
        return scenarioViewer;
    };

    scenarioViewer.entityID = function(_) {
        if (!arguments.length) return id;
        id = _;
        base = context.graph();
        scenarioViewer.preset(context.presets().match(context.entity(id), base));
        return scenarioViewer;
    };

    scenarioViewer.preset = function(_) {
        if (!arguments.length) return preset;
        if (_ !== preset) {
            preset = _;
            reference = iD.ui.TagReference(preset.reference(context.geometry(id)), context)
                .showing(false);
        }
        return scenarioViewer;
    };

    /**
     * [getMaxTagValue description]
     * Returns Max Value of array entries of tags.value
     * @param  {[entity]} array [description]
     * @return {[number]}       [description]
     */
    function getMaxTagValue(array) {
        var maxValue = 0;
        for (var i = 0; i < array.length; i++) {
            try {
                if (maxValue < array[i].tags.value)
                    maxValue = array[i].tags.value;
            } catch (e) {

            }
        }
        return maxValue;
    }

    /**
     * [getColor description]
     * Returns Color based on percentage value (0.0 - 1)
     * 
     */
    function getColor(value) {
        var hue = ((1 - value) * 120).toString(10);
        return ["hsl(", hue, ",100%,50%)"].join("");
    }

    /**
     * [createClass description]
     * Sets addional CSS Class in Head Style Tag
     * @param  {[string]} name  [description]
     * selector
     * Selector will be higher prio with map and layer class added before name selector param
     * @param  {[string]} rules [description]
     * css rule
     */
    function createClass(name, rules) {
        var style = document.createElement('style');
        style.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(style);
        if (!(style.sheet || {}).insertRule)
            (style.styleSheet || style.sheet).addRule('#map .layer ' + name, rules);
        else
            style.sheet.insertRule('#map .layer ' + name + "{" + rules + "}", 0);
    }

    function prepend(element, parentEle) {
        return parentEle.insert(element, ':first-child');
    };

    return d3.rebind(scenarioViewer, dispatch, 'on');
};