from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


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
    onboarding_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - Profile"
    
    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"


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
