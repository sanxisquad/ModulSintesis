from django.db import models
from accounts.models import CustomUser, Empresa
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
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
        choices=[('paper', 'Paper'), ('plàstic', 'Plàstic'), ('vidre', 'Vidre'), ('orgànic', 'Orgànic'), ('rebuig', 'Rebuig')]
    )  # Tipo de reciclaje
    estat = models.CharField(
        max_length=100,
        choices=[('buit', 'Buit'), ('ple', 'Ple'), ('mig', 'Mig ple')]
    )  
    latitud = models.FloatField()  
    longitud = models.FloatField()  
    ciutat = models.CharField(max_length=255)
    ultima_revision = models.DateTimeField(auto_now=True)
    alerta = models.BooleanField(default=False)
    motivo_alerta = models.CharField(max_length=255, blank=True, null=True)
    fecha_ultimo_vaciado = models.DateTimeField(null=True, blank=True)
    
    def registrar_cambio_estado(self, nuevo_estado, usuario=None):
        HistorialContenedor.objects.create(
            contenedor=self,
            estado_anterior=self.estat,
            estado_actual=nuevo_estado,
            cambiado_por=usuario
        )
        self.estat = nuevo_estado
        self.save()

    def __str__(self):
        return f"Contenedor a {self.zona.nom if self.zona else 'Sense zona'} - Estat: {self.estat} - Tipo: {self.tipus} - Ciutat: {self.ciutat}"
    
class HistorialContenedor(models.Model):
    contenedor = models.ForeignKey('Contenedor', related_name="historial", on_delete=models.CASCADE)
    fecha = models.DateTimeField(auto_now_add=True)
    estado_anterior = models.CharField(max_length=100, choices=[('buit', 'Buit'), ('ple', 'Ple'), ('mig', 'Mig ple')])
    estado_actual = models.CharField(max_length=100, choices=[('buit', 'Buit'), ('ple', 'Ple'), ('mig', 'Mig ple')])
    nivel_llenado = models.IntegerField(help_text="Porcentaje de llenado (0-100)", null=True, blank=True)
    cambiado_por = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-fecha']
        verbose_name_plural = "Historial de contenedores"
        indexes = [
            models.Index(fields=['contenedor', 'fecha']),
        ]

    def __str__(self):
        return f"Historial {self.contenedor.id} - {self.fecha.strftime('%d/%m/%Y %H:%M')}"

class ReporteContenedor(models.Model):
    TIPO_REPORTE = [
        ('mal_estado', 'Contenidor en mal estat'),
        ('lleno', 'Contenidor ple'),
        ('vandalismo', 'Vandalisme'),
        ('ubicacion', 'Problema amb la ubicació'),
        ('olores', 'Mals olors'),
        ('otro', 'Altre problema')
    ]
    
    ESTADO_REPORTE = [
        ('abierto', 'Obert'),
        ('en_proceso', 'En procés'),
        ('resuelto', 'Resolt'),
        ('rechazado', 'Rebutjat')
    ]
    
    PRIORIDAD_REPORTE = [
        ('baja', 'Baixa'),
        ('media', 'Mitjana'),
        ('alta', 'Alta'),
        ('urgente', 'Urgent')
    ]
    
    contenedor = models.ForeignKey('Contenedor', related_name="reportes", on_delete=models.CASCADE, null=True, blank=True)
    zona = models.ForeignKey('ZonesReciclatge', related_name="reportes", on_delete=models.SET_NULL, null=True, blank=True)
    empresa = models.ForeignKey(Empresa, related_name="reportes", on_delete=models.CASCADE, null=True, blank=True)
    usuario = models.ForeignKey(CustomUser, related_name="reportes_enviados", on_delete=models.SET_NULL, null=True)
    gestor_asignado = models.ForeignKey(CustomUser, related_name="reportes_asignados", on_delete=models.SET_NULL, null=True, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)
    ultima_actualizacion = models.DateTimeField(auto_now=True)
    tipo = models.CharField(max_length=50, choices=TIPO_REPORTE)
    prioridad = models.CharField(max_length=50, choices=PRIORIDAD_REPORTE, default='media')
    descripcion = models.TextField()
    imagen = models.ImageField(upload_to='reportes/', null=True, blank=True)
    estado = models.CharField(max_length=50, choices=ESTADO_REPORTE, default='abierto')
    resuelto_por = models.ForeignKey(CustomUser, related_name="reportes_resueltos", on_delete=models.SET_NULL, null=True, blank=True)
    fecha_resolucion = models.DateTimeField(null=True, blank=True)
    comentario_cierre = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['-fecha']
        verbose_name_plural = "Reportes de contenedores"
        permissions = [
            ("can_manage_reports", "Puede gestionar reportes"),
        ]
    
    def __str__(self):
        return f"Reporte #{self.id} - {self.get_tipo_display()}"
    
    def save(self, *args, **kwargs):
        # If empresa is not set but we have a contenedor or zona, get the empresa from there
        if not self.empresa:
            if self.contenedor:
                self.empresa = self.contenedor.empresa
            elif self.zona:
                self.empresa = self.zona.empresa
        
        # Validate either contenedor, zona or empresa is provided
        if not self.contenedor and not self.zona and not self.empresa:
            raise ValueError("Debe especificar un contenedor, una zona de reciclaje o una empresa")
            
        if self.estado == 'resuelto' and not self.fecha_resolucion:
            self.fecha_resolucion = timezone.now()
        super().save(*args, **kwargs)
    
    def tiempo_resolucion(self):
        """Retorna el tiempo que tomó resolver el reporte o None si aún no está resuelto"""
        if self.estado == 'resuelto' and self.fecha_resolucion:
            return self.fecha_resolucion - self.fecha
        return None
    
    @property
    def antiguedad(self):
        """Retorna la antigüedad del reporte en días"""
        return (timezone.now() - self.fecha).days
    
    def cambiar_estado(self, nuevo_estado, usuario=None, comentario=None):
        """Cambia el estado del reporte y actualiza los campos relacionados"""
        if nuevo_estado not in dict(self.ESTADO_REPORTE):
            raise ValueError(f"Estado no válido: {nuevo_estado}")
            
        self.estado = nuevo_estado
        self.ultima_actualizacion = timezone.now()
        
        if nuevo_estado == 'resuelto':
            self.fecha_resolucion = timezone.now()
            self.resuelto_por = usuario
            if comentario:
                self.comentario_cierre = comentario
                
        self.save()
        return True

