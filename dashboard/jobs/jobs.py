import requests
from django.utils import timezone
from django.conf import settings
from dashboard.models import CoinListJson, Coin


##### Update/add coin on the the database with new prices

def coinUpdateOrCreate(coin):
    newValues = {"marketCapRank":coin["market_cap_rank"], "currentPrice":coin["current_price"], "high24h":coin["high_24h"], "low24h":coin["low_24h"], "priceChangePercentage24h":coin["price_change_percentage_24h"], "lastUpdate":timezone.now} 

    Coin.objects.update_or_create(coinId=coin["id"], coinName=coin["name"], image=coin["image"], defaults=newValues)



##### GET LIST OF ALL COINS ON COINGECKO ######

def fetch_coinlist():
    
  top300list = {}
  coinlistAPI2 = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=300&page=1"

  with requests.get(coinlistAPI2) as top300:
    top300data = top300.json()

  for coin in top300data:
    top300list[coin["id"]] = coin["name"]

  coinlist = CoinListJson.objects.all()
  CoinListJson.objects.create(coins = top300list)
  coinlist[0].delete()


  
def fetch_schedule():
  url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=300&page=1"
  
  currentCoinsList = []
  currentCoins = Coin.objects.all()
  for coin in currentCoins:
    currentCoinsList.append(coin.coinId)

  with requests.get(url) as data:
    df = data.json()

  for coin in df:
    if coin["id"] in currentCoinsList:
      coinUpdateOrCreate(coin)
  
