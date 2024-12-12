// add your JavaScript/D3 to this file
// Function to dynamically display the correct image and bar chart
document.addEventListener('DOMContentLoaded', () => {
  console.log(data); // Ensure the `data` variable is accessible
  
function showImage(borough) {
  // Update the image
  const imageContainer = document.getElementById('image-container');
  imageContainer.innerHTML = `<img src="../images/arrest_locations_${borough}.png" alt="${borough} Crime Distribution">`;

  // Render the bar chart
  renderBarChart(borough);
}

function renderBarChart(boroughName) {
  const boroughMapping = {
    "Brooklyn": "B",
    "Manhattan": "M",
    "Bronx": "X",
    "Queens": "Q",
    "Staten Island": "S"
  };

  let boroughData;

  if (boroughName === "NYC") {
    // Use the entire dataset for "NYC"
    boroughData = data;
  } else {
    const borough = boroughMapping[boroughName];

    if (!borough) {
      console.error(`No abbreviation found for borough: ${boroughName}`);
      return;
    }

    boroughData = data.find(d => d.ARREST_BORO === borough);

    if (!boroughData) {
      console.error(`No data found for borough: ${boroughName}`);
      return;
    }
  }

  const crimes = boroughName === "NYC"
    ? boroughData.flatMap(d => d.crimes) // Flatten crimes for all boroughs
    : boroughData.crimes;

  // Process crimes data
  const aggregatedData = crimes.reduce((acc, crime) => {
    const crimeType = crime.OFNS_DESC[0];
    const count = crime.count[0];

    if (!acc[crimeType]) {
      acc[crimeType] = 0;
    }

    acc[crimeType] += count;

    return acc;
  }, {});

  // Convert aggregated data into an array for sorting and visualization
  const processedData = Object.entries(aggregatedData)
    .map(([OFNS_DESC, count]) => ({ OFNS_DESC, count }))
    .sort((a, b) => b.count - a.count);

  const topCrimes = processedData.slice(0, 10);
  const finalData = [...topCrimes];

  // D3 visualization
  const chartContainer = d3.select("#chart-container");
  chartContainer.selectAll("*").remove();

  const width = 500;
  const height = 450;
  const margin = { top: 50, right: 50, bottom: 100, left: 50 };

  const svg = chartContainer
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const xScale = d3.scaleBand()
    .domain(finalData.map(d => d.OFNS_DESC))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(finalData, d => d.count)])
    .range([height - margin.bottom, margin.top]);

  // Create a tooltip div
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "lightgray")
    .style("border", "1px solid black")
    .style("border-radius", "4px")
    .style("padding", "8px")
    .style("opacity", 0)
    .style("pointer-events", "none"); // Prevent tooltip from blocking events

  // Draw bars
  svg.selectAll(".bar")
    .data(finalData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.OFNS_DESC))
    .attr("y", d => yScale(d.count))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - margin.bottom - yScale(d.count))
    .attr("fill", "steelblue")
    .style("pointer-events", "all") // Ensure bars are fully interactive
    .on("mouseover", function (event, d) {
      d3.select(this).raise(); // Bring the bar to the front
      tooltip
        .style("opacity", 1)
        .html(`Crime: ${d.OFNS_DESC}<br>Count: ${d.count}`);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`);
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", "10px");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("font-size", "10px");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text(`Top 10 Crime Categories in ${boroughName}`);
}

// Initialize with NYC overview
window.onload = () => showImage('NYC');
