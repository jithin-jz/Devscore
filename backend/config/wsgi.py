import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
application = get_wsgi_application()

try:
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if not User.objects.filter(username='jithin').exists():
        User.objects.create_superuser('jithin', 'admin@example.com', 'admin')
        print("Admin user 'jithin' created successfully!")
except Exception as e:
    print(f"Admin creation error: {e}")
