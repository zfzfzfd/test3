setInterval(function() {
    fetch('/get-latest-data')
        .then(response => response.json())
        .then(data => {
            document.getElementById('heartSensor').innerText = data.heartSensor;
        })
        .catch(error => console.error('Error fetching data:', error));
}, 5000);