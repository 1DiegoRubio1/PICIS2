import express from "express";
import {
  saveEntidades,
  getEntidades,
  getEntidadById,
  updateEntidad,
  deleteEntidad,
} from "../funciones/entidades.js";

const router = express.Router();

// =========================
// CREATE - POST /entidades
// =========================
router.post("/", async (req, res) => {
  try {
    const { nombre, nivel, descripcion, politicasIAM } = req.body;

    const detalleId = await saveEntidades(
      nombre,
      nivel,
      descripcion,
      politicasIAM
    );

    if (!detalleId) {
      return res.status(500).json({ error: "No se pudo crear la entidad" });
    }

    return res.json({
      ok: true,
      detalleId,
      message: "Entidad creada correctamente",
    });

  } catch (error) {
    console.error("Error en POST /entidades:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

// =========================
// READ - GET /entidades
// =========================
router.get("/", async (req, res) => {
  try {
    const { estado } = req.query;
    const documentos = await getEntidades(estado);
    res.json(documentos);

  } catch (error) {
    console.error("Error en GET /entidades:", error);
    res.status(500).json({ error: "Error al obtener datos" });
  }
});

// =========================
// READ BY ID - GET /entidades/:id
// =========================
router.get("/:id", async (req, res) => {
  try {
    const doc = await getEntidadById(req.params.id);
    if (!doc) return res.status(404).json({ error: "No encontrado" });
    res.json(doc);
  } catch (error) {
    console.error("Error en GET /entidades/:id:", error);
    res.status(500).json({ error: "Error al obtener el documento" });
  }
});

// =========================
// UPDATE - PUT /entidades/:id
// =========================
router.put("/:id", async (req, res) => {
  try {
    const updated = await updateEntidad(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Entidad no encontrada" });
    }

    return res.json({ ok: true, message: "Actualizado correctamente" });
  } catch (error) {
    console.error("Error en PUT /entidades/:id:", error);
    res.status(500).json({ error: "Error al actualizar" });
  }
});

// =========================
// DELETE - DELETE /entidades/:id
// =========================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await deleteEntidad(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Entidad no encontrada" });
    }

    return res.json({ ok: true, message: "Entidad eliminada correctamente" });

  } catch (error) {
    console.error("Error en DELETE /entidades/:id:", error);
    res.status(500).json({ error: "Error al eliminar" });
  }
});

export default router;
