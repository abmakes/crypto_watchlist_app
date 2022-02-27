document.addEventListener("DOMContentLoaded", function() {

  $('#addCoinModal').on('shown.bs.modal', function () {
    $('#addCoin').trigger('focus')
    const coinId = document.getElementById("coinSearch").value

    getCoinInfo(coinId)
  })

  ////// Check if user is logged in

  const user_id = document.getElementById("current-user").dataset.userid;
  if (user_id != "None") {
    document.getElementById("coinSearch").addEventListener("keyup", showOption);
    document.getElementById("addCoin").addEventListener("click", addCoinToDb);
  } 

  sortCoins(0)
  getMarketOverview();
  getLivePrice();
});


///// Get latest Btc price on pageload /////

async function getLivePrice() {
  try {
    let res = await fetch("https://blockchain.info/ticker");
    const btcPrice = document.getElementById("live-price")

    if (!res.ok) {
      throw new Error(`Fetch Error: ${res.status}`);
    }
    let priceData = await res.json();
    // let datetime = new Date();
    // datetime.toDateString()
    btcPrice.innerHTML=`Bitcoin-usd: <span class="text-dark mb-0 h5">$${priceData.USD["15m"]}</span>`
  } catch(e) {
    console.log(e);
  }
}


///// Fetch market overview data on pageload /////

async function getMarketOverview() {
  await fetch(new Request("https://api.livecoinwatch.com/overview"), {
    method: "POST",
    headers: new Headers({
      "content-type": "application/json",
      "x-api-key": "8e75c599-768b-4348-ab3c-9d0754b570fd",
    }),
    body: JSON.stringify({ currency: "USD" }),
  })
  .then(res => res.json())
  .then(data => {
    const mcapElement = document.getElementById("total-mcap");
    const volumeElement = document.getElementById("volume");
    let mcap = data['cap']/1000000000000;
    let volume = data['volume']/1000000000;

    mcapElement.innerHTML = `Total Market Cap: <span class="text-dark mb-0 h5">$${mcap.toFixed(3)} trillion</span>`
    volumeElement.innerHTML = `Daily Volume: <span class="text-dark mb-0 h5">$${volume.toFixed(2)} billion</span>`
  })
  .catch(err => console.log(err));
}

///// Return sorting instrutions for table building function (getData) /////
///// Adjust display of sorting headers /////

async function sortCoins(colId) {
  let watchlist = await getWatchlistCoins(true)

  const colsAll = document.getElementsByClassName("th sortable");
  const col = colsAll[colId]
  const dir = col.dataset.direction;
  const name = col.dataset.name;
  
  for (item of colsAll) {
    item.className = "th sortable";
  }
  
  if (dir == "desc") {
    getData(watchlist, order="asc", column=name)
    col.dataset.direction = "asc"
    col.className = "th sortable text-light"
    let colName =  col.firstChild
    let icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sort-down" viewBox="0 0 16 16"><path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293V2.5zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"></path></svg>'
    col.innerHTML = colName.textContent + icon
  } else {
    if (col.childElementCount > 0) {
      col.removeChild(col.lastChild)
    }

    getData(watchlist, order="desc", column=name)
    col.dataset.direction = "desc"
    col.className = "th sortable text-light"
    let colName =  col.firstChild
    let icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sort-down-alt" viewBox="0 0 16 16"><path d="M3.5 3.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 12.293V3.5zm4 .5a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1h-1zm0 3a.5.5 0 0 1 0-1h3a.5.5 0 0 1 0 1h-3zm0 3a.5.5 0 0 1 0-1h5a.5.5 0 0 1 0 1h-5zM7 12.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0-.5.5z"/></svg>'
    col.innerHTML = colName.textContent + icon
  }
}


///// Add coin to watchlist /////

function addToWatchlist(id) {
  const clickedId = id.slice(3,)
  const userId = document.getElementById("current-user").dataset.userid
  const csrftoken = getCookie('csrftoken');

  fetch(`/watchlist/${userId}/${clickedId}`, {
    method: 'PUT',
    mode: 'same-origin', 
    headers: {'X-CSRFToken': csrftoken},
  })
  .then(res => res.json())
  .then(data => {

    getWatchlistCoins(sort=false);

  })
}


///// Fetch and update list of coins on Coingecko /////

