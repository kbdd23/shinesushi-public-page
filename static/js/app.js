/* Arranque: carga los modulos que la pagina necesite. */

import { iniciarEstado } from "./estado.js";
import { iniciarSucursales } from "./sucursal.js";
import { iniciarDetalleSucursal } from "./detalle_sucursal.js";
import { iniciarNavMovil } from "./nav.js";
import { iniciarPromociones } from "./promociones.js";
import { iniciarCartas } from "./cartas.js";
import { iniciarCarruseles } from "./carrusel.js";
import { iniciarDespliegueRedireccionCategoria } from "./despliegue_redireccion_categoria.js";

iniciarEstado();
iniciarSucursales();
iniciarDetalleSucursal();
iniciarNavMovil();
iniciarPromociones();
iniciarCartas();
iniciarCarruseles();
iniciarDespliegueRedireccionCategoria();
