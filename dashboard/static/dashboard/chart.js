document.addEventListener("DOMContentLoaded", () => {

  ///// Timeout after window resize to not spam API
  $(window).resize(function() {
    if(this.resizeTO) clearTimeout(this.resizeTO);
    this.resizeTO = setTimeout(function() {
        $(this).trigger('resizeEnd');
    }, 500);
  });

  let orderedData = []

  ///// Chart modals that fetches data based on coin clicked
  $('#chartModal').on('shown.bs.modal', function (e) {
    $('#showChart').trigger('focus')

    let chartCoinId = $(e.relatedTarget).data('id').slice(3,)
    let titleModal = document.getElementById("chart-coin-title")
    titleModal.innerHTML = `Chart: ${chartCoinId}`
    let url = `https://api.coingecko.com/api/v3/coins/${chartCoinId}/market_chart?vs_currency=usd&days=7&interval=4`;    

    setTimeout(() => fetchRetry(url, 2), 200)
  })

  $('#chartModal').on('hidden.bs.modal', function () {
    document.getElementById("chartDivModal").innerHTML = ""
  });

  const fetchRetry = (address, retries) => fetch(address)
  .then(res => {

    /// Retry API if chart data doesnt load
    if (res.ok) {
      return res.json();
    }
    if (retries > 0) {
      return setTimeout(() => fetchRetry(address, retries - 1), 7300)
    }
    throw new Error(res.status)
  })
  .then(data => {
    
    orderedData = []
    ///// Reformat data indo desired display format 
    data["prices"].forEach(price => {
      let item = []
      let options = {month: 'short', day: 'numeric'};
      let date = new Date(price[0]).toLocaleDateString("en-GB", options);
      item.push(date, price[1]); 
      orderedData.push(item);
    });

    // Load the Visualization API and the piechart package.
    google.charts.load('current', {'packages':['corechart']});
    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawChart);
  })
  .catch(error => console.log(error));

  ///// Change what chart displays based on page.
  if (window.location.toString().includes("watchlist")) {
    console.log("no chart");
  } else { 
    let url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=4`
    fetchRetry(url, 2)
  }

  function drawChart() {
    var data = google.visualization.arrayToDataTable(orderedData, true);

    //// Display setting for chart
    var options = {
      legend:'none',
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

    //// Where to draw the chart based on page
    if (window.location.toString().includes("watchlist")) {
      var chart = new google.visualization.LineChart(document.getElementById('chartDivModal'))
    } else {
      var chart = new google.visualization.LineChart(document.getElementById('chartDiv'));
    }

    chart.draw(data, options);
    // orderedData = []

    //redraw graph when window resize is completed  
    $(window).on('resizeEnd', function() {
    var data = google.visualization.arrayToDataTable(orderedData, true);
    drawChart(data, options);
    });
  }

})