class Notificacion(models.Model):
    TIPO_ALERTA = [
        ('reporte', 'Nuevo reporte'),
        ('contenedor_estado', 'Cambio de estado'),
        ('contenedor_lleno', 'Contenedor lleno'),
        ('contenedor_mal_estado', 'Contenedor en mal estado'),
        ('sistema', 'Mensaje del sistema')
    ]
    
    usuario = models.ForeignKey(CustomUser, related_name="notificaciones", on_delete=models.CASCADE)
    tipo = models.CharField(max_length=50, choices=TIPO_ALERTA)
    titulo = models.CharField(max_length=100)
    mensaje = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    leida = models.BooleanField(default=False)
    relacion_contenedor = models.ForeignKey('Contenedor', on_delete=models.SET_NULL, null=True, blank=True)
    relacion_zona = models.ForeignKey('ZonesReciclatge', on_delete=models.SET_NULL, null=True, blank=True)
    relacion_reporte = models.ForeignKey(ReporteContenedor, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-fecha']
        verbose_name_plural = "Notificaciones"
    
    def __str__(self):
        return f"Notificación para {self.usuario.username} - {self.titulo}"
@receiver(pre_save, sender=Contenedor)
def verificar_estado_contenedor(sender, instance, **kwargs):
    if instance.id:
        original = Contenedor.objects.get(pk=instance.id)
        if original.estat != instance.estat:
            # Registrar en historial
            HistorialContenedor.objects.create(
                contenedor=instance,
                estado_anterior=original.estat,
                estado_actual=instance.estat,
                nivel_llenado=100 if instance.estat == 'ple' else 50 if instance.estat == 'mig' else 0
            )
            
            # Notificar a TODOS los usuarios de la empresa del contenedor
            usuarios_empresa = CustomUser.objects.filter(empresa=instance.empresa)
            
            for usuario in usuarios_empresa:
                Notificacion.objects.create(
                    usuario=usuario,
                    tipo='contenedor_estado',
                    titulo=f"Estado cambiado: {instance.get_estat_display()}",
                    mensaje=f"Contenedor {instance.cod} ahora está {instance.get_estat_display()}",
                    relacion_contenedor=instance
                )
            
            # Lógica adicional para alertas
            if instance.estat == 'ple':
                instance.alerta = True
                instance.motivo_alerta = "Contenedor lleno"

class ComentarioReporte(models.Model):
    reporte = models.ForeignKey(ReporteContenedor, related_name="comentarios", on_delete=models.CASCADE)
    usuario = models.ForeignKey(CustomUser, related_name="comentarios", on_delete=models.SET_NULL, null=True)
    texto = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    imagen = models.ImageField(upload_to='comentarios_reportes/', null=True, blank=True)
    
    class Meta:
        ordering = ['fecha']  # Order chronologically
    
    def __str__(self):
        return f"Comentario en tiquet #{self.reporte.id} por {self.usuario.username if self.usuario else 'Usuario eliminado'}"
