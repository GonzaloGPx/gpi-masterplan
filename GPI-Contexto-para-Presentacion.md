# GPI — Contexto Completo para Armar una Presentación

> Documento de traspaso para un agente (Claude Code en VS Code) que tiene acceso al código y a la app de GPI, y necesita el contexto humano, estratégico y de negocio que NO está en el código para armar una presentación del proyecto.

---

## CÓMO USAR ESTE DOCUMENTO

Vos (agente) tenés delante el código y la app de GPI. Podés ver QUÉ se construyó. Lo que este documento te da es el POR QUÉ: la historia, la familia detrás, la visión, el modelo de negocio, la estrategia de venta y de salida. Combiná lo que ves en el código/app con este contexto para armar una presentación que tenga alma, no solo features.

**Tarea típica que te van a pedir**: armar una presentación de GPI (para inversores, para design partners, para asesores, o para la propia familia). Usá este documento como fuente de verdad del relato, y el código/app como fuente de verdad de las capacidades reales.

---

## 1. QUÉ ES GPI (EN UNA FRASE)

GPI (Gomez Pizarro Intelligence) es el sistema operativo AI-native del asesor financiero independiente en LATAM: una sola plataforma, potenciada por IA, donde el asesor resuelve el ~90% de su trabajo diario y le da a sus clientes un servicio de primer nivel. Filosofía central: **el agente IA propone, el asesor dispone. Siempre.**

---

## 2. LA HISTORIA Y LA FAMILIA (el corazón del proyecto)

GPI es un **proyecto familiar**. Lo lidera Gonzalo Gomez Pizarro (el padre) junto a tres de sus cinco hijos. No es una startup más: es un capítulo de vida que Gonzalo enmarca con la metáfora del "segundo tiempo".

### El relato emocional central

Gonzalo tuvo una carrera larga: "9 empresas, 9 mudanzas". Llegó a un buen lugar profesional (asesor de inversiones, accionista minoritario de un broker). Pero entiende esta etapa como un segundo tiempo, más reflexivo y espiritual, y quiere jugarlo acompañado. La frase que define el proyecto:

> "El primer tiempo lo jugué solo. Este lo quiero jugar con ustedes."

Y el marco de propósito, más allá del negocio:

> "Lo que viene tiene que valer la pena por sí mismo, no por lo que demuestra."

GPI no es solo construir un negocio. Es: construir algo que perdure, generar empleo, cumplir un sueño compartido en familia, y dejar huella. Esas cuatro dimensiones (Construir / Generar empleo / Cumplir un sueño compartido / Dejar huella) son el "para qué" del proyecto y deberían estar presentes en cualquier presentación dirigida a la familia o que cuente la génesis.

### El equipo (la familia)

| Persona | Rol | Iniciales en registros |
|---------|-----|------------------------|
| **Gonzalo (Papá)** | Estrategia, capital, cliente cero. Domino del negocio, red, MBA. El que más horas le pone. Programa con asistencia de IA. | P |
| **Gonzalo Jr.** | Hijo mayor. Perfil ingeniería en sistemas / tech. | G |
| **Martín** | Hijo. Economía. Producto, research, controles, frontend. | M |
| **Tomás** | Hijo. Matemáticas aplicadas / desarrollo. Backend, integraciones, bot. | T |

Los otros dos hijos de Gonzalo (son cinco en total) no están en el proyecto. **Regla importante: nunca inventar nombres de los hijos. Los tres del proyecto son Gonzalo (h.), Martín y Tomás.**

Gonzalo está casado con Silvia (26+ años). Es católico practicante, activo en el movimiento Schoenstatt. Vive en Mendiolaza, Córdoba, Argentina.

### El rol de Gonzalo en el proyecto

Estrategia + capital + cliente cero. NO operativo full-time en el sentido tradicional, aunque es el que más horas carga. Su frase: "Yo más en la estrategia y como inversor principal". Es el dominio expert: sabe de finanzas argentinas como pocos, y es el cliente cero perfecto del producto (lo usa todos los días en su práctica real).

---

## 3. EL PROBLEMA QUE RESUELVE

El asesor financiero independiente en LATAM pierde ~70% de su tiempo en tareas administrativas que no escalan: armar informes mensuales por cliente, preparar reuniones, comunicar novedades de mercado, seguir cupones/vencimientos/dividendos, pasar órdenes, tomar notas de calls, redactar follow-ups, no olvidarse de nadie. Es tiempo que no factura mejor, no escala, y no le mejora la vida al cliente.

