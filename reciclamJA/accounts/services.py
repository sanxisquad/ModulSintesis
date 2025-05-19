from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def enviar_correo_credenciales(nombre, email, password, apellidos=None):
    """
    Envia un correu amb les credencials en crear un usuari nou.
    """
    subject = "Usuari creat - ReciclamJA"
    
    # HTML content with inline styles
    html_content = f"""
    <html>
    <head>
        <title>Usuari creat a ReciclamJA</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                width: 80%;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 10px;
                background-color: #f9f9f9;
            }}
            .header {{
                text-align: center;
                margin-bottom: 20px;
            }}
            .content {{
                text-align: left;
            }}
            .content p {{
                margin-bottom: 20px;
            }}
            .footer {{
                text-align: center;
                margin-top: 20px;
                font-size: 0.9em;
                color: #777;
            }}
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>ReciclamJA</h1>
            </div>
            <div class='content'>
                <p>Hola <strong>{nombre} {apellidos or ''}</strong>,</p>
                <p>S'ha creat el teu usuari a ReciclamJA.</p>
                <p>Les teves dades d'accés són:</p>
                <p>Usuari: {email}</p>
                <p>Contrasenya: {password}</p>
                
                <p>Gràcies</p>
            </div>
            <div class='footer'>
                <p>ReciclamJA - Tots els drets reservats</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Create email with HTML content
    msg = EmailMultiAlternatives(
        subject=subject,
        body=strip_tags(html_content),  # Plain text fallback
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email]
    )
    msg.attach_alternative(html_content, "text/html")
    return msg.send()

def enviar_correo_reset_password(email, reset_url):
    """
    Envia un correu per restablir la contrasenya.
    """
    import uuid
    import time
    
    # Generate a unique identifier for this reset request (prevents accumulation)
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
