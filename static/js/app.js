function buildMetadata(sample) {
  // function that builds the metadata panel
  // Use `d3.json` to fetch the metadata for a sample
  var url = `/metadata/${sample}`;
  d3.json(url).then(function(sample){

    // Use d3 to select the panel with id of `#sample-metadata`
    var sample_metadata = d3.select("#sample-metadata");

    // Clear any existing metadata
    sample_metadata.html("");

    // Add each key and value pair to the panel
    Object.entries(sample).forEach(function ([key, value]) {
      var row = sample_metadata.append("p");
      row.text(`${key}: ${value}`);
    });
  });
}

function buildCharts(sample) {

  // Use `d3.json` to fetch the sample data for the plots

   
    var url = "/samples/" + sample;
  d3.json(url).then(function(response) {
    console.log(response);
    var filtered_values = [];
    var filtered_otu_ids = [];
    var filtered_otu_labels = [];
    var len = response.sample_values.length;
    var indices = new Array(len);
    for (var i = 0; i < len; i++) {
      indices[i] = i;
      indices.sort(function (a, b) { return response.sample_values[a] < response.sample_values[b] ? 1 : response.sample_values[a] > response.sample_values[b] ? -1 : 0; });
    }    
    for (var i =0; i<10; i++){
      var j = indices[i];
      filtered_values.push(response.sample_values[j]);
      filtered_otu_ids.push(response.otu_ids[j]);
      filtered_otu_labels.push(response.otu_labels[j]);
    }

// Build a Pie Chart
    var pie_layout = {
      annotations: [
        {
          font: {
            size: 15
          },
          showarrow: false,
          text: "Top 10 Samples",
          x: 0.3,
          y: 0.5
        }
      ],
      height: 500,
      width: 500
    };
    var draw_pie = [{
      type: "pie",
      values: filtered_values,
      labels: filtered_otu_ids.map(String),
      text: filtered_otu_labels,
      hole: .4,
      textinfo: 'percent'
    }];

    var pie_chart = document.getElementById('pie');
    Plotly.newPlot(pie_chart, draw_pie , pie_layout);

    var draw_bubble = [{
      x: response.otu_ids,
      y: response.sample_values,
      text: response.otu_labels,
      mode: 'markers',
      type: 'scatter',
      marker: {
        color:response.otu_ids,
        size: response.sample_values,
        colorscale: "Rainbow"
      }
    }];

// Build a Bubble Chart using the sample data  
    var bubble_layout = {
      title: 'Bubble Chart by Sample',
      showlegend: false,
      height: 600,
      width: 1400
    };
    console.log(draw_bubble);
    Plotly.newPlot('bubble', draw_bubble, bubble_layout);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
