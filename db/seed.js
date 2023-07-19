const { client,
        getAllUsers ,
        createUser,
} = require('./index');



async function dropTables() {
    try {
        console.log("starting to drop tables...")
        await client.query(`
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
        username varchar(255) UNIQUE NOT NULL, 
        password varchar(255) NOT NULL);

        `)
        console.log("Finished building Tables")
    }catch(error){
        console.error("Error building Tables");
    }
};

async function createInitialUsers(){
    try{
        console.log("Starting to create users")
        const albert = await createUser({ username: 'albert', password: 'bertie99' });
        const sandra = await createUser({username: 'sandra', password: '2sandy4me'});
        constglamgal = await createUser({username: 'glamgal', password: 'soglam'});

        
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
        
        const users = await getAllUsers();
        console.log("getAllUsers", users)

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