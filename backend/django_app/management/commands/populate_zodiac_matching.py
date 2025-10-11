"""
Management command to populate zodiac sign matching data from sign_matching.json
"""
import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from django_app.models import ZodiacSignMatching


class Command(BaseCommand):
    help = 'Populate zodiac sign matching data from sign_matching.json'

    def handle(self, *args, **options):
        # Clear existing data
        self.stdout.write('Clearing existing zodiac matching data...')
        ZodiacSignMatching.objects.all().delete()
        
        # Path to sign_matching.json
        json_path = os.path.join(settings.BASE_DIR, 'data', 'sign_matching.json')
        
        if not os.path.exists(json_path):
            self.stdout.write(self.style.ERROR(f'File not found: {json_path}'))
            return
        
        # Load sign matching data
        self.stdout.write(f'Loading data from {json_path}...')
        with open(json_path, 'r') as f:
            sign_data = json.load(f)
        
        # Populate database
        created_count = 0
        for sign_info in sign_data:
            user_sign = sign_info['sign']
            element = sign_info['element']
            
            # Process positive matches
            for stock_sign in sign_info['positive_matches']:
                ZodiacSignMatching.objects.create(
                    user_sign=user_sign,
                    stock_sign=stock_sign,
                    match_type='positive',
                    element=element
                )
                created_count += 1
            
            # Process neutral matches
            for stock_sign in sign_info['neutral_matches']:
                ZodiacSignMatching.objects.create(
                    user_sign=user_sign,
                    stock_sign=stock_sign,
                    match_type='neutral',
                    element=element
                )
                created_count += 1
            
            # Process negative matches
            for stock_sign in sign_info['negative_matches']:
                ZodiacSignMatching.objects.create(
                    user_sign=user_sign,
                    stock_sign=stock_sign,
                    match_type='negative',
                    element=element
                )
                created_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'Successfully created {created_count} zodiac sign matching records'
        ))
        
        # Print summary
        self.stdout.write('\nSummary by match type:')
        for match_type in ['positive', 'neutral', 'negative']:
            count = ZodiacSignMatching.objects.filter(match_type=match_type).count()
            self.stdout.write(f'  {match_type.capitalize()}: {count}')
        
        self.stdout.write('\nSummary by user sign:')
        for sign in ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                     'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']:
            count = ZodiacSignMatching.objects.filter(user_sign=sign).count()
            self.stdout.write(f'  {sign}: {count}')

