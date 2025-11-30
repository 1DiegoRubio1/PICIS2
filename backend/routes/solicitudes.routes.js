import express from "express";
import {
  createSolicitud,
  getSolicitudes,
  getSolicitudById,
  updateSolicitud,
  deleteSolicitud,
} from "../funciones/solicitudes.js";

const router = express.Router();

// CREAR SOLICITUD
router.post("/", async (req, res) => {
  try {

    const { gestor, tipoSolicitud, estado, detalle, idEntidad } = req.body;

    const data = { gestor, tipoSolicitud, estado, detalle };

    if (idEntidad !== undefined && idEntidad !== null && idEntidad !== "") {
      data.idEntidad = idEntidad;
    }

    const id = await createSolicitud(data);

    res.json({ ok: true, id });

  } catch (error) {
    console.error("Error en POST /solicitudes:", error);
    res.status(500).json({ ok: false, error: "Error interno" });
  }
});

// GET TODOS, Y TAMBIÉN SE PUEDE APLCIAR ?estado=algo
router.get("/", async (req, res) => {
  try {
    const { estado } = req.query;
    const data = await getSolicitudes(estado);
    res.json(data);

  } catch (error) {
    console.error("Error en GET /solicitudes:", error);
    res.status(500).json({ ok: false, error: "Error al obtener datos" });
  }
});

// GET POR ID
router.get("/:id", async (req, res) => {
  const data = await getSolicitudById(req.params.id);
  if (!data) return res.status(404).json({ ok: false, message: "No encontrada" });

  res.json(data);
});

// EDITAR SOLICITUD
router.put("/:id", async (req, res) => {
  const ok = await updateSolicitud(req.params.id, req.body);
  res.json({ ok });
});

// ELIMINAR SOLICITUD 
router.delete("/:id", async (req, res) => {
  const ok = await deleteSolicitud(req.params.id);
  res.json({ ok });
});

export default router;
