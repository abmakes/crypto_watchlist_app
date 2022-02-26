
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.http import JsonResponse
from django.urls import reverse


from .models import CoinListJson, NewCoin, User, Coin, Watchlist

# Create your views here.

def index(request):
  return render(request, "dashboard/index.html")

def watchlist(request):
  currentUser = request.user
  
  if request.method == "POST":
    form = NewCoin(request.POST)

    if form.is_valid():
      form.save()
      return HttpResponse("202")
    else:
      return HttpResponse("400")

  elif request.method == "GET":

    wlist = Watchlist.objects.get(pk=currentUser.id)
    wListCoin = wlist.coin_id.all()
    context = {
      "user": currentUser,
      "watchlist": wListCoin,       
    }
    return render(request, "dashboard/watchlist.html", context)


### authentication views ###

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "dashboard/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "dashboard/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "dashboard/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "dashboard/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        # Create a watchlist
        watchlist = Watchlist.objects.create(user_id=user)
        watchlist.save()
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "dashboard/register.html")


### API views ###

def coin_prices(reguest):
  coins = Coin.objects.all()
  return JsonResponse([coin.serialize() for coin in coins], safe=False)

def coin_list(request):
  coinlist = CoinListJson.objects.all()
  return JsonResponse([coin.serialize() for coin in coinlist], safe=False)

def user_watchlist(request, id):
  userName = Watchlist.objects.get(pk=id)
  watchlist = userName.coin_id.all()
  return JsonResponse([coin.serialize() for coin in watchlist], safe=False)

def add_to_watchlist(request, id, coinId):
  userName = Watchlist.objects.get(pk=id)
  coin = Coin.objects.get(coinId=coinId)
  watchlist = userName.coin_id.all()
  if coin in watchlist:
    userName.coin_id.remove(coin)
  else:
    userName.coin_id.add(coin)
  return JsonResponse([coin.serialize() for coin in watchlist], safe=False)