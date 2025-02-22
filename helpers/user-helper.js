import { resolve } from 'path';
import db from '../database/db.js';
import { userInfo } from 'os';

const userHelper = {
    addUser: (detail) => {
        const { fullname, phonenumber, email, password } = detail;
        return new Promise(async (resolve, reject) => {
            const query = `insert into user_detail (fullname,phonenumber,email,password) values($1,$2,$3,$4)`;
            const values = [fullname, phonenumber, email, password];
            try {
                await db.query(query, values);
                resolve(true);
            } catch (e) {
                console.log("error at adding user detail " + e);
            }
        })
    },
    isUser: (detail) => {
        const { phonenumber, password } = detail;
        return new Promise(async (resolve, reject) => {
            const query = `select * from user_detail where phonenumber=$1 and password=$2`;
            const values = [phonenumber, password];
            try {
                const result = await db.query(query, values);
                if (result.rows.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (e) {
                console.log("error at login admin " + e);
            }
        })
    },
    getList: (category) => {
        return new Promise(async (resolve, reject) => {
            const query = `select * from admin_detail where category=$1`;
            const values = [category];
            try {
                const result = await db.query(query, values);
                resolve(result.rows);

            } catch (e) {
                console.log("error at getting specified list after index " + e);

            }
        })
    },
    getAdminDetail: (username) => {
        return new Promise(async (resolve, reject) => {
            const query = `select * from admin_detail where username=$1`;
            const values = [username];
            try {
                const result = await db.query(query, values);
                resolve(result.rows[0]);

            } catch (e) {
                console.log("error at getting admit detail " + e);

            }
        })
    },
    getAdminList: (username) => {
        return new Promise(async (resolve, reject) => {
            const query = `select * from admin_list where username=$1`;
            const values = [username];
            try {
                const result = await db.query(query, values);
                resolve(result.rows);
            } catch (e) {
                console.log("getting error getting admin list " + e);

            }
        })
    },
    setOrder: async (orderDetails, phonenumber, photo) => {
        const { username, programName, date, time, address, pincode, description } = orderDetails;
        const query = `
            INSERT INTO orders (username, program_name, date, time, address, pincode, description,phonenumber,image, booking_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7,$8,$9, CURRENT_TIMESTAMP)
        `;
        const values = [username, programName, date, time, address, pincode, description, phonenumber, photo];

        try {
            await db.query(query, values);
            return true;
        } catch (error) {
            console.error('Error saving booking details:', error);
            return false;
        }
    },
    getAdminDate: (username) => {
        return new Promise(async (resolve, reject) => {
            const query = `
                SELECT 
                    date,
                    program_name,
                    time
                FROM orders 
                WHERE username = $1 
                ORDER BY date ASC`;
            const values = [username];
            try {
                const result = await db.query(query, values);
                resolve(result.rows);
            } catch (e) {
                console.log("error in getting date of admin", e);
                reject(e);
            }
        });
    },

    isDateBooked: (username, date) => {
        return new Promise(async (resolve, reject) => {
            const query = `
                SELECT COUNT(*) as count 
                FROM orders 
                WHERE username = $1 
                AND date = $2`;
            const values = [username, date];
            try {
                const result = await db.query(query, values);
                resolve(result.rows[0].count > 0);
            } catch (e) {
                console.log("error checking booked date", e);
                reject(e);
            }
        });
    },
    getBookingHistory: async (phonenumber) => {
        const query = 'SELECT * FROM orders WHERE phonenumber = $1';
        const values = [phonenumber];

        try {
            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Error fetching booking history:', error);
            throw error;
        }
    },
    getBookingGenderHistory: async (phonenumber) => {
        const query = 'SELECT * FROM order_gender WHERE phonenumber = $1';
        const values = [phonenumber];

        try {
            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Error fetching booking history:', error);
            throw error;
        }
    },
    getGenderList: (detail) => {
        return new Promise(async (resolve, reject) => {
            const { category, gender } = detail;
            const query = `select * from admin_list where category=$1 and gender=$2`;
            const values = [category, gender];
            try {
                const result = await db.query(query, values);
                resolve(result.rows)

            } catch (e) {
                console.log("error at getting gender list product");

            }
        })
    },
    getSpecificAdminList: (id) => {
        return new Promise(async (resolve, reject) => {
            const query = `select * from admin_list where id=$1`;
            const values = [id];
            try {
                const result = await db.query(query, values);
                resolve(result.rows[0]);

            } catch (e) {
                console.log("error at getting specific gender list " + e);

            }
        })
    },
    setGenderOrder: async (orderDetails, phonenumber) => {
        const { listId, programName, date, time, address, pincode, description, username, image } = orderDetails;
        const query = `
            INSERT INTO order_gender (admin_id, program_name, date, time, address, pincode, description,phonenumber,username,image, booking_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7,$8,$9,$10, CURRENT_TIMESTAMP)
        `;
        const values = [listId, programName, date, time, address, pincode, description, phonenumber, username, image];

        try {
            await db.query(query, values);
            return true;
        } catch (error) {
            console.error('Error saving booking details:', error);
            return false;
        }
    },
    getLastListOrder: async (phonenumber) => {
        const query = `
            SELECT * FROM order_gender
            WHERE phonenumber = $1
            ORDER BY booking_date DESC
            LIMIT 1;
        `;
        const values = [phonenumber];

        try {
            const result = await db.query(query, values);
            return result.rows[0]; // Return the last order details
        } catch (error) {
            console.error('Error fetching last order:', error);
            return null;
        }
    },
    getLastOrder: async (phonenumber) => {
        const query = `
            SELECT * FROM orders
            WHERE phonenumber = $1
            ORDER BY booking_date DESC
            LIMIT 1;
        `;
        const values = [phonenumber];

        try {
            const result = await db.query(query, values);
            return result.rows[0]; // Return the last order details
        } catch (error) {
            console.error('Error fetching last order:', error);
            return null;
        }
    },

    getUserDetail:(phonenumber)=>{
        return new Promise(async(resolve,reject)=>{
            const query=`select * from user_detail where phonenumber=$1`;
            const values=[phonenumber];
            try{
                const result=await db.query(query,values);
                resolve(result.rows[0]);
            }catch(e){
                console.log('error at getting result '+e);
                
            }
        })
    },
    getDirectList:(category)=>{
        return new Promise(async(resolve,reject)=>{
            const query=`select * from admin_list where category=$1`;
            const values=[category];
            try{
                const result=await db.query(query,values);
                resolve(result.rows)

            }catch(e){
                console.log("error at getting car or animal rental");
                
            }
        })
    }
}

export default userHelper;