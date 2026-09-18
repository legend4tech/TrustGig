import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

config();

async function migrate() {
  if (!process.env.MONGODB_URI) {
    console.error('No MONGODB_URI found');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to DB');
    
    const db = client.db();
    const result = await db.collection('gigs').updateMany(
      { status: 'pending_funding' },
      { $set: { status: 'pending_approval' } }
    );
    
    console.log(`Migrated ${result.modifiedCount} gigs from pending_funding to pending_approval`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

migrate();
