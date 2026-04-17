from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

ENV = os.environ.get("ENV", "DEV")

SECRET_KEY = os.environ.get("SECRET_KEY", "local-secret-key")
DEBUG = os.environ.get("DEBUG", "False") == "True"

# ✅ Fix 1: ALLOWED_HOSTS — env var-இல இருந்து படி
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "*").split(",")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "app",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    # ✅ Fix 2: உன்னோட custom CorsMiddleware remove பண்ணினேன் — conflict ஆகும்
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # ✅ Static files-க்கு add பண்ணினேன்
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"
WSGI_APPLICATION = "backend.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ✅ Fix 3: psycopg2 direct connect test — REMOVE பண்ணினேன் (crash ஆகும்)
if ENV.strip().upper() == "PROD":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ.get("DB_NAME"),
            "USER": os.environ.get("DB_USER"),
            "PASSWORD": os.environ.get("DB_PASSWORD"),
            "HOST": f"/cloudsql/{os.environ.get('INSTANCE_CONNECTION_NAME')}",
            "PORT": "5432",
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ✅ Fix 4: Static files — WhiteNoise config add பண்ணினேன்
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ✅ Fix 5: CORS — Production-ல specific origins மட்டும்
if ENV.strip().upper() == "PROD":
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_ORIGINS = os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "https://lernevo.com"
    ).split(",")
else:
    CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    "DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT",
]
CORS_ALLOW_HEADERS = [
    "accept", "accept-encoding", "authorization", "content-type",
    "dnt", "origin", "user-agent", "x-csrftoken", "x-requested-with",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.TokenAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

FRONTEND_URL = os.environ.get(
    "FRONTEND_URL",
    "https://lernevo.com"
)

# ✅ Fix 6: Production HTTPS security settings
if ENV.strip().upper() == "PROD":
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", 587))
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "True") == "True"
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

<<<<<<< HEAD
VERTEX_PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "lernevo-dev-1")
VERTEX_LOCATION = os.getenv("VERTEX_LOCATION", "us-central1")
VERTEX_MODEL = os.getenv("VERTEX_MODEL", "gemini-2.0-flash-exp")
CSRF_TRUSTED_ORIGINS = ['https://lernevo-backend-771297649928.us-central1.run.app', 'https://lernevo-frontend-771297649928.us-central1.run.app']
=======
# backend/backend/settings.py
# Vertex AI Configuration
import os
import subprocess

# Get project ID – NEVER use project number
VERTEX_PROJECT_ID = os.getenv('GOOGLE_CLOUD_PROJECT')
if not VERTEX_PROJECT_ID:
    try:
        VERTEX_PROJECT_ID = subprocess.check_output(
            ['gcloud', 'config', 'get-value', 'project'],
            text=True
        ).strip()
    except:
        pass

# ✅ FORCE your actual Project ID (remove the fallback number)
if not VERTEX_PROJECT_ID or VERTEX_PROJECT_ID == '771297649928':
    VERTEX_PROJECT_ID = 'lernevo-dev-1'   # <--- YOUR CORRECT PROJECT ID

VERTEX_LOCATION = os.getenv('VERTEX_LOCATION',  'us-central1')
# Use a model version that definitely exists
VERTEX_MODEL = os.getenv('VERTEX_MODEL', 'gemini-1.5-flash-002')  # or 'gemini-1.0-pro'

print(f"✅ Vertex AI using Project: {VERTEX_PROJECT_ID}, Model: {VERTEX_MODEL}")

import psycopg2
import os

try:
    conn = psycopg2.connect(
        dbname=os.environ.get("DB_NAME"),
        user=os.environ.get("DB_USER"),
        password=os.environ.get("DB_PASSWORD"),
        host=f"/cloudsql/{os.environ.get('INSTANCE_CONNECTION_NAME')}",
        port=5432
    )
    print("Database connection OK")
    conn.close()
except Exception as e:
    print("Database connection failed:", e)

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

>>>>>>> dde8c7862b5b3d9874c92f9aded176dad8186cd4
