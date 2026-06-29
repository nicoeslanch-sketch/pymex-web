# Kommo Email Templates

These templates support the automatic `Contactado` webhook and can also be copied into Kommo as manual email templates for the `Tema` selector in the email composer.

Kommo API endpoints tested for email templates returned `404`, so native `Tema` dropdown templates must be created inside Kommo's interface. The repo keeps the exact subjects, bodies and PDF mapping here so they can be copied consistently.

## Manual Setup In Kommo

Create one email template per service in Kommo's email composer/templates area:

| Template | Pipeline | Subject | PDF |
| --- | --- | --- | --- |
| `Excel_Personalizada` | Planillas | `Tu Sistema de Medicion a Medida` | `pdfs/ADS_Veris_Planillas_Excel.pdf` |
| `Pagina_Web` | Paginas web | `Tu Pagina Web Profesional desde $39.990` | `pdfs/ADS_Veris_Paginas_Web.pdf` |
| `Opt_Procesos` | Procesos | `Tus Procesos, Optimizados` | `pdfs/ADS_Veris_Procesos.pdf` |
| `Plataforma_Analisis` | Plataforma | `Tu Analista de Datos Inteligente` | `pdfs/ADS_Veris_Plataforma_Analisis.pdf` |

The first three PDFs exist in `pdfs/`. The platform PDF is referenced but is not currently present in the repo.

## Excel Personalizada

Subject: `Tu Sistema de Medicion a Medida`

```text
Hola {{lead_name}},

Gracias por interesarte en nuestra Plantilla Personalizada.

Cansado de hojas de Excel desorganizadas?
Nosotros disenamos la tuya desde cero.

En una reunion de 1 hora definimos:
- Que KPIs realmente importan en tu negocio
- Como automatizar los calculos
- Que reportes necesitas para tomar decisiones

El resultado: una plantilla unica, hecha para ti.
Con formulas automaticas, dashboards visuales y 30 dias de soporte.

Adjunto: ADS_Veris_Planillas_Excel.pdf

Disponibilidad: lunes a viernes 10:00-18:00 CLT

Agendamos?

Team ADS Veris
servicios@adsveris.com
```

## Pagina Web

Subject: `Tu Pagina Web Profesional desde $39.990`

```text
Hola {{lead_name}},

Recibimos tu interes en una pagina web.

Sin complicaciones. Sin sorpresas. Sin esperas.

Nuestras paginas web para PyMEs incluyen:
- Diseno responsive: movil, desktop y tablet
- Formularios de contacto integrados
- SEO basico incluido
- Dominio y hosting 1 ano incluidos
- Chat con WhatsApp integrado

Desde: $39.990, antes $55.000
Entrega: 7 a 10 dias

Adjunto: ADS_Veris_Paginas_Web.pdf

Hablamos de tu proyecto?

Team ADS Veris
servicios@adsveris.com
```

## Optimizacion De Procesos

Subject: `Tus Procesos, Optimizados`

```text
Hola {{lead_name}},

Los procesos ineficientes cuestan dinero.

Analizamos tus flujos actuales y te entregamos:
- Diagnostico de cuellos de botella
- Diagrama de procesos mejorado, listo para implementar
- Plan de accion paso a paso
- Seguimiento por 60 dias

El tiempo invertido de tu lado suele ser 2 a 3 horas.
El retorno: procesos mas rapidos, menos errores y mas claridad operativa.

Adjunto: ADS_Veris_Procesos.pdf

Datos utiles:
- Duracion estimada: 2 a 4 semanas de implementacion
- Costo: inversion unica, sin suscripcion
- Resultado: procesos documentados y automatizados

Conversamos?

Team ADS Veris
servicios@adsveris.com
```

## Plataforma De Analisis

Subject: `Tu Analista de Datos Inteligente`

```text
Hola {{lead_name}},

Contratar un analista de datos cuesta caro.
Nosotros tenemos una alternativa mas simple para empezar.

Nuestra plataforma te permite:
- Subir tu Excel sin moverte de tu PC
- Limpieza automatica de datos
- Dashboards con tus KPIs reales
- Chat con IA que interpreta tus datos
- Recomendaciones automaticas segun tus numeros

Ejemplo: Producto X no vende, considera sacarlo de circulacion.
Ejemplo: exceso de efectivo detectado, reinvierte en una linea con mejor retorno.

Acceso: https://pymex-web.vercel.app

Adjunto sugerido: ADS_Veris_Plataforma_Analisis.pdf

Preguntas? Responde este correo y te ayudamos.

Team ADS Veris
servicios@adsveris.com
```

## Automation Notes

- Automatic email endpoint: `api/kommo-contactados-webhook.js`.
- Trigger status name in Kommo: `Contactado`.
- Trigger status IDs:
  - Planillas: `108238131`
  - Paginas web: `108239227`
  - Procesos: `108239243`
  - Plataforma: `108239311`
- SendGrid is used for automatic email delivery.
- If SendGrid rejects the send, the webhook writes a fallback note into the lead with the manual template.
