from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserProfile


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


admin.site.register(User, CustomUserAdmin)