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
    PasswordChangeSerializer
)

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
