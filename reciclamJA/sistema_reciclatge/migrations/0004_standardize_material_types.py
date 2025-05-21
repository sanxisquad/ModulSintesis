from django.db import migrations

def standardize_types(apps, schema_editor):
    Material = apps.get_model('sistema_reciclatge', 'Material')
    
    # Mapeo de nombres antiguos a nombres estandarizados
    type_mapping = {
        'plastico': 'plàstic',
        'plàstico': 'plàstic',
        'papel': 'paper',
        'vidrio': 'vidre',
        'organico': 'orgànic',
        'orgánico': 'orgànic',
        'resto': 'rebuig',
        'metal': 'plàstic',  # El metal va en el contenedor amarillo (plástico)
        'metall': 'plàstic'
    }
    
    for material in Material.objects.all():
        normalized = material.nombre.lower()
        if normalized in type_mapping:
            material.nombre = type_mapping[normalized]
            material.save()

class Migration(migrations.Migration):

    dependencies = [
        ('sistema_reciclatge', '0002_bolsavirtual_productoreciclado_bolsa'),  # Ajusta esta dependencia según tu historial de migraciones
    ]

    operations = [
        migrations.RunPython(standardize_types),
    ]
