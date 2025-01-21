import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  // Retrieve the 'Authorization' header and check its format.
  const authHeader = req.header("Authorization");

  // Ensure the header exists and follows the Bearer token format.
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .send("Access Denied: No token provided or incorrect format");
  }

  // Extract the token by removing the 'Bearer ' prefix.
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token using the secret key.
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded token (user data) to the request object for further use.
    req.user = verified;

    // Call the next middleware in the stack.
    next();
  } catch (err) {
    // Handle invalid tokens.
    res.status(400).send("Invalid Token");
  }
};
