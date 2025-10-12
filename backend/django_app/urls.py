"""
URL configuration for django_app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from . import views

# API URLs for user management
api_urlpatterns = [
    # JWT Authentication endpoints
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Stock endpoints (real-time market data)
    path('stocks/', views.StockListView.as_view(), name='stock-list'),
    path('stocks/<str:ticker>/', views.StockDetailView.as_view(), name='stock-detail'),
    
    # Class-based views
    path('users/', views.UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/me/', views.CurrentUserView.as_view(), name='current-user'),
    path('users/change-password/', views.PasswordChangeView.as_view(), name='change-password'),
    
    # Function-based views (alternative endpoints)
    path('profile/', views.user_profile, name='user-profile'),
    path('register/', views.register_user, name='register-user'),
    path('register', views.register_user, name='register-user-no-slash'),
    path('price-card/', views.PriceCardView.as_view(), name='price-card'),
    
    # Onboarding endpoint
    path('onboarding/', views.OnboardingView.as_view(), name='onboarding'),
    
    # Holdings endpoint
    path('holdings/', views.UserHoldingsView.as_view(), name='user-holdings'),
    
    # Portfolio summary endpoint
    path('portfolio/', views.PortfolioSummaryView.as_view(), name='portfolio-summary'),
    
    # Zodiac sign matching endpoints
    path('zodiac/matched-stocks/', views.ZodiacMatchedStocksView.as_view(), name='zodiac-matched-stocks'),
    path('zodiac/matching-rules/', views.ZodiacSignMatchingListView.as_view(), name='zodiac-matching-rules'),
    
    # User preferences (watchlist and dislike list)
    path('watchlist/', views.UserWatchlistView.as_view(), name='user-watchlist'),
    path('dislike-list/', views.UserDislikeListView.as_view(), name='user-dislike-list'),
    
    # Market status (public endpoint)
    path('market/status/', views.market_status, name='market-status'),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(api_urlpatterns)),
    # Add a simple health check endpoint
    path('health/', views.health_check, name='health-check'),
]
