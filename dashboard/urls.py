from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('watchlist', views.watchlist, name="watchlist"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    #### API routes ####
    path('coins', views.coin_prices, name="coin-prices"),
    path('coinlist', views.coin_list, name="coin-list"),
    path('watchlist/<int:id>', views.user_watchlist, name="user-watchlist"),
    path('watchlist/<int:id>/<str:coinId>', views.add_to_watchlist, name="add-to-watchlist"),
]
