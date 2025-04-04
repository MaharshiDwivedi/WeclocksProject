const express = require('express');
const cors = require('cors');
const path = require("path");

const loginRoute = require('./Routes/loginRoute');
const expenceRoute = require('./Routes/expenceRoute');
const committeeRoutes = require("./Routes/committeeRoute");
const meetingRoute = require("./Routes/meetingRoute");
const documentRoute = require("./Routes/documentRoute");
const tharavRoutes = require("./Routes/tharavRoute");
const purposeRoute = require("./Routes/purposeRoute");
const schoolRoutes = require('./Routes/SchoolRoute');
const fundRoutes = require('./Routes/FundRoute');
const remarksRoute = require("./Routes/remarksRoute");
const fundreq_hmRoutes = require('./Routes/fundreq_hmRoutes');
const reportRoute = require("./Routes/reportRoute");
const fundreportRoute = require("./Routes/fundreportRoute");
const compTharavRoutes = require('./Routes/compTharavRoutes');


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
app.use('/api/meeting', meetingRoute);
app.use('/api/documents', documentRoute);
app.use('/api/tharav', tharavRoutes);
app.use('/api/purpose', purposeRoute);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/remarks", remarksRoute);
app.use('/api/fundreqhm', fundreq_hmRoutes);
app.use('/api', schoolRoutes);
app.use('/api', fundRoutes);
app.use('/api', reportRoute);  
app.use('/api', fundreportRoute);
app.use('/api/tharav', compTharavRoutes);
app.get('/', (req, res) => {
    res.send("Server is running");
});

// app.post("/api/expenceData", (req, res) => {
//     console.log("Received request:", req.body);
//     res.json({ message: "API working" });
// });

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
