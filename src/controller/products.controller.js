import ProductsModel from "../dao/models/products.models.js";
import mongoose from "mongoose";

export const getProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query?.limit ?? 50);

    const result = await ProductsModel.paginate(
      {},
      {
        page: 1,
        limit: limit,
        lean: true,
      }
    );

    res.json({ status: "success", payload: result });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Ocurrió un error al realizar la petición de los productos\n\n${err}`,
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const pId = new mongoose.Types.ObjectId(req.params.pid);

    if (!mongoose.Types.ObjectId.isValid(req.params.pid)) {
      return res.status(400).json({ error: "Invalid ObjectId" });
    }

    let product = await ProductsModel.findById(pId).lean().exec();

    if (!product) {
      console.error("Producto no encontrado");
    }
    res.json({ status: "success", payload: product });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Ocurrió un error al realizar la petición del producto... (${err})`,
    });
  }
};

export const addProduct = async (req, res) => {
  const {
    title,
    description,
    price,
    thumbnails,
    code,
    category,
    stock,
    status = true,
  } = req.body;

  try {
    const productToAdd = {
      title: title,
      description: description,
      price: price,
      thumbnails: [thumbnails],
      code: code,
      category: category,
      stock: stock,
      status: status === "true",
    };

    const addedProduct = await ProductsModel.create(productToAdd);

    return res.status(201).json({
      message: `Producto (ID: ${addedProduct._id}) añadido exitosamente`,
      product: addedProduct,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const modifyProduct = async (req, res) => {
  try {
    const productId = new mongoose.Types.ObjectId(req.params.pid);
    const { id, ...updated } = req.body;

    if (id && id !== productId) {
      return res
        .status(400)
        .json({ error: "No se puede modificar el ID del producto" });
    }

    const updatedProduct = await ProductsModel.findByIdAndUpdate(
      productId,
      updated,
      { new: true }
    );

    res.status(200).json({
      message: `El producto (ID: ${productId}) fue actualizado correctamente!`,
      product: updatedProduct,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = new mongoose.Types.ObjectId(req.params.pid);

    if (!mongoose.Types.ObjectId.isValid(req.params.pid)) {
      return res.status(400).json({ error: "Invalid ObjectId" });
    }

    const deletedProduct = await ProductsModel.findByIdAndDelete(productId);

    if (!deletedProduct) {
      res.status(404).json({
        status: "error",
        message: `El producto (ID: ${productId}) no se ha encontrado`,
      });
      console.error(`El producto (ID: ${productId}) no se ha encontrado`);
      return;
    }

    res.status(200).json({
      message: `El producto (ID: ${productId}) ha sido eliminado correctamente`,
    });

    console.log("Producto eliminado:", deletedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
