/* Arranque: carga los modulos que la pagina necesite. */

import { iniciarEstado } from "./estado.js";
import { iniciarSucursales } from "./sucursal.js";
import { iniciarNavMovil } from "./nav.js";
import { iniciarPromociones } from "./promociones.js";
import { iniciarAcordeones } from "./acordeon.js";

iniciarEstado();
iniciarSucursales();
iniciarNavMovil();
iniciarPromociones();
iniciarAcordeones();
