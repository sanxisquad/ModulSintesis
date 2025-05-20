from django.core.management.base import BaseCommand
from sistema_reciclatge.models import Material

class Command(BaseCommand):
    help = 'Crea los materiales necesarios para el sistema de reciclaje'

    def handle(self, *args, **options):
        # Define los materiales con su nombre, puntos, color y contenedor asociado
        materiales = [
            {
                'nombre': 'plastico',
                'puntos': 10,
                'color': '#FFC107',  # Amarillo
                'contenedor': 'Contenedor amarillo'
            },
            {
                'nombre': 'papel',
                'puntos': 5,
                'color': '#2196F3',  # Azul
                'contenedor': 'Contenedor azul'
            },
            {
                'nombre': 'vidrio',
                'puntos': 15,
                'color': '#4CAF50',  # Verde
                'contenedor': 'Contenedor verde'
            },
            {
                'nombre': 'metal',
                'puntos': 20,
                'color': '#FF9800',  # Naranja
                'contenedor': 'Contenedor amarillo'
            },
            {
                'nombre': 'organico',
                'puntos': 5,
                'color': '#795548',  # Marrón
                'contenedor': 'Contenedor marrón'
            },
            {
                'nombre': 'resto',
                'puntos': 3,
                'color': '#9E9E9E',  # Gris
                'contenedor': 'Contenedor gris'
            },
        ]

        # Crear los materiales si no existen
        created_count = 0
        for material_data in materiales:
            material, created = Material.objects.get_or_create(
                nombre=material_data['nombre'],
                defaults={
                    'puntos': material_data['puntos'],
                    'color': material_data['color'],
                    'contenedor': material_data['contenedor']
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Creado material: {material.nombre}'))
            else:
                self.stdout.write(f'El material {material.nombre} ya existe')

        if created_count > 0:
            self.stdout.write(self.style.SUCCESS(f'Se han creado {created_count} materiales'))
        else:
            self.stdout.write('No se ha creado ningún material nuevo')
