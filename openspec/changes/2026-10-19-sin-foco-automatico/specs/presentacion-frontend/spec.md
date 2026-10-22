# Spec Delta

## ADDED Requirements

### Requirement: El foco de la aplicación cambia por interacción explícita, no automáticamente

La aplicación SHALL NOT transferir programáticamente el foco al montar una página, resolver un fragmento, mostrar un error de formulario, abrir un composer de respuesta o completar una publicación. SHALL conservar el scroll y la navegación por fragmentos actuales, y SHALL mantener visibles sus destinos bajo la cabecera sticky sin enfocar automáticamente el encabezado, sección o comentario de destino. SHALL conservar el orden de tabulación, los roles, anuncios accesibles, errores, borradores y comportamiento funcional existente. Los estilos `:focus-visible` SHALL seguir indicando la navegación real por teclado. Esta regla SHALL NOT suprimir el autoenfoque accesible, el confinamiento ni la restauración de foco que los primitivos Radix de Dialog, Sheet y DropdownMenu gestionan al abrirse y cerrarse.

#### Scenario: Entrada a una página editorial
- **WHEN** una persona abre o cambia a una página editorial con o sin fragmento en la URL
- **THEN** se conserva el scroll inicial o el desplazamiento al destino existente, el contenido de destino queda visible bajo la cabecera y la aplicación no transfiere el foco al H1 ni al destino del fragmento

#### Scenario: Error en autenticación o apertura de respuesta
- **WHEN** un formulario de ingresar/registro muestra un error, o se activa Responder para abrir un composer
- **THEN** se conservan el error, sus asociaciones, anuncios, valores y borradores, el área correspondiente se muestra sin una transferencia automática de foco y el foco no se envía al resumen ni automáticamente al textarea

#### Scenario: Publicación de un comentario
- **WHEN** una publicación se confirma correctamente y la interfaz conserva o cierra el composer según su comportamiento actual
- **THEN** se conserva el anuncio accesible del resultado y la publicación aceptada, sin transferir programáticamente el foco al párrafo de anuncio ni a otro elemento

#### Scenario: Gestión de foco de primitivos Radix
- **WHEN** una persona abre o cierra un Dialog, Sheet o DropdownMenu implementado con los primitivos Radix
- **THEN** se conserva su gestión accesible propia de foco, incluido el enfoque inicial, el confinamiento cuando corresponde y la restauración al control que lo abrió

#### Scenario: Indicador de foco visible
- **WHEN** una persona navega mediante teclado y mueve el foco a controles interactivos
- **THEN** los estilos y contrastes `:focus-visible` existentes siguen siendo visibles y la navegación no depende de transferencias automáticas de foco
