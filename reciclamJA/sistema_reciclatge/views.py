import requests
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Material, ProductoReciclado, BolsaVirtual, Prize, PrizeRedemption
from .serializers import (
    CodigoBarrasSerializer, 
    ProductoRecicladoSerializer, 
    MaterialSerializer,
    BolsaVirtualSerializer,
    PrizeSerializer,
    PrizeRedemptionSerializer
)
from datetime import timedelta

def buscar_producto_openfoodfacts(codigo):
    """
    Busca información de un producto mediante su código de barras en la API de OpenFoodFacts.
    Retorna un diccionario con la información del producto o None si no se encuentra.
    """
    url = f"https://world.openfoodfacts.org/api/v0/product/{codigo}.json"
    
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        
        if data.get('status') == 1:  # Producto encontrado
            product = data.get('product', {})
            
            # Extraer información relevante
            return {
                'product_name': product.get('product_name') or product.get('product_name_es') or "Producte desconegut",
                'brands': product.get('brands', ''),
                'image_url': product.get('image_url', ''),
                'packaging': product.get('packaging', ''),
                'packaging_materials': product.get('packaging_materials', ''),
                'packaging_tags': product.get('packaging_tags', []),
                'categories': product.get('categories', ''),
                'categories_tags': product.get('categories_tags', []),
            }
        return None
    except Exception as e:
        print(f"Error al buscar producto en OpenFoodFacts: {e}")
        return None

def determinar_material_producto(producto_info):
    """
    Determina el material de un producto basado en su información de packaging.
    Retorna el objeto Material correspondiente o None si no se puede determinar.
    """
    if not producto_info:
        return None
    
    # Obtener todos los materiales disponibles
    materiales = Material.objects.all()
    
    # Diccionario de palabras clave para cada tipo de material
    keywords = {
        'plastico': ['plastic', 'pet', 'hdpe', 'ldpe', 'pp', 'ps', 'envase plástico', 'envase de plástico', 'plastic bottle', 'botella de plástico', 'plástico'],
        'papel': ['paper', 'cardboard', 'carton', 'cartón', 'papel', 'papier', 'karton', 'folding box', 'caja plegable'],
        'vidrio': ['glass', 'vidrio', 'cristal', 'vetro', 'glas'],
        'metal': ['metal', 'aluminium', 'aluminum', 'tin', 'steel', 'can', 'lata', 'aluminio', 'acero'],
        'organico': ['organic', 'compostable', 'biodegradable', 'food', 'orgánico'],
        'resto': ['mixed', 'other', 'varios']
    }
    
    # Extraer información de packaging
    packaging_text = producto_info.get('packaging', '').lower()
    packaging_materials = producto_info.get('packaging_materials', '').lower()
    packaging_tags = [tag.lower() for tag in producto_info.get('packaging_tags', [])]
    
    # Combinar todas las fuentes de información
    all_packaging_info = packaging_text + ' ' + packaging_materials + ' ' + ' '.join(packaging_tags)
    
    # Detectar el material más probable
    best_match = None
    max_matches = 0
    
    for material_type, keywords_list in keywords.items():
        matches = sum(1 for keyword in keywords_list if keyword in all_packaging_info)
        if matches > max_matches:
            max_matches = matches
            best_match = material_type
    
    # Si encontramos una coincidencia, normalizar el nombre y buscar el material correspondiente
    if best_match and max_matches > 0:
        normalized_material_name = normalize_material_name(best_match)
        try:
            # Buscar por nombre normalizado
            material = Material.objects.filter(nombre__iexact=normalized_material_name).first()
            if material:
                return material
        except Exception as e:
            print(f"Error al buscar material normalizado '{normalized_material_name}': {e}")
    
    # Por defecto, intentar asignar según categoría del producto
    categories = producto_info.get('categories', '').lower()
    categories_tags = [tag.lower() for tag in producto_info.get('categories_tags', [])]
    all_categories = categories + ' ' + ' '.join(categories_tags)
    
    # Si parece una bebida, probablemente sea vidrio o plástico
    if 'drink' in all_categories or 'bebida' in all_categories or 'water' in all_categories:
        try:
            # Usar el nombre normalizado
            plastic_name = normalize_material_name('plastico')
            return Material.objects.filter(nombre__iexact=plastic_name).first()
        except Exception as e:
            print(f"Error al buscar material plástico: {e}")
    
    # Si no se puede determinar, buscar plàstic (normalizado)
    try:
        plastic_name = normalize_material_name('plastico')
        material = Material.objects.filter(nombre__iexact=plastic_name).first()
        if material:
            return material
    except Exception as e:
        print(f"Error al buscar material plástico por defecto: {e}")
    
    # Si todo falla, devolver el primer material disponible
    return materiales.first() if materiales.exists() else None

