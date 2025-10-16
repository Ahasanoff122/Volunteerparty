import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import session from "express-session";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fayl və qovluq yolu
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB bağlantısı
const uri =
  "mongodb+srv://Alihasanoff:Hsnov2508@asanparty.irtfmnl.mongodb.net/Asanparty?tls=true";

mongoose
  .connect(uri)
  .then(() => console.log("✅ MongoDB bağlantısı uğurludur"))
  .catch((err) => console.error("❌ MongoDB bağlantı xətası:", err));

// Schema
const rsvpSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  attendance: {
    type: String,
    enum: ["Yes", "Maybe", "No"],
    default: "Maybe",
  },
  note: String,
  createdAt: { type: Date, default: Date.now },
});

const Rsvp = mongoose.model("Rsvp", rsvpSchema);

// EJS tənzimləməsi
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Statik fayllar
app.use(express.static(path.join(__dirname, "public")));

// Session
app.use(
  session({
    secret: "asan-party-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// 🏠 Əsas səhifə
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🟢 RSVP əlavə et
app.post("/api/rsvp", async (req, res) => {
  try {
    const rsvp = new Rsvp({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      attendance: req.body.attendance,
      note: req.body.note,
    });
    await rsvp.save();
    res.json({ success: true, message: "Qeydiyyat uğurla əlavə olundu!" });
  } catch (err) {
    console.error("RSVP əlavə xətası:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔵 Bütün RSVP-ləri gətir
app.get("/api/rsvp", async (req, res) => {
  try {
    const rsvps = await Rsvp.find().sort({ createdAt: -1 });
    res.json(rsvps);
  } catch (err) {
    console.error("RSVP gətir xətası:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔴 RSVP sil
app.delete("/api/rsvp/:id", async (req, res) => {
  try {
    const rsvp = await Rsvp.findByIdAndDelete(req.params.id);
    if (!rsvp) {
      return res
        .status(404)
        .json({ success: false, message: "Müraciət tapılmadı" });
    }
    res.json({ success: true, message: "Müraciət silindi" });
  } catch (err) {
    console.error("RSVP silinmə xətası:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔑 Login səhifəsi
app.get("/login", (req, res) => {
  res.render("login");
});

// 🔑 Login POST
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "Admin" && password === "Asan9876") {
    req.session.admin = true;
    return res.redirect("/admin");
  }
  res.send("Yanlış istifadəçi adı və ya şifrə");
});

// Middleware
function checkAdmin(req, res, next) {
  if (req.session.admin) return next();
  res.redirect("/login");
}

// 🧭 Admin panel
app.get("/admin", checkAdmin, async (req, res) => {
  try {
    const rsvps = await Rsvp.find().sort({ createdAt: -1 });
    res.render("admin", { rsvps });
  } catch (err) {
    console.error("Admin səhifə xətası:", err);
    res.status(500).send("Xəta baş verdi: " + err.message);
  }
});

// 🔓 Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// 📧 --- EMAIL GÖNDƏRMƏ FUNKSİYASI --- 📧
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hesenovali2808@gmail.com",
    pass: "eltt bunz opxu elnh", // App password
  },
});

// 💌 Tək bir iştirakçıya dəvət göndər
app.post("/api/send-invite/:id", checkAdmin, async (req, res) => {
  try {
    const rsvp = await Rsvp.findById(req.params.id);
    if (!rsvp || !rsvp.email) {
      return res
        .status(404)
        .json({ message: "İştirakçı tapılmadı və ya e-poçt mövcud deyil" });
    }

    await transporter.sendMail({
      from: '"ASAN Könüllülər" <hesenovali2808@gmail.com>',
      to: rsvp.email,
      subject: "🎉 Beynəlxalq Könüllülər Gününə Dəvət",
      html: `
        <div style="font-family: Arial; background:#f5f7fa; padding:20px; border-radius:10px; border:1px solid #ddd;">
          <h2 style="color:#2c3e50;">Salam, ${rsvp.name}!</h2>
          <p>Sizi <b>5 Dekabr Beynəlxalq Könüllülər Gününə</b> dəvət edirik! 💚</p>
          <p><b>Yer:</b> 1 Saylı ASAN Xidmət Mərkəzi</p>
          <p><b>Vaxt:</b> 30 Noyabr, saat 18:00</p>
          <p style="color:#16a085;">🎶 Musiqi, əyləncə, hədiyyələr və motivasiya dolu atmosfer sizi gözləyir!</p>
          <hr>
          <p>Sevgilərlə,<br><b>ASAN Könüllülər Komandası</b></p>
        </div>
      `,
    });

    res.json({ message: `${rsvp.name} üçün dəvət göndərildi!` });
  } catch (err) {
    console.error("E-poçt göndərilərkən xəta:", err);
    res.status(500).json({ error: "E-mail göndərilərkən xəta baş verdi." });
  }
});

// 🟢 Server işə sal
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server işə düşdü: http://localhost:${PORT}`)
);
