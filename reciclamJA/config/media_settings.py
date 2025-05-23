"""
This file contains utilities to check and validate media settings in Django.
It helps ensure that MEDIA_URL and MEDIA_ROOT are configured correctly.
"""

import os
from django.conf import settings
from django.core.checks import Warning, register

@register()
def check_media_settings(app_configs, **kwargs):
    """
    Check that media settings are configured correctly.
    """
    errors = []
    
    # Check MEDIA_URL is defined
    if not hasattr(settings, 'MEDIA_URL'):
        errors.append(
            Warning(
                'MEDIA_URL setting is not defined',
                hint='Add MEDIA_URL = "/media/" to your settings file',
                id='media_settings.W001',
            )
        )
    elif not settings.MEDIA_URL.startswith('/') or not settings.MEDIA_URL.endswith('/'):
        errors.append(
            Warning(
                'MEDIA_URL should start and end with a slash',
                hint='Change MEDIA_URL to "/media/" or similar',
                id='media_settings.W002',
            )
        )
    
    # Check MEDIA_ROOT is defined and exists
    if not hasattr(settings, 'MEDIA_ROOT'):
        errors.append(
            Warning(
                'MEDIA_ROOT setting is not defined',
                hint='Add MEDIA_ROOT = os.path.join(BASE_DIR, "media") to your settings file',
                id='media_settings.W003',
            )
        )
    elif not os.path.isdir(settings.MEDIA_ROOT):
        errors.append(
            Warning(
                f'MEDIA_ROOT directory does not exist: {settings.MEDIA_ROOT}',
                hint='Create the directory or update MEDIA_ROOT setting',
                id='media_settings.W004',
            )
        )
    
    return errors

def print_media_settings_info():
    """
    Print information about media settings for debugging.
    Call this function at the end of your settings file.
    """
    print("\n--- Media Settings Info ---")
    print(f"MEDIA_URL: {getattr(settings, 'MEDIA_URL', 'Not defined')}")
    print(f"MEDIA_ROOT: {getattr(settings, 'MEDIA_ROOT', 'Not defined')}")
    
    if hasattr(settings, 'MEDIA_ROOT') and os.path.isdir(settings.MEDIA_ROOT):
        print(f"MEDIA_ROOT exists: Yes")
        # Check for prize directory
        prizes_dir = os.path.join(settings.MEDIA_ROOT, 'prizes')
        if os.path.isdir(prizes_dir):
            prize_files = os.listdir(prizes_dir)
            print(f"Prize files in media directory: {len(prize_files)}")
            if prize_files:
                print(f"Example prize files: {prize_files[:3]}")
        else:
            print(f"Prize directory does not exist: {prizes_dir}")
    else:
        print(f"MEDIA_ROOT exists: No")
    
    print("-------------------------\n")
