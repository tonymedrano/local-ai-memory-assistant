import { qdrant } from "./qdrant.client.js";


async function createCollection(){

    const exists =
        await qdrant.collectionExists(
            "contextual_memory"
        );


    if(exists.exists){
        console.log(
            "Collection already exists"
        );
        return;
    }


    await qdrant.createCollection(
        "contextual_memory",
        {
            vectors:{
                size:768,
                distance:"Cosine"
            }
        }
    );


    console.log(
        "contextual_memory created"
    );
}


createCollection();