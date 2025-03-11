from django.db import models
from accounts.models import Empresa  

class ZonesReciclatge(models.Model):
    nom = models.CharField(max_length=255)  
    ciutat = models.CharField(max_length=255)  
    empresa = models.ForeignKey(Empresa, related_name="zonas_reciclaje", on_delete=models.CASCADE) 
    latitud = models.FloatField()  
    longitud = models.FloatField()  
    descripcio = models.TextField(blank=True, null=True)  
    
    def __str__(self):
        return f"Zona de reciclaje: {self.nom} - Ciutat: {self.ciutat}"

class Contenedor(models.Model):
    cod = models.CharField(max_length=255 )
    zona = models.ForeignKey(
        ZonesReciclatge, 
        related_name="contenedors", 
        on_delete=models.CASCADE, 
        null=True,  # Relación opcional: un contenedor no tiene que estar en una zona
        blank=True   # Campo opcional, puede ser dejado vacío
    )
    empresa = models.ForeignKey(Empresa, related_name="contenedors", on_delete=models.CASCADE)  
    tipus = models.CharField(
        max_length=100,
        choices=[('paper', 'Paper'), ('plàstic', 'Plàstic'), ('vidrie', 'Vidre'), ('orgànic', 'Orgànic'), ('rebuig', 'Rebuig')]
    )  # Tipo de reciclaje
    estat = models.CharField(
        max_length=100,
        choices=[('buit', 'Buit'), ('ple', 'Ple'), ('mig', 'Mig ple')]
    )  
    latitud = models.FloatField()  
    longitud = models.FloatField()  
    ciutat = models.CharField(max_length=255)

    def __str__(self):
        return f"Contenedor a {self.zona.nombre if self.zona else 'Sin zona'} - Estat: {self.estado} - Tipo: {self.tipus}"

