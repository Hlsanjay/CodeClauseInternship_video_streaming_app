const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 8081;

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'video_app'
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Registration Endpoint
app.post('/register', (req, res) => {
    const { UserName, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.json({ success: false, message: "Passwords do not match" });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.json({ success: false, message: "Error hashing password" });
        }

        const sql = "INSERT INTO register (UserName, email, password) VALUES (?, ?, ?)";
        const values = [UserName, email, hashedPassword];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Registration error:', err);
                return res.json({ success: false, message: "Error occurred while registering" });
            }
            return res.json({ success: true, message: "Registered successfully" });
        });
    });
});

// Login Endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM register WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Login error:', err);
            return res.json({ success: false, message: "Error occurred while logging in" });
        }

        if (results.length > 0) {
            const user = results[0];
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    return res.json({ success: false, message: "Error comparing passwords" });
                }
                if (result) {
                    return res.json({ success: true, user: {
                        id: user.id,
                        username: user.UserName,  // Ensure this field is sent
                        email: user.email
                    }});
                } else {
                    return res.json({ success: false, message: "Incorrect password" });
                }
            });
        } else {
            return res.json({ success: false, message: "No user found with this email" });
        }
    });
});

// Video Upload Endpoint
app.post('/upload', upload.single('video'), (req, res) => {
    const { userId, title, description, visibility } = req.body;
    const videoFile = req.file;

    if (!videoFile) {
        return res.json({ success: false, message: "No video file uploaded" });
    }

    const videoUrl = `/uploads/${videoFile.filename}`;
    const sql = "INSERT INTO videos (user_id, title, description, video_url, visibility) VALUES (?, ?, ?, ?, ?)";
    const values = [userId, title, description, videoUrl, visibility];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Upload error:', err);
            return res.json({ success: false, message: "Error occurred while uploading video" });
        }
        return res.json({ success: true, message: "Video uploaded successfully" });
    });
});

// Fetch User Videos Endpoint
app.get('/my-videos/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = "SELECT * FROM videos WHERE user_id = ?";

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Fetch my videos error:', err);
            return res.json({ success: false, message: "Error occurred while fetching videos" });
        }
        res.json(results);
    });
});

// Fetch All Videos Endpoint
app.get('/videos', (req, res) => {
    const userId = req.query.userId;
    const sql = "SELECT * FROM videos WHERE visibility = 'public' OR user_id = ?";

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Fetch all videos error:', err);
            return res.json({ success: false, message: "Error occurred while fetching videos" });
        }
        res.json(results);
    });
});

// Static file serving for uploaded videos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