Hoy en LATAM las opciones son: Excel + ChatGPT (sin integración), brokers tecnológicos (Inviu, IOL, Cocos — plataforma básica sin IA), o Bloomberg Terminal (USD 24k/año, prohibitivo). Hay un gap brutal entre "Excel + ChatGPT" y "Bloomberg". GPI llena ese gap.

---

## 4. LA PROPUESTA DE VALOR Y LOS MÓDULOS

Una sola plataforma. El 90% del trabajo del asesor, resuelto. Módulos integrados con un agente IA que ve todo. El asesor decide siempre.

**Estructura del producto (referencia — verificar contra la app real, que evoluciona):**

- **Dashboard** — vista del día priorizada por el agente.
- **Novedades** — de clientes (cupones, transferencias, saldos) y de mercado, filtradas por relevancia para los clientes de cada asesor.
- **Agenda** — calendario + tareas del día auto-actualizadas.
- **Cliente 360** — módulo abarcativo del cliente individual. Sub-secciones: KYC, Posiciones, Movimientos, Gráficos, Análisis, Informes, **Conversation Center** (brief + historial de conversaciones + follow-ups), WhatsApp.
- **Practice Intelligence** — vista agregada del libro de clientes: Segmentación, Oportunidades, Campañas, Clientes por Especie, Métricas Clientes, Contactos. (Pareto por monto operado, por fees, por cantidad de operaciones; clientes inactivos/hiperactivos/en riesgo.)
- **Mercados** — indicadores e índices clave (resumen ejecutivo, no plataforma de precios).
- **Herramientas** — Calculadoras (flujo de fondos renta fija), Tablas (MEP histórico, Cedears, Teléfonos WA, Clientes), Asociados, Feed Chat Bot, Feedback, Novedades plataforma, Usuarios, Especies, Catálogos, Cuentas con Alertas, Integraciones.
- **Chatbot GPI** — ver sección dedicada abajo.

**NOTA**: la estructura del menú creció respecto a la visión original. La app real es la fuente de verdad de qué existe; este documento da el sentido de cada módulo.

### El Chatbot GPI (importante para la presentación — es un diferenciador)

Un solo motor con **dos caras** y control de acceso por rol:

- **Cara productor (asesor)**: asistente operativo con herramientas/skills. Acceso a TODAS sus cuentas. Funciona como acceso conversacional/móvil a la plataforma cuando no la tiene abierta. Ej: en una reunión sin la plataforma abierta, pide "pasame el informe de rentabilidad del cliente tal" y el bot se lo trae. Además, toda interacción de sus clientes con el bot le llega como feedback en la plataforma.
- **Cara cliente final**: informa y deriva, **NUNCA asesora** (escudo regulatorio CNV). Acceso solo a su propia cuenta. GPI es invisible: el bot se presenta como "el asistente de [nombre del asesor]", no como GPI (white-label de facto). Cada asesor lo presenta como propio.

Reglas de seguridad (críticas, mencionar si la presentación es técnica): auth fuerte antes de cualquier dato; permisos por request contra el data model jerárquico; skills del productor deshabilitadas para el cliente final a nivel sistema (no a nivel prompt, por riesgo de prompt injection).

---

## 5. PÚBLICO OBJETIVO

- **Primario**: asesor financiero independiente ("productor") registrado en CNV, con cartera propia, perfil percentil 60-90 de sofisticación. Operan con IBKR + brokers locales. Argentina al inicio, LATAM después.
- **Secundario (etapas posteriores)**: boutiques de 2-15 asesores, family offices chicos, portfolio managers.
- **Universo**: ~5.000 asesores en CNV Argentina; +50.000 en LATAM.

---

## 6. MODELO DE NEGOCIO

SaaS, suscripción mensual por asesor, tres tiers:

| Tier | Precio | Audiencia |
|------|--------|-----------|
| Starter | USD 200-300/mes | Asesor independiente (hasta 50 clientes) |
| Pro | USD 500-1.500/mes | Boutique 2-5 asesores (hasta 250 clientes) |
| Enterprise | USD 2.000-5.000/mes | Broker / family office (ilimitado) |

Filosofía de pricing: modular y acumulativo.

**Proyecciones**: 200 asesores en 18 meses = USD 720k ARR; 500 = USD 1.8M ARR; cierre etapa Tronco (jun 2027) = USD 700k-1.2M; cierre Árbol (jun 2028) = USD 3-5M.

---

## 7. DIFERENCIAL COMPETITIVO (MOAT)

