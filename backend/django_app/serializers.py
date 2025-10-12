from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Stock, UserProfile, UserHoldings, StockHolding, ZodiacSignMatching, UserStockPreference

User = get_user_model()


class StockSerializer(serializers.ModelSerializer):
    """
    Serializer for Stock model - real-time market data
    """
    class Meta:
        model = Stock
        fields = [
            'id',
            'ticker',
            'company_name',
            'current_price',
            'previous_close',
            'market_state',
            'last_updated',
            'description',
            'date_founded',
            'zodiac_sign'
        ]
        read_only_fields = ['id', 'last_updated']


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile model
    """
    class Meta:
        model = UserProfile
        fields = [
            'date_of_birth', 
            'zodiac_sign', 
            'zodiac_symbol', 
            'zodiac_element', 
            'investing_style',
            'starting_balance',
            'onboarding_completed',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model - used for retrieving user data
    """
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'date_joined', 'is_active', 'profile']
        read_only_fields = ['id', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users with password validation
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Password fields didn't match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user data (excluding password)
    """
    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name']

    def validate_email(self, value):
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for changing user password
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New password fields didn't match.")
        return attrs

    def save(self, **kwargs):
        password = self.validated_data['new_password']
        user = self.context['request'].user
        user.set_password(password)
        user.save()
        return user


class OnboardingSerializer(serializers.Serializer):
    """
    Serializer for onboarding data
    """
    date_of_birth = serializers.DateField(required=True)
    zodiac_sign = serializers.CharField(max_length=50, required=True)
    zodiac_symbol = serializers.CharField(max_length=10, required=False, allow_blank=True)
    zodiac_element = serializers.CharField(max_length=50, required=False, allow_blank=True)
    investing_style = serializers.CharField(max_length=50, required=True)
    starting_balance = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)

    def validate_investing_style(self, value):
        """Validate that investing_style is one of the allowed values"""
        allowed_styles = ['casual', 'balanced', 'profit-seeking', 'playful']
        if value not in allowed_styles:
            raise serializers.ValidationError(
                f"Invalid investing style. Must be one of: {', '.join(allowed_styles)}"
            )
        return value

    def validate_zodiac_sign(self, value):
        """Validate that zodiac_sign is a valid zodiac sign"""
        allowed_signs = [
            'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ]
        if value not in allowed_signs:
            raise serializers.ValidationError(
                f"Invalid zodiac sign. Must be one of: {', '.join(allowed_signs)}"
            )
        return value
    
    def validate_starting_balance(self, value):
        """Validate that starting_balance is between 10,000 and 1,000,000"""
        if value < 10000 or value > 1000000:
            raise serializers.ValidationError(
                "Starting balance must be between $10,000 and $1,000,000"
            )
        return value
    
    def save_to_profile(self, user):
        """
        Save validated onboarding data to the user's profile and create holdings
        """
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        profile.date_of_birth = self.validated_data['date_of_birth']
        profile.zodiac_sign = self.validated_data['zodiac_sign']
        profile.zodiac_symbol = self.validated_data.get('zodiac_symbol', '')
        profile.zodiac_element = self.validated_data.get('zodiac_element', '')
        profile.investing_style = self.validated_data['investing_style']
        profile.starting_balance = self.validated_data['starting_balance']
        profile.onboarding_completed = True
        profile.save()
        
        # Create or update UserHoldings with the starting balance
        holdings, created = UserHoldings.objects.get_or_create(user=user)
        holdings.balance = self.validated_data['starting_balance']
        holdings.save()
        
        return profile


class StockHoldingSerializer(serializers.ModelSerializer):
    """
    Serializer for individual stock holdings
    """
    class Meta:
        model = StockHolding
        fields = ['id', 'ticker', 'quantity', 'total_value', 'purchase_price', 'purchase_date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserHoldingsSerializer(serializers.ModelSerializer):
    """
    Serializer for user holdings with nested stock positions
    """
    positions = StockHoldingSerializer(many=True, read_only=True)
    
    class Meta:
        model = UserHoldings
        fields = ['id', 'balance', 'positions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ZodiacSignMatchingSerializer(serializers.ModelSerializer):
    """
    Serializer for zodiac sign matching compatibility
    """
    class Meta:
        model = ZodiacSignMatching
        fields = ['id', 'user_sign', 'stock_sign', 'match_type', 'element']
        read_only_fields = ['id']


class MatchedStockSerializer(serializers.ModelSerializer):
    """
    Extended stock serializer that includes match information
    """
    match_type = serializers.CharField(read_only=True)
    compatibility_score = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Stock
        fields = [
            'id',
            'ticker',
            'company_name',
            'current_price',
            'previous_close',
            'market_state',
            'last_updated',
            'description',
            'date_founded',
            'zodiac_sign',
            'match_type',
            'compatibility_score'
        ]
        read_only_fields = ['id', 'last_updated']


class UserStockPreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer for user stock preferences (watchlist and dislike list)
    """
    class Meta:
        model = UserStockPreference
        fields = ['id', 'ticker', 'preference_type', 'created_at']
        read_only_fields = ['id', 'created_at']


class PortfolioHoldingSerializer(serializers.Serializer):
    """
    Serializer for portfolio holdings with alignment information
    """
    ticker = serializers.CharField()
    company_name = serializers.CharField()
    quantity = serializers.DecimalField(max_digits=12, decimal_places=4)
    purchase_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    purchase_date = serializers.DateTimeField()
    current_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    current_value = serializers.DecimalField(max_digits=12, decimal_places=2)
    cost_basis = serializers.DecimalField(max_digits=12, decimal_places=2)
    gain_loss = serializers.DecimalField(max_digits=12, decimal_places=2)
    gain_loss_percent = serializers.DecimalField(max_digits=12, decimal_places=2)
    alignment_score = serializers.IntegerField()
    match_type = serializers.CharField()
    zodiac_sign = serializers.CharField()
    element = serializers.CharField()


class PortfolioSummarySerializer(serializers.Serializer):
    """
    Serializer for complete portfolio summary with alignment metrics
    """
    cash_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    stocks_value = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_portfolio_value = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_cost_basis = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_gain_loss = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_gain_loss_percent = serializers.DecimalField(max_digits=12, decimal_places=2)
    overall_alignment_score = serializers.IntegerField()
    cosmic_vibe_index = serializers.IntegerField()
    element_distribution = serializers.DictField()
    alignment_breakdown = serializers.DictField()
    holdings = PortfolioHoldingSerializer(many=True)