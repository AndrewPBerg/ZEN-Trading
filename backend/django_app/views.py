from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .serializers import (
    StockSerializer,
    UserSerializer, 
    UserCreateSerializer, 
    UserUpdateSerializer, 
    PasswordChangeSerializer,
    OnboardingSerializer,
    UserHoldingsSerializer,
    ZodiacSignMatchingSerializer,
    UserStockPreferenceSerializer
)
from .models import Stock, UserHoldings, ZodiacSignMatching, UserStockPreference, get_element_from_zodiac

User = get_user_model()

# TODO talk to an external API

# TODO 

class StockListView(generics.ListAPIView):
    """
    GET: List all stocks with real-time prices
    """
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [permissions.AllowAny]  # Public access to stock data


class StockDetailView(generics.RetrieveAPIView):
    """
    GET: Retrieve a single stock by ticker
    """
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'ticker'  # Use ticker instead of pk
    lookup_url_kwarg = 'ticker'


class PriceCardView(APIView):
    """
    GET: Get price card
    """
    def get(self, request):
        return Response({'message': 'Price card'})

    # TODO decide how to handle third party API

    # if in database for time period get form database
    # else get from third party API
    # save to database
    # return data


class UserListCreateView(generics.ListCreateAPIView):
    """
    GET: List all users (admin only)
    POST: Create a new user (public registration)
    """
    queryset = User.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            # Allow public registration
            return [permissions.AllowAny()]
        # Only admin can list all users
        return [permissions.IsAdminUser()]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve user details
    PUT/PATCH: Update user
    DELETE: Delete user
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_permissions(self):
        # Users can only access their own profile, admins can access any
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]
    
    def get_object(self):
        # Allow users to access their own profile with 'me' keyword
        if self.kwargs.get('pk') == 'me':
            return self.request.user
        
        user = get_object_or_404(User, pk=self.kwargs.get('pk'))
        
        # Check if user can access this profile
        if not self.request.user.is_staff and user != self.request.user:
            self.permission_denied(self.request, "You can only access your own profile.")
        
        return user


