import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendMail } from "../../services/mailService.js";

// Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" }); // 400 Bad Request
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" }); // 409 Conflict
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    // Send a welcome email
    await sendMail(
      email,
      "Welcome to Storefleet",
      `Hello ${name}, welcome to Storefleet!`
    );

    // Respond to the client
    res.status(201).json({ message: "User registered successfully" }); // 201 Created
  } catch (err) {
    console.error("Error in registerUser controller", err.message);

    res.status(500).json({ message: "Internal Server Error" }); // 500 Internal Server Error
  }
};

//Login the user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if a user with the provided email exists in the database.
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" }); // 404: Resource not found
    }

    // Compare the provided password with the hashed password stored in the database.
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(401).json({ message: "Invalid password" }); // 401: Unauthorized
    }

    // Generate a JSON Web Token (JWT) using the user's ID and role.
    const token = jwt.sign(
      { _id: user._id, role: user.role }, // Payload: User ID and role.
      process.env.JWT_SECRET, // Secret key from environment variables.
      { expiresIn: "1h" }
    );

    // Set the JWT in the response header and send a success message.
    res.status(200).json({
      // 200: OK
      message: "User logged in successfully",
      token,
    });
  } catch (err) {
    // Handle any errors during the login process.
    console.error("Error in loginUser controller:", err.message);

    res.status(500).json({ message: "Internal Server Error" }); // 500: Internal server error
  }
};

// Get user details by ID
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password"); // Exclude password from the response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user details", error: err.message });
  }
};

// Update user details
export const updateUser = async (req, res) => {
  const id = req.user._id;
  const { name, email, password, role } = req.body;

  try {
    // Restrict updating the role unless the user is an admin
    if (role) {
      return res
        .status(403) // 403: Forbidden
        .json({ message: "Role can be changed by only admin" });
    }

    // Prepare an update object
    const updateFields = {};

    // Only update fields that are provided in the request
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (password) {
      // Hash the password if provided
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    // Find and update the user, excluding password from the response
    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).select("-password"); // Exclude password from the response

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" }); // 404: Resource not found
    }

    res.status(200).json({
      // 200: OK
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error in updateUser controller:", err.message);

    res.status(500).json({ message: "Internal Server Error" }); // 500: Internal server error
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  const id = req.user._id;

  try {
    // Fetch the user before deleting
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send a welcome (or account deletion) email
    await sendMail(
      user.email,
      "Account Deletion Notice",
      `Hello ${user.name}, Your user account has been deleted. If you have any questions, feel free to contact us.`
    );

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.log("Error in deleting user", err.message);

    res.status(500).json({ message: "Something went wrong" });
  }
};