1. **Conocimiento de instrumentos LATAM**: Lecap, Boncap, Bopreal, AL30, GD30, CEDEARs, FX bands, MEP/CCL. El producto piensa nativamente en estos instrumentos.
2. **Integración con brokers locales**: IBKR, Argentina Valores (Gonzalo es accionista minoritario), IOL, Cocos.
3. **Compliance regulatorio**: CNV, UIF, AFIP/ARCA.
4. **Red y credibilidad**: Gonzalo es del club. Un asesor le compra software a alguien que entiende su mundo.

---

## 8. EL PAISAJE COMPETITIVO (para contextualizar la presentación)

En **USA** el espacio está caliente y consolidando: Jump, Zocks, Zeplyn, Addepar. Todos corriendo a ser el "AI Operating System" del asesor.

- **Jump**: Serie B, "AI Operating System", 3 tiers (Meet/Grow/Operate), clientes Allianz/Prudential/LPL.
- **Zocks**: USD 65M (Lightspeed, QED), "privacy-first AI", no graba (transcribe live), soporta español, MCP server, 5.000 firmas. **El competidor más peligroso** y el target de exit (ver abajo).
- **Zeplyn**: USD 3M seed, "agentic AI for wealth", Agent Nexus, ex-Google founders.
- **Addepar**: wealth tech tradicional con IA encima (no AI-native).

En **LATAM**: el espacio está virgen. Cero productos AI-native para asesores en español rioplatense con instrumentos locales. Inviu (de Galicia/GGAL) NO es competidor directo: es broker tecnológico con plataforma básica sin IA — incluso podría ser canal de distribución.

**Insight clave**: en USA no hay que evangelizar la categoría (ya existe "AI Operating System"); en LATAM solo hay que localizarla. Ventana cómoda pero no eterna (Zocks ya soporta español y tiene QED, especialista LATAM fintech, en su cap table).

---

## 9. ESTRATEGIA DE SALIDA (EXIT) — manejar con cuidado en presentaciones

Hay una tesis de exit a **Zocks** (o Jump): construir GPI compatible arquitectónicamente para que un comprador estratégico pueda integrarlo fácil. Múltiplos esperables 8-15x ARR; salida potencial USD 16-30M en USD 2M ARR. Aunesa (proveedor de BackOffice argentino) como comprador local alternativo.

Frase de Gonzalo: "Era un chiste, no tan chiste. Es bueno ir pensando todo compatible para considerar esta salida como alternativa."

**ADVERTENCIA para presentaciones**: el exit NO se menciona en presentaciones a los hijos hasta que estén plenamente comprometidos — puede interpretarse como "el plan real es vender" y desinflar el compromiso. En presentaciones a inversores, sí es relevante. Adaptar según audiencia.

---

## 10. POSICIONAMIENTO Y PITCHES (para la presentación de venta)

### Pitch maestro (una frase)
"GPI es el sistema operativo del asesor financiero independiente: una sola plataforma, potenciada por IA, donde resolvés el 90% de tu trabajo diario y le das a tus clientes un servicio de primer nivel."

### Tagline (tres segundos)
"Todo tu trabajo de asesor, en un solo lugar, potenciado por IA."

### Elevator pitch (30 segundos)
"¿Cuánto tiempo perdés por semana saltando entre Excel, WhatsApp, el homebroker y mil planillas? GPI junta todo eso en una sola plataforma: las carteras de tus clientes, las novedades que les importan, los informes listos para mandar, y un asistente de IA que te prepara las reuniones, redacta tus seguimientos y te dice qué necesita cada cliente hoy. Vos decidís, GPI ejecuta. Y está pensado para LATAM, con los instrumentos que usás de verdad: Lecap, bonos, CEDEARs. La idea es simple: que vuelvas a dedicar tu tiempo a asesorar, no a tareas administrativas."

### Tres principios que guían todo pitch
1. **Vender tiempo recuperado, no features.** El dolor es el tiempo administrativo perdido; la promesa es recuperarlo para asesorar.
2. **"Vos decidís, GPI ejecuta" siempre presente.** La regla de diseño convertida en argumento de venta: control + sin miedo a ser reemplazado.
3. **LATAM y los instrumentos locales son el cierre, no el titular.** El titular es el valor universal; el localismo es la prueba de que entendés su mundo (el moat como argumento).

---

## 11. ROADMAP (las 4 etapas)

Metáfora orgánica: Semilla → Brote → Tronco → Árbol.