function getCoinInfo(coinId) {
  const coinlist = "https://satstobits.herokuapp.com/coinlist"
  const modalText = document.getElementById("addCoinDataCheck");
  const modalSubmit = document.getElementById("submitCoin");
  modalSubmit.style.display = "block";

  return new Promise((resolve, reject) => 
    {
      const dbCoins = "https://satstobits.herokuapp.com/coins"
      ///// Temporary list with to check for duplicates /////
      let dbCoinList = []
      fetch(dbCoins)
      .then(res => res.json())
      .then(data => {
        data.forEach(dbcoin => {
            dbCoinList.push(dbcoin.name);
        })
        return dbCoinList
      })
      .then(list => {

        if (!list.includes(coinId)) {
          //// if new coin get coinId and add to DB
          fetch(coinlist)
          .then(res => res.json())
          .then(data => {
            const data1 = data[0].coin 
            Object.entries(data1).forEach(coin => {
              if (coin[1] == coinId) {
                return resolve(addCoinToDb(coin[0]));
              }
              else return false;
            })

          })
          .catch(err => console.log(err))
        } else {
          //// if coin in DB retrun warning
          modalText.innerHTML = `<p class="alert alert-warning">${coinId} already exists in the database</p>`;
          modalSubmit.style.display = "none";
          return resolve("duplicate");
        }
      })
      .catch(err => console.log(err)) 
     })    

}


///// ONCLICK //// Fetch new coin data, display in the modal and add to DB on MODAL close ////

function addCoinToDb(coinId) {

const modalSubmit = document.getElementById("submitCoin");
const urlCoin = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}&order=market_cap_desc&per_page=100&page=1`

fetch(urlCoin)
.then(res => res.json())
.then(data => {
  const modalText = document.getElementById("addCoinDataCheck");

  modalText.innerHTML = `
  <p>Token information:</p> 
  <ul>
    <li>Name: ${data[0].name}</li>
    <li>Symbol: ${data[0].symbol}</li>
    <li>Current price: ${data[0].current_price} </li>
    <li>24h high: ${data[0].high_24h}</li>
    <li>24h low: ${data[0].low_24h}</li>
    <li>Price change 24h: ${data[0].price_change_percentage_24h}% </li>
    <li>Market cap: ${data[0].market_cap}</li>   
  </ul>
  <p>Select COMPLETE to add this token to the database.</p>`
  
  modalSubmit.addEventListener("click", () => {
    let form = new FormData();

    form.append("coinId", data[0].id)
    form.append("coinName", data[0].name)
    form.append("currentPrice", data[0].current_price)
    form.append("priceChangePercentage24h", data[0].price_change_percentage_24h)
    form.append("marketCapRank", data[0].market_cap_rank)
    form.append("high24h", data[0].high_24h)
    form.append("low24h", data[0].low_24h)
    form.append("image", data[0].image)  

    const csrftoken = getCookie('csrftoken');
    const urlPost = "https://satstobits.herokuapp.com/watchlist"
    fetch(urlPost, {
      method: 'POST',
      mode: 'same-origin', 
      headers: {'X-CSRFToken': csrftoken},
      body: form
    })
    .then(res => res.text())
    .then(data => {
      if (data == 400) {
        $('#addCoinModal').modal('hide');
      } else {      
        $('#addCoinModal').modal('hide');
        getWatchlistCoins(sort=false);
        modalText.innerHTML = "Token not found..."
      }
    })
    .catch(err => console.log(err))
  });

  modalSubmit.style.display = "block";

})
.catch(err => console.log(err))

}


///// Fetch data and render the coinlist on the site /////

function getData(user_watchlist=[], order="desc", column="rank") {
  const priceList = document.getElementById("price-list")
  const listUpdateTime = document.getElementById("last-updated")
  const userId = document.getElementById("current-user").dataset.userid
  const currentUrl = document.URL
  let coinsUrl = ""
  const watchlist = user_watchlist
  priceList.innerHTML = ""

  ///// check current page to filter coins
  if (currentUrl == "https://satstobits.herokuapp.com/") {
    coinsUrl = "https://satstobits.herokuapp.com/coins";
  } else {
    coinsUrl = `https://satstobits.herokuapp.com/watchlist/${userId}`;
  }

  fetch(coinsUrl)
  .then(res => res.json())
  .then(data => {

    ///// Create new array of formated data and watchlist info
    const coinData = data.map(token => {
      ////// format numbers and check watchlist for coin
      token["currentPrice"] = Number(formatNumbers(token.currentPrice));
      token["high24h"] = Number(formatNumbers(token.high24h));
      token["low24h"] = Number(formatNumbers(token.low24h));
      token["percChange24h"] = Number(token.percChange24h).toFixed(2);
            
      if (watchlist.includes(token.coinId)) {
        token["watchlisted"] = true;
      } else {
        token["watchlisted"] = false;
      }
      return token
    })
    
    ///// sort data as per column, tirgger by click /////
    if (column == "percChange24h") {
      //// sort negative numbers
      if (order == "desc") {
          coinData.sort((a,b) => a[column] - b[column])
        } else {
          coinData.sort((a,b) => b[column] - a[column])
        }
    } else {
      //// sort strings and positive numbers
      if (order == "desc") {
        coinData.sort((a,b) => a[column] > b[column] ? 1 : -1)
      } else {
        coinData.sort((a,b) => a[column] < b[column] ? 1 : -1)
      }
    }
    
    ///// list time of last update
    const updateTime = new Date (data[0]["lastUpdate"])
    listUpdateTime.innerHTML = `Last database update: ${updateTime.toString().substring(16,)}`


    /////// create elements to be displayed in table ////////
    coinData.forEach(coin => {

      let rangePosition = (coin.currentPrice - coin.low24h) / (coin.high24h - coin.low24h) *100
      coinPrice = document.createElement('tr');
      coinPrice.id = coin.coinId;

      ///// Conditional formatting for table items
      let buttonColor = "btn-outline-success";
      if (coin.watchlisted) {
        buttonColor = "btn-success";
      }

      let colour = "text-success";
      if (coin.percChange24h < 0) {
        colour = "text-warning"
      }

      let btnDisplay = "d-none";
      if (userId !== "None") {
        btnDisplay = "align-middle"
      }

      let chartBtnDisplay = "d-none";
      if (window.location.toString().includes("watchlist")) {
        chartBtnDisplay = "align-middle"
      }

      coinPrice.innerHTML = `
          <td class="align-middle">${coin.rank}</td>
          <td class="align-middle"><img class="mr-1 mb-0" style="width: 16px; height: 16px;" alt="" src="${coin.image} align-middle">  ${coin.name}</td>
          <td class="${colour} align-middle">${coin.currentPrice}</td>
          <td class="${colour} align-middle text-center">${coin.percChange24h}%</td>
          <td class="${colour} align-middle">${coin.high24h}</td>
          <td class="${colour} align-middle">${coin.low24h}</td>
          <td class="align-middle"><div class="progress"><div class="progress-bar progress-bar-striped bg-success" role="progressbar" style="width: ${rangePosition}%;" aria-valuenow="${rangePosition}" aria-valuemin="0" aria-valuemax="100"></div></div></td>
          <td class="${btnDisplay}">
            <button type="button" class="btn btn-sm ${buttonColor}" onclick="addToWatchlist(this.id)" id="wl-${coin.coinId}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star" viewBox="0 2 16 16">
                <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z"/></path>
                </svg>
            </button>
          </td>
          <td class="${chartBtnDisplay}">
            <button class="btn btn-sm btn-light showChart" data-toggle="modal" data-target="#chartModal" data-id="ct-${coin.coinId}">Show Chart</button>
          </td>
          `;
      
      priceList.appendChild(coinPrice)
    })
  })
  .catch(err => console.log(err)) 
}

