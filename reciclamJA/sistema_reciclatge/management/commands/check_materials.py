from django.core.management.base import BaseCommand
from sistema_reciclatge.models import Material
from sistema_reciclatge.views import normalize_material_name

class Command(BaseCommand):
    help = 'Checks and lists all materials in the database'

    def handle(self, *args, **options):
        materials = Material.objects.all()
        self.stdout.write(self.style.SUCCESS(f"Found {materials.count()} materials in the database:"))
        
        # List all materials
        for material in materials:
            self.stdout.write(f"- ID: {material.id}, Nombre: '{material.nombre}', Display: '{material.get_nombre_display()}'")
        
        # Test normalizations
        self.stdout.write("\nTesting material name normalizations:")
        test_names = ['plastico', 'plástico', 'plastic', 'papel', 'paper', 'vidrio', 'vidre', 'metal', 'metall']
        
        for name in test_names:
            normalized = normalize_material_name(name)
            material = Material.objects.filter(nombre__iexact=normalized).first()
            status = "✓ FOUND" if material else "✗ NOT FOUND"
            self.stdout.write(f"'{name}' -> '{normalized}': {status}")
        
        # Create missing materials if needed
        if not materials.exists():
            self.stdout.write(self.style.WARNING("\nNo materials found. Creating standard materials:"))
            for choice in Material.TIPOS_CHOICES:
                Material.objects.create(
                    nombre=choice[0],
                    descripcion=f"Descripción de {choice[1]}",
                    contenedor=choice[0]
                )
            self.stdout.write(self.style.SUCCESS("Created standard materials."))
