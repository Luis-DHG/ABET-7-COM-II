# Módulos editoriales Specification

## Purpose

Siete módulos de contenido estático y secuencial que estructuran la divulgación de ISAC y las redes perceptivas 6G. La primera versión entrega estructura, navegación y espacios reservados; el contenido editorial definitivo se incorpora únicamente a partir de texto aprobado.

## Requirements

### Requirement: Navegación secuencial de los siete módulos
El sistema SHALL exponer siete rutas editoriales en orden fijo: `/planeacion`, `/analisis`, `/tendencias`, `/mini-caso`, `/divulgacion`, `/bitacora` y `/glosario`. Los enlaces anterior/siguiente SHALL recorrer únicamente ese conjunto.

#### Scenario: Recorrido completo
- **WHEN** un visitante avanza con el enlace siguiente desde `/planeacion`
- **THEN** recorre los siete módulos en orden y termina en `/glosario`

#### Scenario: El foro queda fuera del recorrido
- **WHEN** el visitante llega al último módulo
- **THEN** la navegación anterior/siguiente no enlaza al foro ni a secciones ajenas a los siete módulos

### Requirement: La raíz redirige al primer módulo
La ruta `/` SHALL redirigir a `/planeacion`.

#### Scenario: Entrada por la raíz
- **WHEN** un visitante abre `/`
- **THEN** termina en `/planeacion`

### Requirement: Contenido reservado hasta aprobación
Cada módulo SHALL mantener layout, navegación, estados y espacios reservados. El contenido editorial SHALL incorporarse solo a partir de texto aprobado.

#### Scenario: Módulo sin contenido aprobado
- **WHEN** un módulo carece de texto aprobado
- **THEN** la página muestra su estructura con espacios reservados, sin contenido editorial inventado

### Requirement: El mini-caso evalúa el trade-off OFDM-DFRC
El módulo mini-caso SHALL centrarse en la evaluación del trade-off de la forma de onda OFDM-DFRC (opción A de la guía de estructura).

#### Scenario: Enfoque técnico del mini-caso
- **WHEN** un visitante abre `/mini-caso`
- **THEN** el material gira sobre la evaluación del trade-off en OFDM-DFRC