///// Load coindata stored in PostGres into display table form API endpoint /////

function getWatchlistCoins(sort=false) {

  const userId = document.getElementById("current-user").dataset.userid
  if (userId != "None") {
    let watchlist = `https://satstobits.herokuapp.com/watchlist/${userId}`

    return new Promise((resolve, reject) => 
    {
      //////// Temporary list with user WATCHLIST for checking if a coin is on the watchlist //////////////
      let user_watchlist = []
      fetch(watchlist)
      .then(res => res.json())
      .then(data => {
        data.forEach(wcoin => {
            user_watchlist.push(wcoin.coinId);
        })
        return user_watchlist
      })
      .then(uw => {
        if (sort == true) {
          // console.log(uw)
          resolve(uw);
        } else if (sort == false) {
          // console.log(uw)
          getData(uw);
        } else {
          reject(Error("It broke"))
        }
      })
      .catch(err => console.log(err)) 
      })

  } else {
    let emptyWatchlist = []
    return Promise.resolve(emptyWatchlist)
  }
} 

///// Live search text display /////

function showOption(e) {
  const searchTerm = e.target.value;
  showSearch(searchTerm.toLowerCase())
}


function showSearch(searched) {
  const coinlist = "https://satstobits.herokuapp.com/coinlist"
  coinMenu = document.getElementById("results");
  const search = searched;
  // console.log(search);
  
  const resultList = {}
  coinMenu.innerHTML = ""


  fetch(coinlist)
  .then(res => res.json())
  .then(data => {
    const data1 = data[0].coin
    const typed = search

    Object.entries(data1).forEach(coin => {
      if (coin[0].toLowerCase().includes(typed) || coin[1].toLowerCase().includes(typed)) {
        resultList[coin[0]] = coin[1];
      }
    })

    Object.entries(resultList).forEach(res => {
      coinOption = document.createElement('option');
      coinOption.setAttribute('data-value', res[0]);
      coinOption.innerHTML = res[1];
      coinMenu.appendChild(coinOption);
    })

  })  
}

///// Get the CSRF token from the page cookies /////

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

///// Format numbers into more display friendly format

function formatNumbers(value) {
  if (Number(value) > 0.1) {
    return Number(value).toFixed(2);
  } else {
    return Number(value).toFixed(7);  
  }
}

