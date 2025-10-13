from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from decimal import Decimal
from .serializers import (
    StockSerializer,
    UserSerializer, 
    UserCreateSerializer, 
    UserUpdateSerializer, 
    PasswordChangeSerializer,
    OnboardingSerializer,
    UserHoldingsSerializer,
    ZodiacSignMatchingSerializer,
    UserStockPreferenceSerializer,
    PortfolioSummarySerializer,
    DailyHoroscopeSerializer
)
from .models import Stock, UserHoldings, ZodiacSignMatching, UserStockPreference, DailyHoroscope, get_element_from_zodiac
from datetime import date

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


class StockDetailView(APIView):
    """
    GET: Retrieve a single stock by ticker with zodiac matching info (if authenticated)
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, ticker):
        """
        Get stock details with zodiac matching information if user is authenticated
        """
        try:
            # Get the stock
            stock = get_object_or_404(Stock, ticker=ticker.upper())
            stock_data = StockSerializer(stock).data
            
            # If user is authenticated, add zodiac matching information
            if request.user.is_authenticated:
                try:
                    profile = request.user.profile
                    if profile.zodiac_sign:
                        user_sign = profile.zodiac_sign
                        
                        # Check if it's the same sign as user
                        is_same_sign = stock.zodiac_sign == user_sign
                        stock_data['is_same_sign'] = is_same_sign
                        
                        # Get match type from zodiac matching table
                        if is_same_sign:
                            stock_data['match_type'] = 'positive'
                            stock_data['compatibility_score'] = 4
                        else:
                            try:
                                matching = ZodiacSignMatching.objects.get(
                                    user_sign=user_sign,
                                    stock_sign=stock.zodiac_sign
                                )
                                stock_data['match_type'] = matching.match_type
                                
                                # Assign compatibility scores based on match type
                                if matching.match_type == 'positive':
                                    stock_data['compatibility_score'] = 3
                                elif matching.match_type == 'neutral':
                                    stock_data['compatibility_score'] = 2
                                else:  # negative
                                    stock_data['compatibility_score'] = 1
                            except ZodiacSignMatching.DoesNotExist:
                                # Default to neutral if no matching data
                                stock_data['match_type'] = 'neutral'
                                stock_data['compatibility_score'] = 2
                        
                        # Add element
                        stock_data['element'] = get_element_from_zodiac(stock.zodiac_sign)
                except Exception as e:
                    # If there's an error getting zodiac info, just return basic stock data
                    print(f"Error adding zodiac matching info: {e}")
                    pass
            
            return Response(stock_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Failed to fetch stock',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
                
                # Trigger horoscope generation for this user's zodiac sign + investing style
                # Run in background using Django-Q2
                try:
                    from django_q.tasks import async_task
                    async_task(
                        'django_app.tasks.generate_single_horoscope',
                        request.user.profile.zodiac_sign,
                        request.user.profile.investing_style
                    )
                except Exception as e:
                    # Log but don't fail onboarding if horoscope generation fails
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(f"Failed to trigger horoscope generation for user {request.user.email}: {str(e)}")
                
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
                quantity = Decimal(str(quantity))
                total_value = Decimal(str(total_value))
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
                
                # Calculate purchase price per share
                from django.utils import timezone
                purchase_price_per_share = total_value / quantity
                
                # Update or create stock holding
                from .models import StockHolding
                stock_holding, created = StockHolding.objects.get_or_create(
                    user_holdings=holdings,
                    ticker=ticker,
                    defaults={
                        'quantity': quantity, 
                        'total_value': total_value,
                        'purchase_price': purchase_price_per_share,
                        'purchase_date': timezone.now()
                    }
                )
                
                if not created:
                    # Update existing position with weighted average purchase price
                    old_cost_basis = stock_holding.total_value
                    new_cost_basis = old_cost_basis + total_value
                    old_quantity = stock_holding.quantity
                    new_quantity = old_quantity + quantity
                    
                    # Calculate new weighted average purchase price
                    stock_holding.purchase_price = new_cost_basis / new_quantity
                    stock_holding.quantity = new_quantity
                    stock_holding.total_value = new_cost_basis
                    stock_holding.purchase_date = timezone.now()  # Update to most recent purchase
                    stock_holding.save()
                else:
                    # For new positions, purchase_price is already set in defaults
                    pass
                
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
                
                print(f"After sell: {ticker} quantity = {stock_holding.quantity} (type: {type(stock_holding.quantity)}), checking if <= 0: {stock_holding.quantity <= Decimal('0')}")
                
                if stock_holding.quantity <= Decimal('0'):
                    # Remove position if fully sold
                    stock_holding.delete()
                    print(f"Position deleted for {ticker}")
                    
                    # Remove from watchlist so it can appear in discovery again
                    deleted_count, _ = UserStockPreference.objects.filter(
                        user=request.user,
                        ticker=ticker,
                        preference_type='watchlist'
                    ).delete()
                    
                    print(f"Removed {ticker} from watchlist for user {request.user.email}: {deleted_count} entries deleted")
                else:
                    stock_holding.save()
                    print(f"Position updated for {ticker}, remaining quantity: {stock_holding.quantity}")
                
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


class PortfolioSummaryView(APIView):
    """
    GET: Retrieve comprehensive portfolio summary with alignment metrics
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Get portfolio summary including financial metrics and alignment scores
        """
        try:
            # Get user's holdings
            holdings = UserHoldings.objects.get(user=request.user)
            positions = holdings.positions.all()
            
            # Get user's zodiac sign
            profile = request.user.profile
            if not profile.zodiac_sign:
                return Response({
                    'error': 'Zodiac sign not set',
                    'detail': 'Please complete onboarding to set your zodiac sign'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user_sign = profile.zodiac_sign
            
            # Initialize metrics
            cash_balance = holdings.balance
            total_cost_basis = Decimal('0')
            stocks_current_value = Decimal('0')
            portfolio_holdings = []
            
            # Element and alignment tracking
            element_values = {'Fire': 0, 'Earth': 0, 'Air': 0, 'Water': 0}
            alignment_counts = {'same_sign': 0, 'positive': 0, 'neutral': 0, 'negative': 0}
            weighted_alignment_sum = 0
            
            # Process each position
            for position in positions:
                # Get stock information
                try:
                    stock = Stock.objects.get(ticker=position.ticker)
                except Stock.DoesNotExist:
                    # Skip positions where stock doesn't exist in database
                    continue
                
                # Calculate financial metrics
                current_price = Decimal(str(stock.current_price)) if stock.current_price else Decimal('0')
                quantity = Decimal(str(position.quantity))
                current_value = current_price * quantity
                cost_basis = Decimal(str(position.total_value))
                gain_loss = current_value - cost_basis
                gain_loss_percent = (gain_loss / cost_basis * 100) if cost_basis > 0 else Decimal('0')
                
                # Get alignment information
                match_type = 'neutral'
                alignment_score = 65  # Default neutral score
                
                # Check if same sign (highest priority)
                is_same_sign = stock.zodiac_sign == user_sign
                if is_same_sign:
                    alignment_score = 100
                    match_type = 'same_sign'
                else:
                    # Lookup zodiac matching
                    try:
                        matching = ZodiacSignMatching.objects.get(
                            user_sign=user_sign,
                            stock_sign=stock.zodiac_sign
                        )
                        match_type = matching.match_type
                        
                        # Assign alignment scores based on match type
                        if match_type == 'positive':
                            alignment_score = 85
                        elif match_type == 'neutral':
                            alignment_score = 65
                        elif match_type == 'negative':
                            alignment_score = 40
                    except ZodiacSignMatching.DoesNotExist:
                        # Default to neutral if no matching data
                        match_type = 'neutral'
                        alignment_score = 65
                
                # Get element
                element = get_element_from_zodiac(stock.zodiac_sign)
                
                # Track element distribution (by current value)
                if element in element_values:
                    element_values[element] += current_value
                
                # Track alignment counts
                if is_same_sign:
                    alignment_counts['same_sign'] += 1
                elif match_type == 'positive':
                    alignment_counts['positive'] += 1
                elif match_type == 'neutral':
                    alignment_counts['neutral'] += 1
                elif match_type == 'negative':
                    alignment_counts['negative'] += 1
                
                # Add to totals
                total_cost_basis += cost_basis
                stocks_current_value += current_value
                
                # Create portfolio holding dict
                holding_data = {
                    'ticker': position.ticker,
                    'company_name': stock.company_name,
                    'quantity': position.quantity,
                    'purchase_price': position.purchase_price or 0,
                    'purchase_date': position.purchase_date,
                    'current_price': current_price,
                    'current_value': current_value,
                    'cost_basis': cost_basis,
                    'gain_loss': gain_loss,
                    'gain_loss_percent': gain_loss_percent,
                    'alignment_score': alignment_score,
                    'match_type': match_type,
                    'zodiac_sign': stock.zodiac_sign,
                    'element': element
                }
                
                portfolio_holdings.append(holding_data)
                
                # Accumulate weighted alignment (weight by current value percentage)
                # We'll normalize this after we know the total
            
            # Calculate total portfolio value
            total_portfolio_value = cash_balance + stocks_current_value
            
            # Calculate overall alignment score (weighted by position value)
            overall_alignment_score = 0
            if stocks_current_value > 0:
                for holding in portfolio_holdings:
                    weight = holding['current_value'] / stocks_current_value
                    weighted_alignment_sum += holding['alignment_score'] * weight
                overall_alignment_score = int(weighted_alignment_sum)
            else:
                # No stocks, neutral alignment
                overall_alignment_score = 50
            
            # Calculate element distribution percentages
            element_distribution = {}
            if stocks_current_value > 0:
                for element, value in element_values.items():
                    element_distribution[element] = round((value / stocks_current_value) * 100, 1)
            else:
                element_distribution = {'Fire': 0, 'Earth': 0, 'Air': 0, 'Water': 0}
            
            # Calculate cosmic vibe index (alignment + diversity bonus)
            # Bonus for having diverse elements (max 15 points)
            diversity_bonus = 0
            if stocks_current_value > 0:
                elements_with_holdings = sum(1 for v in element_values.values() if v > 0)
                diversity_bonus = min(elements_with_holdings * 3, 15)
            
            cosmic_vibe_index = min(overall_alignment_score + diversity_bonus, 100)
            
            # Calculate total gain/loss
            total_gain_loss = stocks_current_value - total_cost_basis
            total_gain_loss_percent = (total_gain_loss / total_cost_basis * 100) if total_cost_basis > 0 else 0
            
            # Build response data
            summary_data = {
                'cash_balance': cash_balance,
                'stocks_value': stocks_current_value,
                'total_portfolio_value': total_portfolio_value,
                'total_cost_basis': total_cost_basis,
                'total_gain_loss': total_gain_loss,
                'total_gain_loss_percent': total_gain_loss_percent,
                'overall_alignment_score': overall_alignment_score,
                'cosmic_vibe_index': cosmic_vibe_index,
                'element_distribution': element_distribution,
                'alignment_breakdown': alignment_counts,
                'holdings': portfolio_holdings
            }
            
            serializer = PortfolioSummarySerializer(summary_data)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except UserHoldings.DoesNotExist:
            return Response({
                'error': 'Holdings not found',
                'detail': 'User holdings have not been created yet. Complete onboarding first.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Failed to retrieve portfolio summary',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PortfolioHistoryView(APIView):
    """
    GET: Retrieve portfolio value history over a specified timeframe
    """
    permission_classes = [permissions.IsAuthenticated]
    
    # Timeframe to yfinance period/interval mapping
    TIMEFRAME_MAP = {
        '1D': {'period': '1d', 'interval': '5m'},
        '5D': {'period': '5d', 'interval': '15m'},
        '1W': {'period': '1wk', 'interval': '30m'},
        '1M': {'period': '1mo', 'interval': '1d'},
        '3M': {'period': '3mo', 'interval': '1d'},
        '1Y': {'period': '1y', 'interval': '1wk'},
        '5Y': {'period': '5y', 'interval': '1mo'},
    }
    
    def get(self, request):
        """
        Get historical portfolio values
        Query params: timeframe (1D, 5D, 1W, 1M, 3M, 1Y, 5Y)
        """
        from datetime import datetime
        import yfinance as yf
        
        try:
            timeframe = request.query_params.get('timeframe', '1M').upper()
            
            if timeframe not in self.TIMEFRAME_MAP:
                return Response({
                    'error': 'Invalid timeframe',
                    'detail': f'Timeframe must be one of: {", ".join(self.TIMEFRAME_MAP.keys())}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user's holdings
            holdings = UserHoldings.objects.get(user=request.user)
            positions = holdings.positions.all()
            
            if not positions:
                # No positions, just return cash balance over time
                return Response({
                    'timeframe': timeframe,
                    'data': [{
                        'timestamp': datetime.now().isoformat(),
                        'portfolio_value': float(holdings.balance),
                        'cash_balance': float(holdings.balance),
                        'stocks_value': 0.0,
                        'cosmic_vibe_index': 50
                    }]
                }, status=status.HTTP_200_OK)
            
            # Get historical data for all tickers
            period_config = self.TIMEFRAME_MAP[timeframe]
            tickers = [pos.ticker for pos in positions]
            
            # Fetch historical data
            historical_data = {}
            for ticker in tickers:
                try:
                    stock = yf.Ticker(ticker)
                    hist = stock.history(period=period_config['period'], interval=period_config['interval'])
                    if not hist.empty:
                        historical_data[ticker] = hist
                except Exception as e:
                    print(f"Failed to fetch history for {ticker}: {e}")
                    continue
            
            if not historical_data:
                return Response({
                    'error': 'No historical data available',
                    'detail': 'Could not fetch historical data for any holdings'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get common timestamps across all stocks
            # Use the first stock's timestamps as reference
            first_ticker = list(historical_data.keys())[0]
            timestamps = historical_data[first_ticker].index
            
            # Calculate portfolio value at each timestamp
            portfolio_history = []
            for timestamp in timestamps:
                stocks_value = Decimal('0')
                
                for position in positions:
                    if position.ticker in historical_data:
                        hist = historical_data[position.ticker]
                        try:
                            # Get the close price at this timestamp
                            if timestamp in hist.index:
                                price = Decimal(str(hist.loc[timestamp]['Close']))
                                quantity = Decimal(str(position.quantity))
                                stocks_value += price * quantity
                        except Exception as e:
                            print(f"Error calculating value for {position.ticker} at {timestamp}: {e}")
                            continue
                
                portfolio_value = float(holdings.balance) + float(stocks_value)
                
                # Simple cosmic vibe calculation (can be enhanced)
                cosmic_vibe_index = min(50 + (float(stocks_value) / portfolio_value * 50) if portfolio_value > 0 else 50, 100)
                
                portfolio_history.append({
                    'timestamp': timestamp.isoformat(),
                    'portfolio_value': portfolio_value,
                    'cash_balance': float(holdings.balance),
                    'stocks_value': float(stocks_value),
                    'cosmic_vibe_index': round(cosmic_vibe_index)
                })
            
            return Response({
                'timeframe': timeframe,
                'data': portfolio_history
            }, status=status.HTTP_200_OK)
            
        except UserHoldings.DoesNotExist:
            return Response({
                'error': 'Holdings not found',
                'detail': 'User holdings have not been created yet. Complete onboarding first.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Failed to retrieve portfolio history',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StockHistoryView(APIView):
    """
    GET: Retrieve stock price history over a specified timeframe
    """
    permission_classes = [permissions.AllowAny]  # Public access to stock data
    
    # Timeframe to yfinance period/interval mapping
    TIMEFRAME_MAP = {
        '1D': {'period': '1d', 'interval': '5m'},
        '5D': {'period': '5d', 'interval': '15m'},
        '1W': {'period': '1wk', 'interval': '30m'},
        '1M': {'period': '1mo', 'interval': '1d'},
        '3M': {'period': '3mo', 'interval': '1d'},
        '1Y': {'period': '1y', 'interval': '1wk'},
        '5Y': {'period': '5y', 'interval': '1mo'},
    }
    
    def get(self, request, ticker):
        """
        Get historical stock prices
        Query params: timeframe (1D, 5D, 1W, 1M, 3M, 1Y, 5Y)
        """
        import yfinance as yf
        
        try:
            timeframe = request.query_params.get('timeframe', '1M').upper()
            
            if timeframe not in self.TIMEFRAME_MAP:
                return Response({
                    'error': 'Invalid timeframe',
                    'detail': f'Timeframe must be one of: {", ".join(self.TIMEFRAME_MAP.keys())}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            period_config = self.TIMEFRAME_MAP[timeframe]
            
            # Fetch historical data
            stock = yf.Ticker(ticker.upper())
            hist = stock.history(period=period_config['period'], interval=period_config['interval'])
            
            if hist.empty:
                return Response({
                    'error': 'No data available',
                    'detail': f'No historical data found for ticker {ticker}'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Format the data
            history_data = []
            for timestamp, row in hist.iterrows():
                history_data.append({
                    'timestamp': timestamp.isoformat(),
                    'open': float(row['Open']),
                    'high': float(row['High']),
                    'low': float(row['Low']),
                    'close': float(row['Close']),
                    'volume': int(row['Volume'])
                })
            
            return Response({
                'ticker': ticker.upper(),
                'timeframe': timeframe,
                'data': history_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Failed to retrieve stock history',
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
            
            # Group stocks by match type for better variety
            same_sign_stocks = [s for s in matched_stocks if s.get('is_same_sign')]
            positive_stocks = [s for s in matched_stocks if not s.get('is_same_sign') and s.get('match_type') == 'positive']
            neutral_stocks = [s for s in matched_stocks if s.get('match_type') == 'neutral']
            negative_stocks = [s for s in matched_stocks if s.get('match_type') == 'negative']
            
            # Sort each group by ticker for consistency
            same_sign_stocks.sort(key=lambda x: x['ticker'])
            positive_stocks.sort(key=lambda x: x['ticker'])
            neutral_stocks.sort(key=lambda x: x['ticker'])
            negative_stocks.sort(key=lambda x: x['ticker'])
            
            # Interleave stocks to provide variety: 2 same/positive, 1 neutral, 1 negative pattern
            mixed_stocks = []
            max_length = max(len(same_sign_stocks), len(positive_stocks), len(neutral_stocks), len(negative_stocks))
            
            for i in range(max_length):
                # Add same sign stock
                if i < len(same_sign_stocks):
                    mixed_stocks.append(same_sign_stocks[i])
                # Add positive match
                if i < len(positive_stocks):
                    mixed_stocks.append(positive_stocks[i])
                # Add neutral match (for variety)
                if i < len(neutral_stocks):
                    mixed_stocks.append(neutral_stocks[i])
                # Add negative match occasionally (every other iteration)
                if i % 2 == 0 and i < len(negative_stocks):
                    mixed_stocks.append(negative_stocks[i])
            
            # Apply limit if specified
            if limit:
                try:
                    limit = int(limit)
                    mixed_stocks = mixed_stocks[:limit]
                except (ValueError, TypeError):
                    pass
            
            return Response({
                'user_sign': user_sign,
                'user_element': profile.zodiac_element,
                'total_matches': len(mixed_stocks),
                'matched_stocks': mixed_stocks
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


class DailyHoroscopeView(APIView):
    """
    GET: Retrieve today's horoscope for the authenticated user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Get today's horoscope based on user's zodiac sign and investing style
        """
        try:
            # Get user's profile
            profile = request.user.profile
            
            # Validate profile is complete
            if not profile.zodiac_sign:
                return Response({
                    'error': 'Profile incomplete',
                    'detail': 'Please complete onboarding to set your zodiac sign'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not profile.investing_style:
                return Response({
                    'error': 'Profile incomplete',
                    'detail': 'Please complete onboarding to set your investing style'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get today's date
            today = date.today()
            
            # Fetch horoscope for user's zodiac sign and investing style
            try:
                horoscope = DailyHoroscope.objects.get(
                    zodiac_sign=profile.zodiac_sign,
                    investing_style=profile.investing_style,
                    date=today
                )
                
                serializer = DailyHoroscopeSerializer(horoscope)
                return Response(serializer.data, status=status.HTTP_200_OK)
                
            except DailyHoroscope.DoesNotExist:
                return Response({
                    'error': 'Horoscope not available',
                    'detail': f'No horoscope has been generated for {profile.zodiac_sign} - {profile.investing_style} today. Please try again later.'
                }, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            return Response({
                'error': 'Failed to fetch horoscope',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
