"""Pruebas básicas de modelos."""
from django.test import TestCase
from apps.filiales.models import Filial
from apps.integrantes.models import Integrante


class ModelosTestCase(TestCase):
    def setUp(self):
        self.filial = Filial.objects.create(
            nombre="Filial Central",
            descripcion="Filial principal",
            direccion="Calle Falsa 123",
            ciudad="Buenos Aires",
            provincia="Buenos Aires",
            pais="Argentina",
        )

    def test_creacion_integrante(self):
        integrante = Integrante.objects.create_user(
            username="usuario1",
            password="seguro123",
            nombre="Juan",
            apellido="Pérez",
            documento="12345678",
            filial=self.filial,
        )
        self.assertEqual(integrante.filial, self.filial)
        self.assertEqual(integrante.nombre, "Juan")

    def test_creacion_filial(self):
        self.assertEqual(Filial.objects.count(), 1)
