"""
Django management command to clear the database if CLEAR_DB environment variable is set.
"""
import os
from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings


class Command(BaseCommand):
    help = 'Clears the database if CLEAR_DB environment variable is set to true'

    def handle(self, *args, **options):
        clear_db = os.getenv('CLEAR_DB', 'false').lower()
        
        if clear_db in ['true', '1', 'yes']:
            self.stdout.write(self.style.WARNING('🗑️  CLEAR_DB is enabled. Clearing database...'))
            
            try:
                with connection.cursor() as cursor:
                    # Get the database name
                    db_name = settings.DATABASES['default']['NAME']
                    
                    # Terminate all connections to the database (except current)
                    cursor.execute(f"""
                        SELECT pg_terminate_backend(pg_stat_activity.pid)
                        FROM pg_stat_activity
                        WHERE pg_stat_activity.datname = '{db_name}'
                        AND pid <> pg_backend_pid();
                    """)
                    
                    # Drop all tables
                    cursor.execute("""
                        DO $$ DECLARE
                            r RECORD;
                        BEGIN
                            -- Drop all tables
                            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                                EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                            END LOOP;
                            
                            -- Drop all sequences
                            FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
                                EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
                            END LOOP;
                            
                            -- Drop all views
                            FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
                                EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.viewname) || ' CASCADE';
                            END LOOP;
                        END $$;
                    """)
                    
                self.stdout.write(self.style.SUCCESS('✅ Database cleared successfully!'))
                self.stdout.write(self.style.WARNING('⚠️  All tables, sequences, and views have been dropped.'))
                self.stdout.write(self.style.NOTICE('ℹ️  Migrations will recreate the schema.'))
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Error clearing database: {str(e)}'))
                raise
        else:
            self.stdout.write(self.style.SUCCESS('ℹ️  CLEAR_DB is not enabled. Skipping database clear.'))

