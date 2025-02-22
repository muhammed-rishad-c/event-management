import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import userHelper from '../helpers/user-helper.js';

const verifyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.render('user/user-login');
    }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/', (req, res) => {
    res.render('user/user-signup');
})

router.get('/signup', (req, res) => {
    res.render('user/user-signup');
})

router.post('/signup', (req, res) => {
    console.log(req.body);
    userHelper.addUser(req.body).then((status) => {
        if (status) {
            req.session.loggedIn = true;
            req.session.phonenumber = req.body.phonenumber;
            res.redirect('/user/user-index');
        } else {
            res.render('user/user-signup')
        }
    })
});

router.get('/user-index', verifyLogin, (req, res) => {
    res.render('user/user-index');
})

router.get('/login', (req, res) => {
    res.render('user/user-login');
});

router.post('/login', (req, res) => [
    userHelper.isUser(req.body).then((status) => {
        if (status) {
            req.session.loggedIn = true;
            req.session.phonenumber = req.body.phonenumber;
            res.redirect('/user/user-index');
        } else {
            res.render('user/user-login');
        }
    })
])

router.get('/photographers', verifyLogin, async (req, res) => {
    const category = 'photographers';
    const result = await userHelper.getList(category);
    //console.log(result);
    res.render('user/admin-list', { admin: result });

});

router.get('/photographer-detail/:username', verifyLogin, async (req, res) => {
    const username = req.params.username;
    console.log(username);
    try {
        const result = await userHelper.getAdminDetail(username);
        //console.log("admin detail: ", result);
        const list = await userHelper.getAdminList(username);
        //console.log("admin list: ", list);

        res.render('user/admin-detail', { admin: result, adminList: list });
    } catch (error) {
        console.error('Error fetching admin details:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/book-slot/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const bookedDates = await userHelper.getAdminDate(username);
        //console.log('Booked dates:', bookedDates);
        res.render('user/book-slot', {
            username,
            bookedDates,
            // Add current date for minimum date validation
            currentDate: new Date().toISOString().split('T')[0]
        });
    } catch (error) {
        console.error('Error fetching booked dates:', error);
        res.status(500).send('Error loading booking page');
    }
});

router.post('/book-slot', async (req, res) => {
    try {
        const isBooked = await userHelper.isDateBooked(req.body.username, req.body.date);
        if (isBooked) {
            return res.status(400).json({ error: 'Date already booked' });
        }
        const result=await userHelper.getAdminDetail(req.body.username);

        const status = await userHelper.setOrder(req.body, req.session.phonenumber,result.photo);
        if (status) {
            const product=await userHelper.getLastOrder(req.session.phonenumber);
            console.log(product);
            
            res.render('user/successful-list',{order:product})
        } else {
            res.status(400).json({ error: 'Booking failed' });
        }
    } catch (error) {
        console.error('Error processing booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/event-services-rental', async (req, res) => {
    try {
        const phonenumber = req.session.phonenumber; // Assuming you store the user's ID in the session
        const bookingHistory = await userHelper.getBookingHistory(phonenumber); // Fetch booking history from the database

        res.render('user/booking-history', { bookings: bookingHistory });
    } catch (error) {
        console.error('Error fetching booking history:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/booking-history-gender', async (req, res) => {
    try {
        const phonenumber = req.session.phonenumber; // Assuming you store the user's ID in the session
        const bookingHistory = await userHelper.getBookingGenderHistory(phonenumber); // Fetch booking history from the database
        //console.log(bookingHistory);

        res.render('user/booking-gender-history', { bookings: bookingHistory });
    } catch (error) {
        console.error('Error fetching booking history:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/history-type',(req,res)=>{
    res.render('user/history-type')
})

router.get('/booking-history', (req, res) => {
    res.render('user/history-type')
})

router.get('/home', (req, res) => {
    res.redirect('/user/user-index')
})

router.get('/logout', (req, res) => {
    req.session.loggedIn = false;
    res.render('user/user-login')
})

router.get('/auditorium-hall-rental', verifyLogin, async (req, res) => {
    const category = 'Auditorium Rentals';
    const result = await userHelper.getList(category);
    //console.log(result);
    res.render('user/admin-list', { admin: result });
})

router.get('/entertainment', verifyLogin, async (req, res) => {
    const category = 'entertainment';
    const result = await userHelper.getList(category);
    //console.log(result);
    res.render('user/admin-list', { admin: result });
})


router.get('/gold-silver-rental',verifyLogin,async(req,res)=>{
    const category='Gold & Silver Rentals';
    const result=await userHelper.getDirectList(category);
    //console.log(result);
    res.render('user/admin-gender-list', { products: result });

    
})

router.get('/Makeup-Beautician-services', verifyLogin, async (req, res) => {
    const category = 'Makeup & Beautician services';
    const result = await userHelper.getList(category);
    //console.log(result);
    res.render('user/admin-list', { admin: result });
});

router.get('/food-section', verifyLogin, async (req, res) => {
    const category = 'Food Section';
    const result = await userHelper.getList(category);
    //console.log(result);
    res.render('user/admin-list', { admin: result });
})


router.get('/Dress-Rentals', verifyLogin, async (req, res) => {
    const category = 'Dress Rentals';
    res.render('user/gender', { category })
})

router.post('/gender-form', async (req, res) => {
    //console.log(req.body);
    const result = await userHelper.getGenderList(req.body);
    //console.log(result);
    res.render('user/admin-gender-list', { products: result });
})

router.get('/product-gender-detail/:id', async (req, res) => {
    //console.log(req.params.id);
    const result = await userHelper.getSpecificAdminList(req.params.id);
    //console.log(result);
    res.render('user/book-slot-gender', { id: req.params.id, username: result.username, image: result.image });
});


router.post('/book-gender-slot', async (req, res) => {
    //console.log(req.body);
    const status = await userHelper.setGenderOrder(req.body, req.session.phonenumber)
    if (status) {
        const result=await userHelper.getLastListOrder(req.session.phonenumber);
        console.log(result);
        res.render('user/successful-list',{order:result})
        

        //res.redirect('/user/user-index');
    }
})

router.get('/profile',async(req,res)=>{
    const result=await userHelper.getUserDetail(req.session.phonenumber);
    //console.log(result);
    res.render('user/user-profile',{user:result});
})

router.get('/admin-listcategory/:category', async (req, res) => {
    try {
        const result = await userHelper.getList(req.params.category);
        //console.log(result);
        res.render('user/admin-list', { admin: result });
    } catch (error) {
        console.error('Error fetching admin list:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/vehicles',verifyLogin,async(req,res)=>{
    const category='vehicleRental';
    const result=await userHelper.getDirectList(category);
    //console.log(result);
    res.render('user/admin-gender-list', { products: result });
    
})

router.get('/Wedding-Cards',verifyLogin,async(req,res)=>{
    const category = 'Wedding Cards';
    const result = await userHelper.getList(category);
    //console.log(result);
    res.render('user/admin-list', { admin: result });
})


export default router;