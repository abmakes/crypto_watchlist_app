from django.contrib import admin
from .models import User, Coin, Watchlist, CoinListJson
# Register your models here.

admin.site.register(User)
admin.site.register(Coin)
admin.site.register(Watchlist)
admin.site.register(CoinListJson)