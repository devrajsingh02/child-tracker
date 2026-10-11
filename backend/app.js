const express = require('express')
const cors = require('cors')
require("dotenv").config();

const connectDB = require('./config/db')
const Location = require('./models/location')
const SafeZone = require("./models/SafeZone");
const calculateDistance = require("./utils/geofence");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");
const SOSEvent = require("./models/SOSEvent");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/api/auth/me", authMiddleware, (req, res) => {
    res.json({
        success: true,
        parent: {
            id: req.parent._id,
            name: req.parent.name,
            email: req.parent.email,
            child: req.parent.child,
        },
    });
});

connectDB();

const PORT = process.env.PORT;

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "child tracker backend is running !!"
    })
})


app.get("/api/device/latest", async (req, res) => {
  try {
    const location = await Location.findOne()
      .sort({ createdAt: -1 });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "No location data found"
      });
    }

    res.json({
      success: true,
      data: location
    });
  } catch (err) {
    console.log(err.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch latest location"
    });
  }
});

app.get("/api/device/history", async (req, res) => {
    try {
        const history = await Location
            .find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: history
        });

    } catch (error) {
        console.log(error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch location history"
        });
    }
});

app.get("/api/device/safe-zone-status", async (req, res) => {
    try {

        const childLocation = await Location
            .findOne()
            .sort({ createdAt: -1 });

        if (!childLocation) {
            return res.status(404).json({
                success: false,
                message: "Child location not found"
            });
        }

        const safeZones = await SafeZone.find({
            active: true
        });

        let insideZone = null;

        for (const zone of safeZones) {

            const distance = calculateDistance(
                childLocation.latitude,
                childLocation.longitude,
                zone.latitude,
                zone.longitude
            );

            if (distance <= zone.radius) {

                insideZone = {
                    zoneName: zone.name,
                    distance: Math.round(distance),
                    radius: zone.radius
                };

                break;
            }
        }

        if (insideZone) {

            return res.json({
                success: true,
                status: "SAFE",
                message: "Child is inside safe zone",
                zone: insideZone
            });

        } else {

            return res.json({
                success: true,
                status: "OUTSIDE",
                message: "Child is outside all safe zones"
            });

        }

    } catch (error) {

        console.log(
            "Safe Zone Status Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to check safe zone"
        });
    }
});

// Device Data Route
app.post("/api/device/data", async (req, res) => {

    try {

        const location = await Location.create(req.body);

        res.status(201).json({
            success: true,
            message: "Device data saved successfully",
            data: location

        })
    } catch (err) {
        console.log(err.message);

        res.status(500).json({

            success: false,
            message: "Failed to save device data"

        })
    }
});

app.post("/api/safe-zones", async (req, res) => {
    try {
        const safeZone = await SafeZone.create(req.body);

        res.status(201).json({
            success: true,
            message: "Safe zone created successfully",
            data: safeZone
        });

    } catch (error) {
        console.log(error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create safe zone"
        });
    }
});

app.get("/api/safe-zones", async (req, res) => {
    try {
        const safeZones = await SafeZone
            .find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: safeZones
        });

    } catch (error) {
        console.log(error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch safe zones"
        });
    }
});


// Trigger SOS Alert
app.post("/api/sos", async (req, res) => {
    try {
        // Get the latest available child location
        const latestLocation = await Location.findOne()
            .sort({ createdAt: -1 });

        const sosEvent = await SOSEvent.create({
            status: "TRIGGERED",
            latitude: latestLocation
                ? latestLocation.latitude
                : null,
            longitude: latestLocation
                ? latestLocation.longitude
                : null,
            battery: latestLocation
                ? latestLocation.battery
                : null,
            message: "SOS alert triggered from parent app",
        });

        res.status(201).json({
            success: true,
            message: "SOS event recorded successfully",
            data: sosEvent,
        });
    } catch (error) {
        console.log("SOS Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to record SOS event",
        });
    }
});

// Get SOS History (for demo/testing)
app.get("/api/sos", async (req, res) => {
    try {
        const events = await SOSEvent.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: events,
        });
    } catch (error) {
        console.log("SOS History Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch SOS history",
        });
    }
});




app.listen(PORT, "0.0.0.0", () => {
    console.log("server is listening");
})

