import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";

async function create(req, res) {
  try {
    const { product_id, quantity } = req.body;
    const { userBuyer_id } = req.user;

    const product = await Product.findById(product_id);
    if (!product) return res.status(404).send({ msg: "Producto no encontrado" });

    const total = product.price * quantity;

    const order = new Order({
      buyer: userBuyer_id,
      seller: product.owner,
      product: product_id,
      quantity,
      total,
    });

    await order.save();
    res.status(201).send(order);
  } catch (error) {
    res.status(500).send({ msg: "Error al crear orden", error });
  }
}

async function getOrdersByBuyer(req, res) {
  const { user_id } = req.user;
  try {
    const orders = await Order.find({ buyer: user_id })
      .populate("product")
      .populate("seller", "-password");

    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener tus órdenes", error });
  }
}

async function getOrdersBySeller(req, res) {
  const { user_id } = req.user;
  try {
    const orders = await Order.find({ seller: user_id })
      .populate("product")
      .populate("buyer", "-password");

    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener tus ventas", error });
  }
}

async function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).send(order);
  } catch (error) {
    res.status(500).send({ msg: "Error al actualizar estado", error });
  }
}

export const OrderController = {
  create,
  getOrdersByBuyer,
  getOrdersBySeller,
  updateStatus,
};
