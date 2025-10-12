from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class Stock(models.Model):
    """
    Stock model for storing real-time market data
    """
    ticker = models.CharField(max_length=10, unique=True, db_index=True)
    company_name = models.CharField(max_length=255)
    current_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    previous_close = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    market_state = models.CharField(max_length=20, null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    # Additional metadata from stocks.json
    description = models.TextField(blank=True)
    date_founded = models.DateTimeField(null=True, blank=True)
    zodiac_sign = models.CharField(max_length=50, null=True, blank=True)
    
    def __str__(self):
        return f"{self.ticker} - {self.company_name}"
    
    class Meta:
        verbose_name = "Stock"
        verbose_name_plural = "Stocks"
        ordering = ['ticker']


class User(AbstractUser):
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


class UserProfile(models.Model):
    """
    Extended user profile for storing onboarding and additional user data
    """
    INVESTING_STYLES = [
        ('casual', 'Casual Explorer'),
        ('balanced', 'Balanced Seeker'),
        ('profit-seeking', 'Profit Seeker'),
        ('playful', 'Playful Mystic'),
    ]
    
    ZODIAC_SIGNS = [
        ('Aries', 'Aries'),
        ('Taurus', 'Taurus'),
        ('Gemini', 'Gemini'),
        ('Cancer', 'Cancer'),
        ('Leo', 'Leo'),
        ('Virgo', 'Virgo'),
        ('Libra', 'Libra'),
        ('Scorpio', 'Scorpio'),
        ('Sagittarius', 'Sagittarius'),
        ('Capricorn', 'Capricorn'),
        ('Aquarius', 'Aquarius'),
        ('Pisces', 'Pisces'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    date_of_birth = models.DateField(null=True, blank=True)
    zodiac_sign = models.CharField(max_length=50, choices=ZODIAC_SIGNS, null=True, blank=True)
    zodiac_symbol = models.CharField(max_length=10, null=True, blank=True)
    zodiac_element = models.CharField(max_length=50, null=True, blank=True)
    investing_style = models.CharField(max_length=50, choices=INVESTING_STYLES, null=True, blank=True)
    starting_balance = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    onboarding_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - Profile"
    
    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"


class UserHoldings(models.Model):
    """
    Track user's current balance and overall portfolio
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='holdings')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - Holdings (Balance: ${self.balance})"
    
    class Meta:
        verbose_name = "User Holdings"
        verbose_name_plural = "User Holdings"


class StockHolding(models.Model):
    """
    Individual stock positions within a user's holdings
    """
    user_holdings = models.ForeignKey(UserHoldings, on_delete=models.CASCADE, related_name='positions')
    ticker = models.CharField(max_length=10)
    quantity = models.DecimalField(max_digits=12, decimal_places=4)  # Supports fractional shares
    total_value = models.DecimalField(max_digits=12, decimal_places=2)  # Total cost basis (purchase value)
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)  # Average price per share
    purchase_date = models.DateTimeField(null=True, blank=True)  # Date of first purchase (or last update)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user_holdings.user.email} - {self.ticker}: {self.quantity} shares (${self.total_value})"
    
    class Meta:
        verbose_name = "Stock Holding"
        verbose_name_plural = "Stock Holdings"
        unique_together = ['user_holdings', 'ticker']


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create a UserProfile when a new User is created
    """
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Automatically save the UserProfile when the User is saved
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()


class ZodiacSignMatching(models.Model):
    """
    Model to store zodiac sign compatibility data for stock matching
    """
    MATCH_TYPES = [
        ('positive', 'Positive Match'),
        ('neutral', 'Neutral Match'),
        ('negative', 'Negative Match'),
    ]
    
    user_sign = models.CharField(max_length=50)
    stock_sign = models.CharField(max_length=50)
    match_type = models.CharField(max_length=20, choices=MATCH_TYPES)
    element = models.CharField(max_length=50)
    
    def __str__(self):
        return f"{self.user_sign} → {self.stock_sign} ({self.match_type})"
    
    class Meta:
        verbose_name = "Zodiac Sign Matching"
        verbose_name_plural = "Zodiac Sign Matchings"
        unique_together = ['user_sign', 'stock_sign']
        ordering = ['user_sign', 'match_type']


class UserStockPreference(models.Model):
    """
    Track user's stock preferences (watchlist or dislike list)
    """
    PREFERENCE_TYPES = [
        ('watchlist', 'Watchlist'),
        ('dislike', 'Dislike'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stock_preferences')
    ticker = models.CharField(max_length=10)
    preference_type = models.CharField(max_length=20, choices=PREFERENCE_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.ticker} ({self.preference_type})"
    
    class Meta:
        verbose_name = "User Stock Preference"
        verbose_name_plural = "User Stock Preferences"
        unique_together = ['user', 'ticker']
        ordering = ['-created_at']


# Utility function to get element from zodiac sign
def get_element_from_zodiac(zodiac_sign):
    """
    Returns the element (Fire, Earth, Air, Water) for a given zodiac sign
    """
    ZODIAC_ELEMENTS = {
        'Aries': 'Fire',
        'Leo': 'Fire',
        'Sagittarius': 'Fire',
        'Taurus': 'Earth',
        'Virgo': 'Earth',
        'Capricorn': 'Earth',
        'Gemini': 'Air',
        'Libra': 'Air',
        'Aquarius': 'Air',
        'Cancer': 'Water',
        'Scorpio': 'Water',
        'Pisces': 'Water',
    }
    return ZODIAC_ELEMENTS.get(zodiac_sign, 'Unknown')