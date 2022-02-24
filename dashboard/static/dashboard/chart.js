document.addEventListener("DOMContentLoaded", () => {
  ///// gstatic === low, open, close, high
  ///// Coingecko [1594382400000 (time), 1.1 (open), 2.2 (high), 3.3 (low), 4.4 (close)] /////

  ///// Timeout after window resize to not spam API
  $(window).resize(function() {
    if(this.resizeTO) clearTimeout(this.resizeTO);
    this.resizeTO = setTimeout(function() {
        $(this).trigger('resizeEnd');
    }, 500);
  });

  const url = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=4"

  const orderedData = []

  const fetchRetry = (address, retries) => fetch(address)
  .then(res => {
    /// Retry API if chart data doesnt load
    if (res.ok) {
      // Load the Visualization API and the piechart package.
      google.charts.load('current', {'packages':['corechart']});
      // Set a callback to run when the Google Visualization API is loaded.
      google.charts.setOnLoadCallback(drawChart);
      return res.json();
    }
    if (retries > 0) {
      return setTimeout(() => fetchRetry(address, retries - 1), 7300)
    }
    throw new Error(res.status)
  })
  .then(data => {
    ///// Reformat data indo desired display format 
    data["prices"].forEach(price => {
      let item = []
      let options = {month: 'short', day: 'numeric'};
      let date = new Date(price[0]).toLocaleDateString("en-GB", options);
      item.push(date, price[1]); 
      orderedData.push(item);
    });
    window.localStorage.setItem("chartData", orderedData)

  })
  .catch(error => console.log(error));

  fetchRetry(url, 2)

  function drawChart() {
    var data = google.visualization.arrayToDataTable(orderedData, true);

    var options = {
      legend:'none',
      // enableInteractivity: false,
      seriesType: 'line',
      colors: ['#fdf6e3'],
      chartArea:{left:50, right:20, width:'100%', height:'70%'},
      backgroundColor: "#002b36",
      hAxis: {
        gridlines: {color: '#073642', minSpacing: 100},
        textStyle: {color: '#2aa198'},
        showTextEvery: 24,
      },
      vAxis: {
        gridlines: {color: '#073642', minSpacing: 50},
        textStyle: {color: '2aa198'},
      },
    };

    var chart = new google.visualization.LineChart(document.getElementById('chartDiv'));

    chart.draw(data, options);

    //redraw graph when window resize is completed  
    $(window).on('resizeEnd', function() {
    drawChart(data, options);
    });
  }
})

