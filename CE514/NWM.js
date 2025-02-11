async function getForecast() {
  const reachId = document.getElementById('reachIdInput').value;
  const forecastType = document.getElementById('forecastTypeSelect').value;
  if (!reachId) {
    alert("Please enter a Reach ID.");
    return;
  }

  const forecastContainer = document.getElementById('forecast-container');
  forecastContainer.style.display = 'block';

  try {
    const apiUrl = `https://api.water.noaa.gov/nwps/v1/reaches/${reachId}/streamflow?series=${forecastType}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status} - ${response.statusText}`);
    }

    const json_data = await response.json();
    let streamflowData = [];

    switch (forecastType) {
      case 'short_range':
        if (json_data.shortRange && json_data.shortRange.series && json_data.shortRange.series.data) {
          streamflowData = json_data.shortRange.series.data;
        }
        break;
      case 'medium_range':
        if (json_data.mediumRange) {
          for (const prop in json_data.mediumRange) {
            if (json_data.mediumRange[prop].data) {
              streamflowData = streamflowData.concat(json_data.mediumRange[prop].data);
            }
          }
        }
        break;
      case 'long_range':
        if (json_data.longRange) {
          for (const prop in json_data.longRange) {
            if (json_data.longRange[prop].data) {
              streamflowData = streamflowData.concat(json_data.longRange[prop].data);
            }
          }
        }
        break;
      default:
        throw new Error("Invalid forecast type selected.");
    }

    if (streamflowData.length === 0) {
      throw new Error(`No ${forecastType.replace('_', ' ')} forecast data available for this Reach ID.`);
    }

    const timestamps = streamflowData.map(item => item.validTime);
    const flowValues = streamflowData.map(item => item.flow);

    // Update the table
    const table = document.getElementById('timeseries-datatable').getElementsByTagName('tbody')[0];
    table.innerHTML = "";

    for (let i = 0; i < streamflowData.length; i++) {
      const row = table.insertRow();
      const timestampCell = row.insertCell();
      const flowCell = row.insertCell();
      timestampCell.textContent = timestamps[i];
      flowCell.textContent = flowValues[i];
    }

    // Update or create the chart
    const ctx = document.getElementById('streamflowChart').getContext('2d');
    let chart = Chart.getChart('streamflowChart');

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [{
          label: `Streamflow Forecast (${forecastType.replace('_', ' ').toUpperCase()})`,
          data: flowValues,
          borderColor: 'blue',
          borderWidth: 1,
          fill: false
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Streamflow'
            }
          }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching or processing data:', error);
    alert("Error fetching forecast: " + error.message);

    const table = document.getElementById('timeseries-datatable').getElementsByTagName('tbody')[0];
    table.innerHTML = "";

    const chartCanvas = document.getElementById('streamflowChart');
    chartCanvas.innerHTML = "";

  }
}
