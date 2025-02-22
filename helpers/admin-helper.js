import { resolveInclude } from 'ejs';
import db from '../database/db.js';

const adminHelper = {
    addAdmin: (detail, photo) => {
        const { fullname, username, number, location, category, password } = detail;
        return new Promise(async (resolve, reject) => {
            const query = `INSERT INTO admin_detail (fullname, username, phonenumber, district, category, photo, password) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
            const values = [fullname, username, number, location, category, photo, password];
            try {
                await db.query(query, values);
                resolve(true);
            } catch (e) {
                console.log("Error in admin signup " + e);
                reject(e);
            }
        });
    },
    getSpecifiedAdminList: async (username) => {
        const query = 'SELECT id,category,image AS photo, title, price FROM admin_list WHERE username = $1';
        const values = [username];
        try {
            const result = await db.query(query, values);
            if (result.rows.length > 0) {
                return result.rows;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error fetching specified admin list:', error);
            throw error;
        }
    },
    authenticateAdmin: async (username, password) => {
        const query = 'SELECT * FROM admin_detail WHERE username = $1 AND password = $2';
        const values = [username, password];
        try {
            const result = await db.query(query, values);
            if (result.rows.length > 0) {
                return result.rows[0];
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error authenticating admin:', error);
            throw error;
        }
    },
    addList: async (photo, detail) => {
        const { username, category, title, price, gender } = detail;
        return new Promise(async (resolve, reject) => {
            const query = `
                INSERT INTO admin_list (username, category, title, price, image,gender) 
                VALUES ($1, $2, $3, $4, $5,$6)
            `;
            const values = [
                username,
                category || null,
                title || null,
                price || null,
                photo,
                gender || null
            ];
            try {
                await db.query(query, values);
                resolve(true);
            } catch (e) {
                console.log("Error adding to admin list " + e);
                reject(e);
            }
        });
    },
    getSpecificList: (id, username) => {
        return new Promise(async (resolve, reject) => {
            const query = `select * from admin_list where username=$1 and id=$2`;
            const values = [username, id];
            try {
                const result = await db.query(query, values);
                //console.log(result.rows[0]);
                resolve(result.rows[0]);


            } catch (e) {
                console.log("error in getting specified list " + e);
                reject(e);

            }
        })
    },


    updateProduct: async (id, username, details, photo) => {
        try {
            // Fetch the existing product data
            const existingProductQuery = 'SELECT * FROM admin_list WHERE id = $1 AND username = $2';
            const existingProductResult = await db.query(existingProductQuery, [id, username]);

            if (existingProductResult.rows.length === 0) {
                throw new Error('Product not found');
            }

            const existingProduct = existingProductResult.rows[0];

            // Merge existing data with new data
            const updatedProduct = {
                title: details.title || existingProduct.title,
                price: details.price || existingProduct.price,
                photo: photo || existingProduct.image,
                gender: details.gender || existingProduct.gender
            };

            // Update the product in the database
            const updateQuery = `
                UPDATE admin_list 
                SET title = $1, price = $2, image = $3, gender = $4
                WHERE id = $5 AND username = $6 
                RETURNING *
            `;
            const updateValues = [
                updatedProduct.title,
                updatedProduct.price,
                updatedProduct.photo,
                updatedProduct.gender,
                id,
                username
            ];

            const result = await db.query(updateQuery, updateValues);
            return result.rows[0];
        } catch (e) {
            console.error("Error updating product:", e);
            throw e;
        }
    },



    getAdminDetail: (username) => {
        return new Promise(async (resolve, reject) => {
            const query = `select * from admin_detail where username=$1`;
            const values = [username];
            try {
                const product = await db.query(query, values);
                resolve(product.rows[0])

            } catch (e) {
                console.log("error at getting admin detail in profile " + e);
                reject(e);

            }
        })

    },


    updateAdminProfile: async (username, details, photo) => {
        const { fullname, phonenumber, district, category, description, price, gender } = details;

        try {
            // Fetch the existing profile data
            const existingProfileQuery = 'SELECT * FROM admin_detail WHERE username = $1';
            const existingProfileResult = await db.query(existingProfileQuery, [username]);

            if (existingProfileResult.rows.length === 0) {
                throw new Error('Admin not found');
            }

            const existingProfile = existingProfileResult.rows[0];

            // Merge existing data with new data
            const updatedProfile = {
                fullname: fullname || existingProfile.fullname,
                phonenumber: phonenumber || existingProfile.phonenumber,
                district: district || existingProfile.district,
                category: category || existingProfile.category,
                description: description || existingProfile.description,
                price: price || existingProfile.price,
                photo: photo || existingProfile.photo,
                gender: gender || existingProfile.gender
            };

            // Update the admin profile in the database
            const updateQuery = `
                UPDATE admin_detail 
                SET fullname = $1, phonenumber = $2, district = $3, category = $4, description = $5, price = $6, photo = $7
                WHERE username = $8
            `;
            const updateValues = [
                updatedProfile.fullname,
                updatedProfile.phonenumber,
                updatedProfile.district,
                updatedProfile.category,
                updatedProfile.description,
                updatedProfile.price,
                updatedProfile.photo,
                username
            ];

            const result = await db.query(updateQuery, updateValues);
            return result;
        } catch (e) {
            console.error("Error updating admin profile:", e);
            throw e;
        }
    },

    getOrder: (username) => {
        return new Promise(async(resolve,reject)=>{
            const query=`select * from orders where username=$1`;
            const values=[username];
            try{
                const result=await db.query(query,values);
                resolve(result.rows);

            }catch(e){
                console.log("error at getting order in admin dashboard");
                
            }
        })
    },
    deleteList:(id)=>{
        return new Promise(async(resolve,reject)=>{
            const query=`delete from admin_list where id=$1`;
            const values=[id];
            try{
                await db.query(query,values);
                resolve(true)

            }catch(e){
                console.log("error in deleting "+e);
                
            }
        })
    }


}

export default adminHelper;
