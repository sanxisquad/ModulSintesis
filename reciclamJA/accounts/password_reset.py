from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser
from .services import enviar_correo_reset_password

class RequestPasswordResetView(APIView):
    """
    View to request a password reset. Sends an email with a token.
    """
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'El correu electrònic és obligatori'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            print(f"\n[DEBUG] Password reset requested for: {email}")
            user = CustomUser.objects.get(email=email)
            
            # Generate token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Build reset URL (frontend URL)
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
            print(f"[DEBUG] Generated reset URL: {reset_url}")
            
            # Send email using our service
            email_sent = enviar_correo_reset_password(email, reset_url)
            
            print(f"[DEBUG] Email sending result: {email_sent}")
            
            return Response({
                'message': "S'ha enviat un correu per recuperar la contrasenya",
                'email_sent': email_sent,
                'email': email  # Only include in development
            }, status=status.HTTP_200_OK)
            
        except CustomUser.DoesNotExist:
            print(f"[DEBUG] User with email {email} not found")
            # For security reasons, don't reveal that the user doesn't exist
            return Response({
                'message': "S'ha enviat un correu per recuperar la contrasenya (si existeix)",
                'email_sent': False,
                'email_exists': False  # Only include in development
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"[DEBUG] Unexpected error in password reset: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return Response({
                'error': "Hi ha hagut un error en processar la sol·licitud",
                'detail': str(e)  # Only include in development
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyTokenView(APIView):
    """
    View to verify if the token is valid.
    """
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
            
            if default_token_generator.check_token(user, token):
                return Response({'valid': True}, status=status.HTTP_200_OK)
            else:
                return Response({'valid': False, 'message': 'Token inválido o caducado'}, 
                               status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({'valid': False, 'message': 'ID de usuario inválido'}, 
                           status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    """
    View to reset the password using the token.
    """
    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not all([uidb64, token, new_password]):
            return Response({'error': 'Todos los campos son requeridos'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
            
            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({'message': 'Contraseña actualizada correctamente'}, 
                               status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Token inválido o caducado'}, 
                               status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({'error': 'ID de usuario inválido'}, 
                           status=status.HTTP_400_BAD_REQUEST)
