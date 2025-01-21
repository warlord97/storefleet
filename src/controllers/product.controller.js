import Product from "../models/product.model.js";

export const createProduct = async (req, res) => {
  try {
    const { name, category, price } = req.body;

    // Validate required fields
    if (!name || !category || !price) {
      return res
        .status(422) // Unprocessable Entity
        .json({ message: "All fields (name, category, price) are required." });
    }

    // Check if the user has the required role
    if (req.user.role !== "seller") {
      return res
        .status(403) // Forbidden
        .json({ message: "Only sellers can create a product." });
    }

    // Create the new product
    const newProduct = new Product({
      name,
      category,
      price,
      sellerId: req.user._id, // Assuming that the seller is logged in and their _id is available in req.user
    });

    // Save the new product to the database
    await newProduct.save();

    // Respond with the created product
    res.status(201).json({
      message: "Product created successfully.",
      product: newProduct,
    });
  } catch (err) {
    console.error("Error creating product:", err.message);

    // Respond with an internal server error
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllProduct = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ message: "All products", products });
  } catch (err) {
    console.log("Error while getting all product:", err.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Product Id is required" });
    }
    const product = await Product.findById(id);

    res.status(200).json({ message: "product", product });
  } catch (err) {
    console.log("Error while getting product with id:", err.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(400)
        .json({ message: "Only sellers can update a product" });
    }

    const { id } = req.params;
    const { name, category, price } = req.body;

    const productToUpdate = {};
    if (name) productToUpdate.name = name;
    if (category) productToUpdate.category = category;
    if (price) productToUpdate.price = price;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      productToUpdate,
      {
        new: true,
        runValidators: true,
      }
    );

    // Check if the product was found and updated
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product updated succesfully", updatedProduct });
  } catch (err) {
    console.log("Error in updating product", err.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    // Check if the user is a seller
    if (req.user.role !== "seller") {
      return res
        .status(403) // Forbidden (since the user is not allowed to perform this action)
        .json({ message: "Only sellers can delete a product" });
    }

    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    // Check if the product was found and deleted
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" }); // Not found (if product with the given ID doesn't exist)
    }

    res.status(200).json({ message: "Product deleted successfully" }); // Success (product deleted)
  } catch (err) {
    console.log("Error in deleting product", err.message);
    res.status(500).json({ message: "Internal Server Error" }); // Server error
  }
};
