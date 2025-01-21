import { sendMail } from "../../services/mailService.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const createOrder = async (req, res) => {
  try {
    // Check if the user is a customer
    if (req.user.role !== "customer") {
      return res
        .status(403) // Forbidden: Only customers can create an order
        .json({ message: "Only customers can create an order" });
    }

    const { productId } = req.params;

    if (!productId) {
      return res
        .status(400) // Bad Request: Missing Product ID
        .json({ message: "Provide the ProductId" });
    }

    const { quantity, status } = req.body;
    if (!quantity || !status) {
      return res
        .status(400) // Bad Request: Missing required fields
        .json({ message: "Quantity and Status are required" });
    }

    // Create the new order
    const newOrder = new Order({
      productId,
      customerId: req.user._id,
      quantity,
      status,
    });

    await newOrder.save();

    const currentUser = await User.findById(req.user._id);
    const currentProduct = await Product.findById(productId);

    const productName = currentProduct.name;
    const userName = currentUser.name;
    const email = currentUser.email;
    const price = currentProduct.price;

    // Send confirmation email
    sendMail(
      email,
      "Order created",
      `Hello ${userName}, Your order for ${productName} of quantity ${quantity} and total price ${
        price * quantity
      } is placed successfully.`
    );

    // Respond with success
    res.status(201).json({
      message: "Order placed successfully",
      quantity,
    });
  } catch (err) {
    console.log("ERROR while creating order", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updateOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updateOrder) {
      return res.status(400).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order is updated", updateOrder });
  } catch (err) {
    console.log("ERROR while updating order", err.message);
    res.status(500).json({ message: "something went wrong" });
  }
};
