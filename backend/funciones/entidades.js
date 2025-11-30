import { Firestore } from "@google-cloud/firestore";

// Inicializa Firestore usando credenciales ADC
const db = new Firestore();
const collection = db.collection("entidades");

/**

* Obtiene el siguiente ID tipo:
* entidades1, entidades2, entidades3...
  */
  export async function getNextEntidadesId() {
  try {
  const snapshot = await collection.get();
  const prefix = "entidad";
  const numbers = [];

  snapshot.forEach((doc) => {
  const docId = doc.id;
  if (docId.startsWith(prefix)) {
  const num = parseInt(docId.substring(prefix.length), 10);
  if (!isNaN(num)) numbers.push(num);
  }
  });

  const nextNum =
  numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

  return `${prefix}${nextNum}`;
  } catch (error) {
  console.error("Error obteniendo siguiente ID:", error);
  return "entidad1";
  }
  }

/**

* CREATE: Guarda un documento en la colección "entidades"
  */
  export async function saveEntidades(nombre, nivel, descripcion, politicasIAM) {
  console.log("Iniciando guardado de entidades...");
  try {
  const docId = await getNextEntidadesId();
  console.log("ID generado para el documento:", docId);

  const data = {
  nombre,
  nivel,
  descripcion,
  politicasIAM,
  creadoEn: new Date(),
  estado: "activo",
  };
  console.log("Datos que se guardarán en Firestore:", data)

  await collection.doc(docId).set(data);
 console.log(`Documento ${docId} guardado correctamente.`);
  return docId;
  } catch (error) {
  console.error("Error guardando entidades:", error);
  return null;
  }
  }

/**

* READ ALL: Obtiene todos los documentos
  */

export async function getEntidades(estado) {
try {
let snapshot;

if (estado) {
  console.log("Filtrando por estado:", estado);
  snapshot = await collection.where("estado", "==", estado).get();
} else {
  console.log("Sin filtro, obteniendo todos.");
  snapshot = await collection.get();
}

return snapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));

} catch (error) {
console.error("Error obteniendo entidades:", error);
return [];
}
}

/**

* READ ONE: Obtiene un documento por ID
  */
  export async function getEntidadById(id) {
  try {
  const doc = await collection.doc(id).get();
  console.log("Documento por id obtenido");
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
  } catch (error) {
  console.error("Error obteniendo detalle por ID:", error);
  return null;
  }
  }

/**

* UPDATE: Actualiza un documento
  */
  export async function updateEntidad(id, data) {
  try {
  await collection.doc(id).update({
  ...data,
  actualizadoEn: new Date(),
  });
  console.log("Documento actualizado");
  return true;
  } catch (error) {
  console.error(`Error actualizando ${id}:`, error);
  return false;
  }
  }

/**

* DELETE: Elimina un documento
  */
  export async function deleteEntidad(id) {
  try {
  await collection.doc(id).delete();
  console.log("Documento eliminado");
  return true;
  } catch (error) {
  console.error(`Error eliminando ${id}:`, error);
  return false;
  }
  }
