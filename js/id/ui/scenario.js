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

        selection.selectAll(".simulateContainer").remove();

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
                        "Specify arguments with which to run the '" +
                        entity.tags.name + "' scenario.",
                        "key-1=value-1&key-2=value-2");
                    if (parameters != null) {
                        d3.xhr("/simulate?scenario=" + entity.id + "&" +
                               parameters)
                            .on("load", function(xhr){
                            window.open("/simulation/" + xhr.response)
                        })
                        .send("PUT");
                    };
                });
        }
    }

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
                    input.attr('placeholder', 'Change selected scenario');
                    outer.append('a')
                        .attr('class', 'value combobox-input')
                        .attr('href', '#')
                        .text(e.value)
                        .on('click', function() {
                            context.enter(iD.modes.Select(context, ["r" + e.title]))
                        });
                };
            })
            .send('GET');

        d3.xhr('/scenarios')
            .on('load', function(xhr){
                var data = JSON.parse(xhr.response);
                input.call(d3.combobox()
                    .data(data)
                    .minItems(1)
                    .on('accept', function (e) {
                        d3.xhr('/scenario/' + e.title)
                            .on('load', function (_) {
                                if (e.title === null){
                                    window.location.reload(true);
                                    return ;
                                };
                                try {
                                    context.enter(iD.modes.Select(context, ["r" + e.title]));
                                    window.location.reload(true);
                                }
                                catch(err) {
                                    window.location.reload(true);
                                }
                            })
                            .send('PUT')}));
                        input.attr("defaultValue", data[0]);
            })
            .send('GET');

        return input;
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
