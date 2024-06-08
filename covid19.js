var w = 1300;
var h = 850;
var jsondata;
let years = ["2020", "2021", "2022", "2023", "2024"];
let year = years[0];
let plottype = "overally";
var color = d3.scaleQuantize()
    .range(['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'])
let Scale = d3.scaleLog()
var svg = d3.select("#chart1")
    .attr("width", w)
    .attr("height", h)
    .attr("fill", "grey");
var projection = d3.geoMercator()
    .center([0, 45])
    .translate([w / 2, h / 2])
    .scale(200);
var path = d3.geoPath()
    .projection(projection);
var tooltip = d3.select("#mytooltip")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
//read dataset
d3.json("covid_death.json").then(function (data) {
    d3.json("custom.geo.json").then(function (json) {

        for (var i = 0; i < data.length; i++) {
            var dataState = data[i].code;
            for (var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j].properties.iso_a3;
                if (dataState == jsonState) {
                    json.features[j].properties[data[i].year] = data[i].value;
                    break;
                }
            }
        }
        jsondata = json;
        plot()
        $("#uselog").click(e => { plot() })
        $(".comparator").on("change", e => {
            if (e.target.checked) {
                plottype = e.target.value;
                plot();
            }
        })
    })
})
//decorator plot function
function plotyear(y) {
    year = y;
    plot();
}
//plot the map
function plot() {
    console.log(plottype);
    color.domain([
        0,
        plottype == "overally" ?
            d3.max(jsondata.features, d => d3.max(years, y => d.properties[y])) :
            d3.max(jsondata.features, d => d.properties[year])
    ])
    console.log(color.domain())
    Scale.domain([1, color.domain()[1]])
        .range(color.domain())
    svg.selectAll("path")
        .remove();
    svg.selectAll("path")
        .data(jsondata.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "black")
        .attr("stroke-width", "1")
        .attr("fill", function (state) {
            return color($("#uselog")[0].checked ? Scale(state.properties[year]) : state.properties[year]);
        })
        .attr("country", d => d.properties.name)
        .attr("death", d => d.properties[year])

    //for mouse hover interaction
    $("path").on("mousemove", function (e) {
        let ele = $(e.target);
        $("#tooltip").css({ position: "absolute", transform: "none", top: e.pageY - 5, left: e.pageX - 5 });
        let txt = `${ele.attr("country")}: ${ele.attr("death") != undefined ? ele.attr("death") + " Fatalities" : "No Data"}`;
        if ($("#tooltip").attr("data-bs-original-title") != txt) {
            $("#tooltip").attr("data-bs-original-title", txt);
        }
        $('[data-toggle="tooltip"]').tooltip('show')
    })
    $("path").on('mouseleave', function (e) {
        $('[data-toggle="tooltip"]').tooltip('hide')
    })
    makeLegend();
}
//craft legends
function makeLegend() {
    $("#legendcolcontainer").html("");
    color.range().forEach(c => {
        let x = color.invertExtent(c)
        let ranges;
        if ($("#uselog")[0].checked) {
            ranges = [Math.round(Scale.invert(x[0])), Math.round(Scale.invert(x[1]))];
        } else {
            ranges = [Math.round(x[0]), Math.round(x[1])];
        }
        $("#legendcolcontainer").append(`
            <div class="legendcol" style="background-color: ${c}"></div>
            ${ranges[0]} -
                `)
    });
}
