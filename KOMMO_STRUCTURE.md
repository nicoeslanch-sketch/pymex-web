# Kommo CRM Structure

Source: Kommo API for account `36669295` on subdomain `nicolasadsveris`.

Do not store API tokens in this file. Use Vercel environment variables or a local ignored env file for secrets.

## Pipelines And Statuses

### Embudo de ventas

- Pipeline ID: `14019227`
- Main pipeline: `true`
- Archived: `false`

| Status | ID | Sort | Type | Color | Editable |
| --- | ---: | ---: | ---: | --- | --- |
| Leads Entrantes | `108206915` | 10 | 1 | `#c1c1c1` | false |
| Contactado | `108206919` | 20 | 0 | `#98cbff` | true |
| Servicio asignado | `108238043` | 30 | 0 | `#87f2c0` | true |
| Pedido completado | `142` | 10000 | 0 | `#CCFF66` | false |
| Pedido abandonado | `143` | 11000 | 0 | `#D5D8DB` | false |

### Embudo planillas

- Pipeline ID: `14023387`
- Main pipeline: `false`
- Archived: `false`

| Status | ID | Sort | Type | Color | Editable |
| --- | ---: | ---: | ---: | --- | --- |
| Leads Entrantes | `108238127` | 10 | 1 | `#c1c1c1` | false |
| Contacto planilla | `108238131` | 20 | 0 | `#fffeb2` | true |
| Levantamiento planilla | `108238135` | 30 | 0 | `#fffeb2` | true |
| Propuesta planilla | `108238139` | 40 | 0 | `#fffeb2` | true |
| Logrado con exito | `142` | 10000 | 0 | `#CCFF66` | false |
| Ventas Perdidos | `143` | 11000 | 0 | `#D5D8DB` | false |

### Embudo Paginas web

- Pipeline ID: `14023535`
- Main pipeline: `false`
- Archived: `false`

| Status | ID | Sort | Type | Color | Editable |
| --- | ---: | ---: | ---: | --- | --- |
| Leads Entrantes | `108239223` | 10 | 1 | `#c1c1c1` | false |
| Contacto web | `108239227` | 20 | 0 | `#fffeb2` | true |
| Brief sitio web | `108239231` | 30 | 0 | `#fffeb2` | true |
| Propuesta web | `108239235` | 40 | 0 | `#fffeb2` | true |
| Logrado con exito | `142` | 10000 | 0 | `#CCFF66` | false |
| Ventas Perdidos | `143` | 11000 | 0 | `#D5D8DB` | false |

### Embudo Procesos

- Pipeline ID: `14023539`
- Main pipeline: `false`
- Archived: `false`

| Status | ID | Sort | Type | Color | Editable |
| --- | ---: | ---: | ---: | --- | --- |
| Leads Entrantes | `108239239` | 10 | 1 | `#c1c1c1` | false |
| Contacto procesos | `108239243` | 20 | 0 | `#fffeb2` | true |
| Diagnostico operativo | `108239247` | 30 | 0 | `#fffeb2` | true |
| Propuesta de mejora | `108239251` | 40 | 0 | `#fffeb2` | true |
| Cotizacion procesos | `108246983` | 50 | 0 | `#fffeb2` | true |
| Logrado con exito | `142` | 10000 | 0 | `#CCFF66` | false |
| Ventas Perdidos | `143` | 11000 | 0 | `#D5D8DB` | false |

### Embudo plataforma

- Pipeline ID: `14023551`
- Main pipeline: `false`
- Archived: `false`

| Status | ID | Sort | Type | Color | Editable |
| --- | ---: | ---: | ---: | --- | --- |
| Leads Entrantes | `108239307` | 10 | 1 | `#c1c1c1` | false |
| Contacto plataforma | `108239311` | 20 | 0 | `#fffeb2` | true |
| Levantamiento datos | `108239315` | 30 | 0 | `#fffeb2` | true |
| Propuesta dashboard | `108239319` | 40 | 0 | `#fffeb2` | true |
| Logrado con exito | `142` | 10000 | 0 | `#CCFF66` | false |
| Ventas Perdidos | `143` | 11000 | 0 | `#D5D8DB` | false |

## Lead Custom Fields

| Field | ID | Type | Code | Group | API only | Predefined |
| --- | ---: | --- | --- | --- | --- | --- |
| utm_content | `510326` | tracking_data | `UTM_CONTENT` | statistic | true | true |
| utm_medium | `510328` | tracking_data | `UTM_MEDIUM` | statistic | true | true |
| utm_campaign | `510330` | tracking_data | `UTM_CAMPAIGN` | statistic | true | true |
| utm_source | `510332` | tracking_data | `UTM_SOURCE` | statistic | true | true |
| utm_term | `510334` | tracking_data | `UTM_TERM` | statistic | true | true |
| utm_referrer | `510336` | tracking_data | `UTM_REFERRER` | statistic | true | true |
| referrer | `510338` | tracking_data | `REFERRER` | statistic | true | true |
| gclientid | `510340` | tracking_data | `GCLIENTID` | statistic | true | true |
| gclid | `510342` | tracking_data | `GCLID` | statistic | true | true |
| fbclid | `510344` | tracking_data | `FBCLID` | statistic | true | true |
| ttad_id | `510366` | tracking_data | `TIKTOK_AD_ID_TD` | statistic | true | false |
| ttad_name | `510368` | tracking_data | `TIKTOK_AD_NAME_TD` | statistic | true | false |

## Users

| User | ID | Role ID | Admin | Active |
| --- | ---: | --- | --- | --- |
| Nicolas | `15498319` | null | true | true |
| Vicente Valderrama | `15501679` | null | true | true |

## Tags

| Tag | ID | Color |
| --- | ---: | --- |
| Planillas | `22508` | null |
| Paginas web | `22510` | null |
| Procesos | `22512` | null |
| Plataforma | `22514` | null |
| Multiples Servicios | `22516` | null |
| Lead Frio | `22518` | null |
| Lead Tibio | `22520` | null |
| Lead Caliente | `22522` | null |
| Propuesta Enviada | `22524` | null |
| Cotizacion enviada | `22526` | null |
| En Negociacion | `22528` | null |
| Cerrado - Ganado | `22530` | null |
| Cerrado - Perdido | `22532` | null |

## Implementation Notes

- For new website leads, use the operational first-contact status IDs, not the incoming `Leads Entrantes` status IDs.
- Current service routing:
  - Planilla Excel Personalizada: pipeline `14023387`, status `108238131`, tag `22508`.
  - Pagina Web: pipeline `14023535`, status `108239227`, tag `22510`.
  - Optimizacion de Procesos: pipeline `14023539`, status `108239243`, tag `22512`.
  - Plataforma de Analisis: pipeline `14023551`, status `108239311`, tag `22514`.
- Closed statuses `142` and `143` are shared across pipelines.
- Web integration assigns service tags automatically when creating a lead.
- Kommo allowed renaming editable statuses through `PATCH /api/v4/leads/pipelines/{pipeline_id}/statuses/{status_id}`. It rejected color-only updates with HTTP 400, and name updates returned editable statuses with color `#fffeb2`.
- `Embudo de ventas` was not modified.
