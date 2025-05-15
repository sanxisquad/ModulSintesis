from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Q
from .models import Notificacion, ReporteContenedor, ComentarioReporte
from accounts.models import CustomUser

@receiver(post_save, sender=ReporteContenedor)
def notificar_nuevo_reporte(sender, instance, created, **kwargs):
    # Existing notification for new reports
    if created and instance.empresa:
        # Notificar a usuarios de la empresa excepto al creador
        usuarios = CustomUser.objects.filter(
            Q(empresa=instance.empresa) & 
            ~Q(id=instance.usuario.id if instance.usuario else 0)
        )
        
        for usuario in usuarios:
            # Mejorar los títulos y mensajes para gestores y admins
            if usuario.is_admin() or usuario.is_gestor():
                if instance.contenedor:
                    titulo = f"Nou tiquet: {instance.get_tipo_display()}"
                    mensaje = f"S'ha creat un nou tiquet per a {instance.get_tipo_display()}. Descripció: {instance.descripcion[:100]}..."
                elif instance.zona:
                    titulo = f"Nou tiquet a {instance.zona.nom}"
                    mensaje = f"S'ha creat un nou tiquet per a {instance.get_tipo_display()} a la zona {instance.zona.nom}. Descripció: {instance.descripcion[:100]}..."
                else:
                    titulo = f"Nou tiquet: {instance.get_tipo_display()}"
                    mensaje = f"S'ha creat un nou tiquet. Descripció: {instance.descripcion[:100]}..."
            else:
                # Para usuarios normales
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
    
    # New notification for status changes (not created)
    elif not created and instance.usuario:
        # Check if status field changed
        old_instance = sender.objects.get(pk=instance.pk)
        if old_instance.estado != instance.estado:
            # Notify the ticket creator about status change
            estado_traducido = {
                'abierto': 'Obert',
                'en_proceso': 'En procés',
                'resuelto': 'Resolt',
                'rechazado': 'Rebutjat'
            }.get(instance.estado, instance.estado)
            
            titulo = f"Tiquet #{instance.id} - Canvi d'estat"
            mensaje = f"El teu tiquet ha canviat a l'estat: {estado_traducido}"
            
            if instance.estado == 'resuelto':
                mensaje += "\nEl teu problema ha estat resolt!"
                if instance.comentario_cierre:
                    mensaje += f"\nComentari: {instance.comentario_cierre}"
            
            elif instance.estado == 'rechazado':
                mensaje += "\nEl teu tiquet ha estat rebutjat."
                if instance.comentario_cierre:
                    mensaje += f"\nMotiu: {instance.comentario_cierre}"
                    
            elif instance.estado == 'en_proceso':
                mensaje += "\nUn gestor està treballant en el teu problema."
            
            Notificacion.objects.create(
                usuario=instance.usuario,
                tipo='reporte',
                titulo=titulo,
                mensaje=mensaje,
                relacion_reporte=instance,
                relacion_contenedor=instance.contenedor,
                relacion_zona=instance.zona
            )


@receiver(post_save, sender=ComentarioReporte)
def notificar_nuevo_comentario(sender, instance, created, **kwargs):
    """Notificar cuando se crea un comentario en un reporte"""
    if created and instance.reporte:
        # Get the report object
        reporte = instance.reporte
        notified_users = set()  # To avoid duplicate notifications
        
        # 1. Notify the ticket creator if they aren't the comment author
        if reporte.usuario and reporte.usuario != instance.usuario:
            Notificacion.objects.create(
                usuario=reporte.usuario,
                tipo='reporte',
                titulo=f"Nou comentari en tiquet #{reporte.id}",
                mensaje=f"{instance.texto[:100]}...",
                relacion_reporte=reporte
            )
            notified_users.add(reporte.usuario.id)
        
        # 2. Notify company admins and managers except the comment author
        if reporte.empresa:
            # Fix: Get company staff based on user methods instead of role field
            company_staff = CustomUser.objects.filter(empresa=reporte.empresa)
            
            for staff_user in company_staff:
                # Skip if already notified or if they're the comment author
                if (staff_user.id in notified_users or 
                    staff_user == instance.usuario):
                    continue
                
                # Only notify admins and managers
                if not (staff_user.is_admin() or staff_user.is_gestor()):
                    continue
                    
                Notificacion.objects.create(
                    usuario=staff_user,
                    tipo='reporte',
                    titulo=f"Nou comentari en tiquet #{reporte.id}",
                    mensaje=f"Comentari nou: {instance.texto[:100]}...",
                    relacion_reporte=reporte
                )
                notified_users.add(staff_user.id)