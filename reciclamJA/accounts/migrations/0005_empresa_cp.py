# Generated by Django 5.1.6 on 2025-03-25 10:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_customuser_cp'),
    ]

    operations = [
        migrations.AddField(
            model_name='empresa',
            name='CP',
            field=models.CharField(blank=True, max_length=5, null=True),
        ),
    ]
