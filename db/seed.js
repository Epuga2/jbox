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
async function createInitialPosts() {
    try {
      const [albert, sandra, glamgal] = await getAllUsers();
        console.log("Creating initial posts")
      await createPost({
        authorId: albert.id,
        title: "First Post",
        content: "This is my first post. I hope I love writing blogs as much as I love writing them."
      });
      console.log("Finished creating initial posts")
  
      // a couple more
    } catch (error) {
      throw error;
    }
  }

async function rebuildDB(){
    try {
        client.connect();
        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
    }catch(error){
        throw error;
    }
    };


    async function testDB() {
        try {
          console.log("Starting to test database...");
      
          console.log("Calling getAllUsers");
          const users = await getAllUsers();
          console.log("Result:", users);
      
          console.log("Calling updateUser on users[0]");
          const updateUserResult = await updateUser(users[0].id, {
            name: "Newname Sogood",
            location: "Lesterville, KY"
          });
          console.log("Result:", updateUserResult);
      
          console.log("Calling getAllPosts");
          const posts = await getAllPosts();
          console.log("Result:", posts);
      
          console.log("Calling updatePost on posts[0]");
          const updatePostResult = await updatePost(posts[0].id, {
            title: "New Title",
            content: "Updated Content"
          });
          console.log("Result:", updatePostResult);
      
          console.log("Calling getUserById with 1");
          const albert = await getUserById(1);
          console.log("Result:", albert);
      
          console.log("Finished database tests!");
        } catch (error) {
          console.log("Error during testDB");
          throw error;
        }
      }


rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally( () => client.end() );