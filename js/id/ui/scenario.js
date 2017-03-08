iD.ui.Scenario = function(context) {
    var id,
        legendContainer;
    var that = this;

    window.ctx = context;

    var cssConfig = {
        ways: {
            cssRule: "stroke",
            additional: ".layer-lines .line-stroke"
        },
        relations: {
            cssRule: "fill",
            additional: function(id) {
                return ".area-fill .w" + id.substr(1, id.length);
            }
        },
        nodes: {
            cssRule: "fill",
            additional: ".layer-hit .stroke"
        }
    }


    /**
     * Add Simulate Button
     */
    this.addSimulate = function(selection) {
        console.log(id);
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

    this.setEntityId = function(_) {
        if (context.hasEntity(_)) {
            id = _;
        } else {
            console.log(_ + "id konnte nicht gefunden werden.");
        }
    }

    /**
     * [updateScenarioSettings description]
     * @param  {[type]} _ [description]
     * @return {[type]}   [description]
     */
    this.updateMap = function() {
        console.log("drin");
        var addCss = document.getElementsByClassName('additionalCss');
        for (var i = 0; i < addCss.length; i++) {
            addCss[i].parentNode.removeChild(addCss[i]);
        }
        addCss = document.getElementsByClassName('additionalCss');
        // sometimes not all rules get removed
        if (addCss.length > 0) {
            this.updateMap();
        } else {
            drawColors();
        }
    }

    /**
     * [drawColors description]
     * Adds css styles to dom to style elements based on tags value number
     */
    function drawColors() {
        var scenarioEntity,
            entitys = {
                node: [],
                ways: [],
                relation: []
            };

        var stack = context.graph();
        var entities = stack.entities.__proto__;


        for (var item in entities) {
            var entity = context.entity(item);
            switch (entity.type) {
                case "node":
                    entitys.node.push(entity);
                    break;
                case "way":
                    if (entity.tags.type != 'hub_area')
                        entitys.ways.push(entity);
                    break;
                case "relation":
                    entitys.relation.push(entity);
                    break;
            }
        }

        draw(entitys);
    }

    /**
     * [setColor description]
     * @param {[type]} array            [description]
     * @param {[type]} cssRule          [description]
     * @param {[text || function(id){returns text}]} additional [description]
     */
    function draw(array) {
        var scenarioColorSettings = context.storage('scenario_color_setting') || 'ways';
        var maxValue;
        var css = cssConfig[scenarioColorSettings];
        console.log();

        clearLegend();

        if (scenarioColorSettings == "relations") {
            var scenarioRelationSettings = context.storage('scenario_relation_setting') || 'incoming_rel';
            // nothing !
        } else if (scenarioColorSettings == "ways") {
            var scenarioWaySettings = context.storage('scenario_way_setting') || 'I';

            maxValue = getMaxTagValue(array.ways, scenarioWaySettings);

            for (var i = 0; i < array.ways.length; i++) {
                if (typeof(array.ways[i].tags[scenarioWaySettings]) != 'undefined') {
                    console.log(typeof(array.ways[i].tags[scenarioWaySettings]) != 'undefined');
                    var color = getColor(((array.ways[i].tags[scenarioWaySettings] / maxValue) - 100) * (-1));

                    if (typeof css.additional == 'function') {
                        createClass(css.additional(array.ways[i].id), css.cssRule + ": " + color);
                    } else {
                        createClass(css.additional + " ." + array.ways[i].id, css.cssRule + ": " + color);
                    }
                }
            }
            if(maxValue != 0) {
                createLabel(0, maxValue);
                createLabel(50, maxValue/2);
            }
        }
    }

    /**
     * [getMaxTagValue description]
     * Returns max value of array entries of tags.value
     * @param  {[entity]} array [description]
     * @return {[number]}       [description]
     */
    function getMaxTagValue(array, tag) {
        var maxValue = 0;
        for (var i = 0; i < array.length; i++) {
            if (typeof(array[i].tags[tag] != 'undefined')) {
                if (maxValue < Number(array[i].tags[tag])) {
                    maxValue = Number(array[i].tags[tag]);
                }
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
        var hue = ((1 - Number(value)) * 120).toString(10);
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
        style.className = 'additionalCss';
        document.getElementsByTagName('head')[0].appendChild(style);
        if (!(style.sheet || {}).insertRule)
            (style.styleSheet || style.sheet).addRule('#map .layer ' + name, rules);
        else
            style.sheet.insertRule('#map .layer ' + name + "{" + rules + "}", 0);
    }

    /**
     * [removeClass description]
     * 
     * @return {[type]} [description]
     */
    this.addLegend = function() {
        var selection = d3.select(".map-controls .map-data-control .map-overlay");
        selection.select(".legendContainer").remove();
        legendContainer = document.createElement('div');
        legendContainer.className = "legendContainer";
        var bar = document.createElement('div');
        bar.className = "legendBar";
        selection.node().append(legendContainer);
        legendContainer.append(bar);
    }

    function createLabel(procent, text) {
        console.log("createLabel");
        var label = document.createElement('div');
        label.className = "legendLabel";

        var span = document.createElement("div");
        span.className = "spanLabel";
        span.innerHTML = (Math.round(Number(text) * 100)) / 100;

        legendContainer.append(label);
        legendContainer.append(span);

        label.style.left = (Math.round((procent * 0.9)) + 5) + "%";
        span.style.left = (Math.round((procent * 0.9)) + 5) + "%";
    }

    function clearLegend() {
        legendContainer.innerHTML = "";
        var bar = document.createElement('div');
        bar.className = "legendBar";
        legendContainer.append(bar);
    }

    function prepend(element, parentEle) {
        return parentEle.insert(element, ':first-child');
    };

    return this;
};