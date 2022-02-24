from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models.deletion import CASCADE
from django.forms import ModelForm
import numpy as np

# Create your models here.
class User(AbstractUser):
    pass

class Coin(models.Model):
  coinId = models.CharField(max_length=16, unique=True)
  coinName = models.CharField(max_length=64)
  currentPrice = models.DecimalField(max_digits=16, decimal_places=8)
  marketCapRank = models.IntegerField()
  high24h = models.DecimalField(max_digits=16, decimal_places=8)
  low24h = models.DecimalField(max_digits=16, decimal_places=8)
  priceChangePercentage24h = models.DecimalField(max_digits=8, decimal_places=5)
  lastUpdate = models.DateTimeField(auto_now=True)
  image = models.URLField(max_length=200, blank=True)

  class Meta:
        order_with_respect_to = 'marketCapRank'

  def serialize(self):
    return {
        "id": self.id,
        "coinId": self.coinId,
        "name": self.coinName,
        "currentPrice": self.currentPrice,
        "rank": self.marketCapRank,
        "high24h": self.high24h,
        "low24h": self.low24h,
        "percChange24h": self.priceChangePercentage24h,
        "lastUpdate": self.lastUpdate,
        "image": self.image,
    }

  def __str__(self):
      return f"{self.coinName} ({self.coinId})"

class Watchlist(models.Model):
  user_id = models.OneToOneField(User, on_delete=models.CASCADE, default=1)
  coin_id = models.ManyToManyField(Coin, blank=True)

  def __str__(self):
      return f"{self.user_id}"
  
  def serialize(self):
    return {
      "user_id": self.user_id,
      "coin_id": self.coin_id,
    }

class BtcPrice(models.Model):
  price = ArrayField(models.IntegerField())   

  def __str__(self):
      return f"{self.price}" 

class CoinListJson(models.Model):
  coins = models.JSONField()

  def __str__(self):
      return f"{self.coins}" 

  def serialize(self):
    return {
        "coin": self.coins
    }


######## Madel forms #########

class NewCoin(ModelForm):

  class Meta:
    model = Coin
    fields = '__all__'