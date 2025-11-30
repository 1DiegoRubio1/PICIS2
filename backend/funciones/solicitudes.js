import { Firestore } from "@google-cloud/firestore";

const db = new Firestore();
const collection = db.collection("solicitudes");

export async function getNextSolicitudId() {
  try {
    const snapshot = await collection.get();
    const prefix = "solicitud";
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
    console.error("Error generando ID:", error);
    return "solicitud1";
  }
}


export async function createSolicitud({
  gestor,
  tipoSolicitud,
  estado = "pendiente",
  detalle,
  idEntidad
}) {
  try {
    if (!detalle) {
      throw new Error("El objeto 'detalle' es obligatorio");
    }

    const docId = await getNextSolicitudId();

    const data = {
      gestor,
      tipoSolicitud,
      estado,
      detalle,
      timestamp: new Date(),
    };

    if (idEntidad !== undefined && idEntidad !== null && idEntidad !== "") {
      data.idEntidad = idEntidad;
    }

    await collection.doc(docId).set(data);
    return docId;

  } catch (error) {
    console.error("Error creando solicitud:", error);
    return null;
  }
}

// GET TODOS
export async function getSolicitudes(estado) {
  try {
    let snapshot;

    if (estado) {
      snapshot = await collection.where("estado", "==", estado).orderBy("timestamp", "desc").get();
    } else {
      snapshot = await collection.orderBy("timestamp", "desc").get();
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

  } catch (error) {
    console.error("Error obteniendo solicitudes:", error);
    return [];
  }
}

// GET POR ID
export async function getSolicitudById(id) {
  try {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;

    return { id: doc.id, ...doc.data() };

  } catch (error) {
    console.error("Error obteniendo solicitud por ID:", error);
    return null;
  }
}

// EDITAR
export async function updateSolicitud(id, data) {
  try {
    await collection.doc(id).update({
      ...data,
      modificadoEn: new Date(),
    });

    return true;

  } catch (error) {
    console.error(`Error actualizando ${id}:`, error);
    return false;
  }
}

// ELIMINAR
export async function deleteSolicitud(id) {
  try {
    await collection.doc(id).delete();
    return true;
  } catch (error) {
    console.error(`Error eliminando ${id}:`, error);
    return false;
  }
}