# Add this material normalization mapping function
def normalize_material_name(material_name):
    """
    Normalize material names from different sources to the standardized names in our database.
    This handles variations in language (Spanish, Catalan) and formatting.
    """
    if not material_name:
        return None
        
    # Convert to lowercase for case-insensitive matching
    material_name = material_name.lower().strip()
    
    # Mapping from various names to our standardized database names
    material_mapping = {
        # Spanish to Catalan
        'plastico': 'plàstic',
        'plástico': 'plàstic',
        'papel': 'paper',
        'vidrio': 'vidre',
        'organico': 'orgànic',
        'orgánico': 'orgànic',
        'resto': 'rebuig',
        'metal': 'plàstic',  # Metal goes in plastic container
        
        # English to Catalan
        'plastic': 'plàstic',
        'paper': 'paper',
        'glass': 'vidre',
        'organic': 'orgànic',
        'waste': 'rebuig',
        'metal': 'plàstic',
        
        # Common variations
        'carton': 'paper',
        'cartón': 'paper',
        'cartró': 'paper',
        'metall': 'plàstic',
    }
    
    # Return the normalized name or the original if not found
    return material_mapping.get(material_name, material_name)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def escanear_codigo(request):
    serializer = CodigoBarrasSerializer(data=request.data)
    if serializer.is_valid():
        codigo = serializer.validated_data['codigo']
        bolsa_id = request.data.get('bolsa_id')  # ID opcional de bolsa para agregar directamente
        
        # Obtener el material directamente desde el request si se proporciona
        material_name = request.data.get('material')
        material = None
        
        # Si se proporcionó un material, normalizarlo y buscarlo
        if material_name:
            normalized_material_name = normalize_material_name(material_name)
            print(f"Material name from request: '{material_name}', normalized to: '{normalized_material_name}'")
            try:
                material = Material.objects.filter(nombre__iexact=normalized_material_name).first()
                if not material:
                    # Intentar buscar con caracteres especiales convertidos (à -> a, è -> e, etc.)
                    import unicodedata
                    simplified_name = ''.join(
                        c for c in unicodedata.normalize('NFD', normalized_material_name)
                        if unicodedata.category(c) != 'Mn'
                    )
                    material = Material.objects.filter(nombre__iexact=simplified_name).first()
                    
                if not material:
                    # Último intento: imprimir todos los materiales disponibles
                    all_materials = list(Material.objects.values_list('nombre', flat=True))
                    print(f"Material '{normalized_material_name}' not found. Available materials: {all_materials}")
                    return Response({
                        "error": f"Material '{material_name}' (normalizado a '{normalized_material_name}') no encontrado en la base de datos",
                        "available_materials": all_materials
                    }, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                print(f"Error buscando material '{normalized_material_name}': {str(e)}")
                return Response({
                    "error": f"Error al buscar el material '{material_name}'",
                    "detail": str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Buscar en la base de datos de productos reciclados
        producto_existente = ProductoReciclado.objects.filter(
            codigo_barras=codigo,
            usuario=request.user
        ).order_by('-fecha_reciclaje').first()
        
        # Comprobar si el producto existe y el tiempo transcurrido
        if producto_existente:
            tiempo_espera = timedelta(minutes=1)
            tiempo_actual = timezone.now()
            tiempo_minimo = producto_existente.fecha_reciclaje + tiempo_espera
            
            if tiempo_actual < tiempo_minimo:
                # Calcular tiempo restante en minutos y segundos
                tiempo_restante = tiempo_minimo - tiempo_actual
                minutos_restantes = int(tiempo_restante.total_seconds() // 60)
                segundos_restantes = int(tiempo_restante.total_seconds() % 60)
                
                return Response({
                    'error': 'Producte reciclat recentment',
                    'titulo': 'Espera un moment',
                    'tipo': 'cooldown',
                    'mensaje': f'Ja has reciclat aquest producte. Podràs reciclar-lo de nou en {minutos_restantes} minut(s) i {segundos_restantes} segon(s).',
                    'tiempo_restante': {
                        'minutos': minutos_restantes,
                        'segundos': segundos_restantes,
                        'total_segundos': int(tiempo_restante.total_seconds())
                    },
                    'fecha_disponible': tiempo_minimo
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Búsqueda en OpenFoodFacts
        producto_info = buscar_producto_openfoodfacts(codigo)
        
        # Si no se encuentra el producto, devolver error
        if not producto_info:
            return Response({
                'error': 'Producte no trobat',
                'mensaje': 'No s\'ha trobat el producte a la base de dades'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Si no se especificó material en la solicitud, determinarlo según el packaging
        if not material:
            material = determinar_material_producto(producto_info)
        
        if not material:
            return Response({
                'error': "No s'ha pogut determinar el material",
                'mensaje': "No s'ha pogut determinar el material del producte"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Después de determinar el material del producto, obtener las bolsas disponibles
        bolsas_disponibles = BolsaVirtual.objects.filter(
            usuario=request.user,
            tipo_material=material,
            reciclada=False
        )
        
        # Create product record
        producto_reciclado = ProductoReciclado.objects.create(
            usuario=request.user,
            codigo_barras=codigo,
            nombre_producto=producto_info.get('product_name', 'Producte desconegut'),
            material=material,
            marca=producto_info.get('brands', ''),
            puntos_obtenidos=material.puntos,
            imagen_url=producto_info.get('image_url', '')
        )
        
        # Si bolsa_id está en la solicitud, añadir el producto a esa bolsa
        bolsa = None
        if bolsa_id:
            try:
                bolsa = BolsaVirtual.objects.get(pk=bolsa_id, usuario=request.user, reciclada=False)
                
                # Check if material matches
                if bolsa.tipo_material == material:
                    producto_reciclado.bolsa = bolsa
                    producto_reciclado.save()
                    
                    # Update bag points
                    bolsa.puntos_totales = bolsa.calcular_puntos()
                    bolsa.save()
                else:
                    # Material doesn't match
                    bolsa = None
            except BolsaVirtual.DoesNotExist:
                bolsa = None
        
        return Response({
            'producto': ProductoRecicladoSerializer(producto_reciclado).data,
            'puntos_nuevos': material.puntos,
            'puntos_totales': request.user.score,
            'material': MaterialSerializer(material).data,
            'agregado_a_bolsa': bolsa is not None,
            'bolsa': BolsaVirtualSerializer(bolsa).data if bolsa else None,
            'bolsas_disponibles': BolsaVirtualSerializer(bolsas_disponibles, many=True).data
        }, status=status.HTTP_201_CREATED)
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def historial_reciclaje(request):
    """Obtiene el historial de productos reciclados por el usuario"""
    productos = ProductoReciclado.objects.filter(usuario=request.user).order_by('-fecha_reciclaje')
    serializer = ProductoRecicladoSerializer(productos, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def mis_bolsas(request):
    """Obtiene todas las bolsas virtuales del usuario"""
    bolsas = BolsaVirtual.objects.filter(usuario=request.user).order_by('-fecha_creacion')
    serializer = BolsaVirtualSerializer(bolsas, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def crear_bolsa(request):
    """Crea una nueva bolsa virtual"""
    serializer = BolsaVirtualSerializer(data=request.data)
    if serializer.is_valid():
        # Asignar usuario automáticamente
        bolsa = serializer.save(usuario=request.user)
        return Response(BolsaVirtualSerializer(bolsa).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def detalles_bolsa(request, pk):
    """Obtiene detalles de una bolsa incluyendo sus productos"""
    try:
        bolsa = BolsaVirtual.objects.get(pk=pk, usuario=request.user)
    except BolsaVirtual.DoesNotExist:
        return Response({"error": "Bossa no trobada"}, status=status.HTTP_404_NOT_FOUND)
    
    # Obtener productos en la bolsa
    productos = ProductoReciclado.objects.filter(bolsa=bolsa)
    
    return Response({
        "bolsa": BolsaVirtualSerializer(bolsa).data,
        "productos": ProductoRecicladoSerializer(productos, many=True).data
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def agregar_a_bolsa(request, producto_id):
    """Agrega un producto a una bolsa virtual"""
    try:
        producto = ProductoReciclado.objects.get(pk=producto_id, usuario=request.user)
    except ProductoReciclado.DoesNotExist:
        return Response({"error": "Producte no trobat"}, status=status.HTTP_404_NOT_FOUND)
    
    bolsa_id = request.data.get('bolsa_id')
    if not bolsa_id:
        return Response({"error": "Es requereix bolsa_id"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        bolsa = BolsaVirtual.objects.get(pk=bolsa_id, usuario=request.user)
        
        # Verificar que la bolsa no esté reciclada
        if bolsa.reciclada:
            return Response({"error": "No es pot afegir a una bossa ja reciclada"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar que el producto tenga el mismo material que la bolsa
        if producto.material != bolsa.tipo_material:
            return Response({
                "error": "El material del producte no coincideix amb el tipus de bossa",
                "producto_material": producto.material.nombre,
                "bolsa_material": bolsa.tipo_material.nombre
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Asignar producto a la bolsa
        producto.bolsa = bolsa
        producto.save()
        
        # Actualizar puntos de la bolsa
        bolsa.puntos_totales = bolsa.calcular_puntos()
        bolsa.save()
        
        return Response({
            "message": "Producte afegit a la bossa",
            "producto": ProductoRecicladoSerializer(producto).data,
            "bolsa": BolsaVirtualSerializer(bolsa).data
        })
        
    except BolsaVirtual.DoesNotExist:
        return Response({"error": "Bossa no trobada"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reciclar_bolsa(request, pk):
    """Recicla una bolsa virtual en un contenedor específico"""
    try:
        bolsa = BolsaVirtual.objects.get(pk=pk, usuario=request.user)
    except BolsaVirtual.DoesNotExist:
        return Response({"error": "Bossa no trobada"}, status=status.HTTP_404_NOT_FOUND)
    
    # Verificar que la bolsa no esté ya reciclada
    if bolsa.reciclada:
        return Response({"error": "Aquesta bossa ja ha estat reciclada"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Obtener el contenedor si se proporciona
    contenedor_id = request.data.get('contenedor_id')
    contenedor = None
    
    if contenedor_id:
        try:
            from zonesreciclatge.models import Contenedor
            contenedor = Contenedor.objects.get(pk=contenedor_id)
            
            # Verificar que el contenedor sea compatible con el tipo de material
            if contenedor.tipus.lower() != bolsa.tipo_material.nombre.lower():
                return Response({
                    "error": "El contenidor no és compatible amb el tipus de material",
                    "contenedor_tipo": contenedor.tipus,
                    "bolsa_material": bolsa.tipo_material.nombre
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Contenedor.DoesNotExist:
            return Response({"error": "Contenidor no trobat"}, status=status.HTTP_404_NOT_FOUND)
    
    # Reciclar la bolsa
    bolsa.reciclar(contenedor)
    
    # Crear notificación de éxito
    return Response({
        "message": "Bossa reciclada correctament",
        "bolsa": BolsaVirtualSerializer(bolsa).data,
        "puntos_obtenidos": bolsa.puntos_totales,
        "puntos_totales": request.user.score
    })

# Permisos para gestores y admins (movidos desde api.py)
class IsGestorAdminOrSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        # Verificar si el usuario está autenticado y tiene uno de los roles necesarios
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_gestor() or request.user.is_admin() or request.user.is_superadmin())
        )

# Premio API views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def lista_premios(request):
    """Obtiene la lista de premios disponibles"""
    queryset = Prize.objects.all()
    
    # Para usuarios normales, filtrar por activo y cantidad
    if not (request.user.is_gestor() or request.user.is_admin() or request.user.is_superadmin()):
        queryset = queryset.filter(activo=True, cantidad__gt=0)
    
    serializer = PrizeSerializer(queryset, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def detalle_premio(request, pk):
    """Obtiene los detalles de un premio específico"""
    try:
        premio = Prize.objects.get(pk=pk)
        
        # Si no es gestor/admin y el premio no está activo o disponible
        if (not (request.user.is_gestor() or request.user.is_admin() or request.user.is_superadmin()) and 
            (not premio.activo or premio.cantidad <= 0)):
            return Response({"error": "Premio no disponible"}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = PrizeSerializer(premio)
        return Response(serializer.data)
    except Prize.DoesNotExist:
        return Response({"error": "Premio no encontrado"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def crear_premio(request):
    """Crea un nuevo premio (solo para gestores/admins)"""
    if not (request.user.is_gestor() or request.user.is_admin() or request.user.is_superadmin()):
        return Response({"error": "No tienes permisos para crear premios"}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = PrizeSerializer(data=request.data)
    if serializer.is_valid():
        # Set the creado_por field to the current user
        user = request.user
        
        # If empresa is not explicitly set and user has an empresa, set it automatically
        if 'empresa' not in serializer.validated_data and user.empresa:
            serializer.save(creado_por=user, empresa=user.empresa)
        else:
            serializer.save(creado_por=user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def actualizar_premio(request, pk):
    """Actualiza un premio existente (solo para gestores/admins)"""
    if not (request.user.is_gestor() or request.user.is_admin() or request.user.is_superadmin()):
        return Response({"error": "No tienes permisos para actualizar premios"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        premio = Prize.objects.get(pk=pk)
        
        # Para updates parciales usar PATCH
        if request.method == 'PATCH':
            serializer = PrizeSerializer(premio, data=request.data, partial=True)
        else:
            serializer = PrizeSerializer(premio, data=request.data)
            
        if serializer.is_valid():
            # Regular users and gestors can only set their own empresa
            user = request.user
            if not (user.is_admin() or user.is_superadmin()):
                if 'empresa' in serializer.validated_data and serializer.validated_data['empresa'] != user.empresa:
                    serializer.validated_data['empresa'] = user.empresa
            
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Prize.DoesNotExist:
        return Response({"error": "Premio no encontrado"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def eliminar_premio(request, pk):
    """Elimina un premio (solo para gestores/admins)"""
    if not (request.user.is_gestor() or request.user.is_admin() or request.user.is_superadmin()):
        return Response({"error": "No tienes permisos para eliminar premios"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        premio = Prize.objects.get(pk=pk)
        premio.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Prize.DoesNotExist:
        return Response({"error": "Premio no encontrado"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def canjear_premio(request, pk):
    """Canjea un premio por puntos"""
    try:
        premio = Prize.objects.get(pk=pk)
        user = request.user
        
        # Check if the prize is available
        if not premio.is_available:
            return Response(
                {"error": "Aquest premi no està disponible actualment"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user has enough points
        if user.score < premio.puntos_costo:
            return Response(
                {"error": f"No tens prou punts. Necessites {premio.puntos_costo} punts."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create redemption
        redemption = PrizeRedemption.objects.create(
            usuario=user,
            premio=premio,
            puntos_gastados=premio.puntos_costo
        )
        
        return Response(
            PrizeRedemptionSerializer(redemption).data,
            status=status.HTTP_201_CREATED
        )
    except Prize.DoesNotExist:
        return Response({"error": "Premio no encontrado"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def lista_redenciones(request):
    """Obtiene la lista de redenciones de premios"""
    user = request.user
    
    # If admin/gestor/superadmin, show all if requested
    if user.is_gestor() or user.is_admin() or user.is_superadmin():
        # For company managers, filter by their company's prizes
        if 'all' in request.query_params and (user.is_admin() or user.is_superadmin()):
            queryset = PrizeRedemption.objects.all()
        elif user.empresa:
            queryset = PrizeRedemption.objects.filter(premio__empresa=user.empresa)
        else:
            queryset = PrizeRedemption.objects.none()
    else:
        # Regular users only see their own redemptions
        queryset = PrizeRedemption.objects.filter(usuario=user)
    
    serializer = PrizeRedemptionSerializer(queryset, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def detalle_redencion(request, pk):
    """Obtiene detalles de una redención específica"""
    user = request.user
    
    try:
        # Determine if the user can access this redemption
        if user.is_admin() or user.is_superadmin():
            redencion = PrizeRedemption.objects.get(pk=pk)
        elif user.is_gestor() and user.empresa:
            redencion = PrizeRedemption.objects.get(pk=pk, premio__empresa=user.empresa)
        else:
            redencion = PrizeRedemption.objects.get(pk=pk, usuario=user)
            
        serializer = PrizeRedemptionSerializer(redencion)
        return Response(serializer.data)
    except PrizeRedemption.DoesNotExist:
        return Response({"error": "Redención no encontrada"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def actualizar_estado_redencion(request, pk):
    """Actualiza el estado de una redención (solo gestores/admins)"""
    user = request.user
    
    # Verificar que el usuario tiene permisos para actualizar estados
    if not (user.is_gestor() or user.is_admin() or user.is_superadmin()):
        return Response(
            {"error": "No tens permisos per actualitzar l'estat d'una redempció"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Obtener la redención según los permisos del usuario
        if user.is_admin() or user.is_superadmin():
            # Los admins pueden actualizar cualquier redención
            redencion = PrizeRedemption.objects.get(pk=pk)
        elif user.is_gestor() and user.empresa:
            # Los gestores solo pueden actualizar redenciones de premios de su empresa
            redencion = PrizeRedemption.objects.get(pk=pk, premio__empresa=user.empresa)
        else:
            return Response(
                {"error": "No tens permisos per actualitzar aquesta redempció"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validar el nuevo estado
        nuevo_estado = request.data.get('estado')
        if nuevo_estado not in dict(PrizeRedemption.ESTADO_CHOICES).keys():
            return Response(
                {"error": f"Estat '{nuevo_estado}' no vàlid"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar el estado y notas si se proporcionan
        redencion.estado = nuevo_estado
        if 'notas' in request.data:
            redencion.notas = request.data['notas']
        
        redencion.save()
        
        # Si se cancela la redención, devolver puntos al usuario
        if nuevo_estado == 'cancelado' and redencion.estado != 'cancelado':
            # Devolver puntos al usuario
            redencion.usuario.score += redencion.puntos_gastados
            redencion.usuario.save(update_fields=['score'])
            
            # Incrementar cantidad de premio disponible
            redencion.premio.cantidad += 1
            redencion.premio.save(update_fields=['cantidad'])
            
            # Crear notificación para el usuario
            from zonesreciclatge.models import Notificacion
            Notificacion.objects.create(
                usuario=redencion.usuario,
                tipo='premi',
                titulo=f'Redempció cancel·lada: {redencion.premio.nombre}',
                mensaje=f'La teva sol·licitud del premi "{redencion.premio.nombre}" ha estat cancel·lada.\n\nMotiu: {redencion.notas or "No s\'ha especificat cap motiu"}\n\nEls {redencion.puntos_gastados} punts han estat retornats al teu compte.'
            )
        
        # Crear notificación para el usuario cuando se cambia a procesando o entregado
        if nuevo_estado in ['procesando', 'entregado']:
            from zonesreciclatge.models import Notificacion
            
            if nuevo_estado == 'procesando':
                titulo = f'Premi en procés: {redencion.premio.nombre}'
                mensaje = f'La teva sol·licitud del premi "{redencion.premio.nombre}" està sent processada.\n\n{redencion.notas or ""}'
            else:  # entregado
                titulo = f'Premi lliurat: {redencion.premio.nombre}'
                mensaje = f'El teu premi "{redencion.premio.nombre}" ha estat marcat com a lliurat.\n\n{redencion.notas or ""}'
            
            Notificacion.objects.create(
                usuario=redencion.usuario,
                tipo='premi',
                titulo=titulo,
                mensaje=mensaje
            )
        
        return Response(PrizeRedemptionSerializer(redencion).data)
            
    except PrizeRedemption.DoesNotExist:
        return Response({"error": "Redempció no trobada"}, status=status.HTTP_404_NOT_FOUND)
