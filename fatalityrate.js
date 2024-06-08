var w = 600;
var h = 600;
var color = d3.scaleOrdinal(['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f']);
var datasets;

//create pie chart
function plot() {
    let countries = [];
    $(".checkboxes:checked").each(function () {
        countries.push($(this).val());
    })
    console.log(countries)
    let data = datasets.filter(d => countries.includes(d["country"]));
    var outerRadius = w / 2;
    var innerRadius = 0;
    var arc = d3.arc()
        .outerRadius(outerRadius)
        .innerRadius(innerRadius);
    var pie = d3.pie()
        .value(d => (d.fatality_rate * 100).toFixed(2));
    var svg = d3.select("#chart3")
        .attr("width", w)
        .attr("height", h);
    svg.selectAll("*").remove()
    svg.empty();
    var arcs = svg.selectAll("g.arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", `translate(${outerRadius},${outerRadius})`);
    let maps = [];
    arcs.append("path")
        .attr("fill", function (d, i) {
            d.data.color = color(i);
            maps.push(d.data);
            return color(i);
        })
        .attr("country", d=>{
            return d.data.country;
        })
        .attr("d", function (d, i) {
            return arc(d, i);
        })
    //% value for pie chart
    arcs.append("text")
        .text(function (d) {
            return `${d.value}%`;
        })
        .attr("transform", function (d) {
            let center = arc.centroid(d);
            //use Power scale to spread fatality rate % text outward when the pie slices gets compacted at the end
            let scale = d3.scalePow()
                    .domain([1, 2])
                    .range([1, 1.75])
                    .exponent(50);
            let rotate = (d.startAngle+((d.startAngle - d.endAngle)/2)) / (Math.PI * 2 ) + 1;
            return `translate(${center[0]*(scale(rotate))+outerRadius}, ${center[1]*(scale(rotate))+outerRadius})`;
        })
    //when mouse move show tooltip
    arcs.on('mousemove', (e) => {
        let tt = $("#tooltip2");
        tt.tooltip('show');
        tt.css({ position: "absolute", transform: "none",
            top: e.pageY - 5,
            left: e.pageX - 5 });
        let txt = $(e.target).attr("country");
        if (tt.attr("data-bs-original-title") != txt) {
            tt.attr("data-bs-original-title", txt);
        }
    })
        .on('mouseleave', function (e) {
            let tt = $("#tooltip2");
            tt.tooltip('hide')
            tt.css({ position: "absolute", transform: "none",
                top: e.pageY - 5,
                left: e.pageX - 5 });
        })
    //remove and reappend to bring the texts forward
    $('g.arc > text').remove().appendTo('svg');
    makeLegends(maps)
}
//create legends
function makeLegends(maps) {
    let legends = $("#countrylegends");
    legends.empty();
    maps.forEach(d => {
        legends.append(`
        <div class="legendcol" style="background-color: ${d.color}"></div>
        ${d.country}
    `)
    })
}
//create checkboxes
function makeCheckBoxes() {
    //gather unique countries from dataset
    let unique_values = datasets
        .map((d) => d.country)
        .filter(
            (value, index, current_value) => current_value.indexOf(value) === index
        );
    let legends = $("#countrycheckboxes");
    //loop through unique countries and add checkbox accordingly 
    unique_values.forEach((country, i) => {
        legends.append(`
    <div>
        <input class="form-check-input checkboxes" type="checkbox" value="${country}" ${i < color.range().length ? "checked" : ""}>
        <label class="form-check-label">
        ${country}
        </label>
    </div>
    `)
    })
    updateBoxes()
}
//check for number of checked boxes and disable the rest
function updateBoxes() {
    if ($('.checkboxes:checked').length >= color.range().length) {
        $(".checkboxes:not(:checked)").attr("disabled", true);
    } else {
        $(".checkboxes:not(:checked)").attr("disabled", false);
    }
}
//entry point
function init() {
    $("#countrycheckboxes").on("change", e => {
        updateBoxes();
        plot();
    })
    $("#checkboxmessage").text(`Select Up to ${color.range().length} Countries`)
    d3.json("covid_fatality_rate.json").then(function (data) {
        datasets = data;
        makeCheckBoxes();
        plot();

    })
}