const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/jbox-dev');

async function getAllUsers() {
    const { rows } = await client.query(
        `SELECT id, username, name, location, active
        FROM users;
        
        `);
        return rows;
}
async function createUser({ username, password, name, location }) {
    try{
    const { rows } = await client.query(`
    INSERT INTO users (username, password, name, location) 
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (username) DO NOTHING
    RETURNING *;
    `,[username, password, name, location]);

    return rows;    
    } catch(error){
        throw error;
    }
};

async function updateUser (id, fields = {}) {

    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"= $${ index +1 }`
    ).join(', ');


    if (setString.length === 0){
        return;
    }
    try{
        const { rows: [ user ]} = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id=${id} 
        RETURNING *;
        `,Object.values(fields));

        return user;
    } catch(error) {
        throw error;
    }
};

async function createPost({ authorId, title, content }) {
    try {

       const { rows } =  await client.query(`
        INSERT INTO posts("authorId", title, content)
        VALUES ($1, $2, $3)
        RETURNING *
        ;`,[authorId, title,content]);

        return rows;
    }catch(error){
        throw error;
    }
};

async function updatePost(id, fields = {}){
    const  setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index+1}`
    ).join(', ');

    if (setString.length ===0){
        return;
    }
    try{
        const {rows: [post]} = await client.query(`
        UPDATE posts
        SET ${ setString }
        WHERE id = ${id}
        RETURNING *;
        `,Object.values(fields));
        
        return post;
    } catch(error){
        throw error
    }
};


// async function updateUser (id, fields = {}) {

//     const setString = Object.keys(fields).map(
//         (key, index) => `"${key}"= $${ index +1 }`
//     ).join(', ');


//     if (setString.length === 0){
//         return;
//     }
//     try{
//         const { rows: [ user ]} = await client.query(`
//         UPDATE users
//         SET ${ setString }
//         WHERE id=${id} 
//         RETURNING *;
//         `,Object.values(fields));

//         return user;
//     } catch(error) {
//         throw error;
//     }
// };


async function getAllPosts(){
    try{
        console.log("getAllPosts")
        const { rows } = await client.query(`
        SELECT * 
        FROM posts;`)
        return rows;
    }catch(error){

        throw error;
    }
};

async function getPostsByUser(userId){
    try{
        console.log("getting posts by user")
        const { rows } = await client.query(`
        SELECT * FROM posts
        WHERE "authorId" = $1;`,[userId])
        return rows;
    } catch(error){
        throw error;
    }
};

async function getUserById(userId){
    try{
        console.log("getting posts by id")
        const { rows } = await client.query(`
        SELECT id, username, name, location, active FROM users
        WHERE id = $1;`, [userId]);
        if (rows.length === 0) {
            return null;
        }
        const posts = await getPostsByUser(userId);
        rows["posts"] = posts;
        return rows;
    } catch(error){
        throw error;
    }
};
async function createTags(tagList) {

    if (tagList.length === 0){
        return;
    }
    const insertValues = tagList.map((_,index) => `$${index +1}`).join('), (');

    const selectValues = tagList.map((_, index) => `$${index+1}`).join(', ');

    
    try{
        await client.query(`
        INSERT INTO tags(name)
        VALUES (${insertValues})
        ON CONFLICT (name) DO NOTHING;
        `, tagList);

        const { rows } = await client.query(`
        SELECT * FROM tags
        WHERE name
        IN (${selectValues});
        `,tagList )

    return rows;
    }catch(error){ 
        throw error
    }
}
async function createPostTag(postId, tagId){
    try{
        await client.query(`
        INSERT INTO post_tags("postId", "tagId")
        VALUES ($1, $2)
        ON CONFLICT ("postId", "tagId") DO NOTHING;
        `, [postId, tagId])
    }catch (error){
        throw error;
    }
}
async function addTagsToPost(postId, tagList){

    try{
        const createPostTagPromises = tagList.map(
            tag => createPostTag(postId,tag.id)
        );
        await Promise.all(createPostTagPromises);

        return await getPostById(postId)
    }catch(error){
        throw error;
    }
};
async function createPostTagPromises(){
    return;
}
async function getPostById(postId) {
    try {
      const { rows: [ post ]  } = await client.query(`
        SELECT *
        FROM posts
        WHERE id=$1;
      `, [postId]);
  
      const { rows: tags } = await client.query(`
        SELECT tags.*
        FROM tags
        JOIN post_tags ON tags.id=post_tags."tagId"
        WHERE post_tags."postId"=$1;
      `, [postId])
  
      const { rows: [author] } = await client.query(`
        SELECT id, username, name, location
        FROM users
        WHERE id=$1;
      `, [post.authorId])
  
      post.tags = tags;
      post.author = author;
  
      delete post.authorId;
  
      return post;
    } catch (error) {
      throw error;
    }
  }
module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser,
    createPost,
    updatePost,
    getAllPosts,
    getPostsByUser,
    getUserById,
    createTags,
}