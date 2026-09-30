import { MongoClient } from 'mongodb';

const sourceUri = "mongodb+srv://dwarkadheeshinnvsource_db_user:turbocart@turbocart.to1umcj.mongodb.net/turbocart?appName=turbocart";
const targetUri = "mongodb+srv://sakshidwivedi406_db_user:SiAIG3cpUwodfikX@cluster0.pmo9fre.mongodb.net/?appName=Cluster0";

async function copyDatabase() {
    const sourceClient = new MongoClient(sourceUri);
    const targetClient = new MongoClient(targetUri);

    try {
        await sourceClient.connect();
        await targetClient.connect();

        console.log("Connected to both databases.");

        const sourceDb = sourceClient.db("turbocart");
        const targetDb = targetClient.db("turbocart");

        const collections = await sourceDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections.`);

        for (let collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            // system.profile is a restricted collection
            if (collectionName.startsWith('system.')) {
                continue;
            }
            console.log(`Copying collection: ${collectionName}...`);

            const sourceCollection = sourceDb.collection(collectionName);
            const targetCollection = targetDb.collection(collectionName);

            const documents = await sourceCollection.find({}).toArray();
            
            if (documents.length > 0) {
                // To avoid duplicate key errors on repeated runs, drop or deleteMany
                await targetCollection.deleteMany({});
                await targetCollection.insertMany(documents);
                console.log(`Copied ${documents.length} documents for collection ${collectionName}.`);
            } else {
                console.log(`Collection ${collectionName} is empty.`);
            }
        }
        
        console.log("Database copy completed successfully!");
    } catch (error) {
        console.error("Error copying database:", error);
    } finally {
        await sourceClient.close();
        await targetClient.close();
    }
}

copyDatabase();
