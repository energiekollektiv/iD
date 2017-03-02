iD.ui.ScenarioViewer = function(context) {
    var dispatch = d3.dispatch('choose'),
        state = 'select',
        base,
        id,
        preset,
        reference;



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
                            .on('load', function(xhr){
                            window.open('/simulation/' + xhr.response)
                        })
                        .send('PUT');
                    };
                });
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

    function prepend(element, parentEle){
        return parentEle.insert(element, ':first-child');
    };

    return d3.rebind(scenarioViewer, dispatch, 'on');
};
