function mapa2() {
    // Inicio 
    var width = '100%',
        height = '100%',
        sizeModifier = 50,
        hue = 0,
        colors = {},
        meteorites;

    var projection = d3.geo.mercator()
        .translate([780, 360])
        .scale(300);

    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([.5, 18])
        .on("zoom", zoomed);

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select('#container')
        .append('svg')
        .attr('width', '100%')

    // Coloca el background color
    svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#266D98')
        .call(zoom)


    d3.select(window).on("resize", sizeChange);

    // Funciones de Tooltip
    var div = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    var map = svg.append('g');

    // Mapa de la tierra
    d3.json('https://d3js.org/world-50m.v1.json', function(json) {
        map.selectAll('path')
            .data(topojson.feature(json, json.objects.countries).features)
            .enter()
            .append('path')
            .attr('fill', '#95E1D3')
            .attr('stroke', '#266D98')
            .attr('d', path)
            //.call(zoom) // This is super jittery for some reason
    });

    // Archivo Json donde se encuentran los Data points
    d3.json('https://data.nasa.gov/resource/y77d-th95.geojson', function(json) {

        json.features.sort(function(a, b) {
            return new Date(a.properties.year) - new Date(b.properties.year);
        })
        json.features.map(function(e) {
            hue += .35;
            colors[e.properties.year] = hue;
            e.color = 'hsl(' + hue + ',100%, 50%)';
        })

        json.features.sort(function(a, b) {
            return b.properties.mass - a.properties.mass
        })

        meteorites = svg.append('g')
            .selectAll('path')
            .data(json.features)
            .enter()
            .append('circle')
            .attr('cx', function(d) { return projection([d.properties.reclong, d.properties.reclat])[0] })
            .attr('cy', function(d) { return projection([d.properties.reclong, d.properties.reclat])[1] })
            .attr('r', function(d) {
                var range = 718750 / 2 / 2;

                if (d.properties.mass <= range) return 2;
                else if (d.properties.mass <= range * 2) return 10;
                else if (d.properties.mass <= range * 3) return 20;
                else if (d.properties.mass <= range * 20) return 30;
                else if (d.properties.mass <= range * 100) return 40;
                return 50;
            })
            .attr('fill-opacity', function(d) {
                var range = 718750 / 2 / 2;
                if (d.properties.mass <= range) return 1;
                return .5;
            })
            .attr('stroke-width', 1)
            .attr('stroke', '#EAFFD0')
            .attr('fill', function(d) { return d.color })
            .on('mouseover', function(d) {
                d3.select(this).attr('d', path).style('fill', 'black');
                // Muestra el tooltip
                div.transition()
                    .duration(200)
                    .style('opacity', .9);
                div.html('<span class="def">caída:</span> ' + d.properties.fall + '<br>' +
                        '<span class="def">masa:</span> ' + d.properties.mass + '<br>' +
                        '<span class="def">nombre:</span> ' + d.properties.name + '<br>' +
                        '<span class="def">tipo:</span> ' + d.properties.nametype + '<br>' +
                        '<span class="def">reclasificado:</span> ' + d.properties.recclass + '<br>' +
                        '<span class="def">recuperado:</span> ' + d.properties.reclat + '<br>' +
                        '<span class="def">año:</span> ' + d.properties.year + '<br>')
                    .style('left', (d3.event.pageX + 30) + 'px')
                    .style('top', (d3.event.pageY / 1.5) + 'px')
            })
            .on('mouseout', function(d) {
                // Color de los puntos
                d3.select(this).attr('d', path).style('fill', function(d) { return d.properties.hsl });

                // Desvanece la descripción emergente
                div.transition()
                    .duration(500)
                    .style('opacity', 0);
            });

        // Tamañamos del mapa
        sizeChange();
    });

    // Mover y escalar mapas y meteoritos en interacción
    function zoomed() {
        map.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        meteorites.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    }


    // Cambia el tamaño del mapa al cambiar el tamaño de la ventana
    function sizeChange() {
        d3.selectAll("g").attr("transform", "scale(" + $("#container").width() / 1900 + ")");
        $("svg").height($("#container").width() / 2);
    }
}