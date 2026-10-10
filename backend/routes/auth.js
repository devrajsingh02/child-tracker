
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Parent = require("../models/parent");

const router = express.Router();

// Parent Signup

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      childName,
      childAge,
      deviceId,
    } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !password ||
      !childName?.trim() ||
      childAge === undefined ||
      childAge === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all parent and child details",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const age = Number(childAge);

    if (!Number.isInteger(age) || age < 0 || age > 18) {
      return res.status(400).json({
        success: false,
        message: "Child age must be between 0 and 18",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingParent = await Parent.findOne({
      email: normalizedEmail,
    });

    if (existingParent) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const parent = await Parent.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      child: {
        name: childName.trim(),
        age,
        deviceId: deviceId?.trim() || "",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      parent: {
        id: parent._id,
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
        child: parent.child,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    console.error("Signup error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create account",
    });
  }
});

// Parent Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const parent = await Parent.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!parent) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      parent.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { parentId: parent._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      parent: {
        id: parent._id,
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
});

module.exports = router;