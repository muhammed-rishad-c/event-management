import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import multer from 'multer';
import adminHelper from '../helpers/admin-helper.js';

const verifyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.render('admin/admin-login');
    }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get('/', (req, res) => {
    res.render('admin/admin-signup');
});

router.post('/signup', upload.single('photo'), (req, res) => {
    const photo = req.file ? req.file.filename : null;
    if (!photo) {
        console.error('Failed to upload photo');
        return res.status(400).send('Failed to upload photo');
    }
    adminHelper.addAdmin(req.body, photo).then(async (status) => {
        if (status) {
            req.session.loggedIn = true;
            req.session.username = req.body.username;
            req.session.photo = photo; // Store the photo in the session
            req.session.category = req.body.category;
            console.log(req.body);
            const products = await adminHelper.getSpecifiedAdminList(req.session.username);
            res.render('admin/admin-index', { products, admin: { ...req.body, photo } });
        } else {
            res.render('admin/admin-signup');
        }
    }).catch(error => {
        console.error('Error adding admin:', error);
        res.status(500).send('Internal Server Error');
    });
});

router.get('/signup', (req, res) => {
    res.render('admin/admin-signup');
});

router.get('/login', (req, res) => {
    res.render('admin/admin-login');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await adminHelper.authenticateAdmin(username, password);
        if (admin) {
            req.session.loggedIn = true;
            req.session.username = admin.username;
            req.session.category = admin.category;
            req.session.photo = admin.photo; // Store the photo in the session
            const products = await adminHelper.getSpecifiedAdminList(req.session.username);
            //console.log(products);

            res.render('admin/admin-index', { products, admin: { ...admin, photo: admin.photo } });
        } else {
            res.render('admin/admin-login', { error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/upload-product', verifyLogin, (req, res) => {
    res.render('admin/upload', { username: req.session.username, category: req.session.category });
});

router.get('/admin-index', verifyLogin, async (req, res) => {
    const products = await adminHelper.getSpecifiedAdminList(req.session.username);
    //console.log(products);

    res.render('admin/admin-index', { products, admin: { ...req.session, photo: req.session.photo } });

})

router.post('/upload-product', upload.single('photo'), (req, res) => {
    console.log(req.body);
    const photo = req.file ? req.file.filename : null;
    if (!photo) {
        console.error('Failed to upload photo');
        return res.status(400).send('Failed to upload photo');
    }
    adminHelper.addList(photo, req.body).then((status) => {
        if (status) {
            res.redirect('/admin/admin-index'); // Make sure this route is correct
        } else {
            res.render('admin/login');
        }
    }).catch(error => {
        console.error('Error uploading product:', error);
        res.status(500).send('Internal Server Error');
    });
});

router.get('/logout', (req, res) => {
    req.session.loggedIn = false;
    res.render('admin/admin-login');
})

router.get('/product-detail/:id', verifyLogin, async (req, res) => {
    try {
        const id = req.params.id;
        console.log("Product ID:", id);

        if (!req.session.username) {
            console.error("Username not found in session.");
            return res.status(401).send('Unauthorized: Username not found in session.');
        }

        console.log("Username from session:", req.session.username);

        const product = await adminHelper.getSpecificList(id, req.session.username);
        console.log("Fetched Product:", product);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Render the EJS template with product details
        res.render('admin/product-detail', { product: product });
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).send('An error occurred');
    }
});

router.post('/update-product/:id', upload.single('photo'), (req, res) => {
    const photo = req.file ? req.file.filename : null;
    const { gender, title, price, category, username } = req.body;

    // Include gender in the updateProduct function
    const productData = {
        title,
        price,
        category,
        username,
        gender, // Include gender here
        photo // Include photo here if needed
    };

    console.log(req.body);

    adminHelper.updateProduct(req.params.id, req.session.username, productData, photo).then((product) => {
        if (product) {
            console.log(product);
            res.redirect('/admin/admin-index');
        }
    });
});

router.get('/profile', verifyLogin, async (req, res) => {
    const result = await adminHelper.getAdminDetail(req.session.username);
    console.log(result);
    res.render('admin/admin-profile', { admin: result });

})
router.post('/update-profile', upload.single('photo'), (req, res) => {
    const photo = req.file ? req.file.filename : null;

    adminHelper.updateAdminProfile(req.session.username, req.body, photo)
        .then(result => {
            if (result.rowCount > 0) {
                console.log('Profile updated successfully');

                // Update the session photo
                if (photo) {
                    req.session.photo = photo;
                }

                res.redirect('/admin/admin-index');
            } else {
                console.error('Admin not found');
                res.status(404).send('Admin not found');
            }
        })
        .catch(error => {
            console.error('Error updating profile:', error);
            res.status(500).send('Internal Server Error');
        });
});



router.get('/home', verifyLogin, (req, res) => {
    res.redirect('/admin/admin-index')
})

router.get('/check-orders',async(req,res)=>{
    const result=await adminHelper.getOrder(req.session.username);
    console.log(result);
    res.render('admin/admin-order',{orders:result})
})

router.get('/delete-product/:id',(req,res)=>{
    adminHelper.deleteList(req.params.id).then((status)=>{
        if(status){
            res.redirect('/admin/admin-index');
            
        }else{
            res.redirect('/admin/admin-index');
 
        }
    })
})


export default router;
