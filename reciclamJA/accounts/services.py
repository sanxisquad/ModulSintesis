from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import time  # Añadimos la importación del módulo time

def enviar_correo_credenciales(username, nombre, email, password, apellidos=None):
    """
    Envia un correu amb les credencials en crear un usuari nou.
    """
    # Print debugging info
    print(f"\n[EMAIL DEBUG] Sending credentials email to: {email}")
    print(f"[EMAIL DEBUG] Username: {username}, Name: {nombre}")
    
    try:
        from django.conf import settings
        from django.core.mail import EmailMultiAlternatives
        from django.utils.html import strip_tags
        
        subject = "Usuari creat - ReciclamJA"
        
        # HTML content with inline styles
        html_content = f"""
        <html>
        <head>
            <title>Usuari creat a ReciclamJA</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    text-align: center;
                    padding: 20px 0;
                    border-bottom: 1px solid #eaeaea;
                }}
                .logo {{
                    font-size: 26px;
                    font-weight: bold;
                    color: #4CAF50;
                    text-decoration: none;
                }}
                .content {{
                    padding: 30px 20px;
                    text-align: left;
                }}
                .content p {{
                    margin-bottom: 15px;
                    font-size: 16px;
                }}
                .credentials {{
                    background-color: #f8f8f8;
                    padding: 15px;
                    border-radius: 4px;
                    margin: 20px 0;
                    border-left: 4px solid #4CAF50;
                }}
                .credentials p {{
                    margin: 10px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    color: #777;
                    font-size: 14px;
                    border-top: 1px solid #eaeaea;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #4CAF50;
                    color: white !important;
                    text-decoration: none;
                    border-radius: 4px;
                    font-weight: bold;
                    margin: 15px 0;
                    text-align: center;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }}
                .button:hover {{
                    background-color: #45a049;
                }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <div class='logo'>ReciclamJA</div>
                    <p style="margin-top: 5px; color: #666;">Plataforma de gestió de reciclatge</p>
                </div>
                <div class='content'>
                    <h2 style="color: #333; margin-bottom: 20px;">Benvingut/da a ReciclamJA!</h2>
                    <p>Hola <strong>{nombre} {apellidos or ''}</strong>,</p>
                    <p>El teu compte ha estat creat amb èxit. Ara pots accedir a la plataforma utilitzant les següents credencials:</p>
                    
                    <div class="credentials">
                        <p><strong>Usuari:</strong> {username}</p>
                        <p><strong>Contrasenya:</strong> {password}</p>
                        <p><strong>Correu:</strong> {email}</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="{settings.FRONTEND_URL}/login" class='button'>Accedir a ReciclamJA</a>
                    </div>
                    
                    <p>Si tens alguna pregunta, no dubtis en contactar amb nosaltres.</p>
                </div>
                <div class='footer'>
                    <p>ReciclamJA © {time.strftime('%Y')} - Tots els drets reservats</p>
                    <p style="margin-top: 5px; font-size: 12px;">Aquest és un correu automàtic, si us plau no responguis.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Verificar que FRONTEND_URL esté definido
        if not hasattr(settings, 'FRONTEND_URL') or not settings.FRONTEND_URL:
            print("[EMAIL DEBUG] ERROR: FRONTEND_URL no está definido en settings.py")
            settings.FRONTEND_URL = "http://localhost:5173"  # Valor por defecto
            print(f"[EMAIL DEBUG] Usando valor por defecto: {settings.FRONTEND_URL}")
            
        # Verificar que DEFAULT_FROM_EMAIL esté definido
        if not hasattr(settings, 'DEFAULT_FROM_EMAIL') or not settings.DEFAULT_FROM_EMAIL:
            print("[EMAIL DEBUG] ERROR: DEFAULT_FROM_EMAIL no está definido en settings.py")
            settings.DEFAULT_FROM_EMAIL = "noreply@reciclamja.com"  # Valor por defecto
            print(f"[EMAIL DEBUG] Usando valor por defecto: {settings.DEFAULT_FROM_EMAIL}")
        
        msg = EmailMultiAlternatives(
            subject=subject,
            body=strip_tags(html_content),  # Plain text fallback
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email]
        )
        msg.attach_alternative(html_content, "text/html")
        sent = msg.send()
        
        print(f"[EMAIL DEBUG] Email de credenciales enviado correctamente: {sent}")
        return sent
    except Exception as e:
        print(f"[EMAIL DEBUG] ERROR enviando email de credenciales: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False

def enviar_correo_reset_password(email, reset_url):
    """
    Envia un correu per restablir la contrasenya.
    """
    import uuid
    import time
    
    unique_id = f"{uuid.uuid4()}-{int(time.time())}"
    reset_url = f"{reset_url}?rid={unique_id}"
    
    subject = "Recuperació de contrasenya - ReciclamJA"
    
    html_content = f"""
    <html>
    <head>
        <title>Recuperació de contrasenya - ReciclamJA</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                text-align: center;
                padding: 20px 0;
                border-bottom: 1px solid #eaeaea;
            }}
            .logo {{
                font-size: 26px;
                font-weight: bold;
                color: #4CAF50;
                text-decoration: none;
            }}
            .content {{
                padding: 30px 20px;
                text-align: left;
            }}
            .content p {{
                margin-bottom: 20px;
                font-size: 16px;
            }}
            .button {{
                display: inline-block;
                padding: 12px 24px;
                background-color: #4CAF50;
                color: white !important;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                margin-top: 15px;
                margin-bottom: 15px;
                text-align: center;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }}
            .button:hover {{
                background-color: #45a049;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                color: #777;
                font-size: 14px;
                border-top: 1px solid #eaeaea;
            }}
            .note {{
                background-color: #f8f8f8;
                padding: 15px;
                border-radius: 4px;
                font-size: 14px;
                color: #666;
                margin-top: 25px;
            }}
            .expiry {{
                color: #e74c3c;
                font-weight: bold;
            }}
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <div class='logo'>ReciclamJA</div>
                <p style="margin-top: 5px; color: #666;">Plataforma de gestió de reciclatge</p>
            </div>
            <div class='content'>
                <h2 style="color: #333; margin-bottom: 20px;">Recuperació de contrasenya</h2>
                <p>Hola,</p>
                <p>Has sol·licitat restablir la teva contrasenya a ReciclamJA.</p>
                <p>Fes clic al següent botó per crear una nova contrasenya:</p>
                
                <div style="text-align: center;">
                    <a href='{reset_url}' class='button'>Restablir la meva contrasenya</a>
                </div>
                
                <p>Si no has sol·licitat aquest canvi, pots ignorar aquest correu.</p>
                
                <div class='note'>
                    <p style="margin: 0 0 10px 0;"><strong>Important:</strong></p>
                    <p style="margin: 0;">Aquest enllaç caducarà en <span class='expiry'>7 dies</span>.</p>
                    <p style="margin: 10px 0 0 0;">Per motius de seguretat, no comparteixis aquest correu amb ningú.</p>
                </div>
            </div>
            <div class='footer'>
                <p>ReciclamJA © {time.strftime('%Y')} - Tots els drets reservats</p>
                <p style="margin-top: 5px; font-size: 12px;">Aquest és un correu automàtic, si us plau no responguis.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Print debugging info
    print(f"\n[EMAIL DEBUG] Sending password reset email to: {email}")
    print(f"[EMAIL DEBUG] Reset URL: {reset_url}")
    
    try:
        from django.conf import settings
        from django.core.mail import EmailMultiAlternatives
        from django.utils.html import strip_tags
        
        msg = EmailMultiAlternatives(
            subject=subject,
            body=strip_tags(html_content),  # Plain text fallback
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email]
        )
        msg.attach_alternative(html_content, "text/html")
        sent = msg.send()
        
        print(f"[EMAIL DEBUG] Email sent successfully: {sent}")
        return sent
    except Exception as e:
        print(f"[EMAIL DEBUG] ERROR sending email: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False
