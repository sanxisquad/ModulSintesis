from django.core.management.base import BaseCommand
from reciclatge.models import Material

class Command(BaseCommand):
    help = 'Inicializa los materiales predeterminados para el sistema de reciclaje'

    def handle(self, *args, **kwargs):
        materiales = [
            {
                'nombre': 'plastico',
                'descripcion': 'Plàstics com ampolles, envasos, bosses, etc.',
                'color': '#FFEB3B',  # Amarillo
                'puntos': 300,
                'contenedor': 'Contenidor Groc'
            },
            {
                'nombre': 'papel',
                'descripcion': 'Paper, cartró, diaris, revistes, caixes, etc.',
                'color': '#2196F3',  # Azul
                'puntos': 100,
                'contenedor': 'Contenidor Blau'
            },
            {
                'nombre': 'vidrio',
                'descripcion': 'Ampolles de vidre, pots, recipients, etc.',
                'color': '#4CAF50',  # Verde
                'puntos': 150,
                'contenedor': 'Contenidor Verd'
            },
            {
                'nombre': 'metal',
                'descripcion': 'Llaunes d\'alumini, envasos metàl·lics, etc.',
                'color': '#FF9800',  # Naranja
                'puntos': 200,
                'contenedor': 'Contenidor Groc'
            },
            {
                'nombre': 'organico',
                'descripcion': 'Restes de menjar, pells, etc.',
                'color': '#795548',  # Marrón
                'puntos': 50,
                'contenedor': 'Contenidor Marró'
            },
            {
                'nombre': 'resto',
                'descripcion': 'Residus que no es poden reciclar o no tenen contenidor específic.',
                'color': '#9E9E9E',  # Gris
                'puntos': 20,
                'contenedor': 'Contenidor Gris'
            }
        ]
        
        count = 0
        for material_data in materiales:
            material, created = Material.objects.get_or_create(
                nombre=material_data['nombre'],
                defaults=material_data
            )
            
            # Actualizar los puntos incluso si el material ya existe
            if not created:
                material.puntos = material_data['puntos']
                material.save()
                self.stdout.write(f'Material actualitzat: {material.nombre} - {material.puntos} punts')
            else:
                count += 1
                self.stdout.write(self.style.SUCCESS(f'Material creat: {material.nombre}'))
                
        self.stdout.write(self.style.SUCCESS(f'S\'han creat {count} materials nous'))
        self.stdout.write(self.style.SUCCESS('Procés completat amb èxit'))
