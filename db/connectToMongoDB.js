import mongoose from "mongoose";

export const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Online-Food');
        console.log("Connect to MongoDB");

        // Tự động kiểm tra và drop index cũ của facebookId nếu tồn tại
        try {
            const db = mongoose.connection.db;
            const collections = await db.listCollections({ name: 'users' }).toArray();
            if (collections.length > 0) {
                const indexes = await db.collection('users').indexes();
                const hasIndex = indexes.some(idx => idx.name === 'facebookId_1');
                if (hasIndex) {
                    console.log("Found old unique index facebookId_1. Dropping it to allow sparse registration...");
                    await db.collection('users').dropIndex('facebookId_1');
                    console.log("Successfully dropped index facebookId_1");
                }
            }
        } catch (idxError) {
            console.log("No old index to drop or error dropping index:", idxError.message);
        }

    } catch (error) {
        console.log("Error connecting to MongoDB", error.message);
    }
}