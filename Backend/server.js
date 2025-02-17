    const express = require('express');
    const cors = require('cors');
    const loginRoute = require('./Routes/loginRoute');
    const expenceRoute = require('./Routes/expenceRoute')
    const committeeRoutes = require("./Routes/committeeRoute");

    const app = express();

    // CORS configuration
    app.use(cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    app.use(express.json());

    // Routes
    app.use('/api', loginRoute);
    app.use('/api', expenceRoute);
    app.use('/api/member', committeeRoutes);


    app.get('/', (req, res) => {
        res.send("Server is running");
    });

    const PORT = 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    app.post("/api/expenceData", (req, res) => {
        console.log("Received request:", req.body);
        res.json({ message: "API working" });
    });
    