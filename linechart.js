var w = 1000;
var h = 800;
var padding = 55;
var vac_date = new Date();
var datasets;
let svg = d3.select("#chart2")
    .attr("width", w)
    .attr("height", h);
//craft linechart
function lineChart(dataset) {
    let vaccs = dataset.filter(d => d.vaccination != 0);
    let cases = dataset.filter(d => d.case != 0);
    let deaths = dataset.filter(d => d.value != 0);
    let xScale = d3.scaleTime()
        .domain([
            d3.min(dataset, d => d.date),
            d3.max(dataset, d => d.date)
        ])
        .range([padding, w - padding])
    console.log(xScale.domain())
    //use log scale
    let yScale = d3.scaleLog()
        .domain([1, d3.max(dataset, d => Math.max(...[d.case, d.value, d.vaccination]))])
        .range([h - padding, padding])
    let xAxis = d3.axisBottom()
        .ticks(dataset.length)
        .scale(xScale)
        .tickFormat((date) => date.getMonth() == 0 ? date.getUTCFullYear() + 1 : "");
    let yAxis = d3.axisLeft()
        .ticks(10)
        .scale(yScale);
    svg.selectAll("*").remove()
    svg.empty();
    svg.append("g")
        .attr("transform", `translate(20, ${h / 2 + 30}) rotate(-90)`)
        .append("text")
        .text("Number of Incidents (Log Scaled)")
    svg.append("g")
        .attr("transform", `translate(0, ${h - padding})`)
        .call(xAxis);
    svg.append("g")
        .attr("transform", `translate(${padding}, 0)`)
        .call(yAxis);

    let line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
    let line2 = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.case))
    let line3 = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.vaccination))
    svg.append("path")
        .datum(vaccs)
        .attr("class", "line3")
        .attr("d", line3);
    svg.append("path")
        .datum(cases)
        .attr("class", "line2")
        .attr("d", line2);

    svg.append("path")
        .datum(deaths)
        .attr("class", "line")
        .attr("d", line);


    //create chart
    let area = d3.area()
        .x(d => xScale(d.date))
        .y0(() => yScale.range()[0])
        .y1(d => yScale(d.value))
    let area2 = d3.area()
        .x(d => xScale(d.date))
        .y0(() => yScale.range()[0])
        .y1(d => yScale(d.case))
    let area3 = d3.area()
        .x(d => xScale(d.date))
        .y0(() => yScale.range()[0])
        .y1(d => yScale(d.vaccination))

    svg.append("path")
        .attr("class", "linearea")
        .attr("d", area3(vaccs))
        .attr("fill", "green")
        .attr("fill-opacity", "0.3")
        .attr("stroke", "green")
        .attr("id", "vac_area");
    svg.append("path")
        .attr("class", "linearea")
        .attr("d", area2(cases))
        .attr("fill", "yellow")
        .attr("fill-opacity", "0.3")
        .attr("stroke", "yellow")
        .attr("id", "case_area");
    svg.append("path")
        .attr("class", "linearea")
        .attr("d", area(deaths))
        .attr("fill", "red")
        .attr("fill-opacity", "0.3")
        .attr("stroke", "red")
        .attr("id", "death_area");
    //Line chart mouse over 
    var hoverLineGroup = svg.append("g")
        .attr("class", "hover-line");

    var hoverLine = hoverLineGroup
        .append("line")
        .attr("stroke", "#000")
        .attr("x1", 0).attr("x2", 0)
        .attr("y1", 0).attr("y2", h);
    

    //groupings for each category data
    let hoverCase = hoverLineGroup.append("g")
    let hoverVac = hoverLineGroup.append("g")
    let hoverDeath = hoverLineGroup.append("g")
    
    //small circle for tooltip
    hoverCase.append("circle")
        .attr("r", 4.5)
        .attr("id", "cir_case");
    hoverVac.append("circle")
        .attr("r", 4.5)
        .attr("id", "cir_vac");
    hoverDeath.append("circle")
        .attr("r", 4.5)
        .attr("id", "cir_death");
    
    //text for tooltip
    let t_case = hoverCase.append('text')
        .attr('dy', "0.35em")
        .attr('dx', "0.35em");
    let t_vac = hoverVac.append('text')
        .attr('dy', "0.35em")
        .attr('dx', "0.35em");
    let t_death = hoverDeath.append('text')
        .attr('dy', "0.35em")
        .attr('dx', "0.35em");

    hoverLineGroup.style("opacity", 1e-6);
    function hoverMouseOn(d) {
        let mouse_x = d.pageX;
        let mouse_y = d.pageY;
        let rel_x = mouse_x - $("#chart2").offset().left - 3;
        let rel_y = mouse_y - $("#chart2").offset().top;
        let bisect = d3.bisector(d => d.date).right;
        let xdate = xScale.invert(rel_x);

        //check if the circle in the tooltip should be displayed
        function checkValid(datas) {
            let data = datas[bisect(datas, xdate)];
            if (data != undefined && xdate >= d3.min(datas, d=>d.date) && xdate <= d3.max(datas, d=>d.date)){
                return data;
            } else {
                return false;
            }
        };
        let case_val = checkValid(cases)
        if (case_val) {
            case_val = case_val.case;
            t_case.text(case_val);
            hoverCase.attr("transform", `translate(0, ${yScale(case_val)})`);
            hoverCase.style("opacity", 1);
        } else {
            hoverCase.style("opacity", 1e-6);
        }

        let vac_val = checkValid(vaccs);
        if (vac_val) {
            vac_val = vac_val.vaccination;
            t_vac.text(vac_val);
            hoverVac.attr("transform", `translate(0, ${yScale(vac_val)})`);
            hoverVac.style("opacity", 1);
        } else {
            hoverVac.style("opacity", 1e-6);
        }


        let death_val = checkValid(deaths);
        if (death_val) {
            death_val = death_val.value;
            t_death.text(death_val);
            hoverDeath.attr("transform", `translate(0, ${yScale(death_val)})`);
            hoverDeath.style("opacity", 1);
        } else {
            hoverDeath.style("opacity", 1e-6);
        }
        hoverLineGroup.attr("transform", `translate(${rel_x},0)`)
        hoverLineGroup.style("opacity", 1);
    }
    function hoverMouseOff() {
        hoverLineGroup.style("opacity", 1e-6);
    };
    $(".linearea").on({
        mousemove: hoverMouseOn,
        mouseleave: hoverMouseOff
    })
}
//update chart
function updateChart(country) {
    lineChart(datasets.filter(d => d.country == country));
    console.log(datasets.filter(d => d.country == country));
}
function init() {
    //load the data
    d3.json("covid_death_case_vac2.json").then(function (data) {
        data = data.map(d => { d.date = new Date(+d.year, +d.month - 1); return d; })
        datasets = data;
        console.log(datasets);
        //grab all unique country in the daata
        let unique_values = datasets
            .map((d) => d.country)
            .filter(
                (value, index, current_value) => current_value.indexOf(value) === index
            );
        let btns = $("#countrybtns");
        console.log(unique_values)
        //look and append radio for each country
        unique_values.forEach(country => {
            btns.append(`
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="exampleRadios" onclick=updateChart(this.value) value="${country}">
                    <label class="form-check-label">
                    ${country}
                    </label>
                </div>
                `)
        })
        $("#countrybtns > div > input")[0].click();
    })
}