        // Event listener for the form submission
        document.getElementById('reach-id-form').addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the form from submitting normally
            const reachId = document.getElementById('reach-id').value;
            fetchForecastData(reachId);
        });

        // Fetch forecast data for the given reach ID
        function fetchForecastData(reachId) {
            // Replace this URL with the actual API URL from the National Water Model (NWM)
            const url = `https://api.weather.gov/points/${reachId}/forecast`; // Example URL; replace with the NWM API

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    const forecastData = data.properties.periods; // Assuming this is the structure of the response
                    displayForecastData(forecastData);
                    drawForecastPlot(forecastData);
                })
                .catch(error => {
                    console.error('Error fetching forecast data:', error);
                    alert('Failed to fetch forecast data for the given Reach ID.');
                });
        }

        // Display forecast data in a table
        function displayForecastData(forecastData) {
            const tableBody = document.querySelector('#forecast-table tbody');
            tableBody.innerHTML = ''; // Clear any previous data

            forecastData.forEach(period => {
                const row = document.createElement('tr');
                const timeCell = document.createElement('td');
                const valueCell = document.createElement('td');

                timeCell.textContent = period.startTime; // Assuming 'startTime' contains the time
                valueCell.textContent = period.value; // Assuming 'value' contains the forecast value

                row.appendChild(timeCell);
                row.appendChild(valueCell);
                tableBody.appendChild(row);
            });

            // Show the table
            document.getElementById('forecast-table').style.display = 'table';
        }

        // Draw forecast plot using Chart.js
        function drawForecastPlot(forecastData) {
            const times = forecastData.map(period => period.startTime); // Time values
            const values = forecastData.map(period => period.value); // Forecast values

            const ctx = document.getElementById('forecast-plot').getContext('2d');
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: times,
                    datasets: [{
                        label: 'Forecast',
                        data: values,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'hour'
                            },
                            title: {
                                display: true,
                                text: 'Time'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Forecast Value'
                            }
                        }
                    }
                }
            });

            // Show the plot
            document.getElementById('forecast-plot').style.display = 'block';
        }
