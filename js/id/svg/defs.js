/*
    A standalone SVG element that contains only a `defs` sub-element. To be
    used once globally, since defs IDs must be unique within a document.
*/
iD.svg.Defs = function(context) {

    function SVGSpriteDefinition(id, href) {
        return function(defs) {
            d3.xml(href, 'image/svg+xml', function(err, svg) {
                if (err) return;
                defs.node().appendChild(
                    d3.select(svg.documentElement).attr('id', id).node()
                );
            });
        };
    }

    return function drawDefs(selection) {
        var defs = selection.append('defs');

        // marker
        defs.append('marker')
            .attr({
                id: 'oneway-marker',
                viewBox: '0 0 10 10',
                refY: 2.5,
                refX: 5,
                markerWidth: 2,
                markerHeight: 2,
                markerUnits: 'strokeWidth',
                orient: 'auto'
            })
            .append('path')
            .attr('class', 'oneway')
            .attr('d', 'M 5 3 L 0 3 L 0 2 L 5 2 L 5 0 L 10 2.5 L 5 5 z')
            .attr('stroke', 'none')
            .attr('fill', '#000')
            .attr('opacity', '0.5');

        // patterns
        var patterns = defs.selectAll('pattern')
            .data([
                // pattern name, pattern image name
                ['wetland', 'wetland'],
                ['construction', 'construction'],
                ['cemetery', 'cemetery'],
                ['orchard', 'orchard'],
                ['farmland', 'farmland'],
                ['beach', 'dots'],
                ['scrub', 'dots'],
                ['meadow', 'dots']
            ])
            .enter()
            .append('pattern')
            .attr({
                id: function (d) {
                    return 'pattern-' + d[0];
                },
                width: 32,
                height: 32,
                patternUnits: 'userSpaceOnUse'
            });

        patterns.append('rect')
            .attr({
                x: 0,
                y: 0,
                width: 32,
                height: 32,
                'class': function (d) {
                    return 'pattern-color-' + d[0];
                }
            });

        patterns.append('image')
            .attr({
                x: 0,
                y: 0,
                width: 32,
                height: 32
            })
            .attr('xlink:href', function (d) {
                return context.imagePath('pattern/' + d[1] + '.png');
            });

        // clip paths
        defs.selectAll()
            .data([12, 18, 20, 32, 45])
            .enter().append('clipPath')
            .attr('id', function (d) {
                return 'clip-square-' + d;
            })
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', function (d) {
                return d;
            })
            .attr('height', function (d) {
                return d;
            });

        // Load energy icons from icons8
        var icons8 = [
            'battery',
            'battery-1',
            'coal',
            'electricity',
            'electric-tower',
            'energy',
            'fan',
            'gasoline',
            'gasoline-pump',
            'light-bulb',
            'light-bulb-1',
            'light-bulb-2',
            'nuclear',
            'nuclear-1',
            'nuclear-plant',
            'nuclear-plant-1',
            'petrol',
            'petrol-1',
            'plug',
            'power',
            'power-1',
            'power-2',
            'power-plant',
            'renwable-energy',
            'socket',
            'socket-1',
            'solar-panel',
            'sun',
            'water',
            'wind-mill'
        ]
        for (var i = 0; i < icons8.length; i++) {
            defs.call(SVGSpriteDefinition(
                icons8[i],
                context.imagePath('icons8/' + icons8[i] + '.svg')));
        }


        defs.call(SVGSpriteDefinition(
            'iD-sprite',
            context.imagePath('iD-sprite.svg')));

        defs.call(SVGSpriteDefinition(
            'maki-sprite',
            context.imagePath('maki-sprite.svg')));

    };
};
