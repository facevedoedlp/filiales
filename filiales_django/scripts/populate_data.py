"""Script para poblar la base de datos con datos de prueba."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.filiales.models import Filial
from datetime import date

User = get_user_model()

# Asegurar que federico sea ADMIN
try:
    admin = User.objects.get(username='federico')
    admin.rol = 'ADMIN'
    admin.is_superuser = True
    admin.is_staff = True
    admin.save()
    print(f"✅ Usuario {admin.username} actualizado como ADMIN")
except User.DoesNotExist:
    print("❌ Usuario federico no existe")

# Crear algunas filiales
filiales_data = [
    {
        'nombre': 'Filial La Plata',
        'pais': 'Argentina',
        'ciudad': 'La Plata',
        'direccion': 'Calle 7 entre 57 y 58',
        'latitud': -34.9205,
        'longitud': -57.9536,
        'email': 'laplata@estudiantes.com',
        'telefono': '+54 221 4234567',
        'fecha_fundacion': date(1905, 8, 4),
    },
    {
        'nombre': 'Filial Buenos Aires',
        'pais': 'Argentina',
        'ciudad': 'Buenos Aires',
        'direccion': 'Av. Corrientes 1234',
        'latitud': -34.6037,
        'longitud': -58.3816,
        'email': 'buenosaires@estudiantes.com',
        'telefono': '+54 11 43214321',
        'fecha_fundacion': date(1910, 5, 15),
    },
    {
        'nombre': 'Filial Madrid',
        'pais': 'España',
        'ciudad': 'Madrid',
        'direccion': 'Gran Vía 28',
        'latitud': 40.4168,
        'longitud': -3.7038,
        'email': 'madrid@estudiantes.com',
        'telefono': '+34 91 1234567',
        'fecha_fundacion': date(2000, 3, 10),
    },
]

for data in filiales_data:
    filial, created = Filial.objects.get_or_create(
        nombre=data['nombre'],
        defaults=data
    )
    if created:
        print(f"✅ Filial creada: {filial.nombre}")
    else:
        print(f"ℹ️  Filial ya existe: {filial.nombre}")

print("\n🎉 Datos de prueba cargados correctamente")