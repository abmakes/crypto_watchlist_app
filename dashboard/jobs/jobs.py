import requests
from django.utils import timezone
from django.conf import settings
from dashboard.models import BtcPrice, CoinListJson, Coin
import json, random

# def update_coinlist(request, topcoinlist):
#   if request.method == "POST":
#     coinList = CoinList.objects.get(pk=1)
#     coinList = topcoinlist
#     coinList.save()
#   print("list updated")

##### Update/add coin on the the database with new prices

def coinUpdateOrCreate(coin):
    newValues = {"marketCapRank":coin["market_cap_rank"], "currentPrice":coin["current_price"], "high24h":coin["high_24h"], "low24h":coin["low_24h"], "priceChangePercentage24h":coin["price_change_percentage_24h"], "lastUpdate":timezone.now} 

    Coin.objects.update_or_create(coinId=coin["id"], coinName=coin["name"], image=coin["image"], defaults=newValues)
    # coinName = coin["name"]
    # print(f"{coinName} updated")


##### GET LIST OF ALL COINS ON COINGECKO ######

def fetch_coinlist():
    
  top300list = {}
  coinlistAPI2 = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=300&page=1"

  with requests.get(coinlistAPI2) as top300:
    top300data = top300.json()

  for coin in top300data:
    top300list[coin["id"]] = coin["name"]

  # print(top300list)
  CoinListJson.objects.create(coins = top300list)

  
def fetch_schedule():
  url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=300&page=1"
  
  currentCoinsList = []
  currentCoins = Coin.objects.all()
  for coin in currentCoins:
    currentCoinsList.append(coin.coinId)

  with requests.get(url) as data:
    df = data.json()

  # keys = ["symbol", "name", "current_price", "market_cap_rank", "high_24h", "low_24h", "price_change_percentage_24h", "last_updated"]
  currentPrice = df[0]["current_price"]
  # for key in keys:
  #   btc = df[0][key]
  #   print(btc)

  # btc = BtcPrice.objects.get(pk=1)

  requests.post(f"http://127.0.0.1:8000/updatebtc/{currentPrice}")

  #### use symbols to update top coin list
  top10 = []
  for coin in df:
    if coin["id"] in currentCoinsList:
      top10.append(coin["symbol"])
      coinUpdateOrCreate(coin)
  
  print("coins updated")

