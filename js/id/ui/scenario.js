iD.ui.Scenario = function(context) {
    var id,
        selectedScenario,
        legendContainer;

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

        // checks if everything is loaded
        if (context.hasEntity(selectedScenario)) {
            scenarioEntity = context.entity(selectedScenario);
            console.log(scenarioEntity);
            if (!entitysLoaded()) {
                console.log("not loaded")
                window.setTimeout(drawColors, 400);
                return;
            } else {
                console.log("loaded !!!");
            }
        } else {
            window.setTimeout(drawColors, 400);
            return;
        }

        for (var i = 0; i < scenarioEntity.members.length; i++) {
            switch (scenarioEntity.members[i].type) {
                case "node":
                    entitys.node.push(context.entity(scenarioEntity.members[i].id));
                    break;
                case "way":
                    var way = context.entity(scenarioEntity.members[i].id);
                    if (way.tags.type != 'hub_area')
                        entitys.ways.push(way);
                    break;
                case "relation":
                    entitys.relation.push(context.entity(scenarioEntity.members[i].id));
                    break;
            }
        }

        // Draw Node
        // setColor(entitys.node, scenarioSettings, "fill", ".layer-hit .stroke");
        // Draw Relation
        /*setColor(entitys.relation, scenarioSettings,"fill", function(id) {
            return ".area-fill .w" + id.substr(1, id.length);
        });*/
        // Draw Ways
        setColor(entitys, "stroke", ".layer-lines .line-stroke");

        function entitysLoaded() {
            for (var i = 0; i < scenarioEntity.members.length; i++) {
                if (!context.hasEntity(scenarioEntity.members[i].id)) {
                    return false;
                }
            }
            return true;
        }
    }

    /**
     * [setColor description]
     * @param {[type]} array            [description]
     * @param {[type]} cssRule          [description]
     * @param {[text || function(id){returns text}]} addionalSelector [description]
     */
    function setColor(array, cssRule, addionalSelector) {
        var scenarioColorSettings = context.storage('scenario_color_setting') || 'ways';
        var maxValue;

        clearLegend();

        if (scenarioColorSettings == "relations") {
            var scenarioWaySettings = context.storage('scenario_relation_setting') || 'incoming_rel';
            // nothing !
        } else if (scenarioColorSettings == "ways") {
            var scenarioWaySettings = context.storage('scenario_way_setting') || 'installed_power';
            maxValue = getMaxTagValue(array.ways, scenarioWaySettings);

            for (var i = 0; i < array.ways.length; i++) {
                try {
                    var color;
                    switch (scenarioWaySettings) {
                        case "installed_power":
                            color = getColor(((array.ways[i].tags.installed_power / maxValue) - 100) * (-1));
                            createLabel(((array.ways[i].tags.installed_power / maxValue )  -1) * (-100), array.ways[i].tags.installed_power );
                            break;
                        case "efficiency":
                            color = getColor(((array.ways[i].tags.efficiency / maxValue) - 100) * (-1));
                            console.log((array.ways[i].tags.efficiency / maxValue) );
                            console.log("dada");
                            createLabel( ((array.ways[i].tags.efficiency / maxValue) - 1) * (-100), array.ways[i].tags.efficiency);
                            break;
                    }

                    if (typeof addionalSelector === 'function') {
                        createClass(addionalSelector(array.ways[i].id), cssRule + ": " + color);
                    } else {
                        createClass(addionalSelector + " ." + array.ways[i].id, cssRule + ": " + color);
                    }
                } catch (e) {}
            }
        }
    }

    /**
     * [getMaxTagValue description]
     * Returns max value of array entries of tags.value
     * @param  {[entity]} array [description]
     * @return {[number]}       [description]
     */
    function getMaxTagValue(array, scenarioSettings) {
        var maxValue = 0;
        for (var i = 0; i < array.length; i++) {
            try {
                switch (scenarioSettings) {
                    case "installed_power":
                        if (Number(maxValue) < Number(array[i].tags.installed_power)) {
                            maxValue = array[i].tags.installed_power;
                        }
                        break;
                    case "efficiency":
                        if (Number(maxValue) < Number(array[i].tags.efficiency)) {
                            maxValue = array[i].tags.efficiency;
                        }
                        break;
                    case "null":
                        return 0;
                        break;
                }
            } catch (e) {
                console.log(e);
            }
        }
        return maxValue;
    }

    /**
     * [getMinTagValue description]
     * Returns min value of array entries of tags.value
     * @param  {[entity]} array [description]
     * @return {[number]}       [description]
     */
    /*function getMinTagValue(array) {
        var mixValue = 0;
        for (var i = 0; i < array.length; i++) {
            try {
                if (maxValue < array[i].tags.value) {
                    maxValue = array[i].tags.value;
                }
            } catch (e) {

            }
        }
        return maxValue;
    }*/

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
        console.log("drin");
        var label = document.createElement('div');
        label.className = "legendLabel";

        var span = document.createElement("div");
        span.className = "spanLabel";
        span.innerHTML = (Math.round(Number(text) * 100)) / 100;

        legendContainer.append(label);    
        legendContainer.append(span);

        label.style.left = (Math.round((procent * 0.9)) + 5 ) + "%"; 
        span.style.left = (Math.round((procent * 0.9)) + 5 ) + "%";
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
