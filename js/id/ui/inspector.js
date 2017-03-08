iD.ui.Inspector = function(context) {
    var presetList = iD.ui.PresetList(context),
        entityEditor = iD.ui.EntityEditor(context),
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

        var scenarioViewer = context.scenario();
        scenarioViewer.setEntityId(entityID); 

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


        if (showEditor) {
            $wrap.style('right', '0%');
            $editorPane.call(entityEditor);
            scenarioViewer.addSimulate($editorPane);
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

        var $header = test.selectAll('.timeseriesLink')
            .data([]);

        $header.exit().remove();
        

        // Enter
        if(entity.tags.timeseries != null) {
            var links = entity.tags.timeseries.split(',');
            for (var i = links.length - 1; i >= 0; i--) {
                var name = links[i].trim();

                var $test = $header.data([0]).enter().append('button')
                    .attr('class', 'timeseriesLink')
                    .attr('target', 'blank')
                    .on('click', function() {
                        d3.xhr('/' + entity.id.substring(0,1) + '/' + entity.id.substring(1, entity.id.length) + '/JSON' , function(error, xhr) {
                            if(isJson(xhr.response)) {
                                var data = JSON.parse(xhr.response);
                                if(name == 'load_profile') {
                                    if(data.timeseries.load_profile != null) {
                                        var content = getTimeseries(data.timeseries.load_profile);
                                        new Lightbox(content);
                                    }
                                    else {
                                        console.log('No data found');
                                    }
                                }
                                else if (name == 'variable_costs') {
                                    if(data.timeseries.load_profile != null) {
                                        new Lightbox(getTimeseries(data.timeseries.variable_costs));
                                    }
                                    else {
                                        console.log('No data found');
                                    }
                                }
                                else {
                                    console.log('View unknown');
                                }
                            }
                        });
                    })
                    .html(name);
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
