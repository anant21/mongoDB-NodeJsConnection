//CRUD Operations - Create Read Update Delete

//install mongodb driver
//-npm install mongodb
//-npm list mongodb

const {MongoClient} = require('mongodb');

async function main(){
    const uri = "mongodb+srv://<username>:<password>@cluster021-0kzxc.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try{
        await client.connect();
        await findOneListingByName(client, "Double Room en-suite (307)");

    } catch(e){
        console.error(e);
    } finally{
        await client.close();
    }
}

main().catch(console.err);

//list Databases

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log("- %s", db.name));

};


//Delete
//-------

//deleteOne
async function deleteListingByName(client, nameOfListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteOne({name: nameOfListing});
    console.log(`${result.deletedCount} document(s) was/were deleted`);
}

//deleteMany
async function deleteListingsScrapedBeforeDate(client, date){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteMany({"last_scraped": {$lt: date}});
    console.log(`${result.deletedCount} document(s) was/were deleted`);

}

//Create
//-------

//insertOne
async function createListing(client, newListing){
    const result = await client.db("sample_airbnb").collection("listingAndReviews").insertOne(newListing);
    console.log("\nNew listing created with the following id: %s", result.insertedId);
}

//insertMany
async function createMultipleListings(client, newListings){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListings);
    console.log("\n %d new listing(s) created with the following id(s): ", result.insertedCount);
    console.log(result.insertedIds);
}

//Read
//-----

//findOne
async function findOneListingByName(client, nameOfListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({name: nameOfListing});
    if(result){
        console.log("\nFound a listing in the collection with the name %s :", nameOfListing);
        console.log(result);
    } else{
        console.log("\nNo listings found with the name %s", nameOfListing);
    
    }
}

//findMany
async function findManyListingsWithMinimumBedBathAndMostRecentReviews(client, {
    minBedrooms = 0,
    minBathrooms = 0,
    maxResults = Number.MAX_SAFE_INTEGER
 } = {}){
    const cursor = client.db("sample_airbnb").collection("listingsAndReviews").find({
         bedrooms: {$gte: minBedrooms},
         bathrooms: {$gte: minBathrooms}
     })
     .sort({last_review: -1})
     .limit(maxResults);

    const results = await cursor.toArray();

    if(results.length > 0){
        console.log('Found listing(s) with at least %d bedrooms and %d bathrooms', minBedrooms,minBathrooms);
        results.forEach((result, i) => {
            date = new Date(result.last_review).toDateString();
 
            console.log();
            console.log(`${i + 1}. name: ${result.name}`);
            console.log('   _id: %s', result._id);
            console.log('   bedrooms: %s', result.bedrooms);
            console.log('   bathrooms: %s', result.bathrooms);
            console.log('   most recent review date: %s', new Date(result.last_review).toDateString());
    });
    } else {
        console.log(`No listings found with at least ${minBedrooms} bedrooms and ${minBathrooms} bathrooms`);
    }
}  

//Update
//-------

//updateOne
async function updateListingByName(client, nameOfListing, updatedListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne(
        {name: nameOfListing}, //to find
        {$set: updatedListing} //to update
        );

    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    console.log(`${result.modifiedCount} document(s) was/were updated`);
}

//upsert
async function upsertListingByName(client, nameOfListing, updatedListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne(
        {name: nameOfListing}, //to find
        {$set: updatedListing}, //to update
        {upsert: true}
    );

    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    //console.log(`${result.modifiedCount} document(s) was/were updated`);

    if (result.upsertedCount > 0){
        console.log(`One document was inserted with the id ${result.upsertedId._id}`);
    } else{
        console.log(`${result.modifiedCount} document(s) was/were updated`);
    }
}


//updateMany
async function updateAllListingsToHavePropertyType(client){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateMany({property_type: {$exists: false}}, {$set: {property_type: "Unknown"}});
    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    console.log(`${result.modifiedCount} document(s) was/were updated`);
}