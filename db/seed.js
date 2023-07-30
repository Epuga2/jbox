const { client,
        getAllUsers ,
        createUser,
        updateUser,
        createPost,
        updatePost,
        getAllPosts,
        getPostsByUser,
        getUserById,
} = require('./index');



async function dropTables() {
    try {
        console.log("starting to drop tables...")
        await client.query(`
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
        `);
        console.log("finished dropping tables")
    }   catch(error){
            console.error("Error dropping Tables");
        }
    
};

async function createTables(){
    try{
        console.log("Starting to build tables")

        await client.query(`
        CREATE TABLE users(
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL, 
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255)NOT NULL,
        location VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true);

        CREATE TABLE posts(
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id) NOT NULL,
            title VARCHAR(255) NOT NULL, 
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true
        );
        `)
        console.log("Finished building Tables")
    }catch(error){
        console.error("Error building Tables");
    }
};

async function createInitialUsers(){
    try{
        console.log("Starting to create users")
        const albert = await createUser({ username: 'albert', password: 'bertie99',location: 'Sidney, Australia',name: 'al bert' });
        const sandra = await createUser({username: 'sandra', password: '2sandy4me', location: "Ain't tellin'", name: 'Just Sandra'});
        constglamgal = await createUser({username: 'glamgal', password: 'soglam',location:'upper east side', name: 'Joshua'});

        
        console.log("finished creating users")
    }catch(error){
        console.error("Error creating users!");
        throw error;
    }
}

async function rebuildDB(){
    try {
        client.connect();
        await dropTables();
        await createTables();
        await createInitialUsers();
    }catch(error){
        throw error;
    }
    };


async function testDB() {
    try {
        console.log("starting to test database...");
        console.log("Calling getAllUsers")
        const users = await getAllUsers();
        console.log("getAllUsers", users)

        console.log("Calling updateUser on users[0]")
        const updateUserResult = await updateUser(users[0].id, {
            name: "Newname soGood",
            location: "Lesterville, KY"
        });
        console.log("Result: ", updateUserResult);

        console.log("Finished Database Tests");
} catch (error) {
    console.error("Error testing Database");
    throw error;
} 
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally( () => client.end() );