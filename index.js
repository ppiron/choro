const geoGenerator = d3.geoPath()

const p1 = fetch('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json')
.then(
  function(data) {
    return data.json()
  })

const p2 = fetch('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json')
.then(
  function(data) {
    return data.json()
  })

Promise.all([p1, p2])
.then(function(values) {
  update(values)
})

function update(values) {

  const states = topojson.feature(values[0], values[0].objects.states)
  const counties = topojson.feature(values[0], values[0].objects.counties)
  const countiesData = values[1].map(function(el) {
    return el['bachelorsOrHigher']
  })
  const nbands = 8
  const bandwidth = (d3.max(countiesData) - d3.min(countiesData)) / nbands

  const cScale = d3.scaleOrdinal(d3.schemeGreens[nbands])
    .domain(d3.range(1, nbands + 1))
      
  const w = d3.select('#content g.counties')
    .selectAll('path')
    .data(counties.features);
  
  w.enter()
    .append('path')
    .attr('d', geoGenerator)
    .attr('fill', function(d) {
      const county = values[1].filter(function(data) {
        return data.fips === d.id
      })[0]
      return cScale(
        Math.ceil(
            county['bachelorsOrHigher'] / bandwidth
          )
        )
    })
    .on('mouseover', showtooltip)
    .on('mouseout', hidetooltip)

  const v = d3.select('#content g.states').raise()
    .selectAll('path')
    .data(states.features);

  v.enter()
    .append('path')
    .attr('d', geoGenerator)
  
  //LEGEND
  const l = d3.select('#content g.legend')    
  
  l
    .attr('transform', `translate(620, 50)`)
    .selectAll('rect')
    .data(d3.range(1, nbands + 1))
    .enter()
    .append('rect')
    .attr('width', 30)
    .attr('height', 10)
    .attr('x', (d, i) => i * 30)
    .attr('fill', (d, i) => cScale(i + 1))
  
  const legendScale = d3.scaleLinear()
    .domain([d3.min(countiesData) / 100, d3.max(countiesData) /100])
    .range([0, nbands * 30])

  const legendAxis = d3.axisBottom()
    .scale(legendScale)
    .tickValues(d3.range(d3.min(countiesData), d3.max(countiesData) + bandwidth, bandwidth)
    .slice(0, -1).map(x => x / 100))
    .tickFormat(d3.format(".0%"))
  l
    .append('g')
    .attr('transform', `translate(0, 10)`)
    .attr('class', 'legendAxis')
    .call(legendAxis)
  
  const sv = document.getElementsByTagName('svg')[0]
  let top = sv.getBoundingClientRect()['top']
  window.addEventListener('resize', function() {
    top = sv.getBoundingClientRect()['top'] + Math.round(window.scrollY)
  }) 
    
  function showtooltip(d) {
    const x = parseFloat(geoGenerator.bounds(d)[1][0]);
    const y = parseFloat(geoGenerator.centroid(d)[1]) + top - 10;
    const county = values[1].filter(function(data) {
      return data.fips === d.id
    })[0]
    
    d3.select('#tooltip')
      .style('left', x + 'px')
      .style('top', y + 'px')
      .classed('hidden', false)
      .select('#county')
      .text(county['area_name'])

    d3.select('#state')
      .text(county['state'])

    d3.select('#value')
      .text(county['bachelorsOrHigher'])
  }
  
  function hidetooltip(d) {
    d3.select('#tooltip')
      .classed('hidden', true)
  }
}
  
