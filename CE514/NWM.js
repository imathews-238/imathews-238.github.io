async function getForecast() {
  const reachId = document.getElementById('reachIdInput').value;
  const forecastType = document.getElementById('forecastTypeSelect').value; // Get the selected forecast type

  if (!reachId) {
    alert("Please enter a Reach ID.");
    return;
  }

  const forecastContainer = document.getElementById('forecast-container');
  forecastContainer.style.display = 'block';

  try {
    const apiUrl = `https://api.water.noaa.gov/nwps/v1/reaches/${reachId}/streamflow?series=${forecastType}`;
    console.log("Fetching data from:", apiUrl);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status} - ${response.statusText}`);
    }

    const json_data = await response.json();
    console.log("API Response:", json_data);

    if (!json_data[forecastType] || !json_data[forecastType].series || !json_data[forecastType].series.data || json_data[forecastType].series.data.length === 0) {
      throw new Error("No forecast data available for this Reach ID and forecast type.");
    }

    const streamflowData = json_data[forecastType].series.data;
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
          label: `Streamflow Forecast (${forecastType.replace('_', ' ')})`,
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
              text: 'Streamflow (cfs)'
            }
          }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching or processing data:', error);
    alert("Error fetching forecast: " + error.message);

    // Clear the table and chart on error
    document.getElementById('timeseries-datatable').getElementsByTagName('tbody')[0].innerHTML = "";

    let chart = Chart.getChart('streamflowChart');
    if (chart) {
      chart.destroy();
    }
  }
}
