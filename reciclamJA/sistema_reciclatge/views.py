import requests
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Material, ProductoReciclado, BolsaVirtual
from .serializers import (
    CodigoBarrasSerializer, 
    ProductoRecicladoSerializer, 
    MaterialSerializer,
    BolsaVirtualSerializer
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
    
    # Si encontramos una coincidencia, buscar el material correspondiente
    if best_match and max_matches > 0:
        try:
            return Material.objects.get(nombre__iexact=best_match)
        except Material.DoesNotExist:
            print(f"Material '{best_match}' no encontrado en la base de datos")
            pass
    
    # Por defecto, intentar asignar según categoría del producto
    categories = producto_info.get('categories', '').lower()
    categories_tags = [tag.lower() for tag in producto_info.get('categories_tags', [])]
    all_categories = categories + ' ' + ' '.join(categories_tags)
    
    # Si parece una bebida, probablemente sea vidrio o plástico
    if 'drink' in all_categories or 'bebida' in all_categories or 'water' in all_categories:
        try:
            return Material.objects.get(nombre__iexact='plastico')
        except Material.DoesNotExist:
            pass
    
    # Si no se puede determinar, devolver el material más común (plástico)
    try:
        return Material.objects.filter(nombre__iexact='plastico').first()
    except:
        # Si todo falla, devolver el primer material disponible
        return materiales.first() if materiales.exists() else None

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def escanear_codigo(request):
    serializer = CodigoBarrasSerializer(data=request.data)
    if serializer.is_valid():
        codigo = serializer.validated_data['codigo']
        bolsa_id = request.data.get('bolsa_id')  # ID opcional de bolsa para agregar directamente
        
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
                    'error': 'Producto reciclado recientemente',
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
                'error': 'Producto no encontrado',
                'mensaje': 'No se ha encontrado el producto en la base de datos'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Determinar el material según el packaging
        material = determinar_material_producto(producto_info)
        
        if not material:
            return Response({
                'error': "No s'ha pogut determinar el material",
                'mensaje': "No se ha podido determinar el material del producto"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener bolsas disponibles del mismo material
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
        
        # If a bag ID was provided, try to add the product to that bag
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
                    # Material doesn't match, don't add to bag
                    bolsa = None
            except BolsaVirtual.DoesNotExist:
                bolsa = None
        
        # Update user points only if not added to a bag
        if not bolsa:
            request.user.score += material.puntos
            request.user.save(update_fields=['score'])
        
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
