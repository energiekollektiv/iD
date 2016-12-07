iD.ui.Inspector = function(context) {
    var presetList = iD.ui.PresetList(context),
        entityEditor = iD.ui.EntityEditor(context),
        scenarioViewer = iD.ui.ScenarioViewer(context),
        state = 'select',
        entityID,
        newFeature = false;


    function inspector(selection) {
        presetList
            .entityID(entityID)
            .autofocus(newFeature)
            .on('choose', setPreset);

        entityEditor
            .state(state)
            .entityID(entityID)
            .on('choose', showList);

        scenarioViewer
            .state(state)
            .entityID(entityID);    

        var $wrap = selection.selectAll('.panewrap')
            .data([0]);

        var $enter = $wrap.enter().append('div')
            .attr('class', 'panewrap');

        $enter.append('div')
            .attr('class', 'preset-list-pane pane');

        $enter.append('div')
            .attr('class', 'entity-editor-pane pane');


        var $presetPane = $wrap.select('.preset-list-pane');
        var $editorPane = $wrap.select('.entity-editor-pane');

        /*var timeseriesLink = d3.select('.entity-editor-pane .inspector-body')
                            .append('a')
                            .html('timeseriesLink');*/

        var graph = context.graph(),
            entity = context.entity(entityID),
            showEditor = state === 'hover' ||
                entity.isUsed(graph) ||
                entity.isHighwayIntersection(graph);

        console.log(entity.id);

        console.log(entity);

        if (showEditor) {
            $wrap.style('right', '0%');
            $editorPane.call(entityEditor);
            $editorPane.call(scenarioViewer);

        } else {
            $wrap.style('right', '-100%');
            $presetPane.call(presetList);
        }

        var $footer = selection.selectAll('.footer')
            .data([0]);

        $footer.enter().append('div')
            .attr('class', 'footer');

        selection.select('.footer')
            .call(iD.ui.ViewOnOSM(context)
                .entityID(entityID));

        function showList(preset) {
            $wrap.transition()
                .styleTween('right', function() { return d3.interpolate('0%', '-100%'); });

            $presetPane.call(presetList
                .preset(preset)
                .autofocus(true));
        }

        function setPreset(preset) {
            $wrap.transition()
                .styleTween('right', function() { return d3.interpolate('-100%', '0%'); });

            $editorPane.call(entityEditor
                .preset(preset));
        }

        var test = d3.select('.entity-editor-pane .inspector-body');
        var $header = test.selectAll('#timeseriesLink')
            .data([]);

        $header.exit().remove();
        
        // Enter
        if(entity.tags.timeseries != null) {
            var links = entity.tags.timeseries.split(',');
            for (var i = links.length - 1; i >= 0; i--) {
                links[i] = links[i].trim();

                var $test = $header.data([0]).enter().append('a')
                    .attr('id', 'timeseriesLink')
                    .attr('target', 'blank')
                    .attr('href', 'timeseries/gettimeseries.html?id=' + entity.id + "&view=" + links[i])
                    .html(links[i]);
            }
        }
    }

    inspector.state = function(_) {
        if (!arguments.length) return state;
        state = _;
        entityEditor.state(state);
        return inspector;
    };

    inspector.entityID = function(_) {
        if (!arguments.length) return entityID;
        entityID = _;
        return inspector;
    };

    inspector.newFeature = function(_) {
        if (!arguments.length) return newFeature;
        newFeature = _;
        return inspector;
    };

    return inspector;
};
