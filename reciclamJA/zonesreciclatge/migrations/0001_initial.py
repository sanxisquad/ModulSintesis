# Generated by Django 5.1.6 on 2025-03-07 11:51

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0003_empresa_customuser_empresa'),
    ]

    operations = [
        migrations.CreateModel(
            name='ZonesReciclatge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(max_length=255)),
                ('ciutat', models.CharField(max_length=255)),
                ('latitud', models.FloatField()),
                ('longitud', models.FloatField()),
                ('descripcio', models.TextField(blank=True, null=True)),
                ('empresa', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='zonas_reciclaje', to='accounts.empresa')),
            ],
        ),
        migrations.CreateModel(
            name='Contenedor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipus', models.CharField(choices=[('paper', 'Paper'), ('plàstic', 'Plàstic'), ('vidrie', 'Vidre'), ('orgànic', 'Orgànic'), ('rebuig', 'Rebuig')], max_length=100)),
                ('estat', models.CharField(choices=[('buit', 'Buit'), ('ple', 'Ple'), ('mig', 'Mig ple')], max_length=100)),
                ('latitud', models.FloatField()),
                ('longitud', models.FloatField()),
                ('ciutat', models.CharField(max_length=255)),
                ('empresa', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='contenedors', to='accounts.empresa')),
                ('zona', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='contenedors', to='zonesreciclatge.zonesreciclatge')),
            ],
        ),
    ]
