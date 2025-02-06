const express = require('express'); // Importing express library
const { MongoClient, ObjectId } = require('mongodb'); //
const cors = require('cors');

const app = express();
const port = 80;

const url = 'mongodb+srv://RaoDemo:RaoDemo@cluster0.s2mlcov.mongodb.net/';
const dbName = 'crudDemo';

app.use(cors());
app.use(express.json());

async function connectToDb() {
    console.log('Attempting to connect to MongoDB...');
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log('✅ Successfully connected to MongoDB Atlas');
        const db = client.db(dbName);
        console.log(`✅ Connected to database: ${dbName}`);
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

// CREATE
app.post('/addusers', async (req, res) => {
    console.log('📝 POST /users - Creating new user');
    console.log('Request body:', req.body);
    
    try {
        const db = await connectToDb();
        const collection = db.collection('usersnew');
        console.log('Connected to usersnew collection');

        const newUser = {
            name: req.body.name,
            email: req.body.email,
            createdAt: new Date()
        };
        console.log('Attempting to insert user:', newUser);
        
        const result = await collection.insertOne(newUser);
        console.log('✅ User created successfully with ID:', result.insertedId);
        
        res.status(201).json({
            success: true,
            id: result.insertedId,
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('❌ Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
});

// READ ALL
app.get('/users', async (req, res) => {
    console.log('📖 GET /users - Fetching all users');
    
    try {
        const db = await connectToDb();
        const collection = db.collection('usersnew');
        console.log('Connected to usersnew collection');
        
        const users = await collection.find({}).toArray();
        console.log(`✅ Successfully retrieved ${users.length} users`);
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// READ ONE
app.get('/users/:id', async (req, res) => {
    const userId = req.params.id;
    console.log(`📖 GET /users/${userId} - Fetching single user`);
    
    try {
        const db = await connectToDb();
        const collection = db.collection('usersnew');
        console.log('Connected to usersnew collection');
        
        console.log('Attempting to find user with ID:', userId);
        const user = await collection.findOne({
            _id: new ObjectId(userId)
        });
        
        if (!user) {
            console.log('❌ User not found');
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        console.log('✅ User found:', user);
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('❌ Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
});

// UPDATE
app.put('/users/:id', async (req, res) => {
    const userId = req.params.id;
    console.log(`📝 PUT /users/${userId} - Updating user`);
    console.log('Update data:', req.body);
    
    try {
        const db = await connectToDb();
        const collection = db.collection('usersnew');
        console.log('Connected to usersnew collection');
        
        const updateData = {
            name: req.body.name,
            email: req.body.email,
            updatedAt: new Date()
        };
        console.log('Attempting to update user with data:', updateData);
        
        const result = await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            console.log('❌ User not found for update');
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        console.log('✅ User updated successfully');
        console.log('Modified count:', result.modifiedCount);
        
        res.json({
            success: true,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('❌ Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
});

// DELETE
app.delete('/users/:id', async (req, res) => {
    const userId = req.params.id;
    console.log(`🗑️ DELETE /users/${userId} - Deleting user`);
    
    try {
        const db = await connectToDb();
        const collection = db.collection('usersnew');
        console.log('Connected to usersnew collection');
        
        console.log('Attempting to delete user with ID:', userId);
        const result = await collection.deleteOne({
            _id: new ObjectId(userId)
        });
        
        if (result.deletedCount === 0) {
            console.log('❌ User not found for deletion');
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        console.log('✅ User deleted successfully');
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
});

app.listen(port, async () => {
    try {
        await connectToDb();
        console.log(`🚀 Server running at http://localhost:${port}`);
        console.log('Ready to handle requests');
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
});