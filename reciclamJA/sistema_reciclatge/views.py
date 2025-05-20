import requests
import os
from django.utils import timezone
from django.db.models import Sum
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Material, ProductoReciclado
from .serializers import MaterialSerializer, ProductoRecicladoSerializer, CodigoBarrasSerializer

# Función auxiliar para determinar el material basado en la categoría o descripción del producto
def determinar_material(producto_info):
    # Lista de palabras clave para cada material
    materiales_keywords = {
        'plastico': ['plastic', 'plástico', 'pet', 'hdpe', 'pvc', 'ldpe', 'pp', 'ps', 'botella de plástico', 'bottle'],
        'papel': ['paper', 'papel', 'cardboard', 'cartón', 'cartó', 'periódico', 'revista', 'newspaper', 'journal'],
        'vidrio': ['glass', 'vidrio', 'botella de vidrio', 'frasco de vidrio', 'beer', 'cervesa', 'cerveza'],
        'metal': ['metal', 'aluminio', 'aluminum', 'lata', 'can', 'tin', 'steel', 'coca-cola', 'coca cola', 'soda'],
        'organico': ['organic', 'orgánico', 'food', 'comida', 'fruta', 'verdura', 'vegetal'],
        'resto': ['mixed', 'mixto', 'resto', 'other', 'otro']
    }
    
    # Códigos EAN conocidos para demostración/testing
    codigos_conocidos = {
        # Añadir unos códigos de ejemplo garantizados
        '8480000160164': 'plastico',  # Agua Font Vella
        '8414533043847': 'papel',     # Diario El País
        '8410057320202': 'vidrio',    # Cerveza Estrella
        '8410188012096': 'metal',     # Lata Coca-Cola
        # Puedes añadir más códigos conocidos aquí
    }
    
    # Comprobar si es un código conocido para demostración
    barcode = producto_info.get('code', '')
    if barcode in codigos_conocidos:
        try:
            print(f"⭐ Código conocido detectado: {barcode}, material: {codigos_conocidos[barcode]}")
            return Material.objects.get(nombre__iexact=codigos_conocidos[barcode])
        except Material.DoesNotExist:
            print(f"❌ Material {codigos_conocidos[barcode]} no encontrado en la base de datos")
            pass
    
    # Categorías del producto que vienen de la API
    categorias = producto_info.get('categories', '').lower()
    nombre = producto_info.get('product_name', '').lower()
    ingredientes = producto_info.get('ingredients_text', '').lower()
    packaging = producto_info.get('packaging', '').lower()
    
    texto_completo = f"{categorias} {nombre} {ingredientes} {packaging}"
    print(f"📝 Texto analizado: {texto_completo[:100]}...")
    
    # Buscar el material basado en palabras clave
    for material, keywords in materiales_keywords.items():
        for keyword in keywords:
            if keyword in texto_completo:
                try:
                    print(f"✅ Material detectado: {material}, keyword: {keyword}")
                    return Material.objects.get(nombre__iexact=material)
                except Material.DoesNotExist:
                    print(f"⚠️ Material {material} no encontrado en la base de datos")
                    continue
    
    # Si no se encuentra ninguna coincidencia, devolver material por defecto (resto)
    try:
        return Material.objects.get(nombre__iexact='resto')
    except Material.DoesNotExist:
        # Si no existe ni siquiera el material "resto", crear un error genérico
        print("❌ No se pudo determinar ningún material, incluso 'resto' no existe en la base de datos")
        return None

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def escanear_codigo(request):
    serializer = CodigoBarrasSerializer(data=request.data)
    if serializer.is_valid():
        codigo = serializer.validated_data['codigo']
        
        # Comprobar si el producto ya ha sido escaneado en las últimas 24 horas
        producto_existente = ProductoReciclado.objects.filter(
            usuario=request.user,
            codigo_barras=codigo,
            fecha_reciclaje__gte=timezone.now() - timezone.timedelta(hours=24)
        ).first()
        
        if producto_existente:
            return Response({
                'error': 'Ja has reciclat aquest producte en les últimes 24 hores',
                'producto': ProductoRecicladoSerializer(producto_existente).data
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Primero comprobar si es un código conocido para demostración
        codigos_conocidos = {
            '8480000160164': ('plastico', 'Agua Font Vella'),  # Agua Font Vella
            '8414533043847': ('papel', 'Diario El País'),     # Diario El País
            '8410057320202': ('vidrio', 'Cerveza Estrella'),    # Cerveza Estrella
            '8410188012096': ('metal', 'Lata Coca-Cola'),     # Lata Coca-Cola
        }
        
        if codigo in codigos_conocidos:
            try:
                material_nombre, producto_nombre = codigos_conocidos[codigo]
                material = Material.objects.get(nombre__iexact=material_nombre)
                
                # Crear registro de producto reciclado
                producto_reciclado = ProductoReciclado.objects.create(
                    usuario=request.user,
                    codigo_barras=codigo,
                    nombre_producto=producto_nombre,
                    material=material,
                    marca='Demo',
                    puntos_obtenidos=material.puntos,
                    imagen_url=''
                )
                
                # Actualizar puntos del usuario
                request.user.score += material.puntos
                request.user.save(update_fields=['score'])
                
                return Response({
                    'producto': ProductoRecicladoSerializer(producto_reciclado).data,
                    'puntos_nuevos': material.puntos,
                    'puntos_totales': request.user.score,
                    'material': MaterialSerializer(material).data
                }, status=status.HTTP_201_CREATED)
                
            except Material.DoesNotExist:
                # Si el material no existe, continuamos con el flujo normal
                pass
        
        # Si no es un código conocido, consultar la API de Open Food Facts
        api_url = f"https://world.openfoodfacts.org/api/v0/product/{codigo}.json"
        try:
            response = requests.get(api_url, timeout=10)
            data = response.json()
            
            if data.get('status') == 0:
                return Response({
                    'error': 'Producte no trobat',
                    'message': 'No s\'ha trobat informació sobre aquest producte'
                }, status=status.HTTP_404_NOT_FOUND)
            
            producto_info = data.get('product', {})
            material = determinar_material(producto_info)
            
            if not material:
                return Response({
                    'error': 'No s\'ha pogut determinar el material',
                    'message': 'No s\'ha pogut classificar aquest producte. Si us plau, prova amb un altre.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Crear registro de producto reciclado
            producto_reciclado = ProductoReciclado.objects.create(
                usuario=request.user,
                codigo_barras=codigo,
                nombre_producto=producto_info.get('product_name', 'Producte desconegut'),
                material=material,
                marca=producto_info.get('brands', ''),
                puntos_obtenidos=material.puntos,
                imagen_url=producto_info.get('image_url', '')
            )
            
            # Actualizar puntos del usuario
            request.user.score += material.puntos
            request.user.save(update_fields=['score'])
            
            return Response({
                'producto': ProductoRecicladoSerializer(producto_reciclado).data,
                'puntos_nuevos': material.puntos,
                'puntos_totales': request.user.score,
                'material': MaterialSerializer(material).data
            }, status=status.HTTP_201_CREATED)
            
        except requests.RequestException as e:
            return Response({
                'error': 'Error de connexió',
                'message': f'No s\'ha pogut connectar amb l\'API externa: {str(e)}'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def historial_reciclaje(request):
    productos = ProductoReciclado.objects.filter(usuario=request.user)
    serializer = ProductoRecicladoSerializer(productos, many=True)
    
    # Calcular estadísticas
    total_puntos = productos.aggregate(Sum('puntos_obtenidos'))['puntos_obtenidos__sum'] or 0
    productos_por_material = {}
    
    for producto in productos:
        if producto.material:
            material_nombre = producto.material.nombre
            if material_nombre in productos_por_material:
                productos_por_material[material_nombre] += 1
            else:
                productos_por_material[material_nombre] = 1
    
    return Response({
        'productos': serializer.data,
        'estadisticas': {
            'total_puntos': total_puntos,
            'total_productos': productos.count(),
            'por_material': productos_por_material
        }
    })

# Add this test view at the end of the file
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  # No authentication required for testing
def test_view(request):
    """Simple test view to verify routing is working."""
    return Response({
        'message': 'Test endpoint is working!',
        'method': request.method,
        'received_data': request.data if request.method == 'POST' else None
    })
