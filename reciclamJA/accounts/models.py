from django.db import models
from django.contrib.auth.models import AbstractUser

# Modelo para Roles (si deseas asignar roles a los usuarios)
class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

# Modelo CustomUser extendido de AbstractUser
class CustomUser(AbstractUser):
    age = models.PositiveIntegerField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)  # Relación con Role
    score = models.IntegerField(default=0)
    empresa = models.ForeignKey('Empresa', related_name='usuarios', on_delete=models.CASCADE, null=True)  # Relación uno a muchos: cada usuario pertenece a una empresa

    def __str__(self):
        return self.username
    def is_gestor(self):
        return self.role and self.role.name == 'GESTOR'
    
    


# Modelo para Empresa
class Empresa(models.Model):
    nom = models.CharField(max_length=255)
    NIF = models.CharField(max_length=9, unique=True)  # NIF único para cada empresa
    direccio = models.CharField(max_length=255)
    telefon = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nom
    

