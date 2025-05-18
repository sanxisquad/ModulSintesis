from django.core.management.base import BaseCommand
from django.db.models import Count, Max
from django.utils import timezone
from datetime import timedelta
from accounts.models import CustomUser
from zonesreciclatge.models import ReporteContenedor

class Command(BaseCommand):
    help = 'Sincroniza los contadores de tickets rechazados con la base de datos y verifica inactividad'

    def handle(self, *args, **options):
        usuarios = CustomUser.objects.all()
        total = usuarios.count()
        actualizados = 0
        inactivos_reset = 0
        
        self.stdout.write(f"Sincronizando contadores para {total} usuarios...")
        
        for usuario in usuarios:
            # Buscar fecha del último ticket rechazado
            ultimo_rechazado = ReporteContenedor.objects.filter(
                usuario=usuario,
                estado='rechazado'
            ).aggregate(ultimo=Max('fecha_resolucion'))['ultimo']
            
            if ultimo_rechazado:
                usuario.ultimo_ticket_rechazado = ultimo_rechazado
                
                # Verificar si han pasado 6 meses desde el último rechazo
                seis_meses = timezone.now() - timedelta(days=180)
                if ultimo_rechazado < seis_meses:
                    self.stdout.write(self.style.WARNING(
                        f"Usuario {usuario.username} inactivo durante más de 6 meses. Reseteando contador."
                    ))
                    usuario.tickets_rechazados_acumulados = 0
                    inactivos_reset += 1
                else:
                    # Contar tickets rechazados recientes (últimos 6 meses)
                    tickets_rechazados = ReporteContenedor.objects.filter(
                        usuario=usuario,
                        estado='rechazado',
                        fecha_resolucion__gt=seis_meses
                    ).count()
                    
                    # Calcular el residuo después de las penalizaciones (módulo 5)
                    tickets_acumulados = tickets_rechazados % 5
                    
                    # Si el contador actual es diferente, actualizarlo
                    if usuario.tickets_rechazados_acumulados != tickets_acumulados:
                        usuario.tickets_rechazados_acumulados = tickets_acumulados
                        actualizados += 1
            else:
                # No tiene tickets rechazados
                usuario.tickets_rechazados_acumulados = 0
                if usuario.tickets_rechazados_acumulados != 0:
                    actualizados += 1
            
            usuario.save()
                
        self.stdout.write(self.style.SUCCESS(
            f"Sincronización completada. {actualizados} usuarios actualizados. "
            f"{inactivos_reset} usuarios reseteados por inactividad."
        ))
