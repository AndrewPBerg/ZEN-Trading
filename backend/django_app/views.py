from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .serializers import (
    UserSerializer, 
    UserCreateSerializer, 
    UserUpdateSerializer, 
    PasswordChangeSerializer,
    OnboardingSerializer,
    UserHoldingsSerializer
)
from .models import UserHoldings

User = get_user_model()

# TODO talk to an external API

# TODO 

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
