import { qdrant } from "./qdrant.client.js";
import { config } from "../config.js";


async function createCollection(){

    const exists =
        await qdrant.collectionExists(
            config.memoryCollection
        );


    if(exists.exists){
        console.log(
            "Collection already exists"
        );
        return;
    }


        await qdrant.createCollection(
        config.memoryCollection,
        {
            vectors:{
                size:768,
                distance:"Cosine"
            }
        }
    );


    console.log(
        `${config.memoryCollection} created`
    );
}


createCollection();
