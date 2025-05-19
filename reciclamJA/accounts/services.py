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
    subject = "Recuperació de contrasenya - ReciclamJA"
    
    html_content = f"""
    <html>
    <head>
        <title>Recuperació de contrasenya - ReciclamJA</title>
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
            .button {{
                display: inline-block;
                padding: 10px 20px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
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
                <p>Hola,</p>
                <p>Has sol·licitat restablir la teva contrasenya a ReciclamJA.</p>
                <p>Fes clic al següent enllaç per crear una nova contrasenya:</p>
                <p><a href='{reset_url}' class='button'>Restablir contrasenya</a></p>
                <p>Si no has sol·licitat aquest canvi, pots ignorar aquest correu.</p>
                <p>Aquest enllaç caducarà en 24 hores.</p>
                <p>Gràcies</p>
            </div>
            <div class='footer'>
                <p>ReciclamJA - Tots els drets reservats</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    msg = EmailMultiAlternatives(
        subject=subject,
        body=strip_tags(html_content),  # Plain text fallback
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email]
    )
    msg.attach_alternative(html_content, "text/html")
    return msg.send()