| Etapa | Período | Foco | Target |
|-------|---------|------|--------|
| Semilla | May-Jul 2026 | Núcleo del producto | 90% productores de Argentina Valores |
| Brote | Ago-Dic 2026 | Mercado + IA portfolio + mobile | 85% agentes con Aunesa (BackOffice) |
| Tronco | Ene-Jun 2027 | Producto final, multi-BackOffice | 80% agentes Argentina |
| Árbol | Jul 2027-Jun 2028 | Expansión LATAM | 30% asesores LATAM |

---

## 12. ARQUITECTURA TÉCNICA (referencia para entender el código)

- **Backend**: Python.
- **Frontend**: Next.js / React.
- **Base de datos**: Postgres (vía Neon).
- **Cloud**: AWS o GCP.
- **IA**: LLMs vía API (Anthropic), arquitectura multi-agent.
- **Patrones clave**: API-first; multi-tenant; **data model jerárquico Organization → User (Advisor) → Client → Holdings** (desde día 1, para soportar Practice Intelligence multi-asesor sin reescribir); adapter pattern para integraciones con proveedores de BackOffice (Aunesa es 1 de 4 en Argentina; el primer adapter, interfaz genérica).
- **Integraciones presentes/en desarrollo** (ver código real): bot de WhatsApp (PDF, audios, búsqueda web, multi-cuenta), informe de rentabilidad, auth module, login/usuarios, análisis de rentabilidad y posiciones, gráfico histórico, KYC, Conversation Center, Agenda, distribución de cartera, movimientos, importar/exportar MEP, precios Rofex, cartera externa, deploy de front y backend.
- **Decisiones de diseño**: privacy-first (no se graba audio de meetings, se transcribe en vivo y se descarta); MCP Server para que el asesor conecte su propia IA externa a su data en GPI (filosofía no walled garden); mobile app planificada desde la etapa Brote.

**Estado**: hay producto en beta deployado. ~434 horas de desarrollo acumuladas (ene-jun 2026). El proyecto arrancó en enero 2026.

---

## 13. CONTEXTO DEL USUARIO (Gonzalo) — para tono y estilo de la presentación

- Directo, casual, le gusta el ida y vuelta, aprecia la honestidad brutal por sobre la propaganda.
- Concreto sobre abstracto: datos, números, ejemplos.
- Prefiere prosa con estructura mínima, sin formato excesivo.
- Cuando hay opciones, quiere recomendación clara, no "depende".
- Valora que se le señalen riesgos que no había considerado.
- La dimensión emocional/familiar/espiritual es central — no es decoración, es el motor. Una presentación de GPI que ignore esto pierde el alma del proyecto.

---

## 14. NOTAS PARA ARMAR LA PRESENTACIÓN

- **Adaptá a la audiencia**: inversores (énfasis en mercado, moat, exit, proyecciones), design partners/asesores (énfasis en dolor resuelto, demo, tiempo recuperado), familia (énfasis en propósito, segundo tiempo, las 4 dimensiones del "para qué").
- **Hay un deck previo "GPI Vision v3"** (17 slides, paleta navy + dorado + cream, logo GPI monograma). Si existe en los archivos del proyecto, úsalo como base estética y de estructura. Su recorrido: portada → de qué se trata → problema → por qué ahora → estado del mundo → la visión → un día con el sistema → moat → equipo → roadmap → modelo económico → el trato → compensación → tu decisión honesta → y si no sale → segundo tiempo → próximos pasos.
- **Citas potentes disponibles** (de Gonzalo y del proyecto): "El primer tiempo lo jugué solo. Este lo quiero jugar con ustedes." / "No te quiero vender. Te quiero mostrar." / "No hay respuesta correcta. Hay tu respuesta correcta." / "Si va, va con todo. Si no va, va con honor." / "El peor escenario realista no es 'perdimos dos años'. Es 'pasamos dos años haciendo lo más educativo que se puede hacer a esta edad'."
- **No inventar**: nombres de los hijos más allá de Gonzalo (h.), Martín y Tomás; cifras que no estén acá o en el código; features que no existan en la app. Si falta un dato, marcarlo como pendiente en lugar de inventarlo.
- **Verificá contra la app real**: la estructura de módulos de la sección 4 puede estar desactualizada respecto a lo que efectivamente está construido. El código y la app navegada son la fuente de verdad de las capacidades; este documento es la fuente de verdad del relato y la estrategia.

---

**Fecha**: junio 2026
**Origen**: traspaso desde el chat de Claude.ai donde se gestó la visión, estrategia y posicionamiento de GPI.
**Para**: agente Claude Code en VS Code con acceso al código y la app, encargado de armar una presentación del proyecto.
