from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Q
from .models import Notificacion, ReporteContenedor
from accounts.models import CustomUser

@receiver(post_save, sender=ReporteContenedor)
def notificar_nuevo_reporte(sender, instance, created, **kwargs):
    if created and instance.empresa:
        # Notificar a usuarios de la empresa excepto al creador
        usuarios = CustomUser.objects.filter(
            Q(empresa=instance.empresa) & 
            ~Q(id=instance.usuario.id if instance.usuario else 0)
        )
        
        for usuario in usuarios:
            if instance.contenedor:
                titulo = f"Nuevo reporte ({instance.get_tipo_display()})"
                mensaje = f"{instance.descripcion[:100]}..."
            elif instance.zona:
                titulo = f"Nuevo reporte en {instance.zona.nom}"
                mensaje = f"Tipo: {instance.get_tipo_display()}\nDescripción: {instance.descripcion[:200]}"
            else:
                titulo = f"Nuevo reporte ({instance.get_tipo_display()})"
                mensaje = f"{instance.descripcion[:100]}..."
            
            Notificacion.objects.create(
                usuario=usuario,
                tipo='reporte',
                titulo=titulo,
                mensaje=mensaje,
                relacion_reporte=instance,
                relacion_contenedor=instance.contenedor,
                relacion_zona=instance.zona
            )