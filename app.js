const express = require('express');
const app = express();
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const multer = require('multer');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

app.get('/', (req, res) => {
    res.render('form');
});

app.post('/preview', async (req, res) => {
    const { name, email, phone } = req.body;
    const profilePicture = req.file;

    // Parse education and experience data
    const educationData = [];
    const experienceData = [];
    if (req.body.educationInstitution && req.body.educationInstitution.length) {
    for (let i = 0; i < req.body.educationInstitution.length; i++) {
        educationData.push({
            institution: req.body.educationInstitution[i],
            degree: req.body.educationDegree[i],
            date: req.body.educationDate[i]
        });
        }
    }
    if (req.body.educationInstitution && req.body.educationInstitution.length) {
    for (let i = 0; i < req.body.experienceCompany.length; i++) {
        experienceData.push({
            company: req.body.experienceCompany[i],
            title: req.body.experienceTitle[i],
            dates: req.body.experienceDates[i],
        });
    }
    }

    const templateData = {
        name,
        email,
        phone,
        profilePicture,
        educationData,
        experienceData
    };
    console.log(templateData)

    // Pass all the variables to the template
    res.render('preview', templateData);
});

app.post('/generate', upload.single('profilePicture'), async (req, res) => {
    const { name, email, phone } = req.body;
    const profilePicture = req.file;

    // Parse education and experience data
    const educationData = [];
    for (let i = 0; i < req.body.educationInstitution.length; i++) {
        educationData.push({
            institution: req.body.educationInstitution[i],
            degree: req.body.educationDegree[i],
            date: req.body.educationDate[i]
        });
    }

    const experienceData = [];
    for (let i = 0; i < req.body.experienceCompany.length; i++) {
        experienceData.push({
            company: req.body.experienceCompany[i],
            title: req.body.experienceTitle[i],
            dates: req.body.experienceDates[i],
        });
    }

    const templateData = {
        name,
        email,
        phone,
        profilePicture,
        educationData,
        experienceData
    };

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Add a delay to allow images to load
    await page.waitForTimeout(2000); // Adjust the delay time as needed (in milliseconds)

    const content = await ejs.renderFile('views/cv.ejs', templateData);
    await page.setContent(content);

    const pdfBuffer = await page.pdf();
    await browser.close();

    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="my_cv.pdf"'
    });
    res.send(pdfBuffer);
});

const port = 8080; // Change this to the desired port number

app.listen(port, () => {
    console.log(`CV Generator app is running on http://localhost:${port}`);
});