class CurrentUserView(APIView):
    """
    GET: Get current authenticated user's profile
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class PasswordChangeView(APIView):
    """
    POST: Change user password
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """
    Simple function-based view to get user profile
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """
    Simple function-based view for user registration
    """
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            UserSerializer(user).data, 
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def health_check(request):
    """
    Simple health check endpoint
    """
    return JsonResponse({'status': 'ok', 'message': 'Django server is running'})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def market_status(request):
    """
    Get current market status (open/closed) and next market event time
    Public endpoint - no authentication required
    """
    try:
        from .utils.yfinance_module import is_market_open, get_next_market_open
        from datetime import datetime
        import pytz
        
        # Check if market is currently open
        market_open = is_market_open()
        
        # Get current time in Eastern timezone
        eastern = pytz.timezone('US/Eastern')
        now = datetime.now(eastern)
        current_time = now.strftime("%Y-%m-%d %H:%M:%S %Z")
        
        if market_open:
            # Market is open, calculate when it closes (4:00 PM ET)
            market_close = now.replace(hour=16, minute=0, second=0, microsecond=0)
            next_event_time = market_close.strftime("%Y-%m-%d %H:%M:%S %Z")
            next_event = "close"
        else:
            # Market is closed, get next open time
            next_event_time = get_next_market_open()
            next_event = "open"
        
        return Response({
            'is_open': market_open,
            'current_time': current_time,
            'next_event': next_event,
            'next_event_time': next_event_time
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to fetch market status',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OnboardingView(APIView):
    """
    POST: Submit onboarding data (date of birth, zodiac sign, investing style, starting balance)
    GET: Retrieve user's onboarding status and data
    """
    permission_classes = [permissions.IsAuthenticated]  # Require authentication
    
    def get(self, request):
        """
        Get the user's current onboarding data and status
        """
        try:
            profile = request.user.profile
            serializer = UserSerializer(request.user)
            return Response({
                'onboarding_completed': profile.onboarding_completed,
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Failed to retrieve onboarding data',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """
        Save onboarding data to the authenticated user's profile and create holdings
        """
        serializer = OnboardingSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Save the onboarding data to the user's profile
                # This also creates UserHoldings with starting_balance
                serializer.save_to_profile(request.user)
                
                # Return the updated user data with profile
                user_serializer = UserSerializer(request.user)
                
                return Response({
                    'message': 'Onboarding completed successfully',
                    'user': user_serializer.data
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'error': 'Failed to save onboarding data',
                    'detail': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserHoldingsView(APIView):
    """
    GET: Retrieve user's holdings (balance and stock positions)
    POST: Add or update a stock position (buy/sell stocks)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Get the authenticated user's holdings and stock positions
        """
        try:
            holdings = UserHoldings.objects.get(user=request.user)
            serializer = UserHoldingsSerializer(holdings)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserHoldings.DoesNotExist:
            return Response({
                'error': 'Holdings not found',
                'detail': 'User holdings have not been created yet. Complete onboarding first.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Failed to retrieve holdings',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """
        Add or update a stock position for the authenticated user
        Request body:
        {
            "ticker": "AAPL",
            "quantity": 10.5,
            "total_value": 1500.00,
            "action": "buy" or "sell"
        }
        """
        try:
            # Get or create user holdings
            holdings, created = UserHoldings.objects.get_or_create(user=request.user)
            
            # Extract data from request
            ticker = request.data.get('ticker', '').upper().strip()
            quantity = request.data.get('quantity')
            total_value = request.data.get('total_value')
            action = request.data.get('action', 'buy').lower()
            
            # Validate required fields
            if not ticker:
                return Response({
                    'error': 'Invalid data',
                    'detail': 'Ticker symbol is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if quantity is None or total_value is None:
                return Response({
                    'error': 'Invalid data',
                    'detail': 'Quantity and total_value are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                quantity = float(quantity)
                total_value = float(total_value)
            except (ValueError, TypeError):
                return Response({
                    'error': 'Invalid data',
                    'detail': 'Quantity and total_value must be valid numbers'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if quantity <= 0:
                return Response({
                    'error': 'Invalid data',
                    'detail': 'Quantity must be greater than 0'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if total_value < 0:
                return Response({
                    'error': 'Invalid data',
                    'detail': 'Total value cannot be negative'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Handle buy action
            if action == 'buy':
                # Check if user has enough balance
                if holdings.balance < total_value:
                    return Response({
                        'error': 'Insufficient balance',
                        'detail': f'Your balance (${holdings.balance}) is insufficient to complete this purchase (${total_value})'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Update or create stock holding
                from .models import StockHolding
                stock_holding, created = StockHolding.objects.get_or_create(
                    user_holdings=holdings,
                    ticker=ticker,
                    defaults={'quantity': quantity, 'total_value': total_value}
                )
                
                if not created:
                    # Update existing position
                    stock_holding.quantity += quantity
                    stock_holding.total_value += total_value
                    stock_holding.save()
                
                # Deduct from balance
                holdings.balance -= total_value
                holdings.save()
                
                message = f'Successfully purchased {quantity} shares of {ticker}'
            
            # Handle sell action
            elif action == 'sell':
                from .models import StockHolding
                try:
                    stock_holding = StockHolding.objects.get(
                        user_holdings=holdings,
                        ticker=ticker
                    )
                except StockHolding.DoesNotExist:
                    return Response({
                        'error': 'Position not found',
                        'detail': f'You do not own any shares of {ticker}'
                    }, status=status.HTTP_404_NOT_FOUND)
                
                # Check if user has enough shares
                if stock_holding.quantity < quantity:
                    return Response({
                        'error': 'Insufficient shares',
                        'detail': f'You only own {stock_holding.quantity} shares of {ticker}'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Update position
                stock_holding.quantity -= quantity
                stock_holding.total_value -= total_value
                
                if stock_holding.quantity <= 0:
                    # Remove position if fully sold
                    stock_holding.delete()
                else:
                    stock_holding.save()
                
                # Add to balance
                holdings.balance += total_value
                holdings.save()
                
                message = f'Successfully sold {quantity} shares of {ticker}'
            
            else:
                return Response({
                    'error': 'Invalid action',
                    'detail': 'Action must be either "buy" or "sell"'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Return updated holdings
            serializer = UserHoldingsSerializer(holdings)
            return Response({
                'message': message,
                'holdings': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Failed to process transaction',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ZodiacMatchedStocksView(APIView):
    """
    GET: Retrieve stocks matched to the authenticated user's zodiac sign
    Query parameters:
        - match_type: Filter by match type (positive, neutral, negative)
        - limit: Limit the number of results (default: no limit)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Get stocks that are compatible with the user's zodiac sign
        Excludes disliked stocks and orders by: same sign, positive, neutral, negative
        """
        try:
            # Get user's zodiac sign from profile
            profile = request.user.profile
            if not profile.zodiac_sign:
                return Response({
                    'error': 'Zodiac sign not set',
                    'detail': 'Please complete onboarding to set your zodiac sign'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user_sign = profile.zodiac_sign
            
            # Get query parameters
            match_type_filter = request.GET.get('match_type', None)
            limit = request.GET.get('limit', None)
            
            # Get user's disliked AND watchlist stocks to exclude them from discovery
            excluded_tickers = UserStockPreference.objects.filter(
                user=request.user,
                preference_type__in=['dislike', 'watchlist']
            ).values_list('ticker', flat=True)
            
            # Query zodiac matching data
            matching_query = ZodiacSignMatching.objects.filter(user_sign=user_sign)
            
            # Filter by match type if specified
            if match_type_filter and match_type_filter in ['positive', 'neutral', 'negative']:
                matching_query = matching_query.filter(match_type=match_type_filter)
            
            # Get all matching stock signs
            matches = matching_query.values('stock_sign', 'match_type', 'element')
            
            if not matches:
                return Response({
                    'user_sign': user_sign,
                    'matched_stocks': [],
                    'message': 'No matching data found. Please populate zodiac matching data.'
                }, status=status.HTTP_200_OK)
            
            # Create a mapping of stock sign to match info
            sign_to_match = {}
            for match in matches:
                sign_to_match[match['stock_sign']] = {
                    'match_type': match['match_type'],
                    'element': match['element']
                }
            
            # Get stocks with matching zodiac signs, excluding disliked and watchlist stocks
            stock_signs = list(sign_to_match.keys())
            stocks = Stock.objects.filter(zodiac_sign__in=stock_signs).exclude(ticker__in=excluded_tickers)
            
            # Add match information to each stock
            matched_stocks = []
            for stock in stocks:
                stock_data = StockSerializer(stock).data
                match_info = sign_to_match.get(stock.zodiac_sign, {})
                stock_data['match_type'] = match_info.get('match_type')
                
                # Check if it's the same sign as user
                is_same_sign = stock.zodiac_sign == user_sign
                stock_data['is_same_sign'] = is_same_sign
                
                # Add element derived from zodiac sign
                stock_data['element'] = get_element_from_zodiac(stock.zodiac_sign)
                
                # Calculate compatibility score with same sign being highest
                match_type = match_info.get('match_type')
                if is_same_sign:
                    stock_data['compatibility_score'] = 4  # Highest priority
                elif match_type == 'positive':
                    stock_data['compatibility_score'] = 3
                elif match_type == 'neutral':
                    stock_data['compatibility_score'] = 2
                else:  # negative
                    stock_data['compatibility_score'] = 1
                
                matched_stocks.append(stock_data)
            
            # Sort by compatibility score (highest first), then by ticker
            matched_stocks.sort(key=lambda x: (-x['compatibility_score'], x['ticker']))
            
            # Apply limit if specified
            if limit:
                try:
                    limit = int(limit)
                    matched_stocks = matched_stocks[:limit]
                except (ValueError, TypeError):
                    pass
            
            return Response({
                'user_sign': user_sign,
                'user_element': profile.zodiac_element,
                'total_matches': len(matched_stocks),
                'matched_stocks': matched_stocks
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Failed to fetch matched stocks',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ZodiacSignMatchingListView(generics.ListAPIView):
    """
    GET: List all zodiac sign matching rules
    Query parameters:
        - user_sign: Filter by user zodiac sign
        - match_type: Filter by match type (positive, neutral, negative)
    """
    queryset = ZodiacSignMatching.objects.all()
    serializer_class = ZodiacSignMatchingSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        user_sign = self.request.GET.get('user_sign', None)
        match_type = self.request.GET.get('match_type', None)
        
        if user_sign:
            queryset = queryset.filter(user_sign=user_sign)
        
        if match_type and match_type in ['positive', 'neutral', 'negative']:
            queryset = queryset.filter(match_type=match_type)
        
        return queryset


class UserWatchlistView(APIView):
    """
    GET: List user's watchlist stocks
    POST: Add a stock to watchlist
    DELETE: Remove a stock from watchlist
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Get all stocks in the user's watchlist
        """
        try:
            watchlist = UserStockPreference.objects.filter(
                user=request.user,
                preference_type='watchlist'
            )
            serializer = UserStockPreferenceSerializer(watchlist, many=True)
            return Response({
                'watchlist': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Failed to fetch watchlist',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """
        Add a stock to the watchlist
        Request body: { "ticker": "AAPL" }
        """
        try:
            ticker = request.data.get('ticker', '').upper().strip()
            if not ticker:
                return Response({
                    'error': 'Invalid data',
                    'detail': 'Ticker is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if stock exists in database
            try:
                Stock.objects.get(ticker=ticker)
            except Stock.DoesNotExist:
                return Response({
                    'error': 'Stock not found',
                    'detail': f'Stock with ticker {ticker} does not exist'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Create or update preference
            preference, created = UserStockPreference.objects.update_or_create(
                user=request.user,
                ticker=ticker,
                defaults={'preference_type': 'watchlist'}
            )
            
            serializer = UserStockPreferenceSerializer(preference)
            message = 'Added to watchlist' if created else 'Updated to watchlist'
            
            return Response({
                'message': message,
                'preference': serializer.data
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Failed to add to watchlist',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request):
        """
        Remove a stock from the watchlist
        Request body: { "ticker": "AAPL" }
        """
        try:
            ticker = request.data.get('ticker', '').upper().strip()
            if not ticker:
                return Response({
                    'error': 'Invalid data',
                    'detail': 'Ticker is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            deleted_count, _ = UserStockPreference.objects.filter(
                user=request.user,
                ticker=ticker,
                preference_type='watchlist'
            ).delete()
            
            if deleted_count == 0:
                return Response({
                    'error': 'Not found',
                    'detail': f'{ticker} is not in your watchlist'
                }, status=status.HTTP_404_NOT_FOUND)
            
            return Response({
                'message': f'Removed {ticker} from watchlist'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Failed to remove from watchlist',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserDislikeListView(APIView):
    """
    GET: List user's disliked stocks
    POST: Add a stock to dislike list
    DELETE: Remove a stock from dislike list
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Get all stocks in the user's dislike list
        """
        try:
            dislike_list = UserStockPreference.objects.filter(
                user=request.user,
                preference_type='dislike'
            )
            serializer = UserStockPreferenceSerializer(dislike_list, many=True)
            return Response({
                'dislike_list': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Failed to fetch dislike list',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """
        Add a stock to the dislike list
        Request body: { "ticker": "AAPL" }
        """
        try:
            ticker = request.data.get('ticker', '').upper().strip()
            if not ticker:
                return Response({
                    'error': 'Invalid data',
                    'detail': 'Ticker is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if stock exists in database
            try:
                Stock.objects.get(ticker=ticker)
            except Stock.DoesNotExist:
                return Response({
                    'error': 'Stock not found',
                    'detail': f'Stock with ticker {ticker} does not exist'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Create or update preference
            preference, created = UserStockPreference.objects.update_or_create(
                user=request.user,
                ticker=ticker,
                defaults={'preference_type': 'dislike'}
            )
            
            serializer = UserStockPreferenceSerializer(preference)
            message = 'Added to dislike list' if created else 'Updated to dislike list'
            
            return Response({
                'message': message,
                'preference': serializer.data
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Failed to add to dislike list',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request):
        """
        Remove a stock from the dislike list
        Request body: { "ticker": "AAPL" }
        """
        try:
            ticker = request.data.get('ticker', '').upper().strip()
            if not ticker:
                return Response({
                    'error': 'Invalid data',
                    'detail': 'Ticker is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            deleted_count, _ = UserStockPreference.objects.filter(
                user=request.user,
                ticker=ticker,
                preference_type='dislike'
            ).delete()
            
            if deleted_count == 0:
                return Response({
                    'error': 'Not found',
                    'detail': f'{ticker} is not in your dislike list'
                }, status=status.HTTP_404_NOT_FOUND)
            
            return Response({
                'message': f'Removed {ticker} from dislike list'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Failed to remove from dislike list',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
