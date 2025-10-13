from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserProfile, Stock, UserHoldings, StockHolding, ZodiacSignMatching, DailyHoroscope


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = ('date_of_birth', 'zodiac_sign', 'zodiac_symbol', 'zodiac_element', 'investing_style', 'onboarding_completed')


class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_staff', 'get_onboarding_status')
    
    def get_onboarding_status(self, obj):
        return obj.profile.onboarding_completed if hasattr(obj, 'profile') else False
    get_onboarding_status.short_description = 'Onboarding Complete'
    get_onboarding_status.boolean = True


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'date_of_birth', 'zodiac_sign', 'investing_style', 'onboarding_completed', 'created_at')
    list_filter = ('zodiac_sign', 'investing_style', 'onboarding_completed')
    search_fields = ('user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('ticker', 'company_name', 'current_price', 'zodiac_sign', 'market_state', 'last_updated')
    list_filter = ('zodiac_sign', 'market_state')
    search_fields = ('ticker', 'company_name')
    readonly_fields = ('last_updated',)


@admin.register(UserHoldings)
class UserHoldingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'created_at', 'updated_at')
    search_fields = ('user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(StockHolding)
class StockHoldingAdmin(admin.ModelAdmin):
    list_display = ('user_holdings', 'ticker', 'quantity', 'total_value', 'created_at')
    list_filter = ('ticker',)
    search_fields = ('user_holdings__user__email', 'ticker')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ZodiacSignMatching)
class ZodiacSignMatchingAdmin(admin.ModelAdmin):
    list_display = ('user_sign', 'stock_sign', 'match_type', 'element')
    list_filter = ('user_sign', 'match_type', 'element')
    search_fields = ('user_sign', 'stock_sign')
    ordering = ('user_sign', 'match_type', 'stock_sign')
    
    # Make the admin interface more user-friendly
    fieldsets = (
        ('Zodiac Signs', {
            'fields': ('user_sign', 'stock_sign')
        }),
        ('Compatibility', {
            'fields': ('match_type', 'element')
        }),
    )


@admin.register(DailyHoroscope)
class DailyHoroscopeAdmin(admin.ModelAdmin):
    list_display = ('zodiac_sign', 'investing_style', 'date', 'created_at')
    list_filter = ('zodiac_sign', 'investing_style', 'date')
    search_fields = ('zodiac_sign', 'horoscope_text')
    readonly_fields = ('created_at',)
    ordering = ('-date', 'zodiac_sign')
    
    fieldsets = (
        ('Identity', {
            'fields': ('zodiac_sign', 'investing_style', 'date')
        }),
        ('Content', {
            'fields': ('horoscope_text',)
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )


admin.site.register(User, CustomUserAdmin)