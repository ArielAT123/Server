import { Product } from "../models/Product.js";
import { getFilePath } from "../utils/index.js";

async function create(req, res) {
  try {
    const { name, description, price, category } = req.body;
    const { user_id } = req.user;

    const product = new Product({
      owner: user_id,
      name,
      description,
      price,
      category,
    });

    if (req.files?.image) {
      product.image = getFilePath(req.files.image);
    }

    await product.save();
    res.status(201).send(product);
  } catch (error) {
    res.status(500).send({ msg: "Error al crear producto", error });
  }
}

async function getAll(req, res) {
  try {
    const products = await Product.find({ visible: true }).populate("owner", "-password");
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener productos", error });
  }
}

async function getByUser(req, res) {
  const { user_id } = req.params;
  try {
    const products = await Product.find({ owner: user_id });
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener productos del usuario", error });
  }
}

async function update(req, res) {
  const { id } = req.params;
  const data = req.body;

  if (req.files?.image) {
    data.image = getFilePath(req.files.image);
  }

  try {
    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send({ msg: "Error al actualizar producto", error });
  }
}

async function remove(req, res) {
  const { id } = req.params;
  try {
    await Product.findByIdAndDelete(id);
    res.status(200).send({ msg: "Producto eliminado" });
  } catch (error) {
    res.status(500).send({ msg: "Error al eliminar producto", error });
  }
}

export const ProductController = {
  create,
  getAll,
  getByUser,
  update,
  remove,
};
