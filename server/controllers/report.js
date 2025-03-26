import { Report } from "../models/Report.js";

async function createReport(req, res) {
  try {
    const { reportedUser, reportedPost, reason } = req.body;
    const reporter = req.user.user_id;

    // Si se reporta un post pero no un usuario, buscar al autor del post
    let userToReport = reportedUser;
    if (!reportedUser && reportedPost) {
      const post = await Post.findById(reportedPost);
      if (!post) {
        return res.status(404).send({ msg: "Publicación no encontrada" });
      }
      userToReport = post.author; // Asocia al autor del post
    }

    const report = new Report({
      reporter,
      reportedUser: userToReport,
      reportedPost,
      reason,
    });

    await report.save();
    res.status(201).send({ msg: "Reporte creado", report });
  } catch (error) {
    res.status(500).send({ msg: "Error al crear el reporte", error });
  }
}

async function getReports(req, res) {
  try {
    const reports = await Report.find()
      .populate("reporter", "-password")
      .populate("reportedUser", "-password")
      .populate("reportedPost");

    res.status(200).send(reports);
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener reportes", error });
  }
}

async function markAsReviewed(req, res) {
  try {
    const { id } = req.params;
    await Report.findByIdAndUpdate(id, { reviewed: true });
    res.status(200).send({ msg: "Reporte marcado como revisado" });
  } catch (error) {
    res.status(500).send({ msg: "Error al marcar", error });
  }
}

export const ReportController = {
  createReport,
  getReports,
  markAsReviewed,
};
