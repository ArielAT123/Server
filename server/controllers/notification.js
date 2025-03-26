import { Notification } from "../models/Notification.js";

async function create(req, res) {
  try {
    const { type, receiver, post, message } = req.body;
    const { user_id } = req.user;

    const notification = new Notification({
      sender: user_id,
      receiver,
      type,
      post,
      message,
    });

    await notification.save();

    res.status(201).send(notification);
  } catch (error) {
    res.status(500).send({ msg: "Error al crear notificación", error });
  }
}

async function getMyNotifications(req, res) {
  try {
    const { user_id } = req.user;

    const notifications = await Notification.find({ receiver: user_id })
      .sort({ createdAt: -1 })
      .populate("sender", "-password")
      .populate("post");

    res.status(200).send(notifications);
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener notificaciones", error });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;

    await Notification.findByIdAndUpdate(id, { read: true });

    res.status(200).send({ msg: "Notificación marcada como leída" });
  } catch (error) {
    res.status(500).send({ msg: "Error al marcar como leída", error });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;

    await Notification.findByIdAndDelete(id);

    res.status(200).send({ msg: "Notificación eliminada" });
  } catch (error) {
    res.status(500).send({ msg: "Error al eliminar notificación", error });
  }
}

export const NotificationController = {
  create,
  getMyNotifications,
  markAsRead,
  remove,
};
